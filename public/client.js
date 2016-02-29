var socket = io();

var statusMessage = document.getElementById('status-message');
var closePoll = document.getElementById('close-poll');
var buttons = document.querySelectorAll('#choices button');
var voteCount = document.getElementById('vote-count');
var votedMessage = document.getElementById('vote-message');
var adminClosedMessage = document.getElementById('closed-poll');
var submittedVotes = 0
var pollId = window.location.pathname.split('/')[2];


socket.on('usersConnected', function (count) {
  connectionCount.innerText = 'Connected Users: ' + count;
});

socket.on('statusMessage', function (message) {
  statusMessage.innerText = message;
});

socket.on('voteCount', function (votes) {
  for(var key in votes){
    document.getElementById(key.toUpperCase() + '-votes').innerText = votes[key];
  };
});

socket.on('disableVotes', function(){
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].className += " disabled";
  };
  adminClosedMessage.innerText = "Poll is Closed"
})

if (window.location.pathname.split('/')[3]){
  closePoll.addEventListener('click', function(){
    socket.send('closePoll', {id: pollId});
  })
}

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    if (submittedVotes >= 1){
      votedMessage.innerText = "You have already cast a vote.";
    } else {
    socket.send('voteCast', {option: this.innerText, id: pollId});
    submittedVotes ++;
    };
  });
}
