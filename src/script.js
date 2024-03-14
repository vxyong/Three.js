import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui' //dat-gui 

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl') //Render the 3D graphics

// Scene
const scene = new THREE.Scene()

/*Audio
const listener = new THREE.AudioListener();
camera.add(listener);

const backgroundSound = new THREE.Audio(listener);

audioLoader.load = new THREE.AudioLoader();
audioLoader.load('../sound/Interstellar Main Theme - Hans Zimmer.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});
*/

//Galaxy or Blossom

const parameters = {}
parameters.count = 1000
parameters.size = 0.01
parameters.radius = 100
parameters.branches = 9
parameters.spin = 3
parameters.randomness = 0.1
parameters.randomnessPower = 9
parameters.rotationSpeed = 0.0023;

let geometry = null
let material = null
let points = null

const generateGalaxy = () =>
{
    // Destroy old galaxy
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    //Geometry

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3) //xyz
    //const colors = new Float32Array(parameters.count * 3)

    //const colorInside = new THREE.Color(parameters.insideColor)
    //const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++) {
        //Position
        const i3 = i * 3; //Index for the positions array (x, y, z for each star)
    
        //Calculate the radius for this star from the galaxy center
        const radius = Math.random() * parameters.radius;
    
        //Calculate the spin angle, affecting how far around the galaxy center the star is placed
        const spinAngle = radius * parameters.spin * 100;
    
        //Determine the branch (spiral arm) the star belongs to and its angle within that branch
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        
        //Random offsets for x, y, z to add variability to star positions, making the galaxy appear more natural
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
    
        //Calculate final position for this star within the galaxy
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX; // x-coordinate
        positions[i3 + 1] = randomY; // y-coordinate
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ; // z-coordinate  
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    //geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    //Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.NoBlending,
        //vertexColors: true
        color: 0xffffff
    })

    //Points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(- 5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'rotationSpeed').min(-0.01).max(0.01).step(0.0001).name('Rotation Speed');


generateGalaxy()

//Sizes//
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

// Camara
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 4
camera.position.z = 0
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

//Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Animate

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // 은하 회전 업데이트
    if(points !== null) {
        points.rotation.y += parameters.rotationSpeed;
    }

    // Render the current scene from the perspective of the camera
    renderer.render(scene, camera);

    // Request the next frame of the animation, creating a loop
    window.requestAnimationFrame(tick);
}


tick()