var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var PASSAGE = 'PASSAGE';
var GLUE = '💩'

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;
var gBallInterval;
var gGlueInterval;
var gCollectedBallCount;
var gBallsNum;
var gGluePos;
var gGluePrevElElement;
var gGluePrevElement;
var gIsGlued;;

function initGame() {

	gCollectedBallCount = 0;
	gBallsNum = 2
	gIsGlued = false;
	gGluePos = { i: 0, j: 0 };
	gGamerPos = { i: 2, j: 9 };

	document.querySelector(".balls-count").innerText = gCollectedBallCount;
	document.querySelector('.balls-num').innerText = gBallsNum;

	gBoard = buildBoard();
	renderBoard(gBoard);

	gBallInterval = setInterval(addBall, 2500);
	gGlueInterval = setInterval(addGlue, 5000)


}
function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	board[0][5].type = board[9][5].type =
		board[5][0].type = board[5][11].type = PASSAGE;

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}
// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === PASSAGE) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}
// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGlued) return;
	var isPassage = false;
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;
	if (targetCell.type === PASSAGE) isPassage = true;
	// Calculate distance to make sure we are moving to a neighbor cell
	else {
		var iAbsDiff = Math.abs(i - gGamerPos.i);
		var jAbsDiff = Math.abs(j - gGamerPos.j);
	}
	// If the clicked Cell is a passage or one of the four allowed- make a move!
	if (isPassage || (iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			var collectingSound = new Audio('sound/collecting.wav');
			collectingSound.play();

			console.log('Collecting!');
			gCollectedBallCount++;
			gBallsNum--;
			document.querySelector(".balls-count").innerText = gCollectedBallCount;
			document.querySelector('.balls-num').innerText = gBallsNum;
		}

		//If collected all balls- game over
		if (gBallsNum === 0) {
			clearInterval(gBallInterval);
			clearInterval(gGlueInterval);
			var winningSound = new Audio('sound/winning.wav');
			winningSound.play();
			openModal();
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:

		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
		if (gGamerPos.i === gGluePos.i && gGamerPos.j === gGluePos.j) {
			gIsGlued = true;
			console.log('gIsGlued', gIsGlued)
			setTimeout(function () { gIsGlued = false }, 3000);
		}

	}
}
// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}
// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			if (i === 5 && j === 0) {
				moveTo(5, 11);
				return;
			}
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (i === 5 && j === 11) {
				moveTo(5, 0);
				return;
			}
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0 && j === 5) {
				moveTo(9, 5);
				return;
			}
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === 9 && j === 5) {
				moveTo(0, 5);
				return;
			}
			moveTo(i + 1, j);
			break;

	}

}
// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}
//add ball in random empty cell
function addBall() {
	var emptyCells = getEmptyCells();
	var randomIdx = getRandomInt(0, emptyCells.length);
	var iIdx = emptyCells[randomIdx].i;
	var jIdx = emptyCells[randomIdx].j;
	gBoard[iIdx][jIdx].gameElement = BALL;
	renderCell({ i: iIdx, j: jIdx }, BALL_IMG);
	gBallsNum++;
	document.querySelector('.balls-num').innerText = gBallsNum;
}
//add glue in random empty cell
function addGlue() {
	var emptyCells = getEmptyCells();
	var randomIdx = getRandomInt(0, emptyCells.length);
	var iIdx = emptyCells[randomIdx].i;
	var jIdx = emptyCells[randomIdx].j;
	gGluePos = { i: iIdx, j: jIdx };
	gBoard[iIdx][jIdx].gameElement = GLUE;
	renderCell(gGluePos, GLUE);
	setTimeout(clearGlue, 3000);

}
function clearGlue() {
	//If gamer on glue
	if (gBoard[gGluePos.i][gGluePos.j].gameElement !== GAMER) {
		// gBoard[gGluePos.i][gGluePos.j].gameElement;
		// document.querySelector('.' + getClassName(gGluePos)).innerSrc = GAMER_IMG;
		// return;
		gBoard[gGluePos.i][gGluePos.j].gameElement = null;
		document.querySelector('.' + getClassName(gGluePos)).innerText = '';
		gGluePos.i=0;
		gGluePos.j=0;
	}
}
function getEmptyCells() {
	var emptyCells = [];
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j];
			if (currCell.gameElement === null && currCell.type === FLOOR) {
				emptyCells.push({ i, j });
			}
		}
	}
	// console.log('emptyCells', emptyCells)
	return emptyCells;

}
function restartGame() {
	clearInterval(gBallInterval);
	initGame()
}