AFRAME.registerComponent("trail", {
	init: function()
	{
		this.container = new THREE.Object3D();
		this.particleMaterial = new THREE.MeshNormalMaterial();
		this.particleGeometry = new THREE.CubeGeometry(1, 1, 1);
		this.el.sceneEl.object3D.add(this.container);
		this.maxLength = 150;
		this.shrinkRate = 0.99;
		this.objects = {}
		this.objects.count = 0;
		this.objects.first = this.objects.last = this.createParticle();
		this.gap = Math.pow(0.01, 2);
	},

	tick: function()
	{
		var currentPos = this.el.object3D.position;
		if(currentPos.distanceToSquared(this.objects.last.position) > this.gap)
		{
			var newParticle = this.createParticle();
			this.objects.last.next = newParticle;
			this.objects.last = newParticle

			this.cullParticles();			
			this.shrinkParticles();
		}
	},

	createParticle: function()
	{
		var particle = new THREE.Mesh(this.particleGeometry, this.particleMaterial);
		particle.position.copy(this.el.object3D.position);
		particle.rotation.set(Math.randomRange(0, 360), Math.randomRange(0, 360), Math.randomRange(0, 360));
		particle.scale.set(Math.randomRange(0, 0.1), Math.randomRange(0, 0.1), Math.randomRange(0, 0.1));
		this.container.add(particle);
		this.objects.count++;
		
		return particle;
	},

	cullParticles: function()
	{
		if(this.objects.count > this.maxLength)
		{
			var deadParticle = this.objects.first;
			this.objects.first = deadParticle.next;
			this.container.remove(deadParticle);
			this.objects.count--;
		}
	},

	shrinkParticles: function()
	{
		var p = this.objects.first;
		while(p != this.objects.last)
		{
			p.scale.multiplyScalar(this.shrinkRate);
			p = p.next;
		}
	}
})


//Helper functions
Math.randomRange = function(min, max)
{
	return (Math.random() * (max - min)) + min;
}

Math.randomVector = function(r)
{
	return new THREE.Vector3(Math.randomRange(-r, r), Math.randomRange(-r, r), Math.randomRange(-r, r));
}