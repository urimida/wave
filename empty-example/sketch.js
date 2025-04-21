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
let shipSpeed = 3;
let isAutoShip = true;
let stars = [];
let clouds = [];
let shallowColor, deepColor, sandColor;
let sparkles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  waveTarget = createVector(
    random(width * 0.1, width * 0.9),
    random(height / 2 + 50, height - 100)
  );
  waveOffset = random(TWO_PI);

  const times = ["morning", "day", "sunset", "night"];
  timeOfDay = random(times);
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

  if (timeOfDay === "night") {
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: random(width),
        y: random(height / 2),
        size: random(1, 3),
        alpha: random(100, 255),
        blinkSpeed: random(0.5, 2),
      });
    }
  }

  for (let i = 0; i < 50; i++) {
    sparkles.push({
      x: random(width * 0.1, width * 0.9),
      y: random(height * 0.55, height * 0.9),
      size: random(0.8, 1.5),
      alpha: random(100, 180),
      flicker: random(0.08, 0.18), // 빠른 반짝임
    });
  }
}

function draw() {
  background(255);
  drawBackground();
  drawClouds();
  drawOcean();

  drawSparkles(); // 반짝이 효과 그리기

  if (isAutoShip && shipPos.y > -200) {
    shipTrail.push({ x: shipPos.x, y: shipPos.y, life: 0 });
    shipPos.add(shipDirection);
  }

  if (isAutoShip && shipPos.y <= height / 2 - 100) {
    isAutoShip = false;
  }

  drawShipTrail();
  drawBubbles();
}

function drawSparkles() {
  noStroke();

  for (let s of sparkles) {
    let flicker = sin(frameCount * s.flicker + s.x * 0.1) * 80; // 강한 반짝임
    let alpha = constrain(s.alpha + flicker, 0, 255);

    // 빛 퍼짐 영역
    fill(255, 255, 255, alpha * 0.1);
    ellipse(s.x, s.y, s.size * 60, s.size * 25);

    // 중심 반짝임 강조
    fill(255, 255, 255, alpha * 0.4);
    ellipse(s.x, s.y, s.size * 12);

    // 약간의 노란 반사광 느낌
    fill(255, 240, 180, alpha * 0.2);
    ellipse(s.x, s.y, s.size * 30);
  }
}

function setTimeColors() {
  switch (timeOfDay) {
    case "morning":
      skyColors = [color(255, 210, 150), color(200, 240, 255)];
      oceanBaseColor = color(100, 180, 220);
      shallowColor = color(180, 230, 220);
      deepColor = color(30, 100, 160);
      sandColor = color(240, 220, 180);
      sunColor = color(255, 220, 120, 200);
      sunPos = createVector(width * 0.2, height * 0.25);
      break;

    case "day":
      skyColors = [color(180, 220, 255), color(255, 255, 255)];
      oceanBaseColor = color(80, 160, 200);
      shallowColor = color(160, 220, 210);
      deepColor = color(20, 90, 160);
      sandColor = color(240, 225, 180);
      sunColor = color(255, 255, 180, 180);
      sunPos = createVector(width * 0.5, height * 0.1);
      break;

    case "sunset":
      skyColors = [color(255, 150, 120), color(255, 220, 200)];
      oceanBaseColor = color(180, 130, 160); // 전체 베이스에 붉은기
      shallowColor = color(240, 190, 170); // 따뜻한 얕은 바다
      deepColor = color(110, 90, 110); // 붉은 남보라 계열
      sandColor = color(255, 210, 170); // 기존 유지
      sunColor = color(255, 180, 120, 180);
      sunPos = createVector(width * 0.8, height * 0.3);
      break;

    case "night":
      skyColors = [color(20, 30, 60), color(60, 80, 120)];
      oceanBaseColor = color(20, 60, 100);
      shallowColor = color(40, 90, 130);
      deepColor = color(10, 40, 80);
      sandColor = color(60, 60, 80); // 달빛에 비친 바닥 느낌
      sunColor = color(255, 255, 200, 200);
      sunPos = createVector(width * 0.8, height * 0.2);
      break;
  }
}

function drawBackground() {
  let h = height;

  for (let y = 0; y < h; y++) {
    let inter = y / h;
    let c;

    if (inter < 0.35) {
      // 상단 하늘 → 하단 하늘
      c = lerpColor(skyColors[0], skyColors[1], map(inter, 0, 0.35, 0, 1));
    } else if (inter < 0.6) {
      // 하늘 → 얕은 바다
      c = lerpColor(skyColors[1], shallowColor, map(inter, 0.35, 0.6, 0, 1));
    } else if (inter < 0.85) {
      // 얕은 바다 → 깊은 바다
      c = lerpColor(shallowColor, deepColor, map(inter, 0.6, 0.85, 0, 1));
    } else {
      // 깊은 바다 → 모래
      c = lerpColor(deepColor, sandColor, map(inter, 0.85, 1, 0, 1));
    }

    stroke(c);
    line(0, y, width, y);
  }

  // 밤하늘이면 별도 그려줘야 함
  if (timeOfDay === "night") {
    drawStars();
  }

  // 해의 후광
  noStroke();
  for (let i = 5; i >= 1; i--) {
    let glowAlpha = map(i, 5, 1, 10, 60);
    let glowSize = 100 + i * 50;
    fill(255, 255, 220, glowAlpha);
    ellipse(sunPos.x, sunPos.y, glowSize);
  }

  // 해 본체
  fill(sunColor);
  ellipse(sunPos.x, sunPos.y, 100);
}

function createClouds() {
  clouds = [];
  let cloudCount = random(8, 20);
  let tries = 0;
  while (clouds.length < cloudCount && tries < 200) {
    let x = random(width * 0.1, width * 0.9);
    let y = random(height * 0.05, height * 0.4);
    if (dist(x, y, sunPos.x, sunPos.y) < 150) {
      tries++;
      continue;
    }
    let s = random(0.6, 1); // ⬅️ 구름을 절반 크기로!

    let alpha = timeOfDay === "night" ? 40 : 90;
    let style = floor(random(3)); // 0 ~ 2
    clouds.push({ x, y, s, alpha, style });
    tries++;
  }
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

function drawOcean() {
  drawWaveParticles();
}

function drawWaveParticles() {
  noStroke();
  let spacing = 22;
  let time = frameCount * 0.03;

  let recentTrail = shipTrail.slice(-30); // 최근 흔적만 사용

  for (let y = height / 2; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      let wave = 0;

      if (recentTrail.length > 0) {
        for (let p of recentTrail) {
          let d = dist(x, y, p.x, p.y);
          wave += sin(d * 0.04 - time);
        }
        wave /= recentTrail.length;
      } else {
        // 👉 기본 잔물결 (fallback wave)
        wave = sin((x + y + frameCount * 2) * 0.02) * 0.4;
      }

      let size = map(wave, -1, 1, 16, 34);
      let col =
        palette[(floor(x / spacing) + floor(y / spacing)) % palette.length];
      let yOffset = sin((x + frameCount * 2) * 0.02) * 4;

      fill(col);
      ellipse(x, y + yOffset, size);
    }
  }
}

function drawShipTrail() {
  noStroke();

  for (let i = 0; i < shipTrail.length; i++) {
    let p = shipTrail[i];
    let t = constrain(map(p.life, 0, 300, 0, 1), 0, 1);
    let oceanTop = height / 2;
    let fadeFactor = constrain(map(p.y, oceanTop + 50, oceanTop, 1, 0), 0, 1);
    let alpha = lerp(100, 0, t) * fadeFactor;

    // life 초기에는 넓고, 점점 좁게
    let w = lerp(30, 1000, t);
    let h = lerp(10, 30, t);
    fill(255, 255, 255, alpha * 0.8);
    ellipse(p.x, p.y, w, h);
      //  아주 초기의 뱃자국
      for (let i = 0; i < 50; i++) {
        let angle = random(TWO_PI);
        let dist = random(20, 60);
        let bx = p.x + cos(angle) * dist;
        let by = p.y + sin(angle) * dist;
        let r = random(6, 20);
        let bAlpha = map(p.life, 0, 30, 80, 0); // 빠르게 사라짐
        fill(255, 255, 255, bAlpha);
        ellipse(bx, by, r);
      }


    // 🌫️ 퍼지는 외곽 타원
    for (let j = 0; j < 6; j++) {
      let offX = random(-w * 0.6, w * 0.6);
      let offY = random(-h * 0.5, h * 0.5);
      let r = random(30, 200);
      fill(255, 255, 255, alpha * random(0.02, 0.04));
      ellipse(p.x + offX, p.y + offY, r);
    }

    // 🫧 버블 (그대로 유지)
    for (let b = 0; b < 30; b++) {
      let side = random() < 0.5 ? -1 : 1;
      let radius = random(30, w * 0.5); // 버블도 좁아짐에 따라 위치 줄임
      let angle = random(-PI / 6, PI / 6);
      let bx = p.x + side * radius * cos(angle);
      let by = p.y + radius * sin(angle) * 0.4;
      let r = random(6, 12);
      fill(255, 255, 255, alpha * random(0.3, 0.6));
      ellipse(bx, by, r);
    }
  }

  // 오래된 흔적 제거
  for (let i = shipTrail.length - 1; i >= 0; i--) {
    shipTrail[i].life++;
    if (shipTrail[i].life > 300 || shipTrail[i].y <= height / 2 - 20) {
      shipTrail.splice(i, 1);
    }
  }
}

function drawBubbles() {
  noStroke();
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];

    // 유기적 위치 움직임
    b.y += sin(frameCount * 0.05 + b.x * 0.01) * 0.2;
    b.x += cos(frameCount * 0.03 + b.y * 0.01) * 0.1;

    // 살짝 왜곡된 타원
    let angleOffset = sin(frameCount * 0.02 + b.x * 0.01) * PI;
    let w = b.r * random(1.5, 2.5);
    let h = b.r * random(0.6, 1.2);

    push();
    translate(b.x, b.y);
    rotate(angleOffset);

    // 반투명 쉘 느낌
    fill(255, 255, 255, b.alpha * 0.2);
    ellipse(0, 0, w, h);
    pop();

    // ✨ 시간대별 반사색 선택
    let shimmerColor;
    switch (timeOfDay) {
      case "sunset":
        shimmerColor = color(255, 200, 180, b.alpha * 0.25); // 따뜻한 반사
        break;
      case "morning":
        shimmerColor = color(255, 240, 200, b.alpha * 0.25); // 황금빛
        break;
      case "night":
        shimmerColor = color(180, 220, 255, b.alpha * 0.2); // 달빛 반사
        break;
      default:
        shimmerColor = color(255, 255, 255, b.alpha * 0.2); // 기본 흰빛
        break;
    }

    // 반사 타원
    fill(shimmerColor);
    ellipse(b.x + random(-1, 1), b.y + random(-1, 1), b.r * random(1.5, 3));

    // 퍼지는 빛 번짐 추가
    fill(shimmerColor.levels[0], shimmerColor.levels[1], shimmerColor.levels[2], b.alpha * 0.05);
    ellipse(b.x, b.y, b.r * random(4, 7));

    // 크기/투명도 업데이트
    b.r += 0.3;
    b.alpha -= 2;

    if (b.alpha <= 0) bubbles.splice(i, 1);
  }
}

function mouseMoved() {
  if (mouseY > height / 2) {
    shipTrail.push({ x: mouseX, y: mouseY, life: 0 });
  }
}

function createShipTrail() {
  shipPos = createVector(random(width * 0.3, width * 0.7), height + 50);
  let angle = random(-PI / 3, (-2 * PI) / 3);
  shipDirection = p5.Vector.fromAngle(angle).normalize().mult(shipSpeed);
}

function drawStars() {
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    let flicker = sin(frameCount * 0.05 * star.blinkSpeed) * 50;
    fill(255, 255, 255, star.alpha + flicker);
    noStroke();
    ellipse(star.x, star.y, star.size);
  }
}
function drawCloudStyle1(x, y, scaleVal = 1, alpha = 255) {
  push();
  translate(x, y);
  scale(scaleVal);
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
