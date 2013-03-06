require('seajs') ;
define(function(require){
//----------------------------------------------------


	var Class = function (){

	} ;

	/**
	 * deep clone object
	 */
	Class.cloneObject = function cloneObject(src,dest) {

		if(typeof dest=='undefined')
		{
			dest = src.constructor===Array? []: {} ;
			dest.constructor = src.constructor ;
			dest.__proto__ = src.__proto__ ;
		}

		var cloneProp = function(propName)
		{
			if( typeof(src[propName])=='object' )
			{
				dest[propName] = exports.clone( src[propName] ) ;
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
			exports.clone(arguments[i],dest) ;
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

		var _super = this.prototype;

		var prototype = new this();

		var subclass = function Class()
		{
			if( this===global || (typeof window!="undefined" &&this===window) )
			{
				throw new SyntaxError("can't call a contructor of Class as static function") ;
			}

			// call contructor
			if (this.ctor)
			{
				this.ctor.apply(this, arguments);
			}
		}

		// Copy the properties over onto the new prototype
		for (var name in dynamicMembers)
		{
			if(typeof dynamicMembers[name] == "function" && typeof _super[name] == "function")
			{
				prototype[name] = (function (name, fn) {
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
				})(name, dynamicMembers[name]);
			}
			else{
				prototype[name] = dynamicMembers[name];
			}
		}

		// copy staticMembers
		for (var name in staticMembers)
		{
			subclass[name] = staticMembers[name] ;
		}

		// Populate our constructed prototype object
		subclass.prototype = prototype;

		// Enforce the constructor to be what we expect
		subclass.prototype.constructor = subclass;

		subclass.prototype.clone = function(dest){
			dest = dest || {} ;
			return Class.cloneObject(this,dest) ;
		}

		// And make this Class extendable
		subclass.extend = arguments.callee;

		subclass.super = this ;

		return subclass;
	} ;

	return Class ;
//----------------------------------------------------
});