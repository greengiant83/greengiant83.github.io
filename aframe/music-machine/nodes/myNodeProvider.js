(function()
{
	var global = this;
	var namespaceName = "myNodes";
	var namespace;
	if(!global.myNodes) global.myNodes = {};
	namespace = global[namespaceName];

	function register(key, title, definitionType, actorType)
	{
		if(typeof(NodeEditor) == "function") NodeEditor.registerNode(`${namespaceName}.${key}`, title, namespace[key + "Definition"]);
		if(typeof(NodeFactory) == "funtion") NodeFactory.registerNode(`${namespaceName}.${key}`, namespace[key]);
	}

	////////////////////////////////////////
	{
		namespace.VectorDefinition = class extends EditorNodeFactory.NodeDefinition
		{
			constructor(data)
			{
				super();

				this.data.title = "Vector3";
				this.data.parameters = { x: 0, y: 0, z: 0 }

				this.inputs = {
					x: { title: "x", type: "float" },
					y: { title: "y", type: "float" },
					y: { title: "z", type: "float" },
				};

				this.outputs = {
					value: { title: "Value", type: "vector3" }
				};		
			}
		}

		namespace.Vector = class
		{
			constructor()
			{
				var self = this;
				this.input = { x: 0, y: 0, z:0 };
				this.output = { value: new THREE.Vector3(this.input.x, this.input.y, this.input.z) };

				Observe.watch(this.input, "x", i => self.updateOutput());
				Observe.watch(this.input, "y", i => self.updateOutput());
				Observe.watch(this.input, "z", i => self.updateOutput());
			}

			updateOutput()
			{
				this.output.value.set(this.input.x, this.input.y, this.input.z);
				Observe.notify(this.output, "value", this.output.value);
			}
		}
		register("Vector", "Input Vector");
	}

	///////////////////////////////////////
	{
		namespace.CubeDefinition = class extends EditorNodeFactory.NodeDefinition
		{
			constructor(data)
			{
				super();

				this.data.title = "Cube";
				this.data.parameters = { x: 0, y: 0, z: 0 }

				this.inputs = {
					position: { title: "position", type: "vector3"}
				};

				this.outputs = {};		
			}
		}

		namespace.Cube = class
		{
			constructor()
			{
				var self = this;
				this.input = { position: new THREE.Vector3() };

				this.el = document.createElement("a-box");
				this.el.setAttribute("shadow", { cast: true });

				var sceneEl = document.querySelector("a-scene");
				sceneEl.appendChild(this.el);

				Observe.watch(this.input, "position", function(newPosition)
				{
					self.el.setAttribute("position", { x: self.input.position.x, y: self.input.position.y, z: self.input.position.z }); 
				});
			}
		}
		register("Cube", "Cube");
	}

	///////////////////////////
	{
		namespace.SineDefinition = class extends EditorNodeFactory.NodeDefinition
		{
			constructor(data)
			{
				super();

				this.data.title = "Sine Wave";
				this.data.parameters = { x: 0, y: 0, z: 0 }

				this.inputs = {
					speed: { title: "Speed", type: "float" }
				};

				this.outputs = {
					value: { title: "Value", type: "float" }
				};
			}
		}

		namespace.Sine = class
		{
			constructor()
			{
				var self = this;
				self.input = { speed: 0.1 };
				self.output = { value: 0 };

				var t = 0;
				setInterval(function()
				{
					t += self.input.speed;
					self.output.value = Math.sin(t) + 1;
				}, 1);
			}
		}
		register("Sine", "Sine Wave");
	}
	///////////////////////////////////////
})();