import * as THREE from "three";
import Perlin from "/src/utils/perlin.js";
import Block from "./Block";

/**
 * Terrain class to generate and manage the terrain of the game world.
 */
class Terrain {
    constructor({ size, maxHeight, resolution, blockSize } = {}) {
        this.size = size;
        this.maxHeight = maxHeight;
        this.resolution = resolution;
        this.blockSize = blockSize;
        this.perlin = new Perlin();

        this.block = new Block(this.blockSize);
        this.blockLocations = [];
        this.topBlocks = [];

        // Create instanced meshes for each block type
        this.dirtMesh = this.block.getInstancedMesh(
            "dirt",
            (this.resolution ** 2 * this.maxHeight) / 2
        );
        this.grassMesh = this.block.getInstancedMesh(
            "grass",
            (this.resolution ** 2 * this.maxHeight) / 2
        );
        this.stoneMesh = this.block.getInstancedMesh(
            "stone",
            (this.resolution ** 2 * this.maxHeight) / 2
        );

        this.stoneMesh.castShadow = true;
        this.stoneMesh.receiveShadow = true;

        this.dirtMesh.castShadow = true;
        this.dirtMesh.receiveShadow = true;

        this.grassMesh.castShadow = true;
        this.grassMesh.receiveShadow = true;

        this.stoneMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.dirtMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        // Create a group to hold all instanced meshes
        this.mesh = new THREE.Group();
        this.mesh.add(this.stoneMesh);
        this.mesh.add(this.dirtMesh);
        this.mesh.add(this.grassMesh);

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
                this.blockLocations.push([blockX, 0, blockZ]);

                // Create additional layers based on height
                for (let y = 1; y <= height; y++) {
                    matrix.setPosition(blockX, y * this.blockSize, blockZ);
                    this.blockLocations.push([
                        blockX,
                        y * this.blockSize,
                        blockZ,
                    ]);
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


        // Add LOD system
        this.addLOD();

        // Create a Set for quick lookups
        const blockSet = new Set(
            this.blockLocations.map(([x, y, z]) => `${x},${y},${z}`)
        );

        for (let [x, y, z] of this.blockLocations) {
            const aboveKey = `${x},${y + this.blockSize},${z}`;
            if (!blockSet.has(aboveKey)) {
                this.topBlocks.push([x, y, z]);
            }
        }
    }

    /**
     * A function to implement LOD (level of detail) to help with performance
     */
    addLOD() {
        this.lod = new THREE.LOD();

        // Full-detail terrain (close to the camera)
        this.lod.addLevel(this.mesh, 0);

        // Low-detail terrain (further from the camera)
        const lowDetailGeometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            10,
            10
        );
        const lowDetailMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b4513,
        });
        const lowDetailMesh = new THREE.Mesh(
            lowDetailGeometry,
            lowDetailMaterial
        );
        lowDetailMesh.rotation.x = -Math.PI / 2;

        this.lod.addLevel(lowDetailMesh, 3000);

        this.mesh.add(this.lod);
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

    getBlockLocations() {
        return this.blockLocations;
    }

    getTopBlocks() {
        return this.topBlocks;
    }

    /**
     * Add terrain mesh to the scene
     */
    addToScene(scene) {
        // Add fog to the scene for better depth
        scene.fog = new THREE.Fog(0xa0a0a0, 250, 1000); // Set fog near and far distances

        // Enable frustum culling for all meshes
        this.stoneMesh.frustumCulled = true;
        this.dirtMesh.frustumCulled = true;
        this.grassMesh.frustumCulled = true;

        scene.add(this.mesh);
    }

    /**
     * A function to get the height of a block at a specific (x, z)
     * @param {number} x - The x-coordinate in world space.
     * @param {number} z - The z-coordinate in world space.
     * @returns {number} The height of the terrain at the specified position.
     */
    getHeightAt(x, z) {
        // Find the block in the topBlocks array that matches the (x, z) coordinates
        const block = this.topBlocks.find(
            ([blockX, blockY, blockZ]) =>
                Math.abs(blockX - x) < this.blockSize / 2 &&
                Math.abs(blockZ - z) < this.blockSize / 2
        );

        // If a block is found, return its height (y value), otherwise return 0
        return block ? block[1] : 0;
    }
}

export default Terrain;
