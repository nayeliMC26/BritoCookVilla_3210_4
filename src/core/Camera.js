import * as THREE from 'three';
/* Class to handle creating the camera and getting the camera */
class Camera {
    constructor() {
        // Create the camera 
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(0, 250, 500);
        return this.camera;
    }

}

export default Camera;
