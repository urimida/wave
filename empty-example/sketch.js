// FANTA BUBBLE EFFECT - CLEANED VERSION
let input,
  resetBtn,
  message = "",
  bottleImage,
  bottleLabel = "";
let showBottle = false,
  customFont,
  bubbles = [],
  flavorColors = [];
let logoStyles = [],
  currentStyleIndex = 0,
  mouseInsideCanvas = true;
let letterScales = [1, 1, 1, 1, 1];
let letterStartFrames = [0, 15, 30, 45, 60]; // 각 글자 시작 frame 간격
let letterStates = Array(5).fill("wait"); // "shake", "settle", "hold"
let letterOffsetsX = [0, 0, 0, 0, 0];
let letterOffsetsY = [0, 0, 0, 0, 0]; // 수직 흔들림 전용
let logoScale = 1.0;
let exploded = false;
let popAlpha = 255;
let explosionFrame = 0;
let burstBubbles = [];
let hasBurst = false;
let pixelParticles = [];
let hasGeneratedPixels = false;
let pixelCycleTimer = 0;
let pixelCycleInterval = 130; // 약 5초 주기 (60프레임 기준)
let stickers = []; // 로고 스티커들
let fallingDelay = 120; // 2초를 60프레임 기준으로 설정 (120프레임)
let totalStickers = 200; // 총 스티커 수
let stickerDelay = 2; // 각 스티커가 생성되는 시간 간격 (프레임 기준)
let nextStickerTime = 0; // 다음 스티커가 생성될 시간
let allStickersCreated = false; // 모든 스티커가 생성되었는지 확인하는 변수
let stickerInterval = 1; // 스티커들 생성 간격 (초)
let stickerStartTime = 0; // 첫 번째 스티커가 생성되는 시간
let particles = [];
let tetrisCols = 10;
let tetrisRows = 20;
let tetrisCellSize;
let tetrisX, tetrisY;
let tetrisBoard = [];
let tetrisColors = [];
let currentPiece;
let tetrisFrame = 0;
let tetrisDropSpeed = 30; // 30 프레임마다 한 칸
let popSound;
let shakeOffsetX = 0;
let shakeOffsetY = 0;
let shakeTimer = 0;
let wallParticles = [];
let pixelExploded = false;
let pixelExplosionTriggeredAt = 0;
let marbles = []; // 구슬들 배열
let marbleRadius = 8; // 구슬 크기

function preload() {
  bottleImage = loadImage("../src/img/bottle.png");
  customFont = loadFont("../src/fonts/5fe150c1ede1675dbf2d62bed5163f1e.woff");
  soundFormats("mp3", "wav");
  popSound = loadSound("../src/sound/pop.mp3"); // 사운드 파일 경로
}

function setup() {
  textAlign(CENTER, CENTER);
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.mouseOver(() => (mouseInsideCanvas = true));
  canvas.mouseOut(() => (mouseInsideCanvas = false));
  window.addEventListener("blur", () => (mouseInsideCanvas = false));
  window.addEventListener("focus", () => (mouseInsideCanvas = true));

  logoStyles = [
    {
      bg: color(255),
      stroke: null,
      textColors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#EA4335"],
      bubbles: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
      backgroundBubbles: ["#EA4335", "#FBBC05", "#34A853"],
    },
    {
      bg: color(255, 0, 0),
      stroke: null,
      textColors: ["#000000", "#000000", "#000000", "#000000", "#000000"],
      bubbles: ["#323232", "#323232", "#3C3C3C"],
      backgroundBubbles: ["#000000", "#000000", "#000000"],
    },
    {
      bg: color(255),
      stroke: color(0),
      textColors: ["#EA4335", "#EA4335", "#EA4335", "#EA4335", "#EA4335"],
      bubbles: ["#EA4335", "#000000", "#000000"],
      backgroundBubbles: ["#EA4335", "#000000", "#EA4335"],
    },
    {
      bg: color(255),
      stroke: color(0),
      textColors: ["#2196F3", "#EA4335", "#34A853", "#2196F3", "#EA4335"],
      bubbles: ["#2196F3", "#EA4335", "#34A853"],
      backgroundBubbles: ["#34A853", "#2196F3", "#EA4335"],
    },
    {
      bg: color(255),
      stroke: null,
      textColors: ["#FFC107", "#44CFFF", "#78C164", "#44CFFF", "#F4436A"],
      bubbles: ["#FFEB3B", "#44CFFF", "#F4436A"],
      backgroundBubbles: ["#44CFFF", "#FFEB3B", "#44CFFF"],
    },
    {
      bg: color(255),
      stroke: null,
      textColors: ["#EA4335", "#FFC107", "#34A853", "#EA4335", "#34A853"],
      bubbles: ["#66BB6A", "#EA4335", "#2196F3"],
      backgroundBubbles: ["#66BB6A", "#EA4335", "#FFC107"],
    },
  ];

  flavorColors = logoStyles[currentStyleIndex].bubbles.map((c) => color(c));

  // 🆕 검색창 너비 크게 (580 → 1160)
  inputContainer = createDiv();
  inputContainer
    .style("position", "absolute")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "flex-start")
    .style("width", "1160px") // 2배로 키움
    .style("height", "60px") // 높이도 약간 키움
    .style("border-radius", "30px")
    .style("background", "#FFF")
    .style("box-shadow", "0px 4px 10px 3px rgba(0, 0, 0, 0.10)")
    .style("padding", "0 20px");

  const iconImg = createImg("../src/img/SearchImg.svg", "search icon");
  iconImg
    .style("width", "20px")
    .style("height", "20px")
    .style("margin-right", "15px");
  inputContainer.child(iconImg);

  input = createInput();
  input
    .style("flex", "1")
    .style("height", "80%")
    .style("border", "none")
    .style("outline", "none")
    .style("font-size", "20px")
    .attribute("placeholder", "Type and press Enter...");
  input.changed(dispense);
  inputContainer.child(input);

  resetBtn = createButton("Search Again");
  resetBtn
    .style("position", "absolute")
    .style("opacity", "0")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "8px 16px")
    .style("font-size", "16px")
    .style("border-radius", "10px")
    .style("cursor", "pointer");

  resetBtn.mouseOver(() => resetBtn.style("background", "#f0f0f0"));
  resetBtn.mouseOut(() => resetBtn.style("background", "#fff"));
  resetBtn.hide();
  resetBtn.mousePressed(reset);
}

