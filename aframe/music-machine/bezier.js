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