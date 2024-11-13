// Tree.js
import * as THREE from "three";
import Block from "../world/Block";

class Tree {
  constructor(position, blockSize, iterations, angle) {
    this.position = position;
    this.blockSize = blockSize;
    this.iterations = iterations;
    this.angle = angle;
    this.axiom = "F";
    this.rules = { "F": "FF[F][-F]" }; // Simple L-System rules for branching
    this.block = new Block(this.blockSize);

    // Create instanced meshes for the tree blocks
    this.trunkMesh = this.block.getInstancedMesh("spruce", 100);
    this.leafMesh = this.block.getInstancedMesh("leaves", 100);

    this.trunkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.leafMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

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
        nextResult += this.rules[char] || char;
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
    const matrix = new THREE.Matrix4();

    let indexTrunk = 0;
    let indexLeaf = 0;

    let position = new THREE.Vector3(0, 0, 0); // Starting position
    let direction = new THREE.Vector3(0, 1, 0); // Initial direction (upwards)

    const axiom = this.generateLSystem();

    // Iterate over the L-System string and generate the tree structure
    for (let char of axiom) {
      if (char === "F") {
        // Move forward, placing a block at the new position for the trunk
        position.add(direction.clone().multiplyScalar(this.blockSize));
        matrix.setPosition(
          position.x + this.position.x,
          position.y + this.position.y,
          position.z + this.position.z
        );
        this.trunkMesh.setMatrixAt(indexTrunk++, matrix);

        // Randomly decide to place leaves at the ends of branches
        if (Math.random() < 0.3) { // Adjust probability as needed
          matrix.setPosition(
            position.x + this.position.x,
            position.y + this.position.y,
            position.z + this.position.z
          );
          this.leafMesh.setMatrixAt(indexLeaf++, matrix);
        }
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
      } else if (char === "]") {
        // Restore the saved position and direction
        position = positionStack.pop();
        direction = directionStack.pop();
      }
    }

    // Update the instance matrices
    this.trunkMesh.instanceMatrix.needsUpdate = true;
    this.leafMesh.instanceMatrix.needsUpdate = true;
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