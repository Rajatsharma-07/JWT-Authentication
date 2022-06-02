const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/users');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const crypto = require('crypto');
var key = "passowrd";
var algo = 'aes256';

//
const jwt = require('jsonwebtoken');
jwtKey = "jwt";
//

mongoose.connect('mongodb+srv://RajatDB:**Striker**@cluster0.pq8vg.mongodb.net/PracticeDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.warn('Connected');
})

app.post('/register', jsonParser, function(req, res){
    var cipher = crypto.createCipher(algo,key);
    var encrypted = cipher.update(req.body.password, "utf-8","hex")
    +cipher.final('hex'); 
    console.warn(encrypted);
    const data = new User({
        _id:mongoose.Types.ObjectId(),
        name:req.body.name,
        email:req.body.email,
        address:req.body.address,
        password:encrypted
    })  
    data.save().then((result) => {
        jwt.sign({result}, jwtKey, {expiresIn : '300s'}, (err, token) => {
            res.status(201).json(token);
        })
        //res.status(201).json(result);
    }).catch((err) => console.warn(err));
})

app.post('/login', jsonParser, function(req, res){
    User.findOne({email:req.body.email}).then((data) => {
        var decipher = crypto.createDecipher(algo ,key);
        var decrypted = decipher.update(data.password, 'hex', 'utf-8') + decipher.final('utf-8'); 
        if(decrypted == req.body.password){
            jwt.sign({data}, jwtKey, {expiresIn : '300s'}, (err, token) => {
                res.status(200).json(token); 
            })
        } 
    })
})

app.get('/users', verifyToken, function(req, res){
    User.find().then((result) => {
        res.status(200).json(result);
    })
})
function verifyToken(req, res, next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader != 'undefined'){
        const bearer = bearerHeader.split(' ');
        console.warn(bearer[1]);
        req.token = bearer[1];
        jwt.verify(req.token, jwtKey, (err, authData) => {
            if(err){
                res.json({result: err})
            }else{
                next();
            }
        })
    }else {
        res.send('Result: Token not provided');
    }
}

app.listen(5000);