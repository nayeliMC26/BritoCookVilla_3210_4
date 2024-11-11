import * as THREE from 'three';
class Lighting {
    constructor() {
        /**
         * Temporary lighting until sun/moon cycle is implemented
         */
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.castShadow = true;

    }

    addToScene(scene) {
        scene.add(this.ambientLight);
        scene.add(this.directionalLight);
    }
}

export default Lighting;