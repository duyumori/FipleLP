import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/** Live scene state the hero writes every frame (already smoothed). */
export type HeroMotion = {
  p: number;
  mx: number;
  my: number;
  /** 0..1 — a see-through hole opens in the crater's centre and widens to the full screen (scene exit). */
  dark?: number;
};

// Animated "contour terraces" behind the hero: a slowly breathing elliptical crater
// sliced into steps, each step edge shaded and rimmed with a sheen.
//
// Cursor: a small GPU fluid simulation (Stam's "stable fluids": advect → splat → divergence
// → pressure → project) runs at low resolution. Moving the pointer pushes force into it, the
// fluid flows and settles, and its velocity field warps the surface — a smooth, liquid wake
// rather than a trail of dots. Where it warps, the RGB channels split slightly (chromatic
// aberration). The surface itself is drawn at full device resolution so it stays crisp.
// It also drifts slightly with the cursor and morphs with the hero's scroll scene (`motion`).

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

// ---- Fluid passes (velocity stored in sim texels per second) --------------------------------

const SPLAT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform float uAspect;
uniform vec2 uPoint;
uniform vec2 uForce;
uniform float uRadius;
out vec4 o;
void main() {
  vec2 d = vUv - uPoint;
  d.x *= uAspect;
  vec2 v = texture(uVelocity, vUv).xy + uForce * exp(-dot(d, d) / uRadius);
  o = vec4(v, 0.0, 1.0);
}`;

const ADVECT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform float uDt;
uniform float uDissipation;
out vec4 o;
void main() {
  vec2 back = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
  o = vec4(texture(uVelocity, back).xy / (1.0 + uDissipation * uDt), 0.0, 1.0);
}`;

