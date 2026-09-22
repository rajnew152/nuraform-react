import { useEffect, useRef } from 'react';
import { GLOBE_VERTEX, GLOBE_FRAGMENT, RING_COUNT } from './globeShader';

/* Soft lines survive a lower resolution well, and it keeps every frame cheap. */
const MAX_DPR = 1.25;
const SPIN = 0.09; // radians per second around the globe's own axis
const TILT_X = 0.38;
const TILT_Z = -0.22;
/* Line colour while it opens up, and at rest (blended by `state.tint`). Both white. */
const INTRO_COLOR = [1.0, 1.0, 1.0];
const REST_COLOR = [1.0, 1.0, 1.0];

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/*
 * Ring normals in globe space (pole along y): five meridians fanned around the
 * pole, the equator, and one oblique ring. Spun about the pole, then tilted
 * towards the viewer so the rings sweep across each other as it turns.
 */
function ringNormals(spin) {
  const normals = [];
  for (let i = 0; i < 5; i++) {
    const angle = spin + (i * Math.PI) / 5;
    normals.push([Math.cos(angle), 0, Math.sin(angle)]);
  }
  normals.push([0, 1, 0]);
  const oblique = spin * 0.6 + 0.9;
  normals.push([Math.cos(oblique) * 0.55, 0.8, Math.sin(oblique) * 0.55]);

  const cx = Math.cos(TILT_X);
  const sx = Math.sin(TILT_X);
  const cz = Math.cos(TILT_Z);
  const sz = Math.sin(TILT_Z);

  return normals.flatMap(([x, y, z]) => {
    const length = Math.hypot(x, y, z);
    x /= length;
    y /= length;
    z /= length;
    /* Tilt about x, then about z. */
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    return [x * cz - y1 * sz, x * sz + y1 * cz, z1];
  });
}

/**
 * Full-bleed canvas drawing the turning wireframe globe over the liquid.
 * `state` is a plain object that the hero's GSAP intro tweens:
 *   radius: globe radius as a fraction of the visible card's shorter side
 *   alpha:  line opacity
 *   tint:   0 = intro yellow, 1 = resting white
 * The globe sits at the centre of the visible part of the card. The loop
 * pauses off screen or in a hidden tab; with reduced motion it stops turning.
 */
export default function GlobeCanvas({ state }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!canvas || !gl) return undefined;

    const vertex = compile(gl, gl.VERTEX_SHADER, GLOBE_VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, GLOBE_FRAGMENT);
    if (!vertex || !fragment) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = (name) => gl.getUniformLocation(program, name);
    const uniforms = {
      center: u('uCenter'),
      radius: u('uRadius'),
      normals: u('uNormals'),
      line: u('uLine'),
      rim: u('uRim'),
      melt: u('uMelt'),
      alpha: u('uAlpha'),
      color: u('uColor'),
    };
    gl.clearColor(0, 0, 0, 0);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = 1;
    let frame = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (time) => {
      const width = canvas.clientWidth;
      /* Centre on the part of the card the first screen shows. */
      const visibleHeight = Math.min(canvas.clientHeight, window.innerHeight);
      const radius = state.radius * Math.min(width, visibleHeight);

      gl.clear(gl.COLOR_BUFFER_BIT);
      if (state.alpha <= 0.001) return;

      gl.uniform2f(uniforms.center, (width / 2) * dpr, canvas.height - (visibleHeight / 2) * dpr);
      gl.uniform1f(uniforms.radius, radius * dpr);
      gl.uniform3fv(uniforms.normals, ringNormals(time * SPIN));
      /*
       * Thin strokes and a short melt reach: lines only web together where
       * they nearly touch (near the silhouette), instead of swelling into blobs.
       */
      gl.uniform1f(uniforms.line, 0.7 * dpr);
      gl.uniform1f(uniforms.rim, 1.4 * dpr);
      gl.uniform1f(uniforms.melt, (3 + radius * 0.012) * dpr);
      gl.uniform1f(uniforms.alpha, state.alpha);
      const t = state.tint;
      gl.uniform3f(
        uniforms.color,
        INTRO_COLOR[0] + (REST_COLOR[0] - INTRO_COLOR[0]) * t,
        INTRO_COLOR[1] + (REST_COLOR[1] - INTRO_COLOR[1]) * t,
        INTRO_COLOR[2] + (REST_COLOR[2] - INTRO_COLOR[2]) * t
      );
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = () => {
      draw(reducedMotion ? 1.2 : (performance.now() - start) / 1000);
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };

    const play = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(reducedMotion ? 1.2 : (performance.now() - start) / 1000);
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    });
    intersection.observe(canvas);

    document.addEventListener('visibilitychange', play);

    resize();
    play();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', play);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [state]);

  return <canvas className="liquid-hero__globe" ref={canvasRef} aria-hidden="true" />;
}
