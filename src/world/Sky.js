// Snowflake animation adapted from https://github.com/boytchev/etudes/blob/master/threejs/snowing.html
import * as THREE from "three";

export default class Sky {

    constructor(scene, time) {
        this.scene = scene;
        // How much both day + night take
        this.time = time;
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
        // The amount of snowflakes 
        this.snowFlakeAmount = 2500;
        // Making sky
        this.#initSky();
        // Making Snow
        this.#initSnow();
    }

    #initSky() {
        // Starting with the sky colored red
        this.color = new THREE.Color(1, 0, 0);
        // Making the sky
        this.radius = 500;
        this.geometry = new THREE.BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        this.material = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    #initSnow() {
        // Getting random x, y, z in [-this.radius, this.radius] 
        var vertices = [];
        for (var i = 0; i < this.snowFlakeAmount; i++) {
            const x = (Math.random() - 0.5) * this.radius;
            const y = (Math.random() - 0.5) * this.radius;
            const z = (Math.random() - 0.5) * this.radius;
            vertices.push(x, y, z);
        }
        // One bufferGeometry for better performace
        this.snowflakes = new THREE.BufferGeometry();
        this.snowflakes.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        // Snow textured point material
        var material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2.5,
            map: new THREE.TextureLoader().load('/textures/snowFlake.png'),
        });
        this.snow = new THREE.Points(this.snowflakes, material);
        this.scene.add(this.snow);
    }

    #updateColor() {
        switch (true) {
            case (this.percentage <= .075): // Orange to Light Blue
                var currP = (this.percentage) / .075;
                this.#colorChange(this.pallete[0], this.pallete[1], currP)
                break;
            case (this.percentage > .425 && this.percentage <= .475): // Light Blue to Soft-Orange
                var currP = (this.percentage - .425) / .05;
                this.#colorChange(this.pallete[1], this.pallete[2], currP)
                break;
            case (this.percentage > .475 && this.percentage <= .5): // Soft-Orange to Soft-Pink
                var currP = (this.percentage - .475) / .025;
                this.#colorChange(this.pallete[2], this.pallete[3], currP)
                break;
            case (this.percentage > .5 && this.percentage <= .55): // Soft-Pink to Dark Blue
                var currP = (this.percentage - .5) / .05;
                this.#colorChange(this.pallete[3], this.pallete[4], currP)
                break;
            case (this.percentage > .95 && this.percentage <= .975): // Dark Blue to Soft-Orange
                var currP = (this.percentage - .95) / .025;
                this.#colorChange(this.pallete[4], this.pallete[2], currP)
                break;
            case (this.percentage > .975 && this.percentage <= 1): // Soft-Orange to Orange
                var currP = (this.percentage - .975) / .025;
                this.#colorChange(this.pallete[2], this.pallete[0], currP)
                break;
        }
        this.material.color.set(this.color);
    }

    /**
     * Changes color from oldCol to newCol depending on percentage
     * @param {*} oldCol Old color
     * @param {*} newCol New color
     * @param {*} percentage How much along the color change are we
     */
    #colorChange(oldCol, newCol, percentage) {
        this.color.r = oldCol.r + ((newCol.r - oldCol.r) * percentage)
        this.color.g = oldCol.g + ((newCol.g - oldCol.g) * percentage)
        this.color.b = oldCol.b + ((newCol.b - oldCol.b) * percentage)
    }

    animate(time) {
        if (isNaN(time)) return;
        // Perctange of time pass for a full "24-hour" cycle
        this.percentage = (time % this.time) / this.time;

        // Snowflake animation adapted from https://github.com/boytchev/etudes/blob/master/threejs/snowing.html
        // List of all vertices
        const vertices = this.snowflakes.attributes.position.array;
        // Move each snowflake
        for (var i = 0; i < this.snowFlakeAmount * 3; i += 3) {
            // move down a snowflake
            vertices[i] += 0.1 * Math.sin(i / 30 + time / 40); // X axis
            vertices[i + 1] -= 0.1 * Math.cos(i / 150 + time / 70) + 0.2; // Y axis
            vertices[i + 2] += 0.1 * Math.cos(i / 50 + time / 20); // Z axis

            // Recycle after it falls under the ground
            if (vertices[i + 1] < -50) {
                vertices[i] = (Math.random() - 0.5) * 2 * this.radius;
                vertices[i + 1] = (Math.random() - 0.5) * 2 * this.radius;
                vertices[i + 2] = (Math.random() - 0.5) * 2 * this.radius;
            }
        }
        // Updating the snowflake location
        this.snowflakes.getAttribute('position').needsUpdate = true
        // Updating sky color
        this.#updateColor();
    }
}