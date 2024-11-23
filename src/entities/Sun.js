import * as THREE from "three";

export default class Sun {
    constructor(scene, light) {
        this.scene = scene;
        this.ambientLight = light;
        // Parameters for sun geometry
        this.radius = 100; 
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.color = new THREE.Color(1, 0.27, 0); // Initial red-orange color
        this.currentA = 0; // Current angle of rotation

        // Angles used for rotation
        this.sunRise = 0;
        this.sunSet = 0;

        // Day duration in seconds and angular speed
        this.dayLength = 120; // Total time for a full sun cycle
        this.angularSpeed = 0;

        // Intensity of ambient and directional light
        this.intensity = light.intensity;
        this.percentage = 0; // Percentage of the sun's daily progression

        // Create the sun
        this.#initSun();
    }

    #initSun() {
        // Sun geometry and material
        this.geometry = new THREE.BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        this.material = new THREE.MeshBasicMaterial({ color: this.color, fog: false });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Positioning the sun
        this.mesh.position.set(2500, 0, 0);

        // Set initial rotation so the sun starts below the horizon
        this.sunRise = Math.asin(-this.radius / (this.mesh.position.x - 10));
        this.currentA = this.sunRise;
        const rotationMatrix = new THREE.Matrix4().makeRotationZ(this.sunRise);
        this.mesh.applyMatrix4(rotationMatrix);

        // Calculate the total angle of the sun's path from sunrise to sunset
        this.sunSet =
            Math.atan2(this.mesh.position.y, -this.mesh.position.x) -
            this.sunRise +
            2 * Math.PI;

        // Calculate the angular speed for smooth rotation
        this.angularSpeed = this.sunSet / this.dayLength;

        // Directional light for the sun
        this.directionalLight = new THREE.DirectionalLight(this.color, this.intensity);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048; // Higher values = better shadow quality
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 10000;
        this.directionalLight.shadow.camera.left = -500;
        this.directionalLight.shadow.camera.right = 500;
        this.directionalLight.shadow.camera.top = 500;
        this.directionalLight.shadow.camera.bottom = -500;

        // Bind light to the sun
        this.mesh.add(this.directionalLight);

        // Add the sun to the scene
        this.scene.add(this.mesh);
    }

    #updateColor() {
        // Adjust the sun's color based on the time of day
        if (this.percentage <= 0.10) {
            // Red to Orange during dawn
            this.color.g = 0.27 + (0.33 * (this.percentage / 0.10));
        } else if (this.percentage > 0.10 && this.percentage <= 0.15) {
            // Orange to Yellow during sunrise
            this.color.g = 0.6 + (0.4 * ((this.percentage - 0.10) / 0.05));
            this.color.b = (this.percentage - 0.10) / 0.05;
        } else if (this.percentage > 0.85 && this.percentage <= 0.90) {
            // Yellow to Orange during sunset
            this.color.g = 1 - (0.33 * ((this.percentage - 0.85) / 0.05));
            this.color.b = (1 - ((this.percentage - 0.85) / 0.05));
        } else if (this.percentage > 0.90 && this.percentage <= 1) {
            // Orange to Red during dusk
            this.color.g = 0.27 - (0.27 * ((this.percentage - 0.90) / 0.10));
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

    animate(deltaTime) {
        if (isNaN(deltaTime)) return;
        // The angle that were going to rotate the sun by
        var angleChange = this.angularSpeed * deltaTime;
        var newAngle = this.currentA + angleChange;

        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angleChange);
        this.mesh.applyMatrix4(rotationMatrix);

        this.currentA = newAngle;
        this.percentage = ((newAngle - this.sunRise) / this.sunSet) % 2;

        this.#updateColor();
        this.#updateIntensity();
    }

    getDayLength() {
        return this.dayLength;
    }
}
