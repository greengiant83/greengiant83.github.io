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



AFRAME.registerComponent("clicker", {
	init: function() 
	{
		var self = this;
		this.indicator = document.getElementById("indicator");

		var db = firebase.database();
		var position = self.indicator.getAttribute("position");

		db.ref("position").on("value", function(data)
		{
			var val = data.val();
			if(val)
			{
				position.x = val.x;
				position.y = val.y;
				self.indicator.setAttribute("position", position);
			}			
		})

		this.el.addEventListener("click", function()
		{
			var newPosition = position.x + 0.25;
			//db.ref("position").set(newPosition);			
		});
	}
})