const SIZE = 8;
let board = [], current = 1; // 1=玩家(黑) 2=電腦(白)

const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('currentPlayer');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const restartBtn = document.getElementById('restartBtn');

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

// 初始化棋盤
function initBoard(){
  board = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  const m = SIZE/2;
  board[m-1][m-1]=2; board[m][m]=2; board[m-1][m]=1; board[m][m-1]=1;
  current=1;
  render();
}

// 判斷座標是否在棋盤內
function within(r,c){ return r>=0 && r<SIZE && c>=0 && c<SIZE; }

// 計算落子可翻棋
function flipsForMove(r,c,player){
  if(board[r][c]!==0) return [];
  const opp = player===1?2:1;
  let result=[];
  for(const [dr,dc] of DIRS){
    let rr=r+dr, cc=c+dc, line=[];
    while(within(rr,cc)&&board[rr][cc]===opp){ line.push([rr,cc]); rr+=dr; cc+=dc; }
    if(line.length && within(rr,cc) && board[rr][cc]===player) result=result.concat(line);
  }
  return result;
}

// 取得所有合法落子
function getLegalMoves(player){
  const m=new Map();
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const f=flipsForMove(r,c,player);
    if(f.length) m.set(`${r},${c}`,f);
  }
  return m;
}

// 計算分數
function computeScore(){
  let b=0,w=0;
  board.flat().forEach(v=>{ if(v===1)b++; if(v===2)w++; });
  return {b,w};
}

// 放置棋子並依序翻棋動畫
function placeMoveAnimated(r,c,player,flips,done){
  board[r][c]=player;
  render();

  let index=0;
  function flipNext(){
    if(index>=flips.length){ if(done) done(); return; }
    const [rr,cc]=flips[index];
    const piece=document.querySelector(`.cell[data-r="${rr}"][data-c="${cc}"] .piece`);
    if(piece){
      piece.classList.add('flip');
      setTimeout(()=>{ board[rr][cc]=player; render(); }, 500); // 半途改顏色
      setTimeout(()=>{ index++; flipNext(); }, 1000); // 每顆棋 1 秒
    } else { index++; flipNext(); }
  }
  flipNext();
  if(flips.length===0 && done) done();
}

// AI 行動
function aiMove(){
  if(current!==2) return;
  const moves=getLegalMoves(2);
  if(moves.size===0){ current=1; render(); return; }

  // 簡單策略：選擇翻棋最多的落子
  let best=null, max=-1;
  for(const [k,f] of moves){
    if(f.length>max){ max=f.length; const [r,c]=k.split(',').map(Number); best={r,c,flips:f}; }
  }

  placeMoveAnimated(best.r,best.c,2,best.flips, ()=>{
    current=1;
    render();
    checkEnd();
  });
}

// 渲染棋盤
function render(){
  boardEl.innerHTML='';
  const moves=getLegalMoves(current);

  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const cell=document.createElement('div'); cell.className='cell'; cell.dataset.r=r; cell.dataset.c=c;
    if(board[r][c]){
      const p=document.createElement('div');
      p.className='piece '+(board[r][c]===1?'black':'white');
      cell.appendChild(p);
    }

    const key=`${r},${c}`;
    if(current===1 && moves.has(key)){
      cell.classList.add('possible');
      const h=document.createElement('div');
      h.className='hint';
      h.textContent = moves.get(key).length;
      cell.appendChild(h);

      // 玩家下棋
      cell.onclick = ()=>{
        const flips = moves.get(key);
        placeMoveAnimated(r,c,1,flips,()=>{
          current=2;
          render();
          aiMove(); // 玩家動畫完成後，AI 才行動
        });
      };
    } else { cell.classList.add('disabled'); }

    boardEl.appendChild(cell);
  }

  const s=computeScore();
  blackScoreEl.textContent = s.b;
  whiteScoreEl.textContent = s.w;
  currentPlayerEl.textContent = current===1?'黑（你）':'白（電腦）';
}

// 判斷遊戲是否結束
function checkEnd(){
  if(getLegalMoves(1).size===0 && getLegalMoves(2).size===0){
    const s=computeScore();
    alert(`遊戲結束！\n黑：${s.b} 白：${s.w}`);
  }
}

restartBtn.onclick = initBoard;
initBoard();








