var socket = io();

var connectionCount = document.getElementById('connection-count');

socket.on('usersConnected', function (count) {
  connectionCount.innerText = 'Connected Users: ' + count;
});

var statusMessage = document.getElementById('status-message');

socket.on('statusMessage', function (message) {
  statusMessage.innerText = message;
});

var buttons = document.querySelectorAll('#choices button');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    socket.send('voteCast', this.innerText);
    socket.send('userVote', this.innerText);
  });
}
var voteCount = document.getElementById('vote-count');

socket.on('voteCount', function (votes) {
  voteCount.innerText = "A: " + votes["A"] +
                        " B: " + votes["B"] +
                        " C: " + votes["C"] +
                        " D: " + votes["D"]
});

var votedMessage = document.getElementById('vote-message');

socket.on('voteCastMessage', function (message) {
  votedMessage.innerText = "You voted for " + message;
});
