let palette = [];
let timeOfDay;
let skyColors, oceanBaseColor, sunColor;
let sunPos;
let waveTarget;
let waveOffset;
let bubbles = [];
let shipTrail = [];
let shipPos;
let shipDirection;
let shipSpeed;
let isAutoShip = true;
let stars = [];
let clouds = [];
let shallowColor, deepColor, sandColor;
let sparkles = [];
let waveParticleScale = 1; // 1이면 기본, <1 작음, >1 크게
let turnAngle = 0;
let moonPhase;
let moonPos; // 달 위치
let cloudDirection;
let clearSky = false; // 무지개 조건용
let rainbowStyle;
let rainbowCenterX;
let shootingStars = [];
let hasShootingStars = false;
let shootingStarTimer = 0;
let rainbow;
let sparkleStyle; 
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  
  sparkleStyle = int(random(1, 4)); // 1~3 랜덤 선택

  cloudDirection = random() < 0.5 ? "left" : "right";
  rainbowStyle = floor(random(1, 4));
  rainbowCenterX = random(width * 0.4, width * 0.6);

  shipSpeed = random(1, 2);
  let sizeMode = random(["medium", "large"]);
  waveParticleScale = sizeMode === "large" ? 2.3 : 1.8;

  const times = [
    "morning", "day", "sunset", "night", "twilight", "golden",
    "turquoise", "mediterranean", "stormy", "blush", "rainyNight",
  ];
  timeOfDay = random(times);

  setTimeColors(); // ✨ sunPos, oceanBaseColor 등 초기화

  // 수평선 비율 설정
  if (["turquoise", "mediterranean", "golden"].includes(timeOfDay)) {
    horizonRatio = 0.45;
  } else if (["sunset", "twilight", "blush"].includes(timeOfDay)) {
    horizonRatio = 0.55;
  } else {
    horizonRatio = 0.5;
  }

  // 파도 팔레트 생성
  palette = [];
  for (let i = 0; i < 6; i++) {
    palette.push(
      color(
        red(oceanBaseColor) + random(-20, 20),
        green(oceanBaseColor) + random(-20, 20),
        blue(oceanBaseColor) + random(-20, 20),
        random(70, 130)
      )
    );
  }

  // 구름, 배, 별똥별 생성
  createClouds();
  createShipTrail();
  shootingStars = [];
  for (let i = 0; i < int(random(3, 5)); i++) {
    createShootingStar();
  }

  // 반짝이들
  sparkles = [];
  let sparkleMinY = height * horizonRatio + 30;
  let sparkleMaxY = height * 0.92;
  for (let i = 0; i < 130; i++) {
    sparkles.push(new Sparkle(
      random(width * 0.05, width * 0.95),
      random(sparkleMinY, sparkleMaxY),
      random(0.4, 1.0),
      random(100, 180),
      random(0.08, 0.18)
    ));
  }

  // 별들
  stars = [];
  if (["night", "twilight", "stormy", "blush"].includes(timeOfDay)) {
    let horizonY = height * horizonRatio;
    for (let i = 0; i < 150; i++) {
      stars.push(new Star(
        random(width),
        random(horizonY * 0.2, horizonY - 30),
        random(1, 3),
        random(100, 255),
        random(0.5, 2)
      ));
    }
  }

  // 밤이면 달 생성
  if (["night", "twilight", "stormy", "rainyNight", "blush"].includes(timeOfDay)) {
    moonPhase = random(["crescent", "half", "gibbous", "full", "new"]);
    moonShapeIndex = floor(random(3));
    moonPos = createVector(random(width * 0.3, width * 0.7), height * 0.2);
    moon = new Moon(moonPos);
  }

  // 비오는 밤 세팅
  if (timeOfDay === "rainyNight") {
    hasShootingStars = false;
    clearSky = false;
    createRain();
  } else {
    hasShootingStars = ["night", "twilight", "stormy", "blush"].includes(timeOfDay) && random() < 0.7;
  }

  // 해와 바다 객체 생성
  sun = new Sun(sunPos);
  ocean = new Ocean(palette, waveParticleScale, horizonRatio);

  // 무지개를 clearSky면 무조건 생성
  if (clearSky) {
    rainbow = new Rainbow(height * horizonRatio, rainbowCenterX, rainbowStyle);
  }
  if (["blush", "twilight"].includes(timeOfDay) && random() < 0.2) {
    triggerFireworks();
  }
  
}

function draw() {
  background(255);

  drawBackground();
  drawSunOrMoon();

  if (rainbow) {
    rainbow.update();
    rainbow.draw();
  }

  if (timeOfDay === "rainyNight") {
    drawRain();
    maybeFlashLightning();
  }

  updateClouds();
  drawClouds();

  ocean.drawWaveParticles(shipTrail);

  for (let sparkle of sparkles) {
    sparkle.draw();
  }

  if (["night", "twilight", "stormy", "blush"].includes(timeOfDay)) {
    for (let star of stars) {
      star.draw();
    }
  }

  if (hasShootingStars) {
    updateShootingStars();
    drawShootingStars();
  }

  if (isAutoShip) {
    shipDirection.rotate(turnAngle);
    let curveAngle = sin(frameCount * 0.01) * 0.05;
    let dir = shipDirection.copy().rotate(curveAngle);
    shipPos.add(dir);

    let horizonY = height * horizonRatio;
    if (shipPos.y > -200) {
      shipTrail.push({ x: shipPos.x, y: shipPos.y, life: 0 });
      shipPos.add(shipDirection);
    }
    if (shipPos.y <= horizonY - 100) {
      isAutoShip = false;
    }
  } else {
    if (mouseX >= 0 && mouseX <= width && mouseY >= height * horizonRatio && mouseY <= height) {
      shipTrail.push({ x: mouseX, y: mouseY, life: 0 });
    }
  }

  drawShipTrail();
  drawBubbles();
  updateAndDrawFireworks();
  updateAndDrawFish();

  lightningBolts = lightningBolts.slice(-3);
}


