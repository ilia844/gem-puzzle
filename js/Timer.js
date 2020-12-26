class Timer {
	constructor() {
		this.time = 0;
		this.timer = null;
	}

	_tickAction() {
		const timer = document.querySelector('.progress-bar__timer');
		this.time++;

		timer.textContent = `Time: ${this._convertSecondToTime(this.time)}`;
	}

	_convertSecondToTime(sec) {
		function addZeros(number) {
			return number < 10 ? `0${number}` : `${number}`;
		}

		const hours = Math.floor(sec / 3600);
		const minutes = Math.floor((sec - hours * 3600) / 60);
		const seconds = sec - hours * 3600 - minutes * 60;

		return `${addZeros(hours)}.${addZeros(minutes)}.${addZeros(seconds)}`;
	}

	getTime(option) {
		if (option === 'string') {
			return `${this._convertSecondToTime(this.time)}`;
		} else if (option === 'number') {
			return this.time;
		}

	}

	start(seconds) {
		if (parseInt(seconds)) {
			this.time = seconds;
		} else {
			this.time = 0;
		}
		this.timer = setInterval(() => { this._tickAction() }, 1000);
	}

	stop() {
		clearInterval(this.timer);
	}

}