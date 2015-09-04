//Math Extension
module.exports = extend_math();

function extend_math(){
  //Modify the Math class
  Math.clamp = function(value_min, value_max, value) {
    if (value <= value_min) {
      return value_min;
    } else if (value >= value_max) {
      return value_max;
    } else {
      return value;
    }
  }
}