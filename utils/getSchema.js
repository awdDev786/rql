/*Final Schema*/
const fs = require('fs-extra')
const mkdirp = require("mkdirp");
const path = require('path');
const _ = require('lodash');
const async=require('async');
module.exports = {
    init: function getSchema(entities, roles, u, url, next) {
        var sc = "";
        var fq = "";
        var fm = "";

        _.forEach(entities, function(Entity, key) {
            var role = [];
            if(roles && roles.length>0){
            for (var i = 0; i < roles[Entity].length; i++) {
                if (roles[Entity][i]['_roles']) {
                    role.push(roles[Entity][i]['_roles']);
                }
            }
        }
            if (role.length > 0) {
                var a = 0;
                function loop(a) {
                    //if current role is in roles list and checking if role assigned to project or not
                    if (a < role.length) {
                        var ind = Object.keys(role[a]).indexOf(u);
                        if (ind !== -1 && fs.existsSync("./" + url + "/" + u)) {
                            var rights = role[a][u]; //curent role's rights
                            getRights(Entity, rights, u, url, function(m, q, s) {
                                fm = fm + m;
                                fq = fq + q;
                                sc = sc + s;
                            });
                        }else{
                            compile(Entity, u, url, function(m, q, s) {
                            fm = fm + m;
                            fq = fq + q;
                            sc = sc + s;
                        });
                        }
                    } else {
                        compile(Entity, u, url, function(m, q, s) {
                            fm = fm + m;
                            fq = fq + q;
                            sc = sc + s;
                        });
                    }
                }
                loop(a);
            } else {
                compile(Entity, u, url, function(m, q, s) {
                    fm = fm + m;
                    fq = fq + q;
                    sc = sc + s;
                });
            }
            /**************/
            if (key == entities.length - 1) {
                var sch = "var graphql=require('graphql')" + "\n" +
                    sc + "\n" +
                    "const Rootquery = new graphql.GraphQLObjectType({" + "\n" +
                    "name: 'Rootquery'," + "\n" +
                    "fields: () => ({" + "\n" +
                    fq + "\n" +
                    "})" + "\n" +
                    "})" + "\n" +
                    "const RootMutation = new graphql.GraphQLObjectType({" + "\n" +
                    "name: 'RootMutation'," + "\n" +
                    "fields: () => ({" + "\n" +
                    fm + "\n" +
                    "})" + "\n" +
                    "})" + "\n" +
                    "const schema = new graphql.GraphQLSchema({" + "\n" +
                    "query: Rootquery," + "\n" +
                    "mutation: RootMutation" + "\n" +
                    "});" + "\n" +

                    "module.exports = schema;" + "\n";


                mkdirp(path.join(process.cwd(), "./" + url + "/" + u), function(err) {
                    if (err) {
                        return console.error(err);
                    } else {
                        var pathcn = "./" + url + "/" + u + "/" + u + "Schema.js";
                        fs.writeFile(pathcn, sch, function(err) {
                            if (err) {
                                console.log("error in creating schema");
                            } else {
                                next(1)
                            }
                        });
                    }
                });
            }
            /***************/

        })
    },
    firebase:function getSchema(entities, roles, u, url, next) {
        var sc = "";
        var fq = "";
        var fm = "";

        _.forEach(entities, function(Entity, key) {
            var role = [];
            if(roles && roles.length>0){
            for (var i = 0; i < roles[Entity].length; i++) {
                if (roles[Entity][i]['_roles']) {
                    role.push(roles[Entity][i]['_roles']);
                }
            }
        }
            if (role.length > 0) {
                var a = 0;
                function loop(a) {
                    //if current role is in roles list and checking if role assigned to project or not
                    if (a < role.length) {
                        var ind = Object.keys(role[a]).indexOf(u);
                        if (ind !== -1 && fs.existsSync("./" + url + "/" + u)) {
                            var rights = role[a][u]; //curent role's rights
                            getRightsF(Entity, rights, u, url, function(m, q, s) {
                                fm = fm + m;
                                fq = fq + q;
                                sc = sc + s;
                            });
                        }else{
                            compileF(Entity, u, url, function(m, q, s) {
                            fm = fm + m;
                            fq = fq + q;
                            sc = sc + s;
                        });
                        }
                    } else {
                        compileF(Entity, u, url, function(m, q, s) {
                            fm = fm + m;
                            fq = fq + q;
                            sc = sc + s;
                        });
                    }
                }
                loop(a);
            } else {
                compileF(Entity, u, url, function(m, q, s) {
                    fm = fm + m;
                    fq = fq + q;
                    sc = sc + s;
                });
            }
            /**************/
            if (key == entities.length - 1) {
                var sch = "var graphql=require('graphql')" + "\n" +
                    sc + "\n" +
                    "const Rootquery = new graphql.GraphQLObjectType({" + "\n" +
                    "name: 'Rootquery'," + "\n" +
                    "fields: () => ({" + "\n" +
                    fq + "\n" +
                    "})" + "\n" +
                    "})" + "\n" +
                    "const RootMutation = new graphql.GraphQLObjectType({" + "\n" +
                    "name: 'RootMutation'," + "\n" +
                    "fields: () => ({" + "\n" +
                    fm + "\n" +
                    "})" + "\n" +
                    "})" + "\n" +
                    "const schema = new graphql.GraphQLSchema({" + "\n" +
                    "query: Rootquery," + "\n" +
                    "mutation: RootMutation" + "\n" +
                    "});" + "\n" +

                    "module.exports = schema;" + "\n";


                mkdirp(path.join(process.cwd(), "./" + url + "/" + u), function(err) {
                    if (err) {
                        return console.error(err);
                    } else {
                        var pathcn = "./" + url + "/" + u + "/" + u + "Schema.js";
                        fs.writeFile(pathcn, sch, function(err) {
                            if (err) {
                                console.log("error in creating schema");
                            } else {
                                console.log("schema created");
                                next(1)
                            }
                        });
                    }
                });
            }
            /***************/

        })
    },
}

