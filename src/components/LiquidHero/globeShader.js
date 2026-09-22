/*
 * Wireframe globe drawn as a signed-distance field. Every great circle of a
 * sphere projects (orthographically) to an ellipse centred on the sphere, so
 * each ring only needs its normal: the ellipse's long axis is the radius, its
 * short axis the radius times |normal.z|. The rings' stroke distances are
 * merged with a smooth minimum, which is what melts lines together into a
 * liquid web wherever they crowd, as they do near the silhouette.
 */

export const RING_COUNT = 7;

export const GLOBE_VERTEX = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const GLOBE_FRAGMENT = `
precision highp float;

uniform vec2 uCenter;      // px, origin bottom-left
uniform float uRadius;     // px
uniform vec3 uNormals[${RING_COUNT}];
uniform float uLine;       // half-width of a ring stroke, px
uniform float uRim;        // half-width of the silhouette stroke, px
uniform float uMelt;       // smooth-min reach, px
uniform float uAlpha;
uniform vec3 uColor;

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

/* Approximate distance to the projected ellipse of a great circle. */
float ringDistance(vec2 p, vec3 n) {
  float len = length(n.xy);
  vec2 minor = len > 1e-4 ? n.xy / len : vec2(0.0, 1.0);
  vec2 major = vec2(-minor.y, minor.x);
  float a = uRadius;
  float b = max(uRadius * abs(n.z), 0.75);
  vec2 q = vec2(dot(p, major), dot(p, minor));
  float f = (q.x * q.x) / (a * a) + (q.y * q.y) / (b * b) - 1.0;
  vec2 grad = 2.0 * vec2(q.x / (a * a), q.y / (b * b));
  return abs(f) / max(length(grad), 1e-4);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;

  float d = abs(length(p) - uRadius) - uRim;
  for (int i = 0; i < ${RING_COUNT}; i++) {
    d = smin(d, ringDistance(p, uNormals[i]) - uLine, uMelt);
  }

  float ink = 1.0 - smoothstep(-0.75, 0.75, d);
  float a = ink * uAlpha;
  gl_FragColor = vec4(uColor * a, a);
}
`;
