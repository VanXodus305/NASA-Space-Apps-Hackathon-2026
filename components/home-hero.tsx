'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Magnetic, Reveal, KineticHeading } from './motion-effects'
import { ArrowDown, ArrowUpRight, Orbit } from 'lucide-react'
import AnimatedContent from './react-bits/animated-content'

/* ------------------------------------------------------------------ */
/* Asteroid 1999 RQ36: a dependency-free GLB + WebGL2 viewer.          */
/* Place the model at public/models/1999_RQ36_asteroid.glb             */
/* ------------------------------------------------------------------ */

const MODEL_URL = '/models/1999_RQ36_asteroid.glb'
const BASE_PITCH = 0.28
const AUTO_SPIN = 0.16 // radians per second
const AXIS_TILT = 0.42
const CAMERA_DISTANCE = 4.55
const FIELD_OF_VIEW = (30 * Math.PI) / 180

type Gltf = {
  accessors: {
    bufferView: number
    byteOffset?: number
    componentType: number
    count: number
    type: string
  }[]
  bufferViews: { byteOffset?: number; byteStride?: number }[]
  meshes: {
    primitives: {
      attributes: Record<string, number>
      indices?: number
      material?: number
    }[]
  }[]
  materials?: { pbrMetallicRoughness?: { baseColorFactor?: number[] } }[]
}

type Rock = {
  positions: Float32Array
  normals: Float32Array
  indices: Uint16Array | Uint32Array
  base: [number, number, number]
}

function parseRock(buffer: ArrayBuffer): Rock {
  const view = new DataView(buffer)
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error('Not a GLB file')
  let offset = 12
  let json: Gltf | null = null
  let bin: ArrayBuffer | null = null
  while (offset + 8 <= buffer.byteLength) {
    const length = view.getUint32(offset, true)
    const type = view.getUint32(offset + 4, true)
    const start = offset + 8
    if (type === 0x4e4f534a) {
      json = JSON.parse(
        new TextDecoder().decode(new Uint8Array(buffer, start, length)),
      ) as Gltf
    } else if (type === 0x004e4942) {
      bin = buffer.slice(start, start + length)
    }
    offset = start + length
  }
  const primitive = json?.meshes[0]?.primitives[0]
  if (!json || !bin || !primitive) throw new Error('Empty GLB')
  const data = json
  const chunk = bin

  const read = (index: number) => {
    const accessor = data.accessors[index]
    const bufferView = data.bufferViews[accessor.bufferView]
    const parts = accessor.type === 'VEC3' ? 3 : 1
    const size =
      accessor.componentType === 5126 || accessor.componentType === 5125 ? 4 : 2
    if (bufferView.byteStride && bufferView.byteStride !== parts * size)
      throw new Error('Interleaved GLB buffers are not supported')
    const start = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
    const bytes = chunk.slice(start, start + accessor.count * parts * size)
    if (accessor.componentType === 5126) return new Float32Array(bytes)
    if (accessor.componentType === 5125) return new Uint32Array(bytes)
    return new Uint16Array(bytes)
  }

  const positions = read(primitive.attributes.POSITION) as Float32Array
  const normals =
    primitive.attributes.NORMAL !== undefined
      ? (read(primitive.attributes.NORMAL) as Float32Array)
      : new Float32Array(positions.length)
  const indices =
    primitive.indices !== undefined
      ? (read(primitive.indices) as Uint16Array | Uint32Array)
      : Uint32Array.from({ length: positions.length / 3 }, (_, i) => i)

  // Centre the rock on the origin and scale it to a unit radius.
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], positions[i + k])
      max[k] = Math.max(max[k], positions[i + k])
    }
  }
  const centre = min.map((v, k) => (v + max[k]) / 2)
  let radius = 0
  for (let i = 0; i < positions.length; i += 3) {
    radius = Math.max(
      radius,
      Math.hypot(
        positions[i] - centre[0],
        positions[i + 1] - centre[1],
        positions[i + 2] - centre[2],
      ),
    )
  }
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++)
      positions[i + k] = (positions[i + k] - centre[k]) / radius
  }

  const factor =
    data.materials?.[primitive.material ?? 0]?.pbrMetallicRoughness
      ?.baseColorFactor
  return {
    positions,
    normals,
    indices,
    base: [factor?.[0] ?? 0.6, factor?.[1] ?? 0.55, factor?.[2] ?? 0.5],
  }
}

