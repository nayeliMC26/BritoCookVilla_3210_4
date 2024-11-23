import * as THREE from 'three';
// A class to handle raycasting logic
class Raycaster {
    constructor(scene, camera, terrain, mouse, player) {
        this.scene = scene;
        this.camera = camera;
        this.terrain = terrain;
        this.mouse = mouse;
        this.player = player;
        this.controls = this.player.controls;

        this.raycaster = new THREE.Raycaster();

        this.currentHighlight = {
            mesh: null,
            instanceId: null,
        };
    }
    /**
     * Method to update the raycasting
     */
    update() {
        // Make sure that the pointerlock is locked before allowing raycasting/highlighting
        if (this.controls.isLocked) {
            // Setting the raycaster from the camera
            this.raycaster.set(this.camera.position, this.camera.getWorldDirection(new THREE.Vector3()));
            // For each of the kinds of meshes (stone, grass, dirt, etc)
            for (var mesh of this.terrain.mesh.children) {
                var intersection = this.raycaster.intersectObject(mesh);
                // If things are being intersected
                if (intersection.length > 0) {
                    // Grab the id of the first object being intersected
                    var instanceId = intersection[0].instanceId;
                    if (instanceId !== undefined) {
                        // If we are casting onto a different block
                        if (this.currentHighlight.mesh !== mesh || this.currentHighlight.instanceId !== instanceId) {
                            // Reset the highlight 
                            this.resetHighlight();
                            // Setting the color of the highlight 
                            var highlightColor = new THREE.Color(0xff0000);
                            mesh.setColorAt(instanceId, highlightColor);
                            mesh.instanceColor.needsUpdate = true;
                            // Update the mesh currently being highlighted
                            this.currentHighlight.mesh = mesh;
                            this.currentHighlight.instanceId = instanceId;
                        }
                    }
                }
            }
        }
    }

    /**
     * A function to reset the highlight so blocks aren't continously being highlighted even when no longer cast upon
     */
    resetHighlight() {
        if (this.currentHighlight.mesh && this.currentHighlight.instanceId !== null) {
            var defaultColor = new THREE.Color();
            this.currentHighlight.mesh.setColorAt(this.currentHighlight.instanceId, defaultColor);
            this.currentHighlight.mesh.instanceColor.needsUpdate = true;

            this.currentHighlight.mesh = null;
            this.currentHighlight.instanceId = null;
        }
    }
}

export default Raycaster;
