AFRAME.registerComponent("center-and-scale", {
	schema: {
		a: { type: "selector" },
		b: { type: "selector" }
	},

	init: function()
	{
	},

	tick: function()
	{
		var a = this.data.a.object3D.position;
		var b = this.data.b.object3D.position;
		var c = a.clone().lerp(b, 0.5);
		var distance = a.distanceTo(b) * 0.25;
		if(distance == 0) distance = 0.01;

		this.el.object3D.position.copy(c);
		this.el.object3D.scale.set(distance, distance, distance);
	}
});

AFRAME.registerComponent("dupliverts", {
	schema: {
		pointDonor: { type: "selector" },
		a: { type: "selector" },
		b: { type: "selector" }
	},

	init: function()
	{
		var self = this;
		self.clones = [];
		self.rotOffsetValue = 0;
		self.rotOffset = new THREE.Quaternion();
		self.rotOffset.setFromAxisAngle(new THREE.Vector3(0, 1, 0), self.rotOffsetValue);
		
		Promise.all([getMesh(self.data.pointDonor), getMesh(self.el)]).then(function(results)
		{
			var pointMesh = self.pointMesh = results[0];
			var cloneMesh = results[1];	
			//var material = cloneMesh.material.clone();
			var materials = [
				new THREE.MeshStandardMaterial({color: 0xff0000, metalness: 0, roughness: 0.5}),
				new THREE.MeshStandardMaterial({color: 0x1e0e03, metalness: 0, roughness: 0.5}),
				new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0, roughness: 0.5})
			]

			for(var i=0;i<pointMesh.geometry.attributes.position.array.length;i+=pointMesh.geometry.attributes.position.itemSize)
			{
				var pos = {
					x: pointMesh.geometry.attributes.position.array[i+0],
					y: pointMesh.geometry.attributes.position.array[i+1],
					z: pointMesh.geometry.attributes.position.array[i+2]
				}

				var normal = new THREE.Vector3(
					pointMesh.geometry.attributes.normal.array[i+0],
					pointMesh.geometry.attributes.normal.array[i+1],
					pointMesh.geometry.attributes.normal.array[i+2]	
				);

				var clone = cloneMesh.clone();
				var rot = new THREE.Quaternion();
				rot.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
				clone.scale.set(0.1, 0.1, 0.1);


				clone.material = materials[(i/3) % materials.length];
				
				self.el.sceneEl.object3D.add(clone);
				self.clones.push({ object: clone, localPosition: pos, normal: normal, localRotation: rot });

				self.updateClones();
			}
		});
	},

	tick: function()
	{
		var self = this;

		//self.rotOffsetValue += 0.01;
		//self.rotOffset.setFromAxisAngle(new THREE.Vector3(0, 1, 0), self.rotOffsetValue);

		var a = self.data.a.object3D.position;
		var b = self.data.b.object3D.position;
		var c = new THREE.Vector3();
		c.subVectors(a, b);
		c.normalize();

		self.rotOffset.setFromUnitVectors(new THREE.Vector3(0, 0, 1), c);

		self.updateClones();
	},

	updateClones: function()
	{
		var self = this;
		
		for(var i=0;i<self.clones.length;i++)
		{
			var clone = self.clones[i];
			clone.object.position.copy(clone.localPosition);
			clone.object.position.applyMatrix4(self.pointMesh.matrixWorld);
			//clone.object.quaternion.multiplyQuaternions(clone.localRotation, self.rotOffset);
			clone.object.quaternion.multiplyQuaternions(self.rotOffset, clone.localRotation);
		}
	}
});

function getMesh(item)
{
	return new Promise(function(resolve, reject)
	{
		item.addEventListener("model-loaded", function()
		{
			var mesh = findChildByType(item.object3D, "Mesh");
			resolve(mesh);
		});
	});
}

function findChildByType(item, typeName)
{
	if(item.type == typeName) return item;		

	for(var i=0;i<item.children.length;i++)
	{
		var child = item.children[i];
		var childResult = findChildByType(child, typeName);
		if(childResult) return childResult;
	}
	return null;
}