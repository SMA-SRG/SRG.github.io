let args = {
    algo : null, 
    pointer : null,
    values : []
};

let definition = null;

// get slider values
let ranura = document.getElementById('ranura').value;
let inclinacion = document.getElementById('inclinacion').value;
let entrecalle = document.getElementById('entrecalle').value;
let exo = document.getElementById('exo').value;
let extrusion = document.getElementById('extrusion').value;

let param1 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Ranura');
param1.append([0], [ranura]);

let param2 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Inclinacion');
param2.append([0], [inclinacion]);

let param3 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Entrecalle');
param3.append([0], [entrecalle]);

let param4 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Exo');
param4.append([0], [exo]);

let param5 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:ExtrusionExo');
param5.append([0], [extrusion]);

rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.');
    rhino = m; // global

    // authenticate
    RhinoCompute.authToken = RhinoCompute.getAuthToken();

    // if you have a different Rhino.Compute server, add the URL here:
    //RhinoCompute.url = "http://127.0.0.1:8081/";

    // load a grasshopper file!
    //let url = 'https://diegodi-s.github.io/test.github.io/Compute_Tower_36.gh';
    let url = 'Compute_Tower_36.gh';
    let res = await fetch(url);
    let buffer = await res.arrayBuffer();
    let arr = new Uint8Array(buffer);
    definition = arr;

    init();
    compute();
});

function compute(){

    // clear values
    let trees = [];

    trees.push(param1);
    trees.push(param2);
    trees.push(param3);
    trees.push(param4);
    trees.push(param5);

    RhinoCompute.Grasshopper.evaluateDefinition(definition, trees).then(result => {
        // RhinoCompute.computeFetch("grasshopper", args).then(result => {
        console.log(result);

        // hide spinner
        document.getElementById('loader').style.display = 'none';

        let data = JSON.parse(result.values[0].InnerTree['{ 0; }'][0].data);
        let mesh = rhino.CommonObject.decode(data);

        let data2 = JSON.parse(result.values[1].InnerTree['{ 0; }'][0].data);
        let mesh2 = rhino.CommonObject.decode(data2);

        //let material = new THREE.MeshNormalMaterial({ color: 0xff0000});

        //let material2 = new THREE.MeshPhongMaterial({color: 0x33acff, opacity: 0.1, transparent: true, side: THREE.DoubleSide,});
        //let material = new THREE.MeshBasicMaterial({color: 0xf5f5f5});

        let material = new THREE.MeshPhysicalMaterial({side: THREE.DoubleSide});
        let material2 = new THREE.MeshPhysicalMaterial({color: 0xa2c3da, opacity: 0.5, transparent:true, side: THREE.DoubleSide});

        loadPBRMaterial(material, 'streaked-metal1');
        material.metalness = 0.75;
        material.roughness = 0.15;
        material.normalScale.x = 1.0;
        material.normalScale.y = 1.0;
        //material.envMap = scene.background;
        material.envMap = loadCubeMap('SwedishRoyalCastle', '', 'jpg');






        let threeMesh = meshToThreejs(mesh, material);
        let threeMesh2 = meshToThreejs(mesh2, material2);

        // clear meshes from scene
        scene.traverse(child => {
            if(child.type === 'Mesh'){
                scene.remove(child);
            }
        });

        scene.add(threeMesh);
        scene.add(threeMesh2);
    });
}

function onSliderChange(){

    // show spinner
    document.getElementById('loader').style.display = 'block';

    // get slider values
    ranura = document.getElementById('ranura').value;
    inclinacion = document.getElementById('inclinacion').value;
    entrecalle = document.getElementById('entrecalle').value;
    exo = document.getElementById('exo').value;
    extrusion = document.getElementById('extrusion').value;

    param1 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Ranura');
    param1.append([0], [ranura]);

    param2 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Inclinacion');
    param2.append([0], [inclinacion]);

    param3 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Entrecalle');
    param3.append([0], [entrecalle]);

    param4 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:Exo');
    param4.append([0], [exo]);

    param5 = new RhinoCompute.Grasshopper.DataTree('RH_IN:201:ExtrusionExo');
    param5.append([0], [extrusion]);

    compute();
}





 function loadPBRMaterial(material, name) {
            let tl = new THREE.TextureLoader();

            tl.setPath('https://diegodi-s.github.io/rhino3dm/docs/javascript/samples/resources/materials/PBR/' + name + '/');
            material.map          = tl.load(name + '_base.png');
            material.aoMmap       = tl.load(name + '_ao.png');
            material.normalMap    = tl.load(name + '_normal.png');
            material.metalnessMap = tl.load(name + '_metallic.png');
          }

 function loadCubeMap(name, prefix, format) {
            let ctl = new THREE.CubeTextureLoader();

            ctl.setPath('https://diegodi-s.github.io/rhino3dm/docs/javascript/samples/resources/textures/cube/' + name + '/');
            return ctl.load([prefix + 'px.' + format, prefix + 'nx.' + format, prefix + 'py.' + format,
                             prefix + 'ny.' + format, prefix + 'pz.' + format, prefix + 'nz.' + format]);
          }







// BOILERPLATE //

var scene, camera, renderer, controls;

function init(){
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(1,1,1);
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 3000 );


    // create a gradient background
    var canvas = document.createElement( 'canvas' );
    //var canvas = document.getElementById('canvas');
    canvas.width = 128;
    canvas.height = 128;
    var context = canvas.getContext( '2d' );
    var gradient = context.createLinearGradient( 0, 0, 0, canvas.height);
    gradient.addColorStop( 0.1, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );
    scene.background = new THREE.CanvasTexture( canvas );

    //  add a couple lights
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 300 );
    scene.add( light );
    var light2 = new THREE.DirectionalLight( 0x666666 );
    light2.position.set( 0.2, 0.2, -300 );
    scene.add( light2 );


    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    var glcanvas = document.getElementById('glcanvas');
    glcanvas.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement  );
    //controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    //controls.dampingFactor = 0.25;
    //controls.screenSpacePanning = false;
    //controls.minDistance = 10;
    //controls.maxDistance = 1500;


    camera.position.z = 250;
    //camera.position.x = 250;
    camera.position.y = 250;
    //camera.target(0,0,200);

    window.addEventListener( 'resize', onWindowResize, false );

    animate();
}

var animate = function () {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
};
  
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    animate();
}

function meshToThreejs(mesh, material) {
    let loader = new THREE.BufferGeometryLoader();
    var geometry = loader.parse(mesh.toThreejsJSON());
    return new THREE.Mesh(geometry, material);
}