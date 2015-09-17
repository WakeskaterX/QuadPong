//Helper Functions
var id_length = 12;
var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * createPlayerID - creates an id
 * @param {String[]} existing_ids - an array of IDs that are already in use
 */
function createPlayerID (existing_ids) {
  var id = "";
  for (var i = 0; i < id_length; i++) {
    id += chars[(Math.floor(Math.random() * 36))];
  }

  if (existing_ids && existing_ids.indexOf(id) !== -1) {
    return createPlayerID(existing_ids);
  } else {
    return id;
  }
}

/**
 * Creates a game ID to use
 */
function createGameID () {
  return "game"+(+Date.now());
}

/**
 * Creates a computer ID
 */
function createComputerID () {
  return "comp"+(+Date.now());
}

module.exports = {
  'createPlayerID': createPlayerID,
  'createGameID': createGameID,
  'createComputerID': createComputerID
}