var socket = io();

var connectionCount = document.getElementById('connection-count');
var statusMessage = document.getElementById('status-message');
var buttons = document.querySelectorAll('#choices button');
var voteCount = document.getElementById('vote-count');
var votedMessage = document.getElementById('vote-message');
var submittedVotes = 0
var pollId = window.location.pathname.split('/')[2];


socket.on('usersConnected', function (count) {
  connectionCount.innerText = 'Connected Users: ' + count;
});


socket.on('statusMessage', function (message) {
  statusMessage.innerText = message;
});


for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    if (submittedVotes >= 1){
      votedMessage.innerText = "You have already cast a vote.";
    } else {
    socket.send('voteCast', {option: this.innerText, id: pollId});
    socket.send('userVote', this.innerText);
    submittedVotes ++;
    };
  });
}

socket.on('voteCount', function (votes) {
  var totals = ""
  for(var key in votes){
    if (key){
      totals = totals + key + ": " + votes[key] + " || "
    }
  }
  voteCount.innerText = totals
});


socket.on('voteCastMessage', function (message) {
  votedMessage.innerText = "You voted for " + message;
});
