

var Class = function (){

} ;

/**
 * deep clone object
 */
Class.cloneObject = function cloneObject(dest,src) {

	if(!src)
	{
		return ;
	}

	if(typeof dest=='undefined' || dest===null)
	{
		dest = src.constructor===Array? []: {} ;
	}

	var cloneProp = function(propName)
	{
		if( typeof(src[propName])=='object' )
		{
			dest[propName] = Class.cloneObject( null, src[propName] ) ;
		}
		else
		{
			dest[propName] = src[propName] ;
		}
	}

	if( src.constructor === Array )
	{
		for(var i=0; i<src.length; i++)
		{
			cloneProp(i) ;
		}
	}
	else
	{
		for(var k in src)
		{
			if("constructor"==k)
			{
				continue ;
			}
			cloneProp(k) ;
		}
	}

	return dest ;
}

/**
 * merge objects given behind first argument to the first argument
 * if the first argument is null, create a new empty object and return
 *
 * @example Class.mergeObject.merge(dest,src1,src2) ;
 * @example var newObj = Class.mergeObject.merge(null,src1,src2)
 */
Class.mergeObject = function mergeObject(dest/*, src1, src2 ...*/)
{
	if( dest===null )
	{
		dest = {} ;
	}
	for( var i=1; i<arguments.length; i++ )
	{
		Class.cloneObject(dest,arguments[i]) ;
	}
	return dest ;
}


/**
 * Create a new Class that inherits from this Class
 * @param {object} prop
 * @return {function}
 */
Class.extend = function (dynamicMembers,staticMembers) {

	dynamicMembers = dynamicMembers || {} ;
	staticMembers = staticMembers || {} ;

	var _super = this.prototype||{} ;

	// inherist from super
	var prototype = Class.cloneObject(null,_super) ;

	var subclass = function Class()
	{
		if( (typeof global!="undefined" && this===global) || (typeof window!="undefined" &&this===window) )
		{
			throw new SyntaxError("can't call a contructor of Class as static function") ;
		}

		// call contructor
		if (this.ctor)
		{
			this.ctor.apply(this, arguments);
		}
	}

	var methodBridge = function (name, fn, _super) {
		return function () {
			var oriSuper = this._super;

			// Add a new ._super() method that is the same method
			// but on the super-Class
			this._super = _super[name];

			// The method only need to be bound temporarily, so we
			// remove it when we're done executing
			var ret = fn.apply(this, arguments);
			this._super = oriSuper;

			return ret;
		};
	}

	// Copy the properties over onto the new prototype
	for (var name in dynamicMembers)
	{
		if(typeof dynamicMembers[name] == "function" && typeof _super[name] == "function")
		{
			prototype[name] = methodBridge(name,dynamicMembers[name],_super);
		}
		else{
			prototype[name] = dynamicMembers[name];
		}
	}

	// Populate our constructed prototype object
	subclass.prototype = prototype;

	// Enforce the constructor to be what we expect
	subclass.prototype.constructor = subclass;

	subclass.prototype.clone = function(dest){
		return Class.cloneObject(dest,this) ;
	}


	// static --------------------------------------------
	// inherits super statice members
	for (var name in this)
	{
		subclass[name] = this[name] ;
	}

	// copy staticMembers
	for (var name in staticMembers)
	{
		if(typeof staticMembers[name] == "function" && typeof subclass[name] == "function" && typeof this[name] == "function")
		{
			subclass[name] = methodBridge(name,staticMembers[name],this);
		}
		else{
			subclass[name] = staticMembers[name];
		}
	}

	subclass.super = this ;

	return subclass;
} ;

Class.isA = function(sub,sup){
	if( !sub || typeof sub.super=="undefined" )
	{
		return false ;
	}

	return sub.super===sup || Class.isA(sub.super,sup) ;
}

Class.prototype = {}

module.exports = Class ;
module.exports.__SHIPPABLE = true ;