AFRAME.registerComponent("image-search", {
	schema: {
		query: { type:"string", default: "procedural" },
		page: { type:"number", default:0 }
	},

	imageIndex: 0,

	update: function()
	{
		var self = this;
		self.fetchImages();

		document.addEventListener("keydown", function(e)
		{
			switch(e.key)
			{
				case "n":
					self.data.page++;
					self.fetchImages();
			}
		});	
	},

	fetchImages: function()
	{
		var self = this;
		var url = `https://mediahunter.herokuapp.com/google?q=${this.data.query}&page=${this.data.page}`;
		
		fetch(url, { method: "GET" }).then(function(response)
		{
			return response.text();
		}).then(function(result)
		{
			var data = JSON.parse(result);
			data.images.forEach(i => self.addImage(i));
		});
	},	

	addImage: function(src)
	{
		var self = this;
		var proxyPrefix = "https://mediahunter.herokuapp.com/media/";
		//setTimeout(function()
		//{
			var img = document.createElement("a-box");
			img.setAttribute("width", 0.2);
			img.setAttribute("height", 0.2);
			img.setAttribute("depth", 0.01);
			img.setAttribute("src", `url(${proxyPrefix}${src})`);
			img.setAttribute("crossorigin", "anonymous");
			img.setAttribute("position", { x: self.imageIndex * 1.2, y: 1, z: -1 });
			img.setAttribute("fit-image", true);
			img.setAttribute("material", { shader: "flat" });

			self.el.appendChild(img);
			self.imageIndex++;
		//}, Math.random() * 2000);
	}
});