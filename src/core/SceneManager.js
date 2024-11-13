import * as THREE from 'three';
import Camera from '/src/core/Camera.js'
import Terrain from '/src/world/Terrain.js';
import Lighting from '/src/world/Lighting.js'
import Player from '../entities/Player';

/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        // Create new scene
        this.scene = new THREE.Scene();
        // Create new camera 
        this.cameraModule = new Camera();
        this.camera = this.cameraModule.getCamera();
        // Create the terrain
        this.terrain = new Terrain({ size: 3000, blockSize: 10, maxHeight: 10, resolution: 100, color: 0x368933 });
        this.terrain.addToScene(this.scene);
        // Create the lighting 
        this.lighting = new Lighting();
        this.lighting.addToScene(this.scene);
      
        // Create the player 
        this.player = new Player(this.scene, this.camera);
    }
    // Function to update the scene 
    update(deltaTime) {
    }
}

export default SceneManager;