/*********************************
 * Variables
 *********************************/

//Collection of Game Objects and values
var GameObjects = {
  ball: {position: {x: 0, y: 0}},
}

//Player Status Data
var PlayerData = {
  p1: null,
  p2: null,
  p3: null,
  p4: null
}
/**
 * PlayerData Format:
 * p1: {
 *   player_num: 1,
 *   life: 2,
 *   is_self: true,
 *   type: "Human"
 * }
 */

//Import our math_ext library
var math_ext = require('/app/lib/math_extension.js');

var debug = false;

//All of the Game States
var states= {
  'NONE': 'NONE',
  'MENU': 'MENU',
  'GAME': 'GAME',
  'LOBBY': 'LOBBY',
  'WAITING': 'WAITING',
  'GAME_END': 'GAME_END'
}

//Selection Value for the Lobby
var LOBBY_SELECT = 0; //0 = create game selected, 1 = join game selected

//Starting State
var STATE = states.MENU;

//Canvas Variables
var canvas, ctx;
var canvas_width = 600,
    canvas_height = 600;

//Game Colors - active player color and game general color
var game_color = '#FFF',
    player_active_color = '#0FF';

//Initial Values for the game
var size_mult = 6;
var player_num = 1;
var game_settings = {
  ball_size: 2,
  paddle_width: 9,
  paddle_depth: 6
};

var keypress_listener = null;

/**
 * On Load Initialize - create our HiDPICanvas and set up our keypress listener
 */
window.onload = function init() {
  canvas = createHiDPICanvas(canvas_width, canvas_height);
  document.getElementById("game").appendChild(canvas);
  ctx = canvas.getContext("2d");
  ctx.fillStyle = game_color;
  keypress_listener = new window.keypress.Listener();
  registerKeypress();
};

/**
 * Draw various states depending on the state of the game
 */
function updateCanvas() {
  switch(STATE) {
    case states.MENU:
      drawMenu();
      break;
    case states.GAME:
      drawGame();
      break;
    //case states.LOBBY: -- Not USED - can be added later for a game select lobby
      //drawLobby();
      //break;
    case states.WAITING:
      drawWaiting();
      break;
    case states.GAME_END:
      drawGameOver();
      break;
  }
}

/**
 * Draw our game for the game state, ball position and players
 */
function drawGame() {
  clearCanvas();
  drawBall();
  drawPlayers();
}

/**
 * Draw our Menu - (Lobby)
 */
function drawMenu() {
  clearCanvas();
  ctx.font = "small-caps 800 64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("QuadPong",canvas_width/2,200);
  ctx.font = "small-caps 400 24px Arial";
  ctx.fillText("Create New Game",canvas_width/2,400);
  ctx.fillText("Join Existing Game", canvas_width/2, 460);
  ctx.font = "small-caps 300 16px Arial";
  ctx.fillText("Open Games: "+numberOfOpenGames(), canvas_width/2, 500);
  ctx.strokeStyle = game_color;
  if (LOBBY_SELECT === 0) {
    ctx.strokeRect(canvas_width/2 - 150, 372, 300, 40);
  } else {
    ctx.strokeRect(canvas_width/2 - 150, 432, 300, 40);
  }
  ctx.stroke();
}

/**
 * Draw the Ball
 */
function drawBall() {
  ctx.fillStyle = game_color;
  var ball_coords = convert(GameObjects.ball.position.x, GameObjects.ball.position.y);
  ctx.fillRect(ball_coords.x - game_settings.ball_size/2 * size_mult, ball_coords.y - game_settings.ball_size/2 * size_mult, game_settings.ball_size * size_mult, game_settings.ball_size * size_mult);
}

/**
 * Draw our players - draw the active player (you) in a different color
 */
function drawPlayers() {
  var players = ["p1", "p2", "p3", "p4"];
  for (var i = 0; i < players.length; i++) {
    var obj = GameObjects[players[i]];
    if (obj) {
      if (PlayerData[players[i]].player_num == player_num) {
        ctx.fillStyle = player_active_color;
      } else {
        ctx.fillStyle = game_color;
      }
      var start_vect = convert(obj.bounding_box.x1, obj.bounding_box.y1);
      var end_vect = convert(obj.bounding_box.x2, obj.bounding_box.y2);
      ctx.fillRect(start_vect.x, start_vect.y, end_vect.x-start_vect.x, end_vect.y-start_vect.y);
    }
    ctx.fillStyle = game_color;
  }
}

/**
 * Draw the waiting screen when a player has joined but we need more players
 */
function drawWaiting() {
  clearCanvas();
  ctx.font = "small-caps 800 48px Arial";
  ctx.textAlign = "center";
  if (players_in_game >= 4) {
    ctx.fillText("Game Ready!", canvas_width/2, canvas_height/2-200);
  } else {
    ctx.fillText("Waiting for Players...",canvas_width/2, canvas_height/2-200);
  }
}

/**
 * Draw the game over screen - and which player won
 */
function drawGameOver() {
  clearCanvas();
  ctx.font = "small-caps 800 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas_width/2, canvas_height/2-200);
  ctx.font = "small-caps 800 36px Arial";
  ctx.fillText("Winner is Player # "+winner, canvas_width/2, canvas_height/2-18);
  ctx.font = "small-caps 800 24px Arial";
  ctx.fillText("Press Enter to go to menu!", canvas_width/2, canvas_height-50);
}

/**
 * Convert's the Servers XY Coord system to the canvas system
 */
function convert(x, y) {
  var new_x = (x + 50) * size_mult;
  var new_y = ((y * -1) + 50) * size_mult;
  return {'x': new_x, 'y': new_y};
}

/**
 * Clears our canvas
 */
function clearCanvas() {
  ctx.clearRect(0,0,100 * size_mult,100 * size_mult);
}



/**
 * Keypad listener - listens for key presses and outputs events based on the keys pressed
 */
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
        if (LOBBY_SELECT === 0) {
          create_game();
        } else {
          join_game();
        }
      } else if (STATE === states.GAME_END) {
        restart_game();
      }
    },
    "prevent_repeat": true
  });
}

/**
 * Changes what each key does (directional arrows) based on the player num
 */
function playerActionGenerator(direction) {
  if (STATE === states.GAME) {
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
  } else if (STATE === states.MENU) {
    if (direction === "D" || direction === "U") {
      LOBBY_SELECT = LOBBY_SELECT ? 0 : 1;
      updateCanvas();
    }
  }
}

/**
 * Generates the player action and emits to the server
 */
function playerAction(dir) {
  if (STATE === states.GAME) {
    var data = {
      "player_id": player_id,
      "game_id": game_id,
      "action": dir
    };
    console.log("Emitting Action "+dir);
    socket.emit("action", data); 
  }
}

/**
 * List number of open games
 */
function numberOfOpenGames(){
  var num = 0;
  for (var i = 0; i < game_list.length; i++) {
    if (game_list[i].number_slots > 0) num++;
  }
  return num;
}