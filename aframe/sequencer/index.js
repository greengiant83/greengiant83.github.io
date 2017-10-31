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


AFRAME.registerComponent("test", {
	init: function()
	{
		var self = this;
		var originalParent;
		var attachEl;

		this.el.addEventListener("mousedown", function(e) {
			var sender = e.detail.cursorEl;
			if(sender.isScene) 
			{
				sender = null;
			}
			if(sender)
			{
				originalParent = self.el.parentEl;				
				attachEl = sender;
				reparentEl(self.el, sender);
			}
		})

		this.el.addEventListener("mouseup", function() {
			//reparentEl(self.el, self.el.sceneEl);

			//detach(child, parent, scene)
			THREE.SceneUtils.detach(self.el.object3D, attachEl.object3D, self.el.sceneEl.object3D);
		})

		function reparentEl(childEl, newParentEl)
		{
			//THREE.SceneUtils.detach(childEl.object3D, childEl.parentEl.object3D, childEl.sceneEl.object3D);

			//attach(child, scene, parent)
			THREE.SceneUtils.attach(childEl.object3D, childEl.sceneEl.object3D, newParentEl.object3D);
			/*var originalMatrix = childEl.object3D.matrixWorld;
			var pos = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var rot = new THREE.Quaternion();

			originalMatrix.decompose(pos, rot, scale);

			var parentLocalPos = newParentEl.object3D.worldToLocal(pos).clone();
			//var localQuaternion = worldToLocalRotation(rot, newParentEl.object3D).clone();
			//var rotation = quaternionToRotation(localQuaternion);

			newParentEl.appendChild(childEl);

			childEl.setAttribute("position", parentLocalPos);
			//childEl.setAttribute("rotation", rotation);*/
		}

		function worldToLocalRotation(worldRot, parentObject)
		{
			var pos = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var rot = new THREE.Quaternion();
			var parentMatrix = new THREE.Matrix4();
			parentMatrix.getInverse(parentObject.matrixWorld);
			parentMatrix.decompose(pos, rot, scale);

			var parentLocalRot = rot.clone();
			parentLocalRot.multiply(worldRot);
			return parentLocalRot;
		}

		function quaternionToRotation(quaternion)
		{
			var euler = new THREE.Euler();
			euler.setFromQuaternion(quaternion);
			var result = {
				x: euler.x * THREE.Math.RAD2DEG,
				y: euler.y * THREE.Math.RAD2DEG,
				z: euler.z * THREE.Math.RAD2DEG
			}
			return result;
		}
	}
})