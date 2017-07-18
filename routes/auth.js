const express = require('express');
const Router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');
var Project = require('../models/projects.js');
var moment = require('moment');
const fs = require('fs-extra')
const mkdirp = require("mkdirp");
const path = require('path');
const _ = require('lodash');
Router.post('/login', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
            return res.send({ message: 'Invalid email and/or password' });
        } else {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (!isMatch) {
                    return res.send({ message: 'Invalid email and/or password' });
                } else {
                    var token = jwt.sign(user, 'RQLSecret', {
                        expiresIn: 60 * 60 * 24 // expires in 24 hours
                    });
                    res.send({
                        success: true,
                        message: 'Logged In!',
                        token: token,
                        user: user
                    });
               }
            });
        }
    });
});

Router.post('/signup', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, existingUser) {
        if (err) {
            console.log(err)
        }
        if (existingUser) {
            return res.status(409).send({ message: 'Email is already taken' });
        }
        var user = new User({
            url: req.body.url,
            email: req.body.email,
            password: req.body.password
        });
        user.save(function(err, result) {
            if (err) {
                res.status(409).send({ message: err.message });
            } else {
                var token = jwt.sign(result, 'RQLSecret', {
                    expiresIn: 60 * 60 * 24 // expires in 24 hours
                });
                mkdirp('./Users/'+result.url+'/', function(err) {
                    if (err) {
                        return console.error(err);
                    } else{
                        console.log("directory created");
                    }
                });

                res.send({
                    success: true,
                    message: 'Registration Done!',
                    token: token,
                    user: result
                });
            }
        });
    });
});

Router.get('/me', ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
        res.send(user);
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
                // if everything is good, save to request for use in other routes
                req.user = decoded._doc;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
}
