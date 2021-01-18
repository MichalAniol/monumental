let mesh, renderer, scene, camera, controls;
let guiExposure = null;

const params = {
    exposure: 1.0,
    toneMapping: 'ACESFilmic'
};

const toneMappingOptions = {
    None: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
    Custom: THREE.CustomToneMapping
};

init().catch(function(err) {
    console.error(err);
});

async function init() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.toneMapping = toneMappingOptions[params.toneMapping];
    renderer.toneMappingExposure = params.exposure;

    renderer.outputEncoding = THREE.sRGBEncoding;

    // Set CustomToneMapping to Uncharted2
    // source: http://filmicworlds.com/blog/filmic-tonemapping-operators/

    THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
        'vec3 CustomToneMapping( vec3 color ) { return color; }',
        `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
					float toneMappingWhitePoint = 1.0;
					vec3 CustomToneMapping( vec3 color ) {
						color *= toneMappingExposure;
						return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
					}`
    );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    camera.position.set(-1.8, 0.6, 2.7);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.set(0, 0, -0.2);
    controls.update();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const rgbeLoader = new THREE.RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath('./textures/');

    const gltfLoader = new THREE.GLTFLoader()
        .setPath('./blender-files/');

    // environment
    new Promise(resolve => {
            resolve(rgbeLoader.loadAsync('venice_sunset_1k.hdr'))
        })
        .then(texture => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();
        })

    // model
    new Promise(resolve => {
            resolve(gltfLoader.loadAsync('GATSBYstol.gltf'))
        })
        .then(gltf => {
            gltf.scene.traverse(child => {
                if (child.isMesh) {
                    mesh = child;
                    scene.add(mesh);
                }
            });
        })

    render();

    window.addEventListener('resize', onWindowResize, false);

    gui = new GUI();
    gui.add(params, 'toneMapping', Object.keys(toneMappingOptions))
        .onChange(function() {
            updateGUI();

            renderer.toneMapping = toneMappingOptions[params.toneMapping];
            mesh.material.needsUpdate = true;
            render();
        });

    updateGUI();
    gui.open();
}

function updateGUI() {
    if (guiExposure !== null) {
        gui.remove(guiExposure);
        guiExposure = null;
    }

    if (params.toneMapping !== 'None') {
        guiExposure = gui.add(params, 'exposure', 0, 2)

        .onChange(function() {
            renderer.toneMappingExposure = params.exposure;
            render();
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    renderer.render(scene, camera);
}