const DIVERGENCE = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
out vec4 o;
void main() {
  vec2 c = texture(uVelocity, vUv).xy;
  float L = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  // walls: reflect velocity at the borders
  if (vUv.x - uTexel.x < 0.0) L = -c.x;
  if (vUv.x + uTexel.x > 1.0) R = -c.x;
  if (vUv.y - uTexel.y < 0.0) B = -c.y;
  if (vUv.y + uTexel.y > 1.0) T = -c.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const PRESSURE = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
out vec4 o;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float div = texture(uDivergence, vUv).x;
  o = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
out vec4 o;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  o = vec4(texture(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
}`;

const SCALE = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uValue;
out vec4 o;
void main() { o = uValue * texture(uTex, vUv); }`;

// ---- The surface ----------------------------------------------------------------------------

const SURFACE = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uProgress; // 0 = hero at rest, 1 = end of the pinned scroll scene
uniform vec2 uMouse;     // smoothed cursor, -1..1 on both axes
uniform sampler2D uVelocity;
uniform float uSimH;     // sim height in texels (velocity → screen units)
uniform vec4 uRest;      // resting pose: centre.xy, tilt angle, squash
uniform float uSeed;     // shifts the noise so another instance gets its own shape
uniform float uFadeBottom; // 1 = fade the bottom edge out into the page, 0 = full bleed
uniform float uDark;     // 0..1 — see-through hole opening from the centre (scene exit)
out vec4 outColor;

const vec3 BASE  = vec3(0.976, 0.976, 0.965); // #f9f9f6
const vec3 BLUE  = vec3(0.180, 0.176, 0.170); // warm charcoal sheen
const vec3 GREEN = vec3(0.720, 0.710, 0.690); // light warm gray
const vec3 CYAN  = vec3(0.480, 0.475, 0.460); // mid warm gray

// sin-free hash: the classic fract(sin()) one breaks into visible seams on Apple GPUs.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// Crater pose, set per frame in main(): centre, tilt and squash.
vec2 C;
mat2 R;
float SQ;

// Distance-like height field: an ellipse around C, warped by noise.
float field(vec2 p, float t) {
  vec2 d = R * (p - C);
  d.y *= SQ;                                // squash → reads as a surface seen at an angle
  float r = length(d);
  // Scroll progress also slides the noise, so the shape keeps morphing for the whole scene
  // instead of settling once the crater has moved to the centre.
  vec2 drift = uProgress * vec2(0.9, -0.6);
  float w = noise(p * 1.3 + uSeed + drift + vec2(t * 0.045, -t * 0.03)) * 0.34
          + noise(p * 3.2 - uSeed - drift * 0.5 + vec2(-t * 0.03, -t * 0.05)) * 0.08;
  return pow(r + w, 0.72) + 0.015 * sin(t * 0.6); // pow → rings widen toward the viewer
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;                       // 0..1, origin bottom-left
  float t = uTime;
  float sp = smoothstep(0.05, 0.45, uProgress);           // scene blend

  // The fluid's velocity warps the surface (in units of screen height).
  vec2 vel = texture(uVelocity, uv).xy / uSimH;
  float speed = length(vel);

  // aspect-correct, centred; the cursor slides the whole surface a touch (parallax),
  // and the fluid pushes it locally.
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y - vec2(uMouse.x, -uMouse.y) * 0.025;
  p -= vel * 0.07;

  // Scrolling pulls the crater from top-right to dead centre (where the phrases sit).
  C = mix(uRest.xy, vec2(0.0, -0.02), sp);
  float a = mix(uRest.z, 0.15, sp);
  R = mat2(cos(a), -sin(a), sin(a), cos(a));
  SQ = mix(uRest.w, 1.55, sp);
  float steps = mix(11.0, 15.0, sp);

  float h = field(p, t);
  float v = h * steps - t * 0.12 - uProgress * 3.0;        // terraces drift outward, faster on scroll
  float k = fract(v);
  float level = floor(v);

  // Fake lighting from the GPU's screen-space derivatives of h.
  vec2 g = vec2(dFdx(h), dFdy(h));
  float facing = dot(normalize(g + 1e-6), normalize(vec2(-0.55, 0.83)));

  // Chromatic aberration: where the fluid moves, offset the terrace phase per channel.
  float ca = clamp(speed * 0.09, 0.0, 0.07);
  vec3 kc = fract(v + vec3(ca, 0.0, -ca));
  // Ramp the shadow in over ~1.5px at the terrace lip (antialiasing).
  vec3 lipAA = smoothstep(vec3(0.0), vec3(1.5 * fwidth(v)), kc);
  vec3 shadow = exp(-kc * 3.2) * (0.16 + 0.30 * (0.5 + 0.5 * facing)) * lipAA;
  vec3 highlight = exp(-(1.0 - kc) * 14.0) * 0.07;

  // Sheen on the step lip. Angular variation from the direction vector, not atan()
  // (atan wraps at ±π and drew a hard seam).
  vec2 dir = normalize(p - C + 1e-5);
  float ph = 0.5 + 0.5 * sin(level * 0.85 + dir.x * 1.6 + dir.y * 0.9 + t * 0.25);
  vec3 sheen = ph < 0.5 ? mix(BLUE, CYAN, ph * 2.0) : mix(CYAN, GREEN, ph * 2.0 - 1.0);
  float rim = exp(-k * 11.0) + exp(-(1.0 - k) * 30.0) * 0.5;

  // At rest: keep the headline corner (bottom-left) calm, strongest top-right.
  // In the scene: the whole surface lights up, but a calm pool stays behind the centred phrase.
  // The cursor's wake always shows, even in the calm corner.
  float restMask = smoothstep(0.15, 0.95, uv.x * 0.65 + uv.y * 0.75);
  float pool = smoothstep(0.10, 0.42, length((p - vec2(0.0, -0.02)) * vec2(0.55, 1.0)));
  float mask = max(mix(restMask, pool, sp), smoothstep(0.02, 0.35, speed));
  float bottomFade = mix(mix(1.0, smoothstep(0.0, 0.22, uv.y), uFadeBottom), 1.0, sp);

  vec3 col = BASE * (1.0 - shadow * mask) + highlight * mask;
  col = mix(col, sheen, clamp(rim * mix(0.6, 0.85, sp) * mask * (0.6 + 0.6 * mix(uv.y, 0.7, sp)), 0.0, 0.85));
  // Scene exit: a hole opens in the crater's centre and widens until it fills the screen.
  // It is transparent — the page tucked underneath shows through it (as on topology.vc).
  // Its edge rides the warped coordinates, so the cursor's fluid ripples it.
  float hole = 0.0;
  if (uDark > 0.0) {
    float r = length((p - vec2(0.0, -0.02)) * vec2(0.62, 1.0));
    float edge = uDark * 1.35;
    hole = max(1.0 - smoothstep(edge - 0.16, edge, r), smoothstep(0.9, 1.0, uDark));
    // a soft shade just outside the rim, so the hole reads as a depression in the surface
    col *= 1.0 - 0.35 * (1.0 - smoothstep(edge, edge + 0.18, r)) * step(0.001, uDark);
  }
  col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.02; // film grain

  float alpha = bottomFade * (1.0 - hole);
  outColor = vec4(col * alpha, alpha);
}`;

// ---- Fluid tuning -----------------------------------------------------------------------------

const SIM_H = 128;            // sim grid height in texels (width follows the aspect ratio)
const PRESSURE_ITERS = 16;
const DISSIPATION = 10.0;      // velocity fades ~e^-1 per second → a long, liquid wake
const SPLAT_RADIUS = 0.0035;  // gaussian radius² in screen-height units (~60px brush)
const SPLAT_GAIN = 0.9;       // how much of the cursor's speed the fluid picks up

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

/** Resting crater pose — the hero's default, or another shape for a second instance (footer). */
export type BackdropPose = { center: [number, number]; angle: number; squash: number; seed: number; fadeBottom: boolean };
const HERO_POSE: BackdropPose = { center: [0.5, 0.3], angle: 0.4, squash: 2.1, seed: 0, fadeBottom: true };

export function HeroBackdrop({
  className = "",
  motion,
  pose = HERO_POSE,
}: {
  className?: string;
  motion: RefObject<HeroMotion>;
  pose?: BackdropPose;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl2", { antialias: false, premultipliedAlpha: true });
    if (!canvas || !gl) return; // no WebGL2 → the plain page background shows through

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    // Rendering into half-float textures needs this; without it the surface still runs, just no fluid.
    const fluidOk = !!gl.getExtension("EXT_color_buffer_float") && fine && !reduced;

    // --- programs ---
    const shaders: WebGLShader[] = [];
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      shaders.push(s);
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const program = (src: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, vs);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
      gl.bindAttribLocation(p, 0, "aPos");
      gl.linkProgram(p);
      const cache = new Map<string, WebGLUniformLocation | null>();
      const u = (name: string) => {
        if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name));
        return cache.get(name)!;
      };
      return { p, u };
    };
    const surface = program(SURFACE);
    const splat = program(SPLAT);
    const advect = program(ADVECT);
    const divergence = program(DIVERGENCE);
    const pressure = program(PRESSURE);
    const gradient = program(GRADIENT);
    const scale = program(SCALE);
    const programs = [surface, splat, advect, divergence, pressure, gradient, scale];

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // --- render targets ---
    const targets: Target[] = [];
    const makeTarget = (w: number, h: number, internal: number, format: number): Target => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const t = { tex, fbo, w, h };
      targets.push(t);
      return t;
    };
    const makeDouble = (w: number, h: number, internal: number, format: number) => {
      const d = { read: makeTarget(w, h, internal, format), write: makeTarget(w, h, internal, format) };
      return { swap: () => ([d.read, d.write] = [d.write, d.read]), get: () => d };
    };
    const freeTargets = () => {
      targets.forEach((t) => {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      });
      targets.length = 0;
    };

    let sim: {
      vel: ReturnType<typeof makeDouble>;
      prs: ReturnType<typeof makeDouble>;
      div: Target;
      w: number;
      h: number;
    } | null = null;
    // 1×1 zero texture stands in for velocity when the fluid is off (kept out of `targets`,
    // which only tracks the resizable sim buffers).
    const still = makeTarget(1, 1, gl.RG16F, gl.RG);
    targets.pop();

    const buildSim = () => {
      freeTargets();
      sim = null;
      if (!fluidOk) return;
      const h = SIM_H;
      const w = Math.max(16, Math.round(SIM_H * (canvas.clientWidth / Math.max(1, canvas.clientHeight))));
      sim = {
        vel: makeDouble(w, h, gl.RG16F, gl.RG),
        prs: makeDouble(w, h, gl.R16F, gl.RED),
        div: makeTarget(w, h, gl.R16F, gl.RED),
        w,
        h,
      };
    };

    const blit = (target: Target | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, target.w, target.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const bindTex = (unit: number, tex: WebGLTexture) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return unit;
    };

    // --- pointer → force ---
    const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, moved: false, seen: false };
    const onPointer = (e: PointerEvent) => {
      if (!visible) {
        pointer.seen = false; // re-anchor on return so the jump since then isn't splatted
        return;
      }
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = 1 - (e.clientY - r.top) / r.height;
      if (!pointer.seen) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.seen = true;
      }
      pointer.moved = true;
    };

    const stepFluid = (dt: number) => {
      if (!sim) return;
      const { vel, prs, div, w, h } = sim;
      const texel: [number, number] = [1 / w, 1 / h];

      // 1. Splat the cursor's motion since last frame into the velocity field.
      if (pointer.moved) {
        const dx = (pointer.x - pointer.px) * w; // in sim texels
        const dy = (pointer.y - pointer.py) * h;
        if (dx * dx + dy * dy > 1e-4) {
          gl.useProgram(splat.p);
          gl.uniform1i(splat.u("uVelocity"), bindTex(0, vel.get().read.tex));
          gl.uniform1f(splat.u("uAspect"), w / h);
          gl.uniform2f(splat.u("uPoint"), pointer.x, pointer.y);
          gl.uniform2f(splat.u("uForce"), (dx / dt) * SPLAT_GAIN, (dy / dt) * SPLAT_GAIN);
          gl.uniform1f(splat.u("uRadius"), SPLAT_RADIUS);
          blit(vel.get().write);
          vel.swap();
        }
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.moved = false;
      }

      // 2. Make it incompressible (swirls instead of smears): divergence → pressure → subtract.
      gl.useProgram(divergence.p);
      gl.uniform2f(divergence.u("uTexel"), ...texel);
      gl.uniform1i(divergence.u("uVelocity"), bindTex(0, vel.get().read.tex));
      blit(div);

      gl.useProgram(scale.p);
      gl.uniform1i(scale.u("uTex"), bindTex(0, prs.get().read.tex));
      gl.uniform1f(scale.u("uValue"), 0.8);
      blit(prs.get().write);
      prs.swap();

      gl.useProgram(pressure.p);
      gl.uniform2f(pressure.u("uTexel"), ...texel);
      gl.uniform1i(pressure.u("uDivergence"), bindTex(1, div.tex));
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl.uniform1i(pressure.u("uPressure"), bindTex(0, prs.get().read.tex));
        blit(prs.get().write);
        prs.swap();
      }

      gl.useProgram(gradient.p);
      gl.uniform2f(gradient.u("uTexel"), ...texel);
      gl.uniform1i(gradient.u("uPressure"), bindTex(0, prs.get().read.tex));
      gl.uniform1i(gradient.u("uVelocity"), bindTex(1, vel.get().read.tex));
      blit(vel.get().write);
      vel.swap();

      // 3. Let it flow and fade.
      gl.useProgram(advect.p);
      gl.uniform2f(advect.u("uTexel"), ...texel);
      gl.uniform1f(advect.u("uDt"), dt);
      gl.uniform1f(advect.u("uDissipation"), DISSIPATION);
      gl.uniform1i(advect.u("uVelocity"), bindTex(0, vel.get().read.tex));
      blit(vel.get().write);
      vel.swap();
    };

    const drawSurface = (ms: number) => {
      const m = motion.current;
      gl.useProgram(surface.p);
      gl.uniform2f(surface.u("uRes"), canvas.width, canvas.height);
      gl.uniform1f(surface.u("uTime"), 20 + ms / 1000);
      gl.uniform1f(surface.u("uProgress"), m?.p ?? 0);
      gl.uniform2f(surface.u("uMouse"), m?.mx ?? 0, m?.my ?? 0);
      gl.uniform1f(surface.u("uSimH"), sim ? sim.h : 1);
      gl.uniform4f(surface.u("uRest"), pose.center[0], pose.center[1], pose.angle, pose.squash);
      gl.uniform1f(surface.u("uSeed"), pose.seed);
      gl.uniform1f(surface.u("uFadeBottom"), pose.fadeBottom ? 1 : 0);
      gl.uniform1f(surface.u("uDark"), m?.dark ?? 0);
      gl.uniform1i(surface.u("uVelocity"), bindTex(0, sim ? sim.vel.get().read.tex : still.tex));
      blit(null);
    };

    const resize = () => {
      // Desktop: full device resolution (capped at 2×) keeps the terrace lines crisp; the
      // expensive part, the fluid, runs on a small fixed grid regardless of screen size.
      // Touch devices render at CSS pixels (1×) — the surface is a soft organic gradient
      // where the extra DPR only burns fill-rate, and at 2× the pass alone saturates mobile
      // GPUs. Skip no-op resizes: the mobile URL bar toggling fires ResizeObserver on every
      // scroll direction change.
      const maxDpr = fine ? 2 : 1;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      buildSim();
    };

    let raf = 0;
    let visible = true;
    let last = 0;
    let drawnP = Number.NaN;
    let drawnDark = Number.NaN;
    let drawnAt = -Infinity;
    const loop = (ms: number) => {
      const dt = Math.min((ms - (last || ms)) / 1000 || 1 / 60, 1 / 30);
      last = ms;
      stepFluid(dt);
      if (fine) {
        drawSurface(ms);
      } else {
        // Touch: the surface is a still frame (frozen clock — no breathing, no grain
        // flicker). Redraw only when the scroll scene actually changes it (progress /
        // exit hole), and cap that at 30fps: during a fast scroll a 60fps re-draw of the
        // shader competes with the compositor for GPU time, while the extra frames are
        // masked by the scroll motion anyway. Dirty state is kept until drawn, so the
        // final frame after scrolling stops always lands.
        const m = motion.current;
        const p = m?.p ?? 0;
        const dark = m?.dark ?? 0;
        if ((p !== drawnP || dark !== drawnDark) && ms - drawnAt >= 33) {
          drawnP = p;
          drawnDark = dark;
          drawnAt = ms;
          drawSurface(0);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible && !document.hidden && !reduced) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(() => {
      resize();
      // repaint immediately so a resize never shows a blank frame (frozen clock on touch)
      drawSurface(fine ? performance.now() : 0);
    });
    ro.observe(canvas);
    // Only animate while the hero is on screen and the tab is visible.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    if (fluidOk) window.addEventListener("pointermove", onPointer, { passive: true });

    resize();
    drawSurface(0);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      freeTargets();
      gl.deleteTexture(still.tex);
      gl.deleteFramebuffer(still.fbo);
      programs.forEach(({ p }) => gl.deleteProgram(p));
      shaders.forEach((s) => gl.deleteShader(s));
      gl.deleteBuffer(buf);
    };
  }, [motion, pose]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
