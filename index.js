const express = require('express');
const bodyParser = require('body-parser');
const graphQLHTTP = require('express-graphql');
const Plugin = require('./models/plugins.js');
const app = express();
const fs = require('fs-extra');
const mkdirp = require("mkdirp");
const path = require('path');


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};
app.use(allowCrossDomain);

const auth = require('./routes/auth.js');
const development = require('./routes/development.js');

app.use('/:username', development);
app.use('/auth', auth);
app.use(express.static('Client'));
//require('./router.js');
//app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendfile('index.html');
});



app.post('/createplugin', function(req, res) {
    var p = new Plugin({
        title: req.body.title,
        code: req.body.code
    });
    p.save();
});
app.get('/plugins', function(req, res) {
    Plugin.find().exec(function(err, plug) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(plug);
        }
    });
});
app.get('/plugin/:id', function(req, res) {
    Plugin.findOne({
        _id: req.params.id
    }).exec(function(err, plug) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(plug);
        }
    });
});
app.delete('/plugin/:id', function(req, res) {
    Plugin.findOne({
        _id: req.params.id
    }).exec(function(err, plug) {
        if (err) {
            console.log(err);
        }
        else {
            plug.remove();
        }
    });
});

app.post('/plugin/template', function(req, res) {
    mkdirp('./Client/sdk', function(err) {
        if (err) {
            return console.error(err);
        }
        else {
            var pathcn = './Client/sdk/temp.js';
            fs.writeFile(pathcn, req.body.data, function(err) {
                if (err) {
                    console.log(err);
                }
                else {
                   // console.log("directory created");
               res.status(200).json("tempalte created");
                }
            })

        }
    });
});

app.listen(80, (err) => {
    if (err) {
        throw err;
    }

    console.log('Express server is listening on port 8081');
});
