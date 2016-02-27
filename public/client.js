var socket = io();

var connectionCount = document.getElementById('connection-count');
var statusMessage = document.getElementById('status-message');
var buttons = document.querySelectorAll('#choices button');
var voteCount = document.getElementById('vote-count');
var votedMessage = document.getElementById('vote-message');
var submittedVotes = 0


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
    socket.send('voteCast', this.innerText);
    socket.send('userVote', this.innerText);
    submittedVotes ++;
    };
  });
}

socket.on('voteCount', function (votes) {
  voteCount.innerText = "A: " + votes["A"] +
                        " B: " + votes["B"] +
                        " C: " + votes["C"] +
                        " D: " + votes["D"]
});


socket.on('voteCastMessage', function (message) {
  votedMessage.innerText = "You voted for " + message;
});
