import * as THREE from "three";
import SceneManager from "/src/core/SceneManager.js";
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

        const listener = new THREE.AudioListener();

        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();

        audioLoader.load(
            "public/assets/music/Dee Yan-Key - jazzy bells  (jingle bells).mp3",
            function (buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(true);
                sound.setVolume(0.5);
                sound.play();
            }
        );
    }

    // Animation loop
    animate() {
        const deltaTime = this.clock.getDelta();

        this.sceneManager.update(deltaTime);

        this.sceneManager.renderer.render(
            this.sceneManager.scene,
            this.sceneManager.camera
        );

        this.stats.update();

        requestAnimationFrame(this.animate);
    }
}

new Main();
