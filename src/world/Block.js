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
    getMesh(type, exposedSides = { top: false, bottom: false, right: false, left: false, front: false, back: false }) {

        console.log(exposedSides);

        const block = new THREE.Mesh(this.blockGeometry);

        if (exposedSides.top || exposedSides.bottom || exposedSides.right || exposedSides.left || exposedSides.front || exposedSides.back) {
            const blockMaterials = this.getMaterial(type, exposedSides);
            block.material = blockMaterials;
            block.castShadow = true;
            block.receiveShadow = true;
        } else {
            block.castShadow = false;
            block.receiveShadow = false;
        }

        return block;
    }

    /**
     * Get material for block type based on exposed sides
     */
    getMaterial(type, exposedSides = { top: false, bottom: false, right: false, left: false, front: false, back: false }) {
        let materials = [];

        switch (type) {
            case "grass":
                materials = [
                    exposedSides.right ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : null, // Right
                    exposedSides.left ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Left
                    exposedSides.top ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Top
                    exposedSides.bottom ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }),  // Bottom
                    exposedSides.front ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Front
                    exposedSides.back ? new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 })  // Back
                ];
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
                materials = [
                    exposedSides.right ? new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Right
                    exposedSides.left ? new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Left
                    exposedSides.top ? new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Top
                    exposedSides.bottom ? new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }),  // Bottom
                    exposedSides.front ? new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 }), // Front
                    exposedSides.back ? new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }) : new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 })  // Back
                ];
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
