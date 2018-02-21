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
		var parentSize = { x: this.el.parentEl.getAttribute("width"), y: this.el.parentEl.getAttribute("height") };
		switch (this.data)
		{
			case "left":
				pos.x = -parentSize.x / 2;
				this.el.setAttribute("height", parentSize.y);
			break;

			case "right":
				pos.x = parentSize.x / 2;
				this.el.setAttribute("height", parentSize.y);
			break;

			case "top":
				pos.y = parentSize.y / 2;
				this.el.setAttribute("width", parentSize.x);
			break;

			case "bottom":
				pos.y = -parentSize.y / 2;
				this.el.setAttribute("width", parentSize.x);
			break;
		}
		this.el.setAttribute("position", pos);
	}
})