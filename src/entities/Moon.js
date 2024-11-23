import * as THREE from "three";
import ColorMerger from '../utils/ColorMerger';

export default class Moon {

    constructor(scene, light) {
        this.scene = scene;
        // Ambient light
        this.ambientLight = light;
        // Parameters for moon geometry
        this.radius, this.geometry, this.material, this.mesh;
        // Light color
        this.color;
        this.colorMerger = new ColorMerger();
        this.palette = [
            { r: 0.416, g: 0.051, b: 0.514 }, // Purple
            { r: 1, g: 0, b: 0 }, // Red
        ];
        // Angles used for rotation
        this.moonRise, this.moonSet, this.currentA;
        // How long the night is
        this.time;
        // Intensity of ambient light
        this.intensity;

        // Percentage of night time
        this.percentage;
        // Making moon
        this.#initMoon();
    }

    #initMoon() {
        // Making the moon
        this.radius = 100;
        this.geometry = new THREE.BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        this.material = new THREE.MeshBasicMaterial({ color: 0xF1EB99, fog: false });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Positioning the moon
        this.mesh.position.set(2500, 0, 0);
        // Rotating it so that it starts below the horizon
        this.moonRise = Math.asin(-this.radius / (this.mesh.position.x - 10)); // Starting angle
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(this.moonRise);
        this.mesh.applyMatrix4(rotationMatrix);
        // Total angles traveled from the beginning to end
        this.moonSet = Math.atan2(this.mesh.position.y, -this.mesh.position.x) - this.moonRise + (2 * Math.PI);
        // Rotating it to the end
        rotationMatrix.makeRotationZ(this.moonSet);
        this.mesh.applyMatrix4(rotationMatrix);
        this.currentA = this.moonSet;
        this.percentage = 1;
        // How much a rotation should take for 15 degrees every 10 seconds
        this.time = (this.moonSet / 0.261799) * 10;

        // Starting with the moon light as purple
        this.color = new THREE.Color(0.416, 0.051, 0.514);
        // Max ambient light intensity
        this.intensity = this.ambientLight.intensity / 2;
        // Moon light  (half intensity to not override ambient light)
        this.directionalLight = new THREE.DirectionalLight(this.color, this.intensity / 2);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048; // Higher values = better shadow quality
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5; // Adjust the near plane
        this.directionalLight.shadow.camera.far = 10000; // Adjust the far plane
        this.directionalLight.shadow.camera.left = -500;
        this.directionalLight.shadow.camera.right = 500;
        this.directionalLight.shadow.camera.top = 500;
        this.directionalLight.shadow.camera.bottom = -500;
        // Binding the light to the moon
        this.mesh.add(this.directionalLight);

        // Adding moon to the scene
        this.scene.add(this.mesh);
    }

    #updateColor() {
        var currP;
        if (this.percentage > .85 && this.percentage <= 1) { // Purple to Red
            currP = (this.percentage - 0.85) / 0.15;
            this.color = this.colorMerger.colorChange(this.palette[0], this.palette[1], currP);
        } else if (this.percentage > 1) { // Resetting color as its under the world
            currP = this.percentage - 1;
            this.color = this.colorMerger.colorChange(this.palette[1], this.palette[0], currP);
        }

        // Only change ambient light when it's night time
        if (this.percentage <= 1) this.ambientLight.color.set(this.color);
        this.directionalLight.color.set(this.color);
    }

    #updateIntensity() {
        if (this.percentage <= .05) { // Decreasing light for a dark midnight
            this.ambientLight.intensity = this.intensity - ((this.intensity / 2) * (this.percentage / .05));
        } else if (this.percentage > .95 && this.percentage <= 1) { // Increasing the light to prepare for sunrise
            this.ambientLight.intensity = (this.intensity / 2) + ((this.intensity / 2) * ((this.percentage - .95) / .05));
        }
    }


    animate(time) {
        if (isNaN(time)) return;
        // The angle that were going to rotate the moon by
        var angle = this.moonRise + ((this.moonSet / this.time) * (time + this.time));
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle - this.currentA);
        this.percentage = ((angle - this.moonRise) / this.moonSet) % 2;
        // Rotate the moon
        this.mesh.applyMatrix4(rotationMatrix);
        this.currentA = angle;

        this.#updateColor();
        this.#updateIntensity();
    }
}