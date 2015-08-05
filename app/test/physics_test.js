//Regular test - not mocha

var Physics = require('../lib/physics.js');
var Vector2 = Physics.Vector2;

var positive_vector = new Vector2(1, 0);
var positive_vector2 = new Vector2(0, 1);

console.log('\nPositive Vector: ');
console.log(positive_vector);

var ball = {position: new Vector2(-1,-5)};

//console.log('\nBall Position: ');
//console.log(ball.position);

var movement_vector = positive_vector.copy();
var movement_vector2 = positive_vector2.copy();
movement_vector.multiply_mask(ball.position).normalize();
console.log(movement_vector);
console.log(positive_vector);

console.log(movement_vector.getDirection());
console.log(positive_vector.getDirection());



process.exit(1);