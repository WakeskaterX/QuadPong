//Math Extension

function clamp(value_min, value_max, value) {
  if (value <= value_min) {
    return value_min;
  } else if (value >= value_max) {
    return value_max;
  } else {
    return value;
  }
}

module.exports = {
  clamp: clamp
}