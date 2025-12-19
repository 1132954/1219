const SIZE = 8;
let board = [];
let currentPlayer = 1; // 1=黑, 2=白
const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('currentPlayer');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const restartBtn = document.getElementById('restartBtn');

function initBoard() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    board[3][3] = 2;
    board[3][4] = 1;
    board[4][3] = 1;
    board[4][4] = 2;
    renderBoard();
    updateScores();
    currentPlayer = 1;
    updateCurrentPlayerText();
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', () => playerMove(x, y));
            if (board[y][x] === 1) {
                const piece = document.createElement('div');
                piece.classList.add('piece', 'black');
                cell.appendChild(piece);
            } else if (board[y][x] === 2) {
                const piece = document.createElement('div');
                piece.classList.add('piece', 'white');
                cell.appendChild(piece);
            }
            boardEl.appendChild(cell);
        }
    }
}

function updateCurrentPlayerText() {
    currentPlayerEl.textContent = currentPlayer === 1 ? '黑棋' : '白棋';
}

function updateScores() {
    let black = 0, white = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === 1) black++;
            if (cell === 2) white++;
        }
    }
    blackScoreEl.textContent = black;
    whiteScoreEl.textContent = white;
}

const directions = [
    [-1,-1], [-1,0], [-1,1],
    [0,-1],         [0,1],
    [1,-1], [1,0], [1,1]
];

function isValidMove(x, y, player) {
    if (board[y][x] !== 0) return false;
    for (let [dx, dy] of directions) {
        let nx = x + dx, ny = y + dy;
        let foundOpponent = false;
        while (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
            if (board[ny][nx] === 0) break;
            if (board[ny][nx] === 3 - player) {
                foundOpponent = true;
            } else if (board[ny][nx] === player) {
                if (foundOpponent) return true;
                else break;
            } else {
                break;
            }
            nx += dx;
            ny += dy;
        }
    }
    return false;
}

function getValidMoves(player) {
    let moves = [];
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (isValidMove(x, y, player)) moves.push([x, y]);
        }
    }
    return moves;
}

function makeMove(x, y, player) {
    if (!isValidMove(x, y, player)) return false;
    board[y][x] = player;
    for (let [dx, dy] of directions) {
        let nx = x + dx, ny = y + dy;
        let path = [];
        while (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
            if (board[ny][nx] === 0) break;
            if (board[ny][nx] === 3 - player) {
                path.push([nx, ny]);
            } else if (board[ny][nx] === player) {
                for (let [px, py] of path) board[py][px] = player;
                break;
            } else {
                break;
            }
            nx += dx;
            ny += dy;
        }
    }
    updateScores();
    renderBoard();
    return true;
}

function playerMove(x, y) {
    if (!makeMove(x, y, currentPlayer)) return;
    currentPlayer = 3 - currentPlayer;
    updateCurrentPlayerText();
    setTimeout(aiMove, 300); // AI 延遲
}

function aiMove() {
    const moves = getValidMoves(currentPlayer);
    if (moves.length === 0) {
        currentPlayer = 3 - currentPlayer;
        updateCurrentPlayerText();
        return;
    }
    // 簡單 AI: 隨機選一個合法走法
    const [x, y] = moves[Math.floor(Math.random() * moves.length)];
    makeMove(x, y, currentPlayer);
    currentPlayer = 3 - currentPlayer;
    updateCurrentPlayerText();
}

restartBtn.addEventListener('click', initBoard);

initBoard();




