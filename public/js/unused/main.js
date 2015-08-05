var game;

game = new Phaser.Game(600,600,Phaser.AUTO,'');

game.state.add('Menu', Menu);
game.state.add('Game', Game);

game.state.start('Game');