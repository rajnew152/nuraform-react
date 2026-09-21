import { LIQUID_COLORS } from './liquidHeroData';

const vec3 = ([r, g, b]) => `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`;

export const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/*
 * Domain-warped fbm ("liquid") gradient. The warp field drifts slowly on its
 * own; around the pointer it gains a swirl whose strength follows uHover, so
 * the colours visibly stir and flow wherever the cursor moves.
 */
export const FRAGMENT_SHADER = `
precision highp float;

#define SHARPNESS 18.0

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    value += amp * noise(p);
    p = rot * p * 2.0 + 0.3;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.1;
  vec2 m = vec2(uMouse.x * aspect, uMouse.y) * 1.1;
  float t = uTime;

  /* Swirl around the pointer, fading out with distance. */
  vec2 toMouse = p - m;
  float influence = uHover * exp(-dot(toMouse, toMouse) * 5.0);
  p += influence * vec2(-toMouse.y, toMouse.x) * 0.9;
  p -= influence * toMouse * 0.25 * sin(t * 1.3);

  vec2 q = vec2(fbm(p + vec2(0.0, 0.07 * t)), fbm(p + vec2(5.2, 1.3) - 0.05 * t));
  vec2 r = vec2(
    fbm(p + 1.8 * q + vec2(1.7, 9.2) + 0.13 * t),
    fbm(p + 1.8 * q + vec2(8.3, 2.8) + 0.11 * t)
  );

  /*
   * Each colour owns an independent drifting noise field sampled on the warped
   * coordinates; the fields are blended by exponential weight, so every colour
   * gets its share of the canvas and the edges between them stay liquid-soft.
   */
  vec2 w = p + 1.6 * r;
  float w1 = exp(fbm(w + vec2(0.0, 0.0) + 0.06 * t) * SHARPNESS);
  float w2 = exp(fbm(w + vec2(3.1, 7.4) - 0.05 * t) * SHARPNESS);
  float w3 = exp(fbm(w + vec2(8.7, 1.9) + vec2(0.04, -0.03) * t) * SHARPNESS);
  float w4 = exp(fbm(w + vec2(4.6, 12.2) + vec2(-0.05, 0.02) * t) * SHARPNESS);
  float w5 = exp(fbm(w + vec2(11.3, 5.5) + 0.03 * t) * SHARPNESS);
  float w6 = exp(fbm(w + vec2(6.8, 9.9) - 0.04 * t) * SHARPNESS);

  vec3 col = (
    ${vec3(LIQUID_COLORS.yellow)} * w1 +
    ${vec3(LIQUID_COLORS.pink)} * w2 +
    ${vec3(LIQUID_COLORS.sky)} * w3 +
    ${vec3(LIQUID_COLORS.coral)} * w4 +
    ${vec3(LIQUID_COLORS.mint)} * w5 +
    ${vec3(LIQUID_COLORS.orange)} * w6
  ) / (w1 + w2 + w3 + w4 + w5 + w6);
  /* Blends between opposite hues go grey; push saturation back up. */
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(luma), col, 1.35), 0.0, 1.0);

  /* A soft lift of light right under the cursor while hovering. */
  col += influence * 0.08;

  gl_FragColor = vec4(col, 1.0);
}
`;
