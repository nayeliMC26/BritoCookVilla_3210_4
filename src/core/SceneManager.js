import * as THREE from 'three';
import Camera from '/src/core/Camera.js'
import Sun from '../entities/Sun';
import Moon from '../entities/Moon';
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
        this.sun.animate(deltaTime);
        this.moon.animate(deltaTime);
    }

    add(object) {
        this.scene.add(object);
    }
}

export default SceneManager;