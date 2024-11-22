import * as THREE from 'three';
import Sun from '../entities/Sun';
import Moon from '../entities/Moon';
import Terrain from '/src/world/Terrain.js';
import Player from '../entities/Player';
import Tree from '../entities/Tree';

/* Class to handle creating the scene and updating it */
class SceneManager {
    constructor() {
        // Create new scene
        this.scene = new THREE.Scene();

        // Initialize the clock for delta time calculations
        this.clock = new THREE.Clock();

        // Create new renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x272727);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.localClippingEnabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Create new camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.set(0, 50, 200);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        //  Ambient light to control the light color mixture
        this.worldAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.worldAmbientLight);

        // Ambient light to control sun or moon light color
        this.colorAmbientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.colorAmbientLight);

        // Sun and Moon objects / lighting
        this.sun = new Sun(this.scene, this.colorAmbientLight);
        this.moon = new Moon(this.scene, this.colorAmbientLight);

        // Create the terrain using a timeout method to not stall loading 
        setTimeout(() => {
            this.terrain = new Terrain({
                size: 3000,
                blockSize: 10,
                maxHeight: 10,
                resolution: 100,
            });
            this.terrain.addToScene(this.scene);

            // Create player and add it to the scene
            this.player = new Player(this.scene, this.camera, this.terrain);

            this.addTrees();
        }, 100); // Delay terrain generation by 100ms to avoid blocking initial scene load

        // Handle window resizing
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    /**
     * Handle window resizing to maintain aspect ratio.
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix(); // Update projection matrix
        this.renderer.setSize(window.innerWidth, window.innerHeight); // Update renderer size
    }


    /**
     * Add trees to the terrain after terrain is ready.
     */
    addTrees() {
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
            while (count < 20) {
                // Generate 10 trees per type
                const randomIndex = Math.floor(Math.random() * blockArray.length);
                const [x, y, z] = blockArray[randomIndex];

                // Ensure the tree is placed only on blocks with an exposed top
                if (isPositionInArray([x, y, z], topBlocks) && !this.treeLocation.includes([x, y, z]) && y != 0 && y != 10) {
                    if (treeType < 3) {
                        const tree = new Tree(
                            new THREE.Vector3(x, y, z),
                            this.terrain.blockSize,
                            2, // Number of iterations
                            Math.PI / 2, // Angle for branching
                            treeType, // Grammar type
                            true
                        );
                        this.treeLocation.push([x, y, z]);
                        tree.addToScene(this.scene);
                    } else {
                        const tree = new Tree(
                            new THREE.Vector3(x, y, z),
                            this.terrain.blockSize,
                            2, // Number of iterations
                            Math.PI / 2, // Angle for branching
                            treeType // Grammar type
                        );
                        this.treeLocation.push([x, y, z]);
                        tree.addToScene(this.scene);
                    }
                    
                    count++;
                }
            }
        }
        this.addCrosshair();
    }

    /**
     * Function to update the scene
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        // Player is only added to the scene once the terrain is added
        if (this.player) {
            // Update sun and moon positions
            this.sun.animate(deltaTime);
            this.moon.animate(deltaTime);
            this.player.update(deltaTime);
        }
    }

    /**
     * Render the scene using the camera.
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * A function which adds a simple snowflake crosshair to the screen 
     * Credit to rawpixel.com on Freepik
     * https://www.freepik.com/free-vector/set-snowflakes-christmas-design-vector_3529750.htm#fromView=search&page=1&position=0&uuid=b99359d7-97af-41a7-9335-6be69daef9b5
     */
    addCrosshair() {
        // Create a div for the crosshair
        var crosshair = document.createElement('div');
        crosshair.style.position = 'absolute';
        crosshair.style.top = '50%'; 
        crosshair.style.left = '50%';
        crosshair.style.transform = 'translate(-50%, -50%)';
        crosshair.style.width = '37.5px';  
        crosshair.style.height = '37.5px'; 
        crosshair.style.backgroundImage = 'url(public/assets/textures/Snowflake_Sprite.png)'; 
        crosshair.style.backgroundSize = 'contain'; 
        crosshair.style.backgroundRepeat = 'no-repeat'; 
        crosshair.style.pointerEvents = 'none'; 

        document.body.appendChild(crosshair);
    }
}

export default SceneManager;
