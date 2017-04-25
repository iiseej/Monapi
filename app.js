var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//DB setup
mongoose.connect('mongodb://mongo:27017');

//Body-parser to encode url
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());


const polls = [
  {
    id : 1,
    question : "votre couleur préférée ?",
    responses : ["bleu", "blanc", "rouge", "vert"],
    votes:[]
  },
  {
    id : 2,
    question : "Quelle est la capitale de la France ?",
    responses : ["Paris", "Moscou", "Berlin", "Bucarest","Bangui"],
    votes:[1,0,0,0,2,2,2]
  }
];




app.get('/', function(req, res){
  res.status(200).send("Hello World");
});

// Lister les sondages

app.get('/polls', function(req,res){
  res.status(200).send(JSON.stringify(polls));
});

// Lister un sondage selon son id


app.get('/polls/:id', function(req, res){

 const poll = polls.find( poll => poll.id == req.params.id);

  if (typeof(poll) !== 'undefined') {
    res.status(200).send(JSON.stringify(poll));
  } else {
    res.status(404).send("Poll does not exist");
  }

});


// Voter pour une réponse d'un sondage

app.post('/polls/:id/votes', function(req, res){

const poll = polls.find( poll => poll.id == req.params.id);

   if (typeof(poll) !== 'undefined') {
     //index de la responses
     const answer =  poll.responses.indexOf("bleu");
     if (answer !== -1) {
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

app.post('/polls', function(req, res){

const newPoll = req.body;
newPoll.id = 3;
polls.push(newPoll);

res.status(201).send(JSON.stringify(polls));
});


app.listen(3000, function(){
  console.log(' Monapi listening on port 3000!');
});
