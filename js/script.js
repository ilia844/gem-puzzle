class Game {
	constructor() {
		this.fieldSize = 4;
		this.cellSize = document.querySelector('.game-field').offsetWidth / this.fieldSize;
		this.cells = [];
		this.emptyIndex = 0;
		this.numbersSequence = [];
		this.isStarted = false;
		this.isFinished = false;
		this.moveCount = 0;
		this.timer = new Timer();
		this.score = new Score();
		this.stopTime = 0;
		this.swapSong = document.querySelector('.js-swap-song');
		this.finishSong = document.querySelector('.js-finish-song');
	}

	pause() {
		this.timer.stop();
		this.stopTime = this.timer.getTime('number');
	}

	continue() {
		if (this.isStarted) {
			this.timer.start(this.stopTime);
		}
	}

	startGame() {
		this.generateSequence();
		this.updateCells();
		this.refreshGameField();
	}

	resetGame() {
		const moveCounter = document.querySelector('.progress-bar__move-counter');
		const timer = document.querySelector('.progress-bar__timer');
		moveCounter.textContent = 'Move: 0';
		timer.textContent = 'Time: 00.00.00';
		if (document.querySelector('.congratulations-table')) {
			document.querySelector('.congratulations-table').remove();
		}

		this.moveCount = 0;
		this.stopTime = 0;
		this.timer.stop();
		this.generateSequence();
		this.updateCells();
		this.refreshGameField();
		this.isStarted = false;
		this.isFinished = false;
	}

	setFieldSize(size) {
		this.fieldSize = size;
		this.cellSize = document.querySelector('.game-field').offsetWidth / this.fieldSize;
		this.createCells(document.querySelector('.game-field'));
		this.resetGame();
	}

	createCells(place) {
		document.querySelectorAll('.cell').forEach(cell => cell.remove());
		for (let i = 1; i < this.fieldSize * this.fieldSize; i++) {
			const cell = document.createElement('button');
			cell.style.width = `${this.cellSize}px`;
			cell.style.height = `${this.cellSize}px`;
			cell.classList.add('cell');
			cell.classList.add('animation');
			place.append(cell);
		}
	}

	generateSequence() {
		this.numbersSequence = [];
		const numLength = this.fieldSize * this.fieldSize;
		const numbers = Array(numLength).fill(1).map((v, i) => i++);
		let index = 0;

		for (let i = 0; i < numLength; i++) {
			index = Math.floor(Math.random() * numbers.length);
			this.numbersSequence.push(numbers[index]);
			numbers.splice(index, 1);
		}

		if (!this.isSolvable()) {
			this.generateSequence();
		}
	}

	updateCells() {
		this.cells = [];

		for (let i = 0; i < this.numbersSequence.length; i++) {
			const left = i % this.fieldSize;
			const top = (i - left) / this.fieldSize;
			const value = this.numbersSequence[i];

			this.cells.push({
				value: value,
				left: left,
				top: top,
				element: null
			});
		}
	}

	refreshGameField() {
		const gameButtons = document.querySelectorAll('.cell');
		let index = 0;

		for (let i = 0; i < this.cells.length; i++) {
			if (this.cells[i].value !== 0) {
				this.cells[i].element = gameButtons[index++];
				this.cells[i].element.style.top = `${this.cells[i].top * this.cellSize}px`;
				this.cells[i].element.style.left = `${this.cells[i].left * this.cellSize}px`;
				this.cells[i].element.textContent = this.cells[i].value;
				this.cells[i].element.onclick = () => this.move(i);

			} else {
				this.emptyIndex = i;
			}
		}
	}

	move(index) {
		const moveCounter = document.querySelector('.progress-bar__move-counter');
		const cell = this.cells[index];
		const emptyCell = this.cells[this.emptyIndex];

		if (!this.isStarted) {
			this.moveCount = 0;
			this.isStarted = true;
			this.isFinished = false;
			this.timer.start(this.stopTime);
			this.stopTime = 0;
		}

		if (this.isNearCell(index)) {
			this.swapSong.currentTime = 0;
			this.swapSong.play();
			this.moveCount++;
			moveCounter.textContent = `Move: ${this.moveCount}`;
			cell.element.style.left = `${emptyCell.left * this.cellSize}px`;
			cell.element.style.top = `${emptyCell.top * this.cellSize}px`;

			const buffLeft = emptyCell.left;
			const buffTop = emptyCell.top;
			emptyCell.left = cell.left;
			emptyCell.top = cell.top;
			cell.left = buffLeft;
			cell.top = buffTop;
			this.checkFinish();
		}
	}

	isNearCell(index) {
		const cell = this.cells[index];
		const emptyCell = this.cells[this.emptyIndex];

		return Math.abs(cell.top - emptyCell.top) + Math.abs(cell.left - emptyCell.left) === 1 ? true : false;
	}

	checkFinish() {
		let isFinished = true;

		for (let obj of this.cells) {
			if (obj.value !== 0) {
				if (obj.value !== obj.top * this.fieldSize + obj.left + 1) {
					isFinished = false;
					break;
				}
			}
		}

		if (isFinished) {
			this.finishSong.play();
			const gameField = document.querySelector('.game-field');
			const congratulationsTable = document.createElement('div');
			const congratulationsTitle = `<span class="congratulations-table__title">Hooray!</br>
				You solved the puzzle in ${this.timer.getTime('string')} and ${this.moveCount} moves!</span>`

			congratulationsTable.className = 'congratulations-table';
			congratulationsTable.insertAdjacentHTML('afterbegin', congratulationsTitle);
			gameField.append(congratulationsTable);


			this.isFinished = true;
			this.isStarted = false;
			this.timer.stop();
			this.score.addScore(this.fieldSize, this.moveCount, this.timer.getTime('string'));
		}
	}

	isSolvable() {
		let invCount = 0;
		let zeroLine = 0;

		for (let i = 0; i < this.numbersSequence.length; i++) {
			if (this.numbersSequence[i] !== 0) {
				for (let j = 0; j < i; j++) {
					if (this.numbersSequence[j] > this.numbersSequence[i]) {
						invCount++;
					}
				}
			} else {
				zeroLine = Math.floor(i / this.fieldSize) + 1;
			}
		}
		invCount += this.fieldSize % 2 === 0 ? zeroLine : 0;
		return invCount % 2 === 0 ? true : false;
	}
}

