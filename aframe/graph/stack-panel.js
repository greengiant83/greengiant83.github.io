AFRAME.registerPrimitive("a-stack", { defaultComponents: { "stack-panel": true }});

BoundingBox = function()
{
	return { min: new THREE.Vector3(), max: new THREE.Vector3() };
}

AFRAME.registerComponent("stack-panel", {
	init: function()
	{
		var self = this;
		this.el.addEventListener("child-attached", function(e)
		{
			if(e.detail.el.parentNode != self.el) return;
			e.detail.el.addEventListener("loaded", function()
			{
				self.updateLayout();
			})
		});

		this.el.addEventListener("child-detached", function(e)
		{
			self.updateLayout();	
		});
	},

	update: function()
	{
		var self = this;
		self.updateLayout();
	},

	updateLayout: function()
	{
		var self = this;
		var totalBounds = new BoundingBox();// { min: new THREE.Vector3(), max: new THREE.Vector3() };
		var position = { x: 0, y: 0, z: 0 };

		for(var i=0;i<self.el.children.length;i++)
		{
			var child = self.el.children[i];
			child.boundingBox = findBoundingBox(child);
			if(!child.boundingBox)
			{
				continue;
			} 

			var center = {
				x: (child.boundingBox.max.x + child.boundingBox.min.x) / 2,
				y: (child.boundingBox.max.y + child.boundingBox.min.y) / 2,
				z: (child.boundingBox.max.z + child.boundingBox.min.z) / 2,
			};

			var localPos = {
				x: position.x - center.x,
				y: position.y - child.boundingBox.max.y,
				z: position.z - center.z
			};

			child.setAttribute("position", localPos);
			growBounds(totalBounds, child);

			var offset = child.boundingBox.max.y - child.boundingBox.min.y;
			position.y -= offset;
		}
		self.el.boundingBox = totalBounds;
		self.el.emit("bounds-updated", totalBounds);
	},
});
