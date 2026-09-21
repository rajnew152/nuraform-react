import { useEffect, useRef } from 'react';
import { VERTEX_SHADER, FRAGMENT_SHADER } from './liquidShader';

/* The gradient is soft, so render below native resolution and let CSS upscale it. */
const RENDER_SCALE = 0.5;
const MOUSE_EASE = 0.06;
const HOVER_EASE = 0.04;

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

/**
 * Full-bleed WebGL canvas running the liquid shader. `hoverTarget` is the
 * element whose pointer movement stirs the liquid (the whole hero card, so
 * text on top of the canvas does not block it).
 *
 * The loop pauses while the hero is off screen or the tab is hidden. With
 * reduced motion it renders one still frame and ignores the pointer. If WebGL
 * is unavailable the canvas stays empty and the card's CSS gradient shows.
 */
export default function LiquidCanvas({ hoverTarget }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = hoverTarget.current;
    const gl = canvas?.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!canvas || !target || !gl) return undefined;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    /* One triangle pair covering clip space. */
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      mouse: gl.getUniformLocation(program, 'uMouse'),
      hover: gl.getUniformLocation(program, 'uHover'),
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const hover = { value: 0, target: 0 };
    let frame = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (time) => {
      mouse.x += (mouse.tx - mouse.x) * MOUSE_EASE;
      mouse.y += (mouse.ty - mouse.y) * MOUSE_EASE;
      hover.value += (hover.target - hover.value) * HOVER_EASE;

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, time);
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
      gl.uniform1f(uniforms.hover, hover.value);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = () => {
      draw((performance.now() - start) / 1000);
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };

    const play = () => {
      if (!frame && !reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    const onMove = (event) => {
      const rect = target.getBoundingClientRect();
      mouse.tx = (event.clientX - rect.left) / rect.width;
      mouse.ty = 1 - (event.clientY - rect.top) / rect.height;
      hover.target = 1;
    };
    const onLeave = () => {
      hover.target = 0;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(8);
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    });
    intersection.observe(target);

    document.addEventListener('visibilitychange', play);

    resize();
    if (reducedMotion) {
      draw(8);
    } else {
      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerleave', onLeave);
      play();
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', play);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [hoverTarget]);

  return <canvas className="liquid-hero__canvas" ref={canvasRef} aria-hidden="true" />;
}
