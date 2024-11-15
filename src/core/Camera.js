import * as THREE from 'three';
/* Class to handle creating the camera and getting the camera */
class Camera {
    constructor() {
        // Create the camera 
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 110);
        this.camera.lookAt(0, 0, 0);
    }

    // Getter function to return the camera so we are not directly editing the camera 
    getCamera() {
        return this.camera;
    }
}

export default Camera;
