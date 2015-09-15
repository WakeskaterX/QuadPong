require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/app/lib/math_extension.js":[function(require,module,exports){
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
},{}]},{},[]);
