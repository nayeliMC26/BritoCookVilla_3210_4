import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Group } from "three/examples/jsm/libs/tween.module.js";

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

        this.playerMesh = new THREE.Group();

        const material = new THREE.MeshBasicMaterial({ color: 0x000000, colorWrite: false, depthWrite: false });
        const geo1 = new THREE.BoxGeometry(5, 5, 5);

        this.mesh1 = new THREE.Mesh(geo1, material);
        this.mesh1.position.set(0.75 * 5, 0.5 * 5, 0);
        this.mesh1.scale.set(0.5, 2, 0.5);
        this.mesh1.castShadow = true;
        this.playerMesh.add(this.mesh1);

        this.mesh2 = new THREE.Mesh(geo1, material);
        this.mesh2.position.set(-0.75 * 5, 0.5 * 5, 0);
        this.mesh2.scale.set(0.5, 2, 0.5);
        this.mesh2.castShadow = true;
        this.playerMesh.add(this.mesh2);

        this.mesh3 = new THREE.Mesh(geo1, material);
        this.mesh3.position.set(0.25 * 5, -1 * 5, 0);
        this.mesh3.scale.set(0.5, 2, 0.5);
        this.mesh3.castShadow = true;
        this.playerMesh.add(this.mesh3);

        this.mesh4 = new THREE.Mesh(geo1, material);
        this.mesh4.position.set(-0.25 * 5, -1 * 5, 0);
        this.mesh4.scale.set(0.5, 2, 0.5);
        this.mesh4.castShadow = true;
        this.playerMesh.add(this.mesh4);

        this.mesh5 = new THREE.Mesh(geo1, material);
        this.mesh5.position.set(0, 0.75 * 5, 0);
        this.mesh5.scale.set(1, 1.5, 0.5);
        this.mesh5.castShadow = true;
        this.playerMesh.add(this.mesh5);

        this.mesh6 = new THREE.Mesh(geo1, material);
        this.mesh6.position.set(0, 2 * 5, 0);
        this.mesh6.castShadow = true;
        this.playerMesh.add(this.mesh6);

        this.playerMesh.castShadow = true;

        //this.playerMesh = new THREE.Mesh(geometry, material);
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

        this.playerBoundingBox = new THREE.Box3(); // Bounding box for the player
        this.previousPosition = this.position.clone(); // Store previous position for collision resolution

        this.keyboardControls();
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

    update(deltaTime, boundingBoxes) {
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

        // Predict the next position
        const nextPosition = this.position.clone().add(this.velocity);

        // Ensure player stays on terrain
        nextPosition.y =
            this.terrain.getHeightAt(nextPosition.x, nextPosition.z) +
            this.height;

        // Update player bounding box to the predicted position
        const nextBoundingBox = this.playerBoundingBox.clone();
        nextBoundingBox.setFromCenterAndSize(
            new THREE.Vector3(nextPosition.x, nextPosition.y, nextPosition.z),
            this.playerBoundingBox.getSize(new THREE.Vector3())
        );

        // Check for collisions
        let collisionDetected = false;
        for (const boundingBox of boundingBoxes) {
            if (nextBoundingBox.intersectsBox(boundingBox)) {
                collisionDetected = true;
                break;
            }
        }

        // Update position only if no collision is detected
        if (!collisionDetected) {
            this.previousPosition.copy(this.position); // Store current position
            this.position.copy(nextPosition);
        }

        // Update player mesh position
        this.playerMesh.position.copy(this.position);

        if (this.debugMode) {
            this.camera.position.set(
                this.position.x + this.cameraOffset.x,
                this.position.y + this.cameraOffset.y,
                this.position.z + this.cameraOffset.z
            );
            this.camera.lookAt(this.position);
        } else if (
            this.moveForward ||
            this.moveBackward ||
            this.moveLeft ||
            this.moveRight
        ) {
            this.camera.position.set(
                this.position.x,
                this.position.y + this.height / 2 + (Math.random() > 0.9),
                this.position.z
            );
        } else {
            this.camera.position.set(
                this.position.x,
                this.position.y + this.height / 2,
                this.position.z
            );
        }

        // Update bounding box for rendering/debugging
        this.playerBoundingBox.setFromObject(this.playerMesh);
    }
}

export default Player;
