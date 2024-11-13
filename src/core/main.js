import * as THREE from 'three';
import SceneManager from '/src/core/SceneManager.js';
import Renderer from '/src/core/Renderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/* Main class which handles animating the scene */
class Main {
    constructor() {
        // Create a new scene manager
        this.sceneManager = new SceneManager();
        // Create a new renderer
        this.renderer = new Renderer();
        // Create a clock to handle delta time 
        this.clock = new THREE.Clock();
        // Bind the animation loop 
        this.animate = this.animate.bind(this);
        this.animate();

        this.controls = new OrbitControls(this.sceneManager.camera, this.renderer.renderer.domElement);
        // Basic object to add to the scene to ensure everything is working correctly

    }

    // Animation loop 
    animate(time) {
        // this.controls.update();
        requestAnimationFrame(this.animate);
        var deltaTime = this.clock.getDelta();
        this.sceneManager.update(time / 1000);
        this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    }
}

var game = new Main();
