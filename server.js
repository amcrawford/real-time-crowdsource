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

app.get('/', function (req, res){
  res.sendFile(__dirname + '/public/index.html');
});


app.post('/poll', function(req, res){
  var poll = req.body.poll;
  var id = generateId();
  app.locals.polls[id] = poll;
  poll['votes'] = {};
  poll['closed'] = false;

  res.redirect('/polls/' + id);
});

app.get('/polls/:id', function(req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('show-poll', {poll: poll});
})

const port = process.env.PORT || 3000;

const server = http.createServer(app)
                 .listen(port, function () {
                    console.log('Listening on port ' + port + '.');
                  });



const socketIo = require('socket.io');
const io = socketIo(server);


function countVotes(poll) {
var voteCount = {};
poll.options.forEach(function(option){
  voteCount[option] = 0
})
  for (var vote in poll.votes) {
    voteCount[poll.votes[vote]]++
  }
  return voteCount;
}

io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  io.sockets.emit('userConnection', io.engine.clientsCount);

  // socket.emit('statusMessage', 'You have connected.');

  // io.sockets.emit('voteCount', countVotes(poll));

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      var poll = app.locals.polls[message.id]
      poll['votes'][socket.id] = message.vote;
      socket.emit('voteCount', countVotes(poll));
    } else if (channel === 'userVote'){
      socket.emit('voteCastMessage', message);
    }
  });


  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });
});


module.exports = server;
