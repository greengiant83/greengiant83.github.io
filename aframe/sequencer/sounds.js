var soundManager = (function()
{
	notes = [10, 12, 14, 15, 17, 19, 21, 22];
	var sceneEl;

	var self = {
		noteCount: 37,

		playNote: function(note)
		{
			if(!sceneEl) sceneEl = document.querySelector("a-scene");

			var soundIndex = note+1;
			var soundEl = document.createElement("a-sound");
			soundEl.setAttribute("src", "#sound" + soundIndex);
			soundEl.setAttribute("autoplay", true);
			soundEl.addEventListener("sound-ended", function(e)
			{
				sceneEl.removeChild(e.target);
			});
			sceneEl.appendChild(soundEl);
		},

		injectAssets: function()
		{
			console.log("injecting assets");

			for(var i=1;i<=37;i++)
			{
				document.write('<audio preload="true" id="sound' + i + '" src="sounds/Synth' + i + '.ogg"></audio>');
			}
		}
	}
	return self;
})();

console.log("Sound Manager", soundManager);