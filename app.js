﻿'use strict';
//https://nodeapi20171102091916.azurewebsites.net/
//http://nodeapi20171102091916.azurewebsites.net/

let http = require('http');
let debug = require('debug');
let express = require('express');
let favicon = require('serve-favicon');
let flowers = require('./data/flowers.json');
let youtube = require('./data/youtube.json');
let config = require('./mongoconfig');
let mongoClient = require('mongodb');
let path = require('path');
let fs = require('fs');
let bodyParser = require('body-parser');
let auth = require('basic-auth');

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.send(200);
    }
    else {
        next();
    }
}

let app = express();
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {    
   
    res.sendFile(path.join(__dirname + '/api.html'));   
});

app.post('/', (req, res, next) => {

    let credentials = auth(req);
    if (!credentials || credentials.name !== 'diego' || credentials.pass !== 'secret') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        res.end('Access denied');
    } else {
        // do the things an authorized user can do
        res.end('Access granted');
    }
    
});


app.get('/help', (req, res, next) => {
   
    res.send('Help Page');   
});


app.get('/flowerstatic', (req, res, next) => {   
    let qs = req.query;
    let len = Object.keys(qs).length;
    if (len !== 1) {
        res.send('Incorrect number of parameters in query string e.g. /flowers/?flowerName=Rock%20Water');
    }
    if (!qs.hasOwnProperty('flowerName')) {
        res.send('flowerName is missing. The query is incorrect e.g. /flowers/?flowerName=Rock%20Water');
    }
    let result = flowers.find((flower) => {
        return flower.Name === qs.flowerName;
    });
    res.send(result);
});


app.get('/youtube', (req, res, next) => {    
    res.send(youtube);
});


app.get('/flowers', (req, res, next) => {
    mongoClient.connect(config.mongoConnectionString, (err, db) => {
        if (err) res.send('error');
        //assert.equal(null, err);
        db.collection('BachFlowers').find({}).toArray((err, flowers) => {
            db.close();
            res.send(flowers);
        });
    });
});


// /flower/?flowerName=Rock%20Water
app.get('/flower', (req, res, next) => {
    
    let qs = req.query;
    mongoClient.connect(config.mongoConnectionString, (err, db) => {
        if (err) res.send('error');
        db.collection('BachFlowers').findOne({ Name: qs.flowerName }, function (err, flower) {
            db.close();
            if (err !== null) {
                res.send('No flower has been found!');
            }
            res.send(flower);
        });
    });
});

app.post('/updateflowernotes', (req, res, next) => {
    let credentials = auth(req);
    if (!credentials || credentials.name !== 'diego' || credentials.pass !== 'secret') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm = "example"');
        res.end('Access denied');
    } else {
        // user is authenticated
        res.statusCode = 200;
        mongoClient.connect(config.mongoConnectionString, (err, db) => {
            let body = req.body;
            if (err) console.log(err);
            let flowers = db.collection('BachFlowers');
            flowers.update({ Name: req.body.Name },
                {
                    $set: { Notes: req.body.Notes }
                }, { multi: false }, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send(JSON.stringify(err));
                    }
                    console.log('Successfuly updated: ' + result + ' records.');
                    res.send(JSON.stringify(result));
                });
        });    
    }
});




let serverUnsecure = http.createServer(app).listen(process.env.PORT || 3000, function () {
    console.log('Server express running at. ' + serverUnsecure.address().address + ':' + serverUnsecure.address().port + ' ');
});



