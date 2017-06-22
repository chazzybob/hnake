var port = 3000;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players = [];
var sorted = [];
var arena = [];
var linea = [];
var diffs = [];
var asize = 50;
var stlen = 5;
var speed = 50;
var ids = 0;
var wht = 'white';
var blk = 'black';
var gry = 'grey';
var fd = 'brown';
var t;
var mvct = 0;
var foods = 5000;
var food = 0;
var wt = 3;
var picked = [];

function makesquare(sz) {
  arena = [];
  for (y = 0; y <= (sz + 1 ); y++) {
    linea = [];
    for (x = 0 ; x <= (sz + 1); x++) {
      if (y == 0 || y == (sz + 1) || x == 0 || x == (sz + 1)) {
        linea.push(blk);
      } else {
        linea.push(wht);
      }
    }
    arena.push(linea);
  }
}

function makerectangle(sz) {
  arena = [];
  var xsz = sz * 2;
  for (y = 0; y <= (sz + 1 ); y++) {
    linea = [];
    for (x = 0 ; x <= (xsz + 1); x++) {
      if (y == 0 || y == (sz + 1) || x == 0 || x == (xsz + 1)) {
        linea.push(blk);
      } else {
        linea.push(wht);
      }
    }
    arena.push(linea);
  }
}

function makedonut(sz) {
  var s = (sz/4) - 2;
  var w = (sz/4) - 1;
  var g = 6;
  arena = [];
  for (y = 0; y <= (sz + 1 ); y++) {
    linea = [];
    for (x = 0 ; x <= (sz + 1); x++) {
      if (y == 0 || y == (sz + 1) || x == 0 || x == (sz + 1) || (x > (s) && x <= (s+w) && (y == (s+1) || y == (sz-s))) || (x > (s+w+g) && x <= (s+w+g+w) && (y == (s+1) || y == (sz-s))) || (y > (s) && y <= (s+w) && (x == (s+1) || x == (sz-s))) || (y > (s+w+g) && y <= (s+w+g+w) && (x == (s+1) || x == (sz-s)))) {
        linea.push(blk);
      } else {
        linea.push(wht);
      }
    }
    arena.push(linea);
  }
}

function maketie(sz) {
  var s = (sz/4) - 2;
  var w = (sz/4) - 1;
  var g = 6;
  arena = [];
  for (y = 0; y <= (sz + 1 ); y++) {
    linea = [];
    for (x = 0 ; x <= (sz + 1); x++) {
        if (y == 0 || y == (sz + 1) || x == 0 || x == (sz + 1) || (x > (s) && x <= (s+w) && (y == (s+1+w) || y == (sz-s-w))) || (x > (s+w+g) && x <= (s+w+g+w) && (y == (s+1+w) || y == (sz-s-w))) || (y > (s) && y <= (s+w) && (x == (s+1) || x == (sz-s))) || (y > (s+w+g) && y <= (s+w+g+w) && (x == (s+1) || x == (sz-s)))) {        linea.push(blk);
      } else {
        linea.push(wht);
      }
    }
    arena.push(linea);
  }
}

function socks(roomId, namespace) {
    var res = []
    // the default namespace is "/"
    , ns = io.of(namespace ||"/");

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId);
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}

