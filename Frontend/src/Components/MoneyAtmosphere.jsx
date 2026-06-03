import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PALETTES = {
  landing: {
    clear: 0xf8f1d6,
    gold: 0xf7c948,
    mint: 0x2dd4a3,
    copper: 0xff7a45,
    blue: 0x55a6ff,
    ink: 0x102033,
  },
  app: {
    clear: 0x06110f,
    gold: 0xffd166,
    mint: 0x22d3a6,
    copper: 0xff8a5c,
    blue: 0x38bdf8,
    ink: 0x07111f,
  },
  auth: {
    clear: 0x06110f,
    gold: 0xffd166,
    mint: 0x2dd4bf,
    copper: 0xff9f68,
    blue: 0x60a5fa,
    ink: 0x07111f,
  },
}

function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose()

    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => {
        if (material.map) material.map.dispose()
        material.dispose()
      })
    }
  })
}

function makeBillTexture(palette) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256

  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#fff6c9')
  gradient.addColorStop(0.42, '#c9f7e8')
  gradient.addColorStop(1, '#ffe0b8')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(7, 17, 31, 0.48)'
  ctx.lineWidth = 10
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44)

  ctx.strokeStyle = 'rgba(7, 17, 31, 0.16)'
  ctx.lineWidth = 4
  for (let index = 0; index < 8; index += 1) {
    ctx.beginPath()
    ctx.moveTo(48, 64 + index * 16)
    ctx.bezierCurveTo(150, 28 + index * 10, 300, 108 + index * 6, 462, 64 + index * 16)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(7, 17, 31, 0.82)'
  ctx.font = '800 76px Barlow, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('DT', canvas.width / 2, canvas.height / 2)

  ctx.fillStyle = 'rgba(7, 17, 31, 0.56)'
  ctx.font = '700 34px Barlow, Arial, sans-serif'
  ctx.fillText('$', 86, 76)
  ctx.fillText('$', 426, 180)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true

  return texture
}

function createBill(texture) {
  const geometry = new THREE.PlaneGeometry(0.82, 0.42, 5, 3)
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    roughness: 0.52,
    metalness: 0.02,
  })

  return new THREE.Mesh(geometry, material)
}

function createCoin(palette) {
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.045, 48),
    new THREE.MeshStandardMaterial({
      color: palette.gold,
      emissive: palette.gold,
      emissiveIntensity: 0.08,
      metalness: 0.72,
      roughness: 0.18,
    }),
  )
  coin.rotation.x = Math.PI / 2
  return coin
}

