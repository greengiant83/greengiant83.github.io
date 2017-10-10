AFRAME.registerComponent("layout", {
	init: function()
	{
		var self = this;

		self.layoutProvider = new ConeLayoutProvider(this);

		self.updateLayout();

		this.el.addEventListener("child-attached", function(e)
		{
			if(e.detail.el.parentNode != self.el) return;
			self.updateLayout({newItem:e.detail.el});
		});

		this.el.addEventListener("child-detached", function(e)
		{
			if(self.children.indexOf(e.detail.el) < 0) return;
			self.updateLayout({removedItem:e.detail.el});
		});
	},

	update: function()
	{
	},

	updateLayout: function()
	{
		this.children = this.el.getChildEntities();
		this.layoutProvider.update.apply(this.layoutProvider, arguments);		
	},
});


class ConeLayoutProvider 
{
	constructor(container, {name = "matt", age = 34} = {}) 
	{
		this.container = container;

		var spread = 90 * THREE.Math.DEG2RAD;
		this.points = [];
		var rows = 15;
		var rowSpacing = 0.5; // .2;
		var colWidth = 0.5; //0.1;
		var jitterRadius = { x: 0.01, y: 0.02, z:0.1 };
		
		this.points.push(new THREE.Vector3(0, 0, 0));
		for(var row=0;row<rows;row++)
		{
			var radius = row * rowSpacing;
			var length = radius * spread;
			var cols = Math.round(length / colWidth);
			var colSpacing = spread / (cols-1);

			for(var col=0;col<cols;col++)
			{
				var jitter = { x: randomRange(-jitterRadius.x, jitterRadius.x), y: randomRange(-jitterRadius.y, jitterRadius.y), z: randomRange(-jitterRadius.z, jitterRadius.z) };	
				var v = new THREE.Vector3(0, radius*2, 0);
				var r = col * colSpacing - spread / 2;
				var rot = new THREE.Quaternion();
				rot.setFromAxisAngle(new THREE.Vector3(0, 0, 1), r);
				v.applyQuaternion(rot);
				v.y *= 0.5;
				v.add(jitter);
				this.points.push(v);
			}
		}

		this.points.sort(function(a,b)
		{
			return a.lengthSq() - b.lengthSq();
		});
	}

	update({ newItem = null, removedItem = null} = {})
	{
		var self = this;

		if(removedItem)
		{
			var holeIndex = removedItem.getAttribute("layout-index");
			self.fillHole(holeIndex, 0);
			return;
		}

		if(newItem)
		{
			self.addItem(newItem);
			return;
		}

		
		var children = this.container.children;
		
		children.forEach(function(el, i)
		{
			var existingIndex = el.getAttribute("layout-index");

			var v = self.points[i];
			el.setAttribute("seek-position", 
			{ 
				x: v.x,
				y: v.y,
				z: v.z
			});

			el.setAttribute("layout-index", i);
			self.maxIndex = i;
		});
	}

	addItem(item)
	{
		var maxIndex = -1;
		this.container.children.forEach(function(i)
		{
			var index = i.getAttribute("layout-index") * 1;
			if(index > maxIndex) maxIndex = index;
		});
		maxIndex++;

		var v = this.points[maxIndex];
		item.setAttribute("seek-position", 
		{ 
			x: v.x,
			y: v.y,
			z: v.z
		});

		item.setAttribute("layout-index", maxIndex);
	}

	fillHole(holeIndex, iteration)
	{
		var holePosition = this.points[holeIndex];
		var nearestNeighbor = null;
		var nearestDistance = -1;
		var neighborFound = false;
		
		this.container.children.forEach(function(el)
		{
			var index = el.getAttribute("layout-index");
			if(index*1 > holeIndex*1)
			{
				var distance = holePosition.distanceToSquared(el.getAttribute("seek-position"));
				
				if(nearestDistance == -1 || distance < nearestDistance)
				{
					nearestDistance = distance;
					nearestNeighbor = el;
					neighborFound = true;
				}
			}
		});
		if(neighborFound) 
		{
			var oldIndex = nearestNeighbor.getAttribute("layout-index");
			nearestNeighbor.setAttribute("seek-position",
				{ 
					x: holePosition.x,
					y: holePosition.y,
					z: holePosition.z
				});
			nearestNeighbor.setAttribute("layout-index", holeIndex);
		
			this.fillHole(oldIndex, iteration+1);
		}
	}
}

class SquareGridLayoutProvider 
{
	constructor(container, {name = "matt", age = 34} = {}) 
	{
		this.container = container;
	}

	update({ newItem = null, removedItem = null} = {})
	{
		

		var self = this;
		var children = this.container.children;
		var cols = Math.ceil(Math.sqrt(children.length));
		var spacing = 0.5;
		var offset = { x: -(cols-1) * spacing / 2, y: 0}
		var jitterRadius = 0.05;

		children.forEach(function(el, i)
		{
			var col = i % cols;
			var row = Math.floor(i / cols);
			var jitter = { x: randomRange(-jitterRadius, jitterRadius), y: randomRange(-jitterRadius, jitterRadius), z: randomRange(-jitterRadius, jitterRadius) };
			if(row % 2 == 0) col = (cols-1) - col;
			el.setAttribute("seek-position", 
			{ 
					x: col*spacing + offset.x + jitter.x, 
					y: row*spacing + offset.y + jitter.y, 
					z: jitter.z
			});
		});
	}
}

AFRAME.registerComponent("seek-position", {
	schema: { type: "vec3" },
	init: function()
	{
		var self = this;
		self.targetPos = this.data;
		self.isSeeking = true;
	},

	update: function(oldData)
	{
		this.targetPos = this.data;
		this.isSeeking = true;
	},

	tick: function()
	{
		if(this.isSeeking) this.move();
	},

	move: function()
	{
		var positionAttribute = this.el.getAttribute("position");
		var position = new THREE.Vector3(positionAttribute.x, positionAttribute.y, positionAttribute.z);
		//this.el.object3D.position.lerp(this.targetPos, 0.1);
		position.lerp(this.targetPos, 0.1);
		this.el.setAttribute("position", position);
		
		var delta = this.el.object3D.position.distanceToSquared(this.targetPos);
		if(delta < 0.0001)
		{
			this.isSeeking = false;
			//this.el.object3D.position.set(this.targetPos.x, this.targetPos.y, this.targetPos.z);
		}
	}
});

function randomRange(min, max)
{
	return (Math.random() * (max - min)) + min;
}