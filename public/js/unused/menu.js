var Menu = {
  preload: function(){
    this.load.image("join_game","http://ivdfc.org/yahoo_site_admin/assets/images/Red_Button.279212905_std.jpg");
  },
  create: function(){
    this.add.button(0,0,"join_game",this.startGame, this);
  },
  startGame: function(){
    this.state.start('Game');
  }
};