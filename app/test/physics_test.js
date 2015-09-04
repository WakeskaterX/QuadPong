//Mocha Tests
var Physics = require('../lib/physics.js');

var assert = require("assert"),
  should = require("should");

describe('Physics Unit Tests', function() {
  //Declare a bunch of vectors for testing
  var right_unit_vector = new Physics.Vector2(1,0);
  var left_unit_vector = new Physics.Vector2(-1,0);
  var up_unit_vector = new Physics.Vector2(0,1);
  var down_unit_vector = new Physics.Vector2(0,-1);

  var angle_vector = new Physics.Vector2(3,3);

  it('creates a Vector2 Object when instantiated', function(done) {
    assert(right_unit_vector.x === 1);
    assert(right_unit_vector.y === 0);
    assert(right_unit_vector instanceof Physics.Vector2);
    assert(angle_vector.x === 3);
    done();
  });

  it('provides functions for magnitude and direction', function(done) {
    assert(right_unit_vector.getMagnitude() === 1);
    assert(right_unit_vector.getDirection() === 0);
    assert(left_unit_vector.getDirection() === 180);
    assert(up_unit_vector.getDirection() === 90);
    assert(down_unit_vector.getMagnitude() === 1);
    done();
  });

  it('creates a non-referenced copy with the copy command', function(done) {
    var new_right_vector = right_unit_vector.copy();
    assert(new_right_vector.equals(right_unit_vector));
    new_right_vector.x = 5;
    assert(!new_right_vector.equals(right_unit_vector));
    done();
  });

  it('should have add and subtract functions for vectors', function(done) {
    var vector_copy = right_unit_vector.copy();
    vector_copy.add(new Physics.Vector2(3,4));
    assert(vector_copy.x === 4);
    assert(vector_copy.y === 4);
    vector_copy.subtract(new Physics.Vector2(1,2));
    assert(vector_copy.x === 3);
    assert(vector_copy.y === 2);
    done();
  });

  it('should allow you to scalar multiply a vector', function(done) {
    var vector_copy = left_unit_vector.copy();
    vector_copy.scalarMultiply(2);
    assert(vector_copy.x === -2);
    assert(vector_copy.y === 0);
    done();
  });
});