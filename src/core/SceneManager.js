import * as THREE from 'three';
import Camera from '/src/core/Camera.js'
/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.cameraModule = new Camera();
        this.camera = this.cameraModule.getCamera();
    }
    // Function to update the scene 
    update(deltaTime) {
    }
}

export default SceneManager;