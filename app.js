var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//DB setup
mongoose.connect('mongodb://mongo:27017/polls');

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schema
//const pollSchema = mongoose.Schema({
//  question: String,
//  answer: Array,
//  votes:Array
//});

//var poll = mongoose.model('Poll',pollSchema);

//Body-parser to encode url
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


const polls = [{
        id: 8,
        question: "votre couleur préférée ?",
        answers: ["bleu", "blanc", "rouge", "vert"],
        votes: []
    },
    {
        id: 2,
        question: "Quelle est la capitale de la France ?",
        answers: ["Paris", "Moscou", "Berlin", "Bucarest", "Bangui"],
        votes: [1, 0, 0, 0, 2, 2, 2]
    }
];




app.get('/', function(req, res) {
    res.status(200).send("Hello World");
});

// Lister les sondages

app.get('/polls', function(req, res) {
    res.status(200).send(JSON.stringify(polls));
});

// Lister un sondage selon son id


app.get('/polls/:id', function(req, res) {

    const poll = polls.find(poll => poll.id == req.params.id);

    if (typeof(poll) !== 'undefined') {
        res.status(200).send(JSON.stringify(poll));
    } else {
        res.status(404).send("Poll does not exist");
    }

});


// Voter pour une réponse d'un sondage

app.post('/polls/:id/votes', function(req, res) {

    const poll = polls.find(poll => poll.id == req.params.id);

    if (typeof(poll) !== 'undefined') {
        //index de la answers
        const answer = parseInt(req.body.answer);

        if (answer >= 0 && answer < poll.answers.length) {
            poll.votes.push(answer);
            //res.send("got a post"+req.params.id+'-'+poll.votes);
            res.status(201).send(JSON.stringify(poll));
        } else {
            res.status(404).send("answer does not exist");
        }

    } else {
        res.status(404).send("Poll does not exist");
    }

});


// Créer un sondfage

app.post('/polls', function(req, res) {

    const question = req.body.question;
    const answer = req.body.answer;

    if (((typeof(question) || (answer) )!== 'undefined') && ((Array.isArray(answer))) && ((answer).every(a=>typeof(a)==='string'))) {
      //max id avec reduce
      const id = (polls.reduce((a,b) => a > b.id ? a : b.id)) + 1;
      const newPoll = {
        id,
        question,
        answer,
        votes : []
      };
    } else {
      res.status(400).send('pas de question ou pas de réponse');
    }


    polls.push(newPoll);

    res.status(201).send(JSON.stringify(newPoll));
});


app.listen(3000, function() {
    console.log(' Monapi listening on port 3000!');
});
