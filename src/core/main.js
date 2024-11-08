import * as THREE from 'three';
import SceneManager from '/src/core/SceneManager.js';
import Renderer from '/src/core/Renderer.js';
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

        // Basic object to add to the scene to ensure everything is working correctly
        this.sphereGeo = new THREE.SphereGeometry(5, 32, 32);
        this.sphereMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this.sphere = new THREE.Mesh(this.sphereGeo, this.sphereMat);
        this.sceneManager.scene.add(this.sphere);
    }

    // Animation loop 
    animate() {
        requestAnimationFrame(this.animate);
        var deltaTime = this.clock.getDelta();  
        this.sceneManager.update(deltaTime);
        this.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    }
}

var game = new Main();
