// Hackathon-style 15min ping-pong :P
!function() {
  'use strict';

  const scheduleFrame = window.requestAnimationFrame || function(fn) {
    setTimeout(fn, 10);
  };
  const canvas = document.getElementById('pingpong');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  // Universal size for ball and pads.
  const size = 20;

  let leftPad = 0;
  let rightPad = 0;
  let ballX = width >> 1;
  let ballY = height >> 1;
  // Ball velocity
  let ballXV = Math.random() > 0.5 ? 1 : -1;
  let ballYV = Math.random() > 0.5 ? 1 : -1;

  render();

  function tick() {
    ballX += ballXV * 2;
    ballY += ballYV * 2;
    // PHYSICS!
    if (ballY <= 0) ballYV = 1;
    else if (ballY >= height - size) ballYV = -1;
    if (ballX <= size) ballXV = 1;
    else if (ballX >= width - size * 2) ballXV = -1;
    if (ballXV < 0) {
      leftPad = clamp(leftPad + (1 - (ballX / width)) * (ballY - leftPad - size), 0, height - size * 3);
    } else {
      rightPad = clamp(rightPad + (ballX / width) * (ballY - rightPad - size), 0, height - size * 3);
    }
  }

  function render() {
    tick();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = size / 2;
    ctx.setLineDash([size, size]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = 'black';
    ctx.fillRect(ballX, ballY, size, size);
    ctx.fillRect(0, leftPad, size, size * 3);
    ctx.fillRect(width - size, rightPad, size, size * 3);
    scheduleFrame(render);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
}();
