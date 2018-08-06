AFRAME.registerComponent("path-node", {
	init: function()
	{
		var self = this;
		self.timer = null;
		self.positionRef = self.el.dataRef.child("position");
		self.rotationRef = self.el.dataRef.child("rotation");

		
		self.positionRef.on("value", function(snap)
		{
			if(self.timer) return; //If we are actively moving the object lets ignore the updates because they are (probably) coming from us
			var position = snap.val();
			if(!position) return;
			
			self.el.object3D.position.copy(position);
		});

		self.rotationRef.on("value", function(snap)
		{
			if(self.timer) return; //If we are actively moving the object lets ignore the updates because they are (probably) coming from us
			var rotation = snap.val();
			if(!rotation) return;
			
			self.el.object3D.quaternion.copy(rotation);
		});

		self.el.addEventListener("grabStart", function(e)
		{
			self.timer = setInterval(i => self.uploadTransform(), 10);
		});

		self.el.addEventListener("grabEnd", function(e)
		{
			clearInterval(self.timer);
			self.timer = null;
			self.uploadTransform();
		})
	},

	uploadTransform: function()
	{
		var self = this;
		self.positionRef.set(self.el.object3D.position);

		self.rotationRef.set({ 
			x: self.el.object3D.quaternion.x,
			y: self.el.object3D.quaternion.y,
			z: self.el.object3D.quaternion.z,
			w: self.el.object3D.quaternion.w,
		});
	}
});