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

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  cloudDirection = random() < 0.5 ? "left" : "right"; 
  rainbowStyle = floor(random(1, 4));
  rainbowCenterX = random(width * 0.4, width * 0.6);

  shipSpeed = random(0.5, 1);
  let sizeMode = random(["medium", "large"]);
  waveParticleScale = sizeMode === "large" ? 2.3 : 1.8;

  const times = [
    "morning", "day", "sunset", "night", "twilight", "golden",
    "turquoise", "mediterranean", "stormy", "blush",
  ];
  timeOfDay = random(times); // ⭐ 먼저 시간대 랜덤

  setTimeColors(); // ⭐ 이 시간대에 맞는 컬러 세팅

  if (["night", "twilight", "stormy", "blush"].includes(timeOfDay)) {
    hasShootingStars = random() < 0.7; // ⭐ 시간대 기반으로 별똥별 70% 확률
  } else {
    hasShootingStars = false;
  }

  if (["turquoise", "mediterranean", "golden"].includes(timeOfDay)) {
    horizonRatio = 0.45;
  } else if (["sunset", "twilight", "blush"].includes(timeOfDay)) {
    horizonRatio = 0.55;
  } else {
    horizonRatio = 0.5;
  }

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

  createClouds();
  createShipTrail();

  if (["night", "twilight", "stormy"].includes(timeOfDay)) {
    moonPhase = random(["crescent", "half", "gibbous", "full", "new"]);
    moonShapeIndex = floor(random(3));
    moonPos = createVector(random(width * 0.3, width * 0.7), height * 0.2);
  }

  let sparkleMinY = height * horizonRatio + 30;
  let sparkleMaxY = height * 0.92;

  for (let i = 0; i < 50; i++) {
    sparkles.push({
      x: random(width * 0.1, width * 0.9),
      y: random(sparkleMinY, sparkleMaxY),
      size: random(0.8, 1.5),
      alpha: random(100, 180),
      flicker: random(0.08, 0.18),
    });
  }

  const starTimes = ["night", "twilight", "stormy", "blush"];
  if (starTimes.includes(timeOfDay)) {
    let horizonY = height * horizonRatio;
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: random(width),
        y: random(horizonY * 0.2, horizonY - 30),
        size: random(1, 3),
        alpha: random(100, 255),
        blinkSpeed: random(0.5, 2),
      });
    }
  }

  for (let i = 0; i < int(random(3, 5)); i++) {
    createShootingStar();
  }
}

function draw() {
  background(255);
  drawBackground();
  if (["night", "twilight", "stormy"].includes(timeOfDay)) {
    drawStars();
    drawMoon();
  } else {
    drawSun();
  }
  if (
    !["night", "twilight", "stormy"].includes(timeOfDay) &&
    clouds.length === 0
  ) {
    drawRainbow();
  }

  updateClouds();
  drawClouds();
  drawOcean();
  drawSparkles();

  let horizonY = height * horizonRatio;

  shipDirection.rotate(turnAngle);
  let curveAngle = sin(frameCount * 0.01) * 0.05;
  let dir = shipDirection.copy().rotate(curveAngle);
  shipPos.add(dir);

  if (isAutoShip) {
    if (shipPos.y > -200) {
      shipTrail.push({ x: shipPos.x, y: shipPos.y, life: 0 });
      shipPos.add(shipDirection);
    }

    // 수평선 위쪽에 도달하면 수동 전환
    if (shipPos.y <= horizonY - 100) {
      isAutoShip = false;
    }
  } else {
    // 마우스가 화면 안에 있고, 수평선 아래에 있을 때만 흔적 추가
    if (
      mouseX >= 0 &&
      mouseX <= width &&
      mouseY >= horizonY &&
      mouseY <= height
    ) {
      shipTrail.push({ x: mouseX, y: mouseY, life: 0 });
    }
  }
  if (hasShootingStars) {
    updateShootingStars();
    drawShootingStars();
  }

  drawShipTrail();
  drawBubbles();
}

function drawSparkles() {
  noStroke();

  for (let s of sparkles) {
    let flicker = sin(frameCount * s.flicker + s.x * 0.1) * 100; // 강한 반짝임
    let alpha = constrain(s.alpha + flicker, 0, 255);

    // 외곽 퍼짐 효과
    fill(255, 255, 255, alpha * 0.12);
    ellipse(s.x, s.y, s.size * 80, s.size * 30);

    // 중앙 glow
    fill(255, 255, 255, alpha * 0.5);
    ellipse(s.x, s.y, s.size * 14);

    // 컬러톤 추가 (보랏빛 느낌도 넣을 수 있음)
    fill(255, 240, 180, alpha * 0.3);
    ellipse(s.x, s.y, s.size * 35);

    // ✨ 추가 강화 반짝임 포인트 (작은 스파클 효과)
    if (random() < 0.08) {
      fill(255, 255, 255, alpha);
      ellipse(s.x + random(-2, 2), s.y + random(-2, 2), s.size * 3);
    }
  }
}

