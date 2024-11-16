import * as THREE from "three";

export default class Sky {

    constructor(scene, time) {
        this.scene = scene;
        // How much both day + night take
        this.time = time;
        console.log(time);
        // Percentage of time passed
        this.percentage;
        // Parameters for sky geometry
        this.radius, this.geometry, this.material, this.mesh, this.color;
        // List of colors that the sky will go through
        this.pallete = [
            { r: 1, g: 0.655, b: 0 }, // Orange
            { r: 0.4, g: 0.922, b: 1 }, // Light Blue
            { r: 0.933, g: 0.686, b: 0.380 }, // Soft-Orange
            { r: 0.859, g: 0.388, b: 0.533 }, // Soft-Pink
            { r: 0, g: 0, b: 0.015 } // Dark Blue
        ];
        // Making sky
        this.#initSky();
    }

    #initSky() {
        // Starting with the sky colored red
        this.color = new THREE.Color(1, 0, 0);
        this.color = new THREE.Color(0.0, 0.0, 0.015);
        this.color = new THREE.Color(0, 0, 0.1);
        // Making the sky
        this.radius = 500;
        this.geometry = new THREE.BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        this.material = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Adding sky to the scene
        this.scene.add(this.mesh);
    }

    #updateColor() {
        switch (true) {
            case (this.percentage <= .075): // Orange to Light Blue
                var currP = (this.percentage) / .075;
                this.color.r = this.#colorChange(this.pallete[0].r, this.pallete[1].r, currP)
                this.color.g = this.#colorChange(this.pallete[0].g, this.pallete[1].g, currP)
                this.color.b = this.#colorChange(this.pallete[0].b, this.pallete[1].b, currP)
                break;
            case (this.percentage > .425 && this.percentage <= .475): // Light Blue to Soft-Orange
                var currP = (this.percentage - .425) / .05;
                this.color.r = this.#colorChange(this.pallete[1].r, this.pallete[2].r, currP)
                this.color.g = this.#colorChange(this.pallete[1].g, this.pallete[2].g, currP)
                this.color.b = this.#colorChange(this.pallete[1].b, this.pallete[2].b, currP)
                break;
            case (this.percentage > .475 && this.percentage <= .5): // Soft-Orange to Soft-Pink
                var currP = (this.percentage - .475) / .025;
                this.color.r = this.#colorChange(this.pallete[2].r, this.pallete[3].r, currP)
                this.color.g = this.#colorChange(this.pallete[2].g, this.pallete[3].g, currP)
                this.color.b = this.#colorChange(this.pallete[2].b, this.pallete[3].b, currP)
                break;
            case (this.percentage > .5 && this.percentage <= .55): // Soft-Pink to Dark Blue
                var currP = (this.percentage - .5) / .05;
                this.color.r = this.#colorChange(this.pallete[3].r, this.pallete[4].r, currP)
                this.color.g = this.#colorChange(this.pallete[3].g, this.pallete[4].g, currP)
                this.color.b = this.#colorChange(this.pallete[3].b, this.pallete[4].b, currP)
                break;
            case (this.percentage > .95 && this.percentage <= .975): // Dark Blue to Soft-Orange
                var currP = (this.percentage - .95) / .025;
                this.color.r = this.#colorChange(this.pallete[4].r, this.pallete[2].r, currP)
                this.color.g = this.#colorChange(this.pallete[4].g, this.pallete[2].g, currP)
                this.color.b = this.#colorChange(this.pallete[4].b, this.pallete[2].b, currP)
                break;
            case (this.percentage > .975 && this.percentage <= 1): // Soft-Orange to Orange
                var currP = (this.percentage - .975) / .025;
                this.color.r = this.#colorChange(this.pallete[2].r, this.pallete[0].r, currP)
                this.color.g = this.#colorChange(this.pallete[2].g, this.pallete[0].g, currP)
                this.color.b = this.#colorChange(this.pallete[2].b, this.pallete[0].b, currP)
                break;
        }
        this.material.color.set(this.color);
    }

    #colorChange(oldCol, newCol, percentage) {
        return oldCol + ((newCol - oldCol) * percentage);
    }

    update(time) {
        if (isNaN(time)) return;
        this.percentage = (time % this.time) / this.time;
        this.#updateColor();
    }
}
