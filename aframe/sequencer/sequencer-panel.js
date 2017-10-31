AFRAME.registerComponent("sequencer-panel", {
	schema: {
		rows: { default: 8 },
		cols: { default: 12 },
		size: { default: 0.25 }
	},

	update: function()
	{
		var self = this;
		var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
		
		mesh.material = new THREE.MeshStandardMaterial(
		{
			color: "white", 
			map: new THREE.TextureLoader().load("images/panel-color.png"),
			emissiveMap: new THREE.TextureLoader().load("images/panel-emissive.png"),
			emissive: new THREE.Color(0xffffff),
			side: THREE.DoubleSide
		});

		self.geometry = mesh.geometry = new THREE.Geometry();;
		self.dbRef = db.ref("seq");
		self.squaresRef = self.dbRef.child("squares");
		self.generateGrid(this.data.cols, this.data.rows, this.data.size);
		self.wireGridToDB();
		self.el.object3D.add(mesh);

		self.el.addEventListener("click", function(e)
		{
			var square = e.detail.intersection.face.square;
			square.isOn = !square.isOn;
		});	
	},

	wireGridToDB: function()
	{
		/*this.dbRef = db.ref("seq");
		this.squaresRef = this.dbRef.child("squares");
		this.squares.forEach(square => {
			square.ref = this.squaresRef.child(square.key);
			square.ref.on("value", snap => {
				square.isOn = snap.val();
			});
		})
		*/
	},

	generateGrid: function(cols, rows, size)
	{
		this.squares = [];
		this.colSquares = [];
		this.geometry.faceVertexUvs[0] = [];
		for(var col=0;col<=cols;col++)
		{
			this.colSquares.push([]);
			for(var row=0;row<=rows;row++)
			{
				this.geometry.vertices.push({x: col*size, y: row*size, z:Math.sin(col) * 0.1});
			}

			if(col > 0)
			{
				for(var row=1;row<=rows;row++)
				{
					this.addSquare(row-1, col-1, rows,
						{ x: col-1, y:row-1},
						{ x: col, y:row-1},
						{ x: col, y:row},
						{ x: col-1, y:row},
					);
				}
			}
		}
		this.geometry.uvsNeedUpdate = true;
		this.geometry.computeFaceNormals();
		this.geometry.computeBoundingBox();
		this.geometry.computeBoundingSphere();
	},

	addSquare: function(row, col, rows, a, b, c, d)
	{
		var square = new SequencerSquare(this, row, col, this.geometry);
		var ia = a.x * (rows+1) + a.y;
		var ib = b.x * (rows+1) + b.y;
		var ic = c.x * (rows+1) + c.y;
		var id = d.x * (rows+1) + d.y;
		var face;

		face = new THREE.Face3(ia, ib, ic);
		face.square = square;
		this.geometry.faces.push(face);
		
		face = new THREE.Face3(ic, id, ia)
		face.square = square;
		this.geometry.faces.push(face);

		this.geometry.faceVertexUvs[0].push([square.uvA, square.uvB, square.uvC])
		this.geometry.faceVertexUvs[0].push([square.uvC, square.uvD, square.uvA]);

		this.squares.push(square);
		this.colSquares[col].push(square);
	},
});

class SequencerSquare
{
	get isOn() { return this._isOn; }
	set isOn(value)
	{
		if(this.ref) this.ref.set(value);
		this._isOn = value;
		this.updateUVs();
	}

	get isTriggered() { return this._isTriggered; }
	set isTriggered(value)
	{
		this._isTriggered = value;
		this.updateUVs();
	}

	constructor(parent, row, col, geometry)
	{
		this.parent = parent;
		this.row = row;
		this.col = col;
		this.key = row + "-" + col;
		this.geometry = geometry;
		
		this.uvA = new THREE.Vector2(0, 0);
		this.uvB = new THREE.Vector2(1, 0);
		this.uvC = new THREE.Vector2(1, 1);
		this.uvD = new THREE.Vector2(0, 1);

		this.isOn = false;
		this.isTriggered = false;

		this.ref = parent.squaresRef.child(this.key);
		this.ref.on("value", snap => this.isOn = snap.val());
	}

	trigger()
	{
		var self = this;
		self.isTriggered = true;
		setTimeout(() => self.isTriggered = false, 200);
		if(this.isOn) soundManager.playNote(this.row);
	}

	updateUVs()
	{
		var uvs;
		if(this.isOn)
		{
			if(this.isTriggered)
				uvs = uvCoordinates.highlight;
			else
				uvs = uvCoordinates.on;
		}
		else uvs = uvCoordinates.off;

		this.uvA.copy(uvs[0]);
		this.uvB.copy(uvs[1]);
		this.uvC.copy(uvs[2]);
		this.uvD.copy(uvs[3]);
		this.geometry.uvsNeedUpdate = true;
	}
}

var padding = 0.02;
var uvCoordinates = {
	highlight: [
		new THREE.Vector2(0.627-padding, 0.628-padding),
		new THREE.Vector2(0.873+padding, 0.628-padding),
		new THREE.Vector2(0.873+padding, 0.874+padding),
		new THREE.Vector2(0.627-padding, 0.874+padding),
	],

	on: [
		new THREE.Vector2(0.127-padding, 0.628-padding),
		new THREE.Vector2(0.373+padding, 0.628-padding),
		new THREE.Vector2(0.373+padding, 0.874+padding),
		new THREE.Vector2(0.127-padding, 0.874+padding),
	],

	off: [
		new THREE.Vector2(0.627-padding, 0.128-padding),
		new THREE.Vector2(0.873+padding, 0.128-padding),
		new THREE.Vector2(0.873+padding, 0.373+padding),
		new THREE.Vector2(0.627-padding, 0.373+padding)
	]
};