function draw() {
  // 색상 초기화 (스타일 전환 시마다 갱신)
  flavorColors = logoStyles[currentStyleIndex].bubbles.map((c) => color(c));

  background(logoStyles[currentStyleIndex].bg);

  // 🎈 (1) 버블 생성 - 항상 실행
  if (frameCount % 3 === 0) {
    for (let i = 0; i < 3; i++) {
      const randX = random(width);
      const randY = random(height * 0.9);
      bubbles.push(new Bubble(randX, randY, true));
    }
  }
  if (frameCount % 2 === 0 && mouseInsideCanvas) {
    for (let i = 0; i < 2; i++) {
      const offsetX = random(-15, 15);
      const offsetY = random(-15, 15);
      bubbles.push(new Bubble(mouseX + offsetX, mouseY + offsetY));
    }
  }

  // 🫧 (2) 버블 표시 - 병보다 먼저
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
    }
  }

  // 🌠 (3) 벽 파티클
  for (let i = wallParticles.length - 1; i >= 0; i--) {
    wallParticles[i].update();
    wallParticles[i].display();
    if (wallParticles[i].isDead()) {
      wallParticles.splice(i, 1);
    }
  }

  // 💥 흔들림 효과
  if (shakeTimer > 0) {
    shakeOffsetX = random(-5, 5);
    shakeOffsetY = random(-5, 5);
    shakeTimer--;
  } else {
    shakeOffsetX = 0;
    shakeOffsetY = 0;
  }

  push();
  translate(shakeOffsetX, shakeOffsetY);

  // 💥 폭발 버블
  for (let i = burstBubbles.length - 1; i >= 0; i--) {
    burstBubbles[i].update();
    burstBubbles[i].display();
    if (burstBubbles[i].isDead()) {
      burstBubbles.splice(i, 1);
    }
  }

  // 🎉 로고 스타일 0 - 폭발 애니메이션
  if (currentStyleIndex === 0) {
    if (!exploded) {
      logoScale += 0.005;
      if (logoScale >= 1.6) {
        exploded = true;
        popAlpha = 255;
        explosionFrame = frameCount;
        if (!hasBurst) {
          createBurstBubbles();
          hasBurst = true;
        }
      }
    } else {
      popAlpha -= 10;
      if (popAlpha < 0) popAlpha = 0;
      if (frameCount - explosionFrame > 60) resetExplosion();
    }
  } else {
    logoScale = 1.0;
    exploded = false;
  }

  // 🔤 로고 흔들림 (Style 0)
  if (currentStyleIndex === 0) {
    for (let i = 0; i < 5; i++) {
      const elapsed = frameCount - letterStartFrames[i];
      if (elapsed < 90) {
        letterStates[i] = "shake";
        letterScales[i] = 1 + 0.05 * sin(radians(frameCount * 10 + i * 30));
        const dir = i % 2 === 0 ? -1 : 1;
        letterOffsetsY[i] = dir * 3 * sin(radians(frameCount * 15 + i * 40));
      } else if (elapsed < 120) {
        letterStates[i] = "settle";
        const t = map(elapsed, 90, 120, 0, 1);
        letterScales[i] = lerp(letterScales[i], 1, t);
        letterOffsetsY[i] = lerp(letterOffsetsY[i], 0, t);
      } else if (elapsed < 300) {
        letterStates[i] = "hold";
        letterScales[i] = 1;
        letterOffsetsY[i] = 0;
      } else {
        letterStartFrames[i] = frameCount + i * 20;
        letterStates[i] = "wait";
      }
    }
  } else {
    letterScales.fill(1);
    letterOffsetsX.fill(0);
  }

