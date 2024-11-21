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

        // Helper function to compare arrays by value
        function isPositionInArray(position, array) {
            return array.some(
                ([ax, ay, az]) =>
                    ax === position[0] &&
                    ay === position[1] &&
                    az === position[2]
            );
        }

        // Create array to store tree locations
        this.treeLocation = [];

        // Generate trees using the three grammars
        const blockArray = this.terrain.getBlockLocations();
        const topBlocks = this.terrain.getTopBlocks(); // Pre-fetch top blocks
        const treeTypes = [1, 2, 3]; // Grammar types

        for (let treeType of treeTypes) {
            let count = 0;
            while (count < 10) {
                // Generate 10 trees per type
                const randomIndex = Math.floor(
                    Math.random() * blockArray.length
                );
                const [x, y, z] = blockArray[randomIndex];

                // Ensure the tree is placed only on blocks with an exposed top
                if (isPositionInArray([x, y, z], topBlocks)) {
                    if (treeType < 3) {
                        const tree = new Tree(
                            new THREE.Vector3(x, y, z),
                            this.terrain.blockSize,
                            2, // Number of iterations
                            Math.PI / 2, // Angle for branching
                            treeType, // Grammar type
                            true
                        );
                        tree.addToScene(this.scene);
                    } else {
                        const tree = new Tree(
                            new THREE.Vector3(x, y, z),
                            this.terrain.blockSize,
                            2, // Number of iterations
                            Math.PI / 2, // Angle for branching
                            treeType // Grammar type
                        );
                        tree.addToScene(this.scene);
                    }
                    
                    count++;
                }
            }
        }
    }

    // Function to update the scene
    update(deltaTime) {
        // Update the terrain to only display visible blocks

        // Update sun and moon positions
        this.sun.animate(deltaTime);
        this.moon.animate(deltaTime);
    }
}

export default SceneManager;
