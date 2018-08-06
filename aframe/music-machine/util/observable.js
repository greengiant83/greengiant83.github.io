class Observe
{
	static watch(object, property, callback)
	{
		if(object._observables === undefined) object._observables = {};
		if(object._observables[property] === undefined) Observe.makeObservable(object, property);
		object._observables[property].observers.push(callback);
	}

	static makeObservable(object, property)
	{
		object._observables[property] = {
			value: object[property],
			observers: [],
			notify: function(newValue)
			{
				this.observers.forEach(callback => callback(newValue));
			}
		};

		Object.defineProperty(object, property,
		{
			get: function()
			{
				return object._observables[property].value;
			},

			set: function(newValue)
			{
				object._observables[property].value = newValue;
				object._observables[property].notify(newValue);
			}
		});
	}

	static notify(object, property, newValue)
	{
		if(object._observables && object._observables[property])
		{
			object._observables[property].notify(newValue);
		}
	}
}

class Binding
{
	constructor(sourceObject, sourceDataKey, destinationObject, destinationDataKey)
	{
		destinationObject[destinationDataKey] = sourceObject[sourceDataKey];
		Observe.watch(sourceObject, sourceDataKey, function(newValue)
		{
			destinationObject[destinationDataKey] = newValue;
		});
	}
}