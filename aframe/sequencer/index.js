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

			self.el.addEventListener("click", function(e)
			{
				var square = e.detail.intersection.face.square;
				square.isOn = !square.isOn;
			});		
		},

		generateGrid: function(cols, rows, size)
		{
			this.squares = [];
			this.geometry.faceVertexUvs[0] = [];
			for(var col=0;col<cols;col++)
			{
				for(var row=0;row<rows;row++)
				{
					this.geometry.vertices.push({x: col*size, y: row*size, z:Math.sin(col) * 0.1});
				}

				if(col > 0)
				{
					for(var row=1;row<rows;row++)
					{
						this.addSquare(rows,
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

		addSquare: function(rows, a, b, c, d)
		{
			var square = new SequencerSquare(this.geometry);
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
			this._isOn = value;
			this.updateUVs();
		}

		constructor(geometry)
		{
			this.geometry = geometry;

			this.uvA = new THREE.Vector2(0, 0);
			this.uvB = new THREE.Vector2(1, 0);
			this.uvC = new THREE.Vector2(1, 1);
			this.uvD = new THREE.Vector2(0, 1);

			this.isOn = false;
		}

		updateUVs()
		{
			if(this.isOn)
			{
				this.uvA.copy(uvCoordinates.onA);
				this.uvB.copy(uvCoordinates.onB);
				this.uvC.copy(uvCoordinates.onC);
				this.uvD.copy(uvCoordinates.onD);
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