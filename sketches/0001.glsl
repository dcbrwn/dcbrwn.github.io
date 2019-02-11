// http://iquilezles.org/www/articles/distfunctions/distfunctions.htm

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI_TWO			1.570796326794897
#define PI				3.141592653589793
#define TWO_PI			6.283185307179586

vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    // correct aspect ratio
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    // centering
    p -= 0.5;
    p *= vec2(-1.0, 1.0);
    return p;
}
#define rx 1.0 / min(u_resolution.x, u_resolution.y)
#define uv gl_FragCoord.xy / u_resolution.xy
#define st coord(gl_FragCoord.xy)
#define mx coord(u_mouse)

mat3 rotateY(float theta) {
  float c = cos(theta);
  float s = sin(theta);
  return mat3(
    vec3(c, 0, s),
    vec3(0, 1, 0),
    vec3(-s, 0, c)
  );
}

float sdf_sphere(vec3 p, vec3 c, float r) {
  return distance(p, c) - r;
}

float sdf_plane(vec3 p, vec3 n) {
  return dot(p, n);
}

float sdf_capsule(vec3 p, float h, float r) {
    p.y -= clamp( p.y, 0.0, h );
    return length( p ) - r;
}

vec3 d_repeat(vec3 p) {
  return vec3(mod(p.x, 2.0) - 1.0, p.y, mod(p.z, 2.0) - 1.0);
}

float scene(vec3 p) {
  float d = p.y;
  d = min(d, sdf_capsule(p + vec3(2.0, 0.0, 2.0), 3.0, 0.2));
  d = min(d, sdf_capsule(p + vec3(-2.0, 0.0, 2.0), 3.0, 0.2));
  d = min(d, sdf_capsule(p + vec3(-2.0, 0.0, -2.0), 3.0, 0.2));
  d = min(d, sdf_capsule(p + vec3(2.0, 0.0, -2.0), 3.0, 0.2));
  d = max(d, -sdf_sphere(p.y > 0.1 ? vec3(-1.2) : p, vec3(0.0), 2.0));
  return d;
}

#define THRESHOLD 0.001
#define BAILOUT 1000

vec3 normalAt(vec3 p, float d) {
    float dx = d - scene(vec3(p.x - THRESHOLD, p.y, p.z));
    float dy = d - scene(vec3(p.x, p.y - THRESHOLD, p.z));
    float dz = d - scene(vec3(p.x, p.y, p.z - THRESHOLD));
    return normalize(vec3(dx, dy, dz));
}

float point_shadow(vec3 origin, vec3 light) {
  vec3 d = normalize(light - origin);
  float shade = 1.0;
  float ph = 1e20;
  float k = 5.0;
  float t = 0.1;
  
  for (int i = 0; i < BAILOUT; i += 1) {
    float dist = scene(origin + d * t);

    if (dist < THRESHOLD) {
      return 0.0;
    }
    
    float dist2 = dist * dist;
    float y = dist2 / (2.0 * ph);
    float d = sqrt(dist2 - y * y);
    shade = min(shade, k * d / max(0.0, t - y));
    
    t += dist;

    if (t > 100.0) break;
  }
  
  return shade / distance(origin, light);
}

float global_shadow(vec3 origin, vec3 d) {
  float shade = 1.0;
  float ph = 1e20;
  float k = 30.0;
  float t = 0.1;
  
  for (int i = 0; i < BAILOUT; i += 1) {
    float dist = scene(origin + d * t);

    if (dist < THRESHOLD) {
      return 0.0;
    }
    
    float dist2 = dist * dist;
    float y = dist2 / (2.0 * ph);
    float d = sqrt(dist2 - y * y);
    shade = min(shade, k * d / max(0.0, t - y));
    
    t += dist;

    if (t > 100.0) break;
  }
  
  return shade;
}

vec4 light(vec3 origin, vec3 normal, vec3 eye, vec3 light) {
  vec3 l = vec3(0.5, 0.5, 0.0);
  vec3 r = reflect(-l, normal);
  vec3 e = normalize(eye - origin);
  
  vec3 amb = 0.6*pow(max(dot(e, normal), 0.0), 0.1) * vec3(0.21, 0.34, 0.6);

  vec3 diff = max(dot(l, normal), 0.0) * vec3(1.0); // vec4(0.9, 0.9, 0.9, 1.0);
  
  float angle = max(dot(r, e), 0.0);
  vec3 spec = 0.3 * pow(angle, 0.8) * vec3(0.9, 0.9, 0.8);
  float shade = global_shadow(origin, l);

  return vec4(amb + shade * diff + shade * spec, 1.0);
}

vec4 sky(vec3 d, vec3 sun) {
  vec3 top = vec3(0.11, 0.34, 0.6);
  vec3 mid = vec3(0.16, 0.53, 0.84);
  vec3 bottom = vec3(0.49, 0.72, 0.9);
  vec4 sunColor = vec4(1.0);
  return vec4(mix(bottom, mix(mid, top, d.y), d.y + 1.0), 1.0) +
    pow(max(dot(d, sun) / 15.0, 0.0), 3.0) * sunColor;
}

vec4 trace(vec3 o, vec3 d) {
  float t = 0.0;
  vec3 sunDirection = vec3(10.0, 1.80, 5.5);

  for (int i = 0; i < BAILOUT; i += 1) {
    vec3 p = o + d * t;
    float dist = scene(p);

    if (dist < THRESHOLD) {
      vec3 n = normalAt(p, dist);
      return light(p, n, o, sunDirection);
    }
    
    t += dist;

    if (t > 100.0) break;
  }
  
  return sky(d, sunDirection);
}

vec3 rayDirection(float fov, vec2 fragCoord, vec2 size) {
    vec2 p = fragCoord * 2.0 - size;
    return normalize(vec3(p, -size.y / tan(radians(fov) / 2.0)));
}

mat3 lookAt(vec3 eye, vec3 target, vec3 up) {
  vec3 z = normalize(target - eye);
  vec3 x = normalize(cross(z, up));
  vec3 y = cross(x, z);
  return mat3(x, y, -z);
}

void main() {
  vec3 ray = rayDirection(90.0, gl_FragCoord.xy, u_resolution.xy);
  vec3 eye = vec3(sin(u_time / 3.) * 2.0, 2.0, cos(u_time / 3.) * 2.0);
  mat3 view2world = lookAt(eye, vec3(0.0), vec3(0.0, 1.0, 0.0));
  gl_FragColor = trace(eye, view2world * ray);
}
