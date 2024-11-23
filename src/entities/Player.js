import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

class Player {
    constructor(scene, camera, terrain) {
        this.scene = scene;
        this.camera = camera;
        this.terrain = terrain;
        this.height = 20;
        this.speed = 30;
        this.velocity = new THREE.Vector3();

        this.bobCounter = 0;

        this.playerMesh = new THREE.Group();

        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            colorWrite: false,
            depthWrite: false,
        });
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
        this.scene.add(this.camera); // Add the camera directly to the scene

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
      
        // Calculate terrain dimensions
        var terrainWidth = this.terrain.resolution * this.terrain.blockSize;
        var terrainHeight = this.terrain.maxHeight * this.terrain.blockSize;

        // Calculate the min and max coordinates for the bounding box
        var minCorner = new THREE.Vector3(
            -terrainWidth / 2,
            0,
            -terrainWidth / 2
        );

        var maxCorner = new THREE.Vector3(
            terrainWidth / 2 - 10,
            terrainHeight,
            terrainWidth / 2 - 10
        );

        this.wallBoundingBox = new THREE.Box3(minCorner, maxCorner);

        this.createFlashlight();
        this.keyboardControls();
    }

    createFlashlight() {
        var flashlightMesh = new THREE.Group();
        this.flashlightMesh = flashlightMesh;
        var flashlightBodyGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
        var flashlightHeadGeometry = new THREE.BoxGeometry(2, 1, 2);
        var flashlightMaterial = new THREE.MeshPhongMaterial({
            color: 0x404040,
        });

        var flashlightHead = new THREE.Mesh(
            flashlightHeadGeometry,
            flashlightMaterial
        );
        flashlightHead.position.set(5, -3, -7);
        flashlightHead.rotation.set(0, Math.PI / 2, Math.PI / 2);

        var flashlightBody = new THREE.Mesh(
            flashlightBodyGeometry,
            flashlightMaterial
        );
        flashlightBody.position.set(5, -3, -5);
        flashlightBody.rotation.set(0, Math.PI / 2, Math.PI / 2);

        flashlightMesh.add(flashlightHead);
        flashlightMesh.add(flashlightBody);
        this.camera.add(flashlightMesh);

        this.illumination = new THREE.SpotLight(
            0xfff4bd,
            10000,
            1000,
            Math.PI / 6,
            0.5,
            2
        );
        this.camera.add(this.illumination);
        this.camera.add(this.illumination.target);
        this.illumination.position.set(0, 0, 0);
        this.illumination.target.position.set(0, 0, -1);

        this.illumination.visible = false;
        for (var mesh of this.camera.children) {
            mesh.visible = false;
        }
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
                case "KeyF":
                    console.log("Toggle flashlight"); // Debug log
                    if (this.flashlightMesh.visible) {
                        this.illumination.visible = !this.illumination.visible;
                        console.log(
                            "Flashlight visibility:",
                            this.illumination.visible
                        );
                    }
                    break;
                case "KeyE":
                    for (var mesh of this.camera.children) {
                        mesh.visible = !mesh.visible;
                        console.log(mesh.visible);
                    }
                    this.illumination.visible = false;
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

        this.handleCollision();

        // Update position
        this.position.add(this.velocity);
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
                this.position.copy(this.previousPosition);
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

        // Sync player mesh rotation with the camera's rotation
        this.playerMesh.rotation.y = -this.camera.rotation.z;

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
            this.bobCounter += deltaTime * 10;
            this.camera.position.set(
                this.position.x,
                this.position.y +
                    this.height / 2 +
                    Math.sin(this.bobCounter * 1),
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
