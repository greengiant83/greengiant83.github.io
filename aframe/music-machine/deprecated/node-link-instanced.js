console.error("this is no longer used");

AFRAME.registerComponent("node-link", {
	init: function()
	{
		var self = this;

		self.createGeometry();

		self.el.dataRef.on("value", function(snap)
		{
			var data = snap.val();
			self.objectA = document.querySelector(data.connectionA).object3D;
			self.objectB = document.querySelector(data.connectionB).object3D;
			
			self.updateEndPoints();
			self.updateControlPoints();
			self.updateGeometry();			
		})
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
		//this.material = new THREE.LineBasicMaterial({ color:0xff0000ff, linewidth:10 });
		//this.geometry = new THREE.Geometry();
		//this.line = new THREE.Line(this.geometry, this.material);
		//this.el.object3D.add(this.line);	

		var sourceGeometry = new THREE.BoxBufferGeometry(.1, .1, .1);

		this.geometry = new THREE.InstancedBufferGeometry();
		this.geometry.index = sourceGeometry.index;
		this.geometry.attributes.position = sourceGeometry.attributes.position;
		this.geometry.attributes.uv = sourceGeometry.attributes.uv;

		this.offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array([]), 3);
		this.geometry.addAttribute("offset", this.offsetAttribute);

		var material = new THREE.RawShaderMaterial({
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		});

		this.mesh = new THREE.Mesh(this.geometry, material);
		this.el.object3D.add(this.mesh);

	},

	isUpdateNeeded: function()
	{
		var margin = 0.00001;
		return this.startPoint.distanceTo(this.curve.v0) >= margin || this.endPoint.distanceTo(this.curve.v3) >= margin;
	},

	updateEndPoints: function()
	{
		this.objectA.updateMatrixWorld();
		this.objectB.updateMatrixWorld();
		this.startPoint = this.objectA.localToWorld(new THREE.Vector3(0, 0, 0));
		this.endPoint = this.objectB.localToWorld(new THREE.Vector3(0, 0, 0));
	},


	updateControlPoints: function()
	{
		this.curve.v0 = this.startPoint;
		this.curve.v3 = this.endPoint;
		var distance = this.startPoint.distanceTo(this.endPoint) * 0.75;
		
		var direction = new THREE.Vector3(0, 0, 1);
		directionLocalToWorld(this.objectA, direction);
		direction.normalize().multiplyScalar(distance);
		this.curve.v1 = this.curve.v0.clone().add(direction);


		var direction = new THREE.Vector3(0, 0, -1);
		directionLocalToWorld(this.objectB, direction);
		direction.normalize().multiplyScalar(distance);
		this.curve.v2 = this.curve.v3.clone().add(direction);

		//this.showControlPoints();
	},

	updateGeometry: function()
	{
		/*var points = this.curve.getSpacedPoints(50); //.bezierChain.getUniformPoints(radius*2);
		this.geometry.vertices.length = 0;
		for(var i=0;i<points.length;i++)
		{
			this.geometry.vertices.push(points[i]);
		}
		this.geometry.verticesNeedUpdate = true;*/

		var points = this.curve.getSpacedPoints(50); //.bezierChain.getUniformPoints(radius*2);
		this.offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(points), 3);
		this.geometry.addAttribute("offset", this.offsetAttribute);
	},

	showControlPoints: function()
	{
		addDot(this.el, this.curve.v0, 0.1, "red");
		addDot(this.el, this.curve.v1, 0.1, "yellow");
		addDot(this.el, this.curve.v2, 0.1, "green");
		addDot(this.el, this.curve.v3, 0.1, "blue");
	}
});