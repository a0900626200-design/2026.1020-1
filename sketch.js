// 定義總題數（共6題）
let totalQuestions = 6;

// 儲存六個拖曳題的資料與狀態
let quizItems = [
  { id: 0, titleText: "1. 建立畫布的函式是？", gifType: "canvas", correctAns: "createCanvas()", currentX: 0, currentY: 0, origX: 0, origY: 0, matched: false },
  { id: 1, titleText: "2. 設定背景顏色的函式是？", gifType: "background", correctAns: "background()", currentX: 0, currentY: 0, origX: 0, origY: 0, matched: false },
  { id: 2, titleText: "3. 繪製橢圓形的函式是？", gifType: "ellipse", correctAns: "ellipse()", currentX: 0, currentY: 0, origX: 0, origY: 0, matched: false },
  { id: 3, titleText: "4. 設定填滿顏色的函式是？", gifType: "fill", correctAns: "fill()", currentX: 0, currentY: 0, origX: 0, origY: 0, matched: false },
  { id: 4, titleText: "5. 設定外框顏色的函式是？", gifType: "stroke", correctAns: "stroke()", currentX: 0, currentY: 0, origX: 0, origY: 0, matched: false },
  { id: 5, titleText: "6. 繪製矩形的函式是？", gifType: "rect", correctAns: "rect()", currentX: 0, currentY: 0, origX: 0, origY: 0, matched: false }
];

// 所有可供拖曳的選項文字（隨機打亂順序）
let options = [
  "createCanvas()",
  "background()",
  "ellipse()",
  "fill()",
  "stroke()",
  "rect()"
];

// 目前被滑鼠選中拖曳的選項物件
let draggedOption = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// 成績與作答狀態
let submitted = false;
let score = 0;
let submitButton;

// 彩帶特效的粒子陣列
let confettiParticles = [];
let showConfetti = false;

// 選項方塊陣列
let optionBoxes = [];
let isInitializedOptions = false;

// 程式初始化設定函式
function setup() {
  // 建立全螢幕響應式畫布
  createCanvas(windowWidth, windowHeight);
  
  // 將選項陣列隨機打亂，增加測驗挑戰性
  options = shuffle(options);
  
  // 建立「交卷看成績」按鈕
  submitButton = createButton('交卷看成績');
  updateSubmitButtonPosition();
  submitButton.style('font-size', '18px');
  submitButton.style('padding', '10px 20px');
  submitButton.style('background-color', '#4CAF50');
  submitButton.style('color', 'white');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '5px');
  submitButton.style('cursor', 'pointer');
  
  // 設定按鈕點擊事件，觸發交卷評分
  submitButton.mousePressed(submitQuiz);
}

// 每秒執行多次的畫面更新繪製函式
function draw() {
  // 設定畫布背景顏色
  background(240, 243, 246);
  
  // 繪製主標題文字
  fill(33);
  noStroke();
  textSize(24);
  textAlign(CENTER, TOP);
  text("p5.js 簡易程式設計 - 互動拖曳測驗系統", width / 2, 20);
  
  // 繪製操作說明文字
  textSize(14);
  fill(100);
  text("請將下方的正確程式碼選項，拖曳到上方對應的題目答案框內，完成後點擊交卷！", width / 2, 55);
  
  // 繪製六個題目的版面與題目區塊
  drawQuizLayout();
  
  // 繪製下方的可拖曳選項卡片
  drawDraggableOptions();
  
  // 如果已經交卷，疊加顯示總成績結算畫面
  if (submitted) {
    drawScoreResult();
  }
  
  // 如果成績高於 60% 且已交卷，持續更新並繪製彩帶特效
  if (showConfetti) {
    updateAndDrawConfetti();
  }
}

// 當瀏覽器視窗大小改變時自動觸發的響應式調整函式
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateSubmitButtonPosition();
  recalculateLayoutPositions();
}

// 動態計算並更新交卷按鈕的位置於畫面下方正中央
function updateSubmitButtonPosition() {
  submitButton.position(width / 2 - 60, height - 60);
}

// 重新計算題目卡片與選項卡片的座標位置
function recalculateLayoutPositions() {
  let cols = 3;
  let cardWidth = min(320, (width - 80) / 3);
  let cardHeight = 220;
  let startX = (width - (cols * cardWidth + (cols - 1) * 20)) / 2;
  let startY = 90;
  
  // 計算每一個題目卡片的排版座標
  for (let i = 0; i < quizItems.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    quizItems[i].boxX = startX + col * (cardWidth + 20);
    quizItems[i].boxY = startY + row * (cardHeight + 15);
    quizItems[i].boxW = cardWidth;
    quizItems[i].boxH = cardHeight;
  }
  
  // 初始化下方選項卡片的初始位置
  if (!isInitializedOptions) {
    optionBoxes = [];
    let optStartX = width / 2 - 360;
    let optY = height - 140;
    for (let i = 0; i < options.length; i++) {
      optionBoxes.push({
        text: options[i],
        x: optStartX + (i % 3) * 240 + 20,
        y: optY + floor(i / 3) * 50,
        w: 200,
        h: 40,
        assignedQuizId: null // 記錄此選項目前被放進哪一個題目中
      });
    }
    isInitializedOptions = true;
  }
}

