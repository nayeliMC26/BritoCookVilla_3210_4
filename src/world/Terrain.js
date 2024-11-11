import * as THREE from 'three';
import Perlin from '/src/utils/perlin.js';
import Block from '/src/world/Block.js';

class Terrain {
    constructor({ size, maxHeight, resolution, blockSize, color } = {}) {
        // Determines how the blocks are being distributed amongst the grid that is determined by the resolution
        this.size = size;
        this.maxHeight = maxHeight;
        // Determins how many blocks are spread out in the X and Z direction
        this.resolution = resolution;
        this.blockSize = blockSize;
        this.color = color;
        this.mesh = null;
        this.blocks = [];

        this.perlin = new Perlin();
        // Terrain creates itself
        this.initTerrain();
    }

    /** 
     * A function to generate the initial terrain using perlin noise and blocks
     */
    initTerrain() {
        // Center the terrain around the middle of the grid 
        var center = (this.resolution * this.blockSize) / 2;
        // The resolution is what's determining the size of the grid (10x10, 50x50, etc)
        for (var x = 0; x < this.resolution; x++) {
            for (var z = 0; z < this.resolution; z++) {
                // The positions of the blocks are centered around half of the terrain size, that way the terrain generates with its center at (0,0,0)
                var blockX = x * this.blockSize - center;
                var blockZ = z * this.blockSize - center;
                // Create a base layer at y = 0 in case there are any gaps in the terrain
                this.createBaseLayer(blockX, blockZ);
                // Normalize the block coordinates for perlin noise 
                var normalizedX = (blockX / this.size) * 2 - 1;
                var normalizedZ = (blockZ / this.size) * 2 - 1;
                // Noise value determined using Perlin noise util, then smoothed out using smoothing functiun
                var noiseValue = this.perlin.noise(normalizedX * 10, normalizedZ * 10);
                noiseValue = this.smoothTerrain(x, z, noiseValue);
                // The height of the terrain is determined by the max height of the smoothed terrain 
                var terrainHeight = Math.round(noiseValue * this.maxHeight);
                terrainHeight = Math.max(0, Math.min(terrainHeight, this.maxHeight));
                // Creates the blocks that form the terrain
                this.createTerrainBlocks(blockX, blockZ, terrainHeight);
            }
        }
        // Add all of the blocks into a group which will be the mesh of the terrain
        var group = new THREE.Group();
        this.blocks.forEach(block => {
            group.add(block.mesh);
        });

        group.position.set(0, 0, 0);
        this.mesh = group;
    }

    /**
     * A function to create the base layer block at y = 0 to prevent gaps in the terrain
     * @param {number} blockX - The x-coordinate of the base block
     * @param {number} blockZ - The z-coordinate of the base block
     */
    createBaseLayer(blockX, blockZ) {
        // The base layer will be stone as that is currently the farthest down block type we have 
        var baseLayerBlock = new Block({
            positionX: blockX,
            positionY: 0,
            positionZ: blockZ,
            blockType: 'stone',
            blockSize: this.blockSize,
        });
        // Add the base layer to the aray of blocks
        this.blocks.push(baseLayerBlock);
    }

    /**
     * A function to smooth the terrain by averaging the current block's noise value 
     * with the noise values of its neighboring blocks
     * 
     * @param {number} currentX - The x-coordinate of the current block being smoothed
     * @param {number} currentZ - The z-coordinate of the current block being smoothed
     * @param {number} currentHeight - The current height of the block
     * 
     * @returns {number} - The smoothed noise value after averaging with neighboring blocks
     */

    smoothTerrain(currentX, currentZ, currentHeight) {
        // Smoothing radius determinse the radius of blocks that will be compared
        var smoothingRadius = 1;
        // The height of the current block
        var totalNoise = currentHeight;
        // COunt how many blocks are being checked at the current point in the loop
        var neighborCount = 0;
        // Block offset determines which blocks we are checking against without needing to explicitly give the block's position
        //Nested for-loop to go through the 3x3 grid of surrounding blocks
        for (var offsetX = -smoothingRadius; offsetX <= smoothingRadius; offsetX++) {
            for (var offsetZ = -smoothingRadius; offsetZ <= smoothingRadius; offsetZ++) {
                // The center block does not neeed to be smoothed 
                if (offsetX === 0 && offsetZ === 0) continue;
                // Gives us the neighboring blocks position based off of the offset from the center block of the grid
                var neighborX = currentX + offsetX;
                var neighborZ = currentZ + offsetZ;
                // Make sure this neighbor exists within the bounds of the terrain(not outside the edges)
                if (neighborX >= 0 && neighborZ >= 0 && neighborX < this.resolution && neighborZ < this.resolution) {
                    // Normalize the coordinates for perlin noise 
                    var normalizedNeighborX = (neighborX / (this.size / 2)) * 2 - 1;
                    var normalizedNeighborZ = (neighborZ / (this.size / 2)) * 2 - 1;
                    // Get the new noise value for the neighboring blocks 
                    var neighborNoise = this.perlin.noise(normalizedNeighborX * 4, normalizedNeighborZ * 4);
                    // The total noise is incremented by the amt of noise from each neighbor
                    totalNoise += neighborNoise;
                    neighborCount++;
                }
            }
        }
        // Distribute the total noise amongst all neighbors including the current block that was beign checked
        return totalNoise / (neighborCount + 1);
    }

    /**
     * A function to create the block meshes that make up the terrain and push them to an array of blocks
     * @param {number} posX - The x-coordinate of the block's position in the terrain
     * @param {number} posZ - The z-coordinate of the block's position in the terrain
     * @param {number} height - The height at which the block should be placed in the terrain
     */
    createTerrainBlocks(posX, posZ, height) {
        // A base layer already exists at y=0, we do not want to create duplicate blocks so we start at y=1
        for (var y = 1; y <= height; y++) {
            // The block type is determined by its y-coordinate
            var blockType = this.getBlockType(y);
            // Create new block object from y = 1 to the max height
            var block = new Block({
                positionX: posX,
                // Make sure that the height difference between each block is at least one block
                positionY: y * this.blockSize,
                positionZ: posZ,
                blockType: blockType,
                blockSize: this.blockSize,
            });
            // Add each block object to the array of blocks
            this.blocks.push(block);
        }
    }

    /**
     * A function that determines the block type based on height.
     * For example, higher up you might have grass, lower down dirt or stone, etc.
     * @param {number} height - The y-coordinate (height) of the block
     * @returns {string} - The block type (stone, grass, dirt, etc.)
     */
    getBlockType(height) {
        // If the height is below two layers then it is stone
        if (height < 2) {
            return 'stone';
            // If the height is between 2 and 4 then it is dirt
        } else if (height < 4) {
            return 'dirt';
            // Otherwise its above layer 4 and is grass 
        } else {
            return 'grass';
        }
    }


    /**
     * A function which adds the mesh of the terrain to the scene 
     * 
     * @param {THREE.Scene} scene - The Three.js scene where the terrain mesh will be added.
     * 
     */
    addToScene(scene) {
            scene.add(this.mesh);
    }
}

export default Terrain;
