import * as THREE from 'three';

class Block {
    BLOCK_TYPES = {
        GRASS: 'grass',
        DIRT: 'dirt',
        STONE: 'stone',
        WATER: 'water',
    };

    constructor({ positionX, positionY, positionZ, blockType, blockSize }) {
        this.positionX = positionX;                          
        this.positionY = positionY;                          
        this.positionZ = positionZ;                          
        this.blockType = blockType;
        this.blockSize = blockSize;                          
        this.material = this.getMaterial();                  
        this.geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize); 
        this.mesh = new THREE.Mesh(this.geometry, this.material); 
        this.mesh.position.set(this.positionX, this.positionY, this.positionZ); 
        this.mesh.castShadow = true;                         
        this.mesh.receiveShadow = true;                      
    }

    /**
     * A function to get the material of a certain block type 
     * @returns {THREE.MeshPhongMaterial}
     */
    getMaterial() {
        switch (this.blockType) {
            case this.BLOCK_TYPES.GRASS:
                return new THREE.MeshPhongMaterial({ color: 0x368933 }); 
            case this.BLOCK_TYPES.DIRT:
                return new THREE.MeshPhongMaterial({ color: 0x997245 }); 
            case this.BLOCK_TYPES.STONE:
                return new THREE.MeshPhongMaterial({ color: 0xb9b9b9 }); 
            default:
                return new THREE.MeshPhongMaterial({ color: 0x368933 }); 
        }
    }
}

export default Block;
