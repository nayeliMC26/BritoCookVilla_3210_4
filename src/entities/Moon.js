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
        // Starting with the moon colored moon color
        this.color = new THREE.Color(0.945, 0.922, 0.600);
        // Making the moon
        this.radius = 5;
        this.geometry = new THREE.BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2);
        this.material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Positionning the moon
        this.mesh.position.set(100, 0, 0);
        // Rotating it so that it starts below the horizon
        this.moonRise = Math.asin(-this.radius / (this.mesh.position.x - 10)); // Starting angle
        this.currentA = this.moonRise;
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(this.moonRise);
        this.mesh.applyMatrix4(rotationMatrix);
        // Total angled traveled form the beginning 
        this.moonSet = Math.atan2(this.mesh.position.y, -this.mesh.position.x) - this.moonRise + (2 * Math.PI);
        // Toatal angles traveled divided by 15 times 10
        this.time = (this.moonSet / 0.261799)

        // Max ambient light intesity
        this.intesity = this.ambientLight.intensity / 2;
        // moon light
        this.directionalLight = new THREE.DirectionalLight(0x000000, this.intesity);
        this.directionalLight.castShadow = true;
        this.directionalLight.visible = false;
        // Binding the light to the moon
        this.mesh.add(this.directionalLight)

        // Adding moon to the scene
        this.scene.add(this.mesh);
        console.log(this.intesity);
    }

    #updateIntensity() {
        switch (true) {
            case (this.percentage <= .05): // Decresing light for a dark midnight
                this.directionalLight.visible = true;
                this.ambientLight.intensity = this.intesity - ((this.intesity / 2) * (this.percentage / .05));
                break;
            case (this.percentage > .95 && this.percentage <= 1): // Increasing the light to prepare for sunrise
                this.ambientLight.intensity = (this.intesity / 2) + ((this.intesity / 2) * ((this.percentage - .95) / .05));
                break;
            case (this.percentage > 1): // Moon light is invisible after night time
                this.directionalLight.visible = false;
                break;
        }
    }

    animate(time) {
        // Delay moon from moving until night time
        if (isNaN(time) || time < this.time) return;
        // The angle that were going to rotate the moon by
        var angle = this.moonRise + ((this.moonSet / this.time) * ((time - this.time) % (this.time * 2)));
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle - this.currentA);
        this.percentage = (angle - this.moonRise) / this.moonSet;
        // Move the moon as long as its night time and a little more
        if (this.percentage <= 1.5) {
            this.mesh.applyMatrix4(rotationMatrix);
            this.currentA = angle;
        }

        // this.#updateColor();
        this.#updateIntensity();
    }
}