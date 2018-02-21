class GrowLayoutProvider 
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
				index: 0
			}
	}

	childrenAdded(newItems)
	{
		var self = this;
		newItems.forEach(child => child.spatial = new SpatialInfo(child));
		self.scratch.index++;
		setTimeout(function()
		{
			newItems.forEach(function(child)
			{
				//self.queue = self.queue.then(() => self.placeItem(child));
				self.placeItem(child);
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
		for(var c=0;c<self.container.children.length;c++)
		{
			var curEl = self.container.children[c].spatial;
			if(curEl.isFrozen || !curEl.isEnabled) continue;
			self.isCalculating = true;

			var force = self.scratch.force;
			var v = self.scratch.v;

			//Add up forces
			force.set(0, 0, 0);
			force.add(v.copy(self.goal).sub(curEl.position).normalize().multiplyScalar(0.01)); //move toward goal
			curEl.position.add(force);

			//Check for collisions with other items
			for(var r=0;r<10;r++)
			{
				force.set(0, 0, 0);
				for(var i=0;i<self.container.children.length;i++)
				{
					var otherEl = self.container.children[i].spatial;
					if(otherEl == curEl) continue;
					//if(!otherEl.isFrozen) continue;


					if(curEl.left < otherEl.right && curEl.right > otherEl.left && curEl.top > otherEl.bottom && curEl.bottom < otherEl.top) 
					{
						v.subVectors(curEl.position, otherEl.position).normalize().multiplyScalar(0.002);
						curEl.position.add(v);
						v.multiplyScalar(-1);
						otherEl.position.add(v);
						//force.add(v);

						//find closest edge of intersecting object
						/*var leftPenetration = curEl.right - otherEl.left;
						var rightPenetration = otherEl.right - curEl.left
						var topPenetration = otherEl.top - curEl.bottom;
						var bottomPenetration = curEl.top - otherEl.bottom;

						v.set(rightPenetration-leftPenetration,topPenetration-bottomPenetration,0);
						//v.set(leftPenetration-rightPenetration,bottomPenetration-topPenetration,0);
						force.add(v);*/
						//var min = Math.min(leftPenetration, rightPenetration, topPenetration, bottomPenetration);
						
						/*switch(min)
						{
							case leftPenetration: curEl.position.add(v.set(-leftPenetration, 0, 0)); break;
							case rightPenetration: curEl.position.add(v.set(rightPenetration, 0, 0)); break;
							case topPenetration: curEl.position.add(v.set(0, topPenetration, 0)); break;
							case bottomPenetration: curEl.position.add(v.set(0, -bottomPenetration, 0)); break;
						}*/
					}
				}
				curEl.position.add(force);
			}

			
			
			//Enforce constraints
			
			//If its within a step of the goal, just consider it good
			if(curEl.position.distanceTo(self.goal) < 0.01) curEl.position.copy(self.goal);
			

			//Check for low velocity
			/*var speed = curEl.position.distanceTo(curEl.lastPosition);
			if(speed < 0.0001)
			{
				curEl.isFrozen = true;
				curEl.el.emit("location-set");
			}*/

			curEl.lastPosition.copy(curEl.position);	
		}
	}

	getSpawnPoint()
	{
		var r = randomRange(-.2, .2);
		var theta = randomRange(0, Math.PI*2);
		var spawnPoint = new THREE.Vector3(Math.sin(theta) * r, Math.cos(theta) * r);
		return spawnPoint
	}
}