// 🧃 병 이미지 (showBottle)
if (showBottle) {
  imageMode(CENTER);
  const maxHeightRatio = 0.4;
  const maxBottleHeight = height * maxHeightRatio;
  const scale = maxBottleHeight / bottleImage.height;
  const scaledWidth = bottleImage.width * scale * 2;  // 병 크기 2배로 키움
  const scaledHeight = bottleImage.height * scale * 2; // 병 크기 2배로 키움
  const centerY = height * 0.55;

  // **제목을 병 이미지 위로 표시**
  textFont(customFont); // 커스텀 폰트 적용
  fill(0);
  textSize(150);
  textAlign(CENTER, CENTER);
  text(bottleLabel, width / 2, centerY - scaledHeight / 2 - 30); // 병 이미지 위에 텍스트

  // 병 이미지 그리기
  image(bottleImage, width / 2, centerY, scaledWidth, scaledHeight);

  // 메시지 텍스트
  textSize(18);
  setEnglishFont(message);
  text(message, width / 2, centerY + scaledHeight / 2 + 60);

  // 리셋 버튼 크기 두 배로 키우기
  resetBtn.style("padding", "16px 32px");  // 버튼 크기 2배로 키우기
  resetBtn.style("font-size", "32px");  // 글자 크기도 키우기
  resetBtn.style("font-family", "customFont");  // 커스텀 폰트 적용

  // 리셋 버튼 마진-탑 20픽셀 추가
  resetBtn.style("margin-top", "20px");
}

  // 🎉 Style 2: 스티커 효과
  if (currentStyleIndex === 2) {
    createStickers();
    for (let i = stickers.length - 1; i >= 0; i--) {
      stickers[i].update();
      stickers[i].display();
      if (stickers[i].isDead()) stickers.splice(i, 1);
    }
  }

  // 🟢 Style 3: 로고 주변 입자
  if (currentStyleIndex === 3) {
    if (particles.length === 0) createParticles();
    drawParticles();
  }

  // ⬛ Style 4: 테트리스
  if (currentStyleIndex === 4 && tetrisFrame === 0) initTetris();
  if (currentStyleIndex === 4) {
    updateTetris();
    drawTetris();
  }

  if (currentStyleIndex === 5) {
    if (particles.length === 0) createParticles();

    drawParticles();
  }

  // 🔠 로고 텍스트 + 스타일
  const groupY = height * 0.4;
  push();
  translate(width / 2, groupY);
  const baseScale = min(width, height) / 1000;
  scale(baseScale * (currentStyleIndex === 0 ? 1.2 * logoScale : 1.2));
  const logoWidth = 349;
  translate(-logoWidth / 2, -100);
  drawLogo(groupY);
  pop();

  // ✨ Style 1: 픽셀 효과
  if (currentStyleIndex === 1) {
    if (!hasGeneratedPixels) {
      generatePixelParticlesFromVector();
      hasGeneratedPixels = true;
    }

    push();
    for (let p of pixelParticles) {
      p.update();
      p.display();
    }
    pop();

    if (frameCount - pixelCycleTimer > 120) {
      for (let p of pixelParticles) {
        if (p.state === "waiting") {
          p.vx = random(-4, 4);
          p.vy = random(-6, -2);
          p.state = "exploding";
        }
      }
      pixelCycleTimer = frameCount;
    }
  }

  // 🔤 입력창 위치
  inputContainer.position((width - 1160) / 2, height * 0.7);

  pop(); // 흔들림 끝
}

function drawLogo(groupY) {
  // 로고가 폭발했으면 기본 스타일은 그리지 않음
  if (currentStyleIndex === 0 && exploded) return;

  // 외곽선 있는 경우만 stroke 설정 (2번 인덱스 제외)
  if (logoStyles[currentStyleIndex].stroke && currentStyleIndex !== 2) {
    // 2번 인덱스에서는 로고의 스트로크를 유지하고, 스티커에만 영향을 주도록
    stroke(logoStyles[currentStyleIndex].stroke);
    strokeWeight(4);
  } else {
    noStroke();
  }

  // 로고 바탕 쉐입
  fill(255);
  beginShape();
  vertex(0, 22.63);
  vertex(75.49, 14.48);
  vertex(80.91, 31.7);
  vertex(113.92, 28.06);
  vertex(116.17, 34.42);
  vertex(174.49, 27.62);
  vertex(175.41, 7.25);
  vertex(216.09, 2.72);
  vertex(216.99, 8.15);
  vertex(290.68, 0);
  vertex(295.19, 33.06);
  vertex(318.7, 31.7);
  vertex(349, 108.19);
  vertex(159.13, 249);
  vertex(14.92, 142.6);
  endShape(CLOSE);

  // 1번 스타일은 픽셀 입자 효과!
  if (currentStyleIndex === 1) {
    // 입자 미리 생성 안 됐으면 생성
    if (!hasGeneratedPixels) {
      generatePixelParticlesFromVector();
      hasGeneratedPixels = true;
    }
    return;
  }

  // ✅ 일반 스타일은 텍스트만 렌더링
  noStroke();
  push();
  translate(15, 25);
  drawF();
  push();
  translate(-2, 0);
  drawA1();
  drawN();
  drawT();
  drawA2();
  pop();
  pop();
}

function createStickers() {
  if (stickers.length >= totalStickers) {
    allStickersCreated = true; // 모든 스티커가 생성되면 true
    return; // 스티커가 다 생성되었으면 더 이상 생성하지 않음
  }

  if (frameCount >= nextStickerTime) {
    // 스티커를 생성할 시간에 도달했으면
    stickers.push(new Sticker()); // 새로운 스티커 생성 (지연 없음, 바로 생성)
    nextStickerTime = frameCount + stickerInterval; // 다음 스티커 생성 시간 갱신
  }
}
class Sticker {
  constructor() {
    this.x = random(width); // 화면 내 랜덤 x 위치
    this.y = random(height * 0.4); // 화면 안쪽에 위치 (위쪽에 위치)
    this.angle = random(TWO_PI); // 랜덤한 각도
    this.scale = random(0.2, 0.5); // 크기 더 작게 설정
    this.speed = random(2, 5); // 떨어지는 속도
    this.alpha = 255; // 투명도
    this.dropped = false; // 초기에는 떨어지지 않음
  }

