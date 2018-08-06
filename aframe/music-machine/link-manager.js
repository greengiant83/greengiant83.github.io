AFRAME.registerComponent("firebase-list", {
	schema: {
		template: { type: "selector" }, //#linkTemplate
		refPath: { type: "string" }, //links
		componentName: { type: "string" } //node-link
	},

	init: function()
	{
		var self = this;
		var compManager = findComponent("comp-manager");

		self.template = Handlebars.compile(self.data.template.innerHTML);
		self.dataRef = null;

		compManager.el.addEventListener("comp-selected", function(e)
		{
			var newComp = e.detail;

			if(self.dataRef) self.dataRef.off(); //detach all listeners

			self.dataRef = newComp.child(self.data.refPath);
			self.dataRef.on("child_added", i => self.itemAdded(i));
			self.dataRef.on("child_removed", i=> self.itemRemoved(i));
		});
	},

	itemAdded: function(snap)
	{
		var self = this;
		var context = { key: snap.key };
		var newItem = document.createElement("a-entity");
		newItem.setAttribute("id", snap.key);
		newItem.setAttribute(self.data.componentName, true);
		newItem.dataRef = snap.ref;
		newItem.dataKey = snap.key;
		newItem.innerHTML = self.template(context);

		self.el.appendChild(newItem);
	},

	itemRemoved: function(snap)
	{
		var self = this;
		for(var i=0;i<self.el.children.length;i++)
		{
			var child = self.el.children[i];
			if(child.dayaKey == snap.key)
			{
				child.parentElement.removeChild(child);
				break;
			}
		}
	}
});