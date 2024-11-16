import * as THREE from 'three';
import SceneManager from '/src/core/SceneManager.js';
import Renderer from '/src/core/Renderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from "three/examples/jsm/libs/stats.module.js";

/* Main class which handles animating the scene */
class Main {
    constructor() {
        // Create a new scene manager
        this.sceneManager = new SceneManager();
        // Create a new renderer
        this.renderer = new Renderer();
        // Create a clock to handle delta time 
        this.clock = new THREE.Clock();
        // New stats object to tradck frame rate 
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);


        // Bind the animation loop 
        this.animate = this.animate.bind(this);
        this.animate();

        this.controls = new OrbitControls(this.sceneManager.camera, this.renderer.renderer.domElement);
    }

    // Animation loop 
    animate(time) {
        this.stats.begin();
        requestAnimationFrame(this.animate);
        this.sceneManager.update(time / 1000);
        this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
        this.stats.end();
    }
}

var game = new Main();