  update() {
    if (!this.dropped) {
      if (frameCount >= stickerStartTime) {
        this.dropped = true;
      }
    }

    if (this.dropped) {
      this.y += this.speed;

      // ✨ 2번 인덱스일 경우 천천히 투명도 줄이기
      if (currentStyleIndex === 2) {
        this.alpha -= 0.8; // 💡 0.8 정도로 천천히 감소
        if (this.alpha < 0) this.alpha = 0; // 음수 방지
      }
    }
  }

  display() {
    if (currentStyleIndex === 2) {
      noStroke();
    } else {
      stroke(logoStyles[currentStyleIndex].stroke || 0);
      strokeWeight(4);
    }

    // ✨ 투명도 적용
    fill(255, this.alpha);

    push();
    translate(this.x, this.y);
    rotate(this.angle);
    scale(this.scale);
    drawLogo(); // 로고 그리기
    pop();
  }

  isDead() {
    return this.alpha <= 0; // 투명해진 후 삭제
  }
}

function createBurstBubbles() {
  const groupY = height * 0.4;
  const baseScale = min(width, height) / 1000;
  const finalScale = baseScale * 1.2 * logoScale;

  // 로고 translate 및 스케일 적용 이후의 중심 계산
  const logoWidth = 349;
  const logoOffsetX = -logoWidth / 2;
  const logoOffsetY = -100;

  // 💥 로고 중심보다 약간 위쪽으로 (125 → 90)
  const burstX = width / 2 + (logoOffsetX + logoWidth / 2) * finalScale;
  const burstY = groupY + (logoOffsetY + 90) * finalScale;

  const count = 80; // 풍부하게
  for (let i = 0; i < count; i++) {
    const angle = random(TWO_PI);
    const speed = random(3, 9);
    const vx = cos(angle) * speed;
    const vy = sin(angle) * speed;

    const col = color(random(flavorColors));
    const bubble = new BurstBubble(burstX, burstY, vx, vy, col);

    // 💥 사이즈 다양화
    bubble.radius = random(12, 40);

    burstBubbles.push(bubble);
  }
}
function generatePixelParticlesFromVector() {
  pixelParticles = [];

  // 화면 전체 크기와 동일한 그래픽 버퍼 생성
  const pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(255);

  // ✅ 로고 위치 보정용 transform 추가
  const groupY = height * 0.4;
  const baseScale = min(width, height) / 1000;
  const scaleFactor = baseScale * 1.2;
  const logoWidth = 349;

  pg.push(); // pg 내부 transform
  pg.translate(width / 2, groupY);
  pg.scale(scaleFactor);
  pg.translate(-logoWidth / 2, -100);

  drawLogoVector(pg); // ✅ 이걸 transform 이후에 호출
  pg.pop();

  pg.loadPixels();

  for (let x = 0; x < pg.width; x += 3) {
    for (let y = 0; y < pg.height; y += 3) {
      const idx = 4 * (x + y * pg.width);
      const r = pg.pixels[idx];
      if (r < 200) {
        pixelParticles.push(new PixelParticle(x, y));
      }
    }
  }
}

function initTetris() {
  // 화면 전체 높이에 맞춰 블록 크기 설정 (전체를 다 쓰기 위함)
  tetrisCellSize = height / tetrisRows;

  // X 위치는 가운데 정렬
  tetrisX = (width - tetrisCols * tetrisCellSize) / 2;

  // Y 위치는 꼭대기부터 시작
  tetrisY = 0;

  // 보드 초기화
  tetrisBoard = Array.from({ length: tetrisRows }, () =>
    Array(tetrisCols).fill(null)
  );
  tetrisColors = logoStyles[4].textColors.map((c) => color(c));
  spawnPiece();

  tetrisFrame = 0; // 초기화 시 프레임 리셋도 잊지 말기
}
class StarParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(-3, -1);
    this.alpha = 255;
    this.size = random(4, 7);
    this.color = color(255, 255, 0, this.alpha); // 노란 별
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
    this.color.setAlpha(this.alpha);
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

function drawTetris() {
  for (let r = 0; r < tetrisRows; r++) {
    for (let c = 0; c < tetrisCols; c++) {
      const val = tetrisBoard[r][c];
      if (val !== null) {
        fill(val);
        stroke(255);
        rect(
          tetrisX + c * tetrisCellSize,
          tetrisY + r * tetrisCellSize,
          tetrisCellSize,
          tetrisCellSize
        );
      }
    }
  }

  // 현재 조각 그리기
  if (currentPiece) {
    fill(currentPiece.color);
    for (let b of currentPiece.blocks) {
      const px = currentPiece.x + b[0];
      const py = currentPiece.y + b[1];
      rect(
        tetrisX + px * tetrisCellSize,
        tetrisY + py * tetrisCellSize,
        tetrisCellSize,
        tetrisCellSize
      );
    }
  }
}

