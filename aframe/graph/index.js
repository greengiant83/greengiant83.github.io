document.addEventListener("DOMContentLoaded", function()
{
	document.body.addEventListener("keypress", function(e)
	{
		if(e.code == "Comma")
		{
			var stack = document.querySelector("a-stack");
			if(stack.children.length <= 0) return;
			var index = Math.round(Math.random() * (stack.children.length-1));
			stack.removeChild(stack.children[index]);
		}
		else if(e.code == "Period")
		{
			var stack = document.querySelector("a-stack");
			var newItem = document.createElement("a-sphere");
			newItem.setAttribute("radius", Math.random() * 0.1 + 0.1);
			stack.appendChild(newItem);
		}
	});
});

///////////////////////////////////////

AFRAME.registerComponent("test", {
	init: function()
	{
		console.log("testing...");
		var mesh = this.el.object3D.children[0];
		mesh.geometry.computeBoundingBox();
		console.log("test item", mesh);
	}
})


function growBounds(bounds, item)
{
	var itemBounds = localizeBounds(item.boundingBox, item.getAttribute("position"));
	bounds.min.min(itemBounds.min);
	bounds.max.max(itemBounds.max);
}

function localizeBounds(bounds, position)
{
	var local = { 
		min: bounds.min.clone().add(position),
		max: bounds.max.clone().add(position)
	}
	return local;
}

function findBoundingBox(item)
{
	var mesh = findChildObjectByType(item.object3D, "Mesh", "Group");
	if(mesh)
	{
		try
		{
			if(!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
		}
		catch(e)
		{
			console.log("caught an exception while getting bounding box", e)
		}	
		return mesh.geometry.boundingBox;
	}
	else
	{
		console.log("findboundingbox found a null, lets look at its children", item.children);
		if(item.children.length <= 0) 
		{
			console.log("it doesn't have any children");
			return null;
		}

		var bb = new BoundingBox();
		var bbFound = false;
		for(var i=0;i<item.children.length;i++)
		{
			var childItem = item.children[i];
			var childBB = findBoundingBox(childItem);
			if(childBB)
			{
				growBounds(bb, childBB, childItem.getAttribute("position"));
				bbFound = true;
			}
		}
		return bbFound ? bb : null;
	}
}

function findChildObjectByType(object, type, stopIfType)
{
	for(var i=0;i<object.children.length;i++)
	{
		var childResult = findObjectByType(object.children[i], type, stopIfType);
		if(childResult) return childResult;
	}
	return null;	
}

function findObjectByType(object, type, stopIfType)
{
	if(object.type == type) return object;
	if(stopIfType && object.type == stopIfType) return null;

	for(var i=0;i<object.children.length;i++)
	{
		var childResult = findObjectByType(object.children[i], type);
		if(childResult) return childResult;
	}
	return null;
}

function findObjectsByType(object, type, results)
{
	if(!results) results = [];
	if(object.type == type) results.push(object);

	for(var i=0;i<object.children.length;i++)
	{
		findObjectsByType(object.children[i], type, results);
	}

	return results;
}