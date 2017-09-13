AFRAME.registerComponent("seek-position", {
	schema: { type: "vec3" },
	init: function()
	{
		var self = this;
		self.targetPos = this.data;
		self.isSeeking = true;
	},

	update: function(oldData)
	{
		this.targetPos = this.data;
		this.isSeeking = true;
	},

	tick: function()
	{
		if(this.isSeeking) this.move();
	},

	move: function()
	{
		var positionAttribute = this.el.getAttribute("position");
		var position = new THREE.Vector3(positionAttribute.x, positionAttribute.y, positionAttribute.z);
		//this.el.object3D.position.lerp(this.targetPos, 0.1);
		position.lerp(this.targetPos, 0.1);
		this.el.setAttribute("position", position);
		
		var delta = this.el.object3D.position.distanceToSquared(this.targetPos);
		if(delta < 0.0001)
		{
			this.isSeeking = false;
			//this.el.object3D.position.set(this.targetPos.x, this.targetPos.y, this.targetPos.z);
		}
	}
});