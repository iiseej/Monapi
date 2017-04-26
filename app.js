const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const settings = require('./settings');
const Base64 = require('js-base64').Base64;



//DB setup
mongoose.connect('mongodb://mongo:27017/ApiPolls');

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Define schema
const ApiPollSchema = mongoose.Schema({
    question: String,
    answer: Array,
    votes: Array
});


// Creation de la collection ApiPoll sur le schema
var ApiPoll = mongoose.model('ApiPoll', ApiPollSchema);

// Define ObjectId as the mongodb.ObjectId
var ObjectId = require('mongodb').ObjectID;

//Body-parser to encode url
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


//const polls = db.collection('poll').find();
app.get('/', function(req, res) {
    res.status(200).send("Hello World");
});

// Lister les sondages
app.get('/polls', function(req, res) {

    db.collection('ApiPoll').find({}).toArray((err, polls) => {
        if (!err) {
            res.status(200).send(polls);
        }
    });
});

// Lister un sondage selon son id
app.get('/polls/:id', function(req, res) {
    db.collection('ApiPoll')
        .find({
            _id: ObjectId(req.params.id)
        })
        .toArray((err, poll) => {
            if (!err) {
                res.send(poll);
            }
        });
});

//Supprimer un sondage avec son Id
app.delete('/polls/:id', function(req, res) {

    //authentication

    if (typeof(req.headers.authorization) == 'undefined') {
        return res.send(401, 'WWW-Authenticate: Basic realm=\"Required Basic\"');
    }

    if (/^Basic/.test(req.headers.authorization)) {
        const auth = req.headers.authorization.substring(6);
    } else {
        return res.status(400).send('not basic');
    }

    const authHeader = Base64.decode(auth);
    const dbUser = settings.adminAuth.user + ":" + settings.adminAuth.password;

    if (dbUser === authHeader) {

        db.collection('ApiPoll').findOne({
            _id: ObjectId(req.params.id)
        }, (err, poll) => {
            if (err) {
                return res.status(404).send('Page not found');
            } else {
                db.collection('ApiPoll').remove({
                    _id: ObjectId(req.params.id)
                });
                res.status(200).send("poll deleted with GREAT succes !");
            }
        });
    }
});


// Voter pour une réponse d'un sondage
app.post('/polls/:id/votes', function(req, res) {

    db.collection('ApiPoll').findOne({
        _id: ObjectId(req.params.id)
    }, (err, poll) => {
        if (typeof(poll) !== 'undefined') {
            //index de la answer
            const number = parseInt(req.body.answer);
            if (number >= 0 && number < poll.answer.length) {
                db.collection('ApiPoll').update({
                    _id: ObjectId(req.params.id)
                }, {
                    $push: {
                        votes: number
                    }
                });
                res.status(201).send("vote added");
            } else {
                res.status(404).send("answer does not exist");
            }
        } else {
            res.status(404).send("Poll does not exist");
        }
    });
});


// Créer un sondage
app.post('/polls', function(req, res) {

    if (typeof(req.headers.authorization) == 'undefined') {
        return res.send(401, 'WWW-Authenticate: Basic realm=\"Required Basic\"');
    }

    if (/^Basic/.test(req.headers.authorization)) {
        const auth = req.headers.authorization.substring(6);
    } else {
        return res.status(400).send('not basic');
    }

    const authHeader = Base64.decode(auth);
    const dbUser = settings.adminAuth.user + ":" + settings.adminAuth.password;

    if (dbUser === authHeader) {

        const question = req.body.question;
        const answer = req.body.answer;

        if (((typeof(question) || (answer)) !== 'undefined') && ((Array.isArray(answer))) && ((answer).every(a => typeof(a) === 'string'))) {
            const newPoll = {
                //id,
                question,
                answer,
                votes: []
            };
        } else {
            return res.status(400).send('pas de question ou pas de réponse');
        }

        db.collection('ApiPoll').insert(newPoll);

        res.status(201).send(JSON.stringify(newPoll));
    } else {
        res.status(401).send('error authentication');
    }
});


app.listen(3000, function() {
    console.log(' Monapi listening on port 3000!');
});