const ROCK_VERTEX = `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
uniform mat4 uProjection;
uniform mat3 uRotation;
uniform float uDistance;
out vec3 vObject;
out vec3 vWorld;
out vec3 vNormal;
void main() {
  vObject = aPosition;
  vWorld = uRotation * aPosition;
  vNormal = uRotation * aNormal;
  gl_Position = uProjection * vec4(vWorld - vec3(0.0, 0.0, uDistance), 1.0);
}`

const ROCK_FRAGMENT = `#version 300 es
precision highp float;
in vec3 vObject;
in vec3 vWorld;
in vec3 vNormal;
uniform vec3 uBase;
uniform mat3 uRotation;
out vec4 outColor;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p, int octaves) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i >= octaves) break;
    s += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

void main() {
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 face = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (dot(face, view) < 0.0) face = -face;
  vec3 smooth_n = vNormal;
  float len = length(smooth_n);
  smooth_n = len > 0.001 ? smooth_n / len : face;
  if (dot(smooth_n, face) < 0.0) smooth_n = -smooth_n;
  // Mostly smooth normals (the mesh is a regular grid), with a touch of facet.
  vec3 n = normalize(mix(smooth_n, face, 0.12));

  // Procedural bump: boulders and pits from the gradient of a ridged noise field.
  vec3 q = vObject * 7.0;
  float e = 0.12;
  float h0 = abs(fbm(q, 3) * 2.0 - 1.0);
  vec3 grad = vec3(
    abs(fbm(q + vec3(e, 0.0, 0.0), 3) * 2.0 - 1.0) - h0,
    abs(fbm(q + vec3(0.0, e, 0.0), 3) * 2.0 - 1.0) - h0,
    abs(fbm(q + vec3(0.0, 0.0, e), 3) * 2.0 - 1.0) - h0) / e;
  vec3 gradWorld = uRotation * grad;
  n = normalize(n - 0.2 * (gradWorld - dot(gradWorld, n) * n));

  vec3 key = normalize(vec3(-0.62, 0.5, 0.6));
  vec3 rim = normalize(vec3(0.85, -0.15, -0.5));
  float lit = max(dot(n, key), 0.0);
  float back = max(dot(n, rim), 0.0);

  float blotch = fbm(vObject * 3.6, 4);
  float grain = fbm(vObject * 19.0, 3);
  vec3 tone = mix(uBase, vec3(dot(uBase, vec3(0.333))), 0.45);
  vec3 albedo = tone * 0.5 * mix(0.3, 1.1, blotch * blotch * 1.6) * mix(0.65, 1.2, grain) * mix(0.8, 1.15, h0);

  vec3 color = albedo * (vec3(1.0, 0.95, 0.88) * pow(lit, 1.15) * 1.9 + vec3(0.30, 0.32, 0.46) * 0.1);
  float fresnel = pow(1.0 - max(dot(n, view), 0.0), 3.0);
  color += vec3(0.81, 0.69, 0.88) * fresnel * (0.12 + 0.75 * back) * 0.6;
  color += albedo * vec3(0.55, 0.48, 0.75) * back * 0.14;

  color = 1.0 - exp(-color * 1.55);
  color = pow(color, vec3(1.0 / 2.2));
  outColor = vec4(color, 1.0);
}`

