var GameObjects = {
  ball: {position: {x: 0, y: 0}},
  p1: {position: {x: 0, y: -50}},
  p2: {position: {x: 50, y: 0}},
  p3: {position: {x: 0, y: 50}},
  p4: {position: {x: -50, y: 0}}
}

var debug = false;

var canvas, ctx;

var size_mult = 6;
var ball_width = 4;
var paddle_width = 12;
var paddle_depth = 6;

window.onload = function init() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  ctx.fillStyle = 'white';
};

function updateGame() {
  clearCanvas();
  drawBall();
  drawPlayers();
}

function drawBall() {
  var ball_coords = convert(GameObjects.ball.position.x, GameObjects.ball.position.y);
  ctx.fillRect(ball_coords.x - 4, ball_coords.y - 4, 8, 8);
}

function drawPlayers() {
  var p1c = convert(GameObjects.p1.position.x, GameObjects.p1.position.y);
  var p2c = convert(GameObjects.p2.position.x, GameObjects.p2.position.y);
  var p3c = convert(GameObjects.p3.position.x, GameObjects.p3.position.y); 
  var p4c = convert(GameObjects.p4.position.x, GameObjects.p4.position.y);
  ctx.fillRect(p1c.x - (paddle_width/2) * size_mult, p1c.y - (paddle_depth/2) * size_mult, paddle_width * size_mult, paddle_depth * size_mult);
  ctx.fillRect(p2c.x - (paddle_depth/2) * size_mult, p2c.y - (paddle_width/2) * size_mult, paddle_depth * size_mult, paddle_width * size_mult);
  ctx.fillRect(p3c.x - (paddle_width/2) * size_mult, p3c.y - (paddle_depth/2) * size_mult, paddle_width * size_mult, paddle_depth * size_mult);
  ctx.fillRect(p4c.x - (paddle_depth/2) * size_mult, p4c.y - (paddle_width/2) * size_mult, paddle_depth * size_mult, paddle_width * size_mult);
}

function convert(x, y) {
  var new_x = (x + 50) * size_mult;
  var new_y = ((y * -1) + 50) * size_mult;
  return {'x': new_x, 'y': new_y};
}

function clearCanvas() {
  ctx.clearRect(0,0,100 * size_mult,100 * size_mult);
}
