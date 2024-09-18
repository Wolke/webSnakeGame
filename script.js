// Model
class SnakeGame {
    constructor(canvasWidth, canvasHeight, cellSize) {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.cellSize = cellSize;
        this.reset();
    }

    reset() {
        this.snake = [{ x: 5, y: 5 }];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.cellSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.cellSize));
        return { x, y };
    }

    update() {
        if (this.gameOver) return;

        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (this.checkCollision(head)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        return (
            head.x < 0 || head.x >= this.canvas.width / this.cellSize ||
            head.y < 0 || head.y >= this.canvas.height / this.cellSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        );
    }
}

// View
class GameView {
    constructor(game) {
        this.game = game;
        this.scoreElement = document.getElementById('score-value');
    }

    draw() {
        this.game.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // 繪製蛇
        this.game.ctx.fillStyle = 'green';
        this.game.snake.forEach(segment => {
            this.game.ctx.fillRect(segment.x * this.game.cellSize, segment.y * this.game.cellSize, this.game.cellSize, this.game.cellSize);
        });

        // 繪製食物
        this.game.ctx.fillStyle = 'red';
        this.game.ctx.fillRect(this.game.food.x * this.game.cellSize, this.game.food.y * this.game.cellSize, this.game.cellSize, this.game.cellSize);

        // 更新分數
        this.scoreElement.textContent = this.game.score;
    }
}

// Controller
class GameController {
    constructor() {
        const canvasWidth = window.innerWidth > 600 ? 400 : window.innerWidth * 0.9;
        const canvasHeight = canvasWidth;
        const cellSize = 20;

        this.game = new SnakeGame(canvasWidth, canvasHeight, cellSize);
        this.view = new GameView(this.game);
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    startGame() {
        this.game.reset();
        this.gameLoop();
    }

    gameLoop() {
        this.game.update();
        this.view.draw();

        if (!this.game.gameOver) {
            setTimeout(() => this.gameLoop(), 100);
        } else {
            alert('遊戲結束！您的分數是: ' + this.game.score);
        }
    }

    handleKeyPress(e) {
        const key = e.key;
        const directions = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        if (key in directions) {
            this.game.direction = directions[key];
        }
    }
}

// 初始化遊戲
new GameController();