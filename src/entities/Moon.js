import * as THREE from "three";

export default class Moon {

    constructor(scene, light) {
        this.scene = scene;
        // Ambinet light
        this.ambientLight = light;
        // Parameters for moon geometry
        this.radius, this.geometry, this.material, this.mesh, this.color;
        // Angles used for rotation
        this.moonRise, this.moonSet, this.currentA;
        // How long the night is
        this.time;
        // Intesity of ambient light
        this.intesity;
        // Percentage of night time
        this.percentage;
        // Making moon
        this.#initMoon();
    }

    #initMoon() {
        // Making the moon
        this.radius = 50;
        this.geometry = new THREE.BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        this.material = new THREE.MeshBasicMaterial({ color: 0xF1EB99 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Positionning the moon
        this.mesh.position.set(1000, 0, 0);
        // Rotating it so that it starts below the horizon
        this.moonRise = Math.asin(-this.radius / (this.mesh.position.x - 10)); // Starting angle
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(this.moonRise);
        this.mesh.applyMatrix4(rotationMatrix);
        // Total angles traveled form the beginning to end
        this.moonSet = Math.atan2(this.mesh.position.y, -this.mesh.position.x) - this.moonRise + (2 * Math.PI);
        // Rotating it to the end
        rotationMatrix.makeRotationZ(this.moonSet);
        this.mesh.applyMatrix4(rotationMatrix);
        this.currentA = this.moonSet;
        this.percentage = 1;
        // How much a rotation should take for 15 degrees every 10 seconds
        this.time = (this.moonSet / 0.261799) * 10

        // Starting with the moon light as purple
        this.color = new THREE.Color(0.416, 0.051, 0.514);
        // Max ambient light intesity
        this.intesity = this.ambientLight.intensity / 2;
        // Moon light (half intensity to not overide ambinet light)
        this.directionalLight = new THREE.DirectionalLight(this.color, this.intesity / 2);
        this.directionalLight.castShadow = true;
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048; // Higher values = better shadow quality
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5; // Adjust the near plane
        this.directionalLight.shadow.camera.far = 10000; // Adjust the far plane
        this.directionalLight.shadow.camera.left = -500;
        this.directionalLight.shadow.camera.right = 500;
        this.directionalLight.shadow.camera.top = 500;
        this.directionalLight.shadow.camera.bottom = -500;
        this.directionalLight.visible = false;
        // Binding the light to the moon
        this.mesh.add(this.directionalLight)

        // Adding moon to the scene
        this.scene.add(this.mesh);
    }

    #updateColor() {
        switch (true) {
            case (this.percentage > .85 && this.percentage <= 1): // Purple to Red
                this.color.r = 0.416 + (0.584 * ((this.percentage - .85) / .15));
                this.color.g = 0.051 + (-0.051 * ((this.percentage - .85) / .15));
                this.color.b = 0.514 + (-0.514 * ((this.percentage - .85) / .15));
                break;
            case (this.percentage > 1): // Reseting color as its under the world
                const angle = Math.atan2(this.mesh.position.y, this.mesh.position.x) + (2 * Math.PI)
                const percentage = (angle - this.moonSet) / ((2 * Math.PI) - this.moonSet);
                this.color.r = 1 + (-0.584 * percentage);
                this.color.g = 0.051 * percentage;
                this.color.b = 0.514 * percentage;
                break
        }
        // Only change ambient light when its night time
        if (this.percentage <= 1) this.ambientLight.color.set(this.color);
        this.directionalLight.color.set(this.color);
    }

    #updateIntensity() {
        switch (true) {
            case (this.percentage <= .05): // Decresing light for a dark midnight
                this.ambientLight.intensity = this.intesity - ((this.intesity / 2) * (this.percentage / .05));
                break;
            case (this.percentage > .95 && this.percentage <= 1): // Increasing the light to prepare for sunrise
                this.ambientLight.intensity = (this.intesity / 2) + ((this.intesity / 2) * ((this.percentage - .95) / .05));
                break;
        }
    }

    animate(time) {
        if (isNaN(time)) return;
        // The angle that were going to rotate the moon by
        var angle = this.moonRise + ((this.moonSet / this.time) * ((time + this.time) % (this.time * 2)));
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle - this.currentA);
        this.percentage = (angle - this.moonRise) / this.moonSet;
        // Rotate the moon
        this.mesh.applyMatrix4(rotationMatrix);
        this.currentA = angle;

        this.#updateColor();
        this.#updateIntensity();
    }
}