const spinMatrix = (yaw: number, pitch: number, roll: number) => {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cx = Math.cos(pitch)
  const sx = Math.sin(pitch)
  const cz = Math.cos(roll)
  const sz = Math.sin(roll)
  // Column-major 3x3 matrices.
  const ry = [cy, 0, -sy, 0, 1, 0, sy, 0, cy]
  const rx = [1, 0, 0, 0, cx, sx, 0, -sx, cx]
  const rz = [cz, sz, 0, -sz, cz, 0, 0, 0, 1]
  const multiply = (a: number[], b: number[]) => {
    const out = new Array<number>(9).fill(0)
    for (let col = 0; col < 3; col++)
      for (let row = 0; row < 3; row++)
        for (let k = 0; k < 3; k++)
          out[col * 3 + row] += a[k * 3 + row] * b[col * 3 + k]
    return out
  }
  return new Float32Array(multiply(rz, multiply(rx, ry)))
}

const perspective = (
  fov: number,
  aspect: number,
  near: number,
  far: number,
) => {
  const f = 1 / Math.tan(fov / 2)
  const range = near - far
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / range,
    -1,
    0,
    0,
    (2 * far * near) / range,
    0,
  ])
}

function mountAsteroid(
  host: HTMLElement,
  url: string,
  onRestored: () => void,
): () => void {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
    depth: true,
  })
  if (!gl) return () => {}

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: '100%',
    cursor: 'grab',
    touchAction: 'pan-y',
    opacity: '0',
    transform: motion.matches ? 'none' : 'scale(.93)',
    transition: motion.matches
      ? 'none'
      : 'opacity 1.4s ease, transform 1.8s cubic-bezier(.16,1,.3,1)',
  })
  host.appendChild(canvas)

  const abort = new AbortController()
  let disposed = false
  let lost = false
  let ready = false
  let visible = true
  let raf = 0
  let last = 0
  let program: WebGLProgram | null = null
  let vao: WebGLVertexArrayObject | null = null
  const buffers: WebGLBuffer[] = []
  let indexCount = 0
  let indexType: number = gl.UNSIGNED_SHORT
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const state = { yaw: 0.7, pitch: BASE_PITCH, velocity: 0, dragging: false }
  let pointerId = -1
  let pointerX = 0
  let pointerY = 0
  let pointerTime = 0

  const resize = () => {
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      2,
      1100 / Math.max(canvas.clientWidth, 1),
    )
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio))
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
  }

  const draw = () => {
    if (!program || !vao || lost) return
    resize()
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindVertexArray(vao)
    gl.uniformMatrix4fv(
      uniforms.uProjection,
      false,
      perspective(FIELD_OF_VIEW, canvas.width / canvas.height, 0.1, 20),
    )
    gl.uniformMatrix3fv(
      uniforms.uRotation,
      false,
      spinMatrix(state.yaw, state.pitch, AXIS_TILT),
    )
    gl.uniform1f(uniforms.uDistance, CAMERA_DISTANCE)
    gl.drawElements(gl.TRIANGLES, indexCount, indexType, 0)
    if (!ready) {
      ready = true
      host.dataset.ready = ''
      requestAnimationFrame(() => {
        canvas.style.opacity = '1'
        canvas.style.transform = 'none'
      })
    }
  }

  const frame = (now: number) => {
    raf = 0
    if (disposed || lost) return
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
    last = now
    const reduced = motion.matches
    if (!state.dragging) {
      state.yaw += ((reduced ? 0 : AUTO_SPIN) + state.velocity) * dt
      state.velocity *= Math.exp(-dt * 2.2)
      state.pitch += (BASE_PITCH - state.pitch) * (1 - Math.exp(-dt * 1.2))
    }
    draw()
    const settling =
      state.dragging ||
      Math.abs(state.velocity) > 0.01 ||
      Math.abs(state.pitch - BASE_PITCH) > 0.003
    if ((!reduced || settling) && visible && !document.hidden) {
      raf = requestAnimationFrame(frame)
    } else {
      last = 0
    }
  }

  const wake = () => {
    if (raf || disposed || lost || !ready || !visible) return
    last = 0
    raf = requestAnimationFrame(frame)
  }

  const onDown = (event: PointerEvent) => {
    if (
      pointerId !== -1 ||
      (event.pointerType === 'mouse' && event.button !== 0)
    )
      return
    pointerId = event.pointerId
    pointerX = event.clientX
    pointerY = event.clientY
    pointerTime = event.timeStamp
    state.dragging = true
    state.velocity = 0
    canvas.style.cursor = 'grabbing'
    canvas.setPointerCapture(event.pointerId)
    wake()
  }
  const onMove = (event: PointerEvent) => {
    if (!state.dragging || event.pointerId !== pointerId) return
    const dx = event.clientX - pointerX
    const dy = event.clientY - pointerY
    const elapsed = Math.max(event.timeStamp - pointerTime, 1) / 1000
    pointerX = event.clientX
    pointerY = event.clientY
    pointerTime = event.timeStamp
    state.yaw += dx * 0.009
    state.pitch = Math.max(-0.95, Math.min(0.95, state.pitch + dy * 0.006))
    const instant = Math.max(-6, Math.min(6, (dx * 0.009) / elapsed))
    state.velocity = state.velocity * 0.6 + instant * 0.4
    wake()
  }
  const onUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return
    if (event.timeStamp - pointerTime > 90) state.velocity = 0
    pointerId = -1
    state.dragging = false
    canvas.style.cursor = 'grab'
    wake()
  }
  const onLost = (event: Event) => {
    event.preventDefault()
    lost = true
    cancelAnimationFrame(raf)
    raf = 0
  }
  const onContextRestored = () => onRestored()

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onContextRestored)

  const resizeObserver = new ResizeObserver(() => {
    resize()
    draw()
  })
  resizeObserver.observe(canvas)
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting
    if (visible) wake()
  })
  intersection.observe(host)
  const onVisibility = () => {
    if (!document.hidden) wake()
  }
  document.addEventListener('visibilitychange', onVisibility)

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('Shader allocation failed')
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(message ?? 'Shader compile failed')
    }
    return shader
  }

  const build = (rock: Rock) => {
    const vertex = compile(gl.VERTEX_SHADER, ROCK_VERTEX)
    const fragment = compile(gl.FRAGMENT_SHADER, ROCK_FRAGMENT)
    const next = gl.createProgram()
    if (!next) throw new Error('Program allocation failed')
    gl.attachShader(next, vertex)
    gl.attachShader(next, fragment)
    gl.bindAttribLocation(next, 0, 'aPosition')
    gl.bindAttribLocation(next, 1, 'aNormal')
    gl.linkProgram(next)
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    if (!gl.getProgramParameter(next, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(next) ?? 'Program link failed')
    program = next
    ;['uProjection', 'uRotation', 'uDistance', 'uBase'].forEach((name) => {
      uniforms[name] = gl.getUniformLocation(next, name)
    })

    vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const attribute = (location: number, data: Float32Array) => {
      const buffer = gl.createBuffer()
      if (!buffer) throw new Error('Buffer allocation failed')
      buffers.push(buffer)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0)
    }
    attribute(0, rock.positions)
    attribute(1, rock.normals)
    const indexBuffer = gl.createBuffer()
    if (!indexBuffer) throw new Error('Buffer allocation failed')
    buffers.push(indexBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rock.indices, gl.STATIC_DRAW)
    indexCount = rock.indices.length
    indexType =
      rock.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
    gl.bindVertexArray(null)

    gl.useProgram(next)
    gl.uniform3f(uniforms.uBase, rock.base[0], rock.base[1], rock.base[2])
    gl.enable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
  }

  fetch(url, { signal: abort.signal })
    .then((response) => {
      if (!response.ok)
        throw new Error(`Model request failed: ${response.status}`)
      return response.arrayBuffer()
    })
    .then((buffer) => {
      if (disposed || lost) return
      build(parseRock(buffer))
      draw()
      wake()
    })
    .catch(() => {
      // The viewer is decorative; the page keeps its fallback disc.
    })

  return () => {
    disposed = true
    abort.abort()
    cancelAnimationFrame(raf)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    canvas.removeEventListener('webglcontextlost', onLost)
    canvas.removeEventListener('webglcontextrestored', onContextRestored)
    document.removeEventListener('visibilitychange', onVisibility)
    resizeObserver.disconnect()
    intersection.disconnect()
    if (!gl.isContextLost()) {
      buffers.forEach((buffer) => gl.deleteBuffer(buffer))
      if (vao) gl.deleteVertexArray(vao)
      if (program) gl.deleteProgram(program)
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    delete host.dataset.ready
    canvas.remove()
  }
}

