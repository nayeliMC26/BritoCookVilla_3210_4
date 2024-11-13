import * as THREE from 'three';
import Camera from '/src/core/Camera.js'
import Player from '../entities/Player';
/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.cameraModule = new Camera();
        this.camera = this.cameraModule.getCamera();
        // Create the player and it to the scene
        this.player = new Player(this.scene, this.camera);
    }
    // Function to update the scene 
    update(deltaTime) {
    }
}

export default SceneManager;