export default function MoneyAtmosphere({
  variant = 'app',
  contained = false,
  density = 1,
}) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const palette = PALETTES[variant] || PALETTES.app
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80)
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    })
    const root = new THREE.Group()
    const rainGroup = new THREE.Group()
    const orbitGroup = new THREE.Group()
    const pointer = new THREE.Vector2(0, 0)
    const targetPointer = new THREE.Vector2(0, 0)
    const viewport = { width: 10, height: 10 }
    const objects = []
    let animationFrame = 0
    const startTime = performance.now()
    let lastFrameTime = startTime

    camera.position.set(0, 0.15, 10)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(palette.clear, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65))
    renderer.domElement.className = 'money-atmosphere-canvas'
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.95))

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45)
    keyLight.position.set(2.8, 4.2, 6)
    scene.add(keyLight)

    const goldLight = new THREE.PointLight(palette.gold, 2.8, 16)
    goldLight.position.set(-3.4, 2.6, 4)
    scene.add(goldLight)

    const mintLight = new THREE.PointLight(palette.mint, 2.1, 14)
    mintLight.position.set(4.2, -1.5, 3)
    scene.add(mintLight)

    scene.add(root)
    root.add(rainGroup)
    root.add(orbitGroup)

    const billTexture = makeBillTexture(palette)
    const billCount = Math.round((variant === 'landing' ? 34 : 20) * density)
    const coinCount = Math.round((variant === 'landing' ? 22 : 14) * density)
    const particleCount = Math.round((variant === 'landing' ? 190 : 105) * density)

    function randomBetween(min, max) {
      return min + Math.random() * (max - min)
    }

    for (let index = 0; index < billCount; index += 1) {
      const bill = createBill(billTexture)
      const data = {
        kind: 'bill',
        speed: randomBetween(0.42, 1.22),
        drift: randomBetween(0.35, 1.15),
        wobble: randomBetween(0.8, 1.7),
        seed: Math.random() * Math.PI * 2,
      }

      bill.position.set(randomBetween(-5, 5), randomBetween(-5, 7), randomBetween(-3.4, 1.6))
      bill.rotation.set(randomBetween(-0.8, 0.8), randomBetween(-1.6, 1.6), randomBetween(-0.8, 0.8))
      bill.scale.setScalar(randomBetween(0.72, variant === 'landing' ? 1.34 : 1.05))
      bill.userData = data
      rainGroup.add(bill)
      objects.push(bill)
    }

    for (let index = 0; index < coinCount; index += 1) {
      const coin = createCoin(palette)
      const data = {
        kind: 'coin',
        speed: randomBetween(0.28, 0.82),
        drift: randomBetween(0.55, 1.45),
        wobble: randomBetween(1.2, 2.2),
        seed: Math.random() * Math.PI * 2,
      }

      coin.position.set(randomBetween(-5, 5), randomBetween(-5, 7), randomBetween(-2.6, 2.2))
      coin.scale.setScalar(randomBetween(0.7, variant === 'landing' ? 1.3 : 1))
      coin.userData = data
      rainGroup.add(coin)
      objects.push(coin)
    }

    const particlePositions = new Float32Array(particleCount * 3)
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = randomBetween(-6.5, 6.5)
      particlePositions[index * 3 + 1] = randomBetween(-4, 5.8)
      particlePositions[index * 3 + 2] = randomBetween(-4.5, 1.5)
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: palette.gold,
        size: variant === 'landing' ? 0.034 : 0.026,
        transparent: true,
        opacity: variant === 'landing' ? 0.48 : 0.32,
        depthWrite: false,
      }),
    )
    root.add(particles)

    for (let index = 0; index < 4; index += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.35 + index * 0.62, 0.006, 8, 160),
        new THREE.MeshBasicMaterial({
          color: [palette.gold, palette.mint, palette.blue, palette.copper][index],
          transparent: true,
          opacity: variant === 'landing' ? 0.2 : 0.1,
        }),
      )
      ring.rotation.x = Math.PI / (2.35 + index * 0.12)
      ring.rotation.z = -0.65 + index * 0.46
      ring.position.set(index % 2 ? 2.6 : -2.6, index % 2 ? -0.9 : 1.2, -1.6)
      orbitGroup.add(ring)
    }

    function resetObject(object, topOffset = 0) {
      object.position.x = randomBetween(-viewport.width * 0.58, viewport.width * 0.58)
      object.position.y = viewport.height * 0.58 + topOffset + randomBetween(0, viewport.height * 0.32)
      object.position.z = randomBetween(-3.6, 1.8)
    }

    function resize() {
      const width = mount.clientWidth || window.innerWidth || 1
      const height = mount.clientHeight || window.innerHeight || 1
      renderer.setSize(width, height, true)
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      const fov = (camera.fov * Math.PI) / 180
      viewport.height = 2 * Math.tan(fov / 2) * camera.position.z
      viewport.width = viewport.height * camera.aspect
    }

    function handlePointerMove(event) {
      const rect = mount.getBoundingClientRect()
      targetPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      targetPointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    }

    function handlePointerLeave() {
      targetPointer.set(0, 0)
    }

    function renderFrame() {
      const now = performance.now()
      const delta = Math.min((now - lastFrameTime) / 1000, 0.035)
      const elapsed = (now - startTime) / 1000
      lastFrameTime = now

      pointer.lerp(targetPointer, 0.04)
      root.rotation.y = pointer.x * 0.055 + Math.sin(elapsed * 0.18) * 0.022
      root.rotation.x = -pointer.y * 0.035
      orbitGroup.rotation.z = elapsed * 0.05
      orbitGroup.rotation.y = elapsed * 0.09
      particles.rotation.y = elapsed * 0.018
      particles.rotation.z = Math.sin(elapsed * 0.16) * 0.025

      objects.forEach((object, index) => {
        const data = object.userData
        object.position.y -= data.speed * delta
        object.position.x += Math.sin(elapsed * data.drift + data.seed) * delta * 0.22
        object.position.z += Math.cos(elapsed * data.wobble + data.seed) * delta * 0.035

        if (data.kind === 'bill') {
          object.rotation.x += delta * (0.55 + index * 0.002)
          object.rotation.y += delta * (0.82 + data.drift * 0.12)
          object.rotation.z = Math.sin(elapsed * data.wobble + data.seed) * 0.48
        } else {
          object.rotation.y += delta * (2.7 + data.drift)
          object.rotation.z += delta * 0.65
        }

        if (object.position.y < -viewport.height * 0.62) resetObject(object, 0.4)
      })

      renderer.render(scene, camera)
      animationFrame = window.requestAnimationFrame(renderFrame)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()
    mount.addEventListener('pointermove', handlePointerMove)
    mount.addEventListener('pointerleave', handlePointerLeave)

    if (prefersReducedMotion) {
      renderer.render(scene, camera)
    } else {
      renderFrame()
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      mount.removeEventListener('pointermove', handlePointerMove)
      mount.removeEventListener('pointerleave', handlePointerLeave)
      disposeScene(scene)
      billTexture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [variant, density])

  return (
    <div
      ref={mountRef}
      className={`money-atmosphere ${contained ? 'money-atmosphere--contained' : 'money-atmosphere--fixed'} money-atmosphere--${variant}`}
      aria-hidden="true"
    />
  )
}
