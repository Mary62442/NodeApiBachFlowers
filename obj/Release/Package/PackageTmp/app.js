'use strict';
//https://nodeapi20171102091916.azurewebsites.net/
//http://nodeapi20171102091916.azurewebsites.net/

let http = require('http');
let debug = require('debug');
let express = require('express');
let favicon = require('serve-favicon');
let flowers = require('./data/flowers.json');
let config = require('./mongoconfig');
let mongoClient = require('mongodb');
let path = require('path');
let fs = require('fs');

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
}

var app = express();
app.use(allowCrossDomain);

app.get('/', (req, res, next) => {
    let q = 5;
    res.sendFile(path.join(__dirname + '/api.html'));   
});


app.get('/flowerstatic', (req, res, next) => {   
    let qs = req.query;
    let len = Object.keys(qs).length;
    if (len != 1) {
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




let serverUnsecure = http.createServer(app).listen(process.env.PORT || 3000, function () {
    console.log('Server express running at. ' + serverUnsecure.address().address + ':' + serverUnsecure.address().port + ' ');
});



