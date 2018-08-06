AFRAME.registerComponent("node-manager", {
	init: function()
	{
		var self = this;
		var compManager = findComponent("comp-manager");

		self.template = Handlebars.compile(document.getElementById("nodeTemplate").innerHTML);
		self.nodesRef = null;

		compManager.el.addEventListener("comp-selected", function(e)
		{
			//TODO: needs to clean up old stuff when a new comp is selected
			var newComp = e.detail;

			if(self.nodesRef) self.nodesRef.off(); //detach all listeners

			self.nodesRef = newComp.child("nodes");
			self.nodesRef.on("child_added", i => self.nodeAdded(i));
			self.nodesRef.on("child_removed", i => self.nodeRemoved(i));
		});
	},

	nodeAdded: function(snap)
	{
		var self = this;
		var context = { key: snap.key };
		var newItem = document.createElement("a-entity");
		newItem.setAttribute("id", snap.key);
		newItem.setAttribute("path-node", true);
		newItem.dataRef = snap.ref;
		newItem.dataKey = snap.key;
		newItem.innerHTML = self.template(context);
		
		self.el.appendChild(newItem);
	},

	nodeRemoved: function(snap)
	{
		var self = this;
		for(var i=0;i<self.el.children.length;i++)
		{
			var child = self.el.children[i];
			if(child.dataKey == snap.key)
			{
				child.parentElement.removeChild(child);
				break;
			}
		}
	}
});

