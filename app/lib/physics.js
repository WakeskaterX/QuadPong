//Physics Library for computing various things

/**
 * getVectorFromDirection
 * @param {number} direction - direction IN DEGREES to convert to a Vector2
 * @param {number} magnitude - the magnitude of the ray
 */
var getVectorFromDirection = function (direction, magnitude) {
  var vel_x = roundToPlace((magnitude * Math.cos(degToRad(direction))),2);
  var vel_y = roundToPlace((magnitude * Math.sin(degToRad(direction))),2);
  return new Vector2(vel_x, vel_y);
}

var getDirectionFromVector = function(vector2) {
  return roundToPlace(degreeAdjuster(Math.abs(radToDeg(Math.atan(vector2.y/vector2.x))), vector2.x, vector2.y), 0);
}

var degreeAdjuster = function(deg, x, y) {
  switch (true) {
    //QUADRANT 1:
    case x > 0 && y >= 0:
      return deg;
    //QUADRANT 2:
    case x <= 0 && y >= 0:
      return 180 - deg;
    //QUADRANT 3:
    case x <= 0 && y < 0:
      return 180 + deg;
    //QUADRANT 4:
    case x > 0 && y < 0:
      return 360 - deg;
  }
}

var getMagnitudeFromVector = function(vector2) {
  return roundToPlace(Math.sqrt(Math.pow(vector2.x,2) + Math.pow(vector2.y, 2)),2);
}

/**
 * VECTOR 2
 */
function Vector2(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.constructor = Vector2;

Vector2.prototype.scalar_multiply = function(multiplier) {
  this.x *= multiplier;
  this.y *= multiplier;
  return this;
}

Vector2.prototype.scaleTo = function(multiplier) {
  return new Vector2(this.x * multiplier, this.y * multiplier);
}

// vector x *= vector2.x - used for masks (vector2: {0,1})
Vector2.prototype.multiply_mask = function(vector2) {
  this.x *= vector2.x;
  this.y *= vector2.y;
  return this;
}

Vector2.prototype.add = function(vector2) {
  this.x += vector2.x;
  this.y += vector2.y;
  return this;
}

Vector2.prototype.subtract = function(vector2) {
  this.x -= vector2.x;
  this.y -= vector2.y;
  return this;
}

Vector2.prototype.absoluteValue = function() {
  this.x = Math.abs(this.x);
  this.y = Math.abs(this.y);
  return this;
}

Vector2.prototype.normalize = function() {
  this.x = roundToPlace(this.x / this.getMagnitude(), 2);
  this.y = roundToPlace(this.y / this.getMagnitude(), 2);
  return this;
}

Vector2.prototype.copy = function() {
  return new Vector2(this.x, this.y);
}

Vector2.prototype.getMagnitude = function() {
  return getMagnitudeFromVector(this);
}

Vector2.prototype.getDirection = function() {
  return getDirectionFromVector(this);
}

/**
 * BOUNDING BOX - Used to position the bounding box around the center vector2
 * @param {Vector2} center - center position
 * @param {Number} width - width of the box
 * @param {Number} height - height of the box
 */
function BoundingBox (center, width, height) {
  this.position = center;
  this.width = width;
  this.height = height;
  this.generateBoundingBox();
}

BoundingBox.prototype.generateBoundingBox = function() {
  this.x1 = this.position.x - (this.width/2);
  this.x2 = this.position.x + (this.width/2);
  this.y1 = this.position.y + (this.height/2);
  this.y2 = this.position.y - (this.height/2);
}

BoundingBox.prototype.update = function(new_position) {
  this.position = new_position.copy();
  this.generateBoundingBox();
}

BoundingBox.prototype.intersects = function(bounding_box) {
  //X intersects
  if (this.x1 < bounding_box.x2 && this.x2 > bounding_box.x1) {
    //Y intersects
    if (this.y1 < bounding_box.y2 && this.y2 > bounding_box.y1) {
      return true;
    }
  }
  return false;
}

/**
 * MATH CONVERSION FUNCTIONS
 */
function degToRad(angle) {
  return angle * (Math.PI / 180);
}

function radToDeg(angle) {
  return angle * (180 / Math.PI);
}

var roundToPlace = function(value, place) {
  return Math.round(value * Math.pow(10,place)) / Math.pow(10,place);
}

module.exports = {
  getVectorFromDirection: getVectorFromDirection,
  getDirectionFromVector: getDirectionFromVector,
  getMagnitudeFromVector: getMagnitudeFromVector,
  Vector2: Vector2,
  BoundingBox: BoundingBox,
  degToRad: degToRad,
  radToDeg: radToDeg,
  roundToPlace: roundToPlace
}