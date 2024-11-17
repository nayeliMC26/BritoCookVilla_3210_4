import * as THREE from "three";
import Materials from "./Materials";

class Block {
    constructor(blockSize) {
        this.blockSize = blockSize;
        this.materials = new Materials();
        this.blockGeometry = new THREE.BoxGeometry(
            this.blockSize,
            this.blockSize,
            this.blockSize
        );
    }

    /**
     * Get a regular mesh for a block type with exposed sides
     */
    getMesh(type, exposedSides) {
        // Ensure exposedSides is an object with default values in case it's undefined
        exposedSides = exposedSides || {
            top: false,
            bottom: false,
            right: false,
            left: false,
            front: false,
            back: false
        };

        const materials = this.getMaterial(type, exposedSides);
        const block = new THREE.Mesh(this.blockGeometry, materials);
        block.castShadow = true;
        block.receiveShadow = true;
        return block;
    }

    /**
     * Get material for block type based on exposed sides
     */
    getMaterial(type, exposedSides) {
        let materials = [];

        // Ensure exposedSides is properly set (defaulting to false if undefined)
        exposedSides = exposedSides || {
            top: false,
            bottom: false,
            right: false,
            left: false,
            front: false,
            back: false
        };

        switch (type) {
            case "grass":
                materials = Array(6).fill(new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }));
                break;
            case "dirt":
                materials = [
                    exposedSides.right ? new THREE.MeshStandardMaterial({ map: this.materials.sideTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Right
                    exposedSides.left ? new THREE.MeshStandardMaterial({ map: this.materials.sideTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Left
                    exposedSides.top ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Top
                    exposedSides.bottom ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }),  // Bottom
                    exposedSides.front ? new THREE.MeshStandardMaterial({ map: this.materials.sideTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Front
                    exposedSides.back ? new THREE.MeshStandardMaterial({ map: this.materials.sideTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 })  // Back
                ];
                break;
            case "stone":
                materials = Array(6).fill(new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }));
                break;
            case "spruce":
                materials = [
                    new THREE.MeshStandardMaterial({ map: this.materials.spruceLogTexture }),
                    new THREE.MeshStandardMaterial({ map: this.materials.spruceLogTexture }),
                    new THREE.MeshStandardMaterial({ map: this.materials.spruceTopTexture }),
                    new THREE.MeshStandardMaterial({ map: this.materials.spruceTopTexture }),
                    new THREE.MeshStandardMaterial({ map: this.materials.spruceLogTexture }),
                    new THREE.MeshStandardMaterial({ map: this.materials.spruceLogTexture })
                ];
                break;
            case "leaves":
                materials = Array(6).fill(new THREE.MeshStandardMaterial({ map: this.materials.leavesTexture }));
                break;
            default:
                materials = Array(6).fill(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        }

        return materials;
    }
}

export default Block;
