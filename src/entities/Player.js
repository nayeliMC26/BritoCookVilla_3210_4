import * as THREE from 'three';
// This is part of how we will be getting rid of the cursor on the screen and making it a locked dot in the center
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

class Player {
    /**
     * A function to construct a player
     * @param {THREE.Scene} scene 
     * @param {THREE.Camera} camera
     */
    constructor(scene, camera) {
        /**
         * player position would be according to the highest block at the origin (0,0,0), so we would be accessing the matrix locations (?)
         * we'd be setting the camera position to two blocks above whatever that point is bc player height is two blocks 
         * then we would just be making sure every time the player moves, their position is two blocks above whichever point in the grid they are on
         * since the terrain is randomly generated the player position has to be relative it can't be predetermined else we run the risk of spawning above or below land
         * rather than above it
         */

        scene.add(camera)
        this.controls = new PointerLockControls(camera, document.body);

    }

    /**
     * A function to handle keyDown events
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {

    }
    /**
     * A function to handle keyUp events
     * @param {KeyboardEvent} event 
     */
    onKeyUp(event) {

    }
}
export default Player;