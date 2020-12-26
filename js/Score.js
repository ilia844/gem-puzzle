class Score {
	constructor() {
		this.maxSize = 10;
		if (localStorage.getItem('bestScores')) {
			this.bestScores = JSON.parse(localStorage.getItem('bestScores'));
		} else {
			this.bestScores = [];
		}
	}

	addScore(size, moves, time) {
		const score = {};
		score.date = this._getDate();
		score.size = `${size}x${size}`;
		score.moves = moves;
		score.time = time;

		this.bestScores.push(score);
		this.bestScores.sort((a, b) => a.moves > b.moves ? 1 : -1);
		if (this.bestScores.length > this.maxSize) {
			this.bestScores = this.bestScores.slice(0, this.maxSize);
		}
		localStorage.setItem('bestScores', JSON.stringify(this.bestScores));
	}

	_getDate() {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		const date = new Date();
		const day = date.getDate();
		const month = months[date.getMonth()];
		const year = date.getFullYear();

		return `${day} ${month} ${year}`;
	}
}