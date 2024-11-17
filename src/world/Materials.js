import * as THREE from 'three';

class Materials {
    MATERIALS = {
        ICE: "../../Ice.jpg",
        SIDE: "../../Dirt_Side.jpg",
        SNOW: "../../Snow.jpg",
        SPRUCELOG: "../../Spruce_Log.jpg",
        SPRUCETOP: "../../Spruce_Top.jpg",
        LEAVES: "../../Leaves.jpg"
    }

    constructor() {
        const loader = new THREE.TextureLoader();

        // Load the textures
        this.iceTexture = loader.load(this.MATERIALS.ICE); 
        this.sideTexture = loader.load(this.MATERIALS.SIDE);
        this.snowTexture = loader.load(this.MATERIALS.SNOW);
        this.spruceLogTexture = loader.load(this.MATERIALS.SPRUCELOG);
        this.spruceTopTexture = loader.load(this.MATERIALS.SPRUCETOP);
        this.leavesTexture = loader.load(this.MATERIALS.LEAVES);

        // Apply settings to avoid blurring and fix color space
        this.setTextureFilters(this.iceTexture);
        this.setTextureFilters(this.sideTexture);
        this.setTextureFilters(this.snowTexture);
        this.setTextureFilters(this.spruceLogTexture);
        this.setTextureFilters(this.spruceTopTexture);
        this.setTextureFilters(this.leavesTexture);

        // Convert textures to sRGB color space
        this.iceTexture.encoding = THREE.SRGBEncoding;
        this.sideTexture.encoding = THREE.SRGBEncoding;
        this.snowTexture.encoding = THREE.SRGBEncoding;
        this.spruceLogTexture.encoding = THREE.SRGBEncoding;
        this.spruceTopTexture.encoding = THREE.SRGBEncoding;
        this.leavesTexture.encoding = THREE.SRGBEncoding;
    }

    // Function to set filters and anisotropy for each texture
    setTextureFilters(texture) {
        texture.minFilter = THREE.NearestFilter; // For minification (scaling down)
        texture.magFilter = THREE.NearestFilter; // For magnification (scaling up)
        texture.generateMipmaps = false; // Disable mipmap generation (important for small textures)
        
        // Optional: Set anisotropy if you want better quality at long distances
        texture.anisotropy = 16; // Set anisotropy level (up to 16)
    }
}

export default Materials;
