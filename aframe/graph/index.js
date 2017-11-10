AFRAME.registerPrimitive("a-left-edge", { defaultComponents: { edge: "left" } });
AFRAME.registerPrimitive("a-right-edge", { defaultComponents: { edge: "right" } });
AFRAME.registerPrimitive("a-top-edge", { defaultComponents: { edge: "top" } });
AFRAME.registerPrimitive("a-bottom-edge", { defaultComponents: { edge: "bottom" } });

AFRAME.registerComponent("edge", {
	schema: {
		type: "string"
	},

	init: function()
	{
		var pos = { x: 0, y: 0, z: 0 };
		switch (this.data)
		{
			case "left":
				pos.x = -this.el.parentEl.getAttribute("width") / 2;
			break;

			case "right":
				pos.x = this.el.parentEl.getAttribute("width") / 2;
			break;

			case "top":
				pos.y = this.el.parentEl.getAttribute("height") / 2;
			break;

			case "bottom":
				pos.y = -this.el.parentEl.getAttribute("height") / 2;
			break;
		}
		this.el.setAttribute("position", pos);
	}
})