// 繪製所有的題目卡片與模擬動畫區塊
function drawQuizLayout() {
  if (!isInitializedOptions) {
    recalculateLayoutPositions();
  }
  
  for (let i = 0; i < quizItems.length; i++) {
    let q = quizItems[i];
    
    // 繪製題目卡片外框底圖
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(q.boxX, q.boxY, q.boxW, q.boxH, 10);
    
    // 顯示題目名稱文字
    fill(20);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text(q.titleText, q.boxX + 15, q.boxY + 12);
    
    // 繪製上方模擬動畫 GIF 的展示背景框
    fill(245, 247, 250);
    stroke(220);
    rect(q.boxX + 15, q.boxY + 38, q.boxW - 30, 80, 6);
    
    // 利用 p5.js 圖形動態展示模擬 GIF 動畫效果（無須載入外部檔案，避免 404 錯誤）
    push();
    translate(q.boxX + q.boxW / 2, q.boxY + 78);
    fill(100, 150, 255, 150);
    noStroke();
    let animSize = 25 + sin(frameCount * 0.1 + i) * 8;
    if (q.gifType === "canvas") rect(-20, -15, 40, 30, 4);
    else if (q.gifType === "background") ellipse(0, 0, animSize * 1.5);
    else if (q.gifType === "ellipse") ellipse(0, 0, animSize);
    else if (q.gifType === "fill") { fill(255, 100, 100); ellipse(0, 0, animSize); }
    else if (q.gifType === "stroke") { noFill(); stroke(0, 0, 255); strokeWeight(3); ellipse(0, 0, animSize); }
    else if (q.gifType === "rect") rect(-animSize/2, -animSize/2, animSize, animSize);
    pop();
    
    // 繪製下方放置答案的目標框
    fill(255, 255, 255);
    stroke(150, 180, 220);
    strokeWeight(1.5);
    rect(q.boxX + 15, q.boxY + 130, q.boxW - 30, 45, 6);
    
    fill(150);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text("請將答案拖曳至此處", q.boxX + q.boxW / 2, q.boxY + 152.5);
  }
}

// 繪製畫面下方所有可供拖曳的文字選項卡片
function drawDraggableOptions() {
  for (let i = 0; i < optionBoxes.length; i++) {
    let opt = optionBoxes[i];
    
    // 如果選項已經被放進題目中，讓它的座標自動貼齊該題目的答題放置框
    if (opt.assignedQuizId !== null) {
      let q = quizItems[opt.assignedQuizId];
      opt.x = q.boxX + 15;
      opt.y = q.boxY + 130;
      opt.w = q.boxW - 30;
      opt.h = 45;
    }
    
    // 繪製選項卡片背景（被拖曳時變色）
    if (draggedOption === opt) {
      fill(220, 235, 255);
      stroke(0, 120, 255);
      strokeWeight(2);
    } else {
      fill(255);
      stroke(180);
      strokeWeight(1);
    }
    
    rect(opt.x, opt.y, opt.w, opt.h, 6);
    
    // 繪製選項卡片內的文字
    fill(30);
    noStroke();
    textSize(15);
    textAlign(CENTER, CENTER);
    text(opt.text, opt.x + opt.w / 2, opt.y + opt.h / 2);
  }
}

// 滑鼠按下事件：檢查是否點擊並選中某個選項準備拖曳
function mousePressed() {
  if (submitted) return; // 已交卷後鎖定拖曳
  
  for (let i = optionBoxes.length - 1; i >= 0; i--) {
    let opt = optionBoxes[i];
    if (mouseX >= opt.x && mouseX <= opt.x + opt.w &&
        mouseY >= opt.y && mouseY <= opt.y + opt.h) {
      
      // 如果選項原本在某個題目中，點擊後先把它從題目中拿出來
      if (opt.assignedQuizId !== null) {
        quizItems[opt.assignedQuizId].matched = false;
        opt.assignedQuizId = null;
        opt.w = 200;
        opt.h = 40;
      }
      
      draggedOption = opt;
      dragOffsetX = mouseX - opt.x;
      dragOffsetY = mouseY - opt.y;
      break;
    }
  }
}

// 滑鼠拖曳事件：讓選中的選項跟隨滑鼠游標移動
function mouseDragged() {
  if (draggedOption !== null) {
    draggedOption.x = mouseX - dragOffsetX;
    draggedOption.y = mouseY - dragOffsetY;
  }
}

// 滑鼠放開事件：檢查選項是否放入題目的答題區內
function mouseReleased() {
  if (draggedOption !== null) {
    let droppedInQuiz = false;
    
    for (let i = 0; i < quizItems.length; i++) {
      let q = quizItems[i];
      // 判斷滑鼠放開時是否落在該題目的答題框範圍內
      if (mouseX >= q.boxX + 15 && mouseX <= q.boxX + q.boxW - 15 &&
          mouseY >= q.boxY + 130 && mouseY <= q.boxY + 175) {
        
        // 如果該題目已經有其他選項，先將舊選項釋放
        for (let j = 0; j < optionBoxes.length; j++) {
          if (optionBoxes[j].assignedQuizId === i) {
            optionBoxes[j].assignedQuizId = null;
            optionBoxes[j].w = 200;
            optionBoxes[j].h = 40;
            let optStartX = width / 2 - 360;
            let optY = height - 140;
            optionBoxes[j].x = optStartX + (j % 3) * 240 + 20;
            optionBoxes[j].y = optY + floor(j / 3) * 50;
          }
        }
        
        // 將當前拖曳的選項綁定至此題目
        draggedOption.assignedQuizId = i;
        q.matched = true;
        droppedInQuiz = true;
        break;
      }
    }
    
    draggedOption = null;
  }
}

// 點擊「交卷看成績」按鈕後執行的計分與判定函式
function submitQuiz() {
  score = 0;
  
  // 比對每個選項放對的題目是否正確
  for (let i = 0; i < optionBoxes.length; i++) {
    let opt = optionBoxes[i];
    if (opt.assignedQuizId !== null) {
      if (opt.text === quizItems[opt.assignedQuizId].correctAns) {
        score++;
      }
    }
  }
  
  submitted = true;
  
  // 計算百分比分數，若高於 60%（即 4 題以上正確）則啟動彩帶特效畫布
  let percentage = (score / totalQuestions) * 100;
  if (percentage >= 60) {
    showConfetti = true;
    initConfetti();
  } else {
    showConfetti = false;
  }
}

// 繪製交卷後的總成績結算彈窗畫面
function drawScoreResult() {
  push();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  fill(255);
  noStroke();
  let modalW = 400;
  let modalH = 220;
  let modalX = width / 2 - modalW / 2;
  let modalY = height / 2 - modalH / 2;
  rect(modalX, modalY, modalW, modalH, 15);
  
  fill(30);
  textSize(22);
  textAlign(CENTER, TOP);
  text("測驗成績結算", width / 2, modalY + 25);
  
  textSize(18);
  fill(60);
  text(`答對題數：${score} / ${totalQuestions} 題`, width / 2, modalY + 75);
  
  let percentage = floor((score / totalQuestions) * 100);
  let gradeText = percentage >= 60 ? "🎉 及格！恭喜您通過測驗！" : "💪 再接再厲，多練習幾次就會囉！";
  
  textSize(16);
  fill(percentage >= 60 ? 30 : 200, percentage >= 60 ? 150 : 50, 50);
  text(`總得分：${percentage}% (${gradeText})`, width / 2, modalY + 115);
  
  fill(100);
  textSize(13);
  text("（重新整理網頁即可重新測驗）", width / 2, modalY + 170);
  pop();
}

// 初始化彩帶特效的粒子陣列
function initConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      sizeX: random(8, 15),
      sizeY: random(4, 8),
      speedY: random(2, 6),
      speedX: random(-2, 2),
      color: color(random(255), random(255), random(255)),
      angle: random(TWO_PI),
      spin: random(0.02, 0.1)
    });
  }
}

// 更新並繪製彩帶特效的動畫運作
function updateAndDrawConfetti() {
  for (let i = 0; i < confettiParticles.length; i++) {
    let p = confettiParticles[i];
    p.y += p.speedY;
    p.x += p.speedX + sin(p.angle) * 1;
    p.angle += p.spin;
    
    // 如果彩帶掉落出畫面下方，則重置回頂端重新落下
    if (p.y > height) {
      p.y = random(-50, 0);
      p.x = random(width);
    }
    
    push();
    translate(p.x, p.y);
    rotate(p.angle);
    fill(p.color);
    noStroke();
    rect(-p.sizeX / 2, -p.sizeY / 2, p.sizeX, p.sizeY, 2);
    pop();
  }
}