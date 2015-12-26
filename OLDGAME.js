var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'PlayerCanvasContainer', { preload: preload, create: create, update: update });
game.backgroundColor = 0xdddddd;

function preload() {
	game.cache.
    game.load.image('playerStand', 'pic/player/stand.png');
    game.load.image('bg1', 'pic/bg1.png');
    game.load.image('bg2', 'pic/bg2.png');
    game.load.image('ground', 'pic/ground.png');
    game.load.image('credits', 'pic/credits.png');
    game.load.spritesheet('player', 'pic/player/run.png', 135, 150);
    game.load.spritesheet('enemy', 'pic/enemy.png', 135, 150);
    game.load.spritesheet('koster', 'pic/koster.png', 120, 191);
    game.load.image('cutSceneLight1', 'pic/cutsc1/light1.png');
    game.load.image('cutSceneLight2', 'pic/cutsc1/light2.png');
    game.load.image('cutSceneLight3', 'pic/cutsc1/light3.png');
    game.load.image('cutSceneLight', 'pic/cutsc1/light.png');
    game.load.image('black', 'pic/black.png');
    game.load.image('ghost', 'pic/ghost.png');
    game.load.image('mine', 'pic/mine.png');
    game.load.audio('act1_sound', 'music/act1.mp3');
    game.load.audio('act2_sound', 'music/act2.mp3');
    game.load.audio('credits_sound', 'music/credits.mp3');
    game.load.image('minebg1', 'pic/mine/bg1.png');
    game.load.image('minebg2', 'pic/mine/bg2.png');
    game.load.image('minebg3', 'pic/mine/bg3.png');
    game.load.image('minebg4', 'pic/mine/bg4.png');
    game.load.image('final_mine', 'pic/final_mine.png');
    game.load.image('final_light', 'pic/final_light.png');
    game.load.image('kamen', 'pic/kamen.png');
}

var gameStates = {
	stage1: 0,
	stage2: 1,
	stage3 : 2,
	credits: 4,
	menu: 5,
	cutscene1: 6,
	cutscene2: 7
};

var currentState = gameStates.cutscene1;
var levels = {
	cutscene1 : {
		items: {},
		values: {},
	},
	stage1 : {
		items: {},
		values: {},
	},
	stage2 : {
		items: {},
		values: {},
	},
	stage3 : {
		items: {},
		values: {},
	},
	credits : {
		items: {},
		values: {},
	}
};
var player, isJumping, cursors, blackbox, fadeOut, fadeIn, actText, debugText, obstacle, isObstacleVisible = false, act1_soundtrack, act2_soundtrack,
	current_word, current_word_index = 0, solved = false, obstacle_word, credits_soundtrack;
var words = [
	'class',
	'struct',
	'public',
	'private',
	'for',
	'while',
	'char',
	'unsigned',
	'float',
	'namespace',
	'const',
	'typedef',
	'protected'
];

var descriptions = {
	'class': 'Класс - это разновидность абстрактного типа\nданных в программировании.',
	'struct': 'Структура — это , некое объединение различных\nпеременных (даже с разными типами данных).',
	'public': 'Если ключевое слово public располагается перед\nсписком членов класса, оно указывает,\nчто эти члены доступны из любой функции.', 
	'private': 'Если ключевое слово private располагается\n передсписком членов класса, оно указывает,\nчто эти члены недоступны извне.', 
	'for': 'Цикл — многократное прохождение по одному и \nтому же коду программы.',
	'while': 'while - простейший цикл с предусловием.',
	'char': 'char - символьный тип, размером 1 байт',
	'unsigned': 'unsigned - тип, размером 4 байта, \nсодержащий неотрицательное число (без учета знака)',
	'float': 'float - вещественный тип данных \nразмером 4 байта', 
	'namespace': 'Директива `namespace` позволяет \nопределять собственные пространства имён.',
	'const': 'const - константная переменная, для которой\nгарантируется её неизменяемое значение. ',
	'typedef': 'Директива typedef позволяет определить пользовательские типы.', 
	'protected': 'Члены класса, имеющие уровень доступа protected, \nдоступны только экземплярам этого класса и\nэкземплярам наследованных классов. ',
};

