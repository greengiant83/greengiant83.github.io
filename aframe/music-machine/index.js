(function()
{
	AFRAME.registerComponent("curve", {
		init: function()
		{
			
			this.createBezierChain(toList(this.el.children));
			this.drawChain();
		},

		createBezierChain(elements)
		{
			this.bezierChain = new BezierChain();
			for(var i=1;i<elements.length;i++)
			{
				this.bezierChain.addSegment(this.getSegment(elements[i-1], elements[i]));
			}
		},

		drawChain: function()
		{
			var radius = 0.1;
			var points = this.bezierChain.getUniformPoints(radius*2);
			for(var i=0;i<points.length;i++)
			{
				this.addDot(points[i], radius);
			}
		},

		getSegment: function(elA, elB, chain)
		{
			var pt0 = toVector(elA.getAttribute("position"));
			var pt1 = toVector(elB.getAttribute("position"));
			var distance = pt1.clone().sub(pt0).length() * 1;
			var forward = new THREE.Vector3(0, 0, distance);
			var back = new THREE.Vector3(0, 0, -distance);
			//var forward = new THREE.Vector3(0, distance, 0);
			//var back = new THREE.Vector3(0, -distance, 0);

			elA.object3D.updateMatrix();
			elB.object3D.updateMatrix();
			forward.applyMatrix4(elA.object3D.matrix);
			back.applyMatrix4(elB.object3D.matrix);
			
			return new BezierSegment(pt0, forward, back, pt1);
		},	

		addDot: function(position, radius)
		{
				var dot = document.createElement("a-sphere");
				dot.setAttribute("radius", radius);
				dot.setAttribute("position", position);
				dot.setAttribute("color", "yellow");
				this.el.appendChild(dot);
		},			
	});

	function toVector(o)
	{
		return new THREE.Vector3(o.x, o.y, o.z);
	}

	function toList(collection)
	{
		var list = [];
		for(var i=0;i<collection.length;i++)
		{
			list.push(collection[i]);
		}
		return list;
	}
})();