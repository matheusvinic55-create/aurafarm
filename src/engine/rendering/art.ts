import Phaser from 'phaser';

// Original procedural placeholder art. No external assets or copied artwork.
// Replace these renderers with atlas sprites without changing game state.
type G = Phaser.GameObjects.Graphics;
const ellipse = (g: G, color: number, x: number, y: number, w: number, h: number, alpha = 1) => g.fillStyle(color, alpha).fillEllipse(x, y, w, h);
const poly = (g: G, color: number, points: number[]) => g.fillStyle(color).fillPoints(points.reduce<Phaser.Geom.Point[]>((all, _, i) => i % 2 ? all : [...all, new Phaser.Geom.Point(points[i], points[i + 1])], []), true);

export function drawTerrain(scene: Phaser.Scene) {
  const g = scene.add.graphics().setDepth(-1000);
  ellipse(g, 0x6c886e, 453, 827, 802, 756, 0.09);
  ellipse(g, 0x78927a, 450, 801, 756, 733, 0.09);
  ellipse(g, 0xb1b892, 450, 773, 734, 722);
  ellipse(g, 0xc1cc9d, 450, 753, 734, 722);
  ellipse(g, 0xd1d9ab, 436, 719, 688, 649);
  ellipse(g, 0xdce2b7, 390, 712, 543, 513, 0.63);
  // Soft meadow patches, deterministic between visits.
  for (let i = 0; i < 70; i++) {
    const a = i * 2.39996; const r = 65 + ((i * 43) % 250);
    const x = 450 + Math.cos(a) * r; const y = 740 + Math.sin(a) * r * 0.94;
    ellipse(g, i % 3 ? 0x98b27e : 0xebe7be, x, y, 34 + i % 43, 13 + i % 27, 0.12);
  }
  // Path to a little cabin, plus stepping stones.
  const path = new Phaser.Curves.Spline([312, 575, 362, 659, 464, 761, 470, 902, 512, 1050]).getPoints(50);
  g.lineStyle(59, 0xc7bd96, 0.3).strokePoints(path);
  g.lineStyle(46, 0xe9dfb7, 0.92).strokePoints(path);
  for (let i = 0; i < 7; i++) ellipse(g, i % 2 ? 0xd0c9a6 : 0xd9d1b0, 455 + Math.sin(i) * 13, 789 + i * 38, 23, 10, 0.75);
  // A small pool along the eastern edge.
  ellipse(g, 0xa9b48e, 677, 876, 206, 310);
  ellipse(g, 0xe2d7b0, 677, 867, 191, 295);
  ellipse(g, 0x83b5b1, 678, 864, 167, 267);
  ellipse(g, 0x9ac9bf, 668, 843, 142, 224);
  g.lineStyle(3, 0xd7e7d0, 0.75);
  g.beginPath(); g.moveTo(633, 807); g.lineTo(682, 807); g.strokePath();
  g.beginPath(); g.moveTo(676, 903); g.lineTo(714, 903); g.strokePath();
  ellipse(g, 0x6d9773, 643, 949, 28, 13); ellipse(g, 0xf6e9c6, 646, 946, 8, 7);
  [[589,929], [750,791], [712,1004], [741,741]].forEach(([x,y]) => {
    ellipse(g, 0x8fa98a, x, y, 27, 11);
    g.lineStyle(3, 0x718c6b).lineBetween(x, y, x - 4, y - 28).lineBetween(x + 7, y, x + 12, y - 39);
  });
  // A tiny, inactive garden is scenery only in this first stage.
  g.fillStyle(0xb3a583).fillRoundedRect(238, 611, 93, 69, 12);
  g.lineStyle(2, 0x9d8c6d, 0.6);
  for (let row = 0; row < 3; row++) {
    g.lineBetween(248, 625 + row * 18, 321, 625 + row * 18);
    for (let col = 0; col < 3; col++) {
      const x = 259 + col * 25, y = 622 + row * 18;
      ellipse(g, 0x708e59, x - 2, y, 10, 5); ellipse(g, 0x91aa69, x + 3, y - 3, 9, 5);
    }
  }
  // Small light-colored flowers scattered around the clearing.
  for (let i = 0; i < 36; i++) {
    const a = i * 2.4, r = 245 + i % 25;
    const x = 446 + Math.cos(a) * r, y = 752 + Math.sin(a) * r * 1.05;
    if (x > 570 && y > 730) continue;
    ellipse(g, 0x8ca36b, x, y + 3, 9, 5);
    ellipse(g, i % 3 ? 0xf6f0d4 : 0xdfb598, x, y - 1, 5, 5);
  }
}

export function drawTree(scene: Phaser.Scene, x: number, y: number, scale = 1, kind = 0) {
  const g = scene.add.graphics().setPosition(x, y).setScale(scale).setDepth(y);
  ellipse(g, 0x657b54, 9, 4, 105, 32, 0.16);
  g.fillStyle(0x897854).fillRoundedRect(-8, -88, 16, 89, 5);
  g.lineStyle(7, 0x897854).lineBetween(0, -52, -24, -74).lineBetween(3, -74, 28, -99);
  if (kind === 1) {
    poly(g, 0x507b64, [-57,-40, 0,-133, 58,-40]);
    poly(g, 0x608a6a, [-47,-71, 0,-155, 47,-71]);
    poly(g, 0x749775, [-33,-105, 0,-169, 33,-105]);
  } else {
    ellipse(g, 0x718b60, 2, -93, 118, 101);
    ellipse(g, 0x87a06e, -24, -118, 91, 85);
    ellipse(g, 0x93ac77, 20, -126, 83, 94);
    ellipse(g, 0xa4b981, -9, -149, 78, 66);
    ellipse(g, 0xb3c28b, -23, -153, 39, 29, 0.65);
    ellipse(g, 0xb9ca94, 31, -125, 23, 17, 0.55);
  }
  return g;
}

export function drawCabin(scene: Phaser.Scene) {
  const g = scene.add.graphics().setPosition(320, 536).setDepth(536);
  ellipse(g, 0x687752, 12, 21, 196, 47, 0.15);
  poly(g, 0xc2ad83, [8,-82, 79,-101, 79,7, 8,30]);
  poly(g, 0xf0dfb6, [-75,-101, 8,-81, 8,30, -75,8]);
  poly(g, 0xf0dfb6, [-75,-101, -35,-151, 8,-81]);
  poly(g, 0xb67d60, [-35,-155, 47,-178, 94,-109, 8,-81]);
  poly(g, 0xcc9675, [-88,-99, -36,-169, -35,-155, 8,-81, 0,-77, -36,-140, -77,-88]);
  g.lineStyle(2, 0xd6a88a, 0.5);
  for (let i = 0; i < 4; i++) g.lineBetween(-19 + i * 15, -150 + i * 20, 56 + i * 12, -167 + i * 19);
  poly(g, 0x7e8e75, [-53,-51, -22,-43, -22,20, -53,12]);
  g.fillStyle(0xe2ce97).fillCircle(-30, -11, 3);
  poly(g, 0x799b8e, [32,-50, 58,-57, 58,-21, 32,-14]);
  g.lineStyle(4, 0xe1d2a7).lineBetween(45, -53, 45, -17).lineBetween(33, -32, 58, -39);
  poly(g, 0xb8aa89, [-64,13, -17,23, -14,32, -67,22]);
  g.fillStyle(0x968e73).fillRect(53, -179, 15, 27);
  g.fillStyle(0xbab394).fillRect(49, -185, 23, 9);
  ellipse(g, 0x849c67, -78, 11, 34, 27); ellipse(g, 0xe5b68e, -83, 1, 7, 7);
}

export function drawResource(scene: Phaser.Scene, kind: 'wood' | 'flowers' | 'berries') {
  const g = scene.add.graphics();
  ellipse(g, 0x63794f, 0, 6, 85, 24, 0.17);
  if (kind === 'wood') {
    g.lineStyle(14, 0x887153).lineBetween(-32, -7, 30, -33).lineBetween(-19, -28, 27, 0);
    g.lineStyle(7, 0xb29368).lineBetween(-31, -11, 27, -34).lineBetween(-20, -32, 24, -3);
    g.lineStyle(5, 0x887153).lineBetween(8, -23, 6, -44).lineBetween(-9, -15, -30, -38);
    ellipse(g, 0xe0c499, -31, -9, 11, 13);
    ellipse(g, 0xbac78e, -38, -29, 20, 10);
  } else if (kind === 'berries') {
    ellipse(g, 0x6e885b, 0, -27, 93, 64);
    ellipse(g, 0x859e68, -22, -43, 60, 48);
    ellipse(g, 0x9cb07a, 18, -49, 61, 47);
    [[-23,-44],[5,-24],[29,-51],[-5,-60],[33,-19]].forEach(([x,y]) => {
      ellipse(g, 0x866576, x, y, 11, 12); ellipse(g, 0xc294a0, x - 2, y - 3, 4, 4);
    });
  } else {
    for (let i = 0; i < 7; i++) {
      const x = (i % 4) * 19 - 30, y = Math.floor(i / 4) * -17 - 9;
      g.lineStyle(3, 0x7f9662).lineBetween(x, y, x + 3, y - 21);
      ellipse(g, 0x9db07d, x + 8, y - 9, 13, 7);
      ellipse(g, i % 2 ? 0xf6edcf : 0xe1baa0, x + 3, y - 26, 17, 15);
      ellipse(g, 0xccb46e, x + 3, y - 26, 5, 5);
    }
  }
  return g;
}

export function drawPlayer(scene: Phaser.Scene) {
  const body = scene.add.graphics();
  body.fillStyle(0x675f52).fillRoundedRect(-13, -13, 10, 17, 4).fillRoundedRect(4, -13, 10, 17, 4);
  body.fillStyle(0x778e7b).fillRoundedRect(-17, -47, 34, 38, 9);
  body.fillStyle(0xc49a76).fillRoundedRect(-23, -39, 8, 28, 4).fillRoundedRect(16, -39, 8, 28, 4);
  body.fillStyle(0xd8bc94).fillCircle(0, -62, 16);
  body.fillStyle(0x64564a).fillEllipse(0, -71, 34, 19);
  body.fillStyle(0xb49360).fillEllipse(0, -76, 58, 18);
  body.fillStyle(0xdfc48e).fillRoundedRect(-19, -96, 38, 23, 9);
  body.fillStyle(0x977e5b).fillRoundedRect(-19, -80, 38, 6, 2);
  body.fillStyle(0xead6aa).fillEllipse(-5, -93, 22, 5);
  body.lineStyle(3, 0xcbb687).lineBetween(9, -44, -7, -20);
  body.fillStyle(0xb49a6c).fillRoundedRect(-15, -27, 16, 16, 4);
  return scene.add.container(0, 0, [body]);
}
