import * as THREE from 'three';

export default class ColorMerger {

    constructor() {
        this.color = new THREE.Color();
    }


    colorChange(oldCol, newCol, percentage) {
        this.color.r = oldCol.r + ((newCol.r - oldCol.r) * percentage);
        this.color.g = oldCol.g + ((newCol.g - oldCol.g) * percentage);
        this.color.b = oldCol.b + ((newCol.b - oldCol.b) * percentage);
        return this.color;
    }

}