function spawnPiece() {
  const shapes = [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ], // O
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [2, 0],
    ], // I
    [
      [0, 0],
      [-1, 0],
      [0, 1],
      [1, 1],
    ], // S
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [-1, 1],
    ], // Z
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [1, 1],
    ], // L
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [-1, 1],
    ], // J
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
    ], // T
  ];
  const idx = floor(random(shapes.length));
  const newPiece = new TetrisPiece(
    shapes[idx],
    floor(tetrisCols / 2),
    0,
    random(tetrisColors)
  );

  // 💥 여기가 핵심! 새 조각이 유효하지 않으면 게임 종료
  if (!newPiece.valid(newPiece.x, newPiece.y, newPiece.blocks)) {
    triggerTetrisExplosion();
    currentPiece = null;
    resetTetrisGame(); // 재시작 대기
    return;
  }

  currentPiece = newPiece;
}

function resetTetrisGame() {
  setTimeout(() => {
    initTetris();
  }, 1000); // 1초 뒤 재시작
}

class TetrisPiece {
  constructor(blocks, x, y, color) {
    this.blocks = blocks;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  move(dx, dy) {
    if (this.valid(this.x + dx, this.y + dy, this.blocks)) {
      this.x += dx;
      this.y += dy;
      return true;
    }
    return false;
  }

  drop() {
    if (!this.move(0, 1)) {
      this.lock();
    }
  }

  rotate() {
    const rotated = this.blocks.map(([x, y]) => [-y, x]);
    if (this.valid(this.x, this.y, rotated)) {
      this.blocks = rotated;
    }
  }

  valid(x, y, blocks) {
    return blocks.every(([bx, by]) => {
      const nx = x + bx;
      const ny = y + by;
      return (
        nx >= 0 &&
        nx < tetrisCols &&
        ny >= 0 &&
        ny < tetrisRows &&
        !tetrisBoard[ny][nx]
      );
    });
  }

  lock() {
    let gameOver = false;

    for (let [bx, by] of this.blocks) {
      const nx = this.x + bx;
      const ny = this.y + by;
      if (ny < 0) {
        gameOver = true;
        continue;
      }
      tetrisBoard[ny][nx] = this.color;
    }

    clearLines();

    if (gameOver) {
      triggerTetrisExplosion();
      currentPiece = null; // 💀 없애기
      resetTetrisGame(); // ⏱ 1초 후 재시작
    } else {
      spawnPiece();
    }
  }
}

function triggerTetrisExplosion() {
  const total = 100;
  if (popSound && popSound.isLoaded()) popSound.play(); // 💥 재생
  const colors = logoStyles[4].bubbles.map((c) => color(c));
  for (let i = 0; i < total; i++) {
    const x = random(tetrisX, tetrisX + tetrisCols * tetrisCellSize);
    const y = random(tetrisY, tetrisY + tetrisRows * tetrisCellSize);
    const angle = random(TWO_PI);
    const speed = random(3, 7);
    const vx = cos(angle) * speed;
    const vy = sin(angle) * speed;
    const bubble = new BurstBubble(x, y, vx, vy, random(colors));
    burstBubbles.push(bubble);
  }
}
function triggerLineClearExplosion(rowIndex) {
  if (popSound && popSound.isLoaded()) popSound.play(); // 💥 재생

  shakeTimer = 10; // 💥 10프레임 흔들림
  const colors = logoStyles[4].bubbles.map((c) => color(c));
  for (let i = 0; i < 40; i++) {
    const x = random(tetrisX, tetrisX + tetrisCols * tetrisCellSize);
    const y = tetrisY + rowIndex * tetrisCellSize + tetrisCellSize / 2;
    const angle = random(TWO_PI);
    const speed = random(2, 6);
    const vx = cos(angle) * speed;
    const vy = sin(angle) * speed;
    burstBubbles.push(new BurstBubble(x, y, vx, vy, random(colors)));
  }
}

function updateTetris() {
  if (currentPiece && tetrisFrame % tetrisDropSpeed === 0) {
    currentPiece.drop();
  }
  tetrisFrame++;
}

function clearLines() {
  for (let r = tetrisRows - 1; r >= 0; r--) {
    if (tetrisBoard[r].every((cell) => cell !== null)) {
      triggerLineClearExplosion(r); // 💥 연출 추가
      tetrisBoard.splice(r, 1);
      tetrisBoard.unshift(Array(tetrisCols).fill(null));
      r++; // 다시 검사
    }
  }
}
function keyPressed() {
  if (currentStyleIndex === 4 && currentPiece) {
    if (keyCode === LEFT_ARROW) {
      const moved = currentPiece.move(-1, 0);
      if (!moved) spawnWallParticles(tetrisX); // 왼쪽 끝
    } else if (keyCode === RIGHT_ARROW) {
      const moved = currentPiece.move(1, 0);
      if (!moved) spawnWallParticles(tetrisX + tetrisCols * tetrisCellSize); // 오른쪽 끝
    } else if (keyCode === DOWN_ARROW) {
      currentPiece.drop();
    } else if (keyCode === UP_ARROW) {
      currentPiece.rotate();
    }
  }
}

function spawnWallParticles(xPos) {
  const yPos = tetrisY + currentPiece.y * tetrisCellSize + tetrisCellSize / 2;
  for (let i = 0; i < 10; i++) {
    wallParticles.push(new StarParticle(xPos, yPos));
  }
}

class BurstBubble {
  constructor(x, y, vx, vy, col) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = col;
    this.radius = random(8, 20);
    this.lifespan = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravity 느낌
    this.lifespan -= 4;
  }

