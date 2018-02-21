AFRAME.registerComponent('fit-image', {
	schema: {
		type:"string"
	},

	init: function()
	{
		var self = this;

		var geometry = this.el.getAttribute('geometry');
		this.targetWidth = geometry.width;

		this.el.setAttribute("width", 0.1);
		this.el.setAttribute("height", 0.1);
		this.el.addEventListener("materialtextureloaded", function(e)
		{
			var w = e.detail.texture.image.videoWidth || e.detail.texture.image.width;
			var h = e.detail.texture.image.videoHeight || e.detail.texture.image.height;

			// Don't apply transformation on incomplete info
			if(h === 0 || w === 0) return;

			// Save dimensions for later updates to `fit-texture`, see above.
			self.dimensions = {w:w, h:h};

			var mesh = self.el.object3D.children[0];
			var material = mesh.material;
			var map = material.map;
			material.map.wrapS = THREE.ClampToEdgeWrapping;
			material.map.wrapT = THREE.ClampToEdgeWrapping;
			material.map.minFilter = THREE.LinearFilter;

			self.applyTransformation();
		});
	},

	applyTransformation: function () 
	{
		var el = this.el;
		var geometry = el.getAttribute('geometry');
		var widthHeightRatio = this.dimensions.h / this.dimensions.w;

		el.setAttribute("width", this.targetWidth);
		el.setAttribute('height', this.targetWidth * widthHeightRatio);
		el.emit("resized");
	},
});