import '../css/style.css';
import '../css/style.scss';
import Time from './Time';

const audioSrc = require('../audio/audio.wav');

const GemPuzzle = {
	elements: {
			main: null,
			menu: null,
			timer: null,
			movesCounter: null,
			puzzles: [],
			menuButtons: null,
			pauseButton: null,
			scoreTable: null,
			buttons: {},
			gamesizes: [],
			alert: {},
	 },

	properties: {
			gameState: "playing",
			time: null,
			moves: 0,
			size: null,
			bestScores: [],
			empty: {
				left: 0,
				top: 0,
				number: 0,
			},
			puzzlesArray: [],
	},

	init() {
			this.elements.main = document.createElement('div');
			this.elements.main.classList.add('game');
			this.elements.hover = document.createElement('div');
			this.elements.hover.classList.add('hover');
			this.elements.gameGrid = document.createElement('div');
			this.elements.gameGrid.classList.add('game__grid');
			this.elements.info = document.createElement('div');
			this.elements.info.classList.add('info');
			this.elements.infoText = document.createElement('div');
			this.elements.infoText.classList.add('info__text');
			this.elements.pauseButton = document.createElement('button');
			this.elements.pauseButton.classList.add('info__pause');
			this.elements.pauseButton.innerHTML = `<i class="material-icons">pause</i>`;
			this.elements.timer = document.createElement('p');
			this.elements.timer.innerHTML = `Time: 00:00`;
			this.elements.movesCounter = document.createElement('p');
			this.elements.movesCounter.innerHTML = `Moves: 0`;
			this.elements.menu = document.createElement('div');
			this.elements.menu.classList.add('menu');
			this.elements.menuButtons = document.createElement('div');
			this.elements.menuButtons.classList.add('menu__buttons');
			this.elements.main.append(this.elements.hover);
			this.elements.main.append(this.elements.gameGrid);
			this.elements.infoText.append(this.elements.movesCounter);
			this.elements.infoText.append(this.elements.timer);
			this.elements.info.append(this.elements.infoText);
			this.elements.info.append(this.elements.pauseButton);
			this.elements.main.append(this.elements.info);
			this.elements.menu.append(this.elements.menuButtons);
			this.elements.main.append(this.elements.menu);

			this.elements.pauseButton.addEventListener('click', () => {
				if (this.properties.gameState === "pause") {
					this.properties.time.showTime();
					this.properties.gameState = "playing";
				} else if (this.properties.gameState === "playing") {
					this.properties.time.pause();
					this.properties.gameState = "pause";
				}
				this.elements.hover.classList.toggle('active');
				this.elements.menu.classList.toggle('active');
			});

			// Local Storage
			if ("bestScores" in localStorage) {
				this.properties.bestScores = JSON.parse(localStorage.getItem("bestScores"));
			}

			// Alert
			this.elements.alert.background = document.createElement('div')
			this.elements.alert.background.classList.add('alert');
			this.elements.alert.alert = document.createElement('div')
			this.elements.alert.alert.classList.add('alert__foreground');
			this.elements.alert.title = document.createElement('p')
			this.elements.alert.title.classList.add('alert__title');
			this.elements.alert.input = document.createElement('input')
			this.elements.alert.input.setAttribute('placeholder','Your Name');
			this.elements.alert.input.classList.add('alert__input');
			this.elements.alert.button = document.createElement('button')
			this.elements.alert.button.classList.add('alert__button');
			this.elements.alert.background.append(this.elements.alert.alert);

			document.body.append(this.elements.alert.background);
			document.body.append(this.elements.main);

			this.properties.time = new Time(this.elements.timer);
			this.createMenu();
			this.createPuzzle(3);
			this.elements.menuButtons.append(this.setMenu("main"));
			this.shuffle();
	},

	movePuzzle(gapIndex) {
		if (this.properties.gameState !== "end") {
			if (!this.properties.time.timer || this.properties.gameState === "pause") {
				this.properties.time.showTime();
				this.properties.gameState = "playing";
			}
			const gap = this.properties.puzzlesArray[gapIndex];
			const emptyLeft = this.properties.empty.left;
			const emptyTop = this.properties.empty.top;
			this.playSound();
			this.properties.moves += 1;
			this.elements.movesCounter.innerHTML = `Moves: ${this.properties.moves}`;

			gap.element.style.left = `${emptyLeft * 50/this.properties.size}rem`;
			gap.element.style.top = `${emptyTop * 50/this.properties.size}rem`;

			this.properties.empty.left = gap.left
			this.properties.empty.top = gap.top
			gap.left = emptyLeft;
			gap.top = emptyTop;
			this.checkFinished();
		}
	},

	shuffle() {
		const puzzlesArray = [...Array(this.properties.size**2).keys()];
		puzzlesArray.shift();
		puzzlesArray.sort(() => Math.random() - 0.5);
		let counter = 0;
		puzzlesArray.forEach((value, index) => {
			for (let i = index+1; i <= puzzlesArray.length; i+=1) {
				if (puzzlesArray[i] < value) {
					counter += 1;
				}
			}
		});
		if ((counter + this.properties.size) % 2 !== 0) this.reloadGrid(puzzlesArray)
		else this.shuffle();
	},

	reloadGrid(array) {
		this.properties.empty.left = this.properties.size-1;
		this.properties.empty.top = this.properties.size-1;
		this.properties.empty.number = this.properties.size**2;
		array.forEach(( val, index ) => {
			const left = index % this.properties.size;
			const top = (index - left) / this.properties.size;

			this.properties.puzzlesArray[val].element.style.left = `${left * 50/this.properties.size}rem`;
			this.properties.puzzlesArray[val].element.style.top = `${top * 50/this.properties.size}rem`;

			this.properties.puzzlesArray[val].left = left;
			this.properties.puzzlesArray[val].top = top;
		})
	},

	checkFinished() {
		if (this.properties.puzzlesArray.every(cell => cell.number === cell.top * this.properties.size + cell.left + 1))
		{
			this.properties.gameState = "end";
			this.properties.time.pause();
			this.alert(`win`,`Ура! Вы решили головоломку за ${this.properties.time.min}:${this.properties.time.sec} и ${this.properties.moves} ходов`, 'OK');
		}
	},

	createMenu() {
			this.elements.buttons.saveGame = document.createElement("button");
			this.elements.buttons.saveGame.setAttribute("type", "button");
			this.elements.buttons.saveGame.classList.add("menu__item");
			this.elements.buttons.saveGame.textContent = `Save Game`;
			this.elements.buttons.saveGame.addEventListener('click', () => {
				localStorage.setItem(`savedGame${this.properties.size}`, JSON.stringify({array: this.properties.puzzlesArray, moves: this.properties.moves, min: this.properties.time.min, sec: this.properties.time.sec}));
				this.alert('text','Your game saved successfully', 'OK');
			})
			this.elements.buttons.newGame = document.createElement("button");
			this.elements.buttons.newGame.setAttribute("type", "button");
			this.elements.buttons.newGame.classList.add("menu__item");
			this.elements.buttons.newGame.textContent = `New Game`;
			this.elements.buttons.newGame.addEventListener('click', () => {
				this.properties.time.clearTimer();
				this.properties.moves = 0;
				this.properties.gameState = "pause";
				this.elements.movesCounter.innerHTML = `Moves: ${this.properties.moves}`;
				this.elements.timer.innerHTML = `Time: 00:00`;
				this.shuffle();
				this.elements.hover.classList.toggle('active');
				this.elements.menu.classList.toggle('active');
			})
			this.elements.buttons.savedGames = document.createElement("button");
			this.elements.buttons.savedGames.setAttribute("type", "button");
			this.elements.buttons.savedGames.classList.add("menu__item");
			this.elements.buttons.savedGames.textContent = `Saved Game`;
			this.elements.buttons.savedGames.addEventListener('click', () => {
				if (`savedGame${this.properties.size}` in localStorage) {
					const savedGame = JSON.parse(localStorage.getItem(`savedGame${this.properties.size}`));
					savedGame.array.forEach((element, index)=> {
						if(index > 0) {
							this.properties.puzzlesArray[index].element.style.left = `${element.left * 50/this.properties.size}rem`;
							this.properties.puzzlesArray[index].element.style.top = `${element.top * 50/this.properties.size}rem`;
						}

						this.properties.puzzlesArray[index].left = element.left;
						this.properties.puzzlesArray[index].top = element.top;
					})
					this.properties.moves = savedGame.moves;
					this.properties.time.min = savedGame.min;
					this.properties.time.sec = savedGame.sec;
				} else this.alert('text','There is no saved game for this puzzle size.', 'OK');
			})
			this.elements.buttons.bestScores = document.createElement("button");
			this.elements.buttons.bestScores.setAttribute("type", "button");
			this.elements.buttons.bestScores.classList.add("menu__item");
			this.elements.buttons.bestScores.textContent = `Best Scores`;
			this.elements.buttons.bestScores.addEventListener('click', () => {
				this.elements.menuButtons.innerHTML = ``;
				this.elements.menuButtons.append(this.setMenu("score"));
			})
			this.elements.buttons.rules = document.createElement("button");
			this.elements.buttons.rules.setAttribute("type", "button");
			this.elements.buttons.rules.classList.add("menu__item");
			this.elements.buttons.rules.textContent = `Rules`;
			this.elements.buttons.rules.addEventListener('click', () => {
				this.alert("text", "The object of the puzzle is to place the tiles in order by making sliding moves that use the empty space. You can save your game and load it later. Or you can just use pause button. Also you can choose game field size", "Understand")
			})
			this.elements.buttons.settings = document.createElement("button");
			this.elements.buttons.settings.setAttribute("type", "button");
			this.elements.buttons.settings.classList.add("menu__item");
			this.elements.buttons.settings.textContent = `Settings`;
			this.elements.buttons.settings.addEventListener('click', () => {
				this.elements.menuButtons.innerHTML = ``;
				this.elements.menuButtons.append(this.setMenu("settings"));
			})
			this.elements.buttons.back = document.createElement("button");
			this.elements.buttons.back.setAttribute("type", "button");
			this.elements.buttons.back.classList.add("menu__item");
			this.elements.buttons.back.textContent = `Back`;
			this.elements.buttons.back.addEventListener('click', () => {
				this.elements.menuButtons.innerHTML = ``;
				this.elements.menuButtons.append(this.setMenu("main"));
			})
			this.elements.scoreTable = document.createElement("table");
			for (let i = 3; i < 9; i+=1) {
				const button = document.createElement("button");
				this.elements.gamesizes.push(button);
				button.setAttribute("type", "button");
				button.classList.add("menu__item");
				button.textContent = `${i}x${i}`;
				button.addEventListener('click', () => {
					this.createPuzzle(i);
					this.shuffle();
					this.properties.moves = 0;
					this.properties.time.clearTimer();
					this.elements.menuButtons.innerHTML = ``;
					this.elements.menuButtons.append(this.setMenu("main"));
				})
			}
	},

	alert(type, text, button) {
		this.elements.alert.alert.innerHTML = ``;
		switch (type) {
			case "win":
				this.elements.alert.alert.append(this.elements.alert.title);
				this.elements.alert.alert.append(this.elements.alert.input);
				this.elements.alert.alert.append(this.elements.alert.button);
				this.elements.alert.title.textContent = text;
				this.elements.alert.button.textContent = button;
				this.elements.alert.button.onclick = () => {
					if (this.elements.alert.input.value === "") this.elements.alert.title.innerHTML = `${text}<br><br>Введите данные`
					else {
						if (this.properties.bestScores.length > 9 && this.properties.bestScores[9].moves/this.properties.bestScores[9].size > this.properties.moves/this.properties.size) {
							this.properties.bestScores.pop();
						}
						if (this.properties.bestScores.length < 10)
							this.properties.bestScores.push({
								name: this.elements.alert.input.value,
								moves: this.properties.moves,
								m: this.properties.time.min,
								s: this.properties.time.sec,
								size: this.properties.size
							});
						this.properties.bestScores.sort((a, b) => {
							return a.moves/a.size - b.moves/b.size
						});
						localStorage.setItem("bestScores", JSON.stringify(this.properties.bestScores));
						this.elements.alert.background.classList.remove("active")
					}
				};
				break;
			case "text":
				this.elements.alert.alert.append(this.elements.alert.title);
				this.elements.alert.alert.append(this.elements.alert.button);
				this.elements.alert.title.textContent = text;
				this.elements.alert.button.textContent = button;
				this.elements.alert.button.onclick = () => {this.elements.alert.background.classList.remove("active")};
				break;
			default:
				break;
		}
		this.elements.alert.background.classList.toggle("active");
	},

	setMenu(item) {
		const fragment = document.createDocumentFragment();
		let tr = null;
		let td = null;
		switch (item) {
			case "main":
				fragment.append(this.elements.buttons.saveGame);
				fragment.append(this.elements.buttons.newGame);
				fragment.append(this.elements.buttons.savedGames);
				fragment.append(this.elements.buttons.bestScores);
				fragment.append(this.elements.buttons.rules);
				fragment.append(this.elements.buttons.settings);
				break;
			case "score":
				this.elements.scoreTable.innerHTML = '';
				tr = document.createElement("tr");
				td = document.createElement("th");
				td.textContent = "Name";
				tr.append(td);
				td = document.createElement("th");
				td.textContent = "Moves";
				tr.append(td);
				td = document.createElement("th");
				td.textContent = "Time";
				tr.append(td);
				td = document.createElement("th");
				td.textContent = "Size";
				tr.append(td);
				this.elements.scoreTable.append(tr);
				this.properties.bestScores.forEach(element => {
					tr = document.createElement("tr");
					td = document.createElement("td");
					td.textContent = element.name;
					tr.append(td);
					td = document.createElement("td");
					td.textContent = element.moves;
					tr.append(td);
					td = document.createElement("td");
					td.textContent = `${element.m}m ${element.s}s`;
					tr.append(td);
					td = document.createElement("td");
					td.textContent = `${element.size}x${element.size}`;
					tr.append(td);
					this.elements.scoreTable.append(tr);
				});
				fragment.append(this.elements.scoreTable);
				fragment.append(this.elements.buttons.back);
				break;
			case "settings":
				this.elements.gamesizes.forEach( element => fragment.append(element));
				fragment.append(this.elements.buttons.back);
				break;
			default:
				break;
		}
    return fragment;
	},

	createPuzzle(edgeSize) {
		this.elements.gameGrid.classList.remove("three", "four", "five", "six", "seven", "eight", "four")
		switch(edgeSize) {
			case 3:
					this.elements.gameGrid.classList.add("three");
			break;
			case 4:
					this.elements.gameGrid.classList.add("four");
			break;
			case 5:
					this.elements.gameGrid.classList.add("five");
			break;
			case 6:
					this.elements.gameGrid.classList.add("six");
			break;
			case 7:
					this.elements.gameGrid.classList.add("seven");
			break;
			case 8:
					this.elements.gameGrid.classList.add("eight");
			break;
			default:
				this.elements.gameGrid.classList.add("four");
		};
		this.properties.puzzlesArray = [];
		this.elements.gameGrid.innerHTML = '';
		this.properties.empty.left = edgeSize-1;
		this.properties.empty.top = edgeSize-1;
		this.properties.empty.number = edgeSize**2;
		this.properties.puzzlesArray.push(this.properties.empty);
		for (let i = 0; i < edgeSize**2-1; i+=1) {
				const puzzleTile = document.createElement("button");

				puzzleTile.classList.add("gap");
				puzzleTile.textContent = i+1;

				const left = i % edgeSize;
				const top = (i - left) / edgeSize;

				puzzleTile.style.left = `${left * 50/edgeSize}rem`;
				puzzleTile.style.top = `${top * 50/edgeSize}rem`;
				this.properties.puzzlesArray.push({
					"left": left,
					"top": top,
					number: i+1,
					element: puzzleTile
				});
				puzzleTile.addEventListener('click', () => {
					const puzzleGap = this.properties.puzzlesArray[i+1];
					const emptyGap = this.properties.empty;
					const leftDiff = Math.abs(emptyGap.left - puzzleGap.left);
					const topDiff = Math.abs(emptyGap.top - puzzleGap.top);
					if (leftDiff + topDiff <= 1) this.movePuzzle(i+1);
				});
				this.elements.gameGrid.append(puzzleTile);
		}
		this.properties.size = edgeSize;
	},

	playSound() {
			const audio = new Audio();
			audio.src = audioSrc;
			audio.volume = 0.1;
			audio.play();
	}
}

window.addEventListener('load', () => {
	GemPuzzle.init()
});