document.onselectstart = () => false;
const gameWindow = document.createElement('div'),
	gameField = document.createElement('div'),
	resetBtn = document.createElement('button'),
	progressBar = document.createElement('div'),
	timer = document.createElement('span'),
	moveCounter = document.createElement('span'),
	menuBtn = document.createElement('button'),
	buttonsBar = document.createElement('div'),
	swapSong = document.createElement('audio'),
	finishSong = document.createElement('audio');

document.body.append(gameWindow);
progressBar.append(timer);
progressBar.append(moveCounter);
gameWindow.append(progressBar);
gameWindow.append(gameField);
gameWindow.append(buttonsBar);
buttonsBar.append(resetBtn);
buttonsBar.append(menuBtn);
gameField.append(swapSong, finishSong);


progressBar.classList.add('progress-bar');
buttonsBar.classList.add('buttons-bar');
timer.classList.add('progress-bar__timer');
moveCounter.classList.add('progress-bar__move-counter');
gameWindow.classList.add('game-window');
gameField.classList.add('game-field');
resetBtn.className = 'buttons-bar__button js-reset-btn';
menuBtn.className = 'buttons-bar__button js-menu-btn';
swapSong.className = 'js-swap-song';
finishSong.className = 'js-finish-song';

timer.textContent = 'Time: 00.00.00';
moveCounter.textContent = 'Move: 0';
resetBtn.textContent = 'Reset';
menuBtn.textContent = 'Menu';
swapSong.src = 'assets/songs/swap.mp3';
finishSong.src = 'assets/songs/finish.mp3';

//! MENU 
const menuWindow = document.createElement('div'),
	newGameBtn = document.createElement('button'),
	continueGameBtn = document.createElement('button'),
	settingsBtn = document.createElement('button'),
	fieldSizeTitle = document.createElement('h2'),
	backBtn = document.createElement('button'),
	saveSettingsBtn = document.createElement('button'),
	selectSizeBox = document.createElement('select'),
	bestScoresBtn = document.createElement('button'),
	bestScoresTitle = document.createElement('h2'),
	bestScoresTable = document.createElement('table'),
	volumeBlock = document.createElement('div'),
	volumeCheckbox = document.createElement('input');



menuWindow.className = 'menu-window';
newGameBtn.className = 'menu-window__button js-new-game-btn';
continueGameBtn.className = 'menu-window__button js-continue-btn';
settingsBtn.className = 'menu-window__button js-settings-btn';
fieldSizeTitle.className = 'menu-window__title hide';
backBtn.className = 'menu-window__button js-back-btn hide';
saveSettingsBtn.className = 'menu-window__button js-save-btn hide';
selectSizeBox.className = 'menu-window__select js-select-box hide';
bestScoresBtn.className = 'menu-window__button js-score-btn';
bestScoresTitle.className = 'menu-window__title hide';
bestScoresTable.className = 'menu-window__table js-score-table hide';
volumeBlock.className = 'menu-window__block hide';
volumeCheckbox.className = 'menu-window__checkbox'


