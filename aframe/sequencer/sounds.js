var soundManager = (function()
{
	notes = [10, 12, 14, 15, 17, 19, 21, 22];
	var sceneEl;

	var self = {
		noteCount: 37,

		playNote: function(note)
		{
			if(!sceneEl) sceneEl = document.querySelector("a-scene");

			console.log("playing note", note);
			var soundIndex = note+1;
			var soundEl = document.createElement("a-sound");
			soundEl.setAttribute("src", "#sound" + soundIndex);
			soundEl.setAttribute("autoplay", true);
			soundEl.addEventListener("sound-ended", function(e)
			{
				sceneEl.removeChild(e.target);
				console.log("Removing note", note);
			});
			sceneEl.appendChild(soundEl);
		},

		injectAssets: function()
		{
			var instrument = "Oboe";
			for(var i=1;i<=37;i++)
			{
				var path = 'sounds/' +  instrument + '/' + instrument + i + '.ogg';
				document.write('<audio preload="true" id="sound' + i + '" src="' + path + '"></audio>');
			}
		}
	}
	return self;
})();