import * as THREE from 'three';
import Camera from '/src/core/Camera.js'
import Sun from '../entities/Sun';
import Moon from '../entities/Moon';
/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.cameraModule = new Camera();
        this.camera = this.cameraModule.getCamera();

        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
        this.scene.add(this.ambientLight);

        const geometry = new THREE.PlaneGeometry(500, 500);
        const material = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true;
        plane.rotateX(Math.PI / 2)
        this.scene.add(plane);

        this.sun = new Sun(this.scene, this.ambientLight);
        this.moon = new Moon(this.scene, this.ambientLight);

        const gridHelper = new THREE.GridHelper(150, 15);
        this.scene.add(gridHelper);
    }
    // Function to update the scene 
    update(deltaTime) {
        this.sun.animate(deltaTime);
        this.moon.animate(deltaTime);
    }

    add(object) {
        this.scene.add(object);
    }
}

export default SceneManager;