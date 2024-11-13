import * as THREE from "three";

export default class Sun {

    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.radius = "";
        this.geometry = "";
        this.material = "";
        this.mesh = "";
        this.color = "";
        this.sunRise = "";
        this.sunSet = "";
        this.currentA = "";
        this.percentage = "";
        this.#initSun();
    }

    #initSun() {
        // Starting with the sun colored red
        this.color = new THREE.Color(1, 0, 0);
        this.radius = 5;
        // Making the Sun
        this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        this.material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Positionning the sun
        this.mesh.position.set(50, 0, 0);
        // Rotating it so that it starts below the horizon
        this.sunRise = Math.asin(-this.radius / 50); // Starting angle
        this.currentA = this.sunRise;
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(this.sunRise);
        this.mesh.applyMatrix4(rotationMatrix);
        // Total angled traveled form the begining 
        this.sunSet = Math.atan2(this.mesh.position.y, -this.mesh.position.x) - this.sunRise + (2 * Math.PI);
        rotationMatrix.makeRotationZ(this.sunSet);
        // this.mesh.applyMatrix4(rotationMatrix);
        // console.log(this.sunSet)
        this.sceneManager.add(this.mesh);
    }

    rotate(time) {
        if (isNaN(time) || time < 2) return;
        // var angle = Math.asin(-this.radius / 50) + ((Math.PI / 120) * (time % 240));
        var angle = this.sunRise + ((Math.PI / 12) * ((time - 2) % 24));
        var rotationMatrix = new THREE.Matrix4().makeRotationZ(angle - this.currentA);
        this.percentage = (angle - this.sunRise) / this.sunSet;
        if (this.percentage <= 100.1) {
            this.mesh.applyMatrix4(rotationMatrix);
            this.currentA = angle;
        }
        this.updateColor();
    }

    updateColor() {
        switch (true) {
            case (this.percentage <= .25):
                this.color.g = 1 * (this.percentage / .25)
                // this.color.b = 165
                break;
            case (this.percentage > .25 && this.percentage <= .375):
                this.percentage -= .25;
                this.color.b = 1 * (this.percentage / .125)
                break;
            case (this.percentage > .625 && this.percentage <= .75):
                this.percentage -= .625;
                this.color.b = 1 - (1 * (this.percentage / .125))
                // this.color = 0xffff00;
                break;
            case (this.percentage > .75):
                this.percentage -= .75;
                // this.color = 0xffa500;
                this.color.g = 1 - (1 * (this.percentage / .25))
                break;
        }
        this.material.color.set(this.color);
    }

    test() {
        console.log("wtf");
    }
}