newGameBtn.textContent = 'New Game';
continueGameBtn.textContent = 'Continue';
settingsBtn.textContent = 'Settings';
fieldSizeTitle.textContent = 'Field size:';
backBtn.textContent = 'Back';
saveSettingsBtn.textContent = 'Save';
bestScoresBtn.textContent = 'Best scores';
bestScoresTitle.textContent = 'Best scores';
selectSizeBox.insertAdjacentHTML('afterbegin', `<option value=”3”>3x3</option>
	<option value=”4” selected>4x4</option>
	<option value=”5”>5x5</option>
	<option value=”6”>6x6</option>
	<option value=”7”>7x7</option>
	<option value=”8”>8x8</option>`);
volumeBlock.insertAdjacentHTML('afterbegin', `<h2 class="menu-window__title">Song: </h2>`);
volumeCheckbox.type = 'checkbox';
volumeCheckbox.checked = true;


document.querySelector('.game-window').append(menuWindow);
volumeBlock.append(volumeCheckbox);
menuWindow.append(newGameBtn, continueGameBtn, bestScoresBtn, settingsBtn);
menuWindow.append(fieldSizeTitle, bestScoresTitle, bestScoresTable, selectSizeBox, volumeBlock, saveSettingsBtn, backBtn);

function hideMainMenu() {
	newGameBtn.classList.add('hide');
	continueGameBtn.classList.add('hide');
	bestScoresBtn.classList.add('hide');
	settingsBtn.classList.add('hide');
}

function showMainMenu() {
	newGameBtn.classList.remove('hide');
	continueGameBtn.classList.remove('hide');
	bestScoresBtn.classList.remove('hide');
	settingsBtn.classList.remove('hide');
}

function hideSettigMenu() {
	fieldSizeTitle.classList.add('hide');
	selectSizeBox.classList.add('hide');
	volumeBlock.classList.add('hide');
	saveSettingsBtn.classList.add('hide');
	backBtn.classList.add('hide');
}

function showSettingMenu() {
	fieldSizeTitle.classList.remove('hide');
	selectSizeBox.classList.remove('hide');
	volumeBlock.classList.remove('hide');
	saveSettingsBtn.classList.remove('hide');
	backBtn.classList.remove('hide');
}

function showScoreMenu() {
	let bestScores = [];
	bestScoresTitle.classList.remove('hide');
	bestScoresTable.classList.remove('hide');
	backBtn.classList.remove('hide');
	bestScoresTable.insertAdjacentHTML('afterbegin',
		'<tr><th>Date</th><th>Size</th><th>Moves</th><th>Time</th></tr>');
	if (localStorage.getItem('bestScores')) {
		bestScores = JSON.parse(localStorage.getItem('bestScores'));
		for (let obj of bestScores) {
			bestScoresTable.insertAdjacentHTML('beforeend',
				`<tr><td>${obj.date}</td><td>${obj.size}</td><td>${obj.moves}</td><td>${obj.time}</td></tr>`);
		}
	}
}

function hideScoreMenu() {
	bestScoresTitle.classList.add('hide');
	bestScoresTable.classList.add('hide');
	backBtn.classList.add('hide');
	bestScoresTable.innerHTML = '';
}

//! 

//* START

const game = new Game();
game.createCells(gameField);
game.startGame();

resetBtn.addEventListener('click', game.resetGame);
menuBtn.addEventListener('click', () => {
	game.pause();
	menuWindow.classList.remove('hide');
});
newGameBtn.addEventListener('click', () => {
	menuWindow.classList.add('hide');
	game.resetGame();
});
continueGameBtn.addEventListener('click', () => {
	menuWindow.classList.add('hide');
	game.continue();
});
settingsBtn.addEventListener('click', () => {
	hideMainMenu();
	showSettingMenu();
});
saveSettingsBtn.addEventListener('click', () => {
	game.setFieldSize(`${parseInt(selectSizeBox.value[1])}`);
	if (volumeCheckbox.checked) {
		finishSong.volume = 1;
		swapSong.volume = 1;
	} else {
		finishSong.volume = 0;
		swapSong.volume = 0;
	}
	hideSettigMenu();
	showMainMenu();
});
bestScoresBtn.addEventListener('click', () => {
	hideMainMenu();
	showScoreMenu();
});
backBtn.addEventListener('click', () => {
	hideSettigMenu();
	hideScoreMenu();
	showMainMenu();
});