function setTimeColors() {
  const themes = [
    {
      name: "morning",
      sky: [color(255, 240, 230), color(255, 255, 220), color(220, 250, 255)],
      ocean: color(140, 200, 230),
      shallow: color(200, 240, 230),
      deep: color(40, 120, 180),
      sand: color(250, 240, 200),
      sun: color(255, 240, 180, 220),
      sunPos: createVector(width * 0.2, height * 0.25),
    },
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
      sky: [color(255, 150, 130), color(255, 200, 160), color(255, 240, 200)],
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
      sky: [color(250, 220, 140), color(255, 240, 180), color(255, 250, 210)],
      ocean: color(210, 190, 140),
      shallow: color(250, 220, 170),
      deep: color(190, 140, 110),
      sand: color(255, 245, 190),
      sun: color(255, 210, 120, 200),
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
      sky: [color(240, 250, 255), color(255, 255, 245), color(255, 250, 230)],
      ocean: color(100, 180, 210),
      shallow: color(160, 220, 230),
      deep: color(60, 130, 170),
      sand: color(250, 240, 200),
      sun: color(255, 255, 190, 220),
      sunPos: createVector(width * 0.6, height * 0.15),
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
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    let flicker = sin(frameCount * 0.05 * star.blinkSpeed) * 50;
    let alpha = constrain(star.alpha + flicker, 120, 255);
    fill(255, 255, 255, alpha);
    ellipse(star.x, star.y, star.size);
  }
}

function createClouds() {
  clouds = [];
  let cloudCount = random(15, 25);
  let tries = 0;

  let horizonY = height * horizonRatio;

  // 수평선보다 더 위쪽으로 생성되도록 조정
  let minCloudY = height * 0.05;
  let maxCloudY = horizonY * 0.55; // 기존 0.75 →ss 0.55 로 상향 조정

  // 구름 크기 반응형 & 절반 축소
  let baseScale = map(width, 500, 1500, 0.3, 0.65); // 기존보다 50% 작게

  let allowClearSkyTimes = [
    "day",
    "morning",
    "turquoise",
    "golden",
    "mediterranean",
  ];
  if (allowClearSkyTimes.includes(timeOfDay) && random() < 0.25) {
    clearSky = true; // 무지개 조건에도 사용됨
    return; // 구름 생성 안 함
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

    clouds.push({ x, y, s, alpha, style, vx });
    tries++;
  }
}

function updateClouds() {
  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];
    c.x += c.vx;

    let buffer = 400 * c.s;

    // 오른쪽으로 나가면 왼쪽으로 순환
    if (c.vx > 0 && c.x - buffer > width) {
      c.x = -buffer;
    }

    // 왼쪽으로 나가면 오른쪽으로 순환
    if (c.vx < 0 && c.x + buffer < 0) {
      c.x = width + buffer;
    }
  }
}

