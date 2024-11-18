import * as THREE from 'three';
class Lighting {
    constructor() {
        /**
         * Overridden by sun and moon
         */
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    }

    addToScene(scene) {
        scene.add(this.ambientLight);
    }
}

export default Lighting;