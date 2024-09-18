// 模型
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
        const cols = this.canvas.width / this.cellSize;
        const rows = this.canvas.height / this.cellSize;
        let x, y;
        do {
            x = Math.floor(Math.random() * cols);
            y = Math.floor(Math.random() * rows);
        } while (this.snake.some(segment => segment.x === x && segment.y === y));
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
        const cols = this.canvas.width / this.cellSize;
        const rows = this.canvas.height / this.cellSize;
        return (
            head.x < 0 || head.x >= cols ||
            head.y < 0 || head.y >= rows ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        );
    }
}

// 視圖
class GameView {
    constructor(game) {
        this.game = game;
        this.scoreElement = document.getElementById('score-value');
    }

    draw() {
        this.game.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // 畫蛇
        this.game.ctx.fillStyle = 'green';
        this.game.snake.forEach(segment => {
            this.game.ctx.fillRect(segment.x * this.game.cellSize, segment.y * this.game.cellSize, this.game.cellSize, this.game.cellSize);
        });

        // 畫食物
        this.game.ctx.fillStyle = 'red';
        this.game.ctx.fillRect(this.game.food.x * this.game.cellSize, this.game.food.y * this.game.cellSize, this.game.cellSize, this.game.cellSize);

        // 更新分數
        this.scoreElement.textContent = this.game.score;
    }
}

// 控制器
class GameController {
    constructor() {
        const canvasWidth = window.innerWidth > 600 ? 400 : window.innerWidth * 0.9;
        const canvasHeight = canvasWidth;
        const cellSize = 20;

        this.game = new SnakeGame(canvasWidth, canvasHeight, cellSize);
        this.view = new GameView(this.game);
        this.isAIEnabled = false; // 是否啟用AI
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('toggle-ai-button').addEventListener('click', () => this.toggleAI());

        // 新增的按鈕事件監聽器
        document.getElementById('up-button').addEventListener('click', () => this.changeDirection('up'));
        document.getElementById('down-button').addEventListener('click', () => this.changeDirection('down'));
        document.getElementById('left-button').addEventListener('click', () => this.changeDirection('left'));
        document.getElementById('right-button').addEventListener('click', () => this.changeDirection('right'));
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

        const path = this.findPath(head, food);

        if (path && path.length > 0) {
            const nextMove = path[0];

            // 確定方向
            if (nextMove.x > head.x) {
                this.game.direction = 'right';
            } else if (nextMove.x < head.x) {
                this.game.direction = 'left';
            } else if (nextMove.y > head.y) {
                this.game.direction = 'down';
            } else if (nextMove.y < head.y) {
                this.game.direction = 'up';
            }
        } else {
            // 如果沒有找到路徑，執行安全移動
            this.makeSafeMove();
        }
    }

    findPath(start, end) {
        const cols = this.game.canvas.width / this.game.cellSize;
        const rows = this.game.canvas.height / this.game.cellSize;
        const openSet = [];
        const closedSet = [];
        const grid = [];

        // 初始化網格
        for (let x = 0; x < cols; x++) {
            grid[x] = [];
            for (let y = 0; y < rows; y++) {
                grid[x][y] = {
                    x,
                    y,
                    f: 0,
                    g: 0,
                    h: 0,
                    parent: null,
                    isObstacle: false
                };
            }
        }

        // 將蛇身標記為障礙物
        for (let segment of this.game.snake) {
            if (grid[segment.x] && grid[segment.x][segment.y]) {
                grid[segment.x][segment.y].isObstacle = true;
            }
        }

        // 起點和終點節點
        const startNode = grid[start.x][start.y];
        const endNode = grid[end.x][end.y];

        openSet.push(startNode);

        while (openSet.length > 0) {
            // 在 openSet 中找到 f 值最小的節點
            let lowestIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestIndex].f) {
                    lowestIndex = i;
                }
            }

            const current = openSet[lowestIndex];

            // 如果到達終點
            if (current === endNode) {
                // 重建路徑
                const path = [];
                let temp = current;
                while (temp.parent) {
                    path.push(temp);
                    temp = temp.parent;
                }
                path.reverse();
                return path; // 返回路徑
            }

            // 將 current 從 openSet 移到 closedSet
            openSet.splice(lowestIndex, 1);
            closedSet.push(current);

            // 獲取鄰居
            const neighbors = [];
            const dirs = [
                { x: 0, y: -1 }, // 上
                { x: 1, y: 0 },  // 右
                { x: 0, y: 1 },  // 下
                { x: -1, y: 0 }  // 左
            ];

            for (let dir of dirs) {
                const x = current.x + dir.x;
                const y = current.y + dir.y;

                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    const neighbor = grid[x][y];
                    if (!neighbor.isObstacle && !closedSet.includes(neighbor)) {
                        neighbors.push(neighbor);
                    }
                }
            }

            for (let neighbor of neighbors) {
                const tentativeG = current.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    continue; // 這不是更好的路徑
                }

                neighbor.g = tentativeG;
                neighbor.h = Math.abs(neighbor.x - endNode.x) + Math.abs(neighbor.y - endNode.y); // 曼哈頓距離
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }

        // 沒有找到路徑
        return null;
    }

    makeSafeMove() {
        const head = this.game.snake[0];
        const directions = ['up', 'down', 'left', 'right'];
        const oppositeDirections = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        const cols = this.game.canvas.width / this.game.cellSize;
        const rows = this.game.canvas.height / this.game.cellSize;

        for (let dir of directions) {
            if (dir === oppositeDirections[this.game.direction]) {
                continue; // 避免反方向移動
            }

            let x = head.x;
            let y = head.y;

            switch (dir) {
                case 'up': y--; break;
                case 'down': y++; break;
                case 'left': x--; break;
                case 'right': x++; break;
            }

            // 檢查碰撞
            const collision = (
                x < 0 || x >= cols ||
                y < 0 || y >= rows ||
                this.game.snake.some(segment => segment.x === x && segment.y === y)
            );

            if (!collision) {
                this.game.direction = dir;
                return;
            }
        }

        // 如果沒有安全的移動方向，保持當前方向
    }

    handleKeyPress(e) {
        const key = e.key;
        const directions = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        const oppositeDirections = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (!this.isAIEnabled && key in directions) {
            const newDirection = directions[key];
            // 防止蛇反方向移動
            if (newDirection !== oppositeDirections[this.game.direction]) {
                this.game.direction = newDirection;
            }
        }
    }

    // 新增的方向變更函數
    changeDirection(newDirection) {
        const oppositeDirections = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (!this.isAIEnabled) {
            // 防止蛇反方向移動
            if (newDirection !== oppositeDirections[this.game.direction]) {
                this.game.direction = newDirection;
            }
        }
    }
}

// 初始化遊戲
new GameController();
