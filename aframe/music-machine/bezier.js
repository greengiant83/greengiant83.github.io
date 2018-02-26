//TODO: Evalulate if switching to three.js native's curve implementation makes sense
//https://github.com/mrdoob/three.js/blob/dev/src/extras/core/CurvePath.js

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

			var material = new THREE.LineBasicMaterial({ color:0xff0000ff });
			var geometry = new THREE.Geometry();

			for(var i=0;i<points.length;i++)
			{
				//this.addDot(points[i], radius);
				geometry.vertices.push(points[i]);
			}

			var line = new THREE.Line(geometry, material);
			this.el.object3D.add(line);
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
})();

//////////////////////////////

function BezierChain(segments)
{
	this.segments = segments || [];
	for(var i=0;i<this.segments.length;i++)
	{
		this.addSegment(this.segments[i]);
	}
}

BezierChain.prototype = 
{
	length: 0,

	addSegment: function(segment)
	{
		this.segments.push(segment);
		this.length += segment.length;
	},

	getUniformPoints: function(spacing)
	{
		var points = [];
		for(var i=0;i<this.segments.length;i++)
		{
			this.segments[i].addUniformPoints(spacing, points);
		}
		points.push(this.segments[this.segments.length-1].d);
		return points;
	}
}

function BezierSegment(a, b, c, d) 
{
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

	this.sampleResolution = 100;
	this.arcLengths = new Array(this.sampleResolution + 1);
	this.arcLengths[0] = 0;

	var oPoint = a.clone();
	var clen = 0;
	var increment = 1 / this.sampleResolution;
	for(var i = 1; i <= this.sampleResolution; i += 1) 
	{
		var point = this.sample(i * increment, false);
		clen += oPoint.sub(point).length();
		this.arcLengths[i] = clen;
		oPoint = point;
	}
	this.length = clen;
}

BezierSegment.prototype = 
{
	map: function(u) {
		var targetLength = u * this.arcLengths[this.sampleResolution];
		var low = 0;
		var high = this.sampleResolution;
		var index = 0;

		while (low < high) 
		{
			index = low + (((high - low) / 2) | 0);
			if (this.arcLengths[index] < targetLength) 
				low = index + 1;
			else
				high = index;
		}

		if (this.arcLengths[index] > targetLength) index--;

		var lengthBefore = this.arcLengths[index];
		if (lengthBefore === targetLength)
			return index / this.sampleResolution;
		else
			return (index + (targetLength - lengthBefore) / (this.arcLengths[index + 1] - lengthBefore)) / this.sampleResolution;
	},

	addUniformPoints: function(spacing, points)
	{
		var count = Math.round(this.length / spacing);
		var increment = 1 / count;		
		var v = 0;
		for(var i=0;i<count;i++)
		{
			points.push(this.sample(v, true));
			v += increment;
		}
	},

	sample: function(v, isUniform)
	{
		var t = isUniform ? this.map(v) : v;

		var x = ((1 - t) * (1 - t) * (1 - t)) * this.a.x
						+ 3 * ((1 - t) * (1 - t)) * t * this.b.x
						+ 3 * (1 - t) * (t * t) * this.c.x
						+ (t * t * t) * this.d.x;

		var y = ((1 - t) * (1 - t) * (1 - t)) * this.a.y
						+ 3 * ((1 - t) * (1 - t)) * t * this.b.y
						+ 3 * (1 - t) * (t * t) * this.c.y
						+ (t * t * t) * this.d.y;

		var z = ((1 - t) * (1 - t) * (1 - t)) * this.a.z
						+ 3 * ((1 - t) * (1 - t)) * t * this.b.z
						+ 3 * (1 - t) * (t * t) * this.c.z
						+ (t * t * t) * this.d.z;

		return new THREE.Vector3(x, y, z);
	},	
};