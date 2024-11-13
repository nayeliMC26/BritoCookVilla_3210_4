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
     * Get instanced mesh for a block type
     */
    getInstancedMesh(type, instanceCount) {
        const material = this.getMaterial(type);
        return new THREE.InstancedMesh(this.blockGeometry, material, instanceCount);
    }

    /**
     * Get material for block type
     */
    getMaterial(type) {
        switch (type) {
            case "grass":
                return Array(6).fill(new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }));
            case "dirt":
                return [
                    new THREE.MeshStandardMaterial({ map: this.materials.sideTexture }), // Right
                    new THREE.MeshStandardMaterial({ map: this.materials.sideTexture }), // Left
                    new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }), // Top
                    new THREE.MeshStandardMaterial({ map: this.materials.snowTexture }),  // Bottom
                    new THREE.MeshStandardMaterial({ map: this.materials.sideTexture }), // Front
                    new THREE.MeshStandardMaterial({ map: this.materials.sideTexture })  // Back
                ];
            case "stone":
                return Array(6).fill(new THREE.MeshStandardMaterial({ map: this.materials.iceTexture }));
            default:
                return Array(6).fill(new THREE.MeshStandardMaterial({ color: 0xffffff }));
        }
    }
}

export default Block;
