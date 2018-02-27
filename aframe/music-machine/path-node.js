AFRAME.registerComponent("path-node", {
	init: function()
	{
		var self = this;
		self.timer = null;
		self.lastStoredPosition = null;
		self.positionRef = self.el.dataRef.child("position");
		
		self.positionRef.on("value", function(snap)
		{
			var position = snap.val();
			self.el.setAttribute("position", position);
			self.lastStoredPosition = position;
		});

		self.el.addEventListener("grabStart", function(e)
		{
			self.timer = setInterval(i => self.uploadPosition(), 100);
		});

		self.el.addEventListener("grabEnd", function(e)
		{
			clearInterval(self.timer);
			self.uploadPosition();
		})
	},

	uploadPosition: function()
	{
		var self = this;
		self.positionRef.set(self.el.object3D.position);
	}
});