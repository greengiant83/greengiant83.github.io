AFRAME.registerComponent("hologram-material", {
	init: function()
	{
		var shader = THREE.BasicShader;
		var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
		this.material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true
		});
		this.el.addEventListener("model-loaded", () => this.update());
	},

	update: function() 
	{
		var mesh = this.findChildByType(this.el.object3D, "Mesh");
		//var theirMesh = this.el.getObject3D("mesh"); //<---- Doesn't find the proper object
		if(mesh) mesh.material = this.material;
	},

	findChildByType: function(item, typeName)
	{
		if(item.type == typeName) return item;		

		for(var i=0;i<item.children.length;i++)
		{
			var child = item.children[i];
			var childResult = this.findChildByType(child, typeName);
			if(childResult) return childResult;
		}
		return null;
	}
})