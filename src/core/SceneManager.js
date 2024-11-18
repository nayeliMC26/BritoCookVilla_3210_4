import * as THREE from "three";
import Camera from "/src/core/Camera.js";
import Sun from "../entities/Sun";
import Moon from "../entities/Moon";
import Terrain from "/src/world/Terrain.js";
import Tree from "../entities/Tree";

/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        // Create new scene
        this.scene = new THREE.Scene();
        // Create new camera
        this.cameraModule = new Camera();
        this.camera = this.cameraModule.getCamera();

        //  Ambient light to control the light color mixture
        this.worldAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.worldAmbientLight);

        // Ambient light to control sun or moon light color
        this.colorAmbientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.colorAmbientLight);

        // Sun and Moon objects / lighting 
        this.sun = new Sun(this.scene, this.colorAmbientLight);
        this.moon = new Moon(this.scene, this.colorAmbientLight);
        
        // Create the terrain
        this.terrain = new Terrain({
            size: 3000,
            blockSize: 10,
            maxHeight: 10,
            resolution: 10,
            color: 0x368933,
        });
        this.terrain.addToScene(this.scene);

        // Add trees to random locations
        const blockArray = this.terrain.getBlockLocations();
        for (let i = 0; i < blockArray.length; i++) {
            const [x, y, z] = blockArray[i];

            // Check if the top side is exposed
            const exposedSides = this.terrain.getExposedSides(x, y, z);
            if (exposedSides.top) {
                // Add a small probability for tree spawning
                if (Math.random() < 0.01) {
                    // Adjust the probability as needed
                    const tree = new Tree(
                        new THREE.Vector3(x, y + this.terrain.blockSize, z), // Position the tree above the block
                        10, // Tree height
                        2, // Tree width
                        Math.PI / 2 // Tree rotation
                    );
                    tree.addToScene(this.scene);
                }
            }
        }

        // Create the lighting
        this.lighting = new Lighting();
        this.lighting.addToScene(this.scene);

    }

    // Function to update the scene
    update(deltaTime) {
        this.terrain.update();
        // Update sun and moon positions
        this.sun.animate(deltaTime);
        this.moon.animate(deltaTime);
    }
}

export default SceneManager;
