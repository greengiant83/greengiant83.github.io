AFRAME.registerComponent("comp-manager", {
	init: function()
	{
		var self = this;
		self.compRef = null;

		db.ref("compositions").limitToFirst(1).once("child_added", function(snap)
		{
			self.compRef = snap.ref;
			self.el.emit("comp-selected", self.compRef);
		})
	}
})


function addComp(title)
{
	var newComp = comps.push();
	newComp.set({
		title: title || "New Comp"
	});
}

