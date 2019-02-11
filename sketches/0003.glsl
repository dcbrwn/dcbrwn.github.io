precision highp float;

uniform float u_time;

float p_random (vec2 p) {
  return (1.0 + cos(p.x * p.y + u_time * 10.0 + p.x * p.x)) / 2.0;
}

vec4 gradient (float t) {
  vec3 top = vec3(0.898, 0.902, 0.8902);
  vec3 mid = vec3(0.4431, 0.8471, 0.4275);
  vec3 bottom = vec3(0.1137, 0.0196, 0.0078);
  return vec4(mix(bottom, mix(mid, top, t - 0.3), t + 0.3), 1.0);
}

void main () {
  gl_FragColor = gradient(p_random(gl_FragCoord.xy / 2.0));
}
