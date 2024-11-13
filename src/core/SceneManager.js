import * as THREE from 'three';
import Camera from '/src/core/Camera.js'
import Sun from '../entities/Sun';
/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.cameraModule = new Camera();
        this.camera = this.cameraModule.getCamera();

        const geometry = new THREE.PlaneGeometry(500, 500);
        const material = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotateX(Math.PI / 2)
        this.scene.add(plane);
        this.sun = new Sun(this.scene);
        // Day Color -> 0xB9EBFF
        // Night Color -> 0x001A38

        this.geometry = new THREE.SphereGeometry(500, 32, 32);
        this.material = new THREE.MeshBasicMaterial({ color: 0xB9EBFF, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.mesh);
        const gridHelper = new THREE.GridHelper(100, 10);
        this.scene.add(gridHelper);

    }
    // Function to update the scene 
    update(deltaTime) {
        // console.log(this.sun.mesh.position);
        this.sun.rotate(deltaTime);
        // this.sun.updateColor(deltaTime);
    }

    add(object) {
        this.scene.add(object);
    }
}

export default SceneManager;