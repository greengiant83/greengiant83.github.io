(function()
{
	var global = this;
	var namespaceName = "dataStuff";
	var namespace;
	if(!global[namespaceName]) global[namespaceName] = {};
	namespace = global[namespaceName];

	function register(key, title, definitionType, actorType)
	{
		if(typeof(NodeEditor) == "function") NodeEditor.registerNode(`${namespaceName}.${key}`, title, namespace[key + "Definition"]);
		if(typeof(NodeFactory) == "function") NodeFactory.registerNode(`${namespaceName}.${key}`, namespace[key]);
	}

	////////////////////////////////////////
	{
		namespace.CVSData = class
		{
			constructor()
			{
				var self = this;
				this.input = { file: "" };
				this.output = { data: {} };

				Observe.watch(this.input, "file", i => self.updateOutput());
			}

			updateOutput()
			{
				this.output.value.set(this.input.x, this.input.y, this.input.z);
				Observe.notify(this.output, "value", this.output.value);
			}
		}
		register("CVSData", "CVS File Parser");
	}
})();