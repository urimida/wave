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
let cloudDirection = random() < 0.5 ? "left" : "right"; // 방향 고정

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  shipSpeed = random(1, 3);
  let sizeMode = random(["medium", "large"]);
  waveParticleScale = sizeMode === "large" ? 2.3 : 1.8;

  const times = [
    "morning",
    "day",
    "sunset",
    "night",
    "twilight",
    "golden",
    "turquoise",
    "mediterranean",
    "stormy",
    "blush",
  ];
  timeOfDay = random(times);

  if (["turquoise", "mediterranean", "golden"].includes(timeOfDay)) {
    horizonRatio = 0.45;
  } else if (["sunset", "twilight", "blush"].includes(timeOfDay)) {
    horizonRatio = 0.55;
  } else {
    horizonRatio = 0.5;
  }

  setTimeColors();

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
}

function draw() {
  background(255);
  drawBackground();

  if (
    !["night", "twilight", "stormy"].includes(timeOfDay) &&
    clouds.length === 0
  ) {
    drawRainbow();
  }
  if (["night", "twilight", "stormy"].includes(timeOfDay)) {
    drawStars();
    drawMoon();
  } else {
    drawSun();
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
    if (mouseY > horizonY) {
      shipTrail.push({ x: mouseX, y: mouseY, life: 0 });
    }
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
      sky: [
        color(255, 240, 230),
        color(255, 255, 220),
        color(220, 250, 255),
      ],
      ocean: color(140, 200, 230),
      shallow: color(200, 240, 230),
      deep: color(40, 120, 180),
      sand: color(250, 240, 200),
      sun: color(255, 240, 180, 220),
      sunPos: createVector(width * 0.2, height * 0.25),
    },
    {
      name: "day",
      sky: [
        color(200, 240, 255),
        color(170, 220, 255),
        color(120, 200, 255),
      ],
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
        color(255, 150, 130),
        color(255, 200, 160),
        color(255, 240, 200),
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
      sky: [
        color(30, 20, 60),
        color(60, 30, 90),
        color(100, 90, 80),
      ],
      ocean: color(30, 70, 110),
      shallow: color(50, 90, 130),
      deep: color(20, 40, 80),
      sand: color(70, 60, 80),
      sun: color(255, 255, 200, 200),
      sunPos: createVector(width * 0.8, height * 0.2),
    },
    {
      name: "twilight",
      sky: [
        color(90, 40, 120),
        color(180, 100, 160),
        color(255, 210, 170),
      ],
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
        color(250, 220, 140),
        color(255, 240, 180),
        color(255, 250, 210),
        color(240, 245, 250),
      ],
      ocean: color(210, 190, 140),
      shallow: color(250, 220, 170),
      deep: color(190, 140, 110),
      sand: color(255, 245, 190),
      sun: color(255, 210, 120, 200),
      sunPos: createVector(width * 0.3, height * 0.2),
    },
    {
      name: "turquoise",
      sky: [
        color(255, 245, 200),
        color(210, 250, 255),
        color(100, 200, 255),
      ],
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
        color(240, 250, 255),
        color(255, 255, 245),
        color(255, 250, 230),
      ],
      ocean: color(100, 180, 210),
      shallow: color(160, 220, 230),
      deep: color(60, 130, 170),
      sand: color(250, 240, 200),
      sun: color(255, 255, 190, 220),
      sunPos: createVector(width * 0.6, height * 0.15),
    },
    {
      name: "stormy",
      sky: [
        color(30, 30, 40),
        color(70, 70, 80),
        color(120, 110, 100),
      ],
      ocean: color(30, 60, 90),
      shallow: color(50, 80, 110),
      deep: color(10, 30, 60),
      sand: color(100, 100, 110),
      sun: color(200, 200, 220, 220),
      sunPos: createVector(width * 0.7, height * 0.25),
    },
    {
      name: "blush",
      sky: [
        color(255, 180, 200),
        color(255, 220, 190),
        color(255, 250, 220),
        color(255, 255, 250),
      ],
      ocean: color(230, 170, 190),
      shallow: color(250, 210, 220),
      deep: color(190, 110, 140),
      sand: color(255, 240, 230),
      sun: color(255, 180, 200, 220),
      sunPos: createVector(width * 0.5, height * 0.2),
    },
  ];

  let selected = random(themes);
  timeOfDay = selected.name;

  skyColors = selected.sky;
  oceanBaseColor = selected.ocean;
  shallowColor = selected.shallow;
  deepColor = selected.deep;
  sandColor = selected.sand;
  sunColor = selected.sun;
  sunPos = selected.sunPos;

  if (timeOfDay === "day") {
    let horizonY = height * horizonRatio;
    let minSunY = horizonY * 0.35;
    sunPos.y = max(sunPos.y, minSunY);
  }
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
  let maxCloudY = horizonY * 0.75;
  let minCloudY = height * 0.05;

  while (clouds.length < cloudCount && tries < 200) {
    let x = random(width * 0.1, width * 0.9);
    let y = random(minCloudY, maxCloudY);

    if (dist(x, y, sunPos.x, sunPos.y) < 150) {
      tries++;
      continue;
    }

    let s = random(1.5, 2.5); // 구름 크기
    let alpha = ["twilight", "night", "stormy"].includes(timeOfDay) ? 30 : 60;
    let style = floor(random(3));

    let vx = random(0.3, 0.6) * (random() < 0.5 ? 1 : -1); // 속도 2~3배로 조정

    clouds.push({ x, y, s, alpha, style, vx });
    tries++;
  }
}

function updateClouds() {
  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];
    c.x += c.vx;

    // 화면을 벗어나면 반대쪽에서 재등장
    if (c.x < -400) {
      c.x = width + 400;
    } else if (c.x > width + 400) {
      c.x = -400;
    }
  }
}

function updateClouds() {
  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];
    c.x += c.vx;

    // 화면을 벗어나면 반대쪽에서 재등장
    if (c.x < -300) {
      c.x = width + 300;
    } else if (c.x > width + 300) {
      c.x = -300;
    }
  }
}

function addCloud(xPos) {
  let horizonY = height * horizonRatio;
  let y = random(height * 0.05, horizonY * 0.75);
  let s = random(1.0, 2.5);
  let alpha = ["twilight", "night", "stormy"].includes(timeOfDay) ? 30 : 60;
  let style = floor(random(3));

  let baseSpeed = 0.25;
  let speedMultiplier = random(1.0, 1.8); // ← 약간 더 빠르게
  let vx;
  if (shipDirection) {
    // 방향에 너무 휘둘리지 않도록 중간치와 랜덤 혼합
    let baseDir = shipDirection.x * baseSpeed * speedMultiplier;
    vx = baseDir + random(-0.2, 0.2); // 약간의 랜덤 편차 추가
  } else {
    vx = random(0, 1); // 랜덤 속도
  }
  
  let maxLife = random(2500, 5000); // 생명도 살짝 늘려줌

  clouds.push({
    x: xPos,
    y,
    s,
    alpha,
    style,
    vx,
    life: 0,
    maxLife,
  });
}


function drawClouds() {
  for (let c of clouds) {
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
  scale(2); //전체 크기 2배로 확대

  noStroke();

  // 광륜 효과
  for (let i = 10; i >= 1; i--) {
    let alpha = map(i, 10, 1, 10, 100);
    let radius = 80 + i * 15;
    fill(255, 255, 200, alpha);
    ellipse(0, 0, radius); // 중심에서 그리도록 수정
  }

  // 중심 태양
  fill(255, 240, 150, 255);
  ellipse(0, 0, 100);

  pop(); // 🎯 스케일링 끝
}

function drawMoon() {
  push();
  translate(moonPos.x, moonPos.y);
  scale(0.28); // 달 크기
  scale(2.5); 
  noStroke();

  // 강한 블러의 월광 효과
  drawingContext.save();
  drawingContext.filter = "blur(60px)"; // 블러를 훨씬 더 강하게
  fill(200, 220, 255, 160); // 몽환적인 달빛 컬러

  beginShape();
  if (moonShapeIndex === 0) {
    vertex(198, 0);
    vertex(198, 395);
    bezierVertex(198, 395, 197.667, 395, 197.5, 395);
    bezierVertex(88.4238, 395, 0, 306.576, 0, 197.5);
    bezierVertex(0, 88.4238, 88.4238, 0, 197.5, 0);
    bezierVertex(197.667, 0, 198, 0, 198, 0);
  } else if (moonShapeIndex === 1) {
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
    ellipse(0, 0, 500, 500);
    endShape();
    drawingContext.restore();
    fill(245, 245, 255, 240);
    ellipse(0, 0, 500, 500);
    pop();
    return;
  }
  endShape(CLOSE);
  drawingContext.restore();

  // 달 본체
  fill(245, 245, 255, 240);
  beginShape();
  if (moonShapeIndex === 0) {
    vertex(198, 0);
    vertex(198, 395);
    bezierVertex(198, 395, 197.667, 395, 197.5, 395);
    bezierVertex(88.4238, 395, 0, 306.576, 0, 197.5);
    bezierVertex(0, 88.4238, 88.4238, 0, 197.5, 0);
    bezierVertex(197.667, 0, 198, 0, 198, 0);
  } else if (moonShapeIndex === 1) {
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

  for (let i = shipTrail.length - 1; i >= 0; i--) {
    shipTrail[i].life++;
    if (
      shipTrail[i].life > 300 ||
      shipTrail[i].y <= height * horizonRatio - 20
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

function mouseMoved() {
  let horizonY = height * horizonRatio;
  if (mouseY > horizonY) {
    shipTrail.push({ x: mouseX, y: mouseY, life: 0 });
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

let rainbowBuffer = null;

function drawRainbow() {
  if (clouds.length > 0 || ["night", "twilight", "stormy", "sunset"].includes(timeOfDay)) return;

  let horizonY = height * horizonRatio;

  if (!rainbowBuffer) {
    rainbowBuffer = createGraphics(width, height);
    rainbowBuffer.noStroke();

    let gradient = rainbowBuffer.drawingContext.createLinearGradient(width / 2, height * 0.1, width / 2, height * 0.6);
    gradient.addColorStop(0.0, "rgba(255, 0, 0, 0.5)");
    gradient.addColorStop(0.2644, "rgba(255, 178, 0, 0.5)");
    gradient.addColorStop(0.4423, "rgba(255, 246, 0, 0.5)");
    gradient.addColorStop(0.5865, "rgba(0, 255, 128, 0.5)");
    gradient.addColorStop(0.7404, "rgba(45, 174, 255, 0.5)");
    gradient.addColorStop(0.8942, "rgba(10, 0, 190, 0.5)");
    gradient.addColorStop(1.0, "rgba(179, 0, 196, 0.5)");
    rainbowBuffer.drawingContext.fillStyle = gradient;

    rainbowBuffer.drawingContext.save();
    rainbowBuffer.drawingContext.filter = "blur(80px)";

    let topOffset = height * 0.2; // 무지개 상단 높이 설정
    let bottomY = horizonY;       // 무지개 하단을 수평선에 맞춤

    rainbowBuffer.beginShape();
    rainbowBuffer.vertex(width * 0.15, topOffset);
    rainbowBuffer.bezierVertex(
      width * 0.05, topOffset + (bottomY - topOffset) * 0.2,
      width * 0.5, bottomY - (bottomY - topOffset) * 0.2,
      width * 0.85, bottomY
    );
    rainbowBuffer.vertex(width * 0.85, bottomY);
    rainbowBuffer.bezierVertex(
      width * 0.85, bottomY - (bottomY - topOffset) * 0.5,
      width * 0.45, topOffset * 0.8,
      width * 0.15, topOffset
    );
    rainbowBuffer.endShape(CLOSE);

    rainbowBuffer.drawingContext.restore();
  }

  push();
  tint(255, 90); // 무지개 투명도
  image(rainbowBuffer, 0, 0);
  noTint();
  pop();
}
