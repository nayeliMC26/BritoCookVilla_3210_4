import * as THREE from "three";
import Block from "../world/Block";

class Tree {
  constructor(position, blockSize, iterations, angle) {
    this.position = position;
    this.blockSize = blockSize;
    this.iterations = iterations;
    this.angle = angle;
    this.axiom = "F";
    this.rules = { "F": "FFF[F][-F][-F]" }; // Simple L-System rules for branching
    this.block = new Block(this.blockSize);

    // Create groups to hold the trunk and leaf meshes
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

    let position = new THREE.Vector3(0, 0, 0); // Starting position
    let direction = new THREE.Vector3(0, 1, 0); // Initial direction (upwards)

    const axiom = this.generateLSystem();

    // Iterate over the L-System string and generate the tree structure
    for (let char of axiom) {
      if (char === "F") {
        // Move forward, placing a block at the new position for the trunk
        position.add(direction.clone().multiplyScalar(this.blockSize));
        const trunkMesh = this.block.getMesh("spruce");
        trunkMesh.position.set(
          position.x + this.position.x,
          position.y + this.position.y,
          position.z + this.position.z
        );
        this.trunkGroup.add(trunkMesh);

        // Randomly decide to place leaves at the ends of branches
        if (Math.random() < 0.3) { // Adjust probability as needed
          const leafMesh = this.block.getMesh("leaves");
          leafMesh.position.set(
            position.x + this.position.x,
            position.y + this.position.y,
            position.z + this.position.z
          );
          this.leafGroup.add(leafMesh);
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
