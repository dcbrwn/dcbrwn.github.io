!function() {
  'use strict';

  const canvas = document.getElementById('canvas');
  canvas.width = 54 * 2;
  canvas.height = 27 * 2;
  const ctx = canvas.getContext('2d');
  const width = canvas.width | 0;
  const height = canvas.height | 0;

  scheduleFrame(render);

  function scheduleFrame(fn) {
    setTimeout(fn, 50);
  }

  function iterate(source, target) {
    function get(x, y) {
      const rx = x % width >> 0;
      const ry = y % height >> 0;
      const index = (width * ry + rx) << 2;
      return source[index] === 0 ? 1 : 0;
    }

    function put(x, y, v) {
      const index = ((width * y >> 0) + (x >> 0)) << 2;
      const color = v > 0 ? 0 : 255;
      target[index] = color;
      target[index + 1] = color;
      target[index + 2] = color;
      target[index + 3] = 255;
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const neighbours =
          get(x - 1, y - 1) + get(x - 1, y) + get(x - 1, y + 1) +
          get(x, y - 1) + get(x, y + 1) +
          get(x + 1, y - 1) + get(x + 1, y) + get(x + 1, y + 1);
        let cell = get(x, y);
        if (cell && neighbours > 3) cell = 0;
        else if (cell && neighbours < 2) cell = 0;
        else if (!cell && neighbours === 3) cell = 1;
        put(x, y, cell);
      }
    }

    for (let x = 0; x < width; x += 1) {
      put(x, 0, Math.random() > 0.5 ? 1 : 0);
    }
  }

  const buffers = [
    ctx.getImageData(0, 0, width, height),
    ctx.getImageData(0, 0, width, height),
  ];
  let currentBuffer = 0;

  function render() {
    const source = buffers[currentBuffer];
    const target = buffers[1 - currentBuffer];
    iterate(source.data, target.data);
    ctx.putImageData(target, 0, 0);
    scheduleFrame(render);
    currentBuffer = currentBuffer === 1 ? 0 : 1;
  }
}();
