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
        this.blockLocations = [];
        this.mesh = new THREE.Group(); // Group to hold all the individual meshes
        this.blocks = {}; // Store block meshes by their position for easy access
        this.removedBlocks = new Set(); // Track removed blocks

        this.initTerrain();
    }

    /**
     * Function to generate the terrain using Perlin noise
     */
    initTerrain() {
        const center = (this.resolution * this.blockSize) / 2;

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
                this.createBlock("stone", blockX, 0, blockZ);

                // Create additional layers based on height
                for (let y = 1; y <= height; y++) {
                    const blockType = this.getBlockType(y);
                    this.createBlock(blockType, blockX, y * this.blockSize, blockZ);
                }
            }
        }

        // After all blocks are created, check for exposed sides
        this.updateExposedSides();
    }

    /**
     * Function to create and add a block to the terrain
     */
    createBlock(type, x, y, z) {
        const blockMesh = this.block.getMesh(type, {}); // Initial block without checking exposed sides
        blockMesh.position.set(x, y, z);
        this.blockLocations.push([x, y, z]);
        this.blocks[`${x},${y},${z}`] = blockMesh; // Store the block mesh by its position for easy access
        this.mesh.add(blockMesh); // Add the mesh to the group
    }

    /**
     * Function to check for exposed sides for each block
     */
    getExposedSides(x, y, z) {
        const exposedSides = {
            top: false,
            bottom: false,
            right: false,
            left: false,
            front: false,
            back: false
        };

        // Check if there's a block above
        if (!this.blocks[`${x},${y + this.blockSize},${z}`]) {
            exposedSides.top = true;
        }

        // Check if there's a block below
        if (!this.blocks[`${x},${y - this.blockSize},${z}`]) {
            exposedSides.bottom = true;
        }

        // Check if there's a block to the right
        if (!this.blocks[`${x + this.blockSize},${y},${z}`]) {
            exposedSides.right = true;
        }

        // Check if there's a block to the left
        if (!this.blocks[`${x - this.blockSize},${y},${z}`]) {
            exposedSides.left = true;
        }

        // Check if there's a block in front
        if (!this.blocks[`${x},${y},${z + this.blockSize}`]) {
            exposedSides.front = true;
        }

        // Check if there's a block behind
        if (!this.blocks[`${x},${y},${z - this.blockSize}`]) {
            exposedSides.back = true;
        }

        return exposedSides;
    }

    /**
     * Function to update the exposed sides and apply textures
     */
    updateExposedSides() {
        // Iterate through each block location and update exposed sides
        for (let i = 0; i < this.blockLocations.length; i++) {
            const [x, y, z] = this.blockLocations[i];
            const exposedSides = this.getExposedSides(x, y, z);

            const blockType = this.getBlockType(Math.round(y / this.blockSize));
            const updatedBlockMesh = this.block.getMesh(blockType, exposedSides);

            // Update the position of the existing block mesh (preserving the position)
            updatedBlockMesh.position.set(x, y, z);

            // Replace the old block mesh in the scene
            this.mesh.children[i] = updatedBlockMesh;
            this.blocks[`${x},${y},${z}`] = updatedBlockMesh; // Update the block in the dictionary
        }
    }

    /**
     * Function to remove a block - example generated by chat for sake of texture updates
     * Completely rework this but look at how it interacts with the update below
     */
    removeBlock(x, y, z) {
        const blockKey = `${x},${y},${z}`;
        const blockMesh = this.blocks[blockKey];

        if (blockMesh) {
            this.mesh.remove(blockMesh); // Remove block mesh from the scene
            delete this.blocks[blockKey]; // Remove from the blocks dictionary
            this.blockLocations = this.blockLocations.filter(([bx, by, bz]) => bx !== x || by !== y || bz !== z); // Remove from block locations
            this.removedBlocks.add(blockKey); // Track that the block was removed
        }
    }

    /**
     * Function to update block textures if blocks were removed
     * Example generated by chat essentially if removed, call updateexposed sides
     */
    update() {
        if (this.removedBlocks.size > 0) {
            // If any blocks were removed, update exposed sides of remaining blocks
            this.updateExposedSides();
            this.removedBlocks.clear(); // Reset removed blocks set
        }
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
