import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
import boxVertexShader from './shaders/box/vertex.glsl'
import boxFragmentShader from './shaders/box/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
// const axesHelper = new THREE.AxesHelper()
// axesHelper.position.y += 0.25
// scene.add(axesHelper)

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)
waterGeometry.deleteAttribute('normal')
waterGeometry.deleteAttribute('uv')

// Colors
debugObject.depthColor = '#ff4000'
debugObject.surfaceColor = '#151c37'

gui.addColor(debugObject, 'depthColor').onChange(() => { 
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
    boxMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
})
gui.addColor(debugObject, 'surfaceColor').onChange(() => { 
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
    boxMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
})

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms:
    {
        uTime: { value: 0 },
        
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.925 },
        uColorMultiplier: { value: 1 }
    }
})

gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')

gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations')

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

/**
 * Box
 */
const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
const boxMaterial = new THREE.ShaderMaterial({
    vertexShader: boxVertexShader,
    fragmentShader: boxFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#8b4513') },
        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) }
    }
})
const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box)

// Lights (needed for StandardMaterial)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

/**
 * Wave Height Calculation
 */
const getWaveHeight = (x, z, time) => {
    const elevation = Math.sin(x * waterMaterial.uniforms.uBigWavesFrequency.value.x + time * waterMaterial.uniforms.uBigWavesSpeed.value) *
                      Math.sin(z * waterMaterial.uniforms.uBigWavesFrequency.value.y + time * waterMaterial.uniforms.uBigWavesSpeed.value) *
                      waterMaterial.uniforms.uBigWavesElevation.value;
    return elevation;
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Water
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Box
    boxMaterial.uniforms.uTime.value = elapsedTime

    // Update Box
    const boxX = 0.0
    const boxZ = 0.0
    const elevation = getWaveHeight(boxX, boxZ, elapsedTime)
    box.position.set(boxX, elevation - 0.03, boxZ) // Sunk by 0.03 units
    
    // Tilt the box (approximation using derivatives)
    const shift = 0.01
    const elevationX = getWaveHeight(boxX + shift, boxZ, elapsedTime)
    const elevationZ = getWaveHeight(boxX, boxZ + shift, elapsedTime)
    
    // Calculate normal (simplified)
    const vectorX = new THREE.Vector3(shift, elevationX - elevation, 0).normalize()
    const vectorZ = new THREE.Vector3(0, elevationZ - elevation, shift).normalize()
    const normal = new THREE.Vector3().crossVectors(vectorZ, vectorX).normalize()
    
    // Apply orientation
    const up = new THREE.Vector3(0, 1, 0)
    box.quaternion.setFromUnitVectors(up, normal)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()