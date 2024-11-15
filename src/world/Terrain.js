import * as THREE from "three";
import Perlin from "/src/utils/perlin.js";
import Block from "./Block";

class Terrain {
    constructor({ size, maxHeight, resolution, blockSize, color } = {}) {
        this.size = size;
        this.maxHeight = maxHeight;
        this.resolution = resolution;
        this.blockSize = blockSize;
        this.color = color;
        this.perlin = new Perlin();
        this.block = new Block(this.blockSize);

        // Create instanced meshes for each block type
        this.dirtMesh = this.block.getInstancedMesh(
            "dirt",
            this.resolution ** 2 * this.maxHeight
        );
        this.grassMesh = this.block.getInstancedMesh(
            "grass",
            this.resolution ** 2 * this.maxHeight
        );
        this.stoneMesh = this.block.getInstancedMesh(
            "stone",
            this.resolution ** 2 * this.maxHeight
        );

        this.stoneMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.dirtMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        this.initTerrain();
    }

    /**
     * Function to generate the terrain using Perlin noise
     */
    initTerrain() {
        const center = (this.resolution * this.blockSize) / 2;
        let stoneIndex = 0;
        let dirtIndex = 0;
        let grassIndex = 0;

        for (let x = 0; x < this.resolution; x++) {
            for (let z = 0; z < this.resolution; z++) {
                const blockX = x * this.blockSize - center;
                const blockZ = z * this.blockSize - center;

                // Calculate noise-based height
                const normalizedX = (blockX / this.size) * 2 - 1;
                const normalizedZ = (blockZ / this.size) * 2 - 1;
                let noiseValue = this.perlin.noise(
                    normalizedX * 10,
                    normalizedZ * 10
                );
                noiseValue = this.smoothTerrain(x, z, noiseValue);
                const terrainHeight = Math.round(
                    Math.abs(noiseValue * this.maxHeight)
                );
                const height = Math.max(
                    0,
                    Math.min(terrainHeight, this.maxHeight)
                );

                // Create the base layer at y = 0
                const matrix = new THREE.Matrix4();
                matrix.setPosition(blockX, 0, blockZ);
                this.stoneMesh.setMatrixAt(stoneIndex++, matrix);

                // Create additional layers based on height
                for (let y = 1; y <= height; y++) {
                    matrix.setPosition(blockX, y * this.blockSize, blockZ);
                    const blockType = this.getBlockType(y);

                    if (blockType === "stone") {
                        this.stoneMesh.setMatrixAt(stoneIndex++, matrix);
                    } else if (blockType === "dirt") {
                        this.dirtMesh.setMatrixAt(dirtIndex++, matrix);
                    } else if (blockType === "grass") {
                        this.grassMesh.setMatrixAt(grassIndex++, matrix);
                    }
                }
            }
        }

        // Update the instance matrices
        this.stoneMesh.instanceMatrix.needsUpdate = true;
        this.dirtMesh.instanceMatrix.needsUpdate = true;
        this.grassMesh.instanceMatrix.needsUpdate = true;

        // Create a group to hold all instanced meshes
        this.mesh = new THREE.Group();
        this.mesh.add(this.stoneMesh);
        this.mesh.add(this.dirtMesh);
        this.mesh.add(this.grassMesh);
    }

    /**
     * Smooth terrain function remains the same
     */
    smoothTerrain(currentX, currentZ, currentHeight) {
        const smoothingRadius = 1;
        let totalNoise = currentHeight;
        let neighborCount = 0;

        for (
            let offsetX = -smoothingRadius;
            offsetX <= smoothingRadius;
            offsetX++
        ) {
            for (
                let offsetZ = -smoothingRadius;
                offsetZ <= smoothingRadius;
                offsetZ++
            ) {
                if (offsetX === 0 && offsetZ === 0) continue;
                const neighborX = currentX + offsetX;
                const neighborZ = currentZ + offsetZ;
                if (
                    neighborX >= 0 &&
                    neighborZ >= 0 &&
                    neighborX < this.resolution &&
                    neighborZ < this.resolution
                ) {
                    const normalizedNeighborX =
                        (neighborX / (this.size / 2)) * 2 - 1;
                    const normalizedNeighborZ =
                        (neighborZ / (this.size / 2)) * 2 - 1;
                    const neighborNoise = this.perlin.noise(
                        normalizedNeighborX * 4,
                        normalizedNeighborZ * 4
                    );
                    totalNoise += neighborNoise;
                    neighborCount++;
                }
            }
        }

        return totalNoise / (neighborCount + 1);
    }

    /**
     * Determine block type based on height
     */
    getBlockType(height) {
        if (height < 2) {
            return "stone";
        } else if (height < 4) {
            return "dirt";
        } else {
            return "grass";
        }
    }

    /**
     * Add terrain mesh to the scene
     */
    addToScene(scene) {
        scene.add(this.mesh);
    }
}

export default Terrain;
