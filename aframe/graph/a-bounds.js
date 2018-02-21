

AFRAME.registerPrimitive("a-bounds", { defaultComponents: { "bounds-container": true }});

AFRAME.registerComponent("bounds-container", {
	init: function()
	{
		var contentEl = this.el.querySelector("a-content");

		contentEl.addEventListener("bounds-updated", function(bounds)
		{
			updateTemplate();
		});

		var templateEl = this.el.querySelector("a-template");
		updateTemplate();

		function updateTemplate()
		{
			var contentBounds = contentEl.children[0].boundingBox;
			var center = new THREE.Vector3().lerpVectors(contentBounds.min, contentBounds.max, 0.5);// contentBounds.max.clone().sub(contentBounds.min); //.divide(2);
			var scale = contentBounds.max.clone().sub(contentBounds.min);
			templateEl.setAttribute("position", center);
			templateEl.setAttribute("scale", scale);
		}
	}
});

//////////////////////////

AFRAME.registerPrimitive("a-template", { defaultComponents: { "template-layout": true }});

AFRAME.registerComponent("template-layout", {
	init: function()
	{
	}
});

//////////////////////////

AFRAME.registerPrimitive("a-content", { defaultComponents: { "content-layout": true }});

AFRAME.registerComponent("content-layout", {
	init: function()
	{
	}
});