function AsteroidViewer() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [generation, setGeneration] = useState(0)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    return mountAsteroid(host, MODEL_URL, () => setGeneration((n) => n + 1))
  }, [generation])
  return (
    <div ref={hostRef} className="group absolute inset-0">
      {/* Placeholder disc: shown while the model loads or if WebGL2 is unavailable. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[17%] rounded-full bg-[radial-gradient(circle_at_30%_26%,#6f6573,#25212c_62%,#0e0d16)] opacity-60 transition-opacity duration-1000 group-data-[ready]:opacity-0"
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Homepage hero                                                       */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  ['01', 'Observatory', '#observatory'],
  ['02', 'Targets', '/targets'],
  ['03', 'About', '/about'],
] as const

const STATS = [
  ['102', 'INFRARED CHANNELS'],
  ['06', 'DETECTOR ARRAYS'],
  ['360°', 'OF POSSIBILITY'],
  ['YOU', 'THE NEXT EXPLORER'],
]

const labelClass = 'font-mono text-[10px] tracking-[.14em] sm:text-[11px]'

export function HomeHero() {
  return (
    <>
      <section className="relative overflow-x-clip border-b border-white/10">
        <div className="relative mx-auto max-w-440 px-5 sm:px-10 lg:px-16">
          {/* Margin rails: hairlines, a stacked word and a section index. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-14 hidden w-px bg-white/10 xl:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-14 hidden w-px bg-white/10 xl:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 font-mono text-[11px] tracking-[.55em] text-ink-faint [text-orientation:upright] [writing-mode:vertical-rl] xl:block"
          >
            INFRARED
          </div>
          <nav
            aria-label="Page sections"
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-9 xl:flex"
          >
            {SECTIONS.map(([number, name, href], i) => {
              const className = `group relative font-mono transition-colors hover:text-ink focus-visible:text-ink ${i === 0 ? 'text-lg text-ink' : 'text-sm text-ink-faint'}`
              const content = (
                <>
                  {number}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-full top-1/2 mr-5 -translate-y-1/2 whitespace-nowrap text-[10px] tracking-[.16em] text-lilac opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {name.toUpperCase()}
                  </span>
                </>
              )
              return href.startsWith('#') ? (
                <a
                  key={href}
                  href={href}
                  aria-label={name}
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  aria-label={name}
                  className={className}
                >
                  {content}
                </Link>
              )
            })}
          </nav>

          <div className="grid items-center gap-14 py-14 sm:py-20 lg:min-h-[clamp(640px,calc(100svh_-_5rem),860px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,min(46%,680px))] lg:gap-6 lg:py-12 xl:gap-10">
            <AnimatedContent
              distance={30}
              blur={5}
              duration={1}
              trigger="mount"
            >
              <div className="min-w-0">
                <div className="mb-8 flex items-center gap-4 font-mono text-[11px] tracking-[.14em] text-ink-dim">
                  <span
                    aria-hidden="true"
                    className="h-9 w-2.5 shrink-0 bg-lilac/55"
                  />
                  YOUR WINDOW INTO THE INFRARED UNIVERSE
                </div>
                <KineticHeading
                  lines={['The sky is', 'never still.']}
                  accentWord="still."
                  className="max-w-3xl font-display text-[clamp(3rem,12.5vw,4.5rem)] font-light sm:text-[clamp(3.5rem,9vw,5.5rem)] lg:text-[clamp(2.75rem,6.4vw,6.25rem)] leading-[.95] tracking-[-.05em] lg:[&>span:last-child]:pl-[.7em]"
                />

                <p className="mt-9 max-w-md border-l border-lilac/50 pl-5 text-base leading-7 text-ink-dim">
                  A billion objects. A universe of possibilities.
                  <br />
                  Explore NASA’s SPHEREx images through time.
                  <br />
                  The next discovery could be yours.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-5">
                  <Magnetic>
                    <a
                      href="#observatory"
                      className="flex min-h-12 items-center gap-4 rounded-lg bg-lilac px-6 text-sm font-medium text-void transition-colors hover:bg-lilac-strong"
                    >
                      Explore the sky <ArrowDown size={17} />
                    </a>
                  </Magnetic>
                  <Link
                    href="/targets"
                    className="flex min-h-12 items-center gap-4 rounded-lg border border-white/25 px-6 text-sm text-ink transition-colors hover:border-lilac/60 hover:bg-white/5"
                  >
                    Find your first target <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </AnimatedContent>

            <AnimatedContent
              distance={26}
              blur={0}
              duration={1.3}
              delay={0.25}
              trigger="mount"
            >
              <div className="min-w-0">
                <figure className="relative mx-auto aspect-square w-full max-w-[440px] sm:max-w-[560px] lg:max-w-none">
                  {/* Soft halo, orbit guides, then the model itself. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,rgba(207,176,224,.16),transparent)]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-[2%] rounded-full border border-dashed border-lilac/15"
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 100 100"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  >
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="47"
                      ry="16"
                      transform="rotate(-24 50 50)"
                      fill="none"
                      stroke="#cfb0e0"
                      strokeOpacity=".2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <div
                    role="img"
                    aria-label="Interactive 3D model of asteroid 1999 RQ36, also known as Bennu. Drag to rotate."
                    className="absolute inset-0"
                  >
                    <AsteroidViewer />
                  </div>
                  {/* Leader lines and annotations. */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 100 100"
                    className="pointer-events-none absolute inset-0 h-full w-full text-ink-dim"
                  >
                    <g fill="none" stroke="currentColor" strokeOpacity=".6">
                      <polyline
                        points="100,11 76,11 68,22"
                        vectorEffect="non-scaling-stroke"
                      />
                      <polyline
                        points="0,89 24,89 32,78"
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                    <circle cx="68" cy="22" r=".55" fill="currentColor" />
                    <circle cx="32" cy="78" r=".55" fill="currentColor" />
                  </svg>
                  <div
                    className={`pointer-events-none absolute right-0 top-[1%] text-right text-ink ${labelClass}`}
                  >
                    1999 RQ36
                    <span className="mt-1 hidden text-ink-faint sm:block">
                      BENNU · NEAR-EARTH ASTEROID
                    </span>
                  </div>
                  <div
                    className={`pointer-events-none absolute left-0 top-[90.5%] text-ink ${labelClass}`}
                  >
                    ≈ 490 M ACROSS
                    <span className="mt-1 hidden text-ink-faint sm:block">
                      OSIRIS-REx SAMPLE RETURN · 2023
                    </span>
                  </div>
                </figure>
                <p
                  className={`mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-ink-faint ${labelClass} tracking-[.12em]`}
                >
                  <span>FIG. 01 · DRAG TO ROTATE</span>
                  <span className="flex items-center gap-3">
                    <Orbit size={17} aria-hidden="true" /> AN ENTIRE SKY. AN
                    ENTIRELY NEW PERSPECTIVE.
                  </span>
                </p>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      <div className="border-b border-white/10">
        <Reveal
          stagger={0.1}
          blur={0}
          className="mx-auto grid max-w-360 grid-cols-2 px-5 sm:grid-cols-4 sm:px-10 lg:px-16"
        >
          {STATS.map(([number, label]) => (
            <div
              key={label}
              className="flex flex-col gap-3 border-l border-white/12 py-7 pl-5 sm:py-10 max-sm:odd:border-l-0 max-sm:odd:pl-0 sm:first:border-l-0 sm:first:pl-0"
            >
              <span
                className={`font-display text-4xl font-light leading-none tracking-[-.04em] sm:text-5xl lg:text-6xl ${number === 'YOU' ? 'text-lilac' : 'text-ink'}`}
              >
                {number}
              </span>
              <span className="max-w-32 font-mono text-[11px] leading-4 tracking-[.1em] text-ink-faint">
                {label}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </>
  )
}
