// Othello (Reversi) 人 vs 電腦
// 8x8 棋盤，0=空, 1=黑(玩家), 2=白(電腦)

const SIZE = 8;
let board = [];
let current = 1; // 1=黑先（玩家）

const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('currentPlayer');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const restartBtn = document.getElementById('restartBtn');

// 8 個方向
const DIRS = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],        [0,1],
  [1,-1],[1,0],[1,1]
];

// 初始化棋盤
function initBoard(){
  board = Array.from({length:SIZE}, () => Array(SIZE).fill(0));
  const m = SIZE / 2;
  board[m-1][m-1] = 2;
  board[m][m]     = 2;
  board[m-1][m]   = 1;
  board[m][m-1]   = 1;
  current = 1;
  render();
}

// 是否在棋盤內
function within(r,c){
  return r>=0 && r<SIZE && c>=0 && c<SIZE;
}

// 回傳某步會翻轉的棋子
function flipsForMove(r,c,player){
  if(board[r][c] !== 0) return [];
  const opponent = player === 1 ? 2 : 1;
  let toFlip = [];

  for(const [dr,dc] of DIRS){
    let rr = r + dr;
    let cc = c + dc;
    const line = [];

    while(within(rr,cc) && board[rr][cc] === opponent){
      line.push([rr,cc]);
      rr += dr;
      cc += dc;
    }

    if(line.length > 0 && within(rr,cc) && board[rr][cc] === player){
      toFlip = toFlip.concat(line);
    }
  }
  return toFlip;
}

// 取得合法步
function getLegalMoves(player){
  const moves = new Map();
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const flips = flipsForMove(r,c,player);
      if(flips.length > 0){
        moves.set(`${r},${c}`, flips);
      }
    }
  }
  return moves;
}

// 下子並翻轉
function placeMove(r,c,player,flips){
  board[r][c] = player;
  for(const [rr,cc] of flips){
    board[rr][cc] = player;
  }
}

// 計算分數
function computeScore(){
  let b=0,w=0;
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      if(board[r][c] === 1) b++;
      if(board[r][c] === 2) w++;
    }
  }
  return {b,w};
}

// ================= AI =================

// 電腦選擇翻最多子的合法步
function getBestAIMove(player){
  const moves = getLegalMoves(player);
  if(moves.size === 0) return null;

  let best = null;
  let maxFlips = -1;

  for(const [key, flips] of moves){
    if(flips.length > maxFlips){
      maxFlips = flips.length;
      const [r,c] = key.split(',').map(Number);
      best = { r, c, flips };
    }
  }
  return best;
}

// 電腦下棋
function aiMove(){
  if(current !== 2) return;

  const move = getBestAIMove(2);
  if(!move){
    current = 1;
    render();
    return;
  }

  placeMove(move.r, move.c, 2, move.flips);
  current = 1;
  render();
}

// ================= UI =================

function render(){
  boardEl.innerHTML = '';
  const moves = getLegalMoves(current);

  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;

      const val = board[r][c];
      if(val !== 0){
        const piece = document.createElement('div');
        piece.className = 'piece ' + (val === 1 ? 'black' : 'white');
        cell.appendChild(piece);
      }

      const key = `${r},${c}`;
      if(current === 1 && moves.has(key)){
        cell.classList.add('possible');
        const hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = moves.get(key).length;
        cell.appendChild(hint);

        cell.addEventListener('click', ()=>{
          onCellClick(r,c,moves.get(key));
        });
      } else {
        cell.classList.add('disabled');
      }

      boardEl.appendChild(cell);
    }
  }

  const scores = computeScore();
  blackScoreEl.textContent = scores.b;
  whiteScoreEl.textContent = scores.w;
  currentPlayerEl.textContent = current === 1 ? '黑（玩家）' : '白（電腦）';

  checkForEndOrPass();
}

// 玩家點擊
function onCellClick(r,c,flips){
  if(current !== 1) return;

  placeMove(r,c,1,flips);
  current = 2;
  render();

  // 電腦延遲思考
  setTimeout(aiMove, 500);
}

// 檢查 pass / 結束
function checkForEndOrPass(){
  const currMoves = getLegalMoves(current);
  if(currMoves.size > 0) return;

  const other = current === 1 ? 2 : 1;
  const otherMoves = getLegalMoves(other);

  if(otherMoves.size > 0){
    setTimeout(()=>{
      alert((current===1?'黑':'白') + ' 無子可下，回合交給對方');
      current = other;
      render();
    },10);
    return;
  }

  const s = computeScore();
  let msg = `遊戲結束：黑 ${s.b} : 白 ${s.w}。`;
  if(s.b > s.w) msg += ' 黑勝！';
  else if(s.w > s.b) msg += ' 白勝！';
  else msg += ' 平手！';
  setTimeout(()=>alert(msg),10);
}

restartBtn.addEventListener('click', initBoard);

// 啟動
initBoard();
