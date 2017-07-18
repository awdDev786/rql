/*Model Layer Generation*/
const fs = require('fs-extra')
const mkdirp = require("mkdirp");
const path = require('path');
const _ = require('lodash');
const async=require('async');
module.exports = {
    models: function models(Entity, attributes, otm, mtm, url,next) {
        var attribs = "";
        for (var a = 0; a < attributes.length; a++) {
            attribs = attribs + attributes[a].name + ":{type:" + ((attributes[a].type == 'Int') ? 'Number' : attributes[a].type) + "},"
        };
        /*One To Many*/
        if (otm[Entity]) {
            _.forEach(otm[Entity], function(value, key) {
                attribs = attribs + value + ":[{type:db.Schema.Types.ObjectId ,ref:'" + value + "'}]," + "\n";
            });
        }
        /*Many To Many*/
        if (mtm) {
            _.forEach(mtm, function(value, key) {
                var index = value.indexOf(Entity);
                if (index !== -1) {
                    var val = (index == 0) ? value[1] : value[0];
                    attribs = attribs + val + ":[{type:db.Schema.Types.ObjectId ,ref:'" + val + "'}]," + "\n";
                }
            });
        }
        /*Check for 2 way association {teacher:['office']}*/
        _.forEach(Object.keys(otm), function(o, key) {
            _.forEach(otm[o], function(c, k) {
                if (c == Entity) {
                    attribs = attribs + o + ":{type:db.Schema.Types.ObjectId ,ref:'" + o + "'}," + "\n";

                }
            })
        })

        /*Model file*/
        var Model_code = "var db=require('./../../../../config.js');" + "\n" +
            "var " + Entity + "Schema=new db.Schema({" + "\n" +
            "" + attribs + "\n" +
            "});" + "\n" +
            "module.exports=db.gql.model('" + Entity + "'," + Entity + "Schema);"
        mkdirp(path.join(process.cwd(), "./" + url + "/Models/"), function(err) {
            if (err) {
                return console.error(err);
            } else {
                var pathcn = "./" + url + "/Models/" + Entity + ".js";
                fs.writeFile(pathcn, Model_code, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        next(1);
                    }
                });
            }
        });
    },
    /*collect: function collect(collections) {
        var require_statements = "";
        var entities_array = "{";
        for (var a = 0; a < collections.length; a++) {
            if (a < collections.length - 1) {
                require_statements = require_statements + "const " + collections[a] + "_=require('./" + collections[a] + "');"
                entities_array = entities_array + collections[a] + "_,"
            } else {
                require_statements = require_statements + "const " + collections[a] + "_=require('./" + collections[a] + "');" + "\n"
                entities_array = entities_array + collections[a] + "_}"
                var code = "const mongoose =require('mongoose');" + "\n" +
                    "mongoose.connect('mongodb://localhost/graphql'),;" + "\n" +
                    "mongoose.Promise = require('bluebird');" + "\n" +
                    require_statements + "\n" +
                    "module.exports=" + entities_array + ";"

                mkdirp(path.join(process.cwd(), '/Application/Models/'), function(err) {
                    if (err) {
                        return console.error(err);
                    } else {
                        var pathcn = "./Application/Models/index.js";
                        fs.writeFile(pathcn, code);
                    }
                });
                return 1;
            }
        };
    }*/
    collect: function collect(collections, url,next) {
        var code = "const con =require('mongoose');" + "\n" +
            "con.createConnection('mongodb://localhost/graphql');" + "\n" +
            "module.exports=con;"
         mkdirp(path.join(process.cwd(), "./" + url + "/Models/"), function(err) {
            if (err) {
                return console.error(err);
            } else {
                var pathcn = "./" + url + "/Models/index.js";
                fs.writeFile(pathcn, code, function(err) {
                    if (err) {
                        next(0);
                    } else {
                        next(1);
                    }
                });
            }
        });
    }
}
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
