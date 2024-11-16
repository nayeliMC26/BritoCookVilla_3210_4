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
        this.percentage = 0;
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
        // Positioning the sun
        this.mesh.position.set(500, 0, 0);
        // Rotating it so that it starts below the horizon
        this.sunRise = Math.asin(-this.radius / (this.mesh.position.x - 10)); // Starting angle
        this.currentA = this.sunRise;
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(this.sunRise);
        this.mesh.applyMatrix4(rotationMatrix);
        // Total angles traveled form the beginning to end 
        this.sunSet = Math.atan2(this.mesh.position.y, -this.mesh.position.x) - this.sunRise + (2 * Math.PI);
        // How much a rotation should take for 15 degrees every 10 seconds
        this.time = (this.sunSet / 0.261799) * 1

        // Max ambient light intesity
        this.intesity = this.ambientLight.intensity;
        // Sun light (half intensity to not overide ambinet light)
        this.directionalLight = new THREE.DirectionalLight(0x606060, this.intesity / 2);
        this.directionalLight.castShadow = true;
        // Binding the light to the sun
        this.mesh.add(this.directionalLight)

        // Adding sun to the scene
        this.scene.add(this.mesh);
    }

    #updateColor() {
        switch (true) {
            case (this.percentage <= .10): // Red to Orange
                this.color.g = 0.655 * (this.percentage / .10);
                break;
            case (this.percentage > .10 && this.percentage <= .15): // Orange to White
                this.color.g = 0.655 + (0.345 * ((this.percentage - .10) / .05));
                this.color.b = (this.percentage - .10) / .05;
                break;
            case (this.percentage > .85 && this.percentage <= .90): // White to Soft-Orange
                this.color.r = 1 - (0.067 * ((this.percentage - .85) / .05));
                this.color.g = 1 - (0.314 * ((this.percentage - .85) / .05));
                this.color.b = 1 - (0.620 * ((this.percentage - .85) / .05));
                break;
            case (this.percentage > .90 && this.percentage <= 1): // Soft-Orange to Purple
                this.color.r = 0.933 - (0.517 * ((this.percentage - .90) / .10));
                this.color.g = 0.686 - (0.635 * ((this.percentage - .90) / .10));
                this.color.b = 0.380 - (-0.134 * ((this.percentage - .90) / .10));
                break;
            case (this.percentage > 1): // Reseting color as its under the world
                const angle = Math.atan2(this.mesh.position.y, this.mesh.position.x) + (2 * Math.PI)
                const percentage = (angle - this.sunSet) / ((2 * Math.PI) - this.sunSet);
                this.color.r = 0.416 + (0.584 * percentage);
                this.color.g = 0.051 + (-0.051 * percentage);
                this.color.b = 0.514 + (-0.514 * percentage);
                break;
        }
        // Only change ambient light when its day time
        if (this.percentage <= 1) this.ambientLight.color.set(this.color);
        this.directionalLight.color.set(this.color);
        this.material.color.set(this.color);
    }

    #updateIntensity() {
        switch (true) {
            case (this.percentage <= .05): // Increase the light early
                this.ambientLight.intensity = (this.intesity / 2) + ((this.intesity / 2) * (this.percentage / .05));
                break;
            case (this.percentage > .95 && this.percentage <= 1): // Decreasing the light late
                this.ambientLight.intensity = this.intesity - ((this.intesity / 2) * ((this.percentage - .95) / .05));
                break;
        }
    }

    animate(time) {
        if (isNaN(time)) return;
        // The angle that were going to rotate the sun by
        var angle = this.sunRise + ((this.sunSet / this.time) * (time % (this.time * 2)));
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle - this.currentA);
        this.percentage = (angle - this.sunRise) / this.sunSet;
        // Rotate the sun
        this.mesh.applyMatrix4(rotationMatrix);
        this.currentA = angle;

        this.#updateColor();
        this.#updateIntensity();
    }
}
