var GameObjects = {
  ball: {position: {x: 0, y: 0}},
}

var debug = false;
var states= {
  'NONE': 'NONE',
  'MENU': 'MENU',
  'GAME': 'GAME',
  'LOBBY': 'LOBBY',
  'WAITING': 'WAITING'
}

var STATE = states.MENU;

var canvas, ctx;
var canvas_width = 600,
    canvas_height = 600;

var size_mult = 6;
var player_num = 1;
var game_settings = {
  ball_size: 4,
  paddle_width: 12,
  paddle_depth: 6
};

var keypress_listener = null;

window.onload = function init() {
  canvas = createHiDPICanvas(canvas_width, canvas_height);
  document.getElementById("game").appendChild(canvas);
  ctx = canvas.getContext("2d");
  ctx.fillStyle = 'white';
  keypress_listener = new window.keypress.Listener();
  registerKeypress();
};

function updateCanvas() {
  switch(STATE) {
    case states.NONE:
      break;
    case states.MENU:
      drawMenu();
      break;
    case states.GAME:
      drawGame();
      break;
    case states.LOBBY:
      drawLobby();
      break;
    case states.WAITING:
      drawGame();
      drawWaiting();
      break;
  }
}

function drawGame() {
  clearCanvas();
  drawBall();
  drawPlayers();
}

function drawMenu() {
  clearCanvas();
  ctx.font = "small-caps 800 64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("QuadPong",canvas_width/2,200);
  ctx.font = "small-caps 400 24px Arial";
  ctx.fillText("Press Enter to Create or Join an Existing Game",canvas_width/2,400);
}

//Draws the open games and players
function drawLobby() {
  
}

function drawBall() {
  var ball_coords = convert(GameObjects.ball.position.x, GameObjects.ball.position.y);
  ctx.fillRect(ball_coords.x - game_settings.ball_size/2 * size_mult, ball_coords.y - game_settings.ball_size/2 * size_mult, game_settings.ball_size * size_mult, game_settings.ball_size * size_mult);
}

function drawPlayers() {
  var players = ["p1", "p2", "p3", "p4"];
  for (var i = 0; i < players.length; i++) {
    var obj = GameObjects[players[i]];
    if (obj) {
      var start_vect = convert(obj.bounding_box.x1, obj.bounding_box.y1);
      var end_vect = convert(obj.bounding_box.x2, obj.bounding_box.y2);
      ctx.fillRect(start_vect.x, start_vect.y, end_vect.x-start_vect.x, end_vect.y-start_vect.y);
    }
  }
}

function drawWaiting() {
  ctx.font = "small-caps 800 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Waiting for Players...",canvas_width/2, canvas_height/2-200);
}

function convert(x, y) {
  var new_x = (x + 50) * size_mult;
  var new_y = ((y * -1) + 50) * size_mult;
  return {'x': new_x, 'y': new_y};
}

function clearCanvas() {
  ctx.clearRect(0,0,100 * size_mult,100 * size_mult);
}



//KEYBOARD CONTROLS
function registerKeypress() {
  keypress_listener.register_combo({
    "keys": "up",
    "on_keydown": function() {
      playerActionGenerator("U");
    },
    "prevent_repeat": true,
    "on_keyup": function() {
      playerAction("N");
    }
  });
  keypress_listener.register_combo({
    "keys": "down",
    "on_keydown": function() {
      playerActionGenerator("D");
    },
    "prevent_repeat": true,
    "on_keyup": function() {
      playerAction("N");
    }
  });
  keypress_listener.register_combo({
    "keys": "left",
    "on_keydown": function() {
      playerActionGenerator("L");
    },
    "prevent_repeat": true,
    "on_keyup": function() {
      playerAction("N");
    }
  });
  keypress_listener.register_combo({
    "keys": "right",
    "on_keydown": function() {
      playerActionGenerator("R");
    },
    "prevent_repeat": true,
    "on_keyup": function() {
      playerAction("N");
    }
  });
  keypress_listener.register_combo({
    "keys": "enter",
    "on_keydown": function() {
      if (STATE === states.MENU) {
        create_game();
      }
    },
    "prevent_repeat": true
  });
}

function playerActionGenerator(direction) {
  switch(player_num) {
    case 1:
      if (direction === "L") playerAction("L");
      if (direction === "R") playerAction("R");
      break;
    case 2:
      if (direction === "U") playerAction("R");
      if (direction === "D") playerAction("L");
      break;
    case 3:
      if (direction === "L") playerAction("R");
      if (direction === "R") playerAction("L");
      break;
    case 4:
      if (direction === "D") playerAction("R");
      if (direction === "U") playerAction("L");
      break;
  }
}

function playerAction(dir) {
  var data = {
    "player_id": player_id,
    "game_id": game_id,
    "action": dir
  };
  console.log("Emitting Action "+dir);
  socket.emit("action", data);
}