AFRAME.registerComponent("random-children", {
	schema: {
		count: { type: "number", default:5 }
	},

	init: function()
	{
		var self = this;

		addChildren();
		
		document.addEventListener("keydown", function(e)
		{
			switch(e.key)
			{
				case "b":
					addChildren();
				case "]":
					addChild();
					break;
				case "[":
					removeChild();
					break;
			}
		});	

		function addChildren()
		{
			for(var i=0;i<self.data.count;i++)
			{
				addChild();
			}
		}

		function removeChild()
		{
			var children = self.el.getChildEntities();
			if(children.length <= 0) return;
			var index = Math.round(Math.random() * (children.length-1));
			//index = children.length-1;
			//index = 0;
			self.el.removeChild(children[index]);
		}

		function addChild()
		{
			var index = self.el.children.length;
			var child = document.createElement("a-box");
			child.setAttribute("id", `randomChild${index}`);
			child.setAttribute("width", 1);
			child.setAttribute("height", 1);
			child.setAttribute("width", randomRange(0.1, .3));
			child.setAttribute("height", randomRange(0.1, .3));
			child.setAttribute("depth", 0.05); //randomRange(0.02, 0.05));
			//child.setAttribute("color", `rgb(${randomInt(255)}, ${randomInt(255)}, ${randomInt(255)})`);
			child.setAttribute("color", `rgb(${Math.round(index/self.data.count*255)}, 120, 120)`);
			child.setAttribute("position", { x: 0, y: 5, z: 0 }); //TODO: this is just here so I dont have to see the items while the cluster layout its computing
			self.el.appendChild(child);
		}
	}
})

function randomInt(max)
{
	return Math.round(Math.random() * max);
}

function randomRange(min, max)
{
	return (Math.random() * (max - min)) + min;
}