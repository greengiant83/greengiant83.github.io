var soundManager = (function()
{
	notes = [10, 12, 14, 15, 17, 19, 21, 22];

	var self = {
		noteCount: 37,
		

		playNote: function(note, el)
		{
			var soundIndex = note+1;
			//var soundIndex = notes[(note-1) % notes.length];
			var soundEl = document.createElement("a-sound");
			soundEl.setAttribute("src", "#sound" + soundIndex);
			soundEl.setAttribute("autoplay", true);
			soundEl.addEventListener("sound-ended", function(e)
			{
				el.removeChild(e.target);
			});
			el.appendChild(soundEl);
		},

		injectAssets: function()
		{
			console.log("injecting assets"); //, assets);

			for(var i=1;i<=37;i++)
			{
				document.write('<audio preload="true" id="sound' + i + '" src="sounds/Synth' + i + '.ogg"></audio>');
			}
		}
	}
	return self;
})();