function scores() {
  players = [];
  for (i = 0; i < socks().length; i++) {
    var info = ({num: socks()[i].vars.num,
      user: socks()[i].vars.user,
      direction: socks()[i].vars.direction,
      newdir: socks()[i].vars.newdir,
      len: socks()[i].vars.len,
      head: {x: socks()[i].vars.x, y: socks()[i].vars.y},
      snake: socks()[i].vars.snake,
      tail: socks()[i].vars.tail,
      alive: socks()[i].vars.alive,
      color: socks()[i].vars.color,
      wins: socks()[i].vars.wins,
    });
    players.push(info);
  }
   sorted = players.sort(function(a, b) {
    return b.len - a.len;
  });
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.emit('starter');
  io.emit('colors', picked);
  socket.vars = {};
  socket.vars.num = socks().length-1;
  socket.vars.color = 'black';
  socket.emit('set usernum', socket.vars.num);
  console.log(socks().length-1);
  io.emit('users',players);
  socket.on('set user', function(msg){
    // console.log(msg);
    // io.emit('set user', msg);
    var tx = Math.floor((Math.random() * 20) + 1);
    var ty = Math.floor((Math.random() * 20) + 1);
    console.log(msg);
    socket.vars = {num: msg.num,
      user: msg.user,
      direction: 0,
      newdir: 0,
      len: '',
      head: {x: tx, y:ty},
      snake: [],
      tail: {x: '', y: ''},
      alive: 1,
      color: socket.vars.color,
      wins: 0,
    };
    socket.vars.snake.push({x: tx, y:ty});
    // socket.vars.num = ids;
    // socket.vars.push({num: socks().length-1, user: msg});
    // ids++;
    // socket.vars.user = msg;

    var info = ({num: socket.vars.num,
      user: socket.vars.user,
      direction: 0,
      newdir: 0,
      len: stlen,
      x: tx,
      y: ty,
      snake: ['y'+ty+'x'+tx],
      drop: '',
      alive: 1,
      color: 'rgb(0,0,0)',
      wins: 0,
    });
    players.push(info);
    // console.log(socket.vars.num);
    socket.emit('usernum',{num: socket.vars.num, x: socket.x, y: socket.y});
    io.emit('users',players);
  });
  socket.on('create game', function(data) {
    asize = data.size;
    speed = data.speed;
    stlen = data.len;
    if (data.stage == 0) {
      makesquare(asize);
    }
    else if (data.stage == 1) {
      makerectangle(asize);
    }
    else if (data.stage == 2) {
      maketie(asize);
    }
    else if (data.stage == 3) {
      makedonut(asize);
    }
    // makesquare(asize);
    // makedonut(asize);
    // maketie(asize);
    // makerectangle(asize);
    io.emit('create game',{game: arena, size: asize, len: stlen});
    // console.log(asize);
    // console.log(speed);
    // console.log(stlen);
  });
  socket.on('play', function() {
    mvct = 0;
    food = 0;
    io.emit('players',players);
    for(ps = 0; ps < socks().length; ps++) {
      var tx = Math.floor((Math.random() * asize) + 1);
      var ty = Math.floor((Math.random() * asize) + 1);
      socks()[ps].vars.head = {x: tx, y:ty};
      socks()[ps].vars.len = stlen;
      socks()[ps].vars.snake = [];
      socks()[ps].vars.snake.push({x: tx, y:ty});
      socks()[ps].vars.alive = 1;
      socks()[ps].vars.direction = 0;
      socks()[ps].vars.newdir = 0;
      arena[ty][tx] = socks()[ps].vars.color;
    }
     io.emit('move', arena);
    function move() {
      var alldead = 1;
      var living = 0;
      mvct++;
      if (socks().length == 0) {
        clearInterval(t);
        console.log('no players');
      // } else if (players.length == 1) {
      //   clearInterval(t);}
      }
      else {
        for(p = 0; p < socks().length; p++) {
          if(socks()[p].vars.alive == 1) {
            alldead = 0;
            living++;
            if(socks()[p].vars.user == 'single player') {
              living++;
            }
            if(socks()[p].vars.newdir == 'LEFT' && socks()[p].vars.direction != 'RIGHT') {
              socks()[p].vars.direction = 'LEFT';
            }
            else if(socks()[p].vars.newdir == 'RIGHT' && socks()[p].vars.direction != 'LEFT') {
              socks()[p].vars.direction = 'RIGHT';
            }
            else if(socks()[p].vars.newdir == 'UP' && socks()[p].vars.direction != 'DOWN') {
              socks()[p].vars.direction = 'UP';
            }
            else if(socks()[p].vars.newdir == 'DOWN' && socks()[p].vars.direction != 'UP') {
              socks()[p].vars.direction = 'DOWN';
            }
            if(socks()[p].vars.direction == 'LEFT') {
              socks()[p].vars.head.x--;
            }
            else if(socks()[p].vars.direction == 'RIGHT') {
              socks()[p].vars.head.x++;
            }
            else if(socks()[p].vars.direction == 'UP') {
              socks()[p].vars.head.y--;
            }
            else if(socks()[p].vars.direction == 'DOWN') {
              socks()[p].vars.head.y++;
            }
            if(socks()[p].vars.direction != 0 && socks()[p].vars.alive == 1) {
              socks()[p].vars.snake.push({x: socks()[p].vars.head.x, y: socks()[p].vars.head.y})
              if(socks()[p].vars.snake.length > socks()[p].vars.len) {
                var tl = socks()[p].vars.snake.shift();
                socks()[p].vars.tail = {x: tl.x, y: tl.y}
                arena[tl.y][tl.x] = wht;
              }
              if(arena[socks()[p].vars.head.y][socks()[p].vars.head.x] == wht || arena[socks()[p].vars.head.y][socks()[p].vars.head.x] == gry || arena[socks()[p].vars.head.y][socks()[p].vars.head.x] == fd){
                socks()[p].vars.alive = 1;
                if (arena[socks()[p].vars.head.y][socks()[p].vars.head.x] == gry) {
                  socks()[p].vars.len++;
                }
                if(arena[socks()[p].vars.head.y][socks()[p].vars.head.x] == fd) {
                  socks()[p].vars.len += stlen;
                  food = 0;
                  mvct = 0
                }
              }
              else {
                socks()[p].vars.alive = 0;
                // console.log(arena[socks()[p].vars.head.y][socks()[p].vars.head.x]);
              }
              for(s = 0; s < socks()[p].vars.snake.length; s++) {
                if(socks()[p].vars.alive == 1) {
                  arena[socks()[p].vars.snake[s].y][socks()[p].vars.snake[s].x] = socks()[p].vars.color;
                }
                else {
                  if(s < (socks()[p].vars.snake.length - 1)) {
                    arena[socks()[p].vars.snake[s].y][socks()[p].vars.snake[s].x] = gry;
                  }
                }
              }
              if (socks()[p].vars.alive == 1 && socks()[p].vars.snake.length > 1) {
                arena[socks()[p].vars.head.y][socks()[p].vars.head.x] = blk;
              }
              if (socks()[p].vars.alive == 0 && socks()[p].vars.tail.x != '') {
                arena[socks()[p].vars.tail.y][socks()[p].vars.tail.x] = gry;
              }
            }
          }
        }
        if (mvct > (foods/(speed/wt))) {
          food = 0;
        }
        if (mvct > (foods/speed) && food == 0) {
          mvct = 0;
          food = 1;
          var x = Math.floor((Math.random() * asize) + 1);
          var y = Math.floor((Math.random() * asize) + 1);
          arena[y][x] = fd;
        }

        if (alldead == 1) {
          clearInterval(t);
          console.log('errbody died');
          io.emit('game over');
        }
        io.emit('move', arena);
        scores();
        io.emit('users',sorted);
        // console.log(sorted);
        // console.log(socks());
        if (living == 1) {
          for(l = 0; l < socks().length; l++) {
            // console.log(socks());
            if(socks()[l].vars.alive == 1) {
              socks()[l].vars.len+= (2*stlen);
              // socks()[l].vars.wins++;
              // console.log(socks()[l].vars.len);
            }
          }
          scores();
          // console.log(sorted);
          for (w = 0; w < socks().length; w++) {
            if (socks()[w].vars.num == sorted[0].num && socks()[w].vars.user == sorted[0].user) {
              socks()[w].vars.wins++;
            }
          }
          scores();
          io.emit('users',sorted);
          io.emit('game over');
          clearInterval(t);
        }
      }
    }
    t = setInterval(function() {move()},speed);
  });
  socket.on('params',function(gparams) {
    io.emit('params',gparams);
  });
  socket.on('picked color',function(col) {
    socket.vars.color = col;
    picked.push(col);
    io.emit('picked color', {num: socket.vars.num ,color: col});
  });
  socket.on('direction',function(data) {
    socket.vars.newdir = data.direction;
    // console.log(socket.vars);
  });
  socket.on('death', function(dead) {
    if (dead != 0) {
      for(i = 0; i < players.length; i++) {
        if (players[i].num == dead.num && players[i].user == dead.user) {
          players[i].alive = 0;
          players[i].direction = 0;
          players[i].snake = [];
        }
      }
      // console.log(dead);
    }
  });
  socket.on('add one', function(toadd) {
    if (toadd != 0) {
      for(i = 0; i < players.length; i++) {
        if (players[i].num == toadd.num && players[i].user == toadd.user) {
          players[i].len += 1/players.length;
        }
      }
      // console.log(toadd);
    }
  });
  socket.on('disconnect', function(){
    for (i = 0; i < players.length ; i++){
      if (players[i].num == socket.num) {
        players.splice(i,1);
      }
    }
    console.log('user disconnected ' + socket.user);
    io.emit('move',players);
    // players.splice(socket.num, 1);
  });
 });

http.listen(port, function(){
  console.log('listening on *:' + port);
});
