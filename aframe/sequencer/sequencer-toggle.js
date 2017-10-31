AFRAME.registerComponent("sequencer-toggle", {
	schema: {
		sequencer: { type: "selector" }
	},

	init: function()
	{
		var self = this;
		var isPlayingRef = db.ref("isPlaying");
		this.sequencer = self.data.sequencer.components["sequencer-panel"];
		
		isPlayingRef.on("value", snap => {
			self.isPlaying = snap.val();
			self.el.setAttribute("color", this.isPlaying ? "rgb(0,255,255)" : "rgb(0,10,40)");

			if(this.isPlaying)
			{
				this.colIndex = 0;
				this.playNextCol();
			}
		});

		this.el.addEventListener("click", function()
		{
			isPlayingRef.set(!self.isPlaying);
		});
	},

	playNextCol: function()
	{
		if(!this.isPlaying) return;
		setTimeout(() => this.playNextCol(), 500);

		this.sequencer.colSquares[this.colIndex].forEach(square => square.trigger());
		this.colIndex++;
		if(this.colIndex >= this.sequencer.colSquares.length-1) this.colIndex = 0;
	}
});