AFRAME.registerComponent("image-search", {
	schema: {
		query: { type:"string", default: "procedural" },
		page: { type:"number", default:0 }
	},

	update: function()
	{
		var self = this;
		var url = `https://mediahunter.herokuapp.com/google?q=${this.data.query}`;
		
		fetch(url, { method: "GET" }).then(function(response)
		{
			return response.text();
		}).then(function(result)
		{
			var data = JSON.parse(result);
			data.images.forEach(i => self.addImage(i));
		});
	},

	imageIndex: 0,

	addImage: function(src)
	{
		var self = this;
		var proxyPrefix = "https://mediahunter.herokuapp.com/media/";
		setTimeout(function()
		{
			var img = document.createElement("a-box");
			img.setAttribute("width", 0.2);
			img.setAttribute("depth", 0.01);
			img.setAttribute("src", `url(${proxyPrefix}${src})`);
			img.setAttribute("crossorigin", "anonymous");
			img.setAttribute("fit-image", true);
			img.setAttribute("grabbable", true);
			img.setAttribute("stretchable", true);
			img.setAttribute("material", { shader: "flat" });

			self.el.appendChild(img);
			self.imageIndex++;
		}, Math.random() * 2000);
	}
});