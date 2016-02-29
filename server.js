const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const generateId = require('./lib/generate-id');
const countVotes = require('./lib/count-votes');
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
  var adminId = req.body.poll.adminId;
  app.locals.polls[id] = poll;
  poll['votes'] = [];
  poll['closed'] = false;
  setPollTimer(poll);

  res.redirect('/polls/' + id + "/" + adminId);
});

app.get('/polls/:id', function(req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('pages/user-show-poll', {poll: poll, votes: countVotes(poll)});
})

app.get('/polls/:id/:adminId', function(req, res){
  var poll = app.locals.polls[req.params.id];
  res.render('pages/admin-show-poll', {poll: poll, id: req.params.id, adminID: req.params.adminId, votes: countVotes(poll)});
})

const port = process.env.PORT || 3000;

const server = http.createServer(app)
                 .listen(port, function () {
                    console.log('Listening on port ' + port + '.');
                  });

// Websockets
const socketIo = require('socket.io');
const io = socketIo(server);

io.on('connection', function (socket) {
  io.sockets.emit('userConnection', io.engine.clientsCount);

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      var poll = app.locals.polls[message.id]
      poll['votes'].push(message.option);
      io.sockets.emit('voteCount', countVotes(poll));
    } else if (channel === 'closePoll'){
      var poll = app.locals.polls[message.id]
      poll['closed'] = true
      io.sockets.emit('disableVotes')
    }
  });

  socket.on('disconnect', function () {
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });
});

function setPollTimer(poll){
  if(poll['runtime'] !== "N/A"){
    setTimeout(function(){
      poll['closed'] = true
      io.sockets.emit('disableVotes')
    }, (poll['runtime'] * 1000 * 60))
  }
}

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`);
  });
}

module.exports = app;
