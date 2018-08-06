(function()
{
	AFRAME.registerComponent("fire-transform", {
		schema: {
			refPath: { type: "string" }, 
		},

		init: function()
		{
			var self = this;
			monitorRef(self.el, self.data.refPath, i => self.refChanged());
		},

		refChanged: function()
		{
			var self = this;
			self.el.fireData.ref.on("value", function(snap)
			{
				if(self.skipUpdate)
				{
					self.skipUpdate = false;
					return;
				}

				var value = snap.val();
				if(!value) return;

				if(value.position) self.el.object3D.position.copy(value.position);
				if(value.scale) self.el.object3D.scale.copy(value.scale);
				if(value.rotation) self.el.object3D.quaternion.copy(value.rotation);
			});

			self.el.addEventListener("grabStart", i => self.updateTimer = setInterval(j => self.updateTick(), 50));
			self.el.addEventListener("grabEnd", i => clearInterval(self.updateTimer));
		},

		updateTick: function()
		{
			var self = this;

			if(self.skipUpdate)
			{
				self.skipUpdate = false;
				return;
			}

			var value = {
				position: self.el.object3D.position,
				scale: self.el.object3D.scale,
				rotation: { 
					x: self.el.object3D.quaternion.x,
					y: self.el.object3D.quaternion.y,
					z: self.el.object3D.quaternion.z,
					w: self.el.object3D.quaternion.w,
				}
			};

			self.el.fireData.ref.set(value);
		}
	});

	AFRAME.registerComponent("fire-bind", {
		init: function()
		{
			var self = this;

			monitorParent(self.el, function()
			{
				self.parentRefChanged();
				self.el.fireData.parent.addEventListener("fire-ref-changed", i => self.parentRefChanged());
			})
		},

		parentRefChanged: function()
		{
			var self = this;
			if(!self.el.fireData.parent) return;

			for(var key in self.data)
			{
				self.monitorBinding(key, self.data[key])
			}
		},

		monitorBinding: function(attribute, refPath)
		{
			var self = this;
			var valRef = self.el.fireData.parent.fireData.ref.child(refPath);
			var ignoreNextUpdate = false;
			valRef.on("value", function(snap)
			{
				if(ignoreNextUpdate)
				{
					ignoreNextUpdate = false;
					return;
				}

				ignoreNextUpdate = true;
				var val = snap.val();
				self.el.setAttribute(attribute, val);
			});

			self.el.addEventListener("componentchanged", function(e)
			{
				if(e.detail.name == attribute)
				{
					if(ignoreNextUpdate)
					{
						ignoreNextUpdate = false;
						return;
					}

					ignoreNextUpdate = true;
					valRef.set(self.el.getAttribute(attribute))
				}
			})
		}
	});

	AFRAME.registerComponent("fire-item", {
		schema: {
			refPath: { type: "string" }, 
		},

		init: function()
		{
			var self = this;

			monitorRef(self.el, self.data.refPath);
		},

		setFireData: function(snap)
		{
			var self = this;
			if(!self.el.fireData) self.el.fireData = {};
			self.el.fireData.ref = snap.ref;
			self.el.emit("fire-ref-changed", null, false);
		}
	});

	AFRAME.registerComponent("fire-list", {
		schema: {
			refPath: { type: "string" }, 
		},

		init: function()
		{
			var self = this;
			self.itemTemplate  = Handlebars.compile(self.el.innerHTML);
			self.el.innerHTML = "";

			monitorRef(self.el, self.data.refPath, function()
			{
				if(self.el.fireData.ref) self.el.fireData.ref.off(); //detach old listeners
				self.el.fireData.ref.on("child_added", i => self.itemAdded(i));
				self.el.fireData.ref.on("child_removed", i => self.itemRemoved(i));								
			});
		},

		itemAdded: function(snap)
		{
			var self = this;
			var value = snap.val();
			var context = value.data;
			
			var newEl = document.createElement("a-entity");
			newEl.setAttribute("id", snap.key);
			newEl.setAttribute("fire-item", true);
			newEl.fireData = { key: snap.key }
			newEl.innerHTML = self.itemTemplate(context);
			self.el.appendChild(newEl);

			newEl.addEventListener("loaded", function()
			{
				var fireItem = newEl.components["fire-item"];
				fireItem.setFireData(snap);
			});
		},

		itemRemoved: function(snap)
		{
			var self = this;
			for(var i=0;i<self.el.children.length;i++)
			{
				var child = self.el.children[i];
				if(child.fireData && child.fireData.key == snap.key)
				{
					child.parentElement.removeChild(child);
					break;
				}
			}
		}
	});

	function monitorRef(el, refPath, callback)
	{
		if(!refPath) return; // console.log("no refPath. bailing out.", el);

		if(!el.fireData) el.fireData = {};

		if(refPath.startsWith("/"))
		{
			el.fireData.ref = db.ref(refPath);
			if(callback) callback();
			el.emit("fire-ref-changed", null, false);
		}
		else
		{
			monitorParent(el, function()
			{
				if(el.fireData.parent)
				{
					el.fireData.ref = el.fireData.parent.fireData.ref.child(refPath);
					if(callback) callback();
					el.emit("fire-ref-changed", null, false);
				}				
			});
		}
	}

	function monitorParent(el, callback)
	{
		if(!el.fireData) el.fireData = {};

		el.fireData.parent = getParentFireItem(el);
		if(el.fireData.parent)
		{
			self.parentDataEl.addEventListener("fire-ref-changed", function()
			{
				if(callback) callback();
			});
		}
		else
		{
			if(callback) callback();
		}	
	}

	function getParentFireItem(el)
	{
		//Find parent data context
		el = el.parentEl;
		while(el != null)
		{
			var isFireItem = el.hasAttribute("fire-item");
			if(isFireItem)
			{
				self.parentDataEl = el;
				break;
			}

			if(el.tagName == "A-SCENE") return;
			if(el.components && el.components["fire-list"]) return;
			el = el.parentEl;
		}
		return el;
	}
})();


//TODO: should be deprecated
AFRAME.registerComponent("firebase-list", {
	schema: {
		template: { type: "selector" }, //#linkTemplate
		refPath: { type: "string" }, //links
		componentName: { type: "string" } //node-link
	},

	init: function()
	{
		var self = this;
		var compManager = findComponent("comp-manager");

		self.template = Handlebars.compile(self.data.template.innerHTML);
		self.dataRef = null;

		compManager.el.addEventListener("comp-selected", function(e)
		{
			var newComp = e.detail;

			if(self.dataRef) self.dataRef.off(); //detach all listeners

			self.dataRef = newComp.child(self.data.refPath);
			self.dataRef.on("child_added", i => self.itemAdded(i));
			self.dataRef.on("child_removed", i=> self.itemRemoved(i));
		});
	},

	itemAdded: function(snap)
	{
		var self = this;
		var context = { key: snap.key };
		var newItem = document.createElement("a-entity");
		newItem.setAttribute("id", snap.key);
		newItem.setAttribute(self.data.componentName, true);
		newItem.dataRef = snap.ref;
		newItem.dataKey = snap.key;
		newItem.innerHTML = self.template(context);

		self.el.appendChild(newItem);
	},

	itemRemoved: function(snap)
	{
		var self = this;
		for(var i=0;i<self.el.children.length;i++)
		{
			var child = self.el.children[i];
			if(child.dayaKey == snap.key)
			{
				child.parentElement.removeChild(child);
				break;
			}
		}
	}
});