function drawSparkles() {
  noStroke();

  for (let s of sparkles) {
    let flicker = sin(frameCount * s.flicker + s.x * 0.1) * 100;
    let alpha = constrain(s.alpha + flicker, 0, 255);

    let offsetX = sin(frameCount * 0.01 + s.y * 0.05) * 3;
    let offsetY = cos(frameCount * 0.01 + s.x * 0.05) * 1.5;

    let sizePulse = sin(frameCount * 0.02 + s.x * 0.5) * 0.2 + 1;

    fill(255, 255, 255, alpha * 0.12);
    ellipse(s.x + offsetX, s.y + offsetY, s.size * 80 * sizePulse, s.size * 30 * sizePulse);

    fill(255, 255, 255, alpha * 0.5);
    ellipse(s.x + offsetX, s.y + offsetY, s.size * 14 * sizePulse);

    fill(255, 240, 180, alpha * 0.3);
    ellipse(s.x + offsetX, s.y + offsetY, s.size * 35 * sizePulse);

    if (random() < 0.08) {
      fill(255, 255, 255, alpha);
      ellipse(s.x + offsetX + random(-2, 2), s.y + offsetY + random(-2, 2), s.size * 3);
    }
  }
}

function setTimeColors() {
  const themes = [
    {
      name: "morning",
      sky: [
        color(180, 200, 255),   // 위: 보라+파랑 → 더 옅게 (밤기운은 최소)
        color(255, 235, 200),   // 중간: 은은한 피치+노랑
        color(255, 255, 230),   // 아래: 하얗게 번지는 아침 햇빛
      ],
      ocean: color(190, 220, 230),       // 전체적으로 더 밝고 부드러운 푸른 바다
      shallow: color(230, 245, 230),     // 얕은 바다는 거의 하늘 반사 느낌
      deep: color(100, 160, 200),        // 깊은 바다도 너무 어둡지 않게
      sand: color(255, 245, 210),        // 햇살 받은 따뜻한 모래
      sun: color(255, 240, 180, 240),    // 햇살 강조
      sunPos: createVector(width * 0.2, height * 0.25),
    }
    ,
    
    {
      name: "day",
      sky: [color(200, 240, 255), color(170, 220, 255), color(120, 200, 255)],
      ocean: color(120, 190, 230),
      shallow: color(180, 235, 230),
      deep: color(50, 110, 180),
      sand: color(250, 240, 200),
      sun: color(255, 255, 180, 220),
      sunPos: createVector(width * 0.5, height * 0.1),
    },
    {
      name: "sunset",
      sky: [
        color(230, 100, 130),   // 위: 보라+레드
        color(255, 180, 120),   // 중간: 주황+노랑
        color(255, 250, 210),   // 아래: 밝은 아이보리 → 햇빛 퍼짐 느낌
      ],
      ocean: color(200, 140, 160),
      shallow: color(255, 200, 170),
      deep: color(120, 90, 110),
      sand: color(255, 220, 180),
      sun: color(255, 190, 120, 220),
      sunPos: createVector(width * 0.8, height * 0.3),
  
    },
    {
      name: "night",
      sky: [color(30, 20, 60), color(60, 30, 90), color(100, 90, 80)],
      ocean: color(30, 70, 110),
      shallow: color(50, 90, 130),
      deep: color(20, 40, 80),
      sand: color(70, 60, 80),
      sun: color(255, 255, 200, 200),
      sunPos: createVector(width * 0.8, height * 0.2),
    },
    {
      name: "twilight",
      sky: [color(90, 40, 120), color(180, 100, 160), color(255, 210, 170)],
      ocean: color(70, 70, 120),
      shallow: color(90, 90, 150),
      deep: color(35, 35, 85),
      sand: color(100, 80, 110),
      sun: color(220, 180, 255, 220),
      sunPos: createVector(width * 0.5, height * 0.15),
    },
    {
      name: "golden",
      sky: [
        color(255, 220, 140), // 위쪽: 따뜻한 금빛 노랑
        color(255, 240, 180), // 중간: 은은한 오렌지빛
        color(255, 255, 250), // 아래쪽: 부드럽고 밝은 크림 화이트
      ],
      ocean: color(220, 180, 120),    // 바다도 조금 더 황금빛
      shallow: color(240, 200, 150),  // 얕은 바다
      deep: color(170, 130, 90),      // 깊은 바다는 황토 계열
      sand: color(210, 160, 90),      // 모래는 진한 황토빛
      sun: color(255, 220, 120, 230), // 햇살도 따뜻한 노랑
      sunPos: createVector(width * 0.3, height * 0.2),
    },
    {
      name: "turquoise",
      sky: [color(255, 245, 200), color(210, 250, 255), color(100, 200, 255)],
      ocean: color(0, 220, 200),
      shallow: color(100, 255, 240),
      deep: color(0, 170, 180),
      sand: color(255, 250, 220),
      sun: color(255, 200, 200, 220),
      sunPos: createVector(width * 0.4, height * 0.12),
    },
    {
      name: "mediterranean",
      sky: [
        color(160, 210, 255),   // 위쪽: 쨍한 파랑
        color(230, 240, 220),   // 중간: 약간 옅은 베이지빛으로 전이
        color(255, 250, 200),   // 아래쪽: 태양빛에 물든 노란 아이보리
      ],
      ocean: color(40, 150, 200),       // 기존보다 살짝 밝게
      shallow: color(130, 210, 200),    // 햇살 비침 감성
      deep: color(20, 90, 150),         // 여전히 깊은 맛 유지      
      sand: color(250, 240, 200),         // 바위보다 모래를 상징
      sun: color(255, 255, 220, 230),     // 밝고 투명한 태양빛
      sunPos: createVector(width * 0.65, height * 0.12),
    },    
    {
      name: "stormy",
      sky: [color(30, 30, 40), color(70, 70, 80), color(120, 110, 100)],
      ocean: color(30, 60, 90),
      shallow: color(50, 80, 110),
      deep: color(10, 30, 60),
      sand: color(100, 100, 110),
      sun: color(200, 200, 220, 220),
      sunPos: createVector(width * 0.7, height * 0.25),
    },
    {
      name: "blush",
      sky: [color(255, 180, 200), color(255, 220, 190), color(255, 250, 220)],
      ocean: color(230, 170, 190),
      shallow: color(250, 210, 220),
      deep: color(190, 110, 140),
      sand: color(255, 240, 230),
      sun: color(255, 180, 200, 220),
      sunPos: createVector(width * 0.5, height * 0.2),
    },
    {
      name: "rainyNight",
      sky: [color(20, 20, 30), color(40, 40, 50), color(60, 60, 70)],
      ocean: color(20, 50, 80),
      shallow: color(40, 70, 100),
      deep: color(10, 30, 60),
      sand: color(50, 50, 60),
      sun: color(180, 180, 200, 100), // 달빛 느낌
      sunPos: createVector(width * 0.7, height * 0.15),
    }
  ];

  let selected = themes.find(theme => theme.name === timeOfDay);

  skyColors = selected.sky;
  oceanBaseColor = selected.ocean;
  shallowColor = selected.shallow;
  deepColor = selected.deep;
  sandColor = selected.sand;
  sunColor = selected.sun;
  sunPos = selected.sunPos;
}

