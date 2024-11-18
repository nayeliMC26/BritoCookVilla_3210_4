import * as THREE from 'three';
import SceneManager from '/src/core/SceneManager.js';
import Renderer from '/src/core/Renderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from "three/examples/jsm/libs/stats.module.js";

/* Main class which handles animating the scene */
class Main {
    constructor() {
        this.sceneManager = new SceneManager();
        this.renderer = new Renderer();
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        this.animate = this.animate.bind(this);
        this.animate();

        this.controls = new OrbitControls(this.sceneManager.camera, this.renderer.renderer.domElement);


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
        this.controls.update();

        // this.controls.update();
        requestAnimationFrame(this.animate);
        this.sceneManager.update(time / 1000);
        this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
        this.stats.end()
    }
}

var game = new Main();
