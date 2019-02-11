import { render, html } from 'https://unpkg.com/lighterhtml@0.9.0?module';

!function main () {
  let canvas;
  let glsl;
  let selectedSketch = sketches[sketches.length - 1];
  let context = {
    title: 'Sketchpad',
    content: { html: '' },
  };

  async function loadSketch (sketch) {
    try {
      document.title = sketch.title;

      if (!sketch._frag) {
        const response = await fetch(sketch.frag);
        const frag = await response.text();
        sketch._frag = frag;
      }

      glsl.load(sketch._frag);
      glsl.play();
      requestAnimationFrame(() => glsl.pause());

      context.title = sketch.title;
      context.createdAt = sketch.createdAt;
      context.content.html = sketch.note;
      updateDom();
    } catch (error) {
      // So useful. Much sense. Wow
      console.warn('Failed to load sketch', error);
    }
  }

  function handleScrollContainerClick (event) {
    if (event.target === event.currentTarget) {
      glsl.toggle();
    }
  }

  function handleSketchChange (event) {
    selectedSketch = sketches.find((sketch) => sketch.createdAt === event.target.value);
    loadSketch(selectedSketch);
  }

  function updateDom () {
    render(document.body, () => html`
      <style>
        html, body {
          padding: 0;
          margin: 0;
          font-family: 'Times New Roman', Times, serif;
          font-size: 14px;
          overflow: hidden;
        }

        #canvas {
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          image-rendering: -moz-crisp-edges;
          image-rendering: pixelated;
          -ms-interpolation-mode: nearest-neighbor;
        }

        #scroll-container {
          cursor: pointer;
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          box-sizing: border-box;
          height: 100vh;
          width: calc(100vw + 100px);
          overflow: auto;
          padding: calc(100vh - 54px) 0 0 0;
        }

        #content {
          cursor: auto;
          padding: 18px;
          box-sizing: border-box;
          width: 100vw;
          max-width: 560px;
          margin: 0 auto;
          background-color: white;
        }

        #sketch-selector {
          cursor: pointer;
          margin-left: -4px;
          width: 100%;
          border: 0;
          padding: 0;
          font-family: 'Times New Roman', Times, serif;
          font-size: 18px;
          font-weight: bold;
          background: transparent;
          outline: none;
        }

        #sketch-selector option {
          font-size: 14px;
        }

        #date {
          clear: both;
          float: right;
        }

        .resource-link {
          color: dimgray;
        }
      </style>

      <canvas id="canvas"></canvas>

      <div id="scroll-container" onclick=${handleScrollContainerClick}>
        <section id="content">
          <article>
            <select id="sketch-selector" onchange=${handleSketchChange}>
              ${sketches.map((sketch) => html`
                <option
                  selected=${selectedSketch.createdAt === sketch.createdAt}
                  value=${sketch.createdAt}>${new Date(sketch.createdAt).toLocaleDateString()}: ${sketch.title}</option>
              `)}
            </select>
            ${context.content}

            <i><a class="resource-link" target="_blank" href=${selectedSketch.frag}>fragment shader</a></i>
          </article>
        </section>
      </div>
    `);
  }

  function init () {
    updateDom();

    canvas = document.getElementById('canvas');
    glsl = new GlslCanvas(canvas);
    glsl.on('error', (event) => {
      console.warn('GLSL-canvas error:', event);
    });

    loadSketch(selectedSketch);
  }

  init();
}();
