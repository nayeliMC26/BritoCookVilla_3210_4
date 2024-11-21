import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
class Player {
    /**
     * A function to construct a player
     * @param {THREE.Scene} scene 
     * @param {THREE.Camera} camera 
     * @param {Object} terrain 
     */
    constructor(scene, camera, terrain) {
        this.scene = scene;
        this.camera = camera;
        this.terrain = terrain;
        // Height of the player, 2 blocks tall for a block size of 10
        this.height = 20; 
        // i get impatient 
        this.speed = 90; 
        this.velocity = new THREE.Vector3(); 
        // Creating a player mesh for debugging and temporary visualization
        const geometry = new THREE.BoxGeometry(this.height / 2, this.height, this.height / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.playerMesh = new THREE.Mesh(geometry, material);
        // Add mesh to the scene
        this.scene.add(this.playerMesh);
        // Position should be relative to the height of the ground the player is on
        this.position = new THREE.Vector3(0, this.terrain.getHeightAt(this.playerMesh.position.x, this.playerMesh.position.z) + (this.height / 2), 0);
        this.playerMesh.position.copy(this.position);

        this.controls = new PointerLockControls(this.camera, document.body);  // Attach controls to the camera
        this.scene.add(this.controls.object);  

        // Flags for movement
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        // Can be tweaked, for now this works
        this.mouseSensitivity = 0.002;

        // Debug mode to make sure the player mesh is spawning in correctly 
        this.debugMode = false;
        // Caemera offset for debug mode
        this.cameraOffset = new THREE.Vector3(0, 20, -30); 

        this.keyboardControls();
    }
    /**
     * A function to handle keyboard events
     * 
     */
    keyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'Space':
                    if (this.isGrounded) this.isJumping = true; // Only jump if grounded
                    break;
                case 'KeyT':
                    // Toggling debug mode
                    this.debugMode = !this.debugMode;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                    this.moveRight = false;
                    break;
                case 'Space':
                    this.isJumping = false;
                    break;
            }
        });

        // Request pointer lock when the user clicks
        document.body.addEventListener('click', () => {
            if (!this.mouseLookEnabled) {
                this.requestPointerLock();
            }
        });
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    }

    requestPointerLock() {
        this.controls.lock();  // Lock the pointer
    }

    onPointerLockChange() {
        this.mouseLookEnabled = document.pointerLockElement === document.body;
    }

    /**
     * A function to continuously update the player's movement and animation
     * @param {number} deltaTime 
     */
    update(deltaTime) {

        // Update camera position based on debug mode
        if (this.debugMode) {
            this.camera.position.set(
                this.position.x + this.cameraOffset.x,
                this.position.y + this.cameraOffset.y,
                this.position.z + this.cameraOffset.z
            );
            this.camera.lookAt(this.position);
        } else {
            this.camera.position.set(this.position.x, this.position.y + this.height / 2, this.position.z);
        }
    }
}

export default Player;
