import * as THREE from 'three';
import Camera from '/src/core/Camera.js'
import Sun from '../entities/Sun';
import Moon from '../entities/Moon';
import Terrain from "/src/world/Terrain.js";
import Lighting from "/src/world/Lighting.js";
import Tree from "../entities/Tree";

/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        // Create new scene
        this.scene = new THREE.Scene();
        // Create new camera 
        this.camera = new Camera();

        //  Ambient light to control the light color mixture
        this.worldAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.worldAmbientLight);

        // Ambient light to control sun or moon light color
        this.colorAmbientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.colorAmbientLight);

        // Sun and Moon objects / lighting 
        this.sun = new Sun(this.scene, this.colorAmbientLight);
        this.moon = new Moon(this.scene, this.colorAmbientLight);
        // Create new camera
        this.cameraModule = new Camera();
        this.camera = this.cameraModule.getCamera();

        // Create the terrain
        this.terrain = new Terrain({
            size: 3000,
            blockSize: 10,
            maxHeight: 10,
            resolution: 50,
            color: 0x368933,
        });
        this.terrain.addToScene(this.scene);

        // Create the player 
        this.player = new Player(this.scene, this.camera);
    

        // Create a test tree
        const tree1 = new Tree(new THREE.Vector3(0, 100, 0), 10, 2, Math.PI/2);
        tree1.addToScene(this.scene);
        // Create the lighting
        this.lighting = new Lighting();
        this.lighting.addToScene(this.scene);

        this.sun = new Sun(this.scene, this.lighting.ambientLight);
        this.moon = new Moon(this.scene, this.lighting.ambientLight);
    }
  
    // Function to update the scene
    update(deltaTime){
        this.terrain.update();
        // Update sun and moon positions
        this.sun.animate(deltaTime);
        this.moon.animate(deltaTime);
    }
}

export default SceneManager;
