// Initialize Firebase
var config = {
	apiKey: "AIzaSyBzURxXKj4Iq0hc18cmw9rYpnAQyRAIKjM",
	authDomain: "testproject-7d540.firebaseapp.com",
	databaseURL: "https://testproject-7d540.firebaseio.com",
	projectId: "testproject-7d540",
	storageBucket: "testproject-7d540.appspot.com",
	messagingSenderId: "369127450282"
};
firebase.initializeApp(config);
firebase.auth().signInAnonymously();
firebase.auth().onAuthStateChanged(function(user)
{
	//if(user) //user logged in
});


AFRAME.registerComponent("remote-movement", {
	init: function() 
	{
		var self = this;
		self.panController = new SingleTouchPan(this.el, { scalar: 2 });
		self.zoomController = new TwoTouchZoom(this.el, { scalar: 10 });
		self.rotateController = new TwoTouchRotate(this.el, { scalar: 30 });
		self.touches = [];

		var db = firebase.database();
		var devices = db.ref("devices");
		
		devices.on("child_added", function(e, prevChildKey)
		{
			console.log("device added", e, e.key);
			devices.child(e.key + "/touches").on("value", function(data)
			{
				var newTouches = data.val();
				//self.touches = newTouches ? newTouches : {};
				self.touches.splice(0);
				for(var key in newTouches)
				{
					var touch = newTouches[key];
					touch.key = key;
					self.touches.push(touch);
				}
			});
		});

		db.ref("devices").on("child_removed", function(e)
		{
			console.log("device removed", e);
		});
	},

	tick: function()
	{
		this.panController.update(this.touches);
		this.zoomController.update(this.touches);
		this.rotateController.update(this.touches);

		if(this.rotateController.isRotating)
		{
			var objectRot = this.el.getAttribute("rotation");
			objectRot.y += this.rotateController.value;
			this.el.setAttribute("rotation", objectRot);
		}
		else
		{
			var newPos = this.el.object3D.localToWorld(new THREE.Vector3(
			this.panController.value.x,
			this.panController.value.y,
			this.zoomController.value));
			this.el.setAttribute("position", newPos);
		}
	}
});

class TwoTouchRotate
{
	constructor(element, { scalar = 10 } = {})
	{
		this.el = element;
		this.scalar = scalar;
		this.rotThreshold = 3.5;
		this.value = 0;
		this.line = new THREE.Vector2();
		this.isRotating = false;
		this.isRecognizing = true;
	}

	update(touches)
	{
		this.lastTouchCount = this.touchCount;
		this.touchCount = touches.length;

		this.recognizeRotation();

		if(this.touchCount >= 2)
		{
			var a = touches[0];
			var b = touches[1];

			this.line.set(a.x - b.x, a.y - b.y);
			this.lastAngle = this.angle;
			this.angle = this.line.angle();
			if(this.lastTouchCount < 2) this.lastAngle = this.angle;
			
			this.value = this.getAngleDifference(this.lastAngle, this.angle) * this.scalar;

		}
		else this.value = 0;
	}

	recognizeRotation()
	{
		if(this.touchCount >= 2 && this.lastTouchCount < 2)
		{
			//Start
			this.startTime = performance.now();
			this.accumulatedRot = 0;
			this.isRecognizing = true;
		}

		if(this.touchCount < 2 && this.lastTouchCount >= 2)
		{
			//End
			this.isRotating = false;
		}

		if(this.isRecognizing)
		{
			if(performance.now() - this.startTime > 200) this.isRecognizing = false;

			if(Math.abs(this.accumulatedRot) > this.rotThreshold)
			{
				this.isRotating = true;
				this.isRecognizing = false;
			}
		}

		if(this.touchCount >= 2 && this.isRecognizing) this.accumulatedRot += this.value;
	}

	getAngleDifference(a, b)
	{
		//Account for the situation where values cross the full rotation divide
		if(b - a > Math.PI) 
			a += Math.PI * 2;
		else if(a - b > Math.PI)
			b += Math.PI * 2;

		return a - b;
	}
}

class TwoTouchZoom
{
	constructor(element, { scalar = 10 } = {})
	{
		this.el = element;
		this.scalar = scalar;
		this.value = 0;
	}

	update(touches)
	{
		this.lastTouchCount = this.touchCount;
		this.touchCount = touches.length;

		if(this.touchCount >= 2)
		{
			var a = touches[0];
			var b = touches[1];
			var c = { x: a.x - b.x, y: a.y - b.y };

			this.lastLength = this.length;
			this.length = Math.sqrt(c.x * c.x + c.y * c.y);
			if(this.lastTouchCount < 2) this.lastLength = this.length;
			this.value = (this.lastLength - this.length) * this.scalar;
		}
		else this.value = 0;
	}
}

class SingleTouchPan
{
	constructor(element, { scalar = 2 } = {})
	{
		this.el = element;
		this.scalar = scalar;
		this.value = { x: 0, y: 0 };
	}

	update(touches)
	{
		this.touches = touches;
		this.updateOrigin();

		if(this.touchCount > 0)
		{
			this.value.x = -(this.origin.x - this.lastOrigin.x) * this.scalar,
			this.value.y = (this.origin.y - this.lastOrigin.y) * this.scalar
		}
		else
		{
			this.value.x = 0;
			this.value.y = 0;
		}
	}

	updateOrigin()
	{
		this.lastOrigin = this.origin;
		this.lastTouchCount = this.touchCount;

		var x = 0;
		var y = 0;
		for(var i=0;i<this.touches.length;i++)
		{
			var touch = this.touches[i];
			x += touch.x;
			y += touch.y;
		}
		
		//this.touchCount = Object.keys(this.touches).length;
		this.touchCount = this.touches.length;
		this.origin = { x: x / this.touchCount, y: y / this.touchCount };

		if(this.touchCount != this.lastTouchCount) this.lastOrigin = this.origin;
	}
}