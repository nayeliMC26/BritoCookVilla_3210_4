import * as THREE from "three";

export default class Sun {

    constructor(scene, light) {
        this.scene = scene;
        // Ambinet light
        this.ambientLight = light;
        // Parameters for sun geometry
        this.radius, this.geometry, this.material, this.mesh, this.color;
        // Angles used for rotation
        this.sunRise, this.sunSet, this.currentA;
        // How long the night is
        this.time;
        // Intesity of ambient light
        this.intesity;
        // Percentage of day time
        this.percentage;
        // Making sun
        this.#initSun();
    }

    #initSun() {
        // Starting with the sun colored red
        this.color = new THREE.Color(1, 0, 0);
        // Making the Sun
        this.radius = 5;
        this.geometry = new THREE.BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        this.material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Positionning the sun
        this.mesh.position.set(100, 0, 0);
        // Rotating it so that it starts below the horizon
        this.sunRise = Math.asin(-this.radius / (this.mesh.position.x - 10)); // Starting angle
        this.currentA = this.sunRise;
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(this.sunRise);
        this.mesh.applyMatrix4(rotationMatrix);
        // Total angles traveled form the beginning 
        this.sunSet = Math.atan2(this.mesh.position.y, -this.mesh.position.x) - this.sunRise + (2 * Math.PI);
        // Toatal angles traveled divided by 15 times 10
        this.time = (this.sunSet / 0.261799) * 10

        // Max ambient light intesity
        this.intesity = this.ambientLight.intensity;
        // Sun light (half intensity to not overide ambinet light too much)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, this.intesity / 2);
        this.directionalLight.castShadow = true;
        // Binding the light to the sun
        this.mesh.add(this.directionalLight)

        // Adding sun to the scene
        this.scene.add(this.mesh);
    }

    #updateColor() {
        switch (true) {
            case (this.percentage <= .15): // Red to Orange
                this.color.g = 0.655 * (this.percentage / .15);
                break;
            case (this.percentage > .15 && this.percentage <= .25): // Orange to White
                this.color.g = 0.655 + (0.345 * ((this.percentage - .15) / .10));
                this.color.b = (this.percentage - .15) / .10;
                break;
            case (this.percentage > .75 && this.percentage <= .85): // White to Soft-Orange
                this.color.r = 1 - (0.067 * ((this.percentage - .75) / .10));
                this.color.g = 1 - (0.314 * ((this.percentage - .75) / .10));
                this.color.b = 1 - (0.620 * ((this.percentage - .75) / .10));
                break;
            case (this.percentage > .85 && this.percentage <= 1): // Soft-Orange to Purple
                this.color.r = 0.933 - (0.517 * ((this.percentage - .85) / .15));
                this.color.g = 0.686 - (0.635 * ((this.percentage - .85) / .15));
                this.color.b = 0.380 - (-0.134 * ((this.percentage - .85) / .15));
                break;
            case (this.percentage > 1.5): // Reseting color at some point past the day time
                this.color.set(1, 0, 0);
                break
        }
        // Only change ambient light when its day time
        if (this.percentage <= 1) this.ambientLight.color.set(this.color);
        this.directionalLight.color.set(this.color);
        this.material.color.set(this.color);
    }

    #updateIntensity() {
        switch (true) {
            case (this.percentage <= .05): // Increase the light early
                this.directionalLight.visible = true;
                this.ambientLight.intensity = (this.intesity / 2) + ((this.intesity / 2) * (this.percentage / .05));
                break;

            case (this.percentage > .95 && this.percentage <= 1): // Decreasing the light late
                this.ambientLight.intensity = this.intesity - ((this.intesity / 2) * ((this.percentage - .95) / .05));
                break;
            case (this.percentage > 1): // Sun light is invisible after day time
                console.log(this.ambientLight.intensity);
                this.directionalLight.visible = false;
                break;
        }
    }

    animate(time) {
        if (isNaN(time)) return;
        // the angle that were going to rotate the sun by
        var angle = this.sunRise + ((this.sunSet / this.time) * (time % (this.time * 2)));
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle - this.currentA);
        this.percentage = (angle - this.sunRise) / this.sunSet;
        // Move the sun as long as its day time and a little more
        if (this.percentage <= 1.5) {
            this.mesh.applyMatrix4(rotationMatrix);
            this.currentA = angle;
        }

        this.#updateColor();
        this.#updateIntensity();
    }
}
