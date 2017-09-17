AFRAME.registerComponent("test", {
	init: function()
	{
		var self = this;

		var i = 1;
		var timer = setInterval(function()
		{
			soundManager.play(i, self.el);
			i++;
			if(i > 37)  i = 1;
		}, 500);
	}
});

AFRAME.registerComponent("tree-grower", {
	init: function()
	{
		var self = this;
		//var indicator = document.querySelector("#indicator");
		var indicator = document.createElement("a-box");
		indicator.setAttribute("scale", { x: 0.1, y: 0.1, z: 0.1 });
		indicator.setAttribute("color", "red");
		this.el.sceneEl.appendChild(indicator);

		var colliderPlate;
		var hitPoint;

		var raycaster;
		setTimeout(function()
		{
			raycaster = self.el.components.raycaster;
			self.el.setAttribute("raycaster", { interval: 10 });
		}, 1000) //TODO: There has got to be a better way to know when the raycaster is available
		


		self.el.addEventListener("raycaster-intersection", function(e)
		{
			hitPoint = e.detail.intersections[0].point.clone();
			indicator.object3D.position.copy(hitPoint);
		});

		this.el.addEventListener("triggerdown", function(e)
		{
			if(!hitPoint) return;

			colliderPlate = document.createElement("a-box");
			colliderPlate.setAttribute("scale", { x: 3000, y: 3000, z: 0.1});
			colliderPlate.setAttribute("position", { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z });
			colliderPlate.setAttribute("class", "growSurface");
			colliderPlate.setAttribute("visible", false);			
			self.el.sceneEl.appendChild(colliderPlate);

			indicator.setAttribute("tree", true);

			setTimeout(function()
			{
				var camera = document.querySelector("a-camera");
				var direction = new THREE.Vector3().copy(camera.object3D.position);
				direction.sub(hitPoint);
				direction.y = 0;
				direction.add(hitPoint);
				colliderPlate.object3D.lookAt(direction);
			}, 1);
		});	

		this.el.addEventListener("triggerup", function(e)
		{
			if(!colliderPlate) return;
			indicator.removeAttribute("tree");
			self.el.sceneEl.removeChild(colliderPlate)
		});	
	}
})

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

Math.randomRange = function(min, max)
{
	return (Math.random() * (max - min)) + min;
}