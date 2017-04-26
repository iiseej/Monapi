var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

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

var ApiPoll = mongoose.model('ApiPoll', ApiPollSchema);
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
      res.send(polls);
    }
  });
    //res.send(db.collection('ApiPoll').find());
    //res.status(200).send(JSON.stringify(polls));
});

// Lister un sondage selon son id

app.get('/polls/:id', function(req, res) {

  db.collection('ApiPoll').find(
    { _id : ObjectId(req.params.id)})
    .toArray((err, poll) => {
   if (!err) {
     res.send(poll);
   }
  });

});

app.delete('/polls/:id', function (req,res) {
  db.collection('ApiPoll').findOne({
      _id: ObjectId(req.params.id)
  }, (err, poll) => {

          db.collection('ApiPoll').remove(
            {_id : ObjectId(req.params.id)}
          );
          res.status(200).send("poll deleted with GREAT succes !");
});
});


// Voter pour une réponse d'un sondage

app.post('/polls/:id/votes', function(req, res) {

    //const poll = polls.find(poll => poll.id == req.params.id);



    db.collection('ApiPoll').findOne({
        _id: ObjectId(req.params.id)
    }, (err, poll) => {

    if (typeof(poll) !== 'undefined') {
        //index de la answers
        const number = parseInt(req.body.answer);

        if (number >= 0 && number < poll.answer.length) {
            db.collection('ApiPoll').update(
              {_id : ObjectId(req.params.id)},
              { $push : {votes : number}}
            );
            //poll.votes.push(number);
            //res.send("got a post"+req.params.id+'-'+poll.votes);
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

    const question = req.body.question;
    const answer = req.body.answer;


    if (((typeof(question) || (answer)) !== 'undefined') && ((Array.isArray(answer))) && ((answer).every(a => typeof(a) === 'string'))) {
        //max id avec reduce

        //const id = (polls.reduce((a,b) => a > b.id ? a : b.id,0)) + 1;

        const newPoll = {
            //id,
            question,
            answer,
            votes: []
        };
    } else {
        res.status(400).send('pas de question ou pas de réponse');
    }


    //polls.push(newPoll);

    db.collection('ApiPoll').insert(newPoll);

    res.status(201).send(JSON.stringify(newPoll));
});


app.listen(3000, function() {
    console.log(' Monapi listening on port 3000!');
});
