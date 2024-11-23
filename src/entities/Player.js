import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

class Player {
    constructor(scene, camera, terrain) {
        this.scene = scene;
        this.camera = camera;
        this.terrain = terrain;
        this.height = 15;
        this.speed = 30;
        this.velocity = new THREE.Vector3();
        const geometry = new THREE.BoxGeometry(
            this.height / 2,
            this.height,
            this.height / 2
        );
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.playerMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.playerMesh);

        this.position = new THREE.Vector3(
            0,
            this.terrain.getHeightAt(
                this.playerMesh.position.x,
                this.playerMesh.position.z
            ) + this.height,
            0
        );
        this.playerMesh.position.copy(this.position);

        this.controls = new PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.object);

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.mouseSensitivity = 0.002;

        this.debugMode = false;
        this.cameraOffset = new THREE.Vector3(0, 20, -30);

        this.time = 0;

        this.keyboardControls();

        // Calculate terrain dimensions
        var terrainWidth = this.terrain.resolution * this.terrain.blockSize; 
        var terrainHeight = this.terrain.maxHeight * this.terrain.blockSize; 

        // Calculate the min and max coordinates for the bounding box
        var minCorner = new THREE.Vector3((-terrainWidth / 2), 0, (-terrainWidth / 2));

        var maxCorner = new THREE.Vector3((terrainWidth / 2), terrainHeight, (terrainWidth / 2));

        this.wallBoundingBox = new THREE.Box3(minCorner, maxCorner);

        // Visualize the bounding box for debugging
        this.boundingBoxHelper = new THREE.Box3Helper(this.wallBoundingBox, 0xff0000);
        this.scene.add(this.boundingBoxHelper);

    }

    keyboardControls() {
        document.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "KeyW":
                    this.moveForward = true;
                    break;
                case "KeyS":
                    this.moveBackward = true;
                    break;
                case "KeyA":
                    this.moveLeft = true;
                    break;
                case "KeyD":
                    this.moveRight = true;
                    break;
                case "Space":
                    if (this.isGrounded) this.isJumping = true;
                    break;
                case "KeyT":
                    this.debugMode = !this.debugMode;
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.code) {
                case "KeyW":
                    this.moveForward = false;
                    break;
                case "KeyS":
                    this.moveBackward = false;
                    break;
                case "KeyA":
                    this.moveLeft = false;
                    break;
                case "KeyD":
                    this.moveRight = false;
                    break;
                case "Space":
                    this.isJumping = false;
                    break;
            }
        });

        document.body.addEventListener("click", () => {
            if (!this.mouseLookEnabled) {
                this.requestPointerLock();
            }
        });

        document.addEventListener(
            "pointerlockchange",
            this.onPointerLockChange.bind(this)
        );
    }

    requestPointerLock() {
        this.controls.lock();
    }

    onPointerLockChange() {
        this.mouseLookEnabled = document.pointerLockElement === document.body;
    }

    handleCollision() {
        if (!this.wallBoundingBox.containsPoint(this.position)) {
            this.position.x = THREE.MathUtils.clamp(
                this.position.x,
                this.wallBoundingBox.min.x,
                this.wallBoundingBox.max.x
            );
            this.position.y = THREE.MathUtils.clamp(
                this.position.y,
                this.wallBoundingBox.min.y,
                this.wallBoundingBox.max.y
            );
            this.position.z = THREE.MathUtils.clamp(
                this.position.z,
                this.wallBoundingBox.min.z,
                this.wallBoundingBox.max.z
            );
        }
    }

    update(time) {
        const deltaTime = time - this.time;
        this.time = time;

        const moveSpeed = this.speed * deltaTime;
        this.velocity.set(0, 0, 0);

        // Calculate movement direction
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.camera.getWorldDirection(forward); // Forward direction
        forward.y = 0; // Prevent flying up or down
        forward.normalize();

        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize(); // Right direction

        if (this.moveForward) {
            this.velocity.add(forward);
        }
        if (this.moveBackward) {
            this.velocity.add(forward.negate());
        }
        if (this.moveLeft) {
            this.velocity.add(right.negate());
        }
        if (this.moveRight) {
            this.velocity.add(right);
        }

        this.velocity.normalize().multiplyScalar(moveSpeed);

        this.handleCollision();

        // Update position
        this.position.add(this.velocity);

        // Ensure player stays on terrain
        this.position.y = this.terrain.getHeightAt(
            this.position.x,
            this.position.z
        ) + this.height;

        this.playerMesh.position.copy(this.position);

        if (this.debugMode) {
            this.camera.position.set(
                this.position.x + this.cameraOffset.x,
                this.position.y + this.cameraOffset.y,
                this.position.z + this.cameraOffset.z
            );
            this.camera.lookAt(this.position);
        } else {
            this.camera.position.set(
                this.position.x,
                this.position.y + this.height / 2,
                this.position.z
            );
        }
    }
}

export default Player;
