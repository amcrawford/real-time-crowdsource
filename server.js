const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const generateId = require('./lib/generate-id');
const app = express();

app.locals.title = 'Crowdsource';
app.locals.polls = {};
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', function (req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/poll', function(req, res){
  var poll = req.body.poll;
  var id = generateId();
  var adminId = generateId();
  app.locals.polls[id] = poll;
  poll['votes'] = [];
  poll['closed'] = false;

  res.redirect('/polls/' + id + "/" + adminId);
});

app.get('/polls/:id', function(req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('user-show-poll', {poll: poll, votes: countVotes(poll)});
})

app.get('/polls/:id/:adminId', function(req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('admin-show-poll', {poll: poll, id: req.params.id, adminID: req.params.adminId, votes: countVotes(poll)});
})

app.post('/polls/:id/:adminId/close', function(req, res){
  var poll = app.locals.polls[req.params.id];
  poll['closed'] = true;

  res.redirect('/polls/' + req.params.id + "/" + req.params.adminId);
})

const port = process.env.PORT || 3000;

const server = http.createServer(app)
                 .listen(port, function () {
                    console.log('Listening on port ' + port + '.');
                  });

// Websockets
const socketIo = require('socket.io');
const io = socketIo(server);

function countVotes(poll) {
var voteCount = {};
  poll['votes'].forEach(function(vote){
    if(voteCount[vote]){
      voteCount[vote]++;
    } else {
      voteCount[vote] = 1;
    }
  });
  return voteCount;
}

function printVotes(votes){
  var totals = "";
  for(var key in votes){
    if (key){
      totals = totals + key + ": " + votes[key] + " ";
    }
  }
  return totals;
}

io.on('connection', function (socket) {
  io.sockets.emit('userConnection', io.engine.clientsCount);

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      var poll = app.locals.polls[message.id]
      poll['votes'].push(message.option);
      io.sockets.emit('voteCount', countVotes(poll));
    } else if (channel === 'userVote'){
      // socket.emit('voteCastMessage', message);
    }
  });

  socket.on('disconnect', function () {
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });
});


module.exports = server;
