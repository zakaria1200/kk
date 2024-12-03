const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const themeToggle = document.getElementById('themeToggle');
const htmlRoot = document.documentElement;
const moonIcon = '<i class="fas fa-moon"></i>';
const sunIcon = '<i class="fas fa-sun"></i>';

// Set canvas size
canvas.width = 400;
canvas.height = 400;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let gameSpeed = 100;
let gameRunning = false;

highScoreElement.textContent = highScore;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
htmlRoot.dataset.theme = savedTheme;
themeToggle.innerHTML = savedTheme === 'light' ? moonIcon : sunIcon;

function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    checkFoodCollision();
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Check if food spawned on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        generateFood();
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        return true; // Return true to keep the tail and make snake longer
    }
    return false;
}

function checkCollision() {
    // Wall collision
    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        gameOver();
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameOver();
        }
    }
}

function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    startBtn.innerHTML = '<i class="fas fa-redo"></i> Play Again';
    
    // Draw game over overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 50);
    
    ctx.font = '24px Poppins';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
}

function startGame() {
    if (gameRunning) return;
    
    // Reset game state
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    gameRunning = true;
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Running...';
    
    // Start game loop
    gameInterval = setInterval(drawGame, gameSpeed);
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlRoot.dataset.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlRoot.dataset.theme = newTheme;
    themeToggle.innerHTML = newTheme === 'light' ? moonIcon : sunIcon;
    localStorage.setItem('theme', newTheme);
});

// Event Listeners
startBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
    if (!gameRunning) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (dy !== 1) { // Prevent moving directly opposite
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});
