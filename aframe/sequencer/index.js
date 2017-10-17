// Initialize Firebase
var config = {
	apiKey: "AIzaSyAjnO-4gnEalXBSP6XpleYwpcrwz8E8IaM",
	authDomain: "sequencer-50e1d.firebaseapp.com",
	databaseURL: "https://sequencer-50e1d.firebaseio.com",
	projectId: "sequencer-50e1d",
	storageBucket: "sequencer-50e1d.appspot.com",
	messagingSenderId: "988244706418"
};
firebase.initializeApp(config);
var db = firebase.database();


(function() 
{
	AFRAME.registerComponent("sequencer-panel", {
		schema: {
			rows: { default: 8 },
			cols: { default: 12 },
			size: { default: 0.25 }
		},

		update: function()
		{
			var self = this;
			var geometry = new THREE.Geometry();
			var colorTexture = new THREE.TextureLoader().load("panel-color.png");
			var emissiveTexture = new THREE.TextureLoader().load("panel-emissive.png");
			var material = new THREE.MeshStandardMaterial(
			{
				color: "white", 
				map: colorTexture,
				emissive: new THREE.Color(0xffffff),
				emissiveMap: emissiveTexture,
				side: THREE.DoubleSide
			});
			var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
			mesh.material = material;

			self.geometry = mesh.geometry = geometry;
			self.generateGrid(this.data.cols, this.data.rows, this.data.size);
			self.el.object3D.add(mesh);

			this.wireGridToDB();

			self.el.addEventListener("click", function(e)
			{
				var square = e.detail.intersection.face.square;
				square.isOn = !square.isOn;
			});	

			var colIndex = 0;
			setInterval(function()
			{
				self.colSquares[colIndex].forEach(square => square.trigger());

				colIndex++;
				if(colIndex >= self.colSquares.length) colIndex = 0;
			}, 500)	;
		},

		wireGridToDB: function()
		{
			this.dbRef = db.ref("seq");
			this.squaresRef = this.dbRef.child("squares");
			this.squares.forEach(square => {
				square.ref = this.squaresRef.child(square.key);
				square.ref.on("value", snap => {
					square.isOn = snap.val();
				});
			})
		},

		generateGrid: function(cols, rows, size)
		{
			this.squares = [];
			this.colSquares = [];
			this.geometry.faceVertexUvs[0] = [];
			for(var col=0;col<cols;col++)
			{
				this.colSquares.push([]);
				for(var row=0;row<rows;row++)
				{
					this.geometry.vertices.push({x: col*size, y: row*size, z:Math.sin(col) * 0.1});
				}

				if(col > 0)
				{
					for(var row=1;row<rows;row++)
					{
						this.addSquare(col + "-" + row, rows, row, col,
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

		addSquare: function(key, rows, row, col, a, b, c, d)
		{
			var square = new SequencerSquare(key, row, col, this.geometry);
			var ia = a.x * rows + a.y;
			var ib = b.x * rows + b.y;
			var ic = c.x * rows + c.y;
			var id = d.x * rows + d.y;
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
		get isOn()
		{
			return this._isOn;
		}
		set isOn(value)
		{
			if(this.ref) this.ref.set(value);
			this._isOn = value;
			this.updateUVs();
		}

		get isTriggered()
		{
			return this._isTriggered;
		}
		set isTriggered(value)
		{
			this._isTriggered = value;
			this.updateUVs();
		}

		constructor(key, row, col, geometry)
		{
			this.key = key;
			this.row = row;
			this.col = col;
			this.geometry = geometry;

			this.uvA = new THREE.Vector2(0, 0);
			this.uvB = new THREE.Vector2(1, 0);
			this.uvC = new THREE.Vector2(1, 1);
			this.uvD = new THREE.Vector2(0, 1);

			this.isOn = false;
			this.isTriggered = false;
		}

		trigger()
		{
			var self = this;
			self.isTriggered = true;
			setTimeout(function()
			{
				self.isTriggered = false;
			}, 200);
			if(this.isOn) soundManager.playNote(this.row);
		}

		updateUVs()
		{
			if(this.isOn)
			{
				if(this.isTriggered)
				{
					this.uvA.copy(uvCoordinates.highlightA);
					this.uvB.copy(uvCoordinates.highlightB);
					this.uvC.copy(uvCoordinates.highlightC);
					this.uvD.copy(uvCoordinates.highlightD);
				}
				else
				{
					this.uvA.copy(uvCoordinates.onA);
					this.uvB.copy(uvCoordinates.onB);
					this.uvC.copy(uvCoordinates.onC);
					this.uvD.copy(uvCoordinates.onD);
				}
			}
			else
			{
				this.uvA.copy(uvCoordinates.offA);
				this.uvB.copy(uvCoordinates.offB);
				this.uvC.copy(uvCoordinates.offC);
				this.uvD.copy(uvCoordinates.offD);
			}
			this.geometry.uvsNeedUpdate = true;
		}
	}

	var padding = 0.02;
	var uvCoordinates = {
		highlightA: new THREE.Vector2(0.627-padding, 0.628-padding),
		highlightB: new THREE.Vector2(0.873+padding, 0.628-padding),
		highlightC: new THREE.Vector2(0.873+padding, 0.874+padding),
		highlightD: new THREE.Vector2(0.627-padding, 0.874+padding),

		onA: new THREE.Vector2(0.127-padding, 0.628-padding),
		onB: new THREE.Vector2(0.373+padding, 0.628-padding),
		onC: new THREE.Vector2(0.373+padding, 0.874+padding),
		onD: new THREE.Vector2(0.127-padding, 0.874+padding),

		offA: new THREE.Vector2(0.627-padding, 0.128-padding),
		offB: new THREE.Vector2(0.873+padding, 0.128-padding),
		offC: new THREE.Vector2(0.873+padding, 0.373+padding),
		offD: new THREE.Vector2(0.627-padding, 0.373+padding)
	};
})();