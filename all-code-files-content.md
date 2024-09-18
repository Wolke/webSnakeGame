### style.css
```css
body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #f0f0f0;
    font-family: Arial, sans-serif;
}

#game-container {
    text-align: center;
}

#game-board {
    border: 2px solid #333;
    background-color: #fff;
}

#score {
    font-size: 24px;
    margin: 10px 0;
}

#start-button {
    font-size: 18px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
}

@media (max-width: 600px) {
    #game-board {
        width: 90vw;
        height: 90vw;
    }
}

@media (min-width: 601px) {
    #game-board {
        width: 400px;
        height: 400px;
    }
}
```

### script.js
```js
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

        // Draw snake
        this.game.ctx.fillStyle = 'green';
        this.game.snake.forEach(segment => {
            this.game.ctx.fillRect(segment.x * this.game.cellSize, segment.y * this.game.cellSize, this.game.cellSize, this.game.cellSize);
        });

        // Draw food
        this.game.ctx.fillStyle = 'red';
        this.game.ctx.fillRect(this.game.food.x * this.game.cellSize, this.game.food.y * this.game.cellSize, this.game.cellSize, this.game.cellSize);

        // Update score
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
        this.isAIEnabled = false; // Flag to toggle AI
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('toggle-ai-button').addEventListener('click', () => this.toggleAI());
    }

    toggleAI() {
        this.isAIEnabled = !this.isAIEnabled;
        alert(this.isAIEnabled ? 'AI控制開啟' : 'AI控制關閉');
    }

    startGame() {
        this.game.reset();
        this.gameLoop();
    }

    gameLoop() {
        if (this.isAIEnabled) {
            this.AIControl();
        }

        this.game.update();
        this.view.draw();

        if (!this.game.gameOver) {
            setTimeout(() => this.gameLoop(), 100);
        } else {
            alert('遊戲結束！您的分數是: ' + this.game.score);
        }
    }

    AIControl() {
        const head = this.game.snake[0];
        const food = this.game.food;

        // Simple AI: move towards the food, but avoid moving in the opposite direction
        const oppositeDirections = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (head.x < food.x && this.game.direction !== 'left') {
            this.game.direction = 'right';
        } else if (head.x > food.x && this.game.direction !== 'right') {
            this.game.direction = 'left';
        } else if (head.y < food.y && this.game.direction !== 'up') {
            this.game.direction = 'down';
        } else if (head.y > food.y && this.game.direction !== 'down') {
            this.game.direction = 'up';
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

        if (!this.isAIEnabled && key in directions) {
            this.game.direction = directions[key];
        }
    }
}

// Initialize game
new GameController();

```

### index.html
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>貪食蛇遊戲</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container">
        <canvas id="game-board"></canvas>
        <div id="score">分數: <span id="score-value">0</span></div>
        <button id="start-button">開始遊戲</button>
        <button id="toggle-ai-button">切換AI控制</button>

    </div>
    <script src="script.js"></script>
</body>
</html>
```