function drawBackground() {
  let h = height;
  let horizonY = height * horizonRatio;

  for (let y = 0; y < h; y++) {
    let inter = y / h;
    let c;

    if (inter < horizonRatio * 0.7) {
      c = lerpColor(
        skyColors[0],
        skyColors[1],
        map(inter, 0, horizonRatio * 0.7, 0, 1)
      );
    } else if (inter < horizonRatio * 1.2) {
      c = lerpColor(
        skyColors[1],
        shallowColor,
        map(inter, horizonRatio * 0.7, horizonRatio * 1.2, 0, 1)
      );
    } else if (inter < 0.95) {
      c = lerpColor(
        shallowColor,
        deepColor,
        map(inter, horizonRatio * 1.2, 0.95, 0, 1)
      );
    } else {
      c = lerpColor(deepColor, sandColor, map(inter, 0.95, 1, 0, 1));
    }

    stroke(c);
    line(0, y, width, y);
  }
}
function drawStars() {
  noStroke();
  for (let star of stars) {
    let flicker = sin(frameCount * 0.05 * star.blinkSpeed) * 50;
    let alpha = constrain(star.alpha + flicker, 120, 255);

    let starX = (star.x + frameCount * 0.01) % width;

    fill(255, 255, 255, alpha);
    ellipse(starX, star.y, star.size);
  }
}
class Cloud {
  constructor(x, y, s, alpha, style, vx) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.alpha = alpha;
    this.style = style;
    this.vx = vx;
  }

  update() {
    this.x += this.vx;
    if (this.x < -width * 0.5) {
      this.x = width + width * 0.5;
    } else if (this.x > width + width * 0.5) {
      this.x = -width * 0.5;
    }
  }

  draw(offsetX = 0) {
    push();
    translate(this.x + offsetX, this.y);
    scale(this.s);
    fill(255, 255, 255, this.alpha);
    noStroke();
    beginShape();
    switch (this.style) {
      case 0:
        vertex(287, 175);
        bezierVertex(287, 175, 43, 175, 43, 175);
        bezierVertex(28.6667, 167.5, 0, 144, 0, 110);
        bezierVertex(0, 76, 35, 67.5, 52.5, 67.5);
        bezierVertex(55.1667, 45, 72.2, 0.2, 119, 1);
        bezierVertex(165.8, 1.8, 177.833, 37, 178, 54.5);
        bezierVertex(180, 49.333, 191.3, 40.4, 220.5, 46);
        bezierVertex(249.7, 51.6, 262.667, 80, 265.5, 93.5);
        bezierVertex(285.333, 89.833, 324.5, 91.6, 322.5, 128);
        bezierVertex(320.5, 164.4, 298, 174.5, 287, 175);
        break;
      case 1:
        vertex(214, 130);
        bezierVertex(214, 130, 27, 130, 27, 130);
        bezierVertex(15.833, 126.333, -4.9, 112, 1.5, 84);
        bezierVertex(7.9, 56, 31.5, 56.667, 42.5, 60.5);
        bezierVertex(37.333, 54, 31.4, 37.6, 49, 24);
        bezierVertex(66.6, 10.4, 86, 21.333, 93.5, 28.5);
        bezierVertex(96.833, 17, 109.6, -4.5, 134, 1.5);
        bezierVertex(158.4, 7.5, 159.833, 27.667, 157.5, 37);
        bezierVertex(159, 31.333, 167, 20.7, 187, 23.5);
        bezierVertex(207, 26.3, 209, 47.666, 207.5, 58);
        bezierVertex(217.5, 53, 251, 63, 248, 95);
        bezierVertex(245.6, 120.6, 224.333, 129, 214, 130);
        break;
      case 2:
        vertex(225, 130.5);
        bezierVertex(225, 130.5, 34, 130.5, 34, 130.5);
        bezierVertex(21, 129.5, -3.8, 119.8, 1, 89);
        bezierVertex(5.8, 58.2, 35, 54.833, 49, 57);
        bezierVertex(47.5, 49.167, 50.5, 32.5, 74.5, 28.5);
        bezierVertex(98.5, 24.5, 108.833, 37.167, 111, 44);
        bezierVertex(112.167, 31.167, 121.6, 4.6, 150, 1);
        bezierVertex(191.6, -3.8, 208.333, 23.334, 211.5, 37.5);
        bezierVertex(218, 31.5, 269.5, 41, 268, 83.5);
        bezierVertex(266.8, 117.5, 238.833, 129, 225, 130.5);
        break;
    }
    endShape(CLOSE);
    pop();
  }
}
function createClouds() {
  clouds = [];
  let cloudCount = random(15, 25);
  let tries = 0;

  let horizonY = height * horizonRatio;

  let minCloudY = height * 0.05;
  let maxCloudY = horizonY * 0.55;

  let baseScale = map(width, 500, 1500, 0.3, 0.65);

  let allowClearSkyTimes = [
    "day",
    "morning",
    "turquoise",
    "golden",
    "mediterranean",
  ];
  if (allowClearSkyTimes.includes(timeOfDay) && random() < 0.25) {
    clearSky = true;
  }

  while (clouds.length < cloudCount && tries < 200) {
    let x = random(width * 0.1, width * 0.9);
    let y = random(minCloudY, maxCloudY);

    if (dist(x, y, sunPos.x, sunPos.y) < 150) {
      tries++;
      continue;
    }

    let s = random(1.0, 1.4) * baseScale;
    let alpha = ["twilight", "night", "stormy"].includes(timeOfDay) ? 30 : 60;
    let style = floor(random(3));
    let vx = random(0.3, 0.6) * (random() < 0.5 ? 1 : -1);

    clouds.push(new Cloud(x, y, s, alpha, style, vx));
    tries++;
  }
}

function updateClouds() {
  for (let c of clouds) {
    c.x += c.vx;

  }
}


