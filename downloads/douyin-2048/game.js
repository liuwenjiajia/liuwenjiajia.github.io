// 2048 抖音小游戏版
const { windowWidth, windowHeight, pixelRatio } = tt.getSystemInfoSync();

// 创建画布
const canvas = tt.createCanvas();
const ctx = canvas.getContext('2d');

// 游戏配置
const GRID_SIZE = 4;
const PADDING = 15;
const BOARD_SIZE = Math.min(windowWidth - 40, 400);
const CELL_SIZE = (BOARD_SIZE - PADDING * 5) / 4;
const BOARD_X = (windowWidth - BOARD_SIZE) / 2;
const BOARD_Y = 180;

// 颜色配置
const COLORS = {
  0: { bg: 'rgba(238, 228, 218, 0.35)', text: '#776e65' },
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
  4096: { bg: '#3c3a32', text: '#f9f6f2' },
  8192: { bg: '#3c3a32', text: '#f9f6f2' }
};

// 游戏状态
let grid = [];
let score = 0;
let best = 0;
let gameOver = false;
let gameWon = false;

// 读取最高分
try {
  const res = tt.getStorageSync('best2048');
  if (res) best = res;
} catch (e) {}

// 初始化游戏
function initGame() {
  grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  score = 0;
  gameOver = false;
  gameWon = false;
  addNewTile();
  addNewTile();
  render();
}

// 添加新方块
function addNewTile() {
  const empty = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) empty.push({ i, j });
    }
  }
  if (empty.length > 0) {
    const { i, j } = empty[Math.floor(Math.random() * empty.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
  }
}

// 滑动合并
function slide(row) {
  let arr = row.filter(x => x !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      if (arr[i] === 2048 && !gameWon) {
        gameWon = true;
      }
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < GRID_SIZE) arr.push(0);
  return arr;
}

// 移动
function move(direction) {
  if (gameOver) return;
  
  const oldGrid = JSON.stringify(grid);

  if (direction === 'left') {
    for (let i = 0; i < GRID_SIZE; i++) {
      grid[i] = slide(grid[i]);
    }
  } else if (direction === 'right') {
    for (let i = 0; i < GRID_SIZE; i++) {
      grid[i] = slide(grid[i].reverse()).reverse();
    }
  } else if (direction === 'up') {
    for (let j = 0; j < GRID_SIZE; j++) {
      let col = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
      col = slide(col);
      for (let i = 0; i < GRID_SIZE; i++) grid[i][j] = col[i];
    }
  } else if (direction === 'down') {
    for (let j = 0; j < GRID_SIZE; j++) {
      let col = [grid[3][j], grid[2][j], grid[1][j], grid[0][j]];
      col = slide(col);
      for (let i = 0; i < GRID_SIZE; i++) grid[3 - i][j] = col[i];
    }
  }

  if (JSON.stringify(grid) !== oldGrid) {
    addNewTile();
    if (score > best) {
      best = score;
      try {
        tt.setStorageSync('best2048', best);
      } catch (e) {}
    }
    
    if (!canMove()) {
      gameOver = true;
    }
  }

  render();
}

// 检查是否可以移动
function canMove() {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) return true;
      if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return true;
      if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return true;
    }
  }
  return false;
}

// 渲染
function render() {
  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, windowWidth, windowHeight);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, windowWidth, windowHeight);

  // 标题
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('2048', windowWidth / 2, 70);

  // 分数
  ctx.font = '16px Arial';
  ctx.fillText(`分数: ${score}  |  最高: ${best}`, windowWidth / 2, 110);

  // 游戏面板背景
  ctx.fillStyle = '#bbada0';
  roundRect(ctx, BOARD_X, BOARD_Y, BOARD_SIZE, BOARD_SIZE, 10);

  // 绘制格子
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const value = grid[i][j];
      const x = BOARD_X + PADDING + j * (CELL_SIZE + PADDING);
      const y = BOARD_Y + PADDING + i * (CELL_SIZE + PADDING);

      const color = COLORS[value] || COLORS[0];
      ctx.fillStyle = color.bg;
      roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 6);

      if (value > 0) {
        ctx.fillStyle = color.text;
        ctx.font = value >= 1000 ? 'bold 24px Arial' : value >= 100 ? 'bold 32px Arial' : 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    }
  }

  // 新游戏按钮
  const btnWidth = 120;
  const btnHeight = 45;
  const btnX = (windowWidth - btnWidth) / 2;
  const btnY = BOARD_Y + BOARD_SIZE + 30;
  
  ctx.fillStyle = '#8f7a66';
  roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 6);
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('新游戏', btnX + btnWidth / 2, btnY + btnHeight / 2);

  // 提示
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '14px Arial';
  ctx.fillText('滑动屏幕移动方块', windowWidth / 2, btnY + btnHeight + 40);

  // 游戏结束遮罩
  if (gameOver || gameWon) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, windowWidth, windowHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameWon ? '🎉 你赢了!' : '游戏结束', windowWidth / 2, windowHeight / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText(`最终得分: ${score}`, windowWidth / 2, windowHeight / 2 + 20);
    
    ctx.font = '18px Arial';
    ctx.fillText('点击屏幕重新开始', windowWidth / 2, windowHeight / 2 + 70);
  }
}

// 圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

// 触摸事件
let touchStartX = 0;
let touchStartY = 0;

tt.onTouchStart(e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

tt.onTouchEnd(e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // 检查是否点击新游戏按钮或游戏结束状态
  if (absDx < 10 && absDy < 10) {
    const btnWidth = 120;
    const btnHeight = 45;
    const btnX = (windowWidth - btnWidth) / 2;
    const btnY = BOARD_Y + BOARD_SIZE + 30;
    
    const tapX = e.changedTouches[0].clientX;
    const tapY = e.changedTouches[0].clientY;
    
    if ((tapX >= btnX && tapX <= btnX + btnWidth && tapY >= btnY && tapY <= btnY + btnHeight) || gameOver || gameWon) {
      initGame();
      return;
    }
  }

  // 滑动操作
  if (Math.max(absDx, absDy) > 30) {
    if (absDx > absDy) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  }
});

// 开始游戏
initGame();
