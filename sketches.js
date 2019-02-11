window.sketches = [
  {
    createdAt: '2019-02-09',
    frag: '/sketches/0001.glsl',
    title: 'Ray-marching scene',
    note: `
      <p>
        Ray-marching is an interesting rendering technique, I found out a few years ago in articles of
        <a target="_blank" href="http://iquilezles.org/www/articles/raymarchingdf/raymarchingdf.htm">Inigo Quilez</a>.
        With modern hardware, it allows amateurs like me, to experience a joy of creating phororealistic real-time procedural art,
        only requiring some basic linear algebra knowledge.
      </p>
      <p>
        Lighting artifacts in this scene are consequences of using naive shading. I need to figure out why this happends and fix it in
        future sketches.
      </p>
    `,
  },
  {
    createdAt: '2019-02-10',
    frag: '/sketches/0002.glsl',
    title: 'Cellular noise',
    note: `
      <p>
        A nice, organic noise function. Fun to play with. Just by picking different colors one can get interesting results.
      </p>
    `,
  },
  {
    createdAt: '2019-02-11',
    frag: 'sketches/0003.glsl',
    title: 'Trippy wallpaper',
    note: `
      <p>
        <code>(1.0 + cos(p.x * p.y + u_time * 10.0 + p.x * p.x)) / 2.0;</code>
      </p>
    `,
  }
];
