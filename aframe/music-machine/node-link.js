
AFRAME.registerComponent("node-link", {
	schema: 
	{
		firstNode: { type: "selector" },
		secondNode: { type: "selector" }
	},

	init: function()
	{
		var self = this;
		
		self.firstObject = self.data.firstNode.object3D;
		self.secondObject = self.data.secondNode.object3D;
		self.createGeometry();
		self.updateEndPoints();
		self.updateControlPoints();
		self.updateGeometry();
	},

	tick: function()
	{
		var self = this;

		self.updateEndPoints();
		if(self.isUpdateNeeded())
		{
			self.updateControlPoints();
			self.updateGeometry();	
		}
	},

	createGeometry: function()
	{
		this.curve = new THREE.CubicBezierCurve3();
		this.material = new THREE.LineBasicMaterial({ color:0xff0000ff, linewidth:10 });
		this.geometry = new THREE.Geometry();
		this.line = new THREE.Line(this.geometry, this.material);
		this.el.object3D.add(this.line);		
	},

	isUpdateNeeded: function()
	{
		var margin = 0.00001;
		return this.startPoint.distanceTo(this.curve.v0) >= margin || this.endPoint.distanceTo(this.curve.v3) >= margin;
	},

	updateEndPoints: function()
	{
		this.firstObject.updateMatrixWorld();
		this.secondObject.updateMatrixWorld();
		this.startPoint = this.firstObject.localToWorld(new THREE.Vector3(0, 0, 0));
		this.endPoint = this.secondObject.localToWorld(new THREE.Vector3(0, 0, 0));
	},


	updateControlPoints: function()
	{
		this.curve.v0 = this.startPoint;
		this.curve.v3 = this.endPoint;
		var distance = this.startPoint.distanceTo(this.endPoint) * 0.75;
		
		var direction = new THREE.Vector3(0, 0, 1);
		directionLocalToWorld(this.firstObject, direction);
		direction.normalize().multiplyScalar(distance);
		this.curve.v1 = this.curve.v0.clone().add(direction);


		var direction = new THREE.Vector3(0, 0, -1);
		directionLocalToWorld(this.secondObject, direction);
		direction.normalize().multiplyScalar(distance);
		this.curve.v2 = this.curve.v3.clone().add(direction);

		//this.showControlPoints();
	},

	updateGeometry: function()
	{
		var points = this.curve.getSpacedPoints(25); //.bezierChain.getUniformPoints(radius*2);
		this.geometry.vertices.length = 0;
		for(var i=0;i<points.length;i++)
		{
			this.geometry.vertices.push(points[i]);
		}
		this.geometry.verticesNeedUpdate = true;
	},

	showControlPoints: function()
	{
		addDot(this.el, this.curve.v0, 0.1, "red");
		addDot(this.el, this.curve.v1, 0.1, "yellow");
		addDot(this.el, this.curve.v2, 0.1, "green");
		addDot(this.el, this.curve.v3, 0.1, "blue");

	}
});