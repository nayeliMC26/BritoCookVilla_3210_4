// Deprecated
// import * as THREE from 'three';
// /* Class to handle creating the renderer and rendering the scene */
// class Renderer {
//     constructor() {
//         // Create a renderer 
//         this.renderer = new THREE.WebGLRenderer({ antialias: true });
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//         this.renderer.setClearColor(0x272727);
//         this.renderer.shadowMap.enabled = true;
//         this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: Use soft shadows
//         document.body.appendChild(this.renderer.domElement);

//         window.addEventListener('resize', this.onWindowResize.bind(this), false);
//     }
    
//     // Handle resizing for renderer to prevent stretching of render 
//     onWindowResize() {
//         if (this.camera) {
//             this.camera.aspect = window.innerWidth / window.innerHeight;
//             this.camera.updateProjectionMatrix();
//         }
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//     }

//     // Render function
//     render(scene, camera) {
//         this.camera = camera;
//         this.renderer.render(scene, this.camera);
//     }
// }

// export default Renderer;
