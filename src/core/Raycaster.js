import * as THREE from 'three';

class Raycaster {
    constructor(scene, camera, terrain, trees, mouse, player) {
        this.scene = scene;
        this.camera = camera;
        this.terrain = terrain;
        this.trees = trees;
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
     * A function to handle raycasting and highlighting
     * @param {Array} objects - The array of objects to raycast 
     * @param {THREE.Color} highlightColor - The color to use for highlighting
     */
    highlightObjects(objects, highlightColor) {
        for (var mesh of objects) {
            var intersection = this.raycaster.intersectObject(mesh);
            if (intersection.length > 0) {
                var instanceId = intersection[0].instanceId;
                if (instanceId !== undefined) {
                    if (this.currentHighlight.mesh !== mesh || this.currentHighlight.instanceId !== instanceId) {
                        this.resetHighlight();
                        mesh.setColorAt(instanceId, highlightColor);
                        mesh.instanceColor.needsUpdate = true;
                        this.currentHighlight.mesh = mesh;
                        this.currentHighlight.instanceId = instanceId;
                    }
                }
            } else if (this.currentHighlight.mesh === mesh) {
                this.resetHighlight();
            }
        }
    }

    /**
     * A function to reset the highlight so blocks aren't continuously being highlighted even when no longer cast upon
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

    /**
     * Method to update the raycasting
     */
    update() {
        if (this.controls.isLocked) {
            this.raycaster.set(this.camera.position, this.camera.getWorldDirection(new THREE.Vector3()));

            this.highlightObjects(this.terrain.mesh.children, new THREE.Color(0xff0000));
            for (var tree of this.trees) {
                this.highlightObjects(tree.mesh.children, new THREE.Color(0x00ffff));
            }
        }
    }

}

export default Raycaster;
