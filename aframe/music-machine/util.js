function reparentObject3D(subject, newParent)
{
	subject.matrix.copy(subject.matrixWorld);
	subject.applyMatrix(new THREE.Matrix4().getInverse(newParent.matrixWorld));
	newParent.add(subject);
}

function toVector(o)
{
	return new THREE.Vector3(o.x, o.y, o.z);
}

function toList(collection)
{
	var list = [];
	for(var i=0;i<collection.length;i++)
	{
		list.push(collection[i]);
	}
	return list;
}

function addDot(el, position, radius, color)
{
	color = color || "red";
	var dot = document.createElement("a-sphere");
	dot.setAttribute("radius", radius);
	dot.setAttribute("position", position);
	dot.setAttribute("color", color);
	el.appendChild(dot);
}

function directionLocalToWorld(object, localDirection)
{
	return localDirection.transformDirection(object.matrixWorld);
}

/*function pointLocalToWorld(object, localPoint)
{
	return object.localToWorld(localPoint);
}

function pointWorldToLocal(object, worldPoint)
{
	return object.worldToLocal(worldPoint);
}

function directionLocalToWorld(object, localDirection)
{
	//localDirection -> object.localToWorld -> result - object.worldPosition -> normalize
}

function directionWorldToLocal(object, worldDirection)
{
	//worldDirection + object.worldPosition -> pointWorldToLocal -> normalize
}

function rotationLocalToWorld(object, localQuaternion)
{

}

function rotationWorldToLocal(object, worldQuaternion)
{

}

function scaleLocalToWorld(object, localScale)
{

}

function scaleWorldToLocal(object, worldScale)
{

}*/