function drawClouds() {
  push();
  drawingContext.save();
  drawingContext.filter = "blur(23px)";

  for (let c of clouds) {
    for (let offset = -1; offset <= 1; offset++) {
      c.draw(offset * width); // ✔️ Cloud 클래스 안 draw(offsetX) 지원하는 버전
    }
  }

  drawingContext.restore();
  pop();
}

function drawSingleCloud(c) {
  switch (c.style) {
    case 0:
      drawCloudStyle1(c.x, c.y, c.s, c.alpha);
      break;
    case 1:
      drawCloudStyle2(c.x, c.y, c.s, c.alpha);
      break;
    case 2:
      drawCloudStyle3(c.x, c.y, c.s, c.alpha);
      break;
  }
}
class Sparkle {
  constructor(x, y, size, alpha, flicker) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.alpha = alpha;
    this.flicker = flicker;
  }

  draw() {
    let flickerValue = sin(frameCount * this.flicker + this.x * 0.1) * 100;
    let a = constrain(this.alpha + flickerValue, 0, 255);
    let offsetX = sin(frameCount * 0.01 + this.y * 0.05) * 3;
    let offsetY = cos(frameCount * 0.01 + this.x * 0.05) * 1.5;
    let sizePulse = sin(frameCount * 0.02 + this.x * 0.5) * 0.2 + 1;

    push();
    translate(this.x + offsetX, this.y + offsetY);

    if (sparkleStyle === 1) {
      // 부드러운 타원형 (기존)
      fill(255, 255, 255, a * 0.12);
      ellipse(0, 0, this.size * 80 * sizePulse, this.size * 30 * sizePulse);
      fill(255, 255, 255, a * 0.5);
      ellipse(0, 0, this.size * 14 * sizePulse);
      fill(255, 240, 180, a * 0.3);
      ellipse(0, 0, this.size * 35 * sizePulse);
    } 
    
    else if (sparkleStyle === 2) {
      // 120프레임 주기로 (60프레임 fade in + 60프레임 fade out)
      let phase = frameCount % 120;
      let phaseAlpha = 1.0;
    
      if (phase < 60) {
        // 첫 60프레임은 점점 밝아짐
        phaseAlpha = map(phase, 0, 60, 0, 1);
      } else {
        // 다음 60프레임은 점점 어두워짐
        phaseAlpha = map(phase, 60, 120, 1, 0);
      }
    
      for (let i = 0; i < 8; i++) {
        let angle = i * (TWO_PI / 6) + frameCount * 0.01;
        let r = this.size * 4;
        let x = cos(angle) * r * 0.6;
        let y = sin(angle) * r * 0.6;
    
        fill(255, 255, 220, a * phaseAlpha); // alpha에 phaseAlpha를 곱해줌
        ellipse(x, y, 3, 3);
      }
    }
    
    
    else if (sparkleStyle === 3) {
      let baseTime = (frameCount * 0.1) % (width * 2); 
      // 속도 더 느리게 (0.3 → 0.15)
    
      let growFactor = map(frameCount % 100, 0, 100, 1, 80);
      // 퍼지는 시간도 좀 느리게 (80프레임 → 100프레임)
    
      for (let i = 0; i < 14; i++) { 
        let angle = random(-PI / 8, PI / 8); 
        let r = this.size * random(15, 30);  
        // 덩어리 크기 절반으로 줄임 (30~60 → 15~30)
    
        let dx = (baseTime + cos(angle) * r * growFactor) % width; 
        let dy = sin(angle) * r * 0.8; 
    
        fill(255, 230, 180, a * 0.25);
        ellipse(dx, dy, r * 0.5, r * 0.3);
      }
    }
    

    pop();
  }
}
class Star {
  constructor(x, y, size, alpha, blinkSpeed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.alpha = alpha;
    this.blinkSpeed = blinkSpeed;
  }

  update() {
    // update 동작은 따로 필요 없으면 draw에서 바로 처리
  }

  draw() {
    let flicker = sin(frameCount * 0.05 * this.blinkSpeed) * 50;
    let a = constrain(this.alpha + flicker, 120, 255);
    let starX = (this.x + frameCount * 0.01) % width;

    noStroke();
    fill(255, 255, 255, a);
    ellipse(starX, this.y, this.size);
  }
}

function drawSparkles() {
  for (let sparkle of sparkles) {
    sparkle.draw();
  }
}

function drawStars() {
  for (let star of stars) {
    star.draw();
  }
}

class Sun {
  constructor(pos) {
    this.pos = pos.copy();
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    let scaleFactor = map(width, 500, 1500, 0.4, 0.9) * 1.3;
    scale(scaleFactor);
    noStroke();

    for (let i = 10; i >= 1; i--) {
      let alpha = map(i, 10, 1, 10, 100);
      let radius = 80 + i * 15;
      fill(255, 255, 200, alpha);
      ellipse(0, 0, radius);
    }

    fill(255, 240, 150, 255);
    ellipse(0, 0, 100);

    let detail = 3;
    for (let x = -50; x < 50; x += detail) {
      for (let y = -50; y < 50; y += detail) {
        if (dist(0, 0, x, y) < 50) {
          let n = noise((x + frameCount * 0.8) * 0.05, (y + frameCount * 0.8) * 0.05);
          let r = map(n, 0, 1, 220, 255);
          let g = map(n, 0, 1, 150, 200);
          let b = map(n, 0, 1, 80, 120);
          fill(r, g, b, 12);
          ellipse(x, y, detail * 1.5);
        }
      }
    }

    pop();
  }
}

