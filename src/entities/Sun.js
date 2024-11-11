import * as THREE from "three";

export default class Sun {

    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.geometry = "";
        this.material = "";
        this.mesh = "";
        this.#initSun();
    }

    #initSun(){
        this.geometry = new THREE.SphereGeometry(5, 32, 32);
        this.material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.sceneManager.add(this.mesh);
    }
}