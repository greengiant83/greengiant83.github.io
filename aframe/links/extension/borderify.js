(function()
{
	var scene = document.querySelector("a-scene");
	var menuIsVisible = false;
	var menuEl;
	var timer;

	if(scene)
	{
		var touchControllers = findChildrenByType(scene, "oculus-touch-controls");
		var head = findChildByType(scene, "camera").wrappedJSObject;

		if(touchControllers.length > 0)
		{
			touchControllers.forEach(function(controller)
			{
				controller.addEventListener("thumbstickdown", function()
				{
					toggleMenu(controller);
				});
			});
		}

		function toggleMenu(sender)
		{
			if(menuIsVisible) 
				hideMenu();
			else
				showMenu(sender);
		}

		function showMenu(sender)
		{
			var pos = head.object3D.position.clone();
			pos.set(0, 0, -0.5);
			pos = head.object3D.localToWorld(pos);
			menuEl = document.wrappedJSObject.createElement("a-box");
			menuEl.setAttribute("position", pos);
			var homeIconUrl = browser.extension.getURL("home.png");
			menuEl.setAttribute("src", "url(" + homeIconUrl + ")");
			scene.wrappedJSObject.appendChild(menuEl);
			setTimeout(function()
			{
				menuEl.object3D.scale.set(0.1, 0.1, 0.01);
				menuEl.object3D.lookAt(head.object3D.position);
			}, 1);

			timer = setInterval(tick, 10);
			menuIsVisible = true;
		}

		function hideMenu()
		{
			clearInterval(timer);
			menuEl.parentEl.removeChild(menuEl);
			menuIsVisible = false;
		}

		function tick()
		{
			touchControllers.forEach(function(controller)
			{
				var d = controller.wrappedJSObject.object3D.position.distanceToSquared(menuEl.object3D.position);
				if(d < 0.005)
				{
					//window.history.back();
					window.location.href = "http://localhost:8000";
				}
			});
		}

		///////////////////////////////////////////////////////
		function findChildrenByType(item, typeName)
		{
		  if(item.hasAttribute(typeName)) return [item];

		  var results = [];
		  for(var i=0;i<item.children.length;i++)
		  {
		    var child = item.children[i];
		    var childResults = findChildrenByType(child, typeName);
		    if(childResults.length > 0) results = results.concat(childResults);
		  }
		  return results;
		}

		function findChildByType(item, typeName)
		{
		  if(item.hasAttribute(typeName)) return item;

		  for(var i=0;i<item.children.length;i++)
		  {
		    var child = item.children[i];
		    var childResult = findChildByType(child, typeName);
		    if(childResult) return childResult;
		  }
		  return null;
		}
	}
})();