class Moon {
  constructor(pos) {
    this.pos = pos.copy();
    this.shapeIndex = moonShapeIndex; // ⭐️ shape 저장
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    let scaleFactor = map(width, 500, 1500, 0.4, 0.9);
    scale(0.28 * scaleFactor);
    noStroke();

    drawingContext.save();
    drawingContext.filter = "blur(60px)";
    fill(200, 220, 255, 160);

    beginShape();
    if (this.shapeIndex === 0) {
      // 초승달 모양
      vertex(198, 0);
      vertex(198, 395);
      bezierVertex(198, 395, 197.667, 395, 197.5, 395);
      bezierVertex(88.4238, 395, 0, 306.576, 0, 197.5);
      bezierVertex(0, 88.4238, 88.4238, 0, 197.5, 0);
      bezierVertex(197.667, 0, 198, 0, 198, 0);
    } else if (this.shapeIndex === 1) {
      // 반달 모양
      vertex(221, 0);
      bezierVertex(258.685, 0, 294.167, 9.4327, 325.214, 26.0654);
      bezierVertex(312.226, 23.4, 298.776, 22, 285, 22);
      bezierVertex(175.095, 22, 86, 111.095, 86, 221);
      bezierVertex(86, 330.905, 175.095, 420, 285, 420);
      bezierVertex(298.777, 420, 312.226, 418.599, 325.214, 415.934);
      bezierVertex(294.167, 432.566, 258.685, 442, 221, 442);
      bezierVertex(98.9451, 442, 0, 343.055, 0, 221);
      bezierVertex(0, 98.9451, 98.9451, 0, 221, 0);
    } else {
      // 보름달 (완전 원)
      ellipse(0, 0, 500, 500);
    }
    endShape(CLOSE);

    drawingContext.restore();

    // 🌕 본체
    fill(245, 245, 255, 240);
    if (this.shapeIndex < 2) {
      beginShape();
      if (this.shapeIndex === 0) {
        vertex(198, 0);
        vertex(198, 395);
        bezierVertex(198, 395, 197.667, 395, 197.5, 395);
        bezierVertex(88.4238, 395, 0, 306.576, 0, 197.5);
        bezierVertex(0, 88.4238, 88.4238, 0, 197.5, 0);
        bezierVertex(197.667, 0, 198, 0, 198, 0);
      } else if (this.shapeIndex === 1) {
        vertex(221, 0);
        bezierVertex(258.685, 0, 294.167, 9.4327, 325.214, 26.0654);
        bezierVertex(312.226, 23.4, 298.776, 22, 285, 22);
        bezierVertex(175.095, 22, 86, 111.095, 86, 221);
        bezierVertex(86, 330.905, 175.095, 420, 285, 420);
        bezierVertex(298.777, 420, 312.226, 418.599, 325.214, 415.934);
        bezierVertex(294.167, 432.566, 258.685, 442, 221, 442);
        bezierVertex(98.9451, 442, 0, 343.055, 0, 221);
        bezierVertex(0, 98.9451, 98.9451, 0, 221, 0);
      }
      endShape(CLOSE);
    } else {
      ellipse(0, 0, 500, 500);
    }

    pop();
  }
}

class Ocean {
  constructor(palette, waveParticleScale, horizonRatio) {
    this.palette = palette;
    this.waveParticleScale = waveParticleScale;
    this.horizonRatio = horizonRatio;
  }

  drawWaveParticles(shipTrail) {
    noStroke();
    let baseSpacing = 13;
    let spacing = baseSpacing * this.waveParticleScale;
    let horizonY = height * this.horizonRatio;
    let recentTrail = shipTrail.slice(-30);
    let time = frameCount * 0.015;

    for (let y = horizonY; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        let wave = 0;
        if (recentTrail.length > 0) {
          for (let p of recentTrail) {
            let d = dist(x, y, p.x, p.y);
            wave += sin(d * 0.04 - time);
          }
          wave /= recentTrail.length;
        } else {
          let phase = (x + y) * 0.02;
          wave = sin(phase + time) * 0.6 + cos(phase * 0.5 + time * 1.3) * 0.4;
          wave *= 0.5;
        }

        let baseSize = map(wave, -1, 1, 6, 14);
        let size = baseSize * this.waveParticleScale;
        let col = this.palette[(floor(x / spacing) + floor(y / spacing)) % this.palette.length];
        let yOffset = sin(x * 0.02 + time * 2) * 4 + cos(y * 0.01 + time * 1.5) * 2;

        fill(col);
        ellipse(x, y + yOffset, size);
      }
    }
  }
}

class BubbleManager {
  constructor(oceanBaseColor) {
    this.bubbles = [];
    this.oceanBaseColor = oceanBaseColor;
  }

  add(bubble) {
    this.bubbles.push(bubble);
  }

  updateAndDraw() {
    noStroke();
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      let b = this.bubbles[i];
      b.y += sin(frameCount * 0.12 + b.x * 0.05) * 1.2;
      b.x += cos(frameCount * 0.1 + b.y * 0.05) * 1.0;

      let angleOffset = sin(frameCount * 0.05 + b.x * 0.02) * PI;
      let pulse = sin(frameCount * 0.25 + b.x * 0.5 + b.y * 0.4) * 0.5 + 1.1;
      let w = b.r * pulse * random(1.4, 2.8);
      let h = b.r * pulse * random(0.7, 1.3);

      push();
      translate(b.x, b.y);
      rotate(angleOffset);
      fill(255, 255, 255, b.alpha * 0.2);
      ellipse(0, 0, w, h);
      pop();

      fill(255, 255, 255, b.alpha * 0.06);
      ellipse(b.x, b.y, b.r * pulse * random(6, 10));

      b.r += 0.5;
      b.alpha -= 2;
      if (b.alpha <= 0) {
        this.bubbles.splice(i, 1);
      }
    }
  }
}
function drawSunOrMoon() {
  if (["night", "twilight", "stormy", "blush", "rainyNight"].includes(timeOfDay)) {
    if (moon) {
      moon.draw(); // 밤이면 랜덤 달 모양 그리기
    }
  } else {
    if (sun) {
      sun.draw(); // 낮이면 해 그리기
    }
  }
}


function drawOcean() {
  drawWaveParticles();
}
function drawWaveParticles() {
  noStroke();

  let baseSpacing = 13;
  let spacing = baseSpacing * waveParticleScale;
  let horizonY = height * horizonRatio;

  let recentTrail = shipTrail.slice(-30);
  let time = frameCount * 0.015;

  for (let y = horizonY; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      let wave = 0;

      if (recentTrail.length > 0) {
        for (let p of recentTrail) {
          let d = dist(x, y, p.x, p.y);
          wave += sin(d * 0.04 - time);
        }
        wave /= recentTrail.length;
      } else {
        let phase = (x + y) * 0.02;
        wave = sin(phase + time) * 0.6 + cos(phase * 0.5 + time * 1.3) * 0.4;
        wave *= 0.5;
      }

      let baseSize = map(wave, -1, 1, 6, 14);
      let size = baseSize * waveParticleScale;

      let col =
        palette[(floor(x / spacing) + floor(y / spacing)) % palette.length];
      let yOffset =
        sin(x * 0.02 + time * 2) * 4 + cos(y * 0.01 + time * 1.5) * 2;

      fill(col);
      ellipse(x, y + yOffset, size);
    }
  }
}