function compile(Entity, u, url, next1) {
    
    var fq = "";
    var fm = "";
    var sc = "";
    sc = sc + "var " + Entity + "=require('./Queries/" + Entity + "Type')" + "\n" +
        "var add" + Entity + "Mutation=require('./Mutations/Add" + Entity + "Mutation')" + "\n" +
        "var update" + Entity + "Mutation=require('./Mutations/Update" + Entity + "Mutation')" + "\n" +
        "var del" + Entity + "Mutation=require('./Mutations/Del" + Entity + "Mutation')" + "\n";

    //fq = fq + Entity + "Connection :" + Entity + "." + Entity + "Fields.link," + "\n";
    //fq = fq + Entity + "s :" + Entity + "." + Entity + "Fields." + Entity + "s," + "\n";
    fq = fq + Entity + " :" + Entity + "." + Entity + "Fields." + Entity + "," + "\n";
    fm = fm + "add" + Entity + ":add" + Entity + "Mutation.add," + "\n" +
        //fm = fm +"\n" +// "//Link" + Entity + ":add" + Entity + ".LinkMutation," + "\n" +
        "del" + Entity + ":del" + Entity + "Mutation.del," + "\n" +
        "update" + Entity + ":update" + Entity + "Mutation.update," + "\n";
    next1(fm, fq, sc);
}

function getRights(Entity, r, u, url, next3) {
    var fm = "";
    var fq = "";
    var sc = "";

    if (r['c']) {
        fm = fm + "add" + Entity + ":add" + Entity + "Mutation.add," + "\n";
        sc = sc + "var add" + Entity + "Mutation=require('./Mutations/Add" + Entity + "Mutation')" + "\n";

    }
    if (r['r']) {
        sc = sc + "var " + Entity + "=require('./Queries/" + Entity + "Type')" + "\n";
       // fq = fq + Entity + "Connection :" + Entity + "." + Entity + "Fields.link," + "\n";
       // fq = fq + Entity + "s :" + Entity + "." + Entity + "Fields." + Entity + "s," + "\n";
        fq = fq + Entity + " :" + Entity + "." + Entity + "Fields." + Entity + "," + "\n";
    }
    if (r['u']) {
        sc = sc + "var update" + Entity + "Mutation=require('./Mutations/Update" + Entity + "Mutation')" + "\n";
        fm = fm + "update" + Entity + ":update" + Entity + "Mutation.update," + "\n";
    }
    if (r['d']) {
        sc = sc + "var del" + Entity + "Mutation=require('./Mutations/Del" + Entity + "Mutation')" + "\n";
        fm = fm + "del" + Entity + ":del" + Entity + "Mutation.del," + "\n";
    }
    next3(fm, fq, sc)
}
function compileF(Entity, u, url, next1) {
    
    var fq = "";
    var fm = "";
    var sc = "";
    sc = sc + "var " + Entity + "=require('./Queries/" + Entity + "Type')" + "\n" +
        "var add" + Entity + "Mutation=require('./Mutations/Add" + Entity + "Mutation')" + "\n" +
        "var update" + Entity + "Mutation=require('./Mutations/Update" + Entity + "Mutation')" + "\n" +
        "var del" + Entity + "Mutation=require('./Mutations/Del" + Entity + "Mutation')" + "\n";

   // fq = fq + Entity + "s :" + Entity + "." + Entity + "Fields." + Entity + "s," + "\n";
    fq = fq + Entity + " :" + Entity + "." + Entity + "Fields." + Entity + "," + "\n";
    fm = fm + "add" + Entity + ":add" + Entity + "Mutation.add," + "\n" +
        //fm = fm +"\n" +// "//Link" + Entity + ":add" + Entity + ".LinkMutation," + "\n" +
        "del" + Entity + ":del" + Entity + "Mutation.del," + "\n" +
        "update" + Entity + ":update" + Entity + "Mutation.update," + "\n";
    next1(fm, fq, sc);
}

function getRightsF(Entity, r, u, url, next3) {
    var fm = "";
    var fq = "";
    var sc = "";

    if (r['c']) {
        fm = fm + "add" + Entity + ":add" + Entity + "Mutation.add," + "\n";
        sc = sc + "var add" + Entity + "Mutation=require('./Mutations/Add" + Entity + "Mutation')" + "\n";

    }
    if (r['r']) {
        sc = sc + "var " + Entity + "=require('./Queries/" + Entity + "Type')" + "\n";
       // fq = fq + Entity + "s :" + Entity + "." + Entity + "Fields." + Entity + "s," + "\n";
        fq = fq + Entity + " :" + Entity + "." + Entity + "Fields." + Entity + "," + "\n";
    }
    if (r['u']) {
        sc = sc + "var update" + Entity + "Mutation=require('./Mutations/Update" + Entity + "Mutation')" + "\n";
        fm = fm + "update" + Entity + ":update" + Entity + "Mutation.update," + "\n";
    }
    if (r['d']) {
        sc = sc + "var del" + Entity + "Mutation=require('./Mutations/Del" + Entity + "Mutation')" + "\n";
        fm = fm + "del" + Entity + ":del" + Entity + "Mutation.del," + "\n";
    }
    next3(fm, fq, sc)
}
