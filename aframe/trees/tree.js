AFRAME.registerComponent("positional-note-player", (function()
{
	var self;
	var bucketSize = 0.1; //Height in meters between notes
	var note = 1;
	var lastNotePlayed = -1;

	return {
		init: function()
		{
			self = this;
			this.timer = setInterval(this.beat, 125);
		},

		remove: function()
		{
			clearInterval(this.timer);
		},

		beat: function()
		{
			if(note == lastNotePlayed) return;

			soundManager.playNote(note, self.el);
			lastNotePlayed = note;
		},

		tick: function()
		{
			var y = this.el.object3D.position.y;
			if(y < 0) y = 0;
			
			note = Math.floor(y / bucketSize);
			note = note % soundManager.noteCount;
		}
	}
})());

AFRAME.registerComponent("tree", {
	init: function()
	{
		//Ice tones
		//var h = Math.round(Math.randomRange(182, 236));
		//var s = 100;
		//var l = Math.round(Math.randomRange(50, 100));

		//Fire
		var h = Math.round(Math.randomRange(0, 60));
		var s = 100;
		var l = Math.round(Math.randomRange(50, 100));

		var color = new THREE.Color("hsl(" + h + ", " + s + "%, " + l + "%)");
		
		this.container = new THREE.Object3D();
		this.particleMaterial = new THREE.MeshStandardMaterial({color: color});
		//this.particleMaterial = new THREE.MeshNormalMaterial();
		this.particleGeometry = new THREE.CubeGeometry(1, 1, 1);
		this.el.sceneEl.object3D.add(this.container);
		this.maxLength = 500;
		//this.shrinkRate = 0.99;
		this.shrinkRate = 1.01;
		this.particleSize = 0.15;
		this.objects = {}
		this.objects.count = 0;
		this.objects.first = this.objects.last = this.createParticle();
		this.gap = Math.pow(0.01, 2);

		//<a-box position="0 0 -3" sound="src: #growSound;loop:true;autoplay:true"></a-box>
		this.el.setAttribute("positional-note-player", true);

	},

	remove: function()
	{
		//this.createTreeTop();
		this.freezeMesh();
		this.el.removeAttribute("positional-note-player");
	},

	createTreeTop: function()
	{

		var particle = new THREE.Mesh(this.particleGeometry, this.particleMaterial);
		particle.position.copy(this.el.object3D.position);
		particle.rotation.set(Math.randomRange(-10, 10), Math.randomRange(0, 360), Math.randomRange(-10, 10));

		var size = Math.randomRange(20, 30) * this.particleSize;
		console.log("adding tree top", this.el.object3D.position);
		particle.scale.set(size, size, size);
		this.container.add(particle);
	},

	freezeMesh: function()
	{
		var geometry = new THREE.Geometry();
		var indexOffset = 0;
		for(var i=0;i<this.container.children.length;i++)
		{
			var child = this.container.children[i].geometry;
			var childMatrix = this.container.children[i].matrixWorld;

			for(var v=0;v<child.vertices.length;v++)
			{
				var vertex = child.vertices[v].clone();
				vertex.applyMatrix4(childMatrix);
				geometry.vertices.push(vertex);
			}

			for(var f=0;f<child.faces.length;f++)
			{
				geometry.faces.push(new THREE.Face3(
					child.faces[f].a + indexOffset,
					child.faces[f].b + indexOffset,
					child.faces[f].c + indexOffset
				));
			}

			indexOffset += child.vertices.length;
		}
		geometry.computeFaceNormals();

		var mesh = new THREE.Mesh(geometry, this.particleMaterial); // new THREE.MeshStandardMaterial({ color: "red" }));
		this.el.sceneEl.object3D.add(mesh);

		this.container.parent.remove(this.container);
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
		particle.scale.set(Math.randomRange(0, this.particleSize), Math.randomRange(0, this.particleSize), Math.randomRange(0, this.particleSize));
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