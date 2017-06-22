$(function () {
    var user;
    var directs = ['LEFT','UP','RIGHT','DOWN'];
    var doff = 37;
    var socket = io();
    $('form').submit(function(){
      socket.emit('set user', $('#m').val());
      user = $('#m').val();
      $('#m').val('');
      return false;
    });
    $(document).ready(function() {
      $(document).keydown(function(event) {
        if(event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40){
          socket.emit('direction', {user: user, direction: event.which});
        }
      });
    });
    socket.on('set user', function(msg){
      $('#messages').append($('<li>').text(msg));
    });
    socket.on('direction', function(data) {
      $('#dire').html(data.user + data.direction);
    });
  });
