AFRAME.registerComponent("cluster-layout", {
	get children()
	{
		if(this.el)
			return this.el.getChildEntities();
		else
			return [];
	},

	init: function()
	{
		var self = this;

		self.layoutProvider = new GrowLayoutProvider(this);

		this.el.addEventListener("child-attached", function(e)
		{
			if(e.detail.el.parentNode != self.el) return;
			self.children = self.el.getChildEntities();
			self.layoutProvider.childrenAdded([e.detail.el]);
		});

		this.el.addEventListener("child-detached", function(e)
		{
			if(self.children.indexOf(e.detail.el) < 0) return;
			self.children = self.el.getChildEntities();
			self.layoutProvider.childrenRemoved([e.detail.el]);
		});
	},

	tick: function()
	{
		if(this.layoutProvider.tick) this.layoutProvider.tick();
	}
});

////////////////////////////////////

class ClusterLayoutProvider 
{
	constructor(container) 
	{
		this.useLoop = false;
		this.container = container;
		this.goal = new THREE.Vector3(0, 0, 0);
		this.queue = Promise.resolve();
		this.isCalculating = false;
		this.scratch = {
				force: new THREE.Vector3(),
				v: new THREE.Vector3(),
			}
	}

	childrenAdded(newItems)
	{
		var self = this;
		newItems.forEach(child => child.spatial = new SpatialInfo(child));
		setTimeout(function()
		{
			newItems.forEach(function(child)
			{
				self.queue = self.queue.then(() => self.placeItem(child));
				child.addEventListener("resized", function()
				{
					child.spatial.updateSize();
					//if(child.spatial.isFrozen) self.queue = self.queue.then(() => self.placeItem(child));
				});
			});
		}, 1);
	}

	childrenRemoved(removedItems)
	{
		//console.log("TODO: implement childrenRemoved", removedItems);
	}

	placeItem(el)
	{
		var self = this;
		var spatial = el.spatial;

		return new Promise(function(resolve, reject)
		{
			spatial.position.copy(self.getSpawnPoint());
			spatial.isEnabled = true;
			spatial.isFrozen = false;

			el.addEventListener("location-set", function()
			{
				resolve();
			});
		});
	}

	tick()
	{
		var self = this;
		while(true)
		{
			self.isCalculating = false;
			for(var c=0;c<self.container.children.length;c++)
			{
				var curEl = self.container.children[c].spatial;
				if(curEl.isFrozen || !curEl.isEnabled) continue;
				self.isCalculating = true;

				var force = self.scratch.force;
				var v = self.scratch.v;

				//Add up forces
				force.set(0, 0, 0);
				force.add(v.copy(self.goal).sub(curEl.position).normalize().multiplyScalar(0.05)); //move toward goal
				curEl.position.add(force);
				
				//Enforce constraints
				for(var r=0;r<100;r++)
				{
					//If its within a step of the goal, just consider it good
					if(curEl.position.distanceTo(self.goal) < 0.01) curEl.position.copy(self.goal);

					//Check for collisions with other items
					for(var i=0;i<self.container.children.length;i++)
					{
						var otherEl = self.container.children[i].spatial;
						if(otherEl == curEl) continue;
						if(!otherEl.isFrozen) continue;


						if(curEl.left < otherEl.right && curEl.right > otherEl.left && curEl.top > otherEl.bottom && curEl.bottom < otherEl.top) 
						{
							//find closest edge of intersecting object
							var leftPenetration = curEl.right - otherEl.left;
							var rightPenetration = otherEl.right - curEl.left
							var topPenetration = otherEl.top - curEl.bottom;
							var bottomPenetration = curEl.top - otherEl.bottom;
							var min = Math.min(leftPenetration, rightPenetration, topPenetration, bottomPenetration);
							
							switch(min)
							{
								case leftPenetration: curEl.position.add(v.set(-leftPenetration, 0, 0)); break;
								case rightPenetration: curEl.position.add(v.set(rightPenetration, 0, 0)); break;
								case topPenetration: curEl.position.add(v.set(0, topPenetration, 0)); break;
								case bottomPenetration: curEl.position.add(v.set(0, -bottomPenetration, 0)); break;
							}
						}
					}
				}

				//Check for low velocity
				var speed = curEl.position.distanceTo(curEl.lastPosition);
				if(speed < 0.0001)
				{
					curEl.isFrozen = true;
					curEl.el.emit("location-set");
				} 

				curEl.lastPosition.copy(curEl.position);	
			}
			if(!self.useLoop) break;
			if(!self.isCalculating) break;
		}
		//console.log("isCalculating", self.isCalculating);
	}

	getSpawnPoint()
	{
		var r = this.getBoundingRadius() + 1;
		var theta = randomRange(0, Math.PI*2);
		var spawnPoint = new THREE.Vector3(Math.sin(theta) * r, Math.cos(theta) * r);

		var containerPos = this.container.el.getAttribute("position");
		var myCircle = document.getElementById("myCircle");
		myCircle.setAttribute("position", { 
			x: containerPos.x,
			y: containerPos.y,
			z: containerPos.z
		});
		myCircle.setAttribute("radius", r);

		return spawnPoint
	}

	getBoundingRadius()
	{
		var v = 0;
		this.container.children.forEach(child => v = Math.max(v, child.spatial.isFrozen ? child.spatial.position.distanceTo(this.goal) : 0));
		return v;
	}
}


class SpatialInfo
{
	get left() { return this.position.x - this.width / 2; }
	get right() { return this.position.x + this.width / 2; }
	get top() { return this.position.y + this.height / 2; }
	get bottom() { return this.position.y - this.height / 2; }

	constructor(el)
	{
		this.el = el;
		this.position = el.object3D.position;
		this.lastPosition = new THREE.Vector3();
		this.isFrozen = false;
		this.isEnabled = false;
		this.updateSize();
	}

	updateSize()
	{
		var padding = 0.025;
		this.width = this.el.getAttribute("width") * 1 + padding;
		this.height = this.el.getAttribute("height") * 1 + padding;
	}
}

class BoundingBox
{
	get width() { return this.right - this.left; }
	get height() { return this.top - this.bottom; }

	constructor(left, right, top, bottom)
	{
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	}
}

function randomRange(min, max)
{
	return (Math.random() * (max - min)) + min;
}