function drawShipTrail() {
  noStroke();
  let horizonY = height * horizonRatio;
  const deleteThreshold = horizonY - 5; // ★ 수평선보다 약간만 위까지 유지

  for (let i = 0; i < shipTrail.length; i++) {
    let p = shipTrail[i];
    let t = constrain(map(p.life, 0, 300, 0, 1), 0, 1);

    // horizon 가까워질수록 alpha 부드럽게 줄이기
    let fadeFactor = 1.0;
    if (p.y < horizonY + 50) {
      fadeFactor = map(p.y, deleteThreshold, horizonY + 50, 0, 1);
    }
    fadeFactor = constrain(fadeFactor, 0, 1);

    let alpha = lerp(100, 0, t) * fadeFactor;

    let w = lerp(30, 1000, t);
    let h = lerp(10, 30, t);
    fill(255, 255, 255, alpha * 0.8);
    ellipse(p.x, p.y, w, h);

    for (let j = 0; j < 50; j++) {
      let angle = random(TWO_PI);
      let dist = random(20, 60);
      let bx = p.x + cos(angle) * dist;
      let by = p.y + sin(angle) * dist;
      let r = random(6, 20);
      let bAlpha = map(p.life, 0, 30, 80, 0) * fadeFactor;
      fill(255, 255, 255, bAlpha);
      ellipse(bx, by, r);
    }

    for (let j = 0; j < 6; j++) {
      let offX = random(-w * 0.6, w * 0.6);
      let offY = random(-h * 0.5, h * 0.5);
      let r = random(30, 200);
      fill(255, 255, 255, alpha * random(0.02, 0.04));
      ellipse(p.x + offX, p.y + offY, r);
    }

    for (let b = 0; b < 30; b++) {
      let side = random() < 0.5 ? -1 : 1;
      let radius = random(30, w * 0.5);
      let angle = random(-PI / 6, PI / 6);
      let bx = p.x + side * radius * cos(angle);
      let by = p.y + radius * sin(angle) * 0.4;
      let r = random(6, 12);
      fill(255, 255, 255, alpha * random(0.3, 0.6));
      ellipse(bx, by, r);
    }
  }

  // 흔적 삭제 조건
  for (let i = shipTrail.length - 1; i >= 0; i--) {
    let p = shipTrail[i];
    p.life++;

    const isOffscreen =
      p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100;
    const isMouseTrail = !isAutoShip;
    const isOutOfMouseRange =
      isMouseTrail &&
      (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height);

    if (
      p.life > 300 ||
      p.y <= deleteThreshold || // ★ 수평선 약간 아래에서 삭제
      isOffscreen ||
      isOutOfMouseRange
    ) {
      shipTrail.splice(i, 1);
    }
  }
}

function drawBubbles() {
  noStroke();
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];

    // 위치 움직임
    b.y += sin(frameCount * 0.12 + b.x * 0.05) * 1.2;
    b.x += cos(frameCount * 0.1 + b.y * 0.05) * 1.0;

    // 크기 변화
    let angleOffset = sin(frameCount * 0.05 + b.x * 0.02) * PI;
    let pulse = sin(frameCount * 0.25 + b.x * 0.5 + b.y * 0.4) * 0.5 + 1.1;
    let w = b.r * pulse * random(1.4, 2.8);
    let h = b.r * pulse * random(0.7, 1.3);

    push();
    translate(b.x, b.y);
    rotate(angleOffset);
    fill(255, 255, 255, b.alpha * 0.2);
    ellipse(0, 0, w, h);
    pop();

    // 기본 반사 컬러 정의
    let shimmerColor;
    if (["blush", "turquoise", "golden"].includes(timeOfDay)) {
      shimmerColor = lerpColor(
        color(255, 255, 255, b.alpha * 0.2),
        oceanBaseColor,
        random(0.3, 0.6)
      );
    } else if (timeOfDay === "sunset") {
      shimmerColor = color(255, 200, 180, b.alpha * 0.25);
    } else if (timeOfDay === "morning") {
      shimmerColor = color(255, 240, 200, b.alpha * 0.25);
    } else if (timeOfDay === "night") {
      shimmerColor = color(180, 220, 255, b.alpha * 0.2);
    } else {
      shimmerColor = color(255, 255, 255, b.alpha * 0.2);
    }

    // 반사 타원
    fill(shimmerColor);
    ellipse(
      b.x + sin(frameCount * 0.1 + i) * 2,
      b.y + cos(frameCount * 0.1 + i) * 2,
      b.r * pulse * random(2.2, 4.2)
    );

    // 빛 번짐 효과
    fill(
      red(shimmerColor),
      green(shimmerColor),
      blue(shimmerColor),
      b.alpha * 0.06
    );
    ellipse(b.x, b.y, b.r * pulse * random(6, 10));

    // 하늘과 더 대비되도록 하얀 반사 덧입히기 (golden, sunset 시간대 한정)
    if (["golden", "sunset"].includes(timeOfDay)) {
      fill(255, 255, 255, b.alpha * 0.12);
      ellipse(
        b.x + random(-2, 2),
        b.y + random(-2, 2),
        b.r * pulse * random(2.5, 5.5)
      );
    }

    // 성장 및 투명도 감소
    b.r += 0.5;
    b.alpha -= 2;

    if (b.alpha <= 0) {
      bubbles.splice(i, 1);
    }
  }
}

function createShipTrail() {
  shipPos = createVector(random(width * 0.3, width * 0.7), height + 50);
  let angle = random(-PI / 3, (-2 * PI) / 3);
  shipDirection = p5.Vector.fromAngle(angle).normalize().mult(shipSpeed);
}

let rainbowBuffer = null;

class Rainbow {
  constructor(horizonY, centerX, style) {
    this.horizonY = horizonY;
    this.centerX = centerX;
    this.style = style;
    this.buffer = createGraphics(width, height);
    this.generateRainbow();
  }

