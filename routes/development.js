const express = require('express');
const Router = express.Router({ mergeParams: true });
const graphQLHTTP = require('express-graphql');
const graphql = require('graphql').graphql;
const jwt = require('jsonwebtoken');
const moment = require('moment');
const lang = require('graphql/language')

const fs = require('fs-extra')
const mkdirp = require("mkdirp");
const path = require('path');
const _ = require('lodash');
const rq = require("request");
const gqlrequest = require('graphql-request');


const getModels = require('../utils/models.js');
const getfirebase = require('../utils/getfirebase.js');
const getSchema = require('../utils/getSchema.js');
const getGraphql = require('../utils/getGraphql.js');
const updateSchema = require('../utils/updateSchema.js');

const sm = require('../models/schemaModel.js');
const Project = require('../models/projects.js');
const User = require('../models/user.js');
const rqlUser = require('../models/rqlUsers.js');
Router.post('/project', ensureAuthenticated, function(req, res) {
    User.findOne({ url: req.params.username })
        .exec(function(err, user) {
            if (err) {
                console.log(err);
                res.status(400).send({ message: "Error in project retrieving" })
            } else {
                Project.findOne({ title: req.body.title })
                    .exec(function(err, pr) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (pr) {
                                res.json({ message: "Project with this name already exists" });
                            } else {
                                var pr = new Project({
                                    title: req.body.title,
                                    datasource: req.body.db,
                                    config: JSON.stringify(req.body.config),
                                    user: user._id
                                });
                                pr.roles = { guest: true };
                                pr.save(function(err, project) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        mkdirp('./Users/' + req.params.username + '/' + project.title + '/guest', function(err) {
                                            if (err) {
                                                return console.error(err);
                                            } else {
                                                if(req.body.db=='firebase'){
                                                /*******/
                                                 var code = "var fb = require('firebase');" + "\n" +
                                                    "var config = " + "\n" +
                                                    JSON.stringify(req.body.config) + "\n" +
                                                    "try {" + "\n" +
                                                       "fb.initializeApp({ " + "\n" +
                                                        "databaseURL:'"+req.body.config.databaseURL+"'\n" +
                                                        "}) " + "\n" +
                                                        "} catch (err) { " + "\n" +
                                                        "if (!/already exists/.test(err.message)) { " + "\n" +
                                                        "console.error('Firebase initialization error', err.stack) " + "\n" +
                                                        "} " + "\n" +
                                                        "} " + "\n" +
                                                    "var connectedRef = fb.database().ref('.info/connected');"+ "\n" +
                                                    "connectedRef.on('value', function(snap) {" + "\n" +
                                                    "if (snap.val() === true) {" + "\n" +
                                                       "console.log('connected');" + "\n" +
                                                      "} else {" + "\n" +
                                                        "console.log('not connected');" + "\n" +
                                                      "}" + "\n" +
                                                    "});" + "\n" +
                                                    "module.exports=fb;" + "\n";
                                                /************/
                                                mkdirp('./Users/' + req.params.username + '/' + project.title, function(err) {
                                                    if (err) {
                                                        return console.error(err);
                                                    } else {
                                                       // console.log("---------------------------------------");
                                                        var pathcn = './Users/' + req.params.username + '/' + project.title + '/'+project.title+'_firebase.js';
                                                        fs.writeFile(pathcn, code, function(err) {
                                                            if (err) {
                                                                console.log(err);
                                                            } else {
                                                                //console.log("directory created");
                                                                checkCon('../Users/' + req.params.username + '/' + project.title + '/'+project.title+'_firebase.js');
                                                               
                                                            }
                                                        })

                                                    }
                                                });
                                            }
                                            }
                                        });
                                        user.project.push(project._id);
                                        user.save(function(err) {
                                            if (err) {
                                                res.json(err);
                                            } else {
                                                initSchema(project._id, function(ru) {
                                                    if (ru) {
                                                        project.rqlUsers.push(ru._id);
                                                        project.save(function(e, rp) {
                                                            if (!err) {
                                                                res.status(200).send({ message: "Project Created" });

                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });

            }
        })
});
Router.get('/projects', ensureAuthenticated, function(req, res) {
    User.findOne({ url: req.params.username })
        .populate('project')
        .exec(function(err, user) {
            if (err) {
                console.log(err);
                res.status(400).send({ message: "Error in project retrieving" })
            } else {
                res.json(user.project);
            }
        });
});
Router.post('/:pname/:role/edit', ensureAuthenticated, function(req, res) {
    Project.findOne({ title: req.params.pname }).exec(function(err, pr) {
        if (err) { console.log(err) } else {
            pr.roles[req.params.role] = req.body.role;
            //console.log("after" + pr.roles[req.params.role]);
            Project.update({ _id: pr._id }, { $set: { roles: pr.roles } }, function(err, re) {
                if (err) {
                    console.log(err);
                } else {
                    res.status(200).json("Development mode setting changed");;
                }
            });
        }
    });
});
Router.post('/:pname/delRole', ensureAuthenticated, function(req, res) {
    Project.findOne({ title: req.params.pname }).exec(function(err, pr) {
        if (err) { console.log(err) } else {
            delete pr.roles[req.body.role];
            Project.update({ _id: pr._id }, { $set: { roles: pr.roles } }, function(err, re) {
                if (err) {
                    console.log(err);
                } else {
                    var dir='./Users/'+req.params.username+'/'+req.params.pname+'/'+req.body.role;
                    var rep=deleteFile(dir);
                    if(rep==1){
                  res.status(200).json({message:"deleted"});
                    }else{
                        res.status(200).json({message:"deleted"});
                    }
                }
            });
        }
    });
});

Router.post('/:pname/role', ensureAuthenticated, function(req, res) {
    if (req.body.role !== 'guest') {
        Project.findOne({ title: req.params.pname })
            .exec(function(err, project) {
                if (err) {
                    console.log(err);
                } else {

                    var index = Object.keys(project.roles).indexOf(req.body.role)

                    if (index == -1) {
                        project.roles[req.body.role] = false;
                        Project.update({ _id: project._id }, { $set: { roles: project.roles } }, function(err, re) {
                            if (err) console.log(err);
                            mkdirp('./Users/' + req.params.username + '/' + req.params.pname + '/' + req.body.role, function(err) {
                                if (err) {
                                    return console.error(err);
                                } else {
                                    //console.log("directory created");
                                }
                            });
                            res.status(200).json({ message: "role saved" })

                        });

                    } else {
                        res.status(400).json({ message: "role already saved" })
                    }

                }
            });
    } else {
        res.json("Role already added");
    }
});
Router.post('/:project/:role/dev', function(req, res) {
    //console.log(req.body.query);
    var pathU = "Users/" + req.params.username + "/" + req.params.project;
    var query = req.body.query;
    const ast = lang.parse(new lang.Source(query));
    if (ast.definitions[0].operation == 'query') {
        res.status(404).json({ message: "Check create query again!!!" });
    } else {
        var sObj = {
            entities: {},
            otm: {},
            mtm: {}
        };
        Project.findOne({ title: req.params.project })
            .exec(function(err, pr) {
                if (err) {
                    console.log(err);
                } else {
                    if (pr._id) {
                        sm.findOne({ project_id: pr._id })
                            .sort('-created_at').exec(function(err, schema) { //unique project name
                                if (err) {
                                    console.log(err);
                                } else {
                                    if (!schema) {
                                        schema = { text: JSON.stringify(sObj) };
                                    }
                                    var schemaObj = ((schema) ? JSON.parse(schema.text) : sObj);
                                    schemaObj = updateSchema.updateSchema(ast, sObj);
                                    if (JSON.stringify(schemaObj) == schema.text) {
                                        checkHeaders(req.query, schema, function(re) {
                                            getRuntime(schemaObj, re, pr, function(run) {
                                                if (run == 1) {
                                                    res.json("Schema Creation Done");
                                                } else {
                                                    res.json(run.message);
                                                }
                                            });
                                        });
                                    } else {
                                        var Smodel = new sm({ text: JSON.stringify(schemaObj), project_id: pr._id });
                                        Smodel.save(function(err, savedSchema) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                checkHeaders(req.query, savedSchema, function(re) {
                                                    getRuntime(schemaObj, re, pr, function(run) {
                                                        if (run == 1) {

                                                            /***************/
                                                            gqlrequest.request("http://66.70.189.237/" + req.params.username + "/" + req.params.project + "/" + req.params.role + "/prod", req.body.query)
                                                                .then(data => { res.json(data) })
                                                                .catch(err => {
                                                                    console.log(err);
                                                                });
                                                            /*************/
                                                        } else {
                                                            res.json(run.message);
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }

                                }

                            });

                    } else {
                        res.status(404).json({ message: "project not found" });
                    }
                }
            });

        function getRuntime(schemaObj, roles, pr, nextR) {
            var entities = Object.keys(schemaObj.entities);
            var otm = schemaObj.otm;
            var mtm = schemaObj.mtm_pairs;
            //var mtm = schemaObj.mtm; //break into one to many (keep both implementations)
            if (pr.datasource == 'MongoDB') {
                var i = 0;
                customLoop(i);

                function customLoop(i) {
                    if (i < entities.length) {
                        getModels.models(entities[i], schemaObj.entities[entities[i]], otm, mtm, pathU, function(bool) {
                            if (bool == 1) {
                                getGraphql.schema(entities[i], schemaObj.entities[entities[i]], otm, mtm, pathU, roles, req.params.role, function(types) {
                                    if (types == 1) {
                                        i = i + 1;
                                        customLoop(i);
                                    } else if (types.message) {
                                        nextR({ message: types.message })
                                    }
                                });
                            } else {
                                nextR({ message: "error in model creation" });
                            }
                            if (bool == 1 && i == entities.length - 1) {
                                getSchema.init(entities, roles, req.params.role, pathU, function(r) {
                                    if (r == 1) {
                                        nextR(1)
                                    }
                                });
                            }
                        });
                    }
                }
            } else if (pr.datasource == 'firebase') {
                var i = 0;
                customLoop(i);
                function customLoop(i) {
                    if (i < entities.length) {
                        getfirebase.models(entities[i], schemaObj.entities[entities[i]], otm, mtm, pathU, roles, req.params.role, pr.title, function(bool) {
                            if (bool.message) {
                                nextR({ message: types.message })
                            }
                            if (i == entities.length - 1) {
                                getSchema.firebase(entities, roles, req.params.role, pathU, function(r) {
                                    if (r == 1) {
                                        nextR(1)
                                    }
                                });
                            }
                            else{
                                i = i + 1;
                                customLoop(i);
                            }
                        })

                    }
                }
            }
        }
    }
});

Router.post('/:project/:role/prod', function(req, res) {
    gqlrequest
        .request("http://66.70.189.237/" + req.params.username + "/graphql?user=" + req.params.username + "&project=" + req.params.project + "&role=" + req.params.role, req.body.query)
        .then(data =>{console.log("data"); res.json({data:data})} )
        .catch(err => {
            console.log(err);
            if (err.response.errors) {
                Project.findOne({ title: req.params.project })
                    .exec(function(er, pr) {
                        if (er) {
                            console.log(er);
                        } else {
                            if (pr.roles[req.params.role] == true && req.body.query.indexOf('mutation') !== -1) {
                                gqlrequest.request("http://66.70.189.237/" + req.params.username + "/" + req.params.project + "/" + req.params.role + "/dev", req.body.query)
                                    .then(resp => console.log(resp));
                            } else {
                                if (err.response.errors[0].message.indexOf('Cannot find module') !== -1) {
                                    err.response.errors[0].message = "Create Schema before sending query";
                                    res.status(400).json(err.response);
                                };

                            }
                        }
                    })
            }
        })
});
Router.use('/graphql', graphQLHTTP(request => {
    console.log(request.body.query);
    return ({
        schema: runtime(request.query.user, request.query.project, request.query.role),
    });
}));

Router.post('/:project/signup', function(req, res) {
    Project.findOne({ title: req.params.project })
        .exec(function(err, pr) {
            if (Object.keys(pr.roles).indexOf(req.body.role) !== -1) {
                var user = new rqlUser({
                    username: req.body.username,
                    password: req.body.password,
                    status: true,
                    role: req.body.role,
                    project_id: pr._id
                });
                user.save(function(err, user) {
                    if (err) {
                        console.log(err);
                    } else {
                        pr.rqlUsers.push(user._id);
                        pr.save(function(e, r) {
                            if (e) {
                                console.log(e);
                            } else {
                                res.json({ message: "RQL user signed up" });
                            }
                        });
                    }
                });
            }
        });
});

Router.get('/:project/login', function(req, res) {
    rqlUser.findOne({
            username: req.body.username,
            password: req.body.password
        })
        .populate('project_id')
        .exec(function(err, user) {
            if (err) {
                console.log(err);
            } else {
                if (user.project_id.title == req.params.project) {
                    res.json(200).send(user);
                } else {
                    res.json({ message: "login error" })
                }
            }
        });
});
module.exports = Router;

function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }
    var token = req.header('Authorization').replace('Bearer ', ''); //.split(' ')[1];

    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, 'RQLSecret', function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.user = decoded._doc;
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
}

function checkHeaders(query, schema, next) {

    if (Object.keys(query).length>0) {
        console.log(query);
        var q = Object.keys(query);
        var schemaObj = JSON.parse(schema.text);
        _.forEach(q, function(v, k) {
            schemaObj.entities[v.trim()].push(JSON.parse(query[q[k]]));
            if (k == q.length - 1) {
                sm.findById({ _id: schema._id })
                    .exec(function(err, sch) {
                        if (err) {
                            console.log(err);
                        } else {
                            sch.text = JSON.stringify(schemaObj);
                            sch.save(function(err, saved) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    next(JSON.parse(saved.text).entities);
                                }
                            });
                        }
                    });
            }

        });
    } else {
        next(schema);
    }
}

function runtime(u, p, r) {
    return require('../Users/' + u + "/" + p + "/" + r + "/" + r + "Schema.js")

}
function initSchema(id, next) {

    var rql = new rqlUser({
        username: 'guest',
        password: 'guest',
        status: true,
        role: 'guest',
        project_id: id
    });
    rql.save(function(err, sc) {
        if (err) {
            console.log(err);
        } else {
            next(sc)
        }
    });
}
function checkCon(url){
    require(url);
    //console.log(firebase);
}
function deleteFile(dir) {
 
	fs.rmdirSync(dir,function(err){
	    if(err){
	        return err
	    }
	    else{
	        return 1
	    }
	});
	
};
