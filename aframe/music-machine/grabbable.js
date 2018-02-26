
AFRAME.registerComponent("grabbable", {
	schema: {
		origin: { type: "selector" }
	},

	init: function()
	{
		var self = this;
		var isDragging = false;
		var originalParent;
		var originEl = this.data.origin || this.el;

		self.el.classList.add("interactive");

		self.el.addEventListener("mousedown", function(e)
		{
			e.cancelBubble = true;
			if(isDragging) return;
			
			isDragging = true;
			originalParent = originEl.object3D.parent;

			var cursor = e.detail.cursorEl;
			if(cursor == self.el.sceneEl) cursor = document.querySelector("[camera]"); //This handles the scenario where the user is using a old fashioned mouse in the 2d browser window
			
			reparentObject3D(originEl.object3D, cursor.object3D);
			
			self.el.emit("grabStart", e);
			self.el.addState("moving");
		});

		self.el.addEventListener("mouseup", function(e)
		{
			if(isDragging)
			{
				reparentObject3D(originEl.object3D, originalParent);
				isDragging = false;
				originalParent = null;

				self.el.emit("grabEnd", e);
				self.el.removeState("moving");
			}
		})
	}
})