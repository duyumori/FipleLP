// Export the site's procedural artwork once, at Retina resolution. Touch devices
// display these compressed stills without creating WebGL contexts or fluid buffers.
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/HeroBackdrop.tsx', import.meta.url), 'utf8');
const vertex = source.match(/const VERT = `([\s\S]*?)`;/)[1];
const surface = source.match(/const SURFACE = `([\s\S]*?)`;/)[1];
const destination = new URL('../src/assets/', import.meta.url);
await mkdir(destination, { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const variant of ['hero', 'footer']) {
    const fragment = variant === 'footer'
      ? surface
          .replace('vec3(0.976, 0.976, 0.965)', 'vec3(0.30, 0.31, 0.32)')
          .replace('vec3(0.180, 0.176, 0.170)', 'vec3(0.075, 0.09, 0.11)')
          .replace('vec3(0.720, 0.710, 0.690)', 'vec3(0.70, 0.72, 0.74)')
          .replace('vec3(0.480, 0.475, 0.460)', 'vec3(0.36, 0.39, 0.42)')
      : surface;
    for (const width of [768, 1440]) {
      const height = Math.round(width * (variant === 'hero' ? 16 / 9 : 2 / 3));
      const dataURL = await page.evaluate(({vertex, fragment, width, height, variant}) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, antialias: false});
        if (!gl) throw new Error('WebGL2 is required to export the artwork');
        const compile = (type, source) => {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
          return shader;
        };
        const program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
        gl.bindAttribLocation(program, 0, 'aPos');
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        const u = name => gl.getUniformLocation(program, name);
        gl.uniform2f(u('uRes'), width, height);
        gl.uniform1f(u('uTime'), 20);
        gl.uniform1f(u('uProgress'), 0);
        gl.uniform2f(u('uMouse'), 0, 0);
        gl.uniform1f(u('uSimH'), 1);
        const pose = variant === 'hero' ? [0.40, 0.33, 0.4, 1.8] : [-0.12, 0.08, -0.45, 1.5];
        gl.uniform4f(u('uRest'), ...pose);
        gl.uniform1f(u('uSeed'), variant === 'hero' ? 0 : 17.3);
        gl.uniform1f(u('uFadeBottom'), 0);
        gl.uniform1f(u('uDark'), 0);
        gl.uniform1i(u('uVelocity'), 0);
        gl.viewport(0, 0, width, height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        const result = canvas.toDataURL('image/webp', 0.92);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return result;
      }, {vertex, fragment, width, height, variant});
      if (!dataURL.startsWith('data:image/webp;base64,')) throw new Error('WebP export failed');
      const bytes = Buffer.from(dataURL.split(',')[1], 'base64');
      const name = `surface-${variant}-${width}.webp`;
      await writeFile(new URL(name, destination), bytes);
      console.log(`${name}: ${width}×${height}, ${Math.round(bytes.length / 1024)} KB`);
    }
  }
} finally {
  await browser.close();
}
