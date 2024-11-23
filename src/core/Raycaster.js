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
        this.mouseControls();
    }

    /**
     * A function to handle raycasting and highlighting
     * @param {Array} objects - The array of objects to raycast 
     * @param {THREE.Color} highlightColor - The color to use for highlighting
     */
    highlightObjects(objects, highlightColor) {
        for (var mesh of objects) {
            this.mesh = mesh;
            var intersection = this.raycaster.intersectObject(mesh);
            if (intersection.length > 0) {
                this.instanceId = intersection[0].instanceId;
                if (this.instanceId !== undefined) {
                    if (this.currentHighlight.mesh !== mesh || this.currentHighlight.instanceId !== this.instanceId) {
                        this.resetHighlight();
                        mesh.setColorAt(this.instanceId, highlightColor);
                        mesh.instanceColor.needsUpdate = true;
                        this.currentHighlight.mesh = mesh;
                        this.currentHighlight.instanceId = this.instanceId;
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
            this.currentHighlight.mesh.geometry.dispose();

            this.currentHighlight.mesh = null;
            this.currentHighlight.instanceId = null;
        }
    }

    removeObject() {
        if ((this.currentHighlight.mesh === null) && (this.currentHighlight.instanceId === null)) return;
        const mesh = this.currentHighlight.mesh;
        const id = this.currentHighlight.instanceId;
        const matrix = new THREE.Matrix4()
        mesh.getMatrixAt(id, matrix)
        if (matrix.elements[13] > 0) {
            matrix.makeTranslation(0, 0, 0);
            mesh.setMatrixAt(id, matrix);
            mesh.instanceMatrix.needsUpdate = true;
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

    mouseControls() {
        document.body.addEventListener("click", () => {
            if (this.controls.isLocked) {
                this.removeObject()
            }
        });
    }

}

export default Raycaster;
