

// Initialize Firebase
var config = {
	apiKey: "AIzaSyBUkR7JAuLIZbTzZhFEJXV4B-WpRb8GR2A",
	authDomain: "music-machine-fa546.firebaseapp.com",
	databaseURL: "https://music-machine-fa546.firebaseio.com",
	projectId: "music-machine-fa546",
	storageBucket: "music-machine-fa546.appspot.com",
	messagingSenderId: "281401274515"
};
firebase.initializeApp(config);
firebase.auth().signInAnonymously();
var db = firebase.database();




/////////////////////////////

//var nodeEditor = new NodeEditor();
//nodeEditor.getNode();
//var instance = new myNodes.VectorNodeDefinition();
//console.log(instance);

/*setTimeout(function()
{
	var ncube = new CubeNode();
	var nvector = new VectorNode();
	var nsineX = new SineNode();
	var nsineY = new SineNode();
	var nsineZ = new SineNode();

	nsineX.input.speed = 0.01;
	nsineY.input.speed = 0.02;
	nsineZ.input.speed = 0.03;

	nvector.input.y = 2;

	new Binding(nvector.output, "value", ncube.input, "position");
	//new Binding(nsineX.output, "value", nvector.input, "x");
	//new Binding(nsineY.output, "value", nvector.input, "y");
	//new Binding(nsineZ.output, "value", nvector.input, "z");
}, 1000);*/

/*//This is just a test method to make calling from the browsers console window easy
function addNode()
{
	var nodeManager = document.querySelector("[node-manager]").components["node-manager"];	
	var newNode = nodeManager.nodesRef.push();
	newNode.set({ position: {x: Math.random() * 2, y: Math.random() * 2, z: Math.random() * -1 - 1 }});
}*/

/*setTimeout(function()
{
	//init();
	//animate();
}, 1000);

var lastTime = 0;
var moveQ = new THREE.Quaternion( 0.5, 0.5, 0.5, 0.0 ).normalize();
var tmpQ = new THREE.Quaternion();
var currentQ = new THREE.Quaternion();


function init()
{
	var instances = 5000;
	var bufferGeometry = new THREE.BoxBufferGeometry( 2, 2, 2 );

	// copying data from a simple box geometry, but you can specify a custom geometry if you want
	var geometry = new THREE.InstancedBufferGeometry();
	geometry.index = bufferGeometry.index;
	geometry.attributes.position = bufferGeometry.attributes.position;
	geometry.attributes.uv = bufferGeometry.attributes.uv;

	// per instance data
	var offsets = [];
	var orientations = [];

	var vector = new THREE.Vector4();
	var x, y, z, w;

	for ( var i = 0; i < instances; i ++ ) 
	{
		// offsets
		x = Math.random() * 100 - 50;
		y = Math.random() * 100 - 50;
		z = Math.random() * 100 - 50;

		vector.set( x, y, z, 0 ).normalize();
		vector.multiplyScalar( 5 ); // move out at least 5 units from center in current direction

		offsets.push( x + vector.x, y + vector.y, z + vector.z );

		// orientations
		x = Math.random() * 2 - 1;
		y = Math.random() * 2 - 1;
		z = Math.random() * 2 - 1;
		w = Math.random() * 2 - 1;

		vector.set( x, y, z, w ).normalize();

		orientations.push( vector.x, vector.y, vector.z, vector.w );
	}

	offsetAttribute = new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 );
	orientationAttribute = new THREE.InstancedBufferAttribute( new Float32Array( orientations ), 4 ).setDynamic( true );

	geometry.addAttribute( 'offset', offsetAttribute );
	geometry.addAttribute( 'orientation', orientationAttribute );

	// material
	var material = new THREE.RawShaderMaterial({
		uniforms: {
			map: { value: new THREE.TextureLoader().load( 'textures/crate.gif' ) }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	});

	mesh = new THREE.Mesh( geometry, material );
	var scene = document.querySelector("a-scene").object3D;
	scene.add( mesh ); 
}


function animate() 
{
	requestAnimationFrame( animate );

	render();
}

function render() 
{
	var time = performance.now();

	mesh.rotation.y = time * 0.00005;

	var delta = ( time - lastTime ) / 5000;
	tmpQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();

	for ( var i = 0, il = orientationAttribute.count; i < il; i ++ ) 
	{
		currentQ.fromArray( orientationAttribute.array, ( i * 4 ) );
		currentQ.multiply( tmpQ );

		orientationAttribute.setXYZW( i, currentQ.x, currentQ.y, currentQ.z, currentQ.w );
	}

	orientationAttribute.needsUpdate = true;
	lastTime = time;
}*/