  generateRainbow() {
    this.buffer.noStroke();
    let gradient = this.buffer.drawingContext.createLinearGradient(
      width / 2,
      0,
      width / 2,
      this.horizonY
    );

    gradient.addColorStop(0.0, "rgba(255, 0, 0, 0.3)");
    gradient.addColorStop(0.25, "rgba(255, 179, 0, 0.3)");
    gradient.addColorStop(0.4, "rgba(255, 247, 0, 0.3)");
    gradient.addColorStop(0.55, "rgba(0, 255, 128, 0.3)");
    gradient.addColorStop(0.7, "rgba(45, 174, 255, 0.3)");
    gradient.addColorStop(0.85, "rgba(10, 0, 190, 0.3)");
    gradient.addColorStop(1.0, "rgba(179, 0, 196, 0.3)");
    

    this.buffer.drawingContext.fillStyle = gradient;

    if (this.style === 1) {
      this.drawStyle1();
    } else if (this.style === 2) {
      this.drawStyle2();
    } else {
      this.drawStyle3();
    }
  }

  draw() {
    push();
    drawingContext.save();
    drawingContext.filter = "blur(90px)";
    image(this.buffer, 0, 0);
    drawingContext.restore();
    pop();
  }

  drawStyle1() {
    let pg = this.buffer;
    pg.beginShape();
    pg.vertex(this.centerX - width * 0.4, 0);
    pg.vertex(this.centerX - width * 0.7, 0);

    pg.bezierVertex(
      this.centerX - width * 0.8,
      this.horizonY * 0.2,
      this.centerX - width * 0.1,
      this.horizonY * 0.5,
      this.centerX + width * 0.1,
      this.horizonY * 0.7
    );

    pg.bezierVertex(
      this.centerX + width * 0.6,
      this.horizonY,
      this.centerX + width * 0.8,
      this.horizonY * 0.8,
      this.centerX + width * 0.6,
      this.horizonY
    );

    pg.vertex(this.centerX + width * 0.6, this.horizonY);

    pg.bezierVertex(
      this.centerX + width * 0.4,
      this.horizonY * 0.7,
      this.centerX - width * 0.2,
      this.horizonY * 0.3,
      this.centerX - width * 0.4,
      0
    );
    pg.endShape(CLOSE);
  }

  drawStyle2() {
    let pg = this.buffer;
    pg.beginShape();
    pg.vertex(this.centerX + width * 0.4, 0);
    pg.vertex(this.centerX + width * 0.7, 0);

    pg.bezierVertex(
      this.centerX + width * 0.8,
      this.horizonY * 0.25,
      this.centerX + width * 0.1,
      this.horizonY * 0.55,
      this.centerX - width * 0.1,
      this.horizonY * 0.75
    );

    pg.bezierVertex(
      this.centerX - width * 0.7,
      this.horizonY * 1.05,
      this.centerX - width * 0.9,
      this.horizonY * 0.85,
      this.centerX - width * 0.6,
      this.horizonY
    );

    pg.vertex(this.centerX - width * 0.6, this.horizonY);

    pg.bezierVertex(
      this.centerX - width * 0.4,
      this.horizonY * 0.7,
      this.centerX + width * 0.2,
      this.horizonY * 0.3,
      this.centerX + width * 0.4,
      0
    );
    pg.endShape(CLOSE);
  }

  drawStyle3() {
    let pg = this.buffer;
    pg.beginShape();
    pg.vertex(this.centerX - width * 0.3, 0);
    pg.vertex(this.centerX - width * 0.65, 0);

    pg.bezierVertex(
      this.centerX - width * 0.75,
      this.horizonY * 0.2,
      this.centerX + width * 0.75,
      this.horizonY * 0.8,
      this.centerX + width * 0.65,
      this.horizonY
    );

    pg.vertex(this.centerX + width * 0.65, this.horizonY);

    pg.bezierVertex(
      this.centerX + width * 0.4,
      this.horizonY * 0.6,
      this.centerX - width * 0.4,
      this.horizonY * 0.2,
      this.centerX - width * 0.3,
      0
    );
    pg.endShape(CLOSE);
  }
  update() {
    this.centerX += sin(frameCount * 0.01) * 0.2; // 좌우로 살짝 흔들리기
  }
  
}

function updateShootingStars() {
  // 별똥별 이동
  for (let star of shootingStars) {
    star.x += star.vx;
    star.y += star.vy;
    star.trail.push({ x: star.x, y: star.y, alpha: 255 });
    if (star.trail.length > 20) {
      star.trail.shift();
    }
  }

  let horizonY = height * horizonRatio;

  // 별똥별 삭제 + 삭제된 개수 세기
  let removedCount = 0;
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    let star = shootingStars[i];
    if (
      star.x > width + 100 ||
      star.y > height + 100 ||
      star.y >= horizonY
    ) {
      shootingStars.splice(i, 1);
      removedCount++;
    }
  }

  // 삭제된 개수만큼 새로 만들기
  for (let i = 0; i < removedCount; i++) {
    createShootingStar();
  }
}

function drawShootingStars() {
  noStroke();
  for (let star of shootingStars) {
    push();
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(255, 240, 200, 180);

    // 잔상 먼저 그리기
    for (let t of star.trail) {
      fill(255, 250, 200, t.alpha);
      ellipse(t.x, t.y, 4, 4); // 기존보다 2배 크게
      t.alpha *= 0.9; // 천천히 사라지게
    }

    // 본체 - 더 빛나게
    fill(255, 255, 230, 250);
    ellipse(star.x, star.y, 8, 8); // 기존보다 훨씬 크게 (4 → 8)
    pop();
  }
}

function createShootingStar() {
  let startX = random(width * 0.1, width * 0.9);
  let startY = random(height * 0.05, height * 0.3); // 조금 더 위쪽에서 시작

  let angle = random(PI / 12, PI / 5); // 더 다양한 각도
  let speed = random(6, 10); // 속도 약간 느리게 (몽환적으로)

  shootingStars.push({
    x: startX,
    y: startY,
    vx: cos(angle) * speed,
    vy: sin(angle) * speed,
    trail: [],
  });
}
let raindrops = [];

function createRain() {
  raindrops = [];
  for (let i = 0; i < 300; i++) { // 개수는 자유롭게
    raindrops.push({
      x: random(width),
      y: random(-height, 0), // 시작 y는 랜덤
      speed: random(6, 12),  // 낙하 속도
      length: random(10, 20), // 빗줄기 길이
      thickness: random(1, 2), // 두께
    });
  }
}
function drawRain() {
  let horizonY = height * horizonRatio;

  for (let i = raindrops.length - 1; i >= 0; i--) {
    let drop = raindrops[i];

    // 비 이동
    drop.y += drop.speed;

    // 아래로 갈수록 더 진하게
    let alpha = map(drop.y, 0, horizonY, 100, 255);

    stroke(200, 220, 255, alpha);
    strokeWeight(drop.thickness);
    line(drop.x, drop.y, drop.x, drop.y + drop.length);

    // 수평선에 도달하면 다시 위로
    if (drop.y > horizonY) {
      drop.y = random(-100, 0);
      drop.x = random(width);
      drop.speed = random(6, 12);
      drop.length = random(10, 20);
      drop.thickness = random(1, 2);
    }
  }
}


