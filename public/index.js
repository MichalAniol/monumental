const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
let size = Math.min(window.innerHeight, window.innerWidth);

renderer.setSize(size, size * .65);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);

const setLight = name => {
    name.castShadow = true;
    name.receiveShadow = true;
    name.shadow.mapSize.width = 1024;
    name.shadow.mapSize.height = 1024;
    name.shadow.camera.near = 0.01;
    name.shadow.camera.far = 5000;
    name.shadow.focus = .01;
    // name.shadow.camera.position.set(0, .2, 4);
}

const light = new THREE.DirectionalLight('#ffffff', 1.4, 1000);
light.position.set(100, 100, 200);
setLight(light);
scene.add(light);

// const light2 = new THREE.PointLight('#ffff00', .3, 1000);
// light2.position.set(-20, -2, 20);
// setLight(light2);
// scene.add(light2);

const light3 = new THREE.AmbientLight('#ffffff', .4); // soft white light
light3.castShadow = false;
light3.receiveShadow = false;
scene.add(light3);

// const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.PerspectiveCamera(65, (1 / .65), 0.1, 1000);
camera.position.set(0, .1, 3.5);
// camera.position.set(0, 0, 15);



// const helper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(helper);

// const sphereGeometry = new THREE.SphereBufferGeometry(.1, .1, .1);
// const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// sphere.position.set(1, 1, -1);
// sphere.castShadow = true; //default is false
// sphere.receiveShadow = false; //default
// scene.add(sphere);

const objLoader = new THREE.OBJLoader();
objLoader.setPath('./public/blender-files/');

const mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath('./public/blender-files/');

var stol;
new Promise(resolve => {
        mtlLoader.load('GATSBYstol.mtl', materials => {
            resolve(materials);
        })
    })
    .then(materials => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('GATSBYstol.obj', object => {
            scene.add(object);
            object.receiveShadow = true;
            object.castShadow = true;
            stol = object;
            stol.rotation.y = 1;
            stol.position.y = .2;
            stol.traverse(child => {
                child.receiveShadow = true;
                child.castShadow = true;
            })
        })
    })


let sinX = 0;

function render() {

    if (stol) {
        sinX += .005;
        stol.rotation.x = -(Math.sin(sinX) / 3) + .2;
        stol.rotation.y += 0.002;
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();