import * as THREE from 'three';
import SceneManager from '/src/core/SceneManager.js';
import Stats from "three/examples/jsm/libs/stats.module.js";

/* Main class which handles animating the scene */
class Main {
    constructor() {
        // Initialize SceneManager
        this.sceneManager = new SceneManager();

        // Initialize Stats for performance monitoring
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        // Initialize clock for delta time
        this.clock = new THREE.Clock();

        this.animate = this.animate.bind(this);
        this.animate();
    }

    // Animation loop
    animate(time) {
        const deltaTime = this.clock.getDelta();
        this.sceneManager.update(time / 1000, deltaTime);
        this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
        this.stats.update();
        requestAnimationFrame(this.animate);
    }
}

new Main();
