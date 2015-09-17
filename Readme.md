#Quad Pong

###Description:

QuadPong is a four player online pong game, played out on the server & rendered on the client.  The purpose of the project is to practice server side architecture, client synchronization, physics and vector mathematics by making a simple multiplayer game with rooms, etc.

Multiplayer has just been added and is still in testing.

###Run the Game:

**Prerequisites:**

* NodeJS

* NPM

**To Play:**

1. Pull the Git Repository down to your server or computer

2. Change directory to the new repository: `cd QuadPong/`

3. Run: `npm install`

4. Run: `npm start` or `node server.js`

5. Navigate in your browser to: `http://localhost:3000` to play the game!

*Notes*:

Also, you can edit the game settings in app/config/settings.json to fiddle around with the gameplay.  It'll change on the client side too.

####Updates:

* 09-15-2015:  Initial Multiplayer Functionality is now added!  You can test this by creating a game on one browser and creating a game and opening another browser and joining a game.


**Open Source Libraries Used:**

A list of open source libraries included in this project, all other code is my own:

* [JQuery](https://github.com/jquery/jquery)

* [Hi Def Canvas Code](http://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas)

* [Keypress](http://dmauro.github.io/Keypress/)