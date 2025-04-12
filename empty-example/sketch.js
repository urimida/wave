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

function preload() {
  bottleImage = loadImage("../src/img/bottle.png");
  customFont = loadFont("../src/fonts/5fe150c1ede1675dbf2d62bed5163f1e.woff");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
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

  const iconImg = createImg("/src/img/SearchImg.svg", "search icon");
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
    .style("pointer-events", "none");
  resetBtn.hide();
  resetBtn.mousePressed(reset);
}

function draw() {
  background(logoStyles[currentStyleIndex].bg);

  for (let i = burstBubbles.length - 1; i >= 0; i--) {
    burstBubbles[i].update();
    burstBubbles[i].display();
    if (burstBubbles[i].isDead()) {
      burstBubbles.splice(i, 1);
    }
  }

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

      if (frameCount - explosionFrame > 60) {
        resetExplosion();
      }
    }
  } else {
    logoScale = 1.0;
    exploded = false;
  }

  if (currentStyleIndex === 0) {
    for (let i = 0; i < 5; i++) {
      const elapsed = frameCount - letterStartFrames[i];
      if (elapsed < 90) {
        letterStates[i] = "shake";
        letterScales[i] = 1 + 0.05 * sin(radians(frameCount * 10 + i * 30));
        const direction = i % 2 === 0 ? -1 : 1;
        letterOffsetsY[i] =
          direction * 3 * sin(radians(frameCount * 15 + i * 40));
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

  const groupY = height * 0.4;

  // ✅ 중심 정렬 및 스케일 적용
  push();
  translate(width / 2, groupY);
  const baseScale = min(width, height) / 1000;
  scale(baseScale * (currentStyleIndex === 0 ? 1.2 * logoScale : 1.2));

  const logoWidth = 349;
  translate(-logoWidth / 2, -100);
  drawLogo(groupY);
  pop();

  // ✅ 픽셀 입자는 여기서만 렌더링!
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

    // 주기적으로 입자 폭발
    if (frameCount - pixelCycleTimer > pixelCycleInterval) {
      for (let p of pixelParticles) {
        if (p.state === "waiting") {
          p.vx = random(-4, 4); // ✅ 좌우로 더 넓게 퍼짐
          p.vy = random(-6, -2); // 그대로 유지
          p.state = "exploding";
        }
      }
      pixelCycleTimer = frameCount;
    }

  }

  inputContainer.position((width - 1160) / 2, height * 0.7);

  if (showBottle) {
    imageMode(CENTER);
    const maxHeightRatio = 0.5;
    const maxBottleHeight = height * maxHeightRatio;
    const scale = maxBottleHeight / bottleImage.height;
    const scaledWidth = bottleImage.width * scale;
    const scaledHeight = bottleImage.height * scale;
    image(bottleImage, width / 2, height * 0.65, scaledWidth, scaledHeight);

    fill(0);
    textSize(20);
    setEnglishFont(bottleLabel);
    text(bottleLabel, width / 2, height * 0.87);

    textSize(16);
    setEnglishFont(message);
    text(message, width / 2, height * 0.91);

    resetBtn.position(width / 2 - 60, height * 0.95);
  }
  // ❗ 여기부터는 버블 로직은 항상 실행됨 ✅
  if (frameCount % 4 === 0 && mouseInsideCanvas && !mouseIsPressed) {
    bubbles.push(new Bubble(mouseX, mouseY));
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
    }
  }

  if (frameCount % 6 === 0) {
    const randX = random(width);
    const randY = random(height);
    bubbles.push(new Bubble(randX, randY, true));
  }
}

function drawLogo(groupY) {
  // 로고가 폭발했으면 기본 스타일은 그리지 않음
  if (currentStyleIndex === 0 && exploded) return;

  // 외곽선 있는 경우만 stroke 설정
  if (logoStyles[currentStyleIndex].stroke) {
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

  // ▶️ 1번 스타일은 픽셀 입자 효과!
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
  currentStyleIndex = (currentStyleIndex + 1) % logoStyles.length;
  flavorColors = logoStyles[currentStyleIndex].bubbles.map((c) => color(c));
  hasGeneratedPixels = false;
}

function dispense() {
  const val = input.value().toLowerCase();
  showBottle = true;
  inputContainer.hide();
  resetBtn.show();

  if (val.includes("고양이") || val.includes("cat")) {
    bottleLabel = "😺 CAT FANTA";
    message = "고양이 밈이 들어간 딸기환타 등장!";
  } else if (val.includes("우울") || val.includes("sad")) {
    bottleLabel = "🍓 CHEER UP!";
    message = "기분전환 딸기향 응원 메시지!";
  } else {
    bottleLabel = "✨ RANDOM FANTA";
    message = "랜덤 환타가 팡!";
  }
}

function reset() {
  showBottle = false;
  inputContainer.show();
  resetBtn.hide();
  input.value("");
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
