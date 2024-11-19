import * as THREE from "three";
import Block from "../world/Block";

class Tree {
    constructor(position, blockSize, iterations, angle, grammarType) {
        this.position = position;
        this.blockSize = blockSize; // Reduce block size to make trees shorter
        this.iterations = iterations;
        this.angle = angle;
        this.axiom = "F";
        this.block = new Block(this.blockSize);

        // Define the grammars
        this.grammars = {
            1: { F: "FF[+F][-F]" }, // Deterministic grammar
            2: { // Stochastic grammar 1
                F: () => (Math.random() < 0.5 ? "F[+F]F[-F]F" : "F[-F]F[+F]F")
            },
            3: { // Stochastic grammar 2
                F: () => {
                    const rules = ["FF[+F][-F]", "F[+F]", "F[-F]"];
                    return rules[Math.floor(Math.random() * rules.length)];
                }
            }
        };

        this.rules = this.grammars[grammarType];
        this.trunkGroup = new THREE.Group();
        this.leafGroup = new THREE.Group();

        this.generateTree();
    }

    /**
     * Function to generate the L-System string
     */
    generateLSystem() {
        let result = this.axiom;
        for (let i = 0; i < this.iterations; i++) {
            let nextResult = "";
            for (let char of result) {
                if (this.rules[char]) {
                    const rule = this.rules[char];
                    nextResult += typeof rule === "function" ? rule() : rule;
                } else {
                    nextResult += char;
                }
            }
            result = nextResult;
        }
        console.log(result);
        return result;
    }

    /**
     * Function to create the tree based on the L-System string
     */
    generateTree() {
        const positionStack = [];
        const directionStack = [];

        let position = new THREE.Vector3(0, 0, 0); // Starting position
        let direction = new THREE.Vector3(0, 1, 0); // Initial direction (upwards)

        const axiom = this.generateLSystem();

        // Iterate over the L-System string and generate the tree structure
        for (let char of axiom) {
            if (char === "F") {
                // Move forward, placing a block at the new position for the trunk
                position.add(direction.clone().multiplyScalar(this.blockSize));
                const trunkMesh = this.block.getMesh("spruce");
                trunkMesh.castShadow = true;
                trunkMesh.receiveShadow = true;
                trunkMesh.position.set(
                    position.x + this.position.x,
                    position.y + this.position.y,
                    position.z + this.position.z
                );
                this.trunkGroup.add(trunkMesh);
            } else if (char === "+") {
                // Turn right
                direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.angle);
            } else if (char === "-") {
                // Turn left
                direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), -this.angle);
            } else if (char === "[") {
                // Save the current position and direction
                positionStack.push(position.clone());
                directionStack.push(direction.clone());

                // Apply an upward tilt when branching
                direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.angle);
            } else if (char === "]") {
                // Restore the saved position and direction
                position = positionStack.pop();
                direction = directionStack.pop();

                // Apply a downward tilt to restore the original direction
                direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), -this.angle);
            }
        }

        // Add leaves at the top
        this.addBunchyLeaves(position);
    }

    /**
     * Add bunchy leaves at the given position
     */
    addBunchyLeaves(position) {
        const numberOfLeaves = 10;
        const leafRadius = this.blockSize * 3;

        for (let i = 0; i < numberOfLeaves; i++) {
            const offset = new THREE.Vector3(
                Math.random() * leafRadius - leafRadius / 2,
                Math.random() * leafRadius - leafRadius / 2,
                Math.random() * leafRadius - leafRadius / 2
            );
            const leafMesh = this.block.getMesh("leaves");
            leafMesh.position.set(
                position.x + this.position.x + offset.x,
                position.y + this.position.y + offset.y + this.blockSize*2,
                position.z + this.position.z + offset.z
            );
            this.leafGroup.add(leafMesh);
        }
    }

    /**
     * Add tree mesh to the scene
     */
    addToScene(scene) {
        scene.add(this.trunkGroup);
        scene.add(this.leafGroup);
    }
}

export default Tree;
