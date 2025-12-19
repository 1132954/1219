const SIZE = 8;
let board = [];
let current = 1; // 1=玩家(黑) 2=電腦(白)

const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('currentPlayer');
const blackScoreEl = document.getElementById('blackScore');
const whiteScoreEl = document.getElementById('whiteScore');
const restartBtn = document.getElementById('restartBtn');

const DIRS = [
  [-1,-1],[-1,0],[-1,1],
  [0,-1],[0,1],
  [1,-1],[1,0],[1,1]
];

function initBoard(){
  board = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  const m = SIZE/2;
  board[m-1][m-1] = 2;
  board[m][m] = 2;
  board[m-1][m] = 1;
  board[m][m-1] = 1;
  current = 1;
  render();
}

function within(r,c){ return r>=0 && r<SIZE && c>=0 && c<SIZE; }

function flipsForMove(r,c,player){
  if(board[r][c]!==0) return [];
  const opp = player===1?2:1;
  let result = [];
  for(const [dr,dc] of DIRS){
    let rr=r+dr, cc=c+dc;
    const line=[];
    while(within(rr,cc)&&board[rr][cc]===opp){
      line.push([rr,cc]);
      rr+=dr; cc+=dc;
    }
    if(line.length && within(rr,cc)&&board[rr][cc]===player){
      result=result.concat(line);
    }
  }
  return result;
}

function getLegalMoves(player){
  const m=new Map();
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++){
      const f=flipsForMove(r,c,player);
      if(f.length) m.set(`${r},${c}`,f);
    }
  return m;
}

function computeScore(){
  let b=0,w=0;
  board.flat().forEach(v=>{
    if(v===1)b++;
    if(v===2)w++;
  });
  return {b,w};
}

function placeMoveAnimated(r,c,player,flips,done){
  board[r][c]=player;
  render();
  flips.forEach(([rr,cc],i)=>{
    setTimeout(()=>{
      board[rr][cc]=player;
      render();
      const piece=document.querySelector(`.cell[data-r="${rr}"][data-c="${cc}"] .piece`);
      if(piece) piece.classList.add('flip');
      if(i===flips.length-1 && done) setTimeout(done,200);
    }, i*120);
  });
  if(flips.length===0 && done) done();
}

/* ===== AI ===== */
function aiMove(){
  if(current!==2) return;
  const moves=getLegalMoves(2);
  if(moves.size===0){ current=1; render(); return; }
  let best=null,max=-1;
  for(const [k,f] of moves){
    if(f.length>max){
      max=f.length;
      const [r,c]=k.split(',').map(Number);
      best={r,c,flips:f};
    }
  }
  placeMoveAnimated(best.r,best.c,2,best.flips,()=>{
    current=1;
    render();
  });
}

/* ===== UI ===== */
function render(){
  boardEl.innerHTML='';
  const moves=getLegalMoves(current);

  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++){
      const cell=document.createElement('div');
      cell.className='cell';
      cell.dataset.r=r;
      cell.dataset.c=c;

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
        h.textContent=moves.get(key).length;
        cell.appendChild(h);
        cell.onclick=()=>{ 
          placeMoveAnimated(r,c,1,moves.get(key),()=>{
            current=2;
            render();
            setTimeout(aiMove,400);
          });
        };
      }else{
        cell.classList.add('disabled');
      }

      boardEl.appendChild(cell);
    }

  const s=computeScore();
  blackScoreEl.textContent=s.b;
  whiteScoreEl.textContent=s.w;
  currentPlayerEl.textContent=current===1?'黑（你）':'白（電腦）';
}

restartBtn.onclick=initBoard;
initBoard();