function addCloud(xPos) {
  let horizonY = height * horizonRatio;
  let minY = height * 0.05;
  let maxY = horizonY * 0.9;

  let baseScale = map(width, 500, 1500, 0.6, 1.3);
  let y = random(minY, maxY);
  let s = random(1.0, 1.4) * baseScale;

  let alpha = ["twilight", "night", "stormy"].includes(timeOfDay) ? 30 : 60;
  let style = floor(random(3));

  let vx = random(0.3, 0.6) * (random() < 0.5 ? 1 : -1);

  clouds.push({
    x: xPos,
    y,
    s,
    alpha,
    style,
    vx,
    life: 0,
    maxLife: random(2500, 5000),
  });
}
function drawClouds() {
  for (let c of clouds) {
    // 기본 구름
    drawSingleCloud(c);

    // 왼쪽에 복제 (화면 이어짐 보정)
    drawSingleCloud({ ...c, x: c.x - width });

    // 오른쪽에 복제 (반대 방향용)
    drawSingleCloud({ ...c, x: c.x + width });
  }
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

function drawSunOrMoon() {
  let isNightTime = ["night", "twilight", "stormy", "blush"].includes(
    timeOfDay
  );

  if (isNightTime) {
    drawMoon();
  } else {
    drawSun();
  }
}
function drawSun() {
  push();
  translate(sunPos.x, sunPos.y);

  let scaleFactor = map(width, 500, 1500, 0.4, 0.9) * 1.3;
  scale(scaleFactor);

  noStroke();

  // 🔆 태양 오라
  for (let i = 10; i >= 1; i--) {
    let alpha = map(i, 10, 1, 10, 100);
    let radius = 80 + i * 15;
    fill(255, 255, 200, alpha);
    ellipse(0, 0, radius);
  }

  // ☀️ 태양 본체
  fill(255, 240, 150, 255);
  ellipse(0, 0, 100);

  // 🔥 표면 노이즈
  let detail = 3;
  for (let x = -50; x < 50; x += detail) {
    for (let y = -50; y < 50; y += detail) {
      let d = dist(0, 0, x, y);
      if (d < 50) {
        let n = noise(
          (x + frameCount * 0.8) * 0.05,
          (y + frameCount * 0.8) * 0.05
        );
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

function drawMoon() {
  push();
  translate(moonPos.x, moonPos.y);

  let scaleFactor = map(width, 500, 1500, 0.4, 0.9);
  scale(0.28 * scaleFactor);

  noStroke();

  // ✨ 블러 달빛 효과
  drawingContext.save();
  drawingContext.filter = "blur(80px)";
  fill(200, 220, 255, 160);
  ellipse(0, 0, 500, 500);
  drawingContext.restore();

  // 🌕 달 본체
  fill(245, 245, 255, 240);
  ellipse(0, 0, 500, 500);

  // 🌌 노이즈 텍스처
  let detail = 4; // 픽셀 간격 (낮을수록 디테일 ↑)
  for (let x = -250; x < 250; x += detail) {
    for (let y = -250; y < 250; y += detail) {
      let d = dist(0, 0, x, y);
      if (d < 250) {
        let n = noise(
          (x + frameCount * 0.1) * 0.01,
          (y + frameCount * 0.1) * 0.01
        );
        let bright = map(n, 0, 1, 220, 255);
        fill(bright, bright, 255, 8); // 옅은 점으로 텍스처 느낌
        ellipse(x, y, detail * 1.2);
      }
    }
  }

  pop();
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

  for (let i = 0; i < shipTrail.length; i++) {
    let p = shipTrail[i];
    let t = constrain(map(p.life, 0, 300, 0, 1), 0, 1);
    let fadeFactor = constrain(map(p.y, horizonY + 50, horizonY, 1, 0), 0, 1);
    let alpha = lerp(100, 0, t) * fadeFactor;

    let w = lerp(30, 1000, t);
    let h = lerp(10, 30, t);
    fill(255, 255, 255, alpha * 0.8);
    ellipse(p.x, p.y, w, h);

    for (let i = 0; i < 50; i++) {
      let angle = random(TWO_PI);
      let dist = random(20, 60);
      let bx = p.x + cos(angle) * dist;
      let by = p.y + sin(angle) * dist;
      let r = random(6, 20);
      let bAlpha = map(p.life, 0, 30, 80, 0);
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

  // ✅ 흔적 제거 조건 강화
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
      p.y <= height * horizonRatio - 20 ||
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

function drawCloudStyle1(x, y, scaleVal = 1, alpha = 255) {
  push();
  translate(x, y);
  scale(scaleVal);
  drawingContext.filter = "blur(12px)";
  fill(255, 255, 255, alpha);
  noStroke();
  beginShape();
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
  endShape(CLOSE);
  pop();
}

function drawCloudStyle2(x, y, scaleVal = 1, alpha = 255) {
  push();
  translate(x, y);
  scale(scaleVal);
  drawingContext.filter = "blur(12px)";
  fill(255, 255, 255, alpha);

  noStroke();
  beginShape();
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
  endShape(CLOSE);
  pop();
}

function drawCloudStyle3(x, y, scaleVal = 1, alpha = 255) {
  push();
  translate(x, y);
  scale(scaleVal);
  fill(255, 255, 255, alpha);
  drawingContext.filter = "blur(12px)";
  noStroke();
  beginShape();
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
  endShape(CLOSE);
  pop();
}
let rainbowBuffer = null;

function drawRainbow() {
  if (
    clouds.length > 0 ||
    ["night", "twilight", "stormy", "sunset"].includes(timeOfDay)
  )
    return;

  let horizonY = height * horizonRatio;

  if (!rainbowBuffer) {
    rainbowBuffer = createGraphics(width, height);
    rainbowBuffer.noStroke();

    let gradient = rainbowBuffer.drawingContext.createLinearGradient(
      width / 2,
      0,
      width / 2,
      horizonY
    );

    gradient.addColorStop(0.0, "rgba(255, 0, 0, 0.5)"); // 빨강
    gradient.addColorStop(0.264423, "rgba(255, 179, 0, 0.5)"); // 주황
    gradient.addColorStop(0.442308, "rgba(255, 247, 0, 0.5)"); // 노랑
    gradient.addColorStop(0.586538, "rgba(0, 255, 128, 0.5)"); // 연두
    gradient.addColorStop(0.740385, "rgba(45, 174, 255, 0.5)"); // 파랑
    gradient.addColorStop(0.894231, "rgba(10, 0, 190, 0.5)"); // 남색
    gradient.addColorStop(1.0, "rgba(179, 0, 196, 0.5)"); // 보라

    rainbowBuffer.drawingContext.fillStyle = gradient;

    rainbowBuffer.drawingContext.save();
    rainbowBuffer.drawingContext.filter = "blur(80px)";

    if (rainbowStyle === 1) {
      drawRainbowStyle1(rainbowBuffer, horizonY, rainbowCenterX);
    } else if (rainbowStyle === 2) {
      drawRainbowStyle2(rainbowBuffer, horizonY, rainbowCenterX);
    } else {
      drawRainbowStyle3(rainbowBuffer, horizonY, rainbowCenterX);
    }

    rainbowBuffer.drawingContext.restore();
  }

  push();
  tint(255, 140);
  image(rainbowBuffer, 0, 0);
  noTint();
  pop();
}

function drawRainbowStyle1(pg, horizonY, centerX) {
  pg.beginShape();
  pg.vertex(centerX - width * 0.4, 0); // 시작점 더 바깥
  pg.vertex(centerX - width * 0.7, 0); // 훨씬 바깥

  pg.bezierVertex(
    centerX - width * 0.8,
    horizonY * 0.2, // 더 과장된 컨트롤 포인트
    centerX - width * 0.1,
    horizonY * 0.5,
    centerX + width * 0.1,
    horizonY * 0.7
  );

  pg.bezierVertex(
    centerX + width * 0.6,
    horizonY * 1.0,
    centerX + width * 0.8,
    horizonY * 0.8,
    centerX + width * 0.6,
    horizonY
  );

  pg.vertex(centerX + width * 0.6, horizonY);

  pg.bezierVertex(
    centerX + width * 0.4,
    horizonY * 0.7,
    centerX - width * 0.2,
    horizonY * 0.3,
    centerX - width * 0.4,
    0
  );
  pg.endShape(CLOSE);
}

function drawRainbowStyle2(pg, horizonY, centerX) {
  pg.beginShape();
  pg.vertex(centerX + width * 0.4, 0);
  pg.vertex(centerX + width * 0.7, 0);

  pg.bezierVertex(
    centerX + width * 0.8,
    horizonY * 0.25,
    centerX + width * 0.1,
    horizonY * 0.55,
    centerX - width * 0.1,
    horizonY * 0.75
  );

  pg.bezierVertex(
    centerX - width * 0.7,
    horizonY * 1.05,
    centerX - width * 0.9,
    horizonY * 0.85,
    centerX - width * 0.6,
    horizonY
  );

  pg.vertex(centerX - width * 0.6, horizonY);

  pg.bezierVertex(
    centerX - width * 0.4,
    horizonY * 0.7,
    centerX + width * 0.2,
    horizonY * 0.3,
    centerX + width * 0.4,
    0
  );
  pg.endShape(CLOSE);
}
function drawRainbowStyle3(pg, horizonY, centerX) {
  pg.beginShape();
  pg.vertex(centerX - width * 0.3, 0);
  pg.vertex(centerX - width * 0.65, 0);

  pg.bezierVertex(
    centerX - width * 0.75,
    horizonY * 0.2,
    centerX + width * 0.75,
    horizonY * 0.8,
    centerX + width * 0.65,
    horizonY
  );

  pg.vertex(centerX + width * 0.65, horizonY);

  pg.bezierVertex(
    centerX + width * 0.4,
    horizonY * 0.6,
    centerX - width * 0.4,
    horizonY * 0.2,
    centerX - width * 0.3,
    0
  );
  pg.endShape(CLOSE);
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

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    turnAngle = -0.05; // 왼쪽으로 회전
  } else if (keyCode === RIGHT_ARROW) {
    turnAngle = 0.05; // 오른쪽으로 회전
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
