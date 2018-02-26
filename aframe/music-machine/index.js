// Initialize Firebase
var config = {
	apiKey: "AIzaSyBUkR7JAuLIZbTzZhFEJXV4B-WpRb8GR2A",
	authDomain: "music-machine-fa546.firebaseapp.com",
	databaseURL: "https://music-machine-fa546.firebaseio.com",
	projectId: "music-machine-fa546",
	storageBucket: "music-machine-fa546.appspot.com",
	messagingSenderId: "281401274515"
};
firebase.initializeApp(config);
var db = firebase.database();
var compRef;
var nodesRef;

firebase.auth().signInAnonymously();

db.ref("compositions").limitToFirst(1).once("child_added", function(snap)
{
	console.log("Comp ", snap.key, snap.val());
	compRef = snap.ref;
	nodesRef = compRef.child("nodes");
	nodesRef.on("child_added", function(snap)
	{
		console.log("node", snap.val());
		var template = document.getElementById("nodeTemplate").innerHTML;
		console.log(template);
	});

	nodesRef.on("value", function(snap)
	{
		console.log("Nodes value", snap.val());
	})
})

function addComp(title)
{
	var newComp = comps.push();
	newComp.set({
		title: title || "New Comp"
	});
}

function addNode()
{
	var newNode = nodesRef.push();
	newNode.set({ position: {x: Math.random() * 2, y: Math.random() * 2, z: Math.random() * -1 - 1 }});
}

AFRAME.registerComponent("path-node", {
	init: function()
	{
		var self = this;
		/*self.el.addEventListener("loaded", function()
		{
			if(self.el.components.grabbable == undefined)
			{
				console.log("need to add grabbable");
				self.el.setAttribute("grabbable", true);
			}
		});*/
	}
});