function create() {
 	cursors = game.input.keyboard.createCursorKeys();
 	//  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Capture all key presses
    game.input.keyboard.addCallbacks(this, null, null, keyPress);

    var style = { font: "48px Arial", fill: "#ba5252", align: "right" };
    debugText = game.add.text(game.world.width-150, 50, "decoding", style);
    debugText.anchor.set(0.5);
    debugText.text = 'test test test';

	drawCutscene1();

	var offset = 15000;

	pauseAndExecute(2000, function() {
		showDialog("Возвращайся назад", 'right', '#ff9600', 3000);
		pauseAndExecute(4000, function() { 
			showDialog("Ты заплатишь за всё...", 'left', '#fffc00', 3000);
			pauseAndExecute(4000, function() { 
				showDialog("Ты не понимаешь, с какими силами\nиграешь, возвращайся назад", 'right', '#ff9600', 3000);
				pauseAndExecute(4000, function() { 
					showDialog("Я не прощу тебе смерть своей семьи!\nЯ найду тебя!", 'left', '#fffc00', 3000);
				});
			});
		});
    });

	setTimeout(function() {
		fadeOutAnimate();
	}, offset+2000);

	setTimeout(function() {
		clearThingsUp(levels.cutscene1.items);
	}, offset+4000);

	setTimeout(function() {
		fadeInAnimate();
	}, offset+4100);

	setTimeout(function() {
		currentState = gameStates.stage1;
		drawStage1();
	}, offset+4300);
}

function fadeOutAnimate() {
	blackbox = game.add.tileSprite(0, 0, 1200, 600, 'black');
	blackbox.alpha = 0;
	fadeOut = true;
}

function fadeInAnimate() {
	fadeIn = true;
}

function writeActText() {

}

function clearThingsUp(scopeItems) {
	for (var obj in scopeItems) {
		scopeItems[obj].destroy();
	};
}

function pauseAndExecute(time, callback) {
	setTimeout(callback, time);
}

function drawPlayer(x,y) {
	player = game.add.sprite(x, y, 'player');
	
	//  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.0;
    player.body.gravity.y = 900;
	player.anchor.setTo(.5,.5);
    //player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('run', [0,1,2,3,4,5,6,7], 8, true);
    player.animations.add('stand', [8], 15, true);
    player.animations.add('jump', [3], 15, true);
    player.animations.play('stand');
}

function drawcredits() {
    var scopeItems = levels.cutscene1.items;
	scopeItems.bg1 = game.add.tileSprite(0, 0, 1200, 600, 'bg1');
	scopeItems.credits = game.add.sprite(300,700, 'credits');

    credits_soundtrack = game.add.audio('act2_sound');
    game.sound.setDecodedCallback([credits_soundtrack], function() {
    	credits_soundtrack.play();
    }, this);
}

function updateCredits() {
    var scopeItems = levels.cutscene1.items;
	scopeItems['credits'].position.y -= 3;

	if(scopeItems['credits'].position.y < -1500)
		scopeItems['credits'].position.y = 600;
}

function drawCutscene1() {
    var scopeItems = levels.cutscene1.items;
    var scopeValues = levels.cutscene1.values;

    scopeItems.bg1 = game.add.tileSprite(0, 0, 1200, 600, 'bg1');
    scopeItems.bg2 = game.add.tileSprite(0, 0, 1200, 600, 'bg2');
	scopeItems.koster = game.add.sprite(520, 312, 'koster');
	scopeItems.koster.animations.add('fire', [0,1,2,3,4], 15, true);
	scopeItems.koster.animations.play('fire');

	drawPlayer(350, 375);

	scopeItems.evilGuy = game.add.sprite(800, 375, 'enemy');
	//  We need to enable physics on the player
    game.physics.arcade.enable(scopeItems.evilGuy);

    //  Player physics properties. Give the little guy a slight bounce.
    scopeItems.evilGuy.body.bounce.y = 0.2;
    scopeItems.evilGuy.body.gravity.y = 900;
    //player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    scopeItems.evilGuy.animations.add('run', [0,1,2,3,4,5,6,7], 15, true);
    scopeItems.evilGuy.animations.add('stand', [8], 15, true);
    scopeItems.evilGuy.animations.play('stand');
	scopeItems.evilGuy.anchor.setTo(.5,.5);
    scopeItems.evilGuy.scale.x = Math.abs(player.scale.x) * -1;

    scopeItems.light = game.add.sprite(game.world.width/2, 480, 'cutSceneLight');
	scopeItems.light.anchor.setTo(0.5,0.8);

	scopeItems.platforms = game.add.group();
    //  We will enable physics for any object that is created in this group
    scopeItems.platforms.enableBody = true;

    var gshift = 0;
    for (var i = 0; i < 6; i++) {
    	var ledge = scopeItems.platforms.create(gshift, 450, 'ground');
    	ledge.body.immovable = true;
    	gshift += ledge.width;
    }

    scopeValues.updatesDone = 0;
}

function updateCutscene1() { 
    var scopeItems = levels.cutscene1.items;
    var scopeValues = levels.cutscene1.values;
    game.physics.arcade.collide(player, scopeItems.platforms);
    game.physics.arcade.collide(scopeItems.evilGuy, scopeItems.platforms);

    if(scopeValues.updatesDone % 2 == 0) {
    	// var ind = scopeItems.lightState;
	    // var switches = scopeItems.lightStates[ind];
	    // scopeItems.light1.visible = switches[0]
	    // scopeItems.light2.visible = switches[1];
	    // scopeItems.light3.visible = switches[2];
	    // scopeItems.lightState = (ind + 1) % 4;
	    // scopeItems.updatesDone = 0;
	    if(scopeItems.light.scale.x <= 1.2) {
	    	scopeValues.lightEnlarges = true;
	    }
	    if(scopeItems.light.scale.x >= 1.7) {
	    	scopeValues.lightEnlarges = false;
	    	sleep(100);
	    }

	    if(scopeValues.lightEnlarges) {
	    	scopeItems.light.scale.x += 0.025;
	    	scopeItems.light.scale.y += 0.025;
	    } else {
			scopeItems.light.scale.x -= 0.025;
	    	scopeItems.light.scale.y -= 0.025;
	    }
	    if(scopeValues.updatesDone > 60)
	    	scopeValues.updatesDone = 0;

    }
    scopeValues.updatesDone++;
	player.bringToTop();
}

function animatePlayer(pl, direction) {
	if(direction === 'left') {
		player.animations.play('run');
        player.scale.x = Math.abs(player.scale.x) * -1;
	} else if(direction === 'right') {
		player.animations.play('run');
        player.scale.x = Math.abs(player.scale.x);
	} else if(direction === 'stand') {
        player.animations.play('stand');
	} else if(direction == 'jump') {
        player.animations.play('jump');
	}
}

function drawStage1() {
    var scopeItems = levels.stage1.items;
    var scopeValues = levels.stage1.values;

    act1_soundtrack = game.add.audio('act1_sound');
    game.sound.setDecodedCallback([act1_soundtrack], function() {
    	act1_soundtrack.play();
    }, this);

    //  A simple background for our game
    scopeItems.bg1 = game.add.tileSprite(0, 0, 1200, 600, 'bg1');
    scopeItems.bg2 = game.add.tileSprite(0, 0, 1200, 600, 'bg2');

	drawPlayer(160,340);

	scopeValues.passedMeters = 0;
	scopeValues.passedObstacles = 0;
	scopeValues.totalObstacles = 4;
	scopeValues.ending = false;
	scopeValues.uncycle = false;

    //  The platforms group contains the ground and the 2 ledges we can jump on
    scopeItems.platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    scopeItems.platforms.enableBody = true;

    var gshift = 0
    for (var i = 0; i < 6; i++) {
    	var ledge = scopeItems.platforms.create(gshift, 450, 'ground');
    	ledge.body.immovable = true;
    	gshift += ledge.width;
    };
}

function updateStage1() {
    var scopeItems = levels.stage1.items;
    var scopeValues = levels.stage1.values;

	//  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, scopeItems.platforms);

    if(scopeValues.ending && player.position.x >= game.world.width+4) {
	    if(!scopeValues.uncycle) {
	    	setTimeout(function() {
	    		act1_soundtrack.fadeOut(1000);
				fadeOutAnimate();
			}, 2000);

			setTimeout(function() {
				clearThingsUp(levels.stage1.items);
			}, 4000);

			setTimeout(function() {
				fadeInAnimate();
			}, 4100);

			setTimeout(function() {
				currentState = gameStates.stage2;
				drawStage2();
			}, 4300);
			scopeValues.uncycle = true;
	    }
    }

    if (cursors.left.isDown)
    {
        //  Move to the left
        //player.body.velocity.x = -200;
        animatePlayer(player, 'left');

        if(player.position.x >= 5)
        {
        	//scopeItems.bg1.tilePosition.x += 0.3;
        	//scopeItems.bg2.tilePosition.x += 0.8;
        	player.position.x -= 4;

        	scopeValues.passedMeters -= 1;
    	}
    }
    else if (cursors.right.isDown)
    {
        animatePlayer(player, 'right');
    	if(!scopeValues.ending) {
	    	//  Move to the right
	        //player.body.velocity.x = 200;
	        animatePlayer(player, 'right');

	        var obstacle_stuck = (isObstacleVisible 
	        	&& obstacle.position.x >= player.position.x + player.width 
	        	&& obstacle.position.x <= player.position.x + player.width + 4 
	        	&& obstacle.position.y > 0);
	        
	        var dbgObsX;
	        if(isObstacleVisible)
	        	dbgObsX = obstacle.position.x;
	        else
	        	dbgObsX = '???';
			//console.log(dbgObsX + ' ' + (player.position.x + player.width + ', bool is ' + obstacle_stuck));

	        if(!obstacle_stuck) {
	        	if(player.position.x >= game.world.centerX) {
	        	
	    			scopeItems.bg1.tilePosition.x -= 0.3;
	    			scopeItems.bg2.tilePosition.x -= 0.8;

	    			if(isObstacleVisible) {
	    				obstacle.position.x -= 4;
	    			}

	        	} else {
		        	player.position.x += 4;
	        	}    
				scopeValues.passedMeters += 1;
	        }
    	} else {
    		player.position.x += 4;
    	}
    }
    else
    {
        //  Stand still
        animatePlayer(player, 'stand');
    }

    if(isJumping && player.body.touching.down)
    	isJumping = false;

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
    	if(!isJumping) {
    		//jumpSound();
    	}
    	isJumping = true;
        player.body.velocity.y = -500;
    }

    if(isJumping) {
    	animatePlayer(player, 'jump');
    }
	
	var neededMetersCount = 500;
    if(scopeValues.passedMeters > scopeValues.passedObstacles * neededMetersCount && scopeValues.passedMeters % neededMetersCount === 0) {

		if(scopeValues.passedObstacles < scopeValues.totalObstacles) {
	    	scopeValues.passedObstacles++;
	    	solved = false;
	    	current_word_index = 0;
	    	var i = getRandomInt(0, words.length-1);
	    	current_word = words[i];
	    	words.splice(i, 1);
	    	obstacle = game.add.sprite(game.world.width+50, 50, 'ghost');
	    	var style = { font: "48px Arial", fill: "#4444ff", align: "left" };
	    	obstacle_word = game.add.text(500, 300, current_word, style);
	    	
			game.physics.enable(obstacle, Phaser.Physics.ARCADE);
	   		obstacle.enableBody = true;
			isObstacleVisible = true;
	    	obstacle.body.bounce.y = 0.1;
	    	obstacle.body.gravity.y = 1000;

	    } else {
			// ЗАВРЕШЕНИЕ ПЕРВОГО АКТА
			scopeItems.mine = game.add.sprite(game.world.width-70, 250, 'mine');
			scopeValues.ending = true; 
		}
	} 

    if(solved && isObstacleVisible) {
    	obstacle.body.gravity.y = 0;
    	obstacle.position.y -= 2;

    	if(obstacle.position.y < -500) {
    		isObstacleVisible = false;
    		obstacle.destroy();
    		obstacle_word.destroy();
    	}
    }

    if(isObstacleVisible) {
    	game.physics.arcade.collide(player, obstacle);
    	game.physics.arcade.collide(obstacle, scopeItems.platforms);

		obstacle_word.position.x = obstacle.position.x + obstacle.width/2;
    	obstacle_word.position.y = obstacle.position.y - 40;
    }


    debugText.text = scopeValues.passedMeters.toString();
}

function update() {
	var updateFuncs = [];
	updateFuncs[gameStates.cutscene1] = updateCutscene1;
	updateFuncs[gameStates.stage1] = updateStage1;
	updateFuncs[gameStates.stage2] = updateStage2;
	updateFuncs[gameStates.stage3] = updateStage3;
	updateFuncs[gameStates.credits] = updateCredits;

	var updFunc = updateFuncs[currentState];
	updFunc();

    if(fadeOut) {
    	blackbox.alpha += 0.01;
    	blackbox.bringToTop();
    	if(blackbox.alpha >= 1) {
    		fadeOut = false;
    	}
    }
    if(fadeIn) {
    	blackbox.alpha -= 0.01;
    	blackbox.bringToTop();
    	if(blackbox.alpha <= 0) {
    		fadeIn = false;
    		blackbox.destroy();
    	}
    }

    //debugText.bringToTop();
}

function drawStage2() {
    var scopeItems = levels.stage2.items;
    var scopeValues = levels.stage2.values;

    act2_soundtrack = game.add.audio('act2_sound');
    game.sound.setDecodedCallback([act2_soundtrack], function() {
    	act2_soundtrack.play();
    }, this);

    scopeItems.bg1 = game.add.tileSprite(0, 0, 1200, 600, 'minebg1');
    scopeItems.bg2 = game.add.tileSprite(0, 0, 1200, 600, 'minebg2');
    scopeItems.bg3 = game.add.tileSprite(0, 0, 1200, 600, 'minebg3');
    scopeItems.bg4 = game.add.tileSprite(0, 0, 1200, 600, 'minebg4');

    drawPlayer(20, 200);

	scopeValues.passedMeters = 0;
	scopeValues.passedObstacles = 0;
	scopeValues.totalObstacles = 4;
	scopeValues.ending = false;
	scopeValues.uncycle = false;

    scopeItems.platforms = game.add.group();
    scopeItems.platforms.enableBody = true;
    var gshift = 0
    for (var i = 0; i < 6; i++) {
    	var ledge = scopeItems.platforms.create(gshift, 360, 'ground');
    	ledge.body.immovable = true;
    	gshift += ledge.width;
    };
}


function updateStage2() {
    var scopeItems = levels.stage2.items;
    var scopeValues = levels.stage2.values;

    game.physics.arcade.collide(player, scopeItems.platforms);

    if(scopeValues.ending && player.position.x >= game.world.width) {
	    if(!scopeValues.uncycle) {
	    	setTimeout(function() {
	    		act2_soundtrack.fadeOut(1000);
				fadeOutAnimate();
			}, 500);

			setTimeout(function() {
				clearThingsUp(levels.stage2.items);
			}, 1500);

			setTimeout(function() {
				fadeInAnimate();
			}, 1700);

			setTimeout(function() {
				currentState = gameStates.stage3;
				drawStage3();
			}, 2500);
			scopeValues.uncycle = true;
	    }
    }

    if (cursors.left.isDown)
    {
        animatePlayer(player, 'left');
        if(player.position.x >= 5)
        {
        	player.position.x -= 3;
        	scopeValues.passedMeters -= 1;
    	}
    }
    else if (cursors.right.isDown)
    {
        animatePlayer(player, 'right');
    	if(!scopeValues.ending) {
	        animatePlayer(player, 'right');
	        var obstacle_stuck = (isObstacleVisible 
	        	&& obstacle.position.x >= player.position.x + player.width 
	        	&& obstacle.position.x <= player.position.x + player.width + 3 
	        	&& obstacle.position.y > 0);

	        if(!obstacle_stuck) {
	        	if(player.position.x >= game.world.centerX) {
	        	
	    			scopeItems.bg1.tilePosition.x -= 0.3;
	    			scopeItems.bg2.tilePosition.x -= 0.5;
	    			scopeItems.bg3.tilePosition.x -= 0.8;
	    			scopeItems.bg4.tilePosition.x -= 3.0;

	    			if(isObstacleVisible) {
	    				obstacle.position.x -= 3;
	    			}
	        	} else {
		        	player.position.x += 3;
	        	}    
				scopeValues.passedMeters += 1;
	        }
    	} else {
    		player.position.x += 3;
    	}
    } else {
        animatePlayer(player, 'stand');
    }

    if(isJumping && player.body.touching.down)
    	isJumping = false;

    if (cursors.up.isDown && player.body.touching.down) {
    	if(!isJumping) {
    		//jumpSound();
    	}
    	isJumping = true;
        player.body.velocity.y = -500;
    }
    if(isJumping) {
    	animatePlayer(player, 'jump');
    }

    var neededMetersCount = 500;
    if(scopeValues.passedMeters > scopeValues.passedObstacles * neededMetersCount && scopeValues.passedMeters % neededMetersCount === 0) {

		if(scopeValues.passedObstacles < scopeValues.totalObstacles) {
	    	scopeValues.passedObstacles++;
	    	solved = false;
	    	current_word_index = 0;
	    	current_word = words[getRandomInt(0, words.length-1)];
	    	obstacle = game.add.sprite(game.world.width+50, 50, 'ghost');
	    	var style = { font: "48px Arial", fill: "#ffffff", align: "left" };
	    	obstacle_word = game.add.text(500, 300, current_word, style);
	    	
			game.physics.enable(obstacle, Phaser.Physics.ARCADE);
	   		obstacle.enableBody = true;
			isObstacleVisible = true;
	    	obstacle.body.bounce.y = 0.1;
	    	obstacle.body.gravity.y = 1000;
	    } else {
			scopeItems.mine = game.add.sprite(game.world.width-70, 200, 'mine');
			scopeValues.ending = true;
		}
	} 

    if(solved && isObstacleVisible) {
    	obstacle.body.gravity.y = 0;
    	obstacle.position.y -= 2;

    	if(obstacle.position.y < -500) {
    		isObstacleVisible = false;
    		obstacle.destroy();
    		obstacle_word.destroy();
    	}
    }

    if(isObstacleVisible) {
    	game.physics.arcade.collide(player, obstacle);
    	game.physics.arcade.collide(obstacle, scopeItems.platforms);

		obstacle_word.position.x = obstacle.position.x + obstacle.width/2;
    	obstacle_word.position.y = obstacle.position.y + 100;
    }

    //scopeItems.bg4.bringToTop();
    obstacle_word.bringToTop();
}

function drawStage3() {
    var scopeItems = levels.stage3.items;
    var scopeValues = levels.stage3.values;

    scopeItems.bg1 = game.add.tileSprite(0, 0, 1200, 600, 'final_mine');
    scopeItems.bg2 = game.add.tileSprite(0, 0, 1200, 600, 'final_light');

    scopeItems.kamen = game.add.sprite(726, 40, 'kamen');

    drawPlayer(230, 350);

	scopeValues.passedMeters = 0;
	scopeValues.passedObstacles = 0;
	scopeValues.totalObstacles = 1;
	scopeValues.ending = false;
	scopeValues.uncycle = false;
	scopeValues.jumpsLeft = 3;
	scopeValues.shakesdone = 0;
	scopeValues.shakes = [0, 1, 2, 3, 2, 1, 0, -1, -2, -3, -2, -1];


    scopeItems.platforms = game.add.group();
    scopeItems.platforms.enableBody = true;
    var gshift = 0;
    for (var i = 0; i < 6; i++) {
    	var ledge = scopeItems.platforms.create(gshift, 450, 'ground');
    	ledge.body.immovable = true;
    	gshift += ledge.width;
    };

    scopeItems.evilGuy = game.add.sprite(800, 320, 'enemy');
	//  We need to enable physics on the player
    game.physics.arcade.enable(scopeItems.evilGuy);

    //  Player physics properties. Give the little guy a slight bounce.
    scopeItems.evilGuy.body.bounce.y = 0.2;
    scopeItems.evilGuy.body.gravity.y = 900;
    //player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    scopeItems.evilGuy.animations.add('run', [0,1,2,3,4,5,6,7], 15, true);
    scopeItems.evilGuy.animations.add('stand', [8], 15, true);
    scopeItems.evilGuy.animations.play('stand');
	scopeItems.evilGuy.anchor.setTo(.5,.5);
    scopeItems.evilGuy.scale.x = Math.abs(player.scale.x) * -1;

    pauseAndExecute(3000, function() {
		showDialog("Ну, что будешь делать теперь?.", 'left', '#fffc00', 4000);
		pauseAndExecute(6000, function() { 
			showDialog("Ты совершаешь большую ошибку..", 'right', '#ff9600', 4000)
			pauseAndExecute(6000, function() { 
				showDialog("Ты поплатишься за всё!", 'left', '#fffc00', 4000);
				pauseAndExecute(6000, function() { 
					showDialog("Попробуй меня достать.", 'right', '#ff9600', 4000);
				});
			});
		});
    });
}

function updateStage3() {
    var scopeItems = levels.stage3.items;
    var scopeValues = levels.stage3.values;

    

    game.physics.arcade.collide(player, scopeItems.platforms);
    game.physics.arcade.collide(scopeItems.evilGuy, scopeItems.platforms);

    if(scopeValues.jumpsLeft <= 0)
    {
    	if(!scopeValues.uncycle) {
    		setTimeout(function() {
    			scopeItems.evilGuy.visible = false;
    		}, 500);
    		game.add.tween(scopeItems.kamen).to({ y: scopeItems.evilGuy.position.y }, 400, Phaser.Easing.Linear.None, true);
    		setTimeout(function() {
	    		setTimeout(function() {
					fadeOutAnimate();
				}, 200);

				setTimeout(function() {
					clearThingsUp(levels.stage3.items);
				}, 700);

				setTimeout(function() {
					//fadeInAnimate();
				}, 1600);

				setTimeout(function() {
					currentState = gameStates.credits;
					//drawcredits();
				}, 2000);
				scopeValues.uncycle = true;
    		}, 900);
    	}
    }

    if (cursors.left.isDown)
    {
        animatePlayer(player, 'left');
        if(player.position.x >= 5) {
        	player.position.x -= 4;
    	}
    }
    else if (cursors.right.isDown)
    {
        animatePlayer(player, 'right');
	        
    	if(player.position.x <= game.world.centerX) {
        	player.position.x += 4;
    	}    
		scopeValues.passedMeters += 1;
    } else {
        animatePlayer(player, 'stand');
    }

    if(isJumping && player.body.touching.down)
    	isJumping = false;

    if (cursors.up.isDown && player.body.touching.down) {
    	if(!isJumping) {
    		//jumpSound();
    	}
    	isJumping = true;
        player.body.velocity.y = -500;
        scopeValues.jumpsLeft--;
    }
    if(isJumping) {
    	animatePlayer(player, 'jump');
    }
}


function keyPress(char) {
	debugText.text = char;
	if(isObstacleVisible) {
		if(char === current_word[current_word_index]) {
			current_word_index++;
			obstacle_word.clearColors();
			//obstacle_word.addStrokeColor(0x44ff44, 0);
			obstacle_word.addColor(0xff4444, current_word_index+1);
		}
		else {
			current_word_index = 0;
		}

		if(current_word_index === current_word.length) {
			solved = true;
			showDialog(descriptions[current_word], 'left', '#ffffff', 6000);
		}
	}
}

function showDialog(text, position, color, time_out) {
	var txt;
	if(position === 'left') {
		var style = { font: "36px Arial", fill: color, align: "left" };
	    txt = game.add.text(200, 490, text, style);
	    txt.anchor.set(0.1);
	} else if(position === 'right') {
		var style = { font: "36px Arial", fill: color, align: "right" };
	    txt = game.add.text(game.world.width-200, 490, text, style);
	    txt.anchor.set(0.9);
	}
	txt.bringToTop();
	setTimeout(function() { 
		txt.destroy(); 
	}, time_out);
}

function jumpSound() {
	soundEffect(
    523.25,       //frequency
    0.05,         //attack
    0.2,          //decay
    "sine",       //waveform
    0.8,            //volume
    0.8,          //pan
    0,            //wait before playing
    600,          //pitch bend amount
    true,         //reverse
    100,          //random pitch range
    0,            //dissonance
    undefined,    //echo: [delay, feedback, filter]
    undefined     //reverb: [duration, decay, reverse?]
    );
}

function getRandomInt(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
}