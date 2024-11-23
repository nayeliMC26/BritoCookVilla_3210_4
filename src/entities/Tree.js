import * as THREE from "three";
import Block from "../world/Block";

class Tree {
    constructor(
        position,
        blockSize,
        iterations,
        angle,
        grammarType,
        stochastic = false
    ) {
        this.position = position;
        this.blockSize = blockSize;
        this.iterations = iterations;
        this.angle = angle;
        this.axiom = "F";
        this.stochastic = stochastic;

        this.block = new Block(this.blockSize);

        // Define grammars with probabilities for stochastic behavior
        this.grammars = {
            1: {
                F: [
                    { rule: "FF[+F][-F]", probability: 0.8 },
                    { rule: "F[+F][-F]F", probability: 0.2 }
                ],
            },
            2: {
                F: [
                    { rule: "F[+F][-F]F", probability: 0.7 },
                    { rule: "FF[+F][-F]", probability: 0.3 }
                ],
            },
            3: {
                F: [
                    { rule: "FF[+F][-F]", probability: 1.0 } // Single deterministic rule
                ],
            }
        };

        // Get the rules for the selected grammar type
        this.rules = this.grammars[grammarType];

        // Create instanced meshes for trunk and leaves
        this.trunkMesh = this.block.getInstancedMesh(
            "spruce",
            this.calculateMaxInstances()
        );
        this.leafMesh = this.block.getInstancedMesh(
            "leaves",
            this.calculateMaxInstances()
        );

        this.trunkMesh.castShadow = true;
        this.trunkMesh.receiveShadow = true;
        this.leafMesh.castShadow = true;
        this.leafMesh.receiveShadow = true;

        this.trunkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.leafMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh = new THREE.Group();
        this.mesh.add(this.trunkMesh);
        this.mesh.add(this.leafMesh);

        this.generateTree();
    }

    /**
     * Calculate an upper bound for the number of instances needed
     */
    calculateMaxInstances() {
        return Math.pow(2, this.iterations) * 20; // A rough estimate
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
                    const possibleRules = this.rules[char];

                    // Stochastic selection based on probability
                    if (this.stochastic) {
                        const random = Math.random();
                        let cumulativeProbability = 0;

                        // Choose a rule based on cumulative probability
                        for (let ruleEntry of possibleRules) {
                            cumulativeProbability += ruleEntry.probability;
                            if (random < cumulativeProbability) {
                                nextResult += ruleEntry.rule;
                                break;
                            }
                        }
                    } else {
                        // Default behavior (deterministic)
                        nextResult += possibleRules[0].rule;
                    }
                } else {
                    nextResult += char; // No rule for this character
                }
            }
            result = nextResult;
        }
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

        let trunkIndex = 0;
        let leafIndex = 0;

        // Iterate over the L-System string and generate the tree structure
        for (let char of axiom) {
            if (char === "F") {
                // Move forward, placing an instanced block for the trunk
                position.add(direction.clone().multiplyScalar(this.blockSize));
                const matrix = new THREE.Matrix4().setPosition(
                    position.x + this.position.x,
                    position.y + this.position.y,
                    position.z + this.position.z
                );
                this.trunkMesh.setMatrixAt(trunkIndex++, matrix);
            } else if (char === "+") {
                // Turn right
                direction.applyAxisAngle(
                    new THREE.Vector3(0, 0, 1),
                    this.angle
                );
            } else if (char === "-") {
                // Turn left
                direction.applyAxisAngle(
                    new THREE.Vector3(0, 0, 1),
                    -this.angle
                );
            } else if (char === "[") {
                // Save the current position and direction
                positionStack.push(position.clone());
                directionStack.push(direction.clone());

                // Apply an upward tilt when branching
                direction.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    this.angle
                );
            } else if (char === "]") {
                // Restore the saved position and direction
                position = positionStack.pop();
                direction = directionStack.pop();

                // Apply a downward tilt to restore the original direction
                direction.applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    -this.angle
                );
            }
        }

        // Add leaves at the top
        leafIndex = this.addBunchyLeaves(position, leafIndex);

        // Update instance matrices
        this.trunkMesh.instanceMatrix.needsUpdate = true;
        this.leafMesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Add bunchy leaves at the given position
     */
    addBunchyLeaves(position, leafIndex) {
        const numberOfLeaves = 70;
        const leafRadius = this.blockSize * 5;

        for (let i = 0; i < numberOfLeaves; i++) {
            const offset = new THREE.Vector3(
                Math.random() * leafRadius - leafRadius / 2,
                Math.random() * leafRadius - leafRadius / 2,
                Math.random() * leafRadius - leafRadius / 2
            );
            const matrix = new THREE.Matrix4().setPosition(
                position.x + this.position.x + offset.x,
                position.y + this.position.y + offset.y + this.blockSize * 2,
                position.z + this.position.z + offset.z
            );
            this.leafMesh.setMatrixAt(leafIndex++, matrix);
        }
        return leafIndex;
    }

    /**
     * Add tree mesh to the scene
     */
    addToScene(scene) {
        scene.add(this.trunkMesh);
        scene.add(this.leafMesh);
    }
}

export default Tree;