  display() {
    noStroke();
    this.color.setAlpha(this.lifespan);
    fill(this.color);
    ellipse(this.x, this.y, this.radius);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

class PixelParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;

    this.vx = random(-0.5, 0.5);
    this.vy = random(0, 0.5);
    this.alpha = 255;

    this.age = 0;
    this.state = "waiting"; // "waiting", "exploding", "rebuilding"
  }

  update() {
    this.age++;

    if (this.state === "exploding") {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // ✅ 중력 세게: 0.05 → 0.15
      this.alpha -= 2;
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.state = "rebuilding";
      }
    } else if (this.state === "rebuilding") {
      this.x = lerp(this.x, this.originX, 0.03); // 0.1 → 0.03
      this.y = lerp(this.y, this.originY, 0.03);
      this.alpha = lerp(this.alpha, 255, 0.1);

      if (dist(this.x, this.y, this.originX, this.originY) < 0.5) {
        this.x = this.originX;
        this.y = this.originY;
        this.alpha = 255;
        this.state = "waiting";
      }
    }
  }

  display() {
    noStroke();
    fill(0, this.alpha);
    rect(this.x, this.y, 4, 4);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.size = random(10, 20);

    // 기본 색상은 3번 스타일 색상
    this.color = color(random(logoStyles[3].bubbles));

    this.vx = 0;
    this.vy = 0;
  }

  update() {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distSq = dx * dx + dy * dy; // 마우스와의 거리 계산
    const maxDist = 100; // 영향 반경

    // 마우스와 가까운 파티클만 노란색으로 변하도록
    if (distSq < maxDist * maxDist && currentStyleIndex === 5) {
      this.color = color(255, 193, 7); // 노란색으로 변경
    }

    if (distSq < maxDist * maxDist) {
      const force = (1 - distSq / (maxDist * maxDist)) * 10; // 강한 밀어냄
      const angle = atan2(dy, dx);
      this.vx -= cos(angle) * force;
      this.vy -= sin(angle) * force;
    }

    // 이동 & 되돌아오게 하기
    this.vx *= 0.9;
    this.vy *= 0.9;

    this.x += this.vx;
    this.y += this.vy;

    // 원래 자리로 살살 복원
    this.x += (this.originX - this.x) * 0.02;
    this.y += (this.originY - this.y) * 0.02;
  }

  display() {
    noStroke();
    fill(this.color); // 색상 적용
    ellipse(this.x, this.y, this.size);
  }
}

function drawParticles() {
  for (let p of particles) {
    p.update();
    p.display();
  }
}

function createParticles() {
  particles = []; // 꼭 비워줘야 중복 생성을 막아
  for (let x = 0; x < width; x += 40) {
    for (let y = 0; y < height; y += 40) {
      particles.push(new Particle(x, y));
    }
  }
}

