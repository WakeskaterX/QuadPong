//Physics Library for computing various things with vectors and bounding boxes

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

/**
 * getDirectionFromVector - Returns a direction given a Vector2
 * @param {Vector2} vector2
 * @returns {number} direction
 */
var getDirectionFromVector = function(vector2) {
  return roundToPlace(degreeAdjuster(Math.abs(radToDeg(Math.atan(vector2.y/vector2.x))), vector2.x, vector2.y), 0);
}

/**
 * Degree Adjuster working with the four quadrants
 * @param {number} deg
 * @param {number} x
 * @param {number} y
 * @returns {number} adjusted_degree
 */
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

/**
 * Given a vector returns a magnitude
 * @param {Vector2} vector2
 * @returns {number} magnitude
 */
var getMagnitudeFromVector = function(vector2) {
  return roundToPlace(Math.sqrt(Math.pow(vector2.x,2) + Math.pow(vector2.y, 2)),2);
}

/**
 * VECTOR 2
 * @param {number} x
 * @param {number} y
 */
function Vector2(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.prototype.constructor = Vector2;

/**
 * Multiplies the vector by a scalar amount
 * @param {number} multiplier
 * @returns {this}
 */
Vector2.prototype.scalarMultiply = function(multiplier) {
  this.x *= multiplier;
  this.y *= multiplier;
  return this;
}

/**
 * Takes this vector and returns a NEW Vector scaled to the multiplier
 * @param {number} multiplier
 * @returns {Vector2} scaled_vector
 */
Vector2.prototype.scaleTo = function(multiplier) {
  return new Vector2(this.x * multiplier, this.y * multiplier);
}

/**
 * MultiplyMask - used for flattening vectors to a masked value
 * vector x *= vector2.x - used for masks (vector2: {0,1})
 * @param {Vector2} vector2;
 * @returns {this}
 */
Vector2.prototype.multiplyMask = function(vector2) {
  this.x *= vector2.x;
  this.y *= vector2.y;
  return this;
}

/**
 * Inverts a vector
 * @returns {this}
 */
Vector2.prototype.flip = function() {
  this.x *= -1;
  this.y *= -1;
  return this;
}

/**
 * Adds a vector to the current vector
 * @param {Vector2} vector2
 * @returns {this}
 */
Vector2.prototype.add = function(vector2) {
  this.x += vector2.x;
  this.y += vector2.y;
  return this;
}

/**
 * Subtracts a vector from the current vector
 * @param {Vector2} vector2
 * @returns {this}
 */
Vector2.prototype.subtract = function(vector2) {
  this.x -= vector2.x;
  this.y -= vector2.y;
  return this;
}

/**
 * Checks if a vector is equal to this vector
 * @param {Vector2} vector2
 * @returns {this}
 */
Vector2.prototype.equals = function(vector2) {
  return this.x === vector2.x && this.y === vector2.y;
}

/**
 * Calls Math.abs on each component of the vector
 * @returns {this}
 */
Vector2.prototype.absoluteValue = function() {
  this.x = Math.abs(this.x);
  this.y = Math.abs(this.y);
  return this;
}

/**
 * Normalizes a vector down to a unit vector
 * @returns {this}
 */
Vector2.prototype.normalize = function() {
  this.x = roundToPlace(this.x / this.getMagnitude(), 2);
  this.y = roundToPlace(this.y / this.getMagnitude(), 2);
  return this;
}

/**
 * Clones the current vector so we don't mutate it
 * @returns {Vector2}
 */
Vector2.prototype.copy = function() {
  return new Vector2(this.x, this.y);
}

/**
 * Gets the magnitude from the current vector
 * @returns {number} magnitude
 */
Vector2.prototype.getMagnitude = function() {
  return getMagnitudeFromVector(this);
}

/**
 * Gets the direction of the current vector
 * @returns {number} direction
 */
Vector2.prototype.getDirection = function() {
  return getDirectionFromVector(this);
}

/**
 * Sets the magnitude of the current vector
 * @param {number} magnitude
 * @returns {this}
 */
Vector2.prototype.setMagnitude = function(magnitude) {
  var temp_vector = getVectorFromDirection(this.getDirection(), magnitude);
  this.x = temp_vector.x;
  this.y = temp_vector.y;
  return this;
}

/**
 * Sets the direction of the current vector
 * @param {number} direction
 * @returns {this}
 */
Vector2.prototype.setDirection = function(direction) {
  var temp_vector = getVectorFromDirection(direction, this.getMagnitude());
  this.x = temp_vector.x;
  this.y = temp_vector.y;
  return this;
}

/**
 * Rotates the current Vector a number of degrees counter clockwise and returns a NEW Vector
 * @param {number} degrees
 * @returns {Vector2}
 */
Vector2.prototype.rotateDegrees = function(degrees) {
  var dir = getDirectionFromVector(this);
  var mag = getMagnitudeFromVector(this);
  return getVectorFromDirection(dir+degrees, mag);
}

/**
 * Reflects the current vector around a normal vector
 * @param {Vector2} normal vector
 * @returns {this}
 */
Vector2.prototype.reflect = function(normal_vector) {
  var x_val = normal_vector.x < 0 ? normal_vector.x : -normal_vector.x;
  var y_val = normal_vector.y < 0 ? normal_vector.y : -normal_vector.y;
  if (x_val) {
    this.x *= x_val;
  }
  if (y_val) {
    this.y *=  y_val;
  }
  return this;
}

/**
 * Shows the vector as a string
 * @returns {string}
 */
Vector2.prototype.toString = function() {
  return "{x: "+this.x+", y: "+this.y+"}";
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

/**
 * Generates the bounding box coordinates from the position, width and height
 */
BoundingBox.prototype.generateBoundingBox = function() {
  this.x1 = this.position.x - (this.width/2);
  this.x2 = this.position.x + (this.width/2);
  this.y1 = this.position.y + (this.height/2);
  this.y2 = this.position.y - (this.height/2);
}

/**
 * Updates the bounding box with a new position
 * @param {Vector2} position
 */
BoundingBox.prototype.update = function(new_position) {
  this.position = new_position.copy();
  this.generateBoundingBox();
}

/**
 * Determines if the bounding box intersects another bounding box
 * @param {BoundingBox} bounding_box
 * @returns {bool}
 */
BoundingBox.prototype.intersects = function(bounding_box) {
  //X intersects
  if (this.x1 < bounding_box.x2 && this.x2 > bounding_box.x1) {
    //Y intersects
    if (this.y1 > bounding_box.y2 && this.y2 < bounding_box.y1) {
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

/**
 * Math Helper - rounds to a specific decimal place
 */
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