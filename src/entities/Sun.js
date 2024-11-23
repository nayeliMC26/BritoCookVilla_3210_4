import * as THREE from "three";
import ColorMerger from '../utils/ColorMerger';

export default class Sun {
    constructor(scene, light) {
        this.scene = scene;
        this.ambientLight = light;
        // Parameters for sun geometry
        this.radius, this.geometry, this.material, this.mesh, this.color;
        this.colorMerger = new ColorMerger();
        this.palette = [
            { r: 1, g: 0, b: 0 }, // Red
            { r: 1, g: 0.655, b: 0 }, // Orange
            { r: 1, g: 1, b: 1 }, // White
            { r: 0.933, g: 0.686, b: 0.380 }, // Soft-Orange
            { r: 0.416, g: 0.051, b: 0.514 }, // Purple
        ];
        // Angles used for rotation
        this.sunRise, this.sunSet, this.currentA;
        // How long the night is
        this.time;
        // Intensity of ambient light
        this.intensity;
        // Percentage of day time
        this.percentage = 0;
        // Making sun
        this.#initSun();
    }

    #initSun() {
        // Starting with the sun colored red
        this.color = new THREE.Color(1, 0, 0);
        // Making the Sun
        this.radius = 100;
        this.geometry = new THREE.BoxGeometry(
            this.radius * 2,
            this.radius * 2,
            this.radius * 2
        );
        this.material = new THREE.MeshBasicMaterial({ color: this.color, fog: false });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Positionning the sun
        this.mesh.position.set(2500, 0, 0);
        // Rotating it so that it starts below the horizon
        this.sunRise = Math.asin(-this.radius / (this.mesh.position.x - 10)); // Starting angle
        this.currentA = this.sunRise;
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(this.sunRise);
        this.mesh.applyMatrix4(rotationMatrix);
        // Total angles traveled form the beginning to end 
        this.sunSet = Math.atan2(this.mesh.position.y, -this.mesh.position.x) - this.sunRise + (2 * Math.PI);
        // How much a rotation should take for 15 degrees every 10 seconds
        this.time = (this.sunSet / 0.261799) * 10;

        // Max ambient light intensity
        this.intensity = this.ambientLight.intensity;
        // Sun light (half intensity to not overide ambinet light)
        this.directionalLight = new THREE.DirectionalLight(0x606060, this.intensity / 2);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048; // Higher values = better shadow quality
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5; // Adjust the near plane
        this.directionalLight.shadow.camera.far = 10000; // Adjust the far plane
        this.directionalLight.shadow.camera.left = -500;
        this.directionalLight.shadow.camera.right = 500;
        this.directionalLight.shadow.camera.top = 500;
        this.directionalLight.shadow.camera.bottom = -500;
        // Binding the light to the sun
        this.mesh.add(this.directionalLight);

        // Adding sun to the scene
        this.scene.add(this.mesh);
    }

    #updateColor() {
        var currP;
        // Adjust the sun's color based on the time of day
        if (this.percentage <= 0.10) {
            currP = this.percentage / 0.10;
            this.color = this.colorMerger.colorChange(this.palette[0], this.palette[1], currP);
        } else if (this.percentage > 0.10 && this.percentage <= 0.15) {
            currP = (this.percentage - 0.10) / 0.05;
            this.color = this.colorMerger.colorChange(this.palette[1], this.palette[2], currP);
        } else if (this.percentage > 0.85 && this.percentage <= 0.90) {
            currP = (this.percentage - 0.85) / 0.05;
            this.color = this.colorMerger.colorChange(this.palette[2], this.palette[3], currP);
        } else if (this.percentage > 0.90 && this.percentage <= 1) {
            currP = (this.percentage - 0.90) / 0.10;
            this.color = this.colorMerger.colorChange(this.palette[3], this.palette[4], currP);
        } else if (this.percentage > 1) { // Resetting color as its under the world
            currP = this.percentage - 1;
            this.color = this.colorMerger.colorChange(this.palette[4], this.palette[0], currP);
        }

        // Only change ambient light when its day time
        if (this.percentage <= 1) this.ambientLight.color.set(this.color);
        this.directionalLight.color.set(this.color);
        this.material.color.set(this.color);
    }

    #updateIntensity() {
        if (this.percentage <= 0.05) {
            this.ambientLight.intensity =
                (this.intensity / 2) +
                ((this.intensity / 2) * (this.percentage / 0.05));
        } else if (this.percentage > 0.95 && this.percentage <= 1) {
            this.ambientLight.intensity =
                this.intensity -
                ((this.intensity / 2) * ((this.percentage - 0.95) / 0.05));
        }
    }

    animate(time) {
        if (isNaN(time)) return;
        // The angle that were going to rotate the sun by
        var angle = this.sunRise + ((this.sunSet / this.time) * time);
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle - this.currentA);
        this.percentage = ((angle - this.sunRise) / this.sunSet) % 2;
        // Rotate the sun
        this.mesh.applyMatrix4(rotationMatrix);
        this.currentA = angle;
        this.#updateColor();
        this.#updateIntensity();
    }

    getDayLength() {
        return this.time;
    }
}
