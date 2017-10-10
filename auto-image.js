AFRAME.registerComponent("auto-image", {
	init: function()
	{
		var href = this.el.components.link.attrValue.href;
		var snapshotUrl = href + "snapshot.png"; //TODO: make this is a bit smarter
		console.log("url", snapshotUrl);
		this.el.setAttribute("image", "url(" + snapshotUrl + ")");
	}
})