import * as THREE from 'three';

export default class Sky {

    constructor(scene, renderer, time, width) {
        this.scene = scene;
        this.renderer = renderer;
        // How much both day + night take
        this.time = time;
        // Width of the world
        this.width = width;
        // Percentage of time passed
        this.percentage = 0;
        // List of colors that the sky will go through
        this.palette = [
            { r: 1, g: 0.655, b: 0 }, // Orange
            { r: 0.4, g: 0.922, b: 1 }, // Light Blue
            { r: 0.933, g: 0.686, b: 0.380 }, // Soft-Orange
            { r: 0.859, g: 0.388, b: 0.533 }, // Soft-Pink
            { r: 0, g: 0, b: 0.015 } // Dark Blue
        ];
        this.color = new THREE.Color(1, 1, 1);
        // The amount of snowflakes 
        this.snowFlakeAmount = 1000;
        this.snowflakeTextures = [
            './textures/snowflake1.png',
            './textures/snowflake2.png',
            './textures/snowflake3.png',
            './textures/snowflake4.png',
            './textures/snowflake5.png',
            './textures/snowflake6.png',
            './textures/snowflake7.png',
            './textures/snowflake8.png'
        ];
        // Making Snow
        this.#initSnow();
    }

    #initSnow() {
        // Getting random x, y, z in [-this.radius, this.radius] 
        var textureLoader = new THREE.TextureLoader();
        var textures = this.snowflakeTextures.map(texturePath => textureLoader.load(texturePath));

        // Array to store snowflakes (each one will be a THREE.Points object)
        this.snowflakes = [];

        for (let i = 0; i < this.snowFlakeAmount; i++) {
            // Randomly pick a texture for each snowflake
            var texture = textures[Math.floor(Math.random() * textures.length)];
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;

            // Create random x, y, z positions for each snowflake
            const x = (Math.random() - 0.5) * this.width;
            const y = (Math.random() - 0.5) * this.width;
            const z = (Math.random() - 0.5) * this.width;

            // One bufferGeometry for better performace
            var geometry = new THREE.BufferGeometry();
            var positions = new Float32Array([x, y, z]);
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

            // Snow textured point material
            var material = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 4,
                map: texture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                opacity: 0.8
            });

            // Create a Points object for each snowflake and add it to the scene
            var points = new THREE.Points(geometry, material);
            this.snowflakes.push(points);
            this.scene.add(points);
        }
    }

    #updateColor() {
        var currP;
        switch (true) {
            case (this.percentage <= 0.075):
                currP = this.percentage / 0.075;
                this.#colorChange(this.palette[0], this.palette[1], currP);
                break;
            case (this.percentage > 0.425 && this.percentage <= 0.475):
                currP = (this.percentage - 0.425) / 0.05;
                this.#colorChange(this.palette[1], this.palette[2], currP);
                break;
            case (this.percentage > 0.475 && this.percentage <= 0.5):
                currP = (this.percentage - 0.475) / 0.025;
                this.#colorChange(this.palette[2], this.palette[3], currP);
                break;
            case (this.percentage > 0.5 && this.percentage <= 0.55):
                currP = (this.percentage - 0.5) / 0.05;
                this.#colorChange(this.palette[3], this.palette[4], currP);
                break;
            case (this.percentage > 0.95 && this.percentage <= 0.975):
                currP = (this.percentage - 0.95) / 0.025;
                this.#colorChange(this.palette[4], this.palette[2], currP);
                break;
            case (this.percentage > 0.975 && this.percentage <= 1):
                currP = (this.percentage - 0.975) / 0.025;
                this.#colorChange(this.palette[2], this.palette[0], currP);
                break;
        }
        this.renderer.setClearColor(this.color);
    }

    /**
     * Changes color from oldCol to newCol depending on percentage
     * @param {*} oldCol Old color
     * @param {*} newCol New color
     * @param {*} percentage How much along the color change are we
     */
    #colorChange(oldCol, newCol, percentage) {
        this.color.r = oldCol.r + ((newCol.r - oldCol.r) * percentage);
        this.color.g = oldCol.g + ((newCol.g - oldCol.g) * percentage);
        this.color.b = oldCol.b + ((newCol.b - oldCol.b) * percentage);
    }

    animate(deltaTime) {
        if (isNaN(deltaTime)) return;
        // Percentage of time passed for a full "24-hour" cycle
        this.percentage = (this.percentage + deltaTime / this.time) % 1;

        // Snowflake animation adapted from https://github.com/boytchev/etudes/blob/master/threejs/snowing.html
        // List of all vertices
        // Move each snowflake
        for (var i = 0; i < this.snowflakes.length; i++) {
            var snowflake = this.snowflakes[i];
            var positions = snowflake.geometry.attributes.position.array;

            // Move snowflake based on its position and deltaTime
            positions[1] -= 0.2 * Math.cos((i / 150) + (deltaTime / 70)) + 0.6;

            // Recycle snowflakes that fall below ground
            if (positions[1] < -50) {
                positions[0] = (Math.random() - 0.5) * this.width;
                positions[1] = (Math.random() - 0.5) * this.width;
                positions[2] = (Math.random() - 0.5) * this.width;
            }

            // Update snowflake position
            snowflake.geometry.attributes.position.needsUpdate = true;
        }

        // Update sky color
        this.#updateColor();
    }
}
