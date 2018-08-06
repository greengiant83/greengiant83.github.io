var global = this;

class EditorNodeFactory
{
	constructor(graphRef)
	{
		//this.nodes = {};
		//this.patches = {};
		//this.nodes = new FireList(graphRef.child("nodes"), )
		/*graphRef.child("nodes").on("child_added", function(snap)
		{
		});

		graphRef.child("patches").on("child_added", function(snap)
		{
		});*/
	}

	getNode(key)
	{
		console.log("Registered nodes", EditorNodeFactory.nodes);
	}

	instantiateNode(nodeRef)
	{

	}

	static EditorNodeFactory(key, title, type)
	{
		//I am imagining that the key will be a namespace key like: "mattsCoolNodes.geometry.theAwesomeNode"
		EditorNodeFactory.nodes[key] = {
			title: title,
			type: type
		}
	}
}
EditorNodeFactory.nodes = [];

//////////////////////

//BaseClass for NodeDefinitions
EditorNodeFactory.NodeDefinition = class 
{
	constructor()
	{
		//this.data is serialized in DB
		this.data = {
			key: null,
			title: null,
			position: new THREE.Vector3(),
			size: new THREE.Vector3(),
			rotation: new THREE.Quaternion(),
			parameters: undefined
		};
	}

	static instantiate(typePath, data)
	{
		var tokens = typePath.split('.');
		var type = global;
		tokens.forEach(i => type = type[i]);
		
		var o = new type();

		Object.assign(o.data, data);

		return o;
	}
}

//Patchs connect nodes to each other
EditorNodeFactory.NodePatch = class
{
	constructor(pathA, pathB)
	{
		this.data = {
			from: null,
			to: null,
		}
	}

	static instantiate(data)
	{
		var o = new NodePatch();
		Object.assign(o.data, data);
		return o;
	}
}