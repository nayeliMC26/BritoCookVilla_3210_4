import * as THREE from 'three';
import SceneManager from '/src/core/SceneManager.js';
import Renderer from '/src/core/Renderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from "three/examples/jsm/libs/stats.module.js";

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
    }

    keydown(event) {
        switch (event.key.toLowerCase()) {
            case "a":
                this.sceneManager.camera.position.x -= 15;
                break;
            case "d":
                this.sceneManager.camera.position.x += 15;
                break;
            case "s":
                this.sceneManager.camera.position.z += 15;
                break;
            case "w":
                this.sceneManager.camera.position.z -= 15;
                break;
        }
    }

    animate(time) {
        requestAnimationFrame(this.animate);
        var deltaTime = this.clock.getDelta();
        this.sceneManager.update(deltaTime); // Call update
        this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
        this.stats.update();
    }
}

var game = new Main();
