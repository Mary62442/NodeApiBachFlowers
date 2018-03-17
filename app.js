'use strict';
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
let secret = require('./secret.js');
let jwt = require('jsonwebtoken');

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Custom-Auth-Step1, Custom-Auth-Step2, Custom-Auth-Step3, Custom-Auth-Step4');
    // intercept OPTIONS method

    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
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

app.get('/vndor4sd8ass3aksdnalpaskp09', (req, res, next) => { 
    res.sendFile(path.join(__dirname + '/secretQrCode/qr.png'));   
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
   
    res.send('Help Page update today 5/3/2018');   
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
    mongoClient.connect(config.mongoConnectionString, (err, client) => {
        if (err) res.send('error');

        const db = client.db('marymongodb');
        //assert.equal(null, err);
        db.collection('BachFlowers').find({}).toArray((err, flowers) => {
            client.close();
            res.send(flowers);
        });
    });
});


// /flower/?flowerName=Rock%20Water
app.get('/flower', (req, res, next) => {
    
    let qs = req.query;
    mongoClient.connect(config.mongoConnectionString, (err, client) => {
        const db = client.db('marymongodb');

        if (err) res.send('error');
        db.collection('BachFlowers').findOne({ Name: qs.flowerName }, function (err, flower) {
            client.close();
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
        mongoClient.connect(config.mongoConnectionString, (err, client) => {
            let body = req.body;
            if (err) console.log(err);
            const db = client.db('marymongodb');
            let flowers = db.collection('BachFlowers');
            flowers.update({ Name: req.body.Name },
                {
                    $set: { Notes: req.body.Notes }
                }, { multi: false }, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send(JSON.stringify(err));
                    }
                    client.close();
                    console.log('Successfuly updated: ' + result + ' records.');
                    res.send(JSON.stringify(result));
                });
        });    
    }
});


app.post('/firststepsecurity', (req,res) => { 

    let firstPassword = req.get('custom-auth-step1');   
    let username = req.body.username;
    let memorableA = req.body.memorableA; 

    let user = secret.secretData.users.find( user => user.name === username );
        if (typeof user === 'undefined') {
            res.json({success: false, message:'Failure. Invalid credentials'}); 
        };
    if (memorableA === user.memorableA) {
        if (firstPassword === user.firstPassword) {
            let token = jwt.sign(secret.secretData.signInEntityCaptain, secret.secretData.tokenSignInSecretCaptain, {
                expiresIn: "2 days"
              });
              res.json({
                success: true,
                message: 'First JWT token created and signed by Captain America!',
                username:user.name,
                token: token,
                secondRoute: secret.secretData.secondRoute
              });
        }
        else res.json({success: false, message:'Failure. Invalid credentials'}); 
    }      
    else {
        res.json({success: false, message:'Failure. Invalid credentials'});
    }    
});

app.post('/tfrytiruytrrgr56767j98', (req,res) => {
    let secondPassword = req.get('custom-auth-step2');   
    let token1 = req.body.token1;
    let username = req.body.username;

    let user = secret.secretData.users.find( user => user.name === username );
        if (typeof user === 'undefined') {
            res.json({success: false, message:'Failure. Invalid credentials'}); 
        };

    if (secondPassword === user.secondPassword) {        
        if (token1) {
            // verifies secret and checks exp
            jwt.verify(token1, secret.secretData.tokenSignInSecretCaptain, (err, decoded) => {
                if (err) {
                return res.json({ success: false, message: 'Failure. Invalid credentials' });
                }                 
                let token2 = jwt.sign(secret.secretData.signInEntityGeneral, secret.secretData.tokenSignInSecretGeneral, {
                    expiresIn: "2 days"
                    });
                res.json({
                    success: true,
                    message: 'Second JWT token created and signed by General Shang!',
                    token: token2,
                    username: user.name,
                    thirdRoute: secret.secretData.thirdRoute
                });                
            });        
        }
    }
    else {
        res.json({success: false, message:'Failure. Invalid credentials'});
    }
});


app.post('/dhaetyhaetgdhbfgbn5674ser', (req,res) => {

    let thirdPassword = req.get('custom-auth-step3');   
    let token2 = req.body.token2;
    let username = req.body.username;

    let user = secret.secretData.users.find( user => user.name === username );
        if (typeof user === 'undefined') {
            res.json({success: false, message:'Failure. Invalid credentials'}); 
        };

    if (thirdPassword === user.thirdPassword) {        
        if (token2) {
            // verifies secret and checks exp
            jwt.verify(token2, secret.secretData.tokenSignInSecretGeneral, (err, decoded) => {
                if (err) {
                    return res.json({ success: false, message: 'Failure. Invalid credentials' });
                }                 
                let token3 = jwt.sign(secret.secretData.signInEntityCommander, secret.secretData.tokenSignInSecretCommander, {
                    expiresIn: "2 days"
                    });
                res.json({
                    success: true,
                    username: user.name,
                    message: 'Third JWT token created and signed by President Abraham Lincoln!',
                    token: token3,
                    fourthRoute: secret.secretData.fourthRoute
                });                
            });        
        }
    }
    else {
        res.json({success: false, message:'Failure. Invalid credentials'});
    } 
});

app.post('/sdjogfnwo0aq23aojfnapw', (req,res) => {
    let fourthPassword = req.get('custom-auth-step4');   
    let token3 = req.body.token3;
    let username = req.body.username;

    let user = secret.secretData.users.find( user => user.name === username );
        if (typeof user === 'undefined') {
            res.json({success: false, message:'Failure. Invalid credentials'}); 
        };

    if (fourthPassword === user.fourthPassword) {        
        if (token3) {
            // verifies secret and checks exp
            jwt.verify(token3, secret.secretData.tokenSignInSecretCommander, (err, decoded) => {
                if (err) {
                return res.json({ success: false, message: 'Failure. Invalid credentials' });
                }                                     
                res.json({
                    success: true,
                    message: 'Success! You have accessed the most secret data!',
                    secretAddress: secret.secretData.superSecretData,
                    secretQr: secret.secretData.qrRoute
                });                
            });        
        }
    }
    else {
        res.json({success: false, message:'Failure. Invalid credentials'});
    }
});

let serverUnsecure = http.createServer(app).listen(process.env.PORT || 3200, function () {
    console.log('Server express running at. ' + serverUnsecure.address().address + ':' + serverUnsecure.address().port + ' ');
});