function drawLogoVector(pg) {
  pg.noStroke();

  // 🔁 drawLogo와 동일한 위치, 크기 transform 적용

  pg.push();

  pg.translate(-12, 8); // 로고 중심 정렬 보정

  // 로고 바탕
  pg.fill(255);
  pg.beginShape();
  pg.vertex(0, 22.63);
  pg.vertex(75.49, 14.48);
  pg.vertex(80.91, 31.7);
  pg.vertex(113.92, 28.06);
  pg.vertex(116.17, 34.42);
  pg.vertex(174.49, 27.62);
  pg.vertex(175.41, 7.25);
  pg.vertex(216.09, 2.72);
  pg.vertex(216.99, 8.15);
  pg.vertex(290.68, 0);
  pg.vertex(295.19, 33.06);
  pg.vertex(318.7, 31.7);
  pg.vertex(349, 108.19);
  pg.vertex(159.13, 249);
  pg.vertex(14.92, 142.6);
  pg.endShape(CLOSE);

  // 텍스트
  pg.push();

  pg.translate(18, 13);
  drawFVector(pg);
  pg.translate(59, 13);
  drawA1Vector(pg);
  pg.translate(70, -19);
  drawNVector(pg);
  pg.translate(83, 0);
  drawTVector(pg);
  pg.translate(65, 30);
  drawA2Vector(pg);
  pg.pop();

  pg.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  particles = []; // 화면 크기 변경 시 버블 리셋
  createParticles(); // 새로운 버블 생성
}
//drawF, drawA1, drawN 등dpj drawF(pg), drawA1(pg)처럼 변경 필요 (pg.beginShape 등 사용)
function drawF() {
  fill(logoStyles[currentStyleIndex].textColors[0]);
  push();
  translate(-6 + letterOffsetsX[0], 3 + letterOffsetsY[0]);
  scale(letterScales[0]);
  beginShape();
  vertex(0.7, 5.5);
  vertex(60.4, 0.1);
  vertex(63.1, 24.5);
  vertex(30.5, 27.2);
  vertex(31.9, 45.4);
  vertex(57.7, 43.5);
  vertex(60.4, 62.5);
  vertex(36.0, 65.3);
  vertex(41.4, 108.7);
  vertex(14.3, 111.4);
  endShape(CLOSE);
  pop();
  translate(60, 0);
}
function drawA1() {
  fill(logoStyles[currentStyleIndex].textColors[1]);
  push();
  translate(-7 + letterOffsetsX[1], 13 + letterOffsetsY[1]);
  scale(letterScales[1]);
  beginShape();
  vertex(44.07, 0.98);
  vertex(16.94, 3.7);
  vertex(0.67, 101.49);
  vertex(23.18, 98.77);
  vertex(27.79, 71.61);
  vertex(44.07, 71.61);
  vertex(49.49, 87.9);
  vertex(71.19, 85.19);
  vertex(44.07, 0.98);

  beginContour();
  vertex(33, 34);
  vertex(37, 34);
  vertex(39, 48);
  vertex(31, 48);
  endContour();

  endShape(CLOSE);
  pop();
  translate(70, -7);
}
function drawN() {
  fill(logoStyles[currentStyleIndex].textColors[2]);
  push();
  translate(-7 + letterOffsetsX[2], -2 + letterOffsetsY[2]);
  scale(letterScales[2]);
  beginShape();
  vertex(0.2, 27.4);
  vertex(27.2, 24.7);
  vertex(51.7, 51.8);
  vertex(54.4, 51.8);
  vertex(49.0, 2.9);
  vertex(76.1, 0.2);
  vertex(87.0, 100.7);
  vertex(62.6, 103.4);
  vertex(35.5, 68.1);
  vertex(32.7, 68.1);
  vertex(38.2, 114.3);
  vertex(11.0, 117.0);
  endShape(CLOSE);
  pop();
  translate(85, 0);
}
function drawT() {
  fill(logoStyles[currentStyleIndex].textColors[3]);
  push();
  translate(-7 + letterOffsetsX[3], -2 + letterOffsetsY[3]);
  scale(letterScales[3]);
  beginShape();
  vertex(0.3, 5.9);
  vertex(3.0, 31.9);
  vertex(16.5, 30.4);
  vertex(26.1, 109.9);
  vertex(54.5, 106.4);
  vertex(45.7, 27.7);
  vertex(65.4, 24.9);
  vertex(62.7, 0.5);
  endShape(CLOSE);
  pop();
  translate(65, 3);
}
function drawA2() {
  fill(logoStyles[currentStyleIndex].textColors[4]);
  push();
  translate(-7 + letterOffsetsX[4], 23 + letterOffsetsY[4]);
  scale(letterScales[4]);
  beginShape();
  vertex(27.5, 0.7);
  vertex(0.37, 3.36);
  vertex(0.37, 66.92);
  vertex(16.65, 65.89);
  vertex(16.65, 52.31);
  vertex(30.21, 52.31);
  vertex(32.92, 63.17);
  vertex(51.91, 63.17);
  vertex(27.5, 0.7);

  beginContour();
  vertex(18, 24);
  vertex(23, 24);
  vertex(26, 34);
  vertex(18, 34);
  endContour();

  endShape(CLOSE);
  pop();
  translate(72, 0);
}

function mousePressed() {
  const withinInput =
    mouseX >= inputContainer.position().x &&
    mouseX <= inputContainer.position().x + inputContainer.size().width &&
    mouseY >= inputContainer.position().y &&
    mouseY <= inputContainer.position().y + inputContainer.size().height;

  if (withinInput) return; // 검색창 클릭 무시

  // 배경 누르면 스타일 전환
  currentStyleIndex = (currentStyleIndex + 1) % logoStyles.length;
  flavorColors = logoStyles[currentStyleIndex].bubbles.map((c) => color(c));
  hasGeneratedPixels = false;

  if (currentStyleIndex !== 1) {
    pixelCycleTimer = 0;
  }
}

function dispense() {
  // 랜덤 음료 및 행운의 응원 설정 (이모티콘 제외, 느낌표 추가)
  const drinks = [
    { label: "WEALTHY FANTA!", message: "Wealthy Taste!" }, // 돈 많아지는 맛
    { label: "LUCKY FANTA!", message: "Lucky Taste!" }, // 행운 가득한 맛
    { label: "HEALTHY FANTA!", message: "Healthy Taste!" }, // 건강해지는 맛
    { label: "SLIMMING FANTA!", message: "Slimming Taste!" }, // 살 빠지는 맛
    { label: "SUCCESS FANTA!", message: "Success Taste!" }, // 성공의 맛
    { label: "FORTUNE FANTA!", message: "Fortune Taste!" }, // 행운의 맛
  ];

  // 랜덤 음료 선택
  const randomDrink = random(drinks);
  bottleLabel = randomDrink.label;
  message = randomDrink.message;

  showBottle = true;
  inputContainer.hide();

  // ✅ 버튼 보이게 활성화
  resetBtn.show();
  resetBtn.style("opacity", "1");
  resetBtn.style("pointer-events", "auto");

  // 🔁 리셋 버튼 위치 (하단 중앙 고정)
  resetBtn.position(windowWidth / 2 - resetBtn.width / 2 - 20, windowHeight - 100); // 화면 하단 중앙 고정
}


function reset() {
  location.reload();
}
class Bubble {
  constructor(x, y, isBackground = false) {
    this.x = x;
    this.y = y;
    this.isBackground = isBackground;
    this.radius = isBackground ? random(5, 20) : random(15, 60);
    this.lifespan = isBackground ? 120 : 200;
    this.speed = createVector(
      random(-0.5, 0.5),
      isBackground ? random(-2.5, -0.5) : random(-4, -1)
    );
    const colors = isBackground
      ? logoStyles[currentStyleIndex].backgroundBubbles
      : flavorColors;
    this.color = color(random(colors));
    this.isYouTube = !isBackground && currentStyleIndex === 1 && random() < 0.5;
  }

  update() {
    this.x += this.speed.x;
    this.y += this.speed.y;
    this.lifespan -= this.isBackground ? 3 : 5;
  }

  display() {
    noStroke();
    this.color.setAlpha(this.lifespan);
    fill(this.color);

    if (currentStyleIndex === 5 && !this.isBackground) {
      push();
      translate(this.x, this.y);
      scale(this.radius / 40);
      beginShape();
      vertex(0, -20);
      bezierVertex(20, -20, 20, 10, 0, 30);
      bezierVertex(-20, 10, -20, -20, 0, -20);
      endShape(CLOSE);
      pop();
    } else if (
      currentStyleIndex === 1 &&
      !this.isBackground &&
      this.isYouTube
    ) {
      push();
      translate(this.x, this.y);
      scale(this.radius / 40);

      // 🔴 빨간 배경 (50% 투명도)
      fill(0, 0, 0, this.lifespan * 0.5);
      rectMode(CENTER);
      noStroke();
      rect(0, 0, 40, 28, 6);

      // ⚪️ 흰색 플레이 아이콘 (항상 쨍하게)
      fill(255); // 투명도 제거!
      noStroke();
      beginShape();
      vertex(-6, -8);
      vertex(10, 0);
      vertex(-6, 8);
      endShape(CLOSE);

      pop();
    } else {
      ellipse(this.x, this.y, this.radius);
    }
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

function resetExplosion() {
  logoScale = 1.0;
  exploded = false;
  popAlpha = 255;
  hasBurst = false; // 💡 중요!

  letterScales = [1, 1, 1, 1, 1];
  letterOffsetsY = [0, 0, 0, 0, 0];
  letterStates = Array(5).fill("wait");
  letterStartFrames = [
    frameCount,
    frameCount + 15,
    frameCount + 30,
    frameCount + 45,
    frameCount + 60,
  ];

  pixelParticles = [];
  hasGeneratedPixels = false;
  burstBubbles = [];
}
function drawFVector(pg) {
  pg.fill(logoStyles[currentStyleIndex].textColors[0]);
  pg.beginShape();
  pg.vertex(0.7, 5.5);
  pg.vertex(60.4, 0.1);
  pg.vertex(63.1, 24.5);
  pg.vertex(30.5, 27.2);
  pg.vertex(31.9, 45.4);
  pg.vertex(57.7, 43.5);
  pg.vertex(60.4, 62.5);
  pg.vertex(36.0, 65.3);
  pg.vertex(41.4, 108.7);
  pg.vertex(14.3, 111.4);
  pg.endShape(CLOSE);
}
function drawA1Vector(pg) {
  pg.fill(logoStyles[currentStyleIndex].textColors[1]);
  pg.beginShape();
  pg.vertex(44.07, 0.98);
  pg.vertex(16.94, 3.7);
  pg.vertex(0.67, 101.49);
  pg.vertex(23.18, 98.77);
  pg.vertex(27.79, 71.61);
  pg.vertex(44.07, 71.61);
  pg.vertex(49.49, 87.9);
  pg.vertex(71.19, 85.19);
  pg.vertex(44.07, 0.98);
  pg.beginContour();
  pg.vertex(33, 34);
  pg.vertex(37, 34);
  pg.vertex(39, 48);
  pg.vertex(31, 48);
  pg.endContour();
  pg.endShape(CLOSE);
}
function drawNVector(pg) {
  pg.fill(logoStyles[currentStyleIndex].textColors[2]);
  pg.beginShape();
  pg.vertex(0.2, 27.4);
  pg.vertex(27.2, 24.7);
  pg.vertex(51.7, 51.8);
  pg.vertex(54.4, 51.8);
  pg.vertex(49.0, 2.9);
  pg.vertex(76.1, 0.2);
  pg.vertex(87.0, 100.7);
  pg.vertex(62.6, 103.4);
  pg.vertex(35.5, 68.1);
  pg.vertex(32.7, 68.1);
  pg.vertex(38.2, 114.3);
  pg.vertex(11.0, 117.0);
  pg.endShape(CLOSE);
}
function drawTVector(pg) {
  pg.fill(logoStyles[currentStyleIndex].textColors[3]);
  pg.beginShape();
  pg.vertex(0.3, 5.9);
  pg.vertex(3.0, 31.9);
  pg.vertex(16.5, 30.4);
  pg.vertex(26.1, 109.9);
  pg.vertex(54.5, 106.4);
  pg.vertex(45.7, 27.7);
  pg.vertex(65.4, 24.9);
  pg.vertex(62.7, 0.5);
  pg.endShape(CLOSE);
}

function drawA2Vector(pg) {
  pg.fill(logoStyles[currentStyleIndex].textColors[4]);
  pg.beginShape();
  pg.vertex(27.5, 0.7);
  pg.vertex(0.37, 3.36);
  pg.vertex(0.37, 66.92);
  pg.vertex(16.65, 65.89);
  pg.vertex(16.65, 52.31);
  pg.vertex(30.21, 52.31);
  pg.vertex(32.92, 63.17);
  pg.vertex(51.91, 63.17);
  pg.vertex(27.5, 0.7);
  pg.beginContour();
  pg.vertex(18, 24);
  pg.vertex(23, 24);
  pg.vertex(26, 34);
  pg.vertex(18, 34);
  pg.endContour();
  pg.endShape(CLOSE);
}
