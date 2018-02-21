AFRAME.registerComponent("bounds-test", {
	init: function()
	{
		var self = this;
		setTimeout(function()
		{
			var bb = getElementBounds(self.el);
			var box = document.createElement("a-box");
			
			box.setAttribute("material", { side: "double", color: "red", transparent: true, opacity: 0.5 });
			box.setAttribute("position", bb.getCenter());
			box.setAttribute("scale", bb.getSize());

			self.el.sceneEl.appendChild(box);
		}, 1);
	}
});

//////////////////////////////////



function getBoxCorners(size)
{
		size.multiplyScalar(0.5)
		var corners = [
			new THREE.Vector3(size.x, size.y, size.z),
			new THREE.Vector3(size.x, -size.y, size.z),
			new THREE.Vector3(-size.x, -size.y, size.z),
			new THREE.Vector3(-size.x, size.y, size.z),
			new THREE.Vector3(size.x, size.y, -size.z),
			new THREE.Vector3(size.x, -size.y, -size.z),
			new THREE.Vector3(-size.x, -size.y, -size.z),
			new THREE.Vector3(-size.x, size.y, -size.z),
		];
		return corners;
}

var boundsProviders = {
	"children": function(el, geometry)
	{
		var bb;
		for(var i=0;i<el.children.length;i++)
		{
			var childBB = getElementBounds(el.children[i]);
			if(childBB) 
				if(bb)
					bb.encompass(childBB);
				else
					bb = childBB;
		}
		return bb;
	},

	"sphere": function(el, geometry)
	{
		var r = geometry.radius;
		var d = r * 2;
		var corners = getBoxCorners(new THREE.Vector3(d, d, d));
		var bb = new BoundingBox();

		bb.fromWorldCorners(corners, el.object3D);
		return bb;
	},

	"box": function(el, geometry)
	{
		
		var corners = getBoxCorners(new THREE.Vector3(geometry.width, geometry.height, geometry.depth));
		var bb = new BoundingBox();
		bb.fromWorldCorners(corners, el.object3D);

		
		return bb;
	}
}

function getElementBounds(el)
{
	var geometry = el.getAttribute("geometry");
	var providerName;

	if(geometry)
	{
		providerName = geometry.primitive;
	}
	else if(el.children.length > 0)
	{
		providerName = "children";
	}

	var providerFunc = boundsProviders[providerName];
	if(providerFunc)
	{
		return providerFunc(el, geometry);
	}

	return new BoundingBox();
}

var BoundingBox = function()
{
	this.min = new THREE.Vector3();
	this.max = new THREE.Vector3();	
}

BoundingBox.prototype.getCenter = function()
{
	return this.min.clone().lerp(this.max, 0.5);
}

BoundingBox.prototype.getSize = function()
{
	return this.max.clone().sub(this.min);
}

BoundingBox.prototype.encompass = function(bb)
{
	this.min.min(bb.min);
	this.max.max(bb.max);
}

BoundingBox.prototype.toWorldSpace = function(object)
{
	object.localToWorld(this.min);
	object.localToWorld(this.max);		
}

BoundingBox.prototype.fromWorldCorners = function(localCorners, object)
{
	var self = this;
	localCorners.forEach(function(c, i)
	{
		object.localToWorld(c);
		if(i == 0)
		{
			self.min.copy(c);
			self.max.copy(c);
		}
		else
		{
			self.min.min(c);
			self.max.max(c);
		}
	});
}