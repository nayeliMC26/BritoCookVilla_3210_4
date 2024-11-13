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
        this.controls.update();

        this.deltaTime = this.clock.getDelta;

        window.addEventListener('keydown', (event) => this.keydown(event), false);

    }

    keydown(event) {
        switch (event.key.toLowerCase()) {
            case "a":
                this.sceneManager.camera.position.x -= 15
                break;
            case "d":
                this.sceneManager.camera.position.x += 15
                break;
            case "s":
                this.sceneManager.camera.position.z += 15;
                break;
            case "w":
                this.sceneManager.camera.position.z -= 15;
                break;
        }
    }

    // Animation loop 
    animate() {
        this.stats.begin();
        requestAnimationFrame(this.animate);
        var deltaTime = this.clock.getDelta();  
        this.sceneManager.update(deltaTime);
        this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
        this.stats.end();
    }
}

var game = new Main();
