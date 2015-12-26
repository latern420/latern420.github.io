var gameStates = {
    boot: function(game) { },
    loading: function(game) { },
    stage1: function(game) { }
}

// *************
// Booting State

gameStates.boot.prototype = {
    preload: function() {
        this.game.load.image('loading', 'images/build/loading.png');
        this.game.load.image('loadingBg', 'images/build/loadingBg.png');
    },

    create: function() {
        // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.pageAlignHorizontally = true;
        // this.scale.setScreenSize();
        this.game.state.start("Loading");
    }
}

// *************
// Loading State

gameStates.loading.prototype = {
	preload: function() {
        this.game.load.image('grass', 'images/build/grass2.png');
        this.game.load.image('player', 'images/build/player.png');
        this.game.load.audio('music', 'sounds/music.ogg');
        console.log('preload music started');
	},

    create: function() {
        bg = game.add.tileSprite(0, 0, 1200, 600, 'loadingBg');
        var splash = game.add.sprite(600, 300, 'loading');
        splash.anchor.setTo(0.5, 0.5);
        this.game.add.tween(splash.scale).to( { x: 1.1, y: 1.2 }, 230, "Sine.easeInOut", true, 0, -1, true);
        timeToLoad = new Date(Date.now() + 5000);
    },

    update: function() {
        bg.tilePosition.x -= 12;

        if(this.game.load.hasLoaded && !this.flagMusicStarted && Date.now() > timeToLoad.getTime()) {
    		console.log('music loaded');
            var music = this.game.add.audio('music', 1, true);
            music.play();
            flagMusicStarted = true;
            this.game.state.start("Stage1");
            console.log('loading stage destroyed');
        }
    },

    bg: {},
    flagMusicStarted: false,
    timeToLoad: {}
}

// **********
// Game State

gameStates.stage1.prototype = {
    create: function() {
        console.log('stage 1 created');
        cursors = this.game.input.keyboard.addKeys({ 
            'up': Phaser.KeyCode.W, 
            'down': Phaser.KeyCode.S, 
            'left': Phaser.KeyCode.A, 
            'right': Phaser.KeyCode.D 
        });
        //  Capture all key presses
        this.game.input.keyboard.addCallbacks(this, null, null, keyPress);


        //  A simple background for our game
        this.game.add.tileSprite(0, 0, 1200, 600, 'grass');

        player = this.game.add.sprite(200, 350, 'player');
    },

    update: function() {
        if (cursors.left.isDown)
            player.position.x -= 4;
        else if (cursors.right.isDown)
            player.position.x += 4;
        if (cursors.up.isDown)
            player.position.y -= 4;
        else if (cursors.down.isDown)
            player.position.y += 4;
    }
}