AFRAME.registerComponent("grabbable", {
	schema: {
		origin: { type: "selector" }
	},

	init: function()
	{
		var self = this;
		var isDragging = false;
		self.originEl = this.data.origin || this.el;
		self.proxyObject = null;

		self.el.classList.add("interactive");

		self.el.addEventListener("mousedown", function(e)
		{
			e.cancelBubble = true;
			if(isDragging) return;
			
			isDragging = true;

			var cursor = e.detail.cursorEl;
			if(cursor == self.el.sceneEl) cursor = document.querySelector("[camera]"); //This handles the scenario where the user isn't using motion controllers

			createProxyObject(cursor.object3D);
			
			self.originEl.emit("grabStart", e);
			self.originEl.addState("moving");
		});

		self.el.addEventListener("mouseup", function(e)
		{
			if(isDragging)
			{
				isDragging = false;

				if(self.proxyObject)
				{
					self.proxyObject.parent.remove(self.proxyObject);
					self.proxyObject = null;
				}

				self.originEl.emit("grabEnd", e);
				self.originEl.removeState("moving");
			}
		});

		function createProxyObject(cursorObject)
		{
			//var geometry = new THREE.BoxGeometry(1, 1, 1);
			//var material = new THREE.MeshBasicMaterial({color: 0xffff00});
			//self.proxyObject = new THREE.Mesh(geometry, material);
			self.proxyObject = new THREE.Object3D();
			cursorObject.add(self.proxyObject);
			copyTransform(self.originEl.object3D, self.proxyObject);				
		}
	},

	tick: function()
	{
		var self = this;
		if(self.proxyObject)
		{
			copyTransform(self.proxyObject, self.originEl.object3D);
		}
	}
})