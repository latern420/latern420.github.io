var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'PlayerCanvasContainer');
var player;
var cursors;

game.backgroundColor = 0xdddddd;
game.state.add("Boot",gameStates.boot);
game.state.add("Loading",gameStates.loading);
game.state.add("Stage1",gameStates.stage1);
game.state.start("Boot");

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

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}