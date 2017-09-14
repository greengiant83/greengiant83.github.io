AFRAME.registerComponent("trail", {
	init: function()
	{
		this.particleMaterial = new THREE.MeshNormalMaterial();
		this.particleGeometry = new THREE.SphereGeometry(0.5);
		
		this.reset();
		this.enabled = false;

		var self = this;
		this.el.parentEl.addEventListener("pointingstart", function(e)
		{
			self.reset();
		});

		this.el.parentEl.addEventListener("pointingend", function(e)
		{
			self.enabled = false;
		})
	},

	reset: function()
	{
		if(this.container) 
		{
			console.log("clearing container");
			this.el.sceneEl.object3D.remove(this.container);
		}

		this.container = new THREE.Object3D();
		this.el.sceneEl.object3D.add(this.container);

		this.maxLength = 300;
		this.shrinkRate = 0.99;
		this.locations = {}
		this.locations.count = 0;
		this.locations.first = this.locations.last = this.pushNextLocation(this.el.object3D.getWorldPosition());

		this.gap = 0.001;
		this.gapSqr = Math.pow(this.gap, 2);
		this.enabled = true;
	},

	tick: function()
	{
		if(!this.enabled) return;

		var currentPos = this.el.object3D.getWorldPosition();
		while(currentPos.distanceToSquared(this.locations.last.position) > this.gapSqr)
		{
			var direction = currentPos.clone().sub(this.locations.last.position);
			direction.normalize();
			direction.multiplyScalar(this.gap);
			var newPosition = this.locations.last.position.clone();
			newPosition.add(direction);

			var newLocation = this.pushNextLocation(newPosition);
			this.locations.last.next = newLocation;
			newLocation.prev = this.locations.last;
			this.locations.last = newLocation;
			this.createParticle(newLocation);
			this.cullParticles();			
			this.shrinkParticles();
		}
	},

	createParticle: function(location)
	{
		if(!location.prev.theta)
			location.theta = 1; //Don't set to zero, or the above check will get confused
		else
			location.theta = location.prev.theta += THREE.Math.DEG2RAD * 137.5;

		var origin = new THREE.Group();
		origin.position.copy(location.position);
		origin.up = location.up;
		origin.lookAt(location.position.clone().add(location.forward));

		var oBox = new THREE.Mesh(this.particleGeometry, this.particleMaterial);
		oBox.position.set(0, 0, 0);
		oBox.scale.set(0.01, 0.01, 0.01);
		origin.add(oBox);

		var rotator = new THREE.Group();
		rotator.rotation.set(0, 0, location.theta);
		origin.add(rotator);

		var box = new THREE.Mesh(this.particleGeometry, this.particleMaterial);
		var petalLength = Math.randomRange(0.1, 0.2); // 0.1;
		box.position.set(0, petalLength / 2, 0);
		box.scale.set(0.05, petalLength, 0.015);
		rotator.add(box);
		
		this.container.add(origin);
		location.visual = origin;
	},

	pushNextLocation: function(position)
	{
		var location = {};
		location.position = position;
		this.locations.count++;

		if(this.locations.last)
		{
			location.up;
			location.right = new THREE.Vector3();
			location.forward = location.position.clone();
			location.forward.sub(this.locations.last.position)
			location.forward.normalize();
			
			if(this.locations.last.up)
				location.up = this.locations.last.up;
			else
				location.up = new THREE.Vector3(0, 1, 0);
		
			location.right.crossVectors(location.forward, location.up);

			location.up = new THREE.Vector3();
			location.up.crossVectors(location.right, location.forward);
			location.up.normalize();
		}
		
		return location;
	},

	cullParticles: function()
	{
		if(this.locations.count > this.maxLength)
		{
			var deadParticle = this.locations.first;
			this.locations.first = deadParticle.next;
			this.container.remove(deadParticle.visual);
			this.locations.count--;
		}
	},

	shrinkParticles: function()
	{
		var p = this.locations.first;
		while(p != this.locations.last)
		{
			if(p.visual) p.visual.scale.multiplyScalar(this.shrinkRate);
			p = p.next;
		}
	}
})


Math.randomRange = function(min, max)
{
	return (Math.random() * (max - min)) + min;
}