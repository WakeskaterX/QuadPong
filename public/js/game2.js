var GameObjects = {
  ball: {x: 0, y: 0},
  p1: {x: 0, y: -50},
  p2: {x: 50, y: 0},
  p3: {x: 0, y: 50},
  p4: {x: -50, y: 0}
}

var canvas, ctx;

var size_mult = 6;

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
  var ball_coords = convert(GameObjects.ball.x, GameObjects.ball.y);
  ctx.fillRect(ball_coords.x - 4, ball_coords.y - 4, 8, 8);
}

function drawPlayers() {
  var p1c = convert(GameObjects.p1.x, GameObjects.p1.y);
  var p2c = convert(GameObjects.p2.x, GameObjects.p2.y);
  var p3c = convert(GameObjects.p3.x, GameObjects.p3.y); 
  var p4c = convert(GameObjects.p4.x, GameObjects.p4.y);
  ctx.fillRect(p1c.x - 6 * size_mult, p1c.y - 2 * size_mult, 12 * size_mult, 4 * size_mult);
  ctx.fillRect(p2c.x - 2 * size_mult, p2c.y - 6 * size_mult, 4 * size_mult, 12 * size_mult);
  ctx.fillRect(p3c.x - 6 * size_mult, p3c.y - 2 * size_mult, 12 * size_mult, 4 * size_mult);
  ctx.fillRect(p4c.x - 2 * size_mult, p4c.y - 6 * size_mult, 4 * size_mult, 12 * size_mult);
}

function convert(x, y) {
  var new_x = (x + 50) * size_mult;
  var new_y = ((y * -1) + 50) * size_mult;
  return {'x': new_x, 'y': new_y};
}

function clearCanvas() {
  ctx.clearRect(0,0,100 * size_mult,100 * size_mult);
}