let lightningTimer = 0;
let lightningBolts = []; 
function maybeFlashLightning() {
  if (frameCount % 120 === 0 && random() < 0.7) {
    lightningTimer = 10;
    createLightningBolt();
  }

  if (lightningTimer > 0) {
    background(255, 255, 255, 80);
    drawLightningBolts();
    lightningTimer--;
  }
}


function createLightningBolt() {
  let startX = random(width * 0.3, width * 0.7);
  let startY = 0;
  let endY = height * horizonRatio * random(0.6, 0.9); // 수평선보다 살짝 위까지만

  let bolt = [];
  let x = startX;
  let y = startY;
  bolt.push({ x, y });

  while (y < endY) {
    x += random(-20, 20);
    y += random(20, 40);
    bolt.push({ x, y });
  }

  lightningBolts.push(bolt);
}

function drawLightningBolts() {
  stroke(255);
  strokeWeight(2);
  for (let bolt of lightningBolts) {
    beginShape();
    for (let p of bolt) {
      vertex(p.x, p.y);
    }
    endShape();
  }
}
let fireworks = [];

function triggerFireworks() {
  for (let i = 0; i < 5; i++) {
    let mainColors = [
      [255, 150, 200], // 핑크
      [255, 100, 180], // 핑크-퍼플
      [255, 170, 130], // 살구색
      [255, 200, 230], // 연분홍
      [200, 150, 255], // 연보라
    ];

    let subColors = [
      [255, 230, 100], // 노랑
      [255, 180, 120], // 오렌지
      [255, 255, 255], // 하양
      [200, 220, 255], // 푸른빛 하양
      [255, 190, 220], // 연핑크
    ];

    let main = random(mainColors);
    let sub = random(subColors);

    fireworks.push({
      x: random(width * 0.2, width * 0.8),
      y: random(height * 0.1, height * 0.4),
      mainColor: main,
      subColor: sub,
      particles: [],
      life: 0,
      sizeFactor: random(1.2, 2.8) // 작은 것도 있고 큰 것도 있게
    });
  }
}

function updateAndDrawFireworks() {
  for (let f of fireworks) {
    if (f.particles.length === 0) {
      let particleCount = int(random(100, 180));
      for (let i = 0; i < particleCount; i++) {
        let angle = random(TWO_PI);
        let speed = random(2, 7);
        f.particles.push({
          x: 0,
          y: 0,
          vx: cos(angle) * speed,
          vy: sin(angle) * speed,
          radius: random(3, 7),
          colorMix: random() < 0.7 ? "main" : "sub" // 메인 중심, 가끔 서브
        });
      }
    }

    push();
    translate(f.x, f.y);
    noStroke();
    for (let p of f.particles) {
      let alpha = map(f.life, 0, 100, 255, 0);

      let baseColor = p.colorMix === "main" ? f.mainColor : f.subColor;

      // Glow (바깥 퍼짐)
      fill(baseColor[0], baseColor[1], baseColor[2], alpha * 0.08);
      ellipse(p.x, p.y, p.radius * f.sizeFactor * 5);

      // 알맹이
      fill(baseColor[0], baseColor[1], baseColor[2], alpha);
      ellipse(p.x, p.y, p.radius * f.sizeFactor);

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.vy += 0.04;
    }
    pop();

    f.life++;

    if (f.life > 100) {
      f.toRemove = true;
    }
  }

  fireworks = fireworks.filter(f => !f.toRemove);
}


let fishes = [];

function triggerFishSchool() {
  fishes = [];
  let startX = -100;
  let horizonY = height * horizonRatio;
  let startY = random(horizonY + 50, height * 0.9); // 바다 쪽에서 시작
  let directionAngle = random(-PI / 16, PI / 16);
  let fishCount = int(random(6, 10)); // 물고기 수 조금 줄임

  // 바다쪽 색 기준으로 (shallowColor)
  let baseOceanColor = shallowColor;

  for (let i = 0; i < fishCount; i++) {
    let distance = i * 40;
    let offsetY = abs(i - fishCount / 2) * 20;

    fishes.push({
      x: startX - distance,
      y: startY + offsetY,
      vx: cos(directionAngle) * random(3, 5),
      vy: sin(directionAngle) * random(1, 2),
      size: random(10, 16),
      swimPhase: random(TWO_PI),
      baseColor: lerpColor(
        baseOceanColor,
        color(230, 230, 255), // 옅은 하늘+은은한 회색 느낌
        random(0.3, 0.7)
      ),
      life: 0
    });
  }
}

function updateAndDrawFish() {
  noStroke();

  for (let f of fishes) {
    let swimWiggle = sin(frameCount * 0.4 + f.swimPhase) * 5;

    push();
    translate(f.x, f.y);
    rotate(atan2(f.vy, f.vx) + radians(swimWiggle));
    fill(f.baseColor);
    ellipse(0, 0, f.size * 2.0, f.size * 0.8); // 더 물고기 느낌으로 (길고 둥글게)
    pop();

    f.x += f.vx;
    f.y += f.vy + sin(frameCount * 0.08 + f.x * 0.02) * 0.5;
    f.life++;
  }

  fishes = fishes.filter(f => f.x < width + 200 && f.life < 400);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    turnAngle = -0.05;
  } else if (keyCode === RIGHT_ARROW) {
    turnAngle = 0.05;
  } else {
    let k = key.toLowerCase();
    if (k === 'f') {
      triggerFireworks();
    } else if (k === 'a') {
      triggerFishSchool();  // 변경: triggerBirdFlock() → triggerFishSchool()
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    turnAngle = 0;
  }
}


function mouseMoved() {
  let horizonY = height * horizonRatio;

  if (
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= horizonY &&
    mouseY <= height
  ) {
    shipTrail.push({ x: mouseX, y: mouseY, life: 0 });
  }
}