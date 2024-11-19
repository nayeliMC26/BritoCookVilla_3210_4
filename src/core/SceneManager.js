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
            resolution: 50,
            color: 0x368933,
        });
        this.terrain.addToScene(this.scene);

        // Generate trees using the three grammars
        const blockArray = this.terrain.getBlockLocations();
        const treeTypes = [1, 2, 3]; // Grammar types

        for (let treeType of treeTypes) {
            var count = 0;
            while (count < 10) {
                // Generate 10 trees per type
                const randomIndex = Math.floor(
                    Math.random() * blockArray.length
                );
                const [x, y, z] = blockArray[randomIndex];

                // Ensure the tree is placed only on blocks with an exposed top
                const exposedSides = this.terrain.getExposedSides(x, y, z);
                if (exposedSides.top) {
                    const tree = new Tree(
                        new THREE.Vector3(x, y + this.terrain.blockSize, z),
                        this.terrain.blockSize,
                        2, // Number of iterations
                        Math.PI / 2, // Angle for branching
                        treeType // Grammar type
                    );
                    tree.addToScene(this.scene);
                    count++;
                }
            }
        }
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
