const canvas = document.getElementById('canvas');
const content = document.getElementById('content');
const scrollContainer = document.getElementById('scroll-container')
const glsl = new GlslCanvas(canvas);
let sketchCounter = 0;

function loadNextSketch () {
  const sketch = sketches[sketchCounter++ % sketches.length];
  loadSketch(sketch);
}

async function loadSketch (sketch) {
  try {
    document.title = sketch.title;

    const response = await fetch(sketch.frag);
    const frag = await response.text();
    glsl.load(frag);
    glsl.play();
    requestAnimationFrame(() => glsl.pause());

    content.innerHTML = sketch.note;
  } catch (error) {
    // So useful. Much sense. Wow
    console.warn('Failed to load sketch', error);
  }
}

function main () {
  glsl.on('error', (event) => {
    console.warn('GLSL-canvas error:', event);
  });
  
  scrollContainer.addEventListener('click', (event) => {
    if (event.target === scrollContainer) {
      glsl.toggle();
    }
  });

  loadSketch(sketches[sketches.length - 1]);
}

main();
