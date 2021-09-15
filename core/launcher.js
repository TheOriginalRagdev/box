/* realtime/share.uncompressed.js */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var textType = require('ot-text').type;
window.share = require('sharedb/lib/client');
window.share.types.register(textType);

// Copy below to node_modules/ot-text/lib/text.js bottom
/*

// Calculate the cursor position after the given operation
exports.applyToCursor = function (op) {
    var pos = 0;
    for (var i = 0; i < op.length; i++) {
        var c = op[i];
        switch (typeof c) {
            case 'number':
                pos += c;
                break;
            case 'string':
                pos += c.length;
                break;
            case 'object':
                //pos -= c.d;
                break;
        }
    }
    return pos;
};

// Generate an operation that semantically inverts the given operation
// when applied to the provided snapshot.
// It needs a snapshot of the document before the operation
// was applied to invert delete operations.
exports.semanticInvert = function (str, op) {
    if (typeof str !== 'string') {
        throw Error('Snapshot should be a string');
    }
    checkOp(op);

    // Save copy
    var originalOp = op.slice();

    // Shallow copy
    op = op.slice();

    var len = op.length;
    var cursor, prevOps, tmpStr;
    for (var i = 0; i < len; i++) {
        var c = op[i];
        switch (typeof c) {
            case 'number':
                // In case we have cursor movement we do nothing
                break;
            case 'string':
                // In case we have string insertion we generate a string deletion
                op[i] = {d: c.length};
                break;
            case 'object':
                // In case of a deletion we need to reinsert the deleted string
                prevOps = originalOp.slice(0, i);
                cursor = this.applyToCursor(prevOps);
                tmpStr = this.apply(str, trim(prevOps));
                op[i] = tmpStr.substring(cursor, cursor + c.d);
                break;
        }
    }

    return this.normalize(op);
};
* */

// Run "./node_modules/.bin/browserify buildme.js -o public/js/realtime/share.uncompressed.js"


},{"ot-text":10,"sharedb/lib/client":15}],2:[function(require,module,exports){
(function (process,global,setImmediate){(function (){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.async = global.async || {})));
}(this, (function (exports) { 'use strict';

function slice(arrayLike, start) {
    start = start|0;
    var newLen = Math.max(arrayLike.length - start, 0);
    var newArr = Array(newLen);
    for(var idx = 0; idx < newLen; idx++)  {
        newArr[idx] = arrayLike[start + idx];
    }
    return newArr;
}

/**
 * Creates a continuation function with some arguments already applied.
 *
 * Useful as a shorthand when combined with other control flow functions. Any
 * arguments passed to the returned function are added to the arguments
 * originally passed to apply.
 *
 * @name apply
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - The function you want to eventually apply all
 * arguments to. Invokes with (arguments...).
 * @param {...*} arguments... - Any number of arguments to automatically apply
 * when the continuation is called.
 * @returns {Function} the partially-applied function
 * @example
 *
 * // using apply
 * async.parallel([
 *     async.apply(fs.writeFile, 'testfile1', 'test1'),
 *     async.apply(fs.writeFile, 'testfile2', 'test2')
 * ]);
 *
 *
 * // the same process without using apply
 * async.parallel([
 *     function(callback) {
 *         fs.writeFile('testfile1', 'test1', callback);
 *     },
 *     function(callback) {
 *         fs.writeFile('testfile2', 'test2', callback);
 *     }
 * ]);
 *
 * // It's possible to pass any number of additional arguments when calling the
 * // continuation:
 *
 * node> var fn = async.apply(sys.puts, 'one');
 * node> fn('two', 'three');
 * one
 * two
 * three
 */
var apply = function(fn/*, ...args*/) {
    var args = slice(arguments, 1);
    return function(/*callArgs*/) {
        var callArgs = slice(arguments);
        return fn.apply(null, args.concat(callArgs));
    };
};

var initialParams = function (fn) {
    return function (/*...args, callback*/) {
        var args = slice(arguments);
        var callback = args.pop();
        fn.call(this, args, callback);
    };
};

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        defer(function () {
            fn.apply(null, args);
        });
    };
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

var setImmediate$1 = wrap(_defer);

/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function, or Promise-returning
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args..., callback)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es2017 example, though `asyncify` is not needed if your JS environment
 * // supports async functions out of the box
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */
function asyncify(func) {
    return initialParams(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function(value) {
                invokeCallback(callback, null, value);
            }, function(err) {
                invokeCallback(callback, err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

function invokeCallback(callback, error, value) {
    try {
        callback(error, value);
    } catch (e) {
        setImmediate$1(rethrow, e);
    }
}

function rethrow(error) {
    throw error;
}

var supportsSymbol = typeof Symbol === 'function';

function isAsync(fn) {
    return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

function applyEach$1(eachfn) {
    return function(fns/*, ...args*/) {
        var args = slice(arguments, 1);
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                wrapAsync(fn).apply(that, args.concat(cb));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
var breakLoop = {};

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

var getIterator = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$2.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$1.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? {value: coll[i], key: i} : null;
    }
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done)
            return null;
        i++;
        return {value: item.value, key: i};
    }
}

function createObjectIterator(obj) {
    var okeys = keys(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? {value: obj[key], key: key} : null;
    };
}

function iterator(coll) {
    if (isArrayLike(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = getIterator(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}

function onlyOnce(fn) {
    return function() {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var running = 0;
        var looping = false;

        function iterateeCallback(err, value) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            }
            else if (value === breakLoop || (done && running <= 0)) {
                done = true;
                return callback(null);
            }
            else if (!looping) {
                replenish();
            }
        }

        function replenish () {
            looping = true;
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
            looping = false;
        }

        replenish();
    };
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachOfLimit(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
}

function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}

// eachOf implementation optimized for array-likes
function eachOfArrayLike(coll, iteratee, callback) {
    callback = once(callback || noop);
    var index = 0,
        completed = 0,
        length = coll.length;
    if (length === 0) {
        callback(null);
    }

    function iteratorCallback(err, value) {
        if (err) {
            callback(err);
        } else if ((++completed === length) || value === breakLoop) {
            callback(null);
        }
    }

    for (; index < length; index++) {
        iteratee(coll[index], index, onlyOnce(iteratorCallback));
    }
}

// a generic version of eachOf which can handle array, object, and iterator cases.
var eachOfGeneric = doLimit(eachOfLimit, Infinity);

/**
 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
 * to the iteratee.
 *
 * @name eachOf
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEachOf
 * @category Collection
 * @see [async.each]{@link module:Collections.each}
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each
 * item in `coll`.
 * The `key` is the item's key, or index in the case of an array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * async.forEachOf(obj, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 * }, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * });
 */
var eachOf = function(coll, iteratee, callback) {
    var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
    eachOfImplementation(coll, wrapAsync(iteratee), callback);
};

function doParallel(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOf, obj, wrapAsync(iteratee), callback);
    };
}

function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = callback || noop;
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = wrapAsync(iteratee);

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        _iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Produces a new collection of values by mapping each value in `coll` through
 * the `iteratee` function. The `iteratee` is called with an item from `coll`
 * and a callback for when it has finished processing. Each of these callback
 * takes 2 arguments: an `error`, and the transformed item from `coll`. If
 * `iteratee` passes an error to its callback, the main `callback` (for the
 * `map` function) is immediately called with the error.
 *
 * Note, that since this function applies the `iteratee` to each item in
 * parallel, there is no guarantee that the `iteratee` functions will complete
 * in order. However, the results array will be in the same order as the
 * original `coll`.
 *
 * If `map` is passed an Object, the results will be an Array.  The results
 * will roughly be in the order of the original Objects' keys (but this can
 * vary across JavaScript engines).
 *
 * @name map
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an Array of the
 * transformed items from the `coll`. Invoked with (err, results).
 * @example
 *
 * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
 *     // results is now an array of stats for each file
 * });
 */
var map = doParallel(_asyncMap);

/**
 * Applies the provided arguments to each function in the array, calling
 * `callback` after all functions have completed. If you only provide the first
 * argument, `fns`, then it will return a function which lets you pass in the
 * arguments as if it were a single function call. If more arguments are
 * provided, `callback` is required while `args` is still optional.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(..args, callback)`. If invoked with any
 * arguments, `callback` is required.
 * @example
 *
 * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
 *
 * // partial application example:
 * async.each(
 *     buckets,
 *     async.applyEach([enableSearch, updateSchema]),
 *     callback
 * );
 */
var applyEach = applyEach$1(map);

function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(_eachOfLimit(limit), obj, wrapAsync(iteratee), callback);
    };
}

/**
 * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
 *
 * @name mapLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapLimit = doParallelLimit(_asyncMap);

/**
 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapSeries = doLimit(mapLimit, 1);

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument is provided, it will return
 * a function which lets you pass in the arguments as if it were a single
 * function call.
 */
var applyEachSeries = applyEach$1(mapSeries);

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
 * their requirements. Each function can optionally depend on other functions
 * being completed first, and each function is run as soon as its requirements
 * are satisfied.
 *
 * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
 * will stop. Further tasks will not execute (so any other functions depending
 * on it will not run), and the main `callback` is immediately called with the
 * error.
 *
 * {@link AsyncFunction}s also receive an object containing the results of functions which
 * have completed so far as the first argument, if they have dependencies. If a
 * task function has no dependencies, it will only be passed a callback.
 *
 * @name auto
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object} tasks - An object. Each of its properties is either a
 * function or an array of requirements, with the {@link AsyncFunction} itself the last item
 * in the array. The object's key of a property serves as the name of the task
 * defined by that property, i.e. can be used when specifying requirements for
 * other tasks. The function receives one or two arguments:
 * * a `results` object, containing the results of the previously executed
 *   functions, only passed if the task has any dependencies,
 * * a `callback(err, result)` function, which must be called when finished,
 *   passing an `error` (which can be `null`) and the result of the function's
 *   execution.
 * @param {number} [concurrency=Infinity] - An optional `integer` for
 * determining the maximum number of tasks that can be run in parallel. By
 * default, as many as possible.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback. Results are always returned; however, if an
 * error occurs, no further `tasks` will be performed, and the results object
 * will only contain partial results. Invoked with (err, results).
 * @returns undefined
 * @example
 *
 * async.auto({
 *     // this function will just be passed a callback
 *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
 *     showData: ['readData', function(results, cb) {
 *         // results.readData is the file's contents
 *         // ...
 *     }]
 * }, callback);
 *
 * async.auto({
 *     get_data: function(callback) {
 *         console.log('in get_data');
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         console.log('in make_folder');
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: ['get_data', 'make_folder', function(results, callback) {
 *         console.log('in write_file', JSON.stringify(results));
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(results, callback) {
 *         console.log('in email_link', JSON.stringify(results));
 *         // once the file is written let's email a link to it...
 *         // results.write_file contains the filename returned by write_file.
 *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
 *     }]
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('results = ', results);
 * });
 */
var auto = function (tasks, concurrency, callback) {
    if (typeof concurrency === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys$$1 = keys(tasks);
    var numTasks = keys$$1.length;
    if (!numTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = numTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = Object.create(null);

    var readyTasks = [];

    // for cycle detection:
    var readyToCheck = []; // tasks that have been identified as reachable
    // without the possibility of returning to an ancestor task
    var uncheckedDependencies = {};

    baseForOwn(tasks, function (task, key) {
        if (!isArray(task)) {
            // no dependencies
            enqueueTask(key, [task]);
            readyToCheck.push(key);
            return;
        }

        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
            enqueueTask(key, task);
            readyToCheck.push(key);
            return;
        }
        uncheckedDependencies[key] = remainingDependencies;

        arrayEach(dependencies, function (dependencyName) {
            if (!tasks[dependencyName]) {
                throw new Error('async.auto task `' + key +
                    '` has a non-existent dependency `' +
                    dependencyName + '` in ' +
                    dependencies.join(', '));
            }
            addListener(dependencyName, function () {
                remainingDependencies--;
                if (remainingDependencies === 0) {
                    enqueueTask(key, task);
                }
            });
        });
    });

    checkForDeadlocks();
    processQueue();

    function enqueueTask(key, task) {
        readyTasks.push(function () {
            runTask(key, task);
        });
    }

    function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
            return callback(null, results);
        }
        while(readyTasks.length && runningTasks < concurrency) {
            var run = readyTasks.shift();
            run();
        }

    }

    function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
            taskListeners = listeners[taskName] = [];
        }

        taskListeners.push(fn);
    }

    function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function (fn) {
            fn();
        });
        processQueue();
    }


    function runTask(key, task) {
        if (hasError) return;

        var taskCallback = onlyOnce(function(err, result) {
            runningTasks--;
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            if (err) {
                var safeResults = {};
                baseForOwn(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[key] = result;
                hasError = true;
                listeners = Object.create(null);

                callback(err, safeResults);
            } else {
                results[key] = result;
                taskComplete(key);
            }
        });

        runningTasks++;
        var taskFn = wrapAsync(task[task.length - 1]);
        if (task.length > 1) {
            taskFn(results, taskCallback);
        } else {
            taskFn(taskCallback);
        }
    }

    function checkForDeadlocks() {
        // Kahn's algorithm
        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
        // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
            currentTask = readyToCheck.pop();
            counter++;
            arrayEach(getDependents(currentTask), function (dependent) {
                if (--uncheckedDependencies[dependent] === 0) {
                    readyToCheck.push(dependent);
                }
            });
        }

        if (counter !== numTasks) {
            throw new Error(
                'async.auto cannot execute tasks due to a recursive dependency'
            );
        }
    }

    function getDependents(taskName) {
        var result = [];
        baseForOwn(tasks, function (task, key) {
            if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                result.push(key);
            }
        });
        return result;
    }
};

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the last unmatched string symbol.
 */
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;

  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the first unmatched string symbol.
 */
function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1,
      length = strSymbols.length;

  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f';
var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange = '\\u20d0-\\u20ff';
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f';
var reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20ff';
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trim('  abc  ');
 * // => 'abc'
 *
 * _.trim('-_-abc-_-', '_-');
 * // => 'abc'
 *
 * _.map(['  foo  ', '  bar  '], _.trim);
 * // => ['foo', 'bar']
 */
function trim(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      chrSymbols = stringToArray(chars),
      start = charsStartIndex(strSymbols, chrSymbols),
      end = charsEndIndex(strSymbols, chrSymbols) + 1;

  return castSlice(strSymbols, start, end).join('');
}

var FN_ARGS = /^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /(=.+)?(\s*)$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function parseParams(func) {
    func = func.toString().replace(STRIP_COMMENTS, '');
    func = func.match(FN_ARGS)[2].replace(' ', '');
    func = func ? func.split(FN_ARG_SPLIT) : [];
    func = func.map(function (arg){
        return trim(arg.replace(FN_ARG, ''));
    });
    return func;
}

/**
 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
 * tasks are specified as parameters to the function, after the usual callback
 * parameter, with the parameter names matching the names of the tasks it
 * depends on. This can provide even more readable task graphs which can be
 * easier to maintain.
 *
 * If a final callback is specified, the task results are similarly injected,
 * specified as named parameters after the initial error parameter.
 *
 * The autoInject function is purely syntactic sugar and its semantics are
 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
 *
 * @name autoInject
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.auto]{@link module:ControlFlow.auto}
 * @category Control Flow
 * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
 * the form 'func([dependencies...], callback). The object's key of a property
 * serves as the name of the task defined by that property, i.e. can be used
 * when specifying requirements for other tasks.
 * * The `callback` parameter is a `callback(err, result)` which must be called
 *   when finished, passing an `error` (which can be `null`) and the result of
 *   the function's execution. The remaining parameters name other tasks on
 *   which the task is dependent, and the results from those tasks are the
 *   arguments of those parameters.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback, and a `results` object with any completed
 * task results, similar to `auto`.
 * @example
 *
 * //  The example from `auto` can be rewritten as follows:
 * async.autoInject({
 *     get_data: function(callback) {
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: function(get_data, make_folder, callback) {
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     },
 *     email_link: function(write_file, callback) {
 *         // once the file is written let's email a link to it...
 *         // write_file contains the filename returned by write_file.
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 *
 * // If you are using a JS minifier that mangles parameter names, `autoInject`
 * // will not work with plain functions, since the parameter names will be
 * // collapsed to a single letter identifier.  To work around this, you can
 * // explicitly specify the names of the parameters your task function needs
 * // in an array, similar to Angular.js dependency injection.
 *
 * // This still has an advantage over plain `auto`, since the results a task
 * // depends on are still spread into arguments.
 * async.autoInject({
 *     //...
 *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(write_file, callback) {
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }]
 *     //...
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 */
function autoInject(tasks, callback) {
    var newTasks = {};

    baseForOwn(tasks, function (taskFn, key) {
        var params;
        var fnIsAsync = isAsync(taskFn);
        var hasNoDeps =
            (!fnIsAsync && taskFn.length === 1) ||
            (fnIsAsync && taskFn.length === 0);

        if (isArray(taskFn)) {
            params = taskFn.slice(0, -1);
            taskFn = taskFn[taskFn.length - 1];

            newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (hasNoDeps) {
            // no dependencies, use the function as-is
            newTasks[key] = taskFn;
        } else {
            params = parseParams(taskFn);
            if (taskFn.length === 0 && !fnIsAsync && params.length === 0) {
                throw new Error("autoInject task functions require explicit parameters.");
            }

            // remove callback param
            if (!fnIsAsync) params.pop();

            newTasks[key] = params.concat(newTask);
        }

        function newTask(results, taskCb) {
            var newArgs = arrayMap(params, function (name) {
                return results[name];
            });
            newArgs.push(taskCb);
            wrapAsync(taskFn).apply(null, newArgs);
        }
    });

    auto(newTasks, callback);
}

// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL() {
    this.head = this.tail = null;
    this.length = 0;
}

function setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
}

DLL.prototype.removeLink = function(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = node.next = null;
    this.length -= 1;
    return node;
};

DLL.prototype.empty = function () {
    while(this.head) this.shift();
    return this;
};

DLL.prototype.insertAfter = function(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) node.next.prev = newNode;
    else this.tail = newNode;
    node.next = newNode;
    this.length += 1;
};

DLL.prototype.insertBefore = function(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev) node.prev.next = newNode;
    else this.head = newNode;
    node.prev = newNode;
    this.length += 1;
};

DLL.prototype.unshift = function(node) {
    if (this.head) this.insertBefore(this.head, node);
    else setInitial(this, node);
};

DLL.prototype.push = function(node) {
    if (this.tail) this.insertAfter(this.tail, node);
    else setInitial(this, node);
};

DLL.prototype.shift = function() {
    return this.head && this.removeLink(this.head);
};

DLL.prototype.pop = function() {
    return this.tail && this.removeLink(this.tail);
};

DLL.prototype.toArray = function () {
    var arr = Array(this.length);
    var curr = this.head;
    for(var idx = 0; idx < this.length; idx++) {
        arr[idx] = curr.data;
        curr = curr.next;
    }
    return arr;
};

DLL.prototype.remove = function (testFn) {
    var curr = this.head;
    while(!!curr) {
        var next = curr.next;
        if (testFn(curr)) {
            this.removeLink(curr);
        }
        curr = next;
    }
    return this;
};

function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    var _worker = wrapAsync(worker);
    var numRunning = 0;
    var workersList = [];

    var processingScheduled = false;
    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                callback: callback || noop
            };

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }
        }

        if (!processingScheduled) {
            processingScheduled = true;
            setImmediate$1(function() {
                processingScheduled = false;
                q.process();
            });
        }
    }

    function _next(tasks) {
        return function(err){
            numRunning -= 1;

            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];

                var index = baseIndexOf(workersList, task, 0);
                if (index === 0) {
                    workersList.shift();
                } else if (index > 0) {
                    workersList.splice(index, 1);
                }

                task.callback.apply(task, arguments);

                if (err != null) {
                    q.error(err, task.data);
                }
            }

            if (numRunning <= (q.concurrency - q.buffer) ) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }
            q.process();
        };
    }

    var isProcessing = false;
    var q = {
        _tasks: new DLL(),
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated:noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        error: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q._tasks.empty();
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        remove: function (testFn) {
            q._tasks.remove(testFn);
        },
        process: function () {
            // Avoid trying to start too many processing operations. This can occur
            // when callbacks resolve synchronously (#1267).
            if (isProcessing) {
                return;
            }
            isProcessing = true;
            while(!q.paused && numRunning < q.concurrency && q._tasks.length){
                var tasks = [], data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    workersList.push(node);
                    data.push(node.data);
                }

                numRunning += 1;

                if (q._tasks.length === 0) {
                    q.empty();
                }

                if (numRunning === q.concurrency) {
                    q.saturated();
                }

                var cb = onlyOnce(_next(tasks));
                _worker(data, cb);
            }
            isProcessing = false;
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return numRunning;
        },
        workersList: function () {
            return workersList;
        },
        idle: function() {
            return q._tasks.length + numRunning === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) { return; }
            q.paused = false;
            setImmediate$1(q.process);
        }
    };
    return q;
}

/**
 * A cargo of tasks for the worker function to complete. Cargo inherits all of
 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
 * @typedef {Object} CargoObject
 * @memberOf module:ControlFlow
 * @property {Function} length - A function returning the number of items
 * waiting to be processed. Invoke like `cargo.length()`.
 * @property {number} payload - An `integer` for determining how many tasks
 * should be process per round. This property can be changed after a `cargo` is
 * created to alter the payload on-the-fly.
 * @property {Function} push - Adds `task` to the `queue`. The callback is
 * called once the `worker` has finished processing the task. Instead of a
 * single task, an array of `tasks` can be submitted. The respective callback is
 * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
 * @property {Function} saturated - A callback that is called when the
 * `queue.length()` hits the concurrency and further tasks will be queued.
 * @property {Function} empty - A callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - A callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke like `cargo.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
 */

/**
 * Creates a `cargo` object with the specified payload. Tasks added to the
 * cargo will be processed altogether (up to the `payload` limit). If the
 * `worker` is in progress, the task is queued until it becomes available. Once
 * the `worker` has completed some tasks, each callback of those tasks is
 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
 * for how `cargo` and `queue` work.
 *
 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
 * at a time, cargo passes an array of tasks to a single worker, repeating
 * when the worker is finished.
 *
 * @name cargo
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An asynchronous function for processing an array
 * of queued tasks. Invoked with `(tasks, callback)`.
 * @param {number} [payload=Infinity] - An optional `integer` for determining
 * how many tasks should be processed per round; if omitted, the default is
 * unlimited.
 * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the cargo and inner queue.
 * @example
 *
 * // create a cargo object with payload 2
 * var cargo = async.cargo(function(tasks, callback) {
 *     for (var i=0; i<tasks.length; i++) {
 *         console.log('hello ' + tasks[i].name);
 *     }
 *     callback();
 * }, 2);
 *
 * // add some items
 * cargo.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * cargo.push({name: 'bar'}, function(err) {
 *     console.log('finished processing bar');
 * });
 * cargo.push({name: 'baz'}, function(err) {
 *     console.log('finished processing baz');
 * });
 */
function cargo(worker, payload) {
    return queue(worker, 1, payload);
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
 *
 * @name eachOfSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Invoked with (err).
 */
var eachOfSeries = doLimit(eachOfLimit, 1);

/**
 * Reduces `coll` into a single value using an async `iteratee` to return each
 * successive step. `memo` is the initial state of the reduction. This function
 * only operates in series.
 *
 * For performance reasons, it may make sense to split a call to this function
 * into a parallel map, and then use the normal `Array.prototype.reduce` on the
 * results. This function is for situations where each step in the reduction
 * needs to be async; if you can get the data before reducing it, then it's
 * probably a good idea to do so.
 *
 * @name reduce
 * @static
 * @memberOf module:Collections
 * @method
 * @alias inject
 * @alias foldl
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 * @example
 *
 * async.reduce([1,2,3], 0, function(memo, item, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         callback(null, memo + item)
 *     });
 * }, function(err, result) {
 *     // result is now equal to the last value of memo, which is 6
 * });
 */
function reduce(coll, memo, iteratee, callback) {
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    eachOfSeries(coll, function(x, i, callback) {
        _iteratee(memo, x, function(err, v) {
            memo = v;
            callback(err);
        });
    }, function(err) {
        callback(err, memo);
    });
}

/**
 * Version of the compose function that is more natural to read. Each function
 * consumes the return value of the previous function. It is the equivalent of
 * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name seq
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.compose]{@link module:ControlFlow.compose}
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} a function that composes the `functions` in order
 * @example
 *
 * // Requires lodash (or underscore), express3 and dresende's orm2.
 * // Part of an app, that fetches cats of the logged user.
 * // This example uses `seq` function to avoid overnesting and error
 * // handling clutter.
 * app.get('/cats', function(request, response) {
 *     var User = request.models.User;
 *     async.seq(
 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
 *         function(user, fn) {
 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
 *         }
 *     )(req.session.user_id, function (err, cats) {
 *         if (err) {
 *             console.error(err);
 *             response.json({ status: 'error', message: err.message });
 *         } else {
 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
 *         }
 *     });
 * });
 */
function seq(/*...functions*/) {
    var _functions = arrayMap(arguments, wrapAsync);
    return function(/*...args*/) {
        var args = slice(arguments);
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(_functions, args, function(newargs, fn, cb) {
            fn.apply(that, newargs.concat(function(err/*, ...nextargs*/) {
                var nextargs = slice(arguments, 1);
                cb(err, nextargs);
            }));
        },
        function(err, results) {
            cb.apply(that, [err].concat(results));
        });
    };
}

/**
 * Creates a function which is a composition of the passed asynchronous
 * functions. Each function consumes the return value of the function that
 * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
 * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name compose
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} an asynchronous function that is the composed
 * asynchronous `functions`
 * @example
 *
 * function add1(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n + 1);
 *     }, 10);
 * }
 *
 * function mul3(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n * 3);
 *     }, 10);
 * }
 *
 * var add1mul3 = async.compose(mul3, add1);
 * add1mul3(4, function (err, result) {
 *     // result now equals 15
 * });
 */
var compose = function(/*...args*/) {
    return seq.apply(null, slice(arguments).reverse());
};

var _concat = Array.prototype.concat;

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
 *
 * @name concatLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err /*, ...args*/) {
            if (err) return callback(err);
            return callback(null, slice(arguments, 1));
        });
    }, function(err, mapResults) {
        var result = [];
        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                result = _concat.apply(result, mapResults[i]);
            }
        }

        return callback(err, result);
    });
};

/**
 * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
 * the concatenated list. The `iteratee`s are called in parallel, and the
 * results are concatenated as they return. There is no guarantee that the
 * results array will be returned in the original order of `coll` passed to the
 * `iteratee` function.
 *
 * @name concat
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 * @example
 *
 * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
 *     // files is now a list of filenames that exist in the 3 directories
 * });
 */
var concat = doLimit(concatLimit, Infinity);

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
 * The iteratee should complete with an array an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatSeries = doLimit(concatLimit, 1);

/**
 * Returns a function that when called, calls-back with the values provided.
 * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
 * [`auto`]{@link module:ControlFlow.auto}.
 *
 * @name constant
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {...*} arguments... - Any number of arguments to automatically invoke
 * callback with.
 * @returns {AsyncFunction} Returns a function that when invoked, automatically
 * invokes the callback with the previous given arguments.
 * @example
 *
 * async.waterfall([
 *     async.constant(42),
 *     function (value, next) {
 *         // value === 42
 *     },
 *     //...
 * ], callback);
 *
 * async.waterfall([
 *     async.constant(filename, "utf8"),
 *     fs.readFile,
 *     function (fileData, next) {
 *         //...
 *     }
 *     //...
 * ], callback);
 *
 * async.auto({
 *     hostname: async.constant("https://server.net/"),
 *     port: findFreePort,
 *     launchServer: ["hostname", "port", function (options, cb) {
 *         startServer(options, cb);
 *     }],
 *     //...
 * }, callback);
 */
var constant = function(/*...values*/) {
    var values = slice(arguments);
    var args = [null].concat(values);
    return function (/*...ignoredArgs, callback*/) {
        var callback = arguments[arguments.length - 1];
        return callback.apply(this, args);
    };
};

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

function _createTester(check, getResult) {
    return function(eachfn, arr, iteratee, cb) {
        cb = cb || noop;
        var testPassed = false;
        var testResult;
        eachfn(arr, function(value, _, callback) {
            iteratee(value, function(err, result) {
                if (err) {
                    callback(err);
                } else if (check(result) && !testResult) {
                    testPassed = true;
                    testResult = getResult(true, value);
                    callback(null, breakLoop);
                } else {
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                cb(err);
            } else {
                cb(null, testPassed ? testResult : getResult(false));
            }
        });
    };
}

function _findGetResult(v, x) {
    return x;
}

/**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @example
 *
 * async.detect(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
var detect = doParallel(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectLimit = doParallelLimit(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findSeries
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectSeries = doLimit(detectLimit, 1);

function consoleFunc(name) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        args.push(function (err/*, ...args*/) {
            var args = slice(arguments, 1);
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        });
        wrapAsync(fn).apply(null, args);
    };
}

/**
 * Logs the result of an [`async` function]{@link AsyncFunction} to the
 * `console` using `console.dir` to display the properties of the resulting object.
 * Only works in Node.js or in browsers that support `console.dir` and
 * `console.error` (such as FF and Chrome).
 * If multiple arguments are returned from the async function,
 * `console.dir` is called on each argument in order.
 *
 * @name dir
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, {hello: name});
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.dir(hello, 'world');
 * {hello: 'world'}
 */
var dir = consoleFunc('dir');

/**
 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.during]{@link module:ControlFlow.during}
 * @category Control Flow
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error if one occurred, otherwise `null`.
 */
function doDuring(fn, test, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        args.push(check);
        _test.apply(this, args);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    check(null, true);

}

/**
 * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
 * the order of operations, the arguments `test` and `iteratee` are switched.
 *
 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
 *
 * @name doWhilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - A function which is called each time `test`
 * passes. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped.
 * `callback` will be passed an error and any arguments passed to the final
 * `iteratee`'s callback. Invoked with (err, [results]);
 */
function doWhilst(iteratee, test, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        if (test.apply(this, args)) return _iteratee(next);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
 * argument ordering differs from `until`.
 *
 * @name doUntil
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function doUntil(iteratee, test, callback) {
    doWhilst(iteratee, function() {
        return !test.apply(this, arguments);
    }, callback);
}

/**
 * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
 * is passed a callback in the form of `function (err, truth)`. If error is
 * passed to `test` or `fn`, the main callback is immediately called with the
 * value of the error.
 *
 * @name during
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (callback).
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error, if one occurred, otherwise `null`.
 * @example
 *
 * var count = 0;
 *
 * async.during(
 *     function (callback) {
 *         return callback(null, count < 5);
 *     },
 *     function (callback) {
 *         count++;
 *         setTimeout(callback, 1000);
 *     },
 *     function (err) {
 *         // 5 seconds have passed
 *     }
 * );
 */
function during(test, fn, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err) {
        if (err) return callback(err);
        _test(check);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    _test(check);
}

function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}

/**
 * Applies the function `iteratee` to each item in `coll`, in parallel.
 * The `iteratee` is called with an item from the list, and a callback for when
 * it has finished. If the `iteratee` passes an error to its `callback`, the
 * main `callback` (for the `each` function) is immediately called with the
 * error.
 *
 * Note, that since this function applies `iteratee` to each item in parallel,
 * there is no guarantee that the iteratee functions will complete in order.
 *
 * @name each
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEach
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to
 * each item in `coll`. Invoked with (item, callback).
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOf`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names and saveFile is a function
 * // to save the modified contents of that file:
 *
 * async.each(openFiles, saveFile, function(err){
 *   // if any of the saves produced an error, err would equal that error
 * });
 *
 * // assuming openFiles is an array of file names
 * async.each(openFiles, function(file, callback) {
 *
 *     // Perform operation on file here.
 *     console.log('Processing file ' + file);
 *
 *     if( file.length > 32 ) {
 *       console.log('This file name is too long');
 *       callback('File name too long');
 *     } else {
 *       // Do work to process file here
 *       console.log('File processed');
 *       callback();
 *     }
 * }, function(err) {
 *     // if any of the file processing produced an error, err would equal that error
 *     if( err ) {
 *       // One of the iterations produced an error.
 *       // All processing will now stop.
 *       console.log('A file failed to process');
 *     } else {
 *       console.log('All files have been processed successfully');
 *     }
 * });
 */
function eachLimit(coll, iteratee, callback) {
    eachOf(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfLimit`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit$1(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfSeries`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
var eachSeries = doLimit(eachLimit$1, 1);

/**
 * Wrap an async function and ensure it calls its callback on a later tick of
 * the event loop.  If the function already calls its callback on a next tick,
 * no extra deferral is added. This is useful for preventing stack overflows
 * (`RangeError: Maximum call stack size exceeded`) and generally keeping
 * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
 * contained. ES2017 `async` functions are returned as-is -- they are immune
 * to Zalgo's corrupting influences, as they always resolve on a later tick.
 *
 * @name ensureAsync
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - an async function, one that expects a node-style
 * callback as its last argument.
 * @returns {AsyncFunction} Returns a wrapped function with the exact same call
 * signature as the function passed in.
 * @example
 *
 * function sometimesAsync(arg, callback) {
 *     if (cache[arg]) {
 *         return callback(null, cache[arg]); // this would be synchronous!!
 *     } else {
 *         doSomeIO(arg, callback); // this IO would be asynchronous
 *     }
 * }
 *
 * // this has a risk of stack overflows if many results are cached in a row
 * async.mapSeries(args, sometimesAsync, done);
 *
 * // this will defer sometimesAsync's callback if necessary,
 * // preventing stack overflows
 * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
 */
function ensureAsync(fn) {
    if (isAsync(fn)) return fn;
    return initialParams(function (args, callback) {
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate$1(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}

function notId(v) {
    return !v;
}

/**
 * Returns `true` if every element in `coll` satisfies an async test. If any
 * iteratee call returns `false`, the main `callback` is immediately called.
 *
 * @name every
 * @static
 * @memberOf module:Collections
 * @method
 * @alias all
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 * @example
 *
 * async.every(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then every file exists
 * });
 */
var every = doParallel(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
 *
 * @name everyLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everyLimit = doParallelLimit(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
 *
 * @name everySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in series.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everySeries = doLimit(everyLimit, 1);

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

function filterArray(eachfn, arr, iteratee, callback) {
    var truthValues = new Array(arr.length);
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthValues[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            if (truthValues[i]) results.push(arr[i]);
        }
        callback(null, results);
    });
}

function filterGeneric(eachfn, coll, iteratee, callback) {
    var results = [];
    eachfn(coll, function (x, index, callback) {
        iteratee(x, function (err, v) {
            if (err) {
                callback(err);
            } else {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, arrayMap(results.sort(function (a, b) {
                return a.index - b.index;
            }), baseProperty('value')));
        }
    });
}

function _filter(eachfn, coll, iteratee, callback) {
    var filter = isArrayLike(coll) ? filterArray : filterGeneric;
    filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
}

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.filter(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of the existing files
 * });
 */
var filter = doParallel(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name filterLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var filterLimit = doParallelLimit(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
 *
 * @name filterSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results)
 */
var filterSeries = doLimit(filterLimit, 1);

/**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the callback then `errback` is called with the
 * error, and execution stops, otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} fn - an async function to call repeatedly.
 * Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */
function forever(fn, errback) {
    var done = onlyOnce(errback || noop);
    var task = wrapAsync(ensureAsync(fn));

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
 *
 * @name groupByLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupByLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err, key) {
            if (err) return callback(err);
            return callback(null, {key: key, val: val});
        });
    }, function(err, mapResults) {
        var result = {};
        // from MDN, handle object having an `hasOwnProperty` prop
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                var key = mapResults[i].key;
                var val = mapResults[i].val;

                if (hasOwnProperty.call(result, key)) {
                    result[key].push(val);
                } else {
                    result[key] = [val];
                }
            }
        }

        return callback(err, result);
    });
};

/**
 * Returns a new object, where each value corresponds to an array of items, from
 * `coll`, that returned the corresponding key. That is, the keys of the object
 * correspond to the values passed to the `iteratee` callback.
 *
 * Note: Since this function applies the `iteratee` to each item in parallel,
 * there is no guarantee that the `iteratee` functions will complete in order.
 * However, the values for each key in the `result` will be in the same order as
 * the original `coll`. For Objects, the values will roughly be in the order of
 * the original Objects' keys (but this can vary across JavaScript engines).
 *
 * @name groupBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 * @example
 *
 * async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
 *     db.findById(userId, function(err, user) {
 *         if (err) return callback(err);
 *         return callback(null, user.age);
 *     });
 * }, function(err, result) {
 *     // result is object containing the userIds grouped by age
 *     // e.g. { 30: ['userId1', 'userId3'], 42: ['userId2']};
 * });
 */
var groupBy = doLimit(groupByLimit, Infinity);

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
 *
 * @name groupBySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupBySeries = doLimit(groupByLimit, 1);

/**
 * Logs the result of an `async` function to the `console`. Only works in
 * Node.js or in browsers that support `console.log` and `console.error` (such
 * as FF and Chrome). If multiple arguments are returned from the async
 * function, `console.log` is called on each argument in order.
 *
 * @name log
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, 'hello ' + name);
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.log(hello, 'world');
 * 'hello world'
 */
var log = consoleFunc('log');

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name mapValuesLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
function mapValuesLimit(obj, limit, iteratee, callback) {
    callback = once(callback || noop);
    var newObj = {};
    var _iteratee = wrapAsync(iteratee);
    eachOfLimit(obj, limit, function(val, key, next) {
        _iteratee(val, key, function (err, result) {
            if (err) return next(err);
            newObj[key] = result;
            next();
        });
    }, function (err) {
        callback(err, newObj);
    });
}

/**
 * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
 *
 * Produces a new Object by mapping each value of `obj` through the `iteratee`
 * function. The `iteratee` is called each `value` and `key` from `obj` and a
 * callback for when it has finished processing. Each of these callbacks takes
 * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
 * passes an error to its callback, the main `callback` (for the `mapValues`
 * function) is immediately called with the error.
 *
 * Note, the order of the keys in the result is not guaranteed.  The keys will
 * be roughly in the order they complete, (but this is very engine-specific)
 *
 * @name mapValues
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 * @example
 *
 * async.mapValues({
 *     f1: 'file1',
 *     f2: 'file2',
 *     f3: 'file3'
 * }, function (file, key, callback) {
 *   fs.stat(file, callback);
 * }, function(err, result) {
 *     // result is now a map of stats for each file, e.g.
 *     // {
 *     //     f1: [stats for file1],
 *     //     f2: [stats for file2],
 *     //     f3: [stats for file3]
 *     // }
 * });
 */

var mapValues = doLimit(mapValuesLimit, Infinity);

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
 *
 * @name mapValuesSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
var mapValuesSeries = doLimit(mapValuesLimit, 1);

function has(obj, key) {
    return key in obj;
}

/**
 * Caches the results of an async function. When creating a hash to store
 * function results against, the callback is omitted from the hash and an
 * optional hash function can be used.
 *
 * If no hash function is specified, the first argument is used as a hash key,
 * which may work reasonably if it is a string or a data type that converts to a
 * distinct string. Note that objects and arrays will not behave reasonably.
 * Neither will cases where the other arguments are significant. In such cases,
 * specify your own hash function.
 *
 * The cache of results is exposed as the `memo` property of the function
 * returned by `memoize`.
 *
 * @name memoize
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function to proxy and cache results from.
 * @param {Function} hasher - An optional function for generating a custom hash
 * for storing results. It has all the arguments applied to it apart from the
 * callback, and must be synchronous.
 * @returns {AsyncFunction} a memoized version of `fn`
 * @example
 *
 * var slow_fn = function(name, callback) {
 *     // do something
 *     callback(null, result);
 * };
 * var fn = async.memoize(slow_fn);
 *
 * // fn can now be used as if it were slow_fn
 * fn('some name', function() {
 *     // callback
 * });
 */
function memoize(fn, hasher) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    hasher = hasher || identity;
    var _fn = wrapAsync(fn);
    var memoized = initialParams(function memoized(args, callback) {
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
            setImmediate$1(function() {
                callback.apply(null, memo[key]);
            });
        } else if (has(queues, key)) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            _fn.apply(null, args.concat(function(/*args*/) {
                var args = slice(arguments);
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            }));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}

/**
 * Calls `callback` on a later loop around the event loop. In Node.js this just
 * calls `process.nextTick`.  In the browser it will use `setImmediate` if
 * available, otherwise `setTimeout(callback, 0)`, which means other higher
 * priority events may precede the execution of `callback`.
 *
 * This is used internally for browser-compatibility purposes.
 *
 * @name nextTick
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.setImmediate]{@link module:Utils.setImmediate}
 * @category Util
 * @param {Function} callback - The function to call on a later loop around
 * the event loop. Invoked with (args...).
 * @param {...*} args... - any number of additional arguments to pass to the
 * callback on the next tick.
 * @example
 *
 * var call_order = [];
 * async.nextTick(function() {
 *     call_order.push('two');
 *     // call_order now equals ['one','two']
 * });
 * call_order.push('one');
 *
 * async.setImmediate(function (a, b, c) {
 *     // a, b, and c equal 1, 2, and 3
 * }, 1, 2, 3);
 */
var _defer$1;

if (hasNextTick) {
    _defer$1 = process.nextTick;
} else if (hasSetImmediate) {
    _defer$1 = setImmediate;
} else {
    _defer$1 = fallback;
}

var nextTick = wrap(_defer$1);

function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        wrapAsync(task)(function (err, result) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            results[key] = result;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Run the `tasks` collection of functions in parallel, without waiting until
 * the previous function has completed. If any of the functions pass an error to
 * its callback, the main `callback` is immediately called with the value of the
 * error. Once the `tasks` have completed, the results are passed to the final
 * `callback` as an array.
 *
 * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
 * parallel execution of code.  If your tasks do not use any timers or perform
 * any I/O, they will actually be executed in series.  Any synchronous setup
 * sections for each task will happen one after the other.  JavaScript remains
 * single-threaded.
 *
 * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
 * execution of other tasks when a task fails.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 * results from {@link async.parallel}.
 *
 * @name parallel
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 *
 * @example
 * async.parallel([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // the results array will equal ['one','two'] even though
 *     // the second function had a shorter timeout.
 * });
 *
 * // an example using an object instead of an array
 * async.parallel({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equals to: {one: 1, two: 2}
 * });
 */
function parallelLimit(tasks, callback) {
    _parallel(eachOf, tasks, callback);
}

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 */
function parallelLimit$1(tasks, limit, callback) {
    _parallel(_eachOfLimit(limit), tasks, callback);
}

/**
 * A queue of tasks for the worker function to complete.
 * @typedef {Object} QueueObject
 * @memberOf module:ControlFlow
 * @property {Function} length - a function returning the number of items
 * waiting to be processed. Invoke with `queue.length()`.
 * @property {boolean} started - a boolean indicating whether or not any
 * items have been pushed and processed by the queue.
 * @property {Function} running - a function returning the number of items
 * currently being processed. Invoke with `queue.running()`.
 * @property {Function} workersList - a function returning the array of items
 * currently being processed. Invoke with `queue.workersList()`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `queue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - add a new task to the `queue`. Calls `callback`
 * once the `worker` has finished processing the task. Instead of a single task,
 * a `tasks` array can be submitted. The respective callback is used for every
 * task in the list. Invoke with `queue.push(task, [callback])`,
 * @property {Function} unshift - add a new task to the front of the `queue`.
 * Invoke with `queue.unshift(task, [callback])`.
 * @property {Function} remove - remove items from the queue that match a test
 * function.  The test function will be passed an object with a `data` property,
 * and a `priority` property, if this is a
 * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
 * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
 * `function ({data, priority}) {}` and returns a Boolean.
 * @property {Function} saturated - a callback that is called when the number of
 * running workers hits the `concurrency` limit, and further tasks will be
 * queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `queue` is `unsaturated`.
 * @property {Function} empty - a callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - a callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {boolean} paused - a boolean for determining whether the queue is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke with `queue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. No more tasks
 * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
 */

/**
 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
 * `queue` are processed in parallel (up to the `concurrency` limit). If all
 * `worker`s are in progress, the task is queued until one becomes available.
 * Once a `worker` completes a `task`, that `task`'s callback is called.
 *
 * @name queue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`. Invoked with (task, callback).
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the queue.
 * @example
 *
 * // create a queue object with concurrency 2
 * var q = async.queue(function(task, callback) {
 *     console.log('hello ' + task.name);
 *     callback();
 * }, 2);
 *
 * // assign a callback
 * q.drain = function() {
 *     console.log('all items have been processed');
 * };
 *
 * // add some items to the queue
 * q.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * q.push({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 *
 * // add some items to the queue (batch-wise)
 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
 *     console.log('finished processing item');
 * });
 *
 * // add some items to the front of the queue
 * q.unshift({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 */
var queue$1 = function (worker, concurrency) {
    var _worker = wrapAsync(worker);
    return queue(function (items, cb) {
        _worker(items[0], cb);
    }, concurrency, 1);
};

/**
 * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
 * completed in ascending priority order.
 *
 * @name priorityQueue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`.
 * Invoked with (task, callback).
 * @param {number} concurrency - An `integer` for determining how many `worker`
 * functions should be run in parallel.  If omitted, the concurrency defaults to
 * `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
 * differences between `queue` and `priorityQueue` objects:
 * * `push(task, priority, [callback])` - `priority` should be a number. If an
 *   array of `tasks` is given, all tasks will be assigned the same priority.
 * * The `unshift` method was removed.
 */
var priorityQueue = function(worker, concurrency) {
    // Start with a normal queue
    var q = queue$1(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function(data, priority, callback) {
        if (callback == null) callback = noop;
        if (typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        priority = priority || 0;
        var nextNode = q._tasks.head;
        while (nextNode && priority >= nextNode.priority) {
            nextNode = nextNode.next;
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                priority: priority,
                callback: callback
            };

            if (nextNode) {
                q._tasks.insertBefore(nextNode, item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
};

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any of the `tasks` complete or pass an
 * error to its callback, the main `callback` is immediately called. It's
 * equivalent to `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
 * to run. Each function can complete with an optional `result` value.
 * @param {Function} callback - A callback to run once any of the functions have
 * completed. This function gets an error or result from the first function that
 * completed. Invoked with (err, result).
 * @returns undefined
 * @example
 *
 * async.race([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // main callback
 * function(err, result) {
 *     // the result will be equal to 'two' as it finishes earlier
 * });
 */
function race(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return callback();
    for (var i = 0, l = tasks.length; i < l; i++) {
        wrapAsync(tasks[i])(callback);
    }
}

/**
 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
 *
 * @name reduceRight
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reduce]{@link module:Collections.reduce}
 * @alias foldr
 * @category Collection
 * @param {Array} array - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 */
function reduceRight (array, memo, iteratee, callback) {
    var reversed = slice(array).reverse();
    reduce(reversed, memo, iteratee, callback);
}

/**
 * Wraps the async function in another function that always completes with a
 * result object, even when it errors.
 *
 * The result object has either the property `error` or `value`.
 *
 * @name reflect
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function you want to wrap
 * @returns {Function} - A function that always passes null to it's callback as
 * the error. The second argument to the callback will be an `object` with
 * either an `error` or a `value` property.
 * @example
 *
 * async.parallel([
 *     async.reflect(function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff but error ...
 *         callback('bad stuff happened');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     })
 * ],
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = 'bad stuff happened'
 *     // results[2].value = 'two'
 * });
 */
function reflect(fn) {
    var _fn = wrapAsync(fn);
    return initialParams(function reflectOn(args, reflectCallback) {
        args.push(function callback(error, cbArg) {
            if (error) {
                reflectCallback(null, { error: error });
            } else {
                var value;
                if (arguments.length <= 2) {
                    value = cbArg;
                } else {
                    value = slice(arguments, 1);
                }
                reflectCallback(null, { value: value });
            }
        });

        return _fn.apply(this, args);
    });
}

/**
 * A helper function that wraps an array or an object of functions with `reflect`.
 *
 * @name reflectAll
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.reflect]{@link module:Utils.reflect}
 * @category Util
 * @param {Array|Object|Iterable} tasks - The collection of
 * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
 * @returns {Array} Returns an array of async functions, each wrapped in
 * `async.reflect`
 * @example
 *
 * let tasks = [
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         // do some more stuff but error ...
 *         callback(new Error('bad stuff happened'));
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ];
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = Error('bad stuff happened')
 *     // results[2].value = 'two'
 * });
 *
 * // an example using an object instead of an array
 * let tasks = {
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         callback('two');
 *     },
 *     three: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 100);
 *     }
 * };
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results.one.value = 'one'
 *     // results.two.error = 'two'
 *     // results.three.value = 'three'
 * });
 */
function reflectAll(tasks) {
    var results;
    if (isArray(tasks)) {
        results = arrayMap(tasks, reflect);
    } else {
        results = {};
        baseForOwn(tasks, function(task, key) {
            results[key] = reflect.call(this, task);
        });
    }
    return results;
}

function reject$1(eachfn, arr, iteratee, callback) {
    _filter(eachfn, arr, function(value, cb) {
        iteratee(value, function(err, v) {
            cb(err, !v);
        });
    }, callback);
}

/**
 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
 *
 * @name reject
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.reject(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of missing files
 *     createFiles(results);
 * });
 */
var reject = doParallel(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectLimit = doParallelLimit(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectSeries = doLimit(rejectLimit, 1);

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant$1(value) {
  return function() {
    return value;
  };
}

/**
 * Attempts to get a successful response from `task` no more than `times` times
 * before returning an error. If the task is successful, the `callback` will be
 * passed the result of the successful task. If all attempts fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name retry
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @see [async.retryable]{@link module:ControlFlow.retryable}
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
 * object with `times` and `interval` or a number.
 * * `times` - The number of attempts to make before giving up.  The default
 *   is `5`.
 * * `interval` - The time to wait between retries, in milliseconds.  The
 *   default is `0`. The interval may also be specified as a function of the
 *   retry count (see example).
 * * `errorFilter` - An optional synchronous function that is invoked on
 *   erroneous result. If it returns `true` the retry attempts will continue;
 *   if the function returns `false` the retry flow is aborted with the current
 *   attempt's error and result being returned to the final callback.
 *   Invoked with (err).
 * * If `opts` is a number, the number specifies the number of times to retry,
 *   with the default interval of `0`.
 * @param {AsyncFunction} task - An async function to retry.
 * Invoked with (callback).
 * @param {Function} [callback] - An optional callback which is called when the
 * task has succeeded, or after the final failed attempt. It receives the `err`
 * and `result` arguments of the last attempt at completing the `task`. Invoked
 * with (err, results).
 *
 * @example
 *
 * // The `retry` function can be used as a stand-alone control flow by passing
 * // a callback, as shown below:
 *
 * // try calling apiMethod 3 times
 * async.retry(3, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 3 times, waiting 200 ms between each retry
 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 10 times with exponential backoff
 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
 * async.retry({
 *   times: 10,
 *   interval: function(retryCount) {
 *     return 50 * Math.pow(2, retryCount);
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod the default 5 times no delay between each retry
 * async.retry(apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod only when error condition satisfies, all other
 * // errors will abort the retry control flow and return to final callback
 * async.retry({
 *   errorFilter: function(err) {
 *     return err.message === 'Temporary error'; // only retry on a specific error
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // to retry individual methods that are not as reliable within other
 * // control flow functions, use the `retryable` wrapper:
 * async.auto({
 *     users: api.getUsers.bind(api),
 *     payments: async.retryable(3, api.getPayments.bind(api))
 * }, function(err, results) {
 *     // do something with the results
 * });
 *
 */
function retry(opts, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant$1(DEFAULT_INTERVAL)
    };

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;

            acc.intervalFunc = typeof t.interval === 'function' ?
                t.interval :
                constant$1(+t.interval || DEFAULT_INTERVAL);

            acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }

    if (arguments.length < 3 && typeof opts === 'function') {
        callback = task || noop;
        task = opts;
    } else {
        parseTimes(options, opts);
        callback = callback || noop;
    }

    if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
    }

    var _task = wrapAsync(task);

    var attempt = 1;
    function retryAttempt() {
        _task(function(err) {
            if (err && attempt++ < options.times &&
                (typeof options.errorFilter != 'function' ||
                    options.errorFilter(err))) {
                setTimeout(retryAttempt, options.intervalFunc(attempt));
            } else {
                callback.apply(null, arguments);
            }
        });
    }

    retryAttempt();
}

/**
 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
 * wraps a task and makes it retryable, rather than immediately calling it
 * with retries.
 *
 * @name retryable
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.retry]{@link module:ControlFlow.retry}
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
 * options, exactly the same as from `retry`
 * @param {AsyncFunction} task - the asynchronous function to wrap.
 * This function will be passed any arguments passed to the returned wrapper.
 * Invoked with (...args, callback).
 * @returns {AsyncFunction} The wrapped function, which when invoked, will
 * retry on an error, based on the parameters specified in `opts`.
 * This function will accept the same parameters as `task`.
 * @example
 *
 * async.auto({
 *     dep1: async.retryable(3, getFromFlakyService),
 *     process: ["dep1", async.retryable(3, function (results, cb) {
 *         maybeProcessData(results.dep1, cb);
 *     })]
 * }, callback);
 */
var retryable = function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    var _task = wrapAsync(task);
    return initialParams(function (args, callback) {
        function taskFn(cb) {
            _task.apply(null, args.concat(cb));
        }

        if (opts) retry(opts, taskFn, callback);
        else retry(taskFn, callback);

    });
};

/**
 * Run the functions in the `tasks` collection in series, each one running once
 * the previous function has completed. If any functions in the series pass an
 * error to its callback, no more functions are run, and `callback` is
 * immediately called with the value of the error. Otherwise, `callback`
 * receives an array of results when `tasks` have completed.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function, and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 *  results from {@link async.series}.
 *
 * **Note** that while many implementations preserve the order of object
 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
 * explicitly states that
 *
 * > The mechanics and order of enumerating the properties is not specified.
 *
 * So if you rely on the order in which your series of functions are executed,
 * and want this to work on all platforms, consider using an array.
 *
 * @name series
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing
 * [async functions]{@link AsyncFunction} to run in series.
 * Each function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This function gets a results array (or object)
 * containing all the result arguments passed to the `task` callbacks. Invoked
 * with (err, result).
 * @example
 * async.series([
 *     function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     },
 *     function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // results is now equal to ['one', 'two']
 * });
 *
 * async.series({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback){
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equal to: {one: 1, two: 2}
 * });
 */
function series(tasks, callback) {
    _parallel(eachOfSeries, tasks, callback);
}

/**
 * Returns `true` if at least one element in the `coll` satisfies an async test.
 * If any iteratee call returns `true`, the main `callback` is immediately
 * called.
 *
 * @name some
 * @static
 * @memberOf module:Collections
 * @method
 * @alias any
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 * @example
 *
 * async.some(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then at least one of the files exists
 * });
 */
var some = doParallel(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
 *
 * @name someLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anyLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someLimit = doParallelLimit(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
 *
 * @name someSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anySeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in series.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someSeries = doLimit(someLimit, 1);

/**
 * Sorts a list by the results of running each `coll` value through an async
 * `iteratee`.
 *
 * @name sortBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a value to use as the sort criteria as
 * its `result`.
 * Invoked with (item, callback).
 * @param {Function} callback - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is the items
 * from the original `coll` sorted by the values returned by the `iteratee`
 * calls. Invoked with (err, results).
 * @example
 *
 * async.sortBy(['file1','file2','file3'], function(file, callback) {
 *     fs.stat(file, function(err, stats) {
 *         callback(err, stats.mtime);
 *     });
 * }, function(err, results) {
 *     // results is now the original array of files sorted by
 *     // modified date
 * });
 *
 * // By modifying the callback parameter the
 * // sorting order can be influenced:
 *
 * // ascending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x);
 * }, function(err,result) {
 *     // result callback
 * });
 *
 * // descending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
 * }, function(err,result) {
 *     // result callback
 * });
 */
function sortBy (coll, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    map(coll, function (x, callback) {
        _iteratee(x, function (err, criteria) {
            if (err) return callback(err);
            callback(null, {value: x, criteria: criteria});
        });
    }, function (err, results) {
        if (err) return callback(err);
        callback(null, arrayMap(results.sort(comparator), baseProperty('value')));
    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}

/**
 * Sets a time limit on an asynchronous function. If the function does not call
 * its callback within the specified milliseconds, it will be called with a
 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
 *
 * @name timeout
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} asyncFn - The async function to limit in time.
 * @param {number} milliseconds - The specified time limit.
 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
 * to timeout Error for more information..
 * @returns {AsyncFunction} Returns a wrapped function that can be used with any
 * of the control flow functions.
 * Invoke this function with the same parameters as you would `asyncFunc`.
 * @example
 *
 * function myFunction(foo, callback) {
 *     doAsyncTask(foo, function(err, data) {
 *         // handle errors
 *         if (err) return callback(err);
 *
 *         // do some stuff ...
 *
 *         // return processed data
 *         return callback(null, data);
 *     });
 * }
 *
 * var wrapped = async.timeout(myFunction, 1000);
 *
 * // call `wrapped` as you would `myFunction`
 * wrapped({ bar: 'bar' }, function(err, data) {
 *     // if `myFunction` takes < 1000 ms to execute, `err`
 *     // and `data` will have their expected values
 *
 *     // else `err` will be an Error with the code 'ETIMEDOUT'
 * });
 */
function timeout(asyncFn, milliseconds, info) {
    var fn = wrapAsync(asyncFn);

    return initialParams(function (args, callback) {
        var timedOut = false;
        var timer;

        function timeoutCallback() {
            var name = asyncFn.name || 'anonymous';
            var error  = new Error('Callback function "' + name + '" timed out.');
            error.code = 'ETIMEDOUT';
            if (info) {
                error.info = info;
            }
            timedOut = true;
            callback(error);
        }

        args.push(function () {
            if (!timedOut) {
                callback.apply(null, arguments);
                clearTimeout(timer);
            }
        });

        // setup timer and call original function
        timer = setTimeout(timeoutCallback, milliseconds);
        fn.apply(null, args);
    });
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;
var nativeMax = Math.max;

/**
 * The base implementation of `_.range` and `_.rangeRight` which doesn't
 * coerce arguments.
 *
 * @private
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the range of numbers.
 */
function baseRange(start, end, step, fromRight) {
  var index = -1,
      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
      result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */
function timeLimit(count, limit, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    mapLimit(baseRange(0, count, 1), limit, _iteratee, callback);
}

/**
 * Calls the `iteratee` function `n` times, and accumulates results in the same
 * manner you would use with [map]{@link module:Collections.map}.
 *
 * @name times
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 * @example
 *
 * // Pretend this is some complicated async factory
 * var createUser = function(id, callback) {
 *     callback(null, {
 *         id: 'user' + id
 *     });
 * };
 *
 * // generate 5 users
 * async.times(5, function(n, next) {
 *     createUser(n, function(err, user) {
 *         next(err, user);
 *     });
 * }, function(err, users) {
 *     // we should now have 5 users
 * });
 */
var times = doLimit(timeLimit, Infinity);

/**
 * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 */
var timesSeries = doLimit(timeLimit, 1);

/**
 * A relative of `reduce`.  Takes an Object or Array, and iterates over each
 * element in series, each step potentially mutating an `accumulator` value.
 * The type of the accumulator defaults to the type of collection passed in.
 *
 * @name transform
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} [accumulator] - The initial state of the transform.  If omitted,
 * it will default to an empty Object or Array, depending on the type of `coll`
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * collection that potentially modifies the accumulator.
 * Invoked with (accumulator, item, key, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the transformed accumulator.
 * Invoked with (err, result).
 * @example
 *
 * async.transform([1,2,3], function(acc, item, index, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         acc.push(item * 2)
 *         callback(null)
 *     });
 * }, function(err, result) {
 *     // result is now equal to [2, 4, 6]
 * });
 *
 * @example
 *
 * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
 *     setImmediate(function () {
 *         obj[key] = val * 2;
 *         callback();
 *     })
 * }, function (err, result) {
 *     // result is equal to {a: 2, b: 4, c: 6}
 * })
 */
function transform (coll, accumulator, iteratee, callback) {
    if (arguments.length <= 3) {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = isArray(coll) ? [] : {};
    }
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);

    eachOf(coll, function(v, k, cb) {
        _iteratee(accumulator, v, k, cb);
    }, function(err) {
        callback(err, accumulator);
    });
}

/**
 * It runs each task in series but stops whenever any of the functions were
 * successful. If one of the tasks were successful, the `callback` will be
 * passed the result of the successful task. If all tasks fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name tryEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing functions to
 * run, each function is passed a `callback(err, result)` it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {Function} [callback] - An optional callback which is called when one
 * of the tasks has succeeded, or all have failed. It receives the `err` and
 * `result` arguments of the last attempt at completing the `task`. Invoked with
 * (err, results).
 * @example
 * async.tryEach([
 *     function getDataFromFirstWebsite(callback) {
 *         // Try getting the data from the first website
 *         callback(err, data);
 *     },
 *     function getDataFromSecondWebsite(callback) {
 *         // First website failed,
 *         // Try getting the data from the backup website
 *         callback(err, data);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     Now do something with the data.
 * });
 *
 */
function tryEach(tasks, callback) {
    var error = null;
    var result;
    callback = callback || noop;
    eachSeries(tasks, function(task, callback) {
        wrapAsync(task)(function (err, res/*, ...args*/) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            } else {
                result = res;
            }
            error = err;
            callback(!err);
        });
    }, function () {
        callback(error, result);
    });
}

/**
 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.memoize]{@link module:Utils.memoize}
 * @category Util
 * @param {AsyncFunction} fn - the memoized function
 * @returns {AsyncFunction} a function that calls the original unmemoized function
 */
function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}

/**
 * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs.
 *
 * @name whilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 * @returns undefined
 * @example
 *
 * var count = 0;
 * async.whilst(
 *     function() { return count < 5; },
 *     function(callback) {
 *         count++;
 *         setTimeout(function() {
 *             callback(null, count);
 *         }, 1000);
 *     },
 *     function (err, n) {
 *         // 5 seconds have passed, n = 5
 *     }
 * );
 */
function whilst(test, iteratee, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    if (!test()) return callback(null);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        if (test()) return _iteratee(next);
        var args = slice(arguments, 1);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs. `callback` will be passed an error and any
 * arguments passed to the final `iteratee`'s callback.
 *
 * The inverse of [whilst]{@link module:ControlFlow.whilst}.
 *
 * @name until
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function until(test, iteratee, callback) {
    whilst(function() {
        return !test.apply(this, arguments);
    }, iteratee, callback);
}

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */
var waterfall = function(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        var task = wrapAsync(tasks[taskIndex++]);
        args.push(onlyOnce(next));
        task.apply(null, args);
    }

    function next(err/*, ...args*/) {
        if (err || taskIndex === tasks.length) {
            return callback.apply(null, arguments);
        }
        nextTask(slice(arguments, 1));
    }

    nextTask([]);
};

/**
 * An "async function" in the context of Async is an asynchronous function with
 * a variable number of parameters, with the final parameter being a callback.
 * (`function (arg1, arg2, ..., callback) {}`)
 * The final callback is of the form `callback(err, results...)`, which must be
 * called once the function is completed.  The callback should be called with a
 * Error as its first argument to signal that an error occurred.
 * Otherwise, if no error occurred, it should be called with `null` as the first
 * argument, and any additional `result` arguments that may apply, to signal
 * successful completion.
 * The callback must be called exactly once, ideally on a later tick of the
 * JavaScript event loop.
 *
 * This type of function is also referred to as a "Node-style async function",
 * or a "continuation passing-style function" (CPS). Most of the methods of this
 * library are themselves CPS/Node-style async functions, or functions that
 * return CPS/Node-style async functions.
 *
 * Wherever we accept a Node-style async function, we also directly accept an
 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
 * In this case, the `async` function will not be passed a final callback
 * argument, and any thrown error will be used as the `err` argument of the
 * implicit callback, and the return value will be used as the `result` value.
 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
 * argument, and a `resolved` value becomes the `result`.)
 *
 * Note, due to JavaScript limitations, we can only detect native `async`
 * functions and not transpilied implementations.
 * Your environment must have `async`/`await` support for this to work.
 * (e.g. Node > v7.6, or a recent version of a modern browser).
 * If you are using `async` functions through a transpiler (e.g. Babel), you
 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
 * because the `async function` will be compiled to an ordinary function that
 * returns a promise.
 *
 * @typedef {Function} AsyncFunction
 * @static
 */

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async`, it can also be used directly in the browser.
 * @module async
 * @see AsyncFunction
 */


/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */

var index = {
    apply: apply,
    applyEach: applyEach,
    applyEachSeries: applyEachSeries,
    asyncify: asyncify,
    auto: auto,
    autoInject: autoInject,
    cargo: cargo,
    compose: compose,
    concat: concat,
    concatLimit: concatLimit,
    concatSeries: concatSeries,
    constant: constant,
    detect: detect,
    detectLimit: detectLimit,
    detectSeries: detectSeries,
    dir: dir,
    doDuring: doDuring,
    doUntil: doUntil,
    doWhilst: doWhilst,
    during: during,
    each: eachLimit,
    eachLimit: eachLimit$1,
    eachOf: eachOf,
    eachOfLimit: eachOfLimit,
    eachOfSeries: eachOfSeries,
    eachSeries: eachSeries,
    ensureAsync: ensureAsync,
    every: every,
    everyLimit: everyLimit,
    everySeries: everySeries,
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    groupBy: groupBy,
    groupByLimit: groupByLimit,
    groupBySeries: groupBySeries,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    mapValues: mapValues,
    mapValuesLimit: mapValuesLimit,
    mapValuesSeries: mapValuesSeries,
    memoize: memoize,
    nextTick: nextTick,
    parallel: parallelLimit,
    parallelLimit: parallelLimit$1,
    priorityQueue: priorityQueue,
    queue: queue$1,
    race: race,
    reduce: reduce,
    reduceRight: reduceRight,
    reflect: reflect,
    reflectAll: reflectAll,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    retryable: retryable,
    seq: seq,
    series: series,
    setImmediate: setImmediate$1,
    some: some,
    someLimit: someLimit,
    someSeries: someSeries,
    sortBy: sortBy,
    timeout: timeout,
    times: times,
    timesLimit: timeLimit,
    timesSeries: timesSeries,
    transform: transform,
    tryEach: tryEach,
    unmemoize: unmemoize,
    until: until,
    waterfall: waterfall,
    whilst: whilst,

    // aliases
    all: every,
    allLimit: everyLimit,
    allSeries: everySeries,
    any: some,
    anyLimit: someLimit,
    anySeries: someSeries,
    find: detect,
    findLimit: detectLimit,
    findSeries: detectSeries,
    forEach: eachLimit,
    forEachSeries: eachSeries,
    forEachLimit: eachLimit$1,
    forEachOf: eachOf,
    forEachOfSeries: eachOfSeries,
    forEachOfLimit: eachOfLimit,
    inject: reduce,
    foldl: reduce,
    foldr: reduceRight,
    select: filter,
    selectLimit: filterLimit,
    selectSeries: filterSeries,
    wrapSync: asyncify
};

exports['default'] = index;
exports.apply = apply;
exports.applyEach = applyEach;
exports.applyEachSeries = applyEachSeries;
exports.asyncify = asyncify;
exports.auto = auto;
exports.autoInject = autoInject;
exports.cargo = cargo;
exports.compose = compose;
exports.concat = concat;
exports.concatLimit = concatLimit;
exports.concatSeries = concatSeries;
exports.constant = constant;
exports.detect = detect;
exports.detectLimit = detectLimit;
exports.detectSeries = detectSeries;
exports.dir = dir;
exports.doDuring = doDuring;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.during = during;
exports.each = eachLimit;
exports.eachLimit = eachLimit$1;
exports.eachOf = eachOf;
exports.eachOfLimit = eachOfLimit;
exports.eachOfSeries = eachOfSeries;
exports.eachSeries = eachSeries;
exports.ensureAsync = ensureAsync;
exports.every = every;
exports.everyLimit = everyLimit;
exports.everySeries = everySeries;
exports.filter = filter;
exports.filterLimit = filterLimit;
exports.filterSeries = filterSeries;
exports.forever = forever;
exports.groupBy = groupBy;
exports.groupByLimit = groupByLimit;
exports.groupBySeries = groupBySeries;
exports.log = log;
exports.map = map;
exports.mapLimit = mapLimit;
exports.mapSeries = mapSeries;
exports.mapValues = mapValues;
exports.mapValuesLimit = mapValuesLimit;
exports.mapValuesSeries = mapValuesSeries;
exports.memoize = memoize;
exports.nextTick = nextTick;
exports.parallel = parallelLimit;
exports.parallelLimit = parallelLimit$1;
exports.priorityQueue = priorityQueue;
exports.queue = queue$1;
exports.race = race;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reflect = reflect;
exports.reflectAll = reflectAll;
exports.reject = reject;
exports.rejectLimit = rejectLimit;
exports.rejectSeries = rejectSeries;
exports.retry = retry;
exports.retryable = retryable;
exports.seq = seq;
exports.series = series;
exports.setImmediate = setImmediate$1;
exports.some = some;
exports.someLimit = someLimit;
exports.someSeries = someSeries;
exports.sortBy = sortBy;
exports.timeout = timeout;
exports.times = times;
exports.timesLimit = timeLimit;
exports.timesSeries = timesSeries;
exports.transform = transform;
exports.tryEach = tryEach;
exports.unmemoize = unmemoize;
exports.until = until;
exports.waterfall = waterfall;
exports.whilst = whilst;
exports.all = every;
exports.allLimit = everyLimit;
exports.allSeries = everySeries;
exports.any = some;
exports.anyLimit = someLimit;
exports.anySeries = someSeries;
exports.find = detect;
exports.findLimit = detectLimit;
exports.findSeries = detectSeries;
exports.forEach = eachLimit;
exports.forEachSeries = eachSeries;
exports.forEachLimit = eachLimit$1;
exports.forEachOf = eachOf;
exports.forEachOfSeries = eachOfSeries;
exports.forEachOfLimit = eachOfLimit;
exports.inject = reduce;
exports.foldl = reduce;
exports.foldr = reduceRight;
exports.select = filter;
exports.selectLimit = filterLimit;
exports.selectSeries = filterSeries;
exports.wrapSync = asyncify;

Object.defineProperty(exports, '__esModule', { value: true });

})));

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"_process":12,"timers":35}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],4:[function(require,module,exports){
var hat = module.exports = function (bits, base) {
    if (!base) base = 16;
    if (bits === undefined) bits = 128;
    if (bits <= 0) return '0';
    
    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
    for (var i = 2; digits === Infinity; i *= 2) {
        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
    }
    
    var rem = digits - Math.floor(digits);
    
    var res = '';
    
    for (var i = 0; i < Math.floor(digits); i++) {
        var x = Math.floor(Math.random() * base).toString(base);
        res = x + res;
    }
    
    if (rem) {
        var b = Math.pow(base, rem);
        var x = Math.floor(Math.random() * b).toString(base);
        res = x + res;
    }
    
    var parsed = parseInt(res, base);
    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
        return hat(bits, base)
    }
    else return res;
};

hat.rack = function (bits, base, expandBy) {
    var fn = function (data) {
        var iters = 0;
        do {
            if (iters ++ > 10) {
                if (expandBy) bits += expandBy;
                else throw new Error('too many ID collisions, use more bits')
            }
            
            var id = hat(bits, base);
        } while (Object.hasOwnProperty.call(hats, id));
        
        hats[id] = data;
        return id;
    };
    var hats = fn.hats = {};
    
    fn.get = function (id) {
        return fn.hats[id];
    };
    
    fn.set = function (id, value) {
        fn.hats[id] = value;
        return fn;
    };
    
    fn.bits = bits || 128;
    fn.base = base || 16;
    return fn;
};

},{}],5:[function(require,module,exports){
// These methods let you build a transform function from a transformComponent
// function for OT types like JSON0 in which operations are lists of components
// and transforming them requires N^2 work. I find it kind of nasty that I need
// this, but I'm not really sure what a better solution is. Maybe I should do
// this automatically to types that don't have a compose function defined.

// Add transform and transformX functions for an OT type which has
// transformComponent defined.  transformComponent(destination array,
// component, other component, side)
module.exports = bootstrapTransform
function bootstrapTransform(type, transformComponent, checkValidOp, append) {
  var transformComponentX = function(left, right, destLeft, destRight) {
    transformComponent(destLeft, left, right, 'left');
    transformComponent(destRight, right, left, 'right');
  };

  var transformX = type.transformX = function(leftOp, rightOp) {
    checkValidOp(leftOp);
    checkValidOp(rightOp);
    var newRightOp = [];

    for (var i = 0; i < rightOp.length; i++) {
      var rightComponent = rightOp[i];

      // Generate newLeftOp by composing leftOp by rightComponent
      var newLeftOp = [];
      var k = 0;
      while (k < leftOp.length) {
        var nextC = [];
        transformComponentX(leftOp[k], rightComponent, newLeftOp, nextC);
        k++;

        if (nextC.length === 1) {
          rightComponent = nextC[0];
        } else if (nextC.length === 0) {
          for (var j = k; j < leftOp.length; j++) {
            append(newLeftOp, leftOp[j]);
          }
          rightComponent = null;
          break;
        } else {
          // Recurse.
          var pair = transformX(leftOp.slice(k), nextC);
          for (var l = 0; l < pair[0].length; l++) {
            append(newLeftOp, pair[0][l]);
          }
          for (var r = 0; r < pair[1].length; r++) {
            append(newRightOp, pair[1][r]);
          }
          rightComponent = null;
          break;
        }
      }

      if (rightComponent != null) {
        append(newRightOp, rightComponent);
      }
      leftOp = newLeftOp;
    }
    return [leftOp, newRightOp];
  };

  // Transforms op with specified type ('left' or 'right') by otherOp.
  type.transform = function(op, otherOp, type) {
    if (!(type === 'left' || type === 'right'))
      throw new Error("type must be 'left' or 'right'");

    if (otherOp.length === 0) return op;

    if (op.length === 1 && otherOp.length === 1)
      return transformComponent([], op[0], otherOp[0], type);

    if (type === 'left')
      return transformX(op, otherOp)[0];
    else
      return transformX(otherOp, op)[1];
  };
};

},{}],6:[function(require,module,exports){
// Only the JSON type is exported, because the text type is deprecated
// otherwise. (If you want to use it somewhere, you're welcome to pull it out
// into a separate module that json0 can depend on).

module.exports = {
  type: require('./json0')
};

},{"./json0":7}],7:[function(require,module,exports){
/*
 This is the implementation of the JSON OT type.

 Spec is here: https://github.com/josephg/ShareJS/wiki/JSON-Operations

 Note: This is being made obsolete. It will soon be replaced by the JSON2 type.
*/

/**
 * UTILITY FUNCTIONS
 */

/**
 * Checks if the passed object is an Array instance. Can't use Array.isArray
 * yet because its not supported on IE8.
 *
 * @param obj
 * @returns {boolean}
 */
var isArray = function(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]';
};

/**
 * Checks if the passed object is an Object instance.
 * No function call (fast) version
 *
 * @param obj
 * @returns {boolean}
 */
var isObject = function(obj) {
  return (!!obj) && (obj.constructor === Object);
};

/**
 * Clones the passed object using JSON serialization (which is slow).
 *
 * hax, copied from test/types/json. Apparently this is still the fastest way
 * to deep clone an object, assuming we have browser support for JSON.  @see
 * http://jsperf.com/cloning-an-object/12
 */
var clone = function(o) {
  return JSON.parse(JSON.stringify(o));
};

/**
 * JSON OT Type
 * @type {*}
 */
var json = {
  name: 'json0',
  uri: 'http://sharejs.org/types/JSONv0'
};

// You can register another OT type as a subtype in a JSON document using
// the following function. This allows another type to handle certain
// operations instead of the builtin JSON type.
var subtypes = {};
json.registerSubtype = function(subtype) {
  subtypes[subtype.name] = subtype;
};

json.create = function(data) {
  // Null instead of undefined if you don't pass an argument.
  return data === undefined ? null : clone(data);
};

json.invertComponent = function(c) {
  var c_ = {p: c.p};

  // handle subtype ops
  if (c.t && subtypes[c.t]) {
    c_.t = c.t;
    c_.o = subtypes[c.t].invert(c.o);
  }

  if (c.si !== void 0) c_.sd = c.si;
  if (c.sd !== void 0) c_.si = c.sd;
  if (c.oi !== void 0) c_.od = c.oi;
  if (c.od !== void 0) c_.oi = c.od;
  if (c.li !== void 0) c_.ld = c.li;
  if (c.ld !== void 0) c_.li = c.ld;
  if (c.na !== void 0) c_.na = -c.na;

  if (c.lm !== void 0) {
    c_.lm = c.p[c.p.length-1];
    c_.p = c.p.slice(0,c.p.length-1).concat([c.lm]);
  }

  return c_;
};

json.invert = function(op) {
  var op_ = op.slice().reverse();
  var iop = [];
  for (var i = 0; i < op_.length; i++) {
    iop.push(json.invertComponent(op_[i]));
  }
  return iop;
};

json.checkValidOp = function(op) {
  for (var i = 0; i < op.length; i++) {
    if (!isArray(op[i].p)) throw new Error('Missing path');
  }
};

json.checkList = function(elem) {
  if (!isArray(elem))
    throw new Error('Referenced element not a list');
};

json.checkObj = function(elem) {
  if (!isObject(elem)) {
    throw new Error("Referenced element not an object (it was " + JSON.stringify(elem) + ")");
  }
};

// helper functions to convert old string ops to and from subtype ops
function convertFromText(c) {
  c.t = 'text0';
  var o = {p: c.p.pop()};
  if (c.si != null) o.i = c.si;
  if (c.sd != null) o.d = c.sd;
  c.o = [o];
}

function convertToText(c) {
  c.p.push(c.o[0].p);
  if (c.o[0].i != null) c.si = c.o[0].i;
  if (c.o[0].d != null) c.sd = c.o[0].d;
  delete c.t;
  delete c.o;
}

json.apply = function(snapshot, op) {
  json.checkValidOp(op);

  op = clone(op);

  var container = {
    data: snapshot
  };

  for (var i = 0; i < op.length; i++) {
    var c = op[i];

    // convert old string ops to use subtype for backwards compatibility
    if (c.si != null || c.sd != null)
      convertFromText(c);

    var parent = null;
    var parentKey = null;
    var elem = container;
    var key = 'data';

    for (var j = 0; j < c.p.length; j++) {
      var p = c.p[j];

      parent = elem;
      parentKey = key;
      elem = elem[key];
      key = p;

      if (parent == null)
        throw new Error('Path invalid');
    }

    // handle subtype ops
    if (c.t && c.o !== void 0 && subtypes[c.t]) {
      elem[key] = subtypes[c.t].apply(elem[key], c.o);

    // Number add
    } else if (c.na !== void 0) {
      if (typeof elem[key] != 'number')
        throw new Error('Referenced element not a number');

      elem[key] += c.na;
    }

    // List replace
    else if (c.li !== void 0 && c.ld !== void 0) {
      json.checkList(elem);
      // Should check the list element matches c.ld
      elem[key] = c.li;
    }

    // List insert
    else if (c.li !== void 0) {
      json.checkList(elem);
      elem.splice(key,0, c.li);
    }

    // List delete
    else if (c.ld !== void 0) {
      json.checkList(elem);
      // Should check the list element matches c.ld here too.
      elem.splice(key,1);
    }

    // List move
    else if (c.lm !== void 0) {
      json.checkList(elem);
      if (c.lm != key) {
        var e = elem[key];
        // Remove it...
        elem.splice(key,1);
        // And insert it back.
        elem.splice(c.lm,0,e);
      }
    }

    // Object insert / replace
    else if (c.oi !== void 0) {
      json.checkObj(elem);

      // Should check that elem[key] == c.od
      elem[key] = c.oi;
    }

    // Object delete
    else if (c.od !== void 0) {
      json.checkObj(elem);

      // Should check that elem[key] == c.od
      delete elem[key];
    }

    else {
      throw new Error('invalid / missing instruction in op');
    }
  }

  return container.data;
};

// Helper to break an operation up into a bunch of small ops.
json.shatter = function(op) {
  var results = [];
  for (var i = 0; i < op.length; i++) {
    results.push([op[i]]);
  }
  return results;
};

// Helper for incrementally applying an operation to a snapshot. Calls yield
// after each op component has been applied.
json.incrementalApply = function(snapshot, op, _yield) {
  for (var i = 0; i < op.length; i++) {
    var smallOp = [op[i]];
    snapshot = json.apply(snapshot, smallOp);
    // I'd just call this yield, but thats a reserved keyword. Bah!
    _yield(smallOp, snapshot);
  }

  return snapshot;
};

// Checks if two paths, p1 and p2 match.
var pathMatches = json.pathMatches = function(p1, p2, ignoreLast) {
  if (p1.length != p2.length)
    return false;

  for (var i = 0; i < p1.length; i++) {
    if (p1[i] !== p2[i] && (!ignoreLast || i !== p1.length - 1))
      return false;
  }

  return true;
};

json.append = function(dest,c) {
  c = clone(c);

  if (dest.length === 0) {
    dest.push(c);
    return;
  }

  var last = dest[dest.length - 1];

  // convert old string ops to use subtype for backwards compatibility
  if ((c.si != null || c.sd != null) && (last.si != null || last.sd != null)) {
    convertFromText(c);
    convertFromText(last);
  }

  if (pathMatches(c.p, last.p)) {
    // handle subtype ops
    if (c.t && last.t && c.t === last.t && subtypes[c.t]) {
      last.o = subtypes[c.t].compose(last.o, c.o);

      // convert back to old string ops
      if (c.si != null || c.sd != null) {
        var p = c.p;
        for (var i = 0; i < last.o.length - 1; i++) {
          c.o = [last.o.pop()];
          c.p = p.slice();
          convertToText(c);
          dest.push(c);
        }

        convertToText(last);
      }
    } else if (last.na != null && c.na != null) {
      dest[dest.length - 1] = {p: last.p, na: last.na + c.na};
    } else if (last.li !== undefined && c.li === undefined && c.ld === last.li) {
      // insert immediately followed by delete becomes a noop.
      if (last.ld !== undefined) {
        // leave the delete part of the replace
        delete last.li;
      } else {
        dest.pop();
      }
    } else if (last.od !== undefined && last.oi === undefined && c.oi !== undefined && c.od === undefined) {
      last.oi = c.oi;
    } else if (last.oi !== undefined && c.od !== undefined) {
      // The last path component inserted something that the new component deletes (or replaces).
      // Just merge them.
      if (c.oi !== undefined) {
        last.oi = c.oi;
      } else if (last.od !== undefined) {
        delete last.oi;
      } else {
        // An insert directly followed by a delete turns into a no-op and can be removed.
        dest.pop();
      }
    } else if (c.lm !== undefined && c.p[c.p.length - 1] === c.lm) {
      // don't do anything
    } else {
      dest.push(c);
    }
  } else {
    // convert string ops back
    if ((c.si != null || c.sd != null) && (last.si != null || last.sd != null)) {
      convertToText(c);
      convertToText(last);
    }

    dest.push(c);
  }
};

json.compose = function(op1,op2) {
  json.checkValidOp(op1);
  json.checkValidOp(op2);

  var newOp = clone(op1);

  for (var i = 0; i < op2.length; i++) {
    json.append(newOp,op2[i]);
  }

  return newOp;
};

json.normalize = function(op) {
  var newOp = [];

  op = isArray(op) ? op : [op];

  for (var i = 0; i < op.length; i++) {
    var c = op[i];
    if (c.p == null) c.p = [];

    json.append(newOp,c);
  }

  return newOp;
};

// Returns the common length of the paths of ops a and b
json.commonLengthForOps = function(a, b) {
  var alen = a.p.length;
  var blen = b.p.length;
  if (a.na != null || a.t)
    alen++;

  if (b.na != null || b.t)
    blen++;

  if (alen === 0) return -1;
  if (blen === 0) return null;

  alen--;
  blen--;

  for (var i = 0; i < alen; i++) {
    var p = a.p[i];
    if (i >= blen || p !== b.p[i])
      return null;
  }

  return alen;
};

// Returns true if an op can affect the given path
json.canOpAffectPath = function(op, path) {
  return json.commonLengthForOps({p:path}, op) != null;
};

// transform c so it applies to a document with otherC applied.
json.transformComponent = function(dest, c, otherC, type) {
  c = clone(c);

  var common = json.commonLengthForOps(otherC, c);
  var common2 = json.commonLengthForOps(c, otherC);
  var cplength = c.p.length;
  var otherCplength = otherC.p.length;

  if (c.na != null || c.t)
    cplength++;

  if (otherC.na != null || otherC.t)
    otherCplength++;

  // if c is deleting something, and that thing is changed by otherC, we need to
  // update c to reflect that change for invertibility.
  if (common2 != null && otherCplength > cplength && c.p[common2] == otherC.p[common2]) {
    if (c.ld !== void 0) {
      var oc = clone(otherC);
      oc.p = oc.p.slice(cplength);
      c.ld = json.apply(clone(c.ld),[oc]);
    } else if (c.od !== void 0) {
      var oc = clone(otherC);
      oc.p = oc.p.slice(cplength);
      c.od = json.apply(clone(c.od),[oc]);
    }
  }

  if (common != null) {
    var commonOperand = cplength == otherCplength;

    // backward compatibility for old string ops
    var oc = otherC;
    if ((c.si != null || c.sd != null) && (otherC.si != null || otherC.sd != null)) {
      convertFromText(c);
      oc = clone(otherC);
      convertFromText(oc);
    }

    // handle subtype ops
    if (oc.t && subtypes[oc.t]) {
      if (c.t && c.t === oc.t) {
        var res = subtypes[c.t].transform(c.o, oc.o, type);

        // convert back to old string ops
        if (c.si != null || c.sd != null) {
          var p = c.p;
          for (var i = 0; i < res.length; i++) {
            c.o = [res[i]];
            c.p = p.slice();
            convertToText(c);
            json.append(dest, c);
          }
        } else if (!isArray(res) || res.length > 0) {
          c.o = res;
          json.append(dest, c);
        }

        return dest;
      }
    }

    // transform based on otherC
    else if (otherC.na !== void 0) {
      // this case is handled below
    } else if (otherC.li !== void 0 && otherC.ld !== void 0) {
      if (otherC.p[common] === c.p[common]) {
        // noop

        if (!commonOperand) {
          return dest;
        } else if (c.ld !== void 0) {
          // we're trying to delete the same element, -> noop
          if (c.li !== void 0 && type === 'left') {
            // we're both replacing one element with another. only one can survive
            c.ld = clone(otherC.li);
          } else {
            return dest;
          }
        }
      }
    } else if (otherC.li !== void 0) {
      if (c.li !== void 0 && c.ld === undefined && commonOperand && c.p[common] === otherC.p[common]) {
        // in li vs. li, left wins.
        if (type === 'right')
          c.p[common]++;
      } else if (otherC.p[common] <= c.p[common]) {
        c.p[common]++;
      }

      if (c.lm !== void 0) {
        if (commonOperand) {
          // otherC edits the same list we edit
          if (otherC.p[common] <= c.lm)
            c.lm++;
          // changing c.from is handled above.
        }
      }
    } else if (otherC.ld !== void 0) {
      if (c.lm !== void 0) {
        if (commonOperand) {
          if (otherC.p[common] === c.p[common]) {
            // they deleted the thing we're trying to move
            return dest;
          }
          // otherC edits the same list we edit
          var p = otherC.p[common];
          var from = c.p[common];
          var to = c.lm;
          if (p < to || (p === to && from < to))
            c.lm--;

        }
      }

      if (otherC.p[common] < c.p[common]) {
        c.p[common]--;
      } else if (otherC.p[common] === c.p[common]) {
        if (otherCplength < cplength) {
          // we're below the deleted element, so -> noop
          return dest;
        } else if (c.ld !== void 0) {
          if (c.li !== void 0) {
            // we're replacing, they're deleting. we become an insert.
            delete c.ld;
          } else {
            // we're trying to delete the same element, -> noop
            return dest;
          }
        }
      }

    } else if (otherC.lm !== void 0) {
      if (c.lm !== void 0 && cplength === otherCplength) {
        // lm vs lm, here we go!
        var from = c.p[common];
        var to = c.lm;
        var otherFrom = otherC.p[common];
        var otherTo = otherC.lm;
        if (otherFrom !== otherTo) {
          // if otherFrom == otherTo, we don't need to change our op.

          // where did my thing go?
          if (from === otherFrom) {
            // they moved it! tie break.
            if (type === 'left') {
              c.p[common] = otherTo;
              if (from === to) // ugh
                c.lm = otherTo;
            } else {
              return dest;
            }
          } else {
            // they moved around it
            if (from > otherFrom) c.p[common]--;
            if (from > otherTo) c.p[common]++;
            else if (from === otherTo) {
              if (otherFrom > otherTo) {
                c.p[common]++;
                if (from === to) // ugh, again
                  c.lm++;
              }
            }

            // step 2: where am i going to put it?
            if (to > otherFrom) {
              c.lm--;
            } else if (to === otherFrom) {
              if (to > from)
                c.lm--;
            }
            if (to > otherTo) {
              c.lm++;
            } else if (to === otherTo) {
              // if we're both moving in the same direction, tie break
              if ((otherTo > otherFrom && to > from) ||
                  (otherTo < otherFrom && to < from)) {
                if (type === 'right') c.lm++;
              } else {
                if (to > from) c.lm++;
                else if (to === otherFrom) c.lm--;
              }
            }
          }
        }
      } else if (c.li !== void 0 && c.ld === undefined && commonOperand) {
        // li
        var from = otherC.p[common];
        var to = otherC.lm;
        p = c.p[common];
        if (p > from) c.p[common]--;
        if (p > to) c.p[common]++;
      } else {
        // ld, ld+li, si, sd, na, oi, od, oi+od, any li on an element beneath
        // the lm
        //
        // i.e. things care about where their item is after the move.
        var from = otherC.p[common];
        var to = otherC.lm;
        p = c.p[common];
        if (p === from) {
          c.p[common] = to;
        } else {
          if (p > from) c.p[common]--;
          if (p > to) c.p[common]++;
          else if (p === to && from > to) c.p[common]++;
        }
      }
    }
    else if (otherC.oi !== void 0 && otherC.od !== void 0) {
      if (c.p[common] === otherC.p[common]) {
        if (c.oi !== void 0 && commonOperand) {
          // we inserted where someone else replaced
          if (type === 'right') {
            // left wins
            return dest;
          } else {
            // we win, make our op replace what they inserted
            c.od = otherC.oi;
          }
        } else {
          // -> noop if the other component is deleting the same object (or any parent)
          return dest;
        }
      }
    } else if (otherC.oi !== void 0) {
      if (c.oi !== void 0 && c.p[common] === otherC.p[common]) {
        // left wins if we try to insert at the same place
        if (type === 'left') {
          json.append(dest,{p: c.p, od:otherC.oi});
        } else {
          return dest;
        }
      }
    } else if (otherC.od !== void 0) {
      if (c.p[common] == otherC.p[common]) {
        if (!commonOperand)
          return dest;
        if (c.oi !== void 0) {
          delete c.od;
        } else {
          return dest;
        }
      }
    }
  }

  json.append(dest,c);
  return dest;
};

require('./bootstrapTransform')(json, json.transformComponent, json.checkValidOp, json.append);

/**
 * Register a subtype for string operations, using the text0 type.
 */
var text = require('./text0');

json.registerSubtype(text);
module.exports = json;


},{"./bootstrapTransform":5,"./text0":8}],8:[function(require,module,exports){
// DEPRECATED!
//
// This type works, but is not exported. Its included here because the JSON0
// embedded string operations use this library.


// A simple text implementation
//
// Operations are lists of components. Each component either inserts or deletes
// at a specified position in the document.
//
// Components are either:
//  {i:'str', p:100}: Insert 'str' at position 100 in the document
//  {d:'str', p:100}: Delete 'str' at position 100 in the document
//
// Components in an operation are executed sequentially, so the position of components
// assumes previous components have already executed.
//
// Eg: This op:
//   [{i:'abc', p:0}]
// is equivalent to this op:
//   [{i:'a', p:0}, {i:'b', p:1}, {i:'c', p:2}]

var text = module.exports = {
  name: 'text0',
  uri: 'http://sharejs.org/types/textv0',
  create: function(initial) {
    if ((initial != null) && typeof initial !== 'string') {
      throw new Error('Initial data must be a string');
    }
    return initial || '';
  }
};

/** Insert s2 into s1 at pos. */
var strInject = function(s1, pos, s2) {
  return s1.slice(0, pos) + s2 + s1.slice(pos);
};

/** Check that an operation component is valid. Throws if its invalid. */
var checkValidComponent = function(c) {
  if (typeof c.p !== 'number')
    throw new Error('component missing position field');

  if ((typeof c.i === 'string') === (typeof c.d === 'string'))
    throw new Error('component needs an i or d field');

  if (c.p < 0)
    throw new Error('position cannot be negative');
};

/** Check that an operation is valid */
var checkValidOp = function(op) {
  for (var i = 0; i < op.length; i++) {
    checkValidComponent(op[i]);
  }
};

/** Apply op to snapshot */
text.apply = function(snapshot, op) {
  var deleted;

  checkValidOp(op);
  for (var i = 0; i < op.length; i++) {
    var component = op[i];
    if (component.i != null) {
      snapshot = strInject(snapshot, component.p, component.i);
    } else {
      deleted = snapshot.slice(component.p, component.p + component.d.length);
      if (component.d !== deleted)
        throw new Error("Delete component '" + component.d + "' does not match deleted text '" + deleted + "'");

      snapshot = snapshot.slice(0, component.p) + snapshot.slice(component.p + component.d.length);
    }
  }
  return snapshot;
};

/**
 * Append a component to the end of newOp. Exported for use by the random op
 * generator and the JSON0 type.
 */
var append = text._append = function(newOp, c) {
  if (c.i === '' || c.d === '') return;

  if (newOp.length === 0) {
    newOp.push(c);
  } else {
    var last = newOp[newOp.length - 1];

    if (last.i != null && c.i != null && last.p <= c.p && c.p <= last.p + last.i.length) {
      // Compose the insert into the previous insert
      newOp[newOp.length - 1] = {i:strInject(last.i, c.p - last.p, c.i), p:last.p};

    } else if (last.d != null && c.d != null && c.p <= last.p && last.p <= c.p + c.d.length) {
      // Compose the deletes together
      newOp[newOp.length - 1] = {d:strInject(c.d, last.p - c.p, last.d), p:c.p};

    } else {
      newOp.push(c);
    }
  }
};

/** Compose op1 and op2 together */
text.compose = function(op1, op2) {
  checkValidOp(op1);
  checkValidOp(op2);
  var newOp = op1.slice();
  for (var i = 0; i < op2.length; i++) {
    append(newOp, op2[i]);
  }
  return newOp;
};

/** Clean up an op */
text.normalize = function(op) {
  var newOp = [];

  // Normalize should allow ops which are a single (unwrapped) component:
  // {i:'asdf', p:23}.
  // There's no good way to test if something is an array:
  // http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
  // so this is probably the least bad solution.
  if (op.i != null || op.p != null) op = [op];

  for (var i = 0; i < op.length; i++) {
    var c = op[i];
    if (c.p == null) c.p = 0;

    append(newOp, c);
  }

  return newOp;
};

// This helper method transforms a position by an op component.
//
// If c is an insert, insertAfter specifies whether the transform
// is pushed after the insert (true) or before it (false).
//
// insertAfter is optional for deletes.
var transformPosition = function(pos, c, insertAfter) {
  // This will get collapsed into a giant ternary by uglify.
  if (c.i != null) {
    if (c.p < pos || (c.p === pos && insertAfter)) {
      return pos + c.i.length;
    } else {
      return pos;
    }
  } else {
    // I think this could also be written as: Math.min(c.p, Math.min(c.p -
    // otherC.p, otherC.d.length)) but I think its harder to read that way, and
    // it compiles using ternary operators anyway so its no slower written like
    // this.
    if (pos <= c.p) {
      return pos;
    } else if (pos <= c.p + c.d.length) {
      return c.p;
    } else {
      return pos - c.d.length;
    }
  }
};

// Helper method to transform a cursor position as a result of an op.
//
// Like transformPosition above, if c is an insert, insertAfter specifies
// whether the cursor position is pushed after an insert (true) or before it
// (false).
text.transformCursor = function(position, op, side) {
  var insertAfter = side === 'right';
  for (var i = 0; i < op.length; i++) {
    position = transformPosition(position, op[i], insertAfter);
  }

  return position;
};

// Transform an op component by another op component. Asymmetric.
// The result will be appended to destination.
//
// exported for use in JSON type
var transformComponent = text._tc = function(dest, c, otherC, side) {
  //var cIntersect, intersectEnd, intersectStart, newC, otherIntersect, s;

  checkValidComponent(c);
  checkValidComponent(otherC);

  if (c.i != null) {
    // Insert.
    append(dest, {i:c.i, p:transformPosition(c.p, otherC, side === 'right')});
  } else {
    // Delete
    if (otherC.i != null) {
      // Delete vs insert
      var s = c.d;
      if (c.p < otherC.p) {
        append(dest, {d:s.slice(0, otherC.p - c.p), p:c.p});
        s = s.slice(otherC.p - c.p);
      }
      if (s !== '')
        append(dest, {d: s, p: c.p + otherC.i.length});

    } else {
      // Delete vs delete
      if (c.p >= otherC.p + otherC.d.length)
        append(dest, {d: c.d, p: c.p - otherC.d.length});
      else if (c.p + c.d.length <= otherC.p)
        append(dest, c);
      else {
        // They overlap somewhere.
        var newC = {d: '', p: c.p};

        if (c.p < otherC.p)
          newC.d = c.d.slice(0, otherC.p - c.p);

        if (c.p + c.d.length > otherC.p + otherC.d.length)
          newC.d += c.d.slice(otherC.p + otherC.d.length - c.p);

        // This is entirely optional - I'm just checking the deleted text in
        // the two ops matches
        var intersectStart = Math.max(c.p, otherC.p);
        var intersectEnd = Math.min(c.p + c.d.length, otherC.p + otherC.d.length);
        var cIntersect = c.d.slice(intersectStart - c.p, intersectEnd - c.p);
        var otherIntersect = otherC.d.slice(intersectStart - otherC.p, intersectEnd - otherC.p);
        if (cIntersect !== otherIntersect)
          throw new Error('Delete ops delete different text in the same region of the document');

        if (newC.d !== '') {
          newC.p = transformPosition(newC.p, otherC);
          append(dest, newC);
        }
      }
    }
  }

  return dest;
};

var invertComponent = function(c) {
  return (c.i != null) ? {d:c.i, p:c.p} : {i:c.d, p:c.p};
};

// No need to use append for invert, because the components won't be able to
// cancel one another.
text.invert = function(op) {
  // Shallow copy & reverse that sucka.
  op = op.slice().reverse();
  for (var i = 0; i < op.length; i++) {
    op[i] = invertComponent(op[i]);
  }
  return op;
};

require('./bootstrapTransform')(text, transformComponent, checkValidOp, append);

},{"./bootstrapTransform":5}],9:[function(require,module,exports){
// Text document API for the 'text' type. This implements some standard API
// methods for any text-like type, so you can easily bind a textarea or
// something without being fussy about the underlying OT implementation.
//
// The API is desigend as a set of functions to be mixed in to some context
// object as part of its lifecycle. It expects that object to have getSnapshot
// and submitOp methods, and call _onOp when an operation is received.
//
// This API defines:
//
// - getLength() returns the length of the document in characters
// - getText() returns a string of the document
// - insert(pos, text, [callback]) inserts text at position pos in the document
// - remove(pos, length, [callback]) removes length characters at position pos
//
// A user can define:
// - onInsert(pos, text): Called when text is inserted.
// - onRemove(pos, length): Called when text is removed.

module.exports = api;
function api(getSnapshot, submitOp) {
  return {
    // Returns the text content of the document
    get: getSnapshot,

    // Returns the number of characters in the string
    getLength() { return getSnapshot().length },

    // Insert the specified text at the given position in the document
    insert(pos, text, callback) {
      return submitOp([pos, text], callback)
    },

    remove(pos, length, callback) {
      return submitOp([pos, {d:length}], callback)
    },

    // When you use this API, you should implement these two methods
    // in your editing context.
    //onInsert: function(pos, text) {},
    //onRemove: function(pos, removedLength) {},

    _onOp(op) {
      var pos = 0
      var spos = 0
      for (var i = 0; i < op.length; i++) {
        var component = op[i]
        switch (typeof component) {
          case 'number':
            pos += component
            spos += component
            break
          case 'string':
            if (this.onInsert) this.onInsert(pos, component)
            pos += component.length
            break
          case 'object':
            if (this.onRemove) this.onRemove(pos, component.d)
            spos += component.d
        }
      }
    }
  }
}
api.provides = {text: true}

},{}],10:[function(require,module,exports){
var type = require('./text');
type.api = require('./api');

module.exports = {
  type: type
};

},{"./api":9,"./text":11}],11:[function(require,module,exports){
/* Text OT!
 *
 * This is an OT implementation for text. It is the standard implementation of
 * text used by ShareJS.
 *
 * This type is composable but non-invertable. Its similar to ShareJS's old
 * text-composable type, but its not invertable and its very similar to the
 * text-tp2 implementation but it doesn't support tombstones or purging.
 *
 * Ops are lists of components which iterate over the document.
 * Components are either:
 *   A number N: Skip N characters in the original document
 *   "str"     : Insert "str" at the current position in the document
 *   {d:N}     : Delete N characters at the current position in the document
 *
 * Eg: [3, 'hi', 5, {d:8}]
 *
 * The operation does not have to skip the last characters in the document.
 *
 * Snapshots are strings.
 *
 * Cursors are either a single number (which is the cursor position) or a pair of
 * [anchor, focus] (aka [start, end]). Be aware that end can be before start.
 */

/** @module text */

exports.name = 'text'
exports.uri = 'http://sharejs.org/types/textv1'

/** Create a new text snapshot.
 *
 * @param {string} initial - initial snapshot data. Optional. Defaults to ''.
 */
exports.create = (initial) => {
  if ((initial != null) && typeof initial !== 'string') {
    throw Error('Initial data must be a string')
  }
  return initial || ''
}

/** Check the operation is valid. Throws if not valid. */
const checkOp = function(op) {
  if (!Array.isArray(op)) throw Error('Op must be an array of components');

  let last = null
  for (let i = 0; i < op.length; i++) {
    const c = op[i]
    switch (typeof c) {
      case 'object':
        // The only valid objects are {d:X} for +ive values of X.
        if (!(typeof c.d === 'number' && c.d > 0)) throw Error('Object components must be deletes of size > 0')
        break
      case 'string':
        // Strings are inserts.
        if (!(c.length > 0)) throw Error('Inserts cannot be empty')
        break
      case 'number':
        // Numbers must be skips. They have to be +ive numbers.
        if (!(c > 0)) throw Error('Skip components must be >0')
        if (typeof last === 'number') throw Error('Adjacent skip components should be combined')
        break
    }
    last = c
  }

  if (typeof last === 'number') throw Error('Op has a trailing skip')
}

/** Check that the given selection range is valid. */
const checkSelection = selection => {
  // This may throw from simply inspecting selection[0] / selection[1]. Thats
  // sort of ok, though it'll generate the wrong message.
  if (typeof selection !== 'number'
      && (typeof selection[0] !== 'number' || typeof selection[1] !== 'number')) {
    throw Error('Invalid selection')
  }
}

/** Make a function that appends to the given operation. */
const makeAppend = op => component => {
  if (!component || component.d === 0) {
    // The component is a no-op. Ignore!

  } else if (op.length === 0) {
    op.push(component)

  } else if (typeof component === typeof op[op.length - 1]) {
    if (typeof component === 'object') {
      op[op.length - 1].d += component.d
    } else {
      op[op.length - 1] += component
    }
  } else {
    op.push(component)
  }
}

/** Makes and returns utility functions take and peek. */
const makeTake = function(op) {
  // The index of the next component to take
  let idx = 0
  // The offset into the component
  let offset = 0

  // Take up to length n from the front of op. If n is -1, take the entire next
  // op component. If indivisableField == 'd', delete components won't be separated.
  // If indivisableField == 'i', insert components won't be separated.
  const take = (n, indivisableField) => {
    // We're at the end of the operation. The op has skips, forever. Infinity
    // might make more sense than null here.
    if (idx === op.length)
      return n === -1 ? null : n

    const c = op[idx]
    let part
    if (typeof c === 'number') {
      // Skip
      if (n === -1 || c - offset <= n) {
        part = c - offset
        ++idx
        offset = 0
        return part
      } else {
        offset += n
        return n
      }
    } else if (typeof c === 'string') {
      // Insert
      if (n === -1 || indivisableField === 'i' || c.length - offset <= n) {
        part = c.slice(offset)
        ++idx
        offset = 0
        return part
      } else {
        part = c.slice(offset, offset + n)
        offset += n
        return part
      }
    } else {
      // Delete
      if (n === -1 || indivisableField === 'd' || c.d - offset <= n) {
        part = {d: c.d - offset}
        ++idx
        offset = 0
        return part
      } else {
        offset += n
        return {d: n}
      }
    }
  }

  // Peek at the next op that will be returned.
  const peekType = () => op[idx]

  return [take, peekType]
}

/** Get the length of a component */
const componentLength = c => typeof c === 'number' ? c : (c.length || c.d)

/** Trim any excess skips from the end of an operation.
 *
 * There should only be at most one, because the operation was made with append.
 */
const trim = op => {
  if (op.length > 0 && typeof op[op.length - 1] === 'number') {
    op.pop()
  }
  return op
}

exports.normalize = function(op) {
  const newOp = []
  const append = makeAppend(newOp)
  for (let i = 0; i < op.length; i++) append(op[i])
  return trim(newOp)
}

/** Apply an operation to a document snapshot */
exports.apply = function(str, op) {
  if (typeof str !== 'string') {
    throw Error('Snapshot should be a string')
  }
  checkOp(op)

  // We'll gather the new document here and join at the end.
  const newDoc = []

  for (let i = 0; i < op.length; i++) {
    const component = op[i]
    switch (typeof component) {
      case 'number':
        if (component > str.length) throw Error('The op is too long for this document')

        newDoc.push(str.slice(0, component))
        // This might be slow for big strings. Consider storing the offset in
        // str instead of rewriting it each time.
        str = str.slice(component)
        break
      case 'string':
        newDoc.push(component)
        break
      case 'object':
        str = str.slice(component.d)
        break
    }
  }

  return newDoc.join('') + str
}

/** Transform op by otherOp.
 *
 * @param op - The operation to transform
 * @param otherOp - Operation to transform it by
 * @param side - Either 'left' or 'right'
 */
exports.transform = function(op, otherOp, side) {
  if (side !== 'left' && side !== 'right') {
    throw Error("side (" + side + ") must be 'left' or 'right'")
  }

  checkOp(op)
  checkOp(otherOp)

  const newOp = []

  const append = makeAppend(newOp)
  const [take, peek] = makeTake(op)

  for (let i = 0; i < otherOp.length; i++) {
    const component = otherOp[i]

    let length, chunk
    switch (typeof component) {
      case 'number': // Skip
        length = component
        while (length > 0) {
          chunk = take(length, 'i')
          append(chunk)
          if (typeof chunk !== 'string') {
            length -= componentLength(chunk)
          }
        }
        break

      case 'string': // Insert
        if (side === 'left') {
          // The left insert should go first.
          if (typeof peek() === 'string') {
            append(take(-1))
          }
        }

        // Otherwise skip the inserted text.
        append(component.length)
        break

      case 'object': // Delete
        length = component.d
        while (length > 0) {
          chunk = take(length, 'i')
          switch (typeof chunk) {
            case 'number':
              length -= chunk
              break
            case 'string':
              append(chunk)
              break
            case 'object':
              // The delete is unnecessary now - the text has already been deleted.
              length -= chunk.d
          }
        }
        break
    }
  }

  // Append any extra data in op1.
  let c
  while ((c = take(-1))) append(c)

  return trim(newOp)
}

/** Compose op1 and op2 together and return the result */
exports.compose = function(op1, op2) {
  checkOp(op1)
  checkOp(op2)

  const result = []
  const append = makeAppend(result)
  const take = makeTake(op1)[0]

  for (let i = 0; i < op2.length; i++) {
    const component = op2[i]
    let length, chunk
    switch (typeof component) {
      case 'number': // Skip
        length = component
        while (length > 0) {
          chunk = take(length, 'd')
          append(chunk)
          if (typeof chunk !== 'object') {
            length -= componentLength(chunk)
          }
        }
        break

      case 'string': // Insert
        append(component)
        break

      case 'object': // Delete
        length = component.d

        while (length > 0) {
          chunk = take(length, 'd')

          switch (typeof chunk) {
            case 'number':
              append({d: chunk})
              length -= chunk
              break
            case 'string':
              length -= chunk.length
              break
            case 'object':
              append(chunk)
          }
        }
        break
    }
  }

  let c
  while ((c = take(-1))) append(c)

  return trim(result)
}


const transformPosition = (cursor, op) => {
  let pos = 0
  for (let i = 0; i < op.length; i++) {
    const c = op[i]
    if (cursor <= pos) break

    // I could actually use the op_iter stuff above - but I think its simpler
    // like this.
    switch (typeof c) {
      case 'number':
        if (cursor <= pos + c) return cursor
        pos += c
        break

      case 'string':
        pos += c.length
        cursor += c.length
        break

      case 'object':
        cursor -= Math.min(c.d, cursor - pos)
        break
    }
  }
  return cursor
}

exports.transformSelection = function(selection, op, isOwnOp) {
  let pos = 0
  if (isOwnOp) {
    // Just track the position. We'll teleport the cursor to the end anyway.
    // This works because text ops don't have any trailing skips at the end - so the last
    // component is the last thing.
    for (let i = 0; i < op.length; i++) {
      const c = op[i]
      switch (typeof c) {
        case 'number':
          pos += c
          break
        case 'string':
          pos += c.length
          break
        // Just eat deletes.
      }
    }
    return pos
  } else {
    return typeof selection === 'number'
      ? transformPosition(selection, op)
      : [transformPosition(selection[0], op), transformPosition(selection[1], op)]
  }
}

exports.selectionEq = function(c1, c2) {
  if (c1[0] != null && c1[0] === c1[1]) c1 = c1[0]
  if (c2[0] != null && c2[0] === c2[1]) c2 = c2[0]
  return c1 === c2 || (c1[0] != null && c2[0] != null && c1[0] === c2[0] && c1[1] == c2[1])
}

// Calculate the cursor position after the given operation
exports.applyToCursor = function (op) {
  var pos = 0;
  for (var i = 0; i < op.length; i++) {
      var c = op[i];
      switch (typeof c) {
          case 'number':
              pos += c;
              break;
          case 'string':
              pos += c.length;
              break;
          case 'object':
              //pos -= c.d;
              break;
      }
  }
  return pos;
};

// Generate an operation that semantically inverts the given operation
// when applied to the provided snapshot.
// It needs a snapshot of the document before the operation
// was applied to invert delete operations.
exports.semanticInvert = function (str, op) {
  if (typeof str !== 'string') {
      throw Error('Snapshot should be a string');
  }
  checkOp(op);

  // Save copy
  var originalOp = op.slice();

  // Shallow copy
  op = op.slice();

  var len = op.length;
  var cursor, prevOps, tmpStr;
  for (var i = 0; i < len; i++) {
      var c = op[i];
      switch (typeof c) {
          case 'number':
              // In case we have cursor movement we do nothing
              break;
          case 'string':
              // In case we have string insertion we generate a string deletion
              op[i] = {d: c.length};
              break;
          case 'object':
              // In case of a deletion we need to reinsert the deleted string
              prevOps = originalOp.slice(0, i);
              cursor = this.applyToCursor(prevOps);
              tmpStr = this.apply(str, trim(prevOps));
              op[i] = tmpStr.substring(cursor, cursor + c.d);
              break;
      }
  }

  return this.normalize(op);
};

},{}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
var Doc = require('./doc');
var Query = require('./query');
var Presence = require('./presence/presence');
var DocPresence = require('./presence/doc-presence');
var SnapshotVersionRequest = require('./snapshot-request/snapshot-version-request');
var SnapshotTimestampRequest = require('./snapshot-request/snapshot-timestamp-request');
var emitter = require('../emitter');
var ShareDBError = require('../error');
var types = require('../types');
var util = require('../util');
var logger = require('../logger');

var ERROR_CODE = ShareDBError.CODES;

function connectionState(socket) {
  if (socket.readyState === 0 || socket.readyState === 1) return 'connecting';
  return 'disconnected';
}

/**
 * Handles communication with the sharejs server and provides queries and
 * documents.
 *
 * We create a connection with a socket object
 *   connection = new sharejs.Connection(sockset)
 * The socket may be any object handling the websocket protocol. See the
 * documentation of bindToSocket() for details. We then wait for the connection
 * to connect
 *   connection.on('connected', ...)
 * and are finally able to work with shared documents
 *   connection.get('food', 'steak') // Doc
 *
 * @param socket @see bindToSocket
 */
module.exports = Connection;
function Connection(socket) {
  emitter.EventEmitter.call(this);

  // Map of collection -> id -> doc object for created documents.
  // (created documents MUST BE UNIQUE)
  this.collections = {};

  // Each query and snapshot request is created with an id that the server uses when it sends us
  // info about the request (updates, etc)
  this.nextQueryId = 1;
  this.nextSnapshotRequestId = 1;

  // Map from query ID -> query object.
  this.queries = {};

  // Maps from channel -> presence objects
  this._presences = {};

  // Map from snapshot request ID -> snapshot request
  this._snapshotRequests = {};

  // A unique message number for the given id
  this.seq = 1;

  // A unique message number for presence
  this._presenceSeq = 1;

  // Equals agent.src on the server
  this.id = null;

  // This direct reference from connection to agent is not used internal to
  // ShareDB, but it is handy for server-side only user code that may cache
  // state on the agent and read it in middleware
  this.agent = null;

  this.debug = false;

  this.state = connectionState(socket);

  this.bindToSocket(socket);
}
emitter.mixin(Connection);


/**
 * Use socket to communicate with server
 *
 * Socket is an object that can handle the websocket protocol. This method
 * installs the onopen, onclose, onmessage and onerror handlers on the socket to
 * handle communication and sends messages by calling socket.send(message). The
 * sockets `readyState` property is used to determine the initaial state.
 *
 * @param socket Handles the websocket protocol
 * @param socket.readyState
 * @param socket.close
 * @param socket.send
 * @param socket.onopen
 * @param socket.onclose
 * @param socket.onmessage
 * @param socket.onerror
 */
Connection.prototype.bindToSocket = function(socket) {
  if (this.socket) {
    this.socket.close();
    this.socket.onmessage = null;
    this.socket.onopen = null;
    this.socket.onerror = null;
    this.socket.onclose = null;
  }

  this.socket = socket;

  // State of the connection. The corresponding events are emitted when this changes
  //
  // - 'connecting'   The connection is still being established, or we are still
  //                    waiting on the server to send us the initialization message
  // - 'connected'    The connection is open and we have connected to a server
  //                    and recieved the initialization message
  // - 'disconnected' Connection is closed, but it will reconnect automatically
  // - 'closed'       The connection was closed by the client, and will not reconnect
  // - 'stopped'      The connection was closed by the server, and will not reconnect
  var newState = connectionState(socket);
  this._setState(newState);

  // This is a helper variable the document uses to see whether we're
  // currently in a 'live' state. It is true if and only if we're connected
  this.canSend = false;

  var connection = this;

  socket.onmessage = function(event) {
    try {
      var data = (typeof event.data === 'string') ?
        JSON.parse(event.data) : event.data;
    } catch (err) {
      logger.warn('Failed to parse message', event);
      return;
    }

    if (connection.debug) logger.info('RECV', JSON.stringify(data));

    var request = {data: data};
    connection.emit('receive', request);
    if (!request.data) return;

    try {
      connection.handleMessage(request.data);
    } catch (err) {
      util.nextTick(function() {
        connection.emit('error', err);
      });
    }
  };

  // If socket is already open, do handshake immediately.
  if (socket.readyState === 1) {
    connection._initializeHandshake();
  }
  socket.onopen = function() {
    connection._setState('connecting');
    connection._initializeHandshake();
  };

  socket.onerror = function(err) {
    // This isn't the same as a regular error, because it will happen normally
    // from time to time. Your connection should probably automatically
    // reconnect anyway, but that should be triggered off onclose not onerror.
    // (onclose happens when onerror gets called anyway).
    connection.emit('connection error', err);
  };

  socket.onclose = function(reason) {
    // node-browserchannel reason values:
    //   'Closed' - The socket was manually closed by calling socket.close()
    //   'Stopped by server' - The server sent the stop message to tell the client not to try connecting
    //   'Request failed' - Server didn't respond to request (temporary, usually offline)
    //   'Unknown session ID' - Server session for client is missing (temporary, will immediately reestablish)

    if (reason === 'closed' || reason === 'Closed') {
      connection._setState('closed', reason);
    } else if (reason === 'stopped' || reason === 'Stopped by server') {
      connection._setState('stopped', reason);
    } else {
      connection._setState('disconnected', reason);
    }
  };
};

/**
 * @param {object} message
 * @param {string} message.a action
 */
Connection.prototype.handleMessage = function(message) {
  var err = null;
  if (message.error) {
    err = wrapErrorData(message.error, message);
    delete message.error;
  }
  // Switch on the message action. Most messages are for documents and are
  // handled in the doc class.
  switch (message.a) {
    case 'init':
      // Client initialization packet
      return this._handleLegacyInit(message);
    case 'hs':
      return this._handleHandshake(err, message);
    case 'qf':
      var query = this.queries[message.id];
      if (query) query._handleFetch(err, message.data, message.extra);
      return;
    case 'qs':
      var query = this.queries[message.id];
      if (query) query._handleSubscribe(err, message.data, message.extra);
      return;
    case 'qu':
      // Queries are removed immediately on calls to destroy, so we ignore
      // replies to query unsubscribes. Perhaps there should be a callback for
      // destroy, but this is currently unimplemented
      return;
    case 'q':
      // Query message. Pass this to the appropriate query object.
      var query = this.queries[message.id];
      if (!query) return;
      if (err) return query._handleError(err);
      if (message.diff) query._handleDiff(message.diff);
      if (message.hasOwnProperty('extra')) query._handleExtra(message.extra);
      return;

    case 'bf':
      return this._handleBulkMessage(err, message, '_handleFetch');
    case 'bs':
    case 'bu':
      return this._handleBulkMessage(err, message, '_handleSubscribe');

    case 'nf':
    case 'nt':
      return this._handleSnapshotFetch(err, message);

    case 'f':
      var doc = this.getExisting(message.c, message.d);
      if (doc) doc._handleFetch(err, message.data);
      return;
    case 's':
    case 'u':
      var doc = this.getExisting(message.c, message.d);
      if (doc) doc._handleSubscribe(err, message.data);
      return;
    case 'op':
      var doc = this.getExisting(message.c, message.d);
      if (doc) doc._handleOp(err, message);
      return;
    case 'p':
      return this._handlePresence(err, message);
    case 'ps':
      return this._handlePresenceSubscribe(err, message);
    case 'pu':
      return this._handlePresenceUnsubscribe(err, message);
    case 'pr':
      return this._handlePresenceRequest(err, message);

    default:
      logger.warn('Ignoring unrecognized message', message);
  }
};

function wrapErrorData(errorData, fullMessage) {
  // wrap in Error object so can be passed through event emitters
  var err = new Error(errorData.message);
  err.code = errorData.code;
  if (fullMessage) {
    // Add the message data to the error object for more context
    err.data = fullMessage;
  }
  return err;
}

Connection.prototype._handleBulkMessage = function(err, message, method) {
  if (message.data) {
    for (var id in message.data) {
      var dataForId = message.data[id];
      var doc = this.getExisting(message.c, id);
      if (doc) {
        if (err) {
          doc[method](err);
        } else if (dataForId.error) {
          // Bulk reply snapshot-specific errorr - see agent.js getMapResult
          doc[method](wrapErrorData(dataForId.error));
        } else {
          doc[method](null, dataForId);
        }
      }
    }
  } else if (Array.isArray(message.b)) {
    for (var i = 0; i < message.b.length; i++) {
      var id = message.b[i];
      var doc = this.getExisting(message.c, id);
      if (doc) doc[method](err);
    }
  } else if (message.b) {
    for (var id in message.b) {
      var doc = this.getExisting(message.c, id);
      if (doc) doc[method](err);
    }
  } else {
    logger.error('Invalid bulk message', message);
  }
};

Connection.prototype._reset = function() {
  this.agent = null;
};

// Set the connection's state. The connection is basically a state machine.
Connection.prototype._setState = function(newState, reason) {
  if (this.state === newState) return;

  // I made a state diagram. The only invalid transitions are getting to
  // 'connecting' from anywhere other than 'disconnected' and getting to
  // 'connected' from anywhere other than 'connecting'.
  if (
    (
      newState === 'connecting' &&
      this.state !== 'disconnected' &&
      this.state !== 'stopped' &&
      this.state !== 'closed'
    ) || (
      newState === 'connected' &&
      this.state !== 'connecting'
    )
  ) {
    var err = new ShareDBError(
      ERROR_CODE.ERR_CONNECTION_STATE_TRANSITION_INVALID,
      'Cannot transition directly from ' + this.state + ' to ' + newState
    );
    return this.emit('error', err);
  }

  this.state = newState;
  this.canSend = (newState === 'connected');

  if (
    newState === 'disconnected' ||
    newState === 'stopped' ||
    newState === 'closed'
  ) {
    this._reset();
  }

  // Group subscribes together to help server make more efficient calls
  this.startBulk();
  // Emit the event to all queries
  for (var id in this.queries) {
    var query = this.queries[id];
    query._onConnectionStateChanged();
  }
  // Emit the event to all documents
  for (var collection in this.collections) {
    var docs = this.collections[collection];
    for (var id in docs) {
      docs[id]._onConnectionStateChanged();
    }
  }
  // Emit the event to all Presences
  for (var channel in this._presences) {
    this._presences[channel]._onConnectionStateChanged();
  }
  // Emit the event to all snapshots
  for (var id in this._snapshotRequests) {
    var snapshotRequest = this._snapshotRequests[id];
    snapshotRequest._onConnectionStateChanged();
  }
  this.endBulk();

  this.emit(newState, reason);
  this.emit('state', newState, reason);
};

Connection.prototype.startBulk = function() {
  if (!this.bulk) this.bulk = {};
};

Connection.prototype.endBulk = function() {
  if (this.bulk) {
    for (var collection in this.bulk) {
      var actions = this.bulk[collection];
      this._sendBulk('f', collection, actions.f);
      this._sendBulk('s', collection, actions.s);
      this._sendBulk('u', collection, actions.u);
    }
  }
  this.bulk = null;
};

Connection.prototype._sendBulk = function(action, collection, values) {
  if (!values) return;
  var ids = [];
  var versions = {};
  var versionsCount = 0;
  var versionId;
  for (var id in values) {
    var value = values[id];
    if (value == null) {
      ids.push(id);
    } else {
      versions[id] = value;
      versionId = id;
      versionsCount++;
    }
  }
  if (ids.length === 1) {
    var id = ids[0];
    this.send({a: action, c: collection, d: id});
  } else if (ids.length) {
    this.send({a: 'b' + action, c: collection, b: ids});
  }
  if (versionsCount === 1) {
    var version = versions[versionId];
    this.send({a: action, c: collection, d: versionId, v: version});
  } else if (versionsCount) {
    this.send({a: 'b' + action, c: collection, b: versions});
  }
};

Connection.prototype._sendAction = function(action, doc, version) {
  // Ensure the doc is registered so that it receives the reply message
  this._addDoc(doc);
  if (this.bulk) {
    // Bulk subscribe
    var actions = this.bulk[doc.collection] || (this.bulk[doc.collection] = {});
    var versions = actions[action] || (actions[action] = {});
    var isDuplicate = versions.hasOwnProperty(doc.id);
    versions[doc.id] = version;
    return isDuplicate;
  } else {
    // Send single doc subscribe message
    var message = {a: action, c: doc.collection, d: doc.id, v: version};
    this.send(message);
  }
};

Connection.prototype.sendFetch = function(doc) {
  return this._sendAction('f', doc, doc.version);
};

Connection.prototype.sendSubscribe = function(doc) {
  return this._sendAction('s', doc, doc.version);
};

Connection.prototype.sendUnsubscribe = function(doc) {
  return this._sendAction('u', doc);
};

Connection.prototype.sendOp = function(doc, op) {
  // Ensure the doc is registered so that it receives the reply message
  this._addDoc(doc);
  var message = {
    a: 'op',
    c: doc.collection,
    d: doc.id,
    v: doc.version,
    src: op.src,
    seq: op.seq,
    x: {}
  };
  if ('op' in op) message.op = op.op;
  if (op.create) message.create = op.create;
  if (op.del) message.del = op.del;
  if (doc.submitSource) message.x.source = op.source;
  this.send(message);
};


/**
 * Sends a message down the socket
 */
Connection.prototype.send = function(message) {
  if (this.debug) logger.info('SEND', JSON.stringify(message));

  this.emit('send', message);
  this.socket.send(JSON.stringify(message));
};


/**
 * Closes the socket and emits 'closed'
 */
Connection.prototype.close = function() {
  this.socket.close();
};

Connection.prototype.getExisting = function(collection, id) {
  if (this.collections[collection]) return this.collections[collection][id];
};


/**
 * Get or create a document.
 *
 * @param collection
 * @param id
 * @return {Doc}
 */
Connection.prototype.get = function(collection, id) {
  var docs = this.collections[collection] ||
    (this.collections[collection] = {});

  var doc = docs[id];
  if (!doc) {
    doc = docs[id] = new Doc(this, collection, id);
    this.emit('doc', doc);
  }

  return doc;
};


/**
 * Remove document from this.collections
 *
 * @private
 */
Connection.prototype._destroyDoc = function(doc) {
  util.digAndRemove(this.collections, doc.collection, doc.id);
};

Connection.prototype._addDoc = function(doc) {
  var docs = this.collections[doc.collection];
  if (!docs) {
    docs = this.collections[doc.collection] = {};
  }
  if (docs[doc.id] !== doc) {
    docs[doc.id] = doc;
  }
};

// Helper for createFetchQuery and createSubscribeQuery, below.
Connection.prototype._createQuery = function(action, collection, q, options, callback) {
  var id = this.nextQueryId++;
  var query = new Query(action, this, id, collection, q, options, callback);
  this.queries[id] = query;
  query.send();
  return query;
};

// Internal function. Use query.destroy() to remove queries.
Connection.prototype._destroyQuery = function(query) {
  delete this.queries[query.id];
};

// The query options object can contain the following fields:
//
// db: Name of the db for the query. You can attach extraDbs to ShareDB and
//   pick which one the query should hit using this parameter.

// Create a fetch query. Fetch queries are only issued once, returning the
// results directly into the callback.
//
// The callback should have the signature function(error, results, extra)
// where results is a list of Doc objects.
Connection.prototype.createFetchQuery = function(collection, q, options, callback) {
  return this._createQuery('qf', collection, q, options, callback);
};

// Create a subscribe query. Subscribe queries return with the initial data
// through the callback, then update themselves whenever the query result set
// changes via their own event emitter.
//
// If present, the callback should have the signature function(error, results, extra)
// where results is a list of Doc objects.
Connection.prototype.createSubscribeQuery = function(collection, q, options, callback) {
  return this._createQuery('qs', collection, q, options, callback);
};

Connection.prototype.hasPending = function() {
  return !!(
    this._firstDoc(hasPending) ||
    this._firstQuery(hasPending) ||
    this._firstSnapshotRequest()
  );
};
function hasPending(object) {
  return object.hasPending();
}

Connection.prototype.hasWritePending = function() {
  return !!this._firstDoc(hasWritePending);
};
function hasWritePending(object) {
  return object.hasWritePending();
}

Connection.prototype.whenNothingPending = function(callback) {
  var doc = this._firstDoc(hasPending);
  if (doc) {
    // If a document is found with a pending operation, wait for it to emit
    // that nothing is pending anymore, and then recheck all documents again.
    // We have to recheck all documents, just in case another mutation has
    // been made in the meantime as a result of an event callback
    doc.once('nothing pending', this._nothingPendingRetry(callback));
    return;
  }
  var query = this._firstQuery(hasPending);
  if (query) {
    query.once('ready', this._nothingPendingRetry(callback));
    return;
  }
  var snapshotRequest = this._firstSnapshotRequest();
  if (snapshotRequest) {
    snapshotRequest.once('ready', this._nothingPendingRetry(callback));
    return;
  }
  // Call back when no pending operations
  util.nextTick(callback);
};
Connection.prototype._nothingPendingRetry = function(callback) {
  var connection = this;
  return function() {
    util.nextTick(function() {
      connection.whenNothingPending(callback);
    });
  };
};

Connection.prototype._firstDoc = function(fn) {
  for (var collection in this.collections) {
    var docs = this.collections[collection];
    for (var id in docs) {
      var doc = docs[id];
      if (fn(doc)) {
        return doc;
      }
    }
  }
};

Connection.prototype._firstQuery = function(fn) {
  for (var id in this.queries) {
    var query = this.queries[id];
    if (fn(query)) {
      return query;
    }
  }
};

Connection.prototype._firstSnapshotRequest = function() {
  for (var id in this._snapshotRequests) {
    return this._snapshotRequests[id];
  }
};

/**
 * Fetch a read-only snapshot at a given version
 *
 * @param collection - the collection name of the snapshot
 * @param id - the ID of the snapshot
 * @param version (optional) - the version number to fetch. If null, the latest version is fetched.
 * @param callback - (error, snapshot) => void, where snapshot takes the following schema:
 *
 * {
 *   id: string;         // ID of the snapshot
 *   v: number;          // version number of the snapshot
 *   type: string;       // the OT type of the snapshot, or null if it doesn't exist or is deleted
 *   data: any;          // the snapshot
 * }
 *
 */
Connection.prototype.fetchSnapshot = function(collection, id, version, callback) {
  if (typeof version === 'function') {
    callback = version;
    version = null;
  }

  var requestId = this.nextSnapshotRequestId++;
  var snapshotRequest = new SnapshotVersionRequest(this, requestId, collection, id, version, callback);
  this._snapshotRequests[snapshotRequest.requestId] = snapshotRequest;
  snapshotRequest.send();
};

/**
 * Fetch a read-only snapshot at a given timestamp
 *
 * @param collection - the collection name of the snapshot
 * @param id - the ID of the snapshot
 * @param timestamp (optional) - the timestamp to fetch. If null, the latest version is fetched.
 * @param callback - (error, snapshot) => void, where snapshot takes the following schema:
 *
 * {
 *   id: string;         // ID of the snapshot
 *   v: number;          // version number of the snapshot
 *   type: string;       // the OT type of the snapshot, or null if it doesn't exist or is deleted
 *   data: any;          // the snapshot
 * }
 *
 */
Connection.prototype.fetchSnapshotByTimestamp = function(collection, id, timestamp, callback) {
  if (typeof timestamp === 'function') {
    callback = timestamp;
    timestamp = null;
  }

  var requestId = this.nextSnapshotRequestId++;
  var snapshotRequest = new SnapshotTimestampRequest(this, requestId, collection, id, timestamp, callback);
  this._snapshotRequests[snapshotRequest.requestId] = snapshotRequest;
  snapshotRequest.send();
};

Connection.prototype._handleSnapshotFetch = function(error, message) {
  var snapshotRequest = this._snapshotRequests[message.id];
  if (!snapshotRequest) return;
  delete this._snapshotRequests[message.id];
  snapshotRequest._handleResponse(error, message);
};

Connection.prototype._handleLegacyInit = function(message) {
  // If the minor protocol version has been set, we want to use the
  // new handshake protocol. Let's send a handshake initialize, because
  // we now know the server is ready. If we've already sent it, we'll
  // just ignore the response anyway.
  if (message.protocolMinor) return this._initializeHandshake();
  this._initialize(message);
};

Connection.prototype._initializeHandshake = function() {
  this.send({a: 'hs', id: this.id});
};

Connection.prototype._handleHandshake = function(error, message) {
  if (error) return this.emit('error', error);
  this._initialize(message);
};

Connection.prototype._initialize = function(message) {
  if (this.state !== 'connecting') return;

  if (message.protocol !== 1) {
    return this.emit('error', new ShareDBError(
      ERROR_CODE.ERR_PROTOCOL_VERSION_NOT_SUPPORTED,
      'Unsupported protocol version: ' + message.protocol
    ));
  }
  if (types.map[message.type] !== types.defaultType) {
    return this.emit('error', new ShareDBError(
      ERROR_CODE.ERR_DEFAULT_TYPE_MISMATCH,
      message.type + ' does not match the server default type'
    ));
  }
  if (typeof message.id !== 'string') {
    return this.emit('error', new ShareDBError(
      ERROR_CODE.ERR_CLIENT_ID_BADLY_FORMED,
      'Client id must be a string'
    ));
  }
  this.id = message.id;

  this._setState('connected');
};

Connection.prototype.getPresence = function(channel) {
  var connection = this;
  return util.digOrCreate(this._presences, channel, function() {
    return new Presence(connection, channel);
  });
};

Connection.prototype.getDocPresence = function(collection, id) {
  var channel = DocPresence.channel(collection, id);
  var connection = this;
  return util.digOrCreate(this._presences, channel, function() {
    return new DocPresence(connection, collection, id);
  });
};

Connection.prototype._sendPresenceAction = function(action, seq, presence) {
  // Ensure the presence is registered so that it receives the reply message
  this._addPresence(presence);
  var message = {a: action, ch: presence.channel, seq: seq};
  this.send(message);
  return message.seq;
};

Connection.prototype._addPresence = function(presence) {
  util.digOrCreate(this._presences, presence.channel, function() {
    return presence;
  });
};

Connection.prototype._handlePresenceSubscribe = function(error, message) {
  var presence = util.dig(this._presences, message.ch);
  if (presence) presence._handleSubscribe(error, message.seq);
};

Connection.prototype._handlePresenceUnsubscribe = function(error, message) {
  var presence = util.dig(this._presences, message.ch);
  if (presence) presence._handleUnsubscribe(error, message.seq);
};

Connection.prototype._handlePresence = function(error, message) {
  var presence = util.dig(this._presences, message.ch);
  if (presence) presence._receiveUpdate(error, message);
};

Connection.prototype._handlePresenceRequest = function(error, message) {
  var presence = util.dig(this._presences, message.ch);
  if (presence) presence._broadcastAllLocalPresence(error, message);
};

},{"../emitter":26,"../error":27,"../logger":28,"../types":32,"../util":33,"./doc":14,"./presence/doc-presence":16,"./presence/presence":19,"./query":22,"./snapshot-request/snapshot-timestamp-request":24,"./snapshot-request/snapshot-version-request":25}],14:[function(require,module,exports){
var emitter = require('../emitter');
var logger = require('../logger');
var ShareDBError = require('../error');
var types = require('../types');
var util = require('../util');
var deepEqual = require('fast-deep-equal');

var ERROR_CODE = ShareDBError.CODES;

/**
 * A Doc is a client's view on a sharejs document.
 *
 * It is is uniquely identified by its `id` and `collection`.  Documents
 * should not be created directly. Create them with connection.get()
 *
 *
 * Subscriptions
 * -------------
 *
 * We can subscribe a document to stay in sync with the server.
 *   doc.subscribe(function(error) {
 *     doc.subscribed // = true
 *   })
 * The server now sends us all changes concerning this document and these are
 * applied to our data. If the subscription was successful the initial
 * data and version sent by the server are loaded into the document.
 *
 * To stop listening to the changes we call `doc.unsubscribe()`.
 *
 * If we just want to load the data but not stay up-to-date, we call
 *   doc.fetch(function(error) {
 *     doc.data // sent by server
 *   })
 *
 *
 * Events
 * ------
 *
 * You can use doc.on(eventName, callback) to subscribe to the following events:
 * - `before op (op, source)` Fired before a partial operation is applied to the data.
 *   It may be used to read the old data just before applying an operation
 * - `op (op, source)` Fired after every partial operation with this operation as the
 *   first argument
 * - `create (source)` The document was created. That means its type was
 *   set and it has some initial data.
 * - `del (data, source)` Fired after the document is deleted, that is
 *   the data is null. It is passed the data before deletion as an
 *   argument
 * - `load ()` Fired when a new snapshot is ingested from a fetch, subscribe, or query
 */

module.exports = Doc;
function Doc(connection, collection, id) {
  emitter.EventEmitter.call(this);

  this.connection = connection;

  this.collection = collection;
  this.id = id;

  this.version = null;
  this.type = null;
  this.data = undefined;

  // Array of callbacks or nulls as placeholders
  this.inflightFetch = [];
  this.inflightSubscribe = null;
  this.pendingFetch = [];
  this.pendingSubscribe = [];

  // Whether we think we are subscribed on the server. Synchronously set to
  // false on calls to unsubscribe and disconnect. Should never be true when
  // this.wantSubscribe is false
  this.subscribed = false;
  // Whether to re-establish the subscription on reconnect
  this.wantSubscribe = false;

  // The op that is currently roundtripping to the server, or null.
  //
  // When the connection reconnects, the inflight op is resubmitted.
  //
  // This has the same format as an entry in pendingOps
  this.inflightOp = null;

  // All ops that are waiting for the server to acknowledge this.inflightOp
  // This used to just be a single operation, but creates & deletes can't be
  // composed with regular operations.
  //
  // This is a list of {[create:{...}], [del:true], [op:...], callbacks:[...]}
  this.pendingOps = [];

  // The OT type of this document. An uncreated document has type `null`
  this.type = null;

  // The applyStack enables us to track any ops submitted while we are
  // applying an op incrementally. This value is an array when we are
  // performing an incremental apply and null otherwise. When it is an array,
  // all submitted ops should be pushed onto it. The `_otApply` method will
  // reset it back to null when all incremental apply loops are complete.
  this.applyStack = null;

  // Disable the default behavior of composing submitted ops. This is read at
  // the time of op submit, so it may be toggled on before submitting a
  // specifc op and toggled off afterward
  this.preventCompose = false;

  // If set to true, the source will be submitted over the connection. This
  // will also have the side-effect of only composing ops whose sources are
  // equal
  this.submitSource = false;

  // Prevent own ops being submitted to the server. If subscribed, remote
  // ops are still received. Should be toggled through the pause() and
  // resume() methods to correctly flush on resume.
  this.paused = false;
}
emitter.mixin(Doc);

Doc.prototype.destroy = function(callback) {
  var doc = this;
  doc.whenNothingPending(function() {
    if (doc.wantSubscribe) {
      doc.unsubscribe(function(err) {
        if (err) {
          if (callback) return callback(err);
          return doc.emit('error', err);
        }
        doc.connection._destroyDoc(doc);
        doc.emit('destroy');
        if (callback) callback();
      });
    } else {
      doc.connection._destroyDoc(doc);
      doc.emit('destroy');
      if (callback) callback();
    }
  });
};


// ****** Manipulating the document data, version and type.

// Set the document's type, and associated properties. Most of the logic in
// this function exists to update the document based on any added & removed API
// methods.
//
// @param newType OT type provided by the ottypes library or its name or uri
Doc.prototype._setType = function(newType) {
  if (typeof newType === 'string') {
    newType = types.map[newType];
  }

  if (newType) {
    this.type = newType;
  } else if (newType === null) {
    this.type = newType;
    // If we removed the type from the object, also remove its data
    this.data = undefined;
  } else {
    var err = new ShareDBError(ERROR_CODE.ERR_DOC_TYPE_NOT_RECOGNIZED, 'Missing type ' + newType);
    return this.emit('error', err);
  }
};

// Ingest snapshot data. This data must include a version, snapshot and type.
// This is used both to ingest data that was exported with a webpage and data
// that was received from the server during a fetch.
//
// @param snapshot.v    version
// @param snapshot.data
// @param snapshot.type
// @param callback
Doc.prototype.ingestSnapshot = function(snapshot, callback) {
  if (!snapshot) return callback && callback();

  if (typeof snapshot.v !== 'number') {
    var err = new ShareDBError(
      ERROR_CODE.ERR_INGESTED_SNAPSHOT_HAS_NO_VERSION,
      'Missing version in ingested snapshot. ' + this.collection + '.' + this.id
    );
    if (callback) return callback(err);
    return this.emit('error', err);
  }

  // If the doc is already created or there are ops pending, we cannot use the
  // ingested snapshot and need ops in order to update the document
  if (this.type || this.hasWritePending()) {
    // The version should only be null on a created document when it was
    // created locally without fetching
    if (this.version == null) {
      if (this.hasWritePending()) {
        // If we have pending ops and we get a snapshot for a locally created
        // document, we have to wait for the pending ops to complete, because
        // we don't know what version to fetch ops from. It is possible that
        // the snapshot came from our local op, but it is also possible that
        // the doc was created remotely (which would conflict and be an error)
        return callback && this.once('no write pending', callback);
      }
      // Otherwise, we've encounted an error state
      var err = new ShareDBError(
        ERROR_CODE.ERR_DOC_MISSING_VERSION,
        'Cannot ingest snapshot in doc with null version. ' + this.collection + '.' + this.id
      );
      if (callback) return callback(err);
      return this.emit('error', err);
    }
    // If we got a snapshot for a version further along than the document is
    // currently, issue a fetch to get the latest ops and catch us up
    if (snapshot.v > this.version) return this.fetch(callback);
    return callback && callback();
  }

  // Ignore the snapshot if we are already at a newer version. Under no
  // circumstance should we ever set the current version backward
  if (this.version > snapshot.v) return callback && callback();

  this.version = snapshot.v;
  var type = (snapshot.type === undefined) ? types.defaultType : snapshot.type;
  this._setType(type);
  this.data = (this.type && this.type.deserialize) ?
    this.type.deserialize(snapshot.data) :
    snapshot.data;
  this.emit('load');
  callback && callback();
};

Doc.prototype.whenNothingPending = function(callback) {
  var doc = this;
  util.nextTick(function() {
    if (doc.hasPending()) {
      doc.once('nothing pending', callback);
      return;
    }
    callback();
  });
};

Doc.prototype.hasPending = function() {
  return !!(
    this.inflightOp ||
    this.pendingOps.length ||
    this.inflightFetch.length ||
    this.inflightSubscribe ||
    this.pendingFetch.length ||
    this.pendingSubscribe.length
  );
};

Doc.prototype.hasWritePending = function() {
  return !!(this.inflightOp || this.pendingOps.length);
};

Doc.prototype._emitNothingPending = function() {
  if (this.hasWritePending()) return;
  this.emit('no write pending');
  if (this.hasPending()) return;
  this.emit('nothing pending');
};

// **** Helpers for network messages

Doc.prototype._emitResponseError = function(err, callback) {
  if (err && err.code === ERROR_CODE.ERR_SNAPSHOT_READ_SILENT_REJECTION) {
    this.wantSubscribe = false;
    if (callback) {
      callback();
    }
    this._emitNothingPending();
    return;
  }
  if (callback) {
    callback(err);
    this._emitNothingPending();
    return;
  }
  this._emitNothingPending();
  this.emit('error', err);
};

Doc.prototype._handleFetch = function(error, snapshot) {
  var callbacks = this.pendingFetch;
  this.pendingFetch = [];
  var callback = this.inflightFetch.shift();
  if (callback) callbacks.push(callback);
  if (callbacks.length) {
    callback = function(error) {
      util.callEach(callbacks, error);
    };
  }
  if (error) return this._emitResponseError(error, callback);
  this.ingestSnapshot(snapshot, callback);
  this._emitNothingPending();
};

Doc.prototype._handleSubscribe = function(error, snapshot) {
  var request = this.inflightSubscribe;
  this.inflightSubscribe = null;
  var callbacks = this.pendingFetch;
  this.pendingFetch = [];
  if (request.callback) callbacks.push(request.callback);
  var callback;
  if (callbacks.length) {
    callback = function(error) {
      util.callEach(callbacks, error);
    };
  }
  if (error) return this._emitResponseError(error, callback);
  this.subscribed = request.wantSubscribe;
  if (this.subscribed) this.ingestSnapshot(snapshot, callback);
  else if (callback) callback();
  this._emitNothingPending();
  this._flushSubscribe();
};

Doc.prototype._handleOp = function(err, message) {
  if (err) {
    if (this.inflightOp) {
      // The server has rejected submission of the current operation. If we get
      // an "Op submit rejected" error, this was done intentionally
      // and we should roll back but not return an error to the user.
      if (err.code === ERROR_CODE.ERR_OP_SUBMIT_REJECTED) err = null;
      return this._rollback(err);
    }
    return this.emit('error', err);
  }

  if (this.inflightOp &&
      message.src === this.inflightOp.src &&
      message.seq === this.inflightOp.seq) {
    // The op has already been applied locally. Just update the version
    // and pending state appropriately
    this._opAcknowledged(message);
    return;
  }

  if (this.version == null || message.v > this.version) {
    // This will happen in normal operation if we become subscribed to a
    // new document via a query. It can also happen if we get an op for
    // a future version beyond the version we are expecting next. This
    // could happen if the server doesn't publish an op for whatever reason
    // or because of a race condition. In any case, we can send a fetch
    // command to catch back up.
    //
    // Fetch only sends a new fetch command if no fetches are inflight, which
    // will act as a natural debouncing so we don't send multiple fetch
    // requests for many ops received at once.
    this.fetch();
    return;
  }

  if (message.v < this.version) {
    // We can safely ignore the old (duplicate) operation.
    return;
  }

  if (this.inflightOp) {
    var transformErr = transformX(this.inflightOp, message);
    if (transformErr) return this._hardRollback(transformErr);
  }

  for (var i = 0; i < this.pendingOps.length; i++) {
    var transformErr = transformX(this.pendingOps[i], message);
    if (transformErr) return this._hardRollback(transformErr);
  }

  this.version++;
  try {
    this._otApply(message, false);
  } catch (error) {
    return this._hardRollback(error);
  }
};

// Called whenever (you guessed it!) the connection state changes. This will
// happen when we get disconnected & reconnect.
Doc.prototype._onConnectionStateChanged = function() {
  if (this.connection.canSend) {
    this.flush();
    this._resubscribe();
  } else {
    if (this.inflightOp) {
      this.pendingOps.unshift(this.inflightOp);
      this.inflightOp = null;
    }
    this.subscribed = false;
    if (this.inflightSubscribe) {
      if (this.inflightSubscribe.wantSubscribe) {
        this.pendingSubscribe.unshift(this.inflightSubscribe);
        this.inflightSubscribe = null;
      } else {
        this._handleSubscribe();
      }
    }
    if (this.inflightFetch.length) {
      this.pendingFetch = this.pendingFetch.concat(this.inflightFetch);
      this.inflightFetch.length = 0;
    }
  }
};

Doc.prototype._resubscribe = function() {
  if (!this.pendingSubscribe.length && this.wantSubscribe) {
    return this.subscribe();
  }
  var willFetch = this.pendingSubscribe.some(function(request) {
    return request.wantSubscribe;
  });
  if (!willFetch && this.pendingFetch.length) this.fetch();
  this._flushSubscribe();
};

// Request the current document snapshot or ops that bring us up to date
Doc.prototype.fetch = function(callback) {
  if (this.connection.canSend) {
    var isDuplicate = this.connection.sendFetch(this);
    pushActionCallback(this.inflightFetch, isDuplicate, callback);
    return;
  }
  this.pendingFetch.push(callback);
};

// Fetch the initial document and keep receiving updates
Doc.prototype.subscribe = function(callback) {
  var wantSubscribe = true;
  this._queueSubscribe(wantSubscribe, callback);
};

// Unsubscribe. The data will stay around in local memory, but we'll stop
// receiving updates
Doc.prototype.unsubscribe = function(callback) {
  var wantSubscribe = false;
  this._queueSubscribe(wantSubscribe, callback);
};

Doc.prototype._queueSubscribe = function(wantSubscribe, callback) {
  var lastRequest = this.pendingSubscribe[this.pendingSubscribe.length - 1] || this.inflightSubscribe;
  var isDuplicateRequest = lastRequest && lastRequest.wantSubscribe === wantSubscribe;
  if (isDuplicateRequest) {
    lastRequest.callback = combineCallbacks([lastRequest.callback, callback]);
    return;
  }
  this.pendingSubscribe.push({
    wantSubscribe: !!wantSubscribe,
    callback: callback
  });
  this._flushSubscribe();
};

Doc.prototype._flushSubscribe = function() {
  if (this.inflightSubscribe || !this.pendingSubscribe.length) return;

  if (this.connection.canSend) {
    this.inflightSubscribe = this.pendingSubscribe.shift();
    this.wantSubscribe = this.inflightSubscribe.wantSubscribe;
    if (this.wantSubscribe) {
      this.connection.sendSubscribe(this);
    } else {
      // Be conservative about our subscription state. We'll be unsubscribed
      // some time between sending this request, and receiving the callback,
      // so let's just set ourselves to unsubscribed now.
      this.subscribed = false;
      this.connection.sendUnsubscribe(this);
    }

    return;
  }

  // If we're offline, then we're already unsubscribed. Therefore, call back
  // the next request immediately if it's an unsubscribe request.
  if (!this.pendingSubscribe[0].wantSubscribe) {
    this.inflightSubscribe = this.pendingSubscribe.shift();
    var doc = this;
    util.nextTick(function() {
      doc._handleSubscribe();
    });
  }
};

function pushActionCallback(inflight, isDuplicate, callback) {
  if (isDuplicate) {
    var lastCallback = inflight.pop();
    inflight.push(function(err) {
      lastCallback && lastCallback(err);
      callback && callback(err);
    });
  } else {
    inflight.push(callback);
  }
}

function combineCallbacks(callbacks) {
  callbacks = callbacks.filter(util.truthy);
  if (!callbacks.length) return null;
  return function(error) {
    util.callEach(callbacks, error);
  };
}


// Operations //

// Send the next pending op to the server, if we can.
//
// Only one operation can be in-flight at a time. If an operation is already on
// its way, or we're not currently connected, this method does nothing.
Doc.prototype.flush = function() {
  // Ignore if we can't send or we are already sending an op
  if (!this.connection.canSend || this.inflightOp) return;

  // Send first pending op unless paused
  if (!this.paused && this.pendingOps.length) {
    this._sendOp();
  }
};

// Helper function to set op to contain a no-op.
function setNoOp(op) {
  delete op.op;
  delete op.create;
  delete op.del;
}

// Transform server op data by a client op, and vice versa. Ops are edited in place.
function transformX(client, server) {
  // Order of statements in this function matters. Be especially careful if
  // refactoring this function

  // A client delete op should dominate if both the server and the client
  // delete the document. Thus, any ops following the client delete (such as a
  // subsequent create) will be maintained, since the server op is transformed
  // to a no-op
  if (client.del) return setNoOp(server);

  if (server.del) {
    return new ShareDBError(ERROR_CODE.ERR_DOC_WAS_DELETED, 'Document was deleted');
  }
  if (server.create) {
    return new ShareDBError(ERROR_CODE.ERR_DOC_ALREADY_CREATED, 'Document already created');
  }

  // Ignore no-op coming from server
  if (!('op' in server)) return;

  // I believe that this should not occur, but check just in case
  if (client.create) {
    return new ShareDBError(ERROR_CODE.ERR_DOC_ALREADY_CREATED, 'Document already created');
  }

  // They both edited the document. This is the normal case for this function -
  // as in, most of the time we'll end up down here.
  //
  // You should be wondering why I'm using client.type instead of this.type.
  // The reason is, if we get ops at an old version of the document, this.type
  // might be undefined or a totally different type. By pinning the type to the
  // op data, we make sure the right type has its transform function called.
  if (client.type.transformX) {
    var result = client.type.transformX(client.op, server.op);
    client.op = result[0];
    server.op = result[1];
  } else {
    var clientOp = client.type.transform(client.op, server.op, 'left');
    var serverOp = client.type.transform(server.op, client.op, 'right');
    client.op = clientOp;
    server.op = serverOp;
  }
};

/**
 * Applies the operation to the snapshot
 *
 * If the operation is create or delete it emits `create` or `del`. Then the
 * operation is applied to the snapshot and `op` and `after op` are emitted.
 * If the type supports incremental updates and `this.incremental` is true we
 * fire `op` after every small operation.
 *
 * This is the only function to fire the above mentioned events.
 *
 * @private
 */
Doc.prototype._otApply = function(op, source) {
  if ('op' in op) {
    if (!this.type) {
      // Throw here, because all usage of _otApply should be wrapped with a try/catch
      throw new ShareDBError(
        ERROR_CODE.ERR_DOC_DOES_NOT_EXIST,
        'Cannot apply op to uncreated document. ' + this.collection + '.' + this.id
      );
    }

    // NB: If we need to add another argument to this event, we should consider
    // the fact that the 'op' event has op.src as its 3rd argument
    this.emit('before op batch', op.op, source);

    // Iteratively apply multi-component remote operations and rollback ops
    // (source === false) for the default JSON0 OT type. It could use
    // type.shatter(), but since this code is so specific to use cases for the
    // JSON0 type and ShareDB explicitly bundles the default type, we might as
    // well write it this way and save needing to iterate through the op
    // components twice.
    //
    // Ideally, we would not need this extra complexity. However, it is
    // helpful for implementing bindings that update DOM nodes and other
    // stateful objects by translating op events directly into corresponding
    // mutations. Such bindings are most easily written as responding to
    // individual op components one at a time in order, and it is important
    // that the snapshot only include updates from the particular op component
    // at the time of emission. Eliminating this would require rethinking how
    // such external bindings are implemented.
    if (!source && this.type === types.defaultType && op.op.length > 1) {
      if (!this.applyStack) this.applyStack = [];
      var stackLength = this.applyStack.length;
      for (var i = 0; i < op.op.length; i++) {
        var component = op.op[i];
        var componentOp = {op: [component]};
        // Transform componentOp against any ops that have been submitted
        // sychronously inside of an op event handler since we began apply of
        // our operation
        for (var j = stackLength; j < this.applyStack.length; j++) {
          var transformErr = transformX(this.applyStack[j], componentOp);
          if (transformErr) return this._hardRollback(transformErr);
        }
        // Apply the individual op component
        this.emit('before op', componentOp.op, source, op.src);
        this.data = this.type.apply(this.data, componentOp.op);
        this.emit('op', componentOp.op, source, op.src);
      }
      this.emit('op batch', op.op, source);
      // Pop whatever was submitted since we started applying this op
      this._popApplyStack(stackLength);
      return;
    }

    // The 'before op' event enables clients to pull any necessary data out of
    // the snapshot before it gets changed
    this.emit('before op', op.op, source, op.src);
    // Apply the operation to the local data, mutating it in place
    this.data = this.type.apply(this.data, op.op);
    // Emit an 'op' event once the local data includes the changes from the
    // op. For locally submitted ops, this will be synchronously with
    // submission and before the server or other clients have received the op.
    // For ops from other clients, this will be after the op has been
    // committed to the database and published
    this.emit('op', op.op, source, op.src);
    this.emit('op batch', op.op, source);
    return;
  }

  if (op.create) {
    this._setType(op.create.type);
    this.data = (this.type.deserialize) ?
      (this.type.createDeserialized) ?
        this.type.createDeserialized(op.create.data) :
        this.type.deserialize(this.type.create(op.create.data)) :
      this.type.create(op.create.data);
    this.emit('create', source);
    return;
  }

  if (op.del) {
    var oldData = this.data;
    this._setType(null);
    this.emit('del', oldData, source);
    return;
  }
};


// ***** Sending operations

// Actually send op to the server.
Doc.prototype._sendOp = function() {
  if (!this.connection.canSend) return;
  var src = this.connection.id;

  // When there is no inflightOp, send the first item in pendingOps. If
  // there is inflightOp, try sending it again
  if (!this.inflightOp) {
    // Send first pending op
    this.inflightOp = this.pendingOps.shift();
  }
  var op = this.inflightOp;
  if (!op) {
    var err = new ShareDBError(ERROR_CODE.ERR_INFLIGHT_OP_MISSING, 'No op to send on call to _sendOp');
    return this.emit('error', err);
  }

  // Track data for retrying ops
  op.sentAt = Date.now();
  op.retries = (op.retries == null) ? 0 : op.retries + 1;

  // The src + seq number is a unique ID representing this operation. This tuple
  // is used on the server to detect when ops have been sent multiple times and
  // on the client to match acknowledgement of an op back to the inflightOp.
  // Note that the src could be different from this.connection.id after a
  // reconnect, since an op may still be pending after the reconnection and
  // this.connection.id will change. In case an op is sent multiple times, we
  // also need to be careful not to override the original seq value.
  if (op.seq == null) {
    if (this.connection.seq >= util.MAX_SAFE_INTEGER) {
      return this.emit('error', new ShareDBError(
        ERROR_CODE.ERR_CONNECTION_SEQ_INTEGER_OVERFLOW,
        'Connection seq has exceeded the max safe integer, maybe from being open for too long'
      ));
    }

    op.seq = this.connection.seq++;
  }

  this.connection.sendOp(this, op);

  // src isn't needed on the first try, since the server session will have the
  // same id, but it must be set on the inflightOp in case it is sent again
  // after a reconnect and the connection's id has changed by then
  if (op.src == null) op.src = src;
};


// Queues the operation for submission to the server and applies it locally.
//
// Internal method called to do the actual work for submit(), create() and del().
// @private
//
// @param op
// @param [op.op]
// @param [op.del]
// @param [op.create]
// @param [callback] called when operation is submitted
Doc.prototype._submit = function(op, source, callback) {
  // Locally submitted ops must always have a truthy source
  if (!source) source = true;

  // The op contains either op, create, delete, or none of the above (a no-op).
  if ('op' in op) {
    if (!this.type) {
      var err = new ShareDBError(
        ERROR_CODE.ERR_DOC_DOES_NOT_EXIST,
        'Cannot submit op. Document has not been created. ' + this.collection + '.' + this.id
      );
      if (callback) return callback(err);
      return this.emit('error', err);
    }
    // Try to normalize the op. This removes trailing skip:0's and things like that.
    if (this.type.normalize) op.op = this.type.normalize(op.op);
  }

  try {
    this._pushOp(op, source, callback);
    this._otApply(op, source);
  } catch (error) {
    return this._hardRollback(error);
  }

  // The call to flush is delayed so if submit() is called multiple times
  // synchronously, all the ops are combined before being sent to the server.
  var doc = this;
  util.nextTick(function() {
    doc.flush();
  });
};

Doc.prototype._pushOp = function(op, source, callback) {
  op.source = source;
  if (this.applyStack) {
    // If we are in the process of incrementally applying an operation, don't
    // compose the op and push it onto the applyStack so it can be transformed
    // against other components from the op or ops being applied
    this.applyStack.push(op);
  } else {
    // If the type supports composes, try to compose the operation onto the
    // end of the last pending operation.
    var composed = this._tryCompose(op);
    if (composed) {
      composed.callbacks.push(callback);
      return;
    }
  }
  // Push on to the pendingOps queue of ops to submit if we didn't compose
  op.type = this.type;
  op.callbacks = [callback];
  this.pendingOps.push(op);
};

Doc.prototype._popApplyStack = function(to) {
  if (to > 0) {
    this.applyStack.length = to;
    return;
  }
  // Once we have completed the outermost apply loop, reset to null and no
  // longer add ops to the applyStack as they are submitted
  var op = this.applyStack[0];
  this.applyStack = null;
  if (!op) return;
  // Compose the ops added since the beginning of the apply stack, since we
  // had to skip compose when they were originally pushed
  var i = this.pendingOps.indexOf(op);
  if (i === -1) return;
  var ops = this.pendingOps.splice(i);
  for (var i = 0; i < ops.length; i++) {
    var op = ops[i];
    var composed = this._tryCompose(op);
    if (composed) {
      composed.callbacks = composed.callbacks.concat(op.callbacks);
    } else {
      this.pendingOps.push(op);
    }
  }
};

// Try to compose a submitted op into the last pending op. Returns the
// composed op if it succeeds, undefined otherwise
Doc.prototype._tryCompose = function(op) {
  if (this.preventCompose) return;

  // We can only compose into the last pending op. Inflight ops have already
  // been sent to the server, so we can't modify them
  var last = this.pendingOps[this.pendingOps.length - 1];
  if (!last || last.sentAt) return;

  // If we're submitting the op source, we can only combine ops that have
  // a matching source
  if (this.submitSource && !deepEqual(op.source, last.source)) return;

  // Compose an op into a create by applying it. This effectively makes the op
  // invisible, as if the document were created including the op originally
  if (last.create && 'op' in op) {
    last.create.data = this.type.apply(last.create.data, op.op);
    return last;
  }

  // Compose two ops into a single op if supported by the type. Types that
  // support compose must be able to compose any two ops together
  if ('op' in last && 'op' in op && this.type.compose) {
    last.op = this.type.compose(last.op, op.op);
    return last;
  }
};

// *** Client OT entrypoints.

// Submit an operation to the document.
//
// @param operation handled by the OT type
// @param options  {source: ...}
// @param [callback] called after operation submitted
//
// @fires before op, op, after op
Doc.prototype.submitOp = function(component, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  var op = {op: component};
  var source = options && options.source;
  this._submit(op, source, callback);
};

// Create the document, which in ShareJS semantics means to set its type. Every
// object implicitly exists in the database but has no data and no type. Create
// sets the type of the object and can optionally set some initial data on the
// object, depending on the type.
//
// @param data  initial
// @param type  OT type
// @param options  {source: ...}
// @param callback  called when operation submitted
Doc.prototype.create = function(data, type, options, callback) {
  if (typeof type === 'function') {
    callback = type;
    options = null;
    type = null;
  } else if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  if (!type) {
    type = types.defaultType.uri;
  }
  if (this.type) {
    var err = new ShareDBError(ERROR_CODE.ERR_DOC_ALREADY_CREATED, 'Document already exists');
    if (callback) return callback(err);
    return this.emit('error', err);
  }
  var op = {create: {type: type, data: data}};
  var source = options && options.source;
  this._submit(op, source, callback);
};

// Delete the document. This creates and submits a delete operation to the
// server. Deleting resets the object's type to null and deletes its data. The
// document still exists, and still has the version it used to have before you
// deleted it (well, old version +1).
//
// @param options  {source: ...}
// @param callback  called when operation submitted
Doc.prototype.del = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  if (!this.type) {
    var err = new ShareDBError(ERROR_CODE.ERR_DOC_DOES_NOT_EXIST, 'Document does not exist');
    if (callback) return callback(err);
    return this.emit('error', err);
  }
  var op = {del: true};
  var source = options && options.source;
  this._submit(op, source, callback);
};


// Stops the document from sending any operations to the server.
Doc.prototype.pause = function() {
  this.paused = true;
};

// Continue sending operations to the server
Doc.prototype.resume = function() {
  this.paused = false;
  this.flush();
};

// *** Receiving operations

// This is called when the server acknowledges an operation from the client.
Doc.prototype._opAcknowledged = function(message) {
  if (this.inflightOp.create) {
    this.version = message.v;
  } else if (message.v !== this.version) {
    // We should already be at the same version, because the server should
    // have sent all the ops that have happened before acknowledging our op
    logger.warn('Invalid version from server. Expected: ' + this.version + ' Received: ' + message.v, message);

    // Fetching should get us back to a working document state
    return this.fetch();
  }

  // The op was committed successfully. Increment the version number
  this.version++;

  this._clearInflightOp();
};

Doc.prototype._rollback = function(err) {
  // The server has rejected submission of the current operation. Invert by
  // just the inflight op if possible. If not possible to invert, cancel all
  // pending ops and fetch the latest from the server to get us back into a
  // working state, then call back
  var op = this.inflightOp;

  if ('op' in op && op.type.invert) {
    op.op = op.type.invert(op.op);

    // Transform the undo operation by any pending ops.
    for (var i = 0; i < this.pendingOps.length; i++) {
      var transformErr = transformX(this.pendingOps[i], op);
      if (transformErr) return this._hardRollback(transformErr);
    }

    // ... and apply it locally, reverting the changes.
    //
    // This operation is applied to look like it comes from a remote source.
    // I'm still not 100% sure about this functionality, because its really a
    // local op. Basically, the problem is that if the client's op is rejected
    // by the server, the editor window should update to reflect the undo.
    try {
      this._otApply(op, false);
    } catch (error) {
      return this._hardRollback(error);
    }

    this._clearInflightOp(err);
    return;
  }

  this._hardRollback(err);
};

Doc.prototype._hardRollback = function(err) {
  // Store pending ops so that we can notify their callbacks of the error.
  // We combine the inflight op and the pending ops, because it's possible
  // to hit a condition where we have no inflight op, but we do have pending
  // ops. This can happen when an invalid op is submitted, which causes us
  // to hard rollback before the pending op was flushed.
  var pendingOps = [];
  if (this.inflightOp) pendingOps.push(this.inflightOp);
  pendingOps = pendingOps.concat(this.pendingOps);

  // Cancel all pending ops and reset if we can't invert
  this._setType(null);
  this.version = null;
  this.inflightOp = null;
  this.pendingOps = [];

  // Fetch the latest version from the server to get us back into a working state
  var doc = this;
  this.fetch(function() {
    // We want to check that no errors are swallowed, so we check that:
    // - there are callbacks to call, and
    // - that every single pending op called a callback
    // If there are no ops queued, or one of them didn't handle the error,
    // then we emit the error.
    var allOpsHadCallbacks = !!pendingOps.length;
    for (var i = 0; i < pendingOps.length; i++) {
      allOpsHadCallbacks = util.callEach(pendingOps[i].callbacks, err) && allOpsHadCallbacks;
    }
    if (err && !allOpsHadCallbacks) return doc.emit('error', err);
  });
};

Doc.prototype._clearInflightOp = function(err) {
  var inflightOp = this.inflightOp;

  this.inflightOp = null;

  var called = util.callEach(inflightOp.callbacks, err);

  this.flush();
  this._emitNothingPending();

  if (err && !called) return this.emit('error', err);
};

},{"../emitter":26,"../error":27,"../logger":28,"../types":32,"../util":33,"fast-deep-equal":34}],15:[function(require,module,exports){
exports.Connection = require('./connection');
exports.Doc = require('./doc');
exports.Error = require('../error');
exports.Query = require('./query');
exports.types = require('../types');
exports.logger = require('../logger');

},{"../error":27,"../logger":28,"../types":32,"./connection":13,"./doc":14,"./query":22}],16:[function(require,module,exports){
var Presence = require('./presence');
var LocalDocPresence = require('./local-doc-presence');
var RemoteDocPresence = require('./remote-doc-presence');

function DocPresence(connection, collection, id) {
  var channel = DocPresence.channel(collection, id);
  Presence.call(this, connection, channel);

  this.collection = collection;
  this.id = id;
}
module.exports = DocPresence;

DocPresence.prototype = Object.create(Presence.prototype);

DocPresence.channel = function(collection, id) {
  return collection + '.' + id;
};

DocPresence.prototype._createLocalPresence = function(id) {
  return new LocalDocPresence(this, id);
};

DocPresence.prototype._createRemotePresence = function(id) {
  return new RemoteDocPresence(this, id);
};

},{"./local-doc-presence":17,"./presence":19,"./remote-doc-presence":20}],17:[function(require,module,exports){
var LocalPresence = require('./local-presence');
var ShareDBError = require('../../error');
var util = require('../../util');
var ERROR_CODE = ShareDBError.CODES;

module.exports = LocalDocPresence;
function LocalDocPresence(presence, presenceId) {
  LocalPresence.call(this, presence, presenceId);

  this.collection = this.presence.collection;
  this.id = this.presence.id;

  this._doc = this.connection.get(this.collection, this.id);
  this._isSending = false;

  this._opHandler = this._transformAgainstOp.bind(this);
  this._createOrDelHandler = this._handleCreateOrDel.bind(this);
  this._loadHandler = this._handleLoad.bind(this);
  this._destroyHandler = this.destroy.bind(this);
  this._registerWithDoc();
}

LocalDocPresence.prototype = Object.create(LocalPresence.prototype);

LocalDocPresence.prototype.submit = function(value, callback) {
  if (!this._doc.type) {
    // If the Doc hasn't been created, we already assume all presence to
    // be null. Let's early return, instead of error since this is a harmless
    // no-op
    if (value === null) return this._callbackOrEmit(null, callback);
    var error = {
      code: ERROR_CODE.ERR_DOC_DOES_NOT_EXIST,
      message: 'Cannot submit presence. Document has not been created'
    };
    return this._callbackOrEmit(error, callback);
  };

  LocalPresence.prototype.submit.call(this, value, callback);
};

LocalDocPresence.prototype.destroy = function(callback) {
  this._doc.removeListener('op', this._opHandler);
  this._doc.removeListener('create', this._createOrDelHandler);
  this._doc.removeListener('del', this._createOrDelHandler);
  this._doc.removeListener('load', this._loadHandler);
  this._doc.removeListener('destroy', this._destroyHandler);

  LocalPresence.prototype.destroy.call(this, callback);
};

LocalDocPresence.prototype._sendPending = function() {
  if (this._isSending) return;
  this._isSending = true;
  var presence = this;
  this._doc.whenNothingPending(function() {
    presence._isSending = false;
    if (!presence.connection.canSend) return;

    presence._pendingMessages.forEach(function(message) {
      message.t = presence._doc.type.uri;
      message.v = presence._doc.version;
      presence.connection.send(message);
    });

    presence._pendingMessages = [];
  });
};

LocalDocPresence.prototype._registerWithDoc = function() {
  this._doc.on('op', this._opHandler);
  this._doc.on('create', this._createOrDelHandler);
  this._doc.on('del', this._createOrDelHandler);
  this._doc.on('load', this._loadHandler);
  this._doc.on('destroy', this._destroyHandler);
};

LocalDocPresence.prototype._transformAgainstOp = function(op, source) {
  var presence = this;
  this._pendingMessages.forEach(function(message) {
    try {
      message.p = presence._transformPresence(message.p, op, source);
    } catch (error) {
      var callback = presence._getCallback(message.pv);
      presence._callbackOrEmit(error, callback);
    }
  });

  try {
    this.value = this._transformPresence(this.value, op, source);
  } catch (error) {
    this.emit('error', error);
  }
};

LocalDocPresence.prototype._handleCreateOrDel = function() {
  this._pendingMessages.forEach(function(message) {
    message.p = null;
  });

  this.value = null;
};

LocalDocPresence.prototype._handleLoad = function() {
  this.value = null;
  this._pendingMessages = [];
};

LocalDocPresence.prototype._message = function() {
  var message = LocalPresence.prototype._message.call(this);
  message.c = this.collection,
  message.d = this.id,
  message.v = null;
  message.t = null;
  return message;
};

LocalDocPresence.prototype._transformPresence = function(value, op, source) {
  var type = this._doc.type;
  if (!util.supportsPresence(type)) {
    throw new ShareDBError(
      ERROR_CODE.ERR_TYPE_DOES_NOT_SUPPORT_PRESENCE,
      'Type does not support presence: ' + type.name
    );
  }
  return type.transformPresence(value, op, source);
};

},{"../../error":27,"../../util":33,"./local-presence":18}],18:[function(require,module,exports){
var emitter = require('../../emitter');
var util = require('../../util');

module.exports = LocalPresence;
function LocalPresence(presence, presenceId) {
  emitter.EventEmitter.call(this);

  if (!presenceId || typeof presenceId !== 'string') {
    throw new Error('LocalPresence presenceId must be a string');
  }

  this.presence = presence;
  this.presenceId = presenceId;
  this.connection = presence.connection;
  this.presenceVersion = 0;

  this.value = null;

  this._pendingMessages = [];
  this._callbacksByPresenceVersion = {};
}
emitter.mixin(LocalPresence);

LocalPresence.prototype.submit = function(value, callback) {
  this.value = value;
  this.send(callback);
};

LocalPresence.prototype.send = function(callback) {
  var message = this._message();
  this._pendingMessages.push(message);
  this._callbacksByPresenceVersion[message.pv] = callback;
  this._sendPending();
};

LocalPresence.prototype.destroy = function(callback) {
  var presence = this;
  this.submit(null, function(error) {
    if (error) return presence._callbackOrEmit(error, callback);
    delete presence.presence.localPresences[presence.presenceId];
    if (callback) callback();
  });
};

LocalPresence.prototype._sendPending = function() {
  if (!this.connection.canSend) return;
  var presence = this;
  this._pendingMessages.forEach(function(message) {
    presence.connection.send(message);
  });

  this._pendingMessages = [];
};

LocalPresence.prototype._ack = function(error, presenceVersion) {
  var callback = this._getCallback(presenceVersion);
  this._callbackOrEmit(error, callback);
};

LocalPresence.prototype._message = function() {
  return {
    a: 'p',
    ch: this.presence.channel,
    id: this.presenceId,
    p: this.value,
    pv: this.presenceVersion++
  };
};

LocalPresence.prototype._getCallback = function(presenceVersion) {
  var callback = this._callbacksByPresenceVersion[presenceVersion];
  delete this._callbacksByPresenceVersion[presenceVersion];
  return callback;
};

LocalPresence.prototype._callbackOrEmit = function(error, callback) {
  if (callback) return util.nextTick(callback, error);
  if (error) this.emit('error', error);
};

},{"../../emitter":26,"../../util":33}],19:[function(require,module,exports){
var emitter = require('../../emitter');
var LocalPresence = require('./local-presence');
var RemotePresence = require('./remote-presence');
var util = require('../../util');
var async = require('async');
var hat = require('hat');

module.exports = Presence;
function Presence(connection, channel) {
  emitter.EventEmitter.call(this);

  if (!channel || typeof channel !== 'string') {
    throw new Error('Presence channel must be provided');
  }

  this.connection = connection;
  this.channel = channel;

  this.wantSubscribe = false;
  this.subscribed = false;
  this.remotePresences = {};
  this.localPresences = {};

  this._remotePresenceInstances = {};
  this._subscriptionCallbacksBySeq = {};
}
emitter.mixin(Presence);

Presence.prototype.subscribe = function(callback) {
  this._sendSubscriptionAction(true, callback);
};

Presence.prototype.unsubscribe = function(callback) {
  this._sendSubscriptionAction(false, callback);
};

Presence.prototype.create = function(id) {
  id = id || hat();
  var localPresence = this._createLocalPresence(id);
  this.localPresences[id] = localPresence;
  return localPresence;
};

Presence.prototype.destroy = function(callback) {
  var presence = this;
  this.unsubscribe(function(error) {
    if (error) return presence._callbackOrEmit(error, callback);
    var localIds = Object.keys(presence.localPresences);
    var remoteIds = Object.keys(presence._remotePresenceInstances);
    async.parallel(
      [
        function(next) {
          async.each(localIds, function(presenceId, next) {
            presence.localPresences[presenceId].destroy(next);
          }, next);
        },
        function(next) {
          async.each(remoteIds, function(presenceId, next) {
            presence._remotePresenceInstances[presenceId].destroy(next);
          }, next);
        }
      ],
      function(error) {
        delete presence.connection._presences[presence.channel];
        presence._callbackOrEmit(error, callback);
      }
    );
  });
};

Presence.prototype._sendSubscriptionAction = function(wantSubscribe, callback) {
  this.wantSubscribe = !!wantSubscribe;
  var action = this.wantSubscribe ? 'ps' : 'pu';
  var seq = this.connection._presenceSeq++;
  this._subscriptionCallbacksBySeq[seq] = callback;
  if (this.connection.canSend) {
    this.connection._sendPresenceAction(action, seq, this);
  }
};

Presence.prototype._handleSubscribe = function(error, seq) {
  if (this.wantSubscribe) this.subscribed = true;
  var callback = this._subscriptionCallback(seq);
  this._callbackOrEmit(error, callback);
};

Presence.prototype._handleUnsubscribe = function(error, seq) {
  this.subscribed = false;
  var callback = this._subscriptionCallback(seq);
  this._callbackOrEmit(error, callback);
};

Presence.prototype._receiveUpdate = function(error, message) {
  var localPresence = util.dig(this.localPresences, message.id);
  if (localPresence) return localPresence._ack(error, message.pv);

  if (error) return this.emit('error', error);
  var presence = this;
  var remotePresence = util.digOrCreate(this._remotePresenceInstances, message.id, function() {
    return presence._createRemotePresence(message.id);
  });

  remotePresence.receiveUpdate(message);
};

Presence.prototype._updateRemotePresence = function(remotePresence) {
  this.remotePresences[remotePresence.presenceId] = remotePresence.value;
  if (remotePresence.value === null) this._removeRemotePresence(remotePresence.presenceId);
  this.emit('receive', remotePresence.presenceId, remotePresence.value);
};

Presence.prototype._broadcastAllLocalPresence = function(error) {
  if (error) return this.emit('error', error);
  for (var id in this.localPresences) {
    var localPresence = this.localPresences[id];
    if (localPresence.value !== null) localPresence.send();
  }
};

Presence.prototype._removeRemotePresence = function(id) {
  this._remotePresenceInstances[id].destroy();
  delete this._remotePresenceInstances[id];
  delete this.remotePresences[id];
};

Presence.prototype._onConnectionStateChanged = function() {
  if (!this.connection.canSend) return;
  this._resubscribe();
  for (var id in this.localPresences) {
    this.localPresences[id]._sendPending();
  }
};

Presence.prototype._resubscribe = function() {
  var callbacks = [];
  for (var seq in this._subscriptionCallbacksBySeq) {
    var callback = this._subscriptionCallback(seq);
    callbacks.push(callback);
  }

  if (!this.wantSubscribe) return this._callEachOrEmit(callbacks);

  var presence = this;
  this.subscribe(function(error) {
    presence._callEachOrEmit(callbacks, error);
  });
};

Presence.prototype._subscriptionCallback = function(seq) {
  var callback = this._subscriptionCallbacksBySeq[seq];
  delete this._subscriptionCallbacksBySeq[seq];
  return callback;
};

Presence.prototype._callbackOrEmit = function(error, callback) {
  if (callback) return util.nextTick(callback, error);
  if (error) this.emit('error', error);
};

Presence.prototype._createLocalPresence = function(id) {
  return new LocalPresence(this, id);
};

Presence.prototype._createRemotePresence = function(id) {
  return new RemotePresence(this, id);
};

Presence.prototype._callEachOrEmit = function(callbacks, error) {
  var called = util.callEach(callbacks, error);
  if (!called && error) this.emit('error', error);
};

},{"../../emitter":26,"../../util":33,"./local-presence":18,"./remote-presence":21,"async":2,"hat":4}],20:[function(require,module,exports){
var RemotePresence = require('./remote-presence');
var ot = require('../../ot');

module.exports = RemoteDocPresence;
function RemoteDocPresence(presence, presenceId) {
  RemotePresence.call(this, presence, presenceId);

  this.collection = this.presence.collection;
  this.id = this.presence.id;
  this.src = null;
  this.presenceVersion = null;

  this._doc = this.connection.get(this.collection, this.id);
  this._pending = null;
  this._opCache = null;
  this._pendingSetPending = false;

  this._opHandler = this._handleOp.bind(this);
  this._createDelHandler = this._handleCreateDel.bind(this);
  this._loadHandler = this._handleLoad.bind(this);
  this._registerWithDoc();
}

RemoteDocPresence.prototype = Object.create(RemotePresence.prototype);

RemoteDocPresence.prototype.receiveUpdate = function(message) {
  if (this._pending && message.pv < this._pending.pv) return;
  this.src = message.src;
  this._pending = message;
  this._setPendingPresence();
};

RemoteDocPresence.prototype.destroy = function(callback) {
  this._doc.removeListener('op', this._opHandler);
  this._doc.removeListener('create', this._createDelHandler);
  this._doc.removeListener('del', this._createDelHandler);
  this._doc.removeListener('load', this._loadHandler);

  RemotePresence.prototype.destroy.call(this, callback);
};

RemoteDocPresence.prototype._registerWithDoc = function() {
  this._doc.on('op', this._opHandler);
  this._doc.on('create', this._createDelHandler);
  this._doc.on('del', this._createDelHandler);
  this._doc.on('load', this._loadHandler);
};

RemoteDocPresence.prototype._setPendingPresence = function() {
  if (this._pendingSetPending) return;
  this._pendingSetPending = true;
  var presence = this;
  this._doc.whenNothingPending(function() {
    presence._pendingSetPending = false;
    if (!presence._pending) return;
    if (presence._pending.pv < presence.presenceVersion) return presence._pending = null;

    if (presence._pending.v > presence._doc.version) {
      return presence._doc.fetch();
    }

    if (!presence._catchUpStalePresence()) return;

    presence.value = presence._pending.p;
    presence.presenceVersion = presence._pending.pv;
    presence._pending = null;
    presence.presence._updateRemotePresence(presence);
  });
};

RemoteDocPresence.prototype._handleOp = function(op, source, connectionId) {
  var isOwnOp = connectionId === this.src;
  this._transformAgainstOp(op, isOwnOp);
  this._cacheOp(op, isOwnOp);
  this._setPendingPresence();
};

RemotePresence.prototype._handleCreateDel = function() {
  this._cacheOp(null);
  this._setPendingPresence();
};

RemotePresence.prototype._handleLoad = function() {
  this.value = null;
  this._pending = null;
  this._opCache = null;
  this.presence._updateRemotePresence(this);
};

RemoteDocPresence.prototype._transformAgainstOp = function(op, isOwnOp) {
  if (!this.value) return;

  try {
    this.value = this._doc.type.transformPresence(this.value, op, isOwnOp);
  } catch (error) {
    return this.presence.emit('error', error);
  }
  this.presence._updateRemotePresence(this);
};

RemoteDocPresence.prototype._catchUpStalePresence = function() {
  if (this._pending.v >= this._doc.version) return true;

  if (!this._opCache) {
    this._startCachingOps();
    this._doc.fetch();
    // We're already subscribed, but we send another subscribe message
    // to force presence updates from other clients
    this.presence.subscribe();
    return false;
  }

  while (this._opCache[this._pending.v]) {
    var item = this._opCache[this._pending.v];
    var op = item.op;
    var isOwnOp = item.isOwnOp;
    // We use a null op to signify a create or a delete operation. In both
    // cases we just want to reset the presence (which doesn't make sense
    // in a new document), so just set the presence to null.
    if (op === null) {
      this._pending.p = null;
      this._pending.v++;
    } else {
      ot.transformPresence(this._pending, op, isOwnOp);
    }
  }

  var hasCaughtUp = this._pending.v >= this._doc.version;
  if (hasCaughtUp) {
    this._stopCachingOps();
  }

  return hasCaughtUp;
};

RemoteDocPresence.prototype._startCachingOps = function() {
  this._opCache = [];
};

RemoteDocPresence.prototype._stopCachingOps = function() {
  this._opCache = null;
};

RemoteDocPresence.prototype._cacheOp = function(op, isOwnOp) {
  if (this._opCache) {
    op = op ? {op: op} : null;
    // Subtract 1 from the current doc version, because an op with v3
    // should be read as the op that takes a doc from v3 -> v4
    this._opCache[this._doc.version - 1] = {op: op, isOwnOp: isOwnOp};
  }
};

},{"../../ot":30,"./remote-presence":21}],21:[function(require,module,exports){
var util = require('../../util');

module.exports = RemotePresence;
function RemotePresence(presence, presenceId) {
  this.presence = presence;
  this.presenceId = presenceId;
  this.connection = this.presence.connection;

  this.value = null;
  this.presenceVersion = 0;
}

RemotePresence.prototype.receiveUpdate = function(message) {
  if (message.pv < this.presenceVersion) return;
  this.value = message.p;
  this.presenceVersion = message.pv;
  this.presence._updateRemotePresence(this);
};

RemotePresence.prototype.destroy = function(callback) {
  delete this.presence._remotePresenceInstances[this.presenceId];
  delete this.presence.remotePresences[this.presenceId];
  if (callback) util.nextTick(callback);
};

},{"../../util":33}],22:[function(require,module,exports){
var emitter = require('../emitter');
var util = require('../util');

// Queries are live requests to the database for particular sets of fields.
//
// The server actively tells the client when there's new data that matches
// a set of conditions.
module.exports = Query;
function Query(action, connection, id, collection, query, options, callback) {
  emitter.EventEmitter.call(this);

  // 'qf' or 'qs'
  this.action = action;

  this.connection = connection;
  this.id = id;
  this.collection = collection;

  // The query itself. For mongo, this should look something like {"data.x":5}
  this.query = query;

  // A list of resulting documents. These are actual documents, complete with
  // data and all the rest. It is possible to pass in an initial results set,
  // so that a query can be serialized and then re-established
  this.results = null;
  if (options && options.results) {
    this.results = options.results;
    delete options.results;
  }
  this.extra = undefined;

  // Options to pass through with the query
  this.options = options;

  this.callback = callback;
  this.ready = false;
  this.sent = false;
}
emitter.mixin(Query);

Query.prototype.hasPending = function() {
  return !this.ready;
};

// Helper for subscribe & fetch, since they share the same message format.
//
// This function actually issues the query.
Query.prototype.send = function() {
  if (!this.connection.canSend) return;

  var message = {
    a: this.action,
    id: this.id,
    c: this.collection,
    q: this.query
  };
  if (this.options) {
    message.o = this.options;
  }
  if (this.results) {
    // Collect the version of all the documents in the current result set so we
    // don't need to be sent their snapshots again.
    var results = [];
    for (var i = 0; i < this.results.length; i++) {
      var doc = this.results[i];
      results.push([doc.id, doc.version]);
    }
    message.r = results;
  }

  this.connection.send(message);
  this.sent = true;
};

// Destroy the query object. Any subsequent messages for the query will be
// ignored by the connection.
Query.prototype.destroy = function(callback) {
  if (this.connection.canSend && this.action === 'qs') {
    this.connection.send({a: 'qu', id: this.id});
  }
  this.connection._destroyQuery(this);
  // There is a callback for consistency, but we don't actually wait for the
  // server's unsubscribe message currently
  if (callback) util.nextTick(callback);
};

Query.prototype._onConnectionStateChanged = function() {
  if (this.connection.canSend && !this.sent) {
    this.send();
  } else {
    this.sent = false;
  }
};

Query.prototype._handleFetch = function(err, data, extra) {
  // Once a fetch query gets its data, it is destroyed.
  this.connection._destroyQuery(this);
  this._handleResponse(err, data, extra);
};

Query.prototype._handleSubscribe = function(err, data, extra) {
  this._handleResponse(err, data, extra);
};

Query.prototype._handleResponse = function(err, data, extra) {
  var callback = this.callback;
  this.callback = null;
  if (err) return this._finishResponse(err, callback);
  if (!data) return this._finishResponse(null, callback);

  var query = this;
  var wait = 1;
  var finish = function(err) {
    if (err) return query._finishResponse(err, callback);
    if (--wait) return;
    query._finishResponse(null, callback);
  };

  if (Array.isArray(data)) {
    wait += data.length;
    this.results = this._ingestSnapshots(data, finish);
    this.extra = extra;
  } else {
    for (var id in data) {
      wait++;
      var snapshot = data[id];
      var doc = this.connection.get(snapshot.c || this.collection, id);
      doc.ingestSnapshot(snapshot, finish);
    }
  }

  finish();
};

Query.prototype._ingestSnapshots = function(snapshots, finish) {
  var results = [];
  for (var i = 0; i < snapshots.length; i++) {
    var snapshot = snapshots[i];
    var doc = this.connection.get(snapshot.c || this.collection, snapshot.d);
    doc.ingestSnapshot(snapshot, finish);
    results.push(doc);
  }
  return results;
};

Query.prototype._finishResponse = function(err, callback) {
  this.emit('ready');
  this.ready = true;
  if (err) {
    this.connection._destroyQuery(this);
    if (callback) return callback(err);
    return this.emit('error', err);
  }
  if (callback) callback(null, this.results, this.extra);
};

Query.prototype._handleError = function(err) {
  this.emit('error', err);
};

Query.prototype._handleDiff = function(diff) {
  // We need to go through the list twice. First, we'll ingest all the new
  // documents. After that we'll emit events and actually update our list.
  // This avoids race conditions around setting documents to be subscribed &
  // unsubscribing documents in event callbacks.
  for (var i = 0; i < diff.length; i++) {
    var d = diff[i];
    if (d.type === 'insert') d.values = this._ingestSnapshots(d.values);
  }

  for (var i = 0; i < diff.length; i++) {
    var d = diff[i];
    switch (d.type) {
      case 'insert':
        var newDocs = d.values;
        Array.prototype.splice.apply(this.results, [d.index, 0].concat(newDocs));
        this.emit('insert', newDocs, d.index);
        break;
      case 'remove':
        var howMany = d.howMany || 1;
        var removed = this.results.splice(d.index, howMany);
        this.emit('remove', removed, d.index);
        break;
      case 'move':
        var howMany = d.howMany || 1;
        var docs = this.results.splice(d.from, howMany);
        Array.prototype.splice.apply(this.results, [d.to, 0].concat(docs));
        this.emit('move', docs, d.from, d.to);
        break;
    }
  }

  this.emit('changed', this.results);
};

Query.prototype._handleExtra = function(extra) {
  this.extra = extra;
  this.emit('extra', extra);
};

},{"../emitter":26,"../util":33}],23:[function(require,module,exports){
var Snapshot = require('../../snapshot');
var emitter = require('../../emitter');

module.exports = SnapshotRequest;

function SnapshotRequest(connection, requestId, collection, id, callback) {
  emitter.EventEmitter.call(this);

  if (typeof callback !== 'function') {
    throw new Error('Callback is required for SnapshotRequest');
  }

  this.requestId = requestId;
  this.connection = connection;
  this.id = id;
  this.collection = collection;
  this.callback = callback;

  this.sent = false;
}
emitter.mixin(SnapshotRequest);

SnapshotRequest.prototype.send = function() {
  if (!this.connection.canSend) {
    return;
  }

  this.connection.send(this._message());
  this.sent = true;
};

SnapshotRequest.prototype._onConnectionStateChanged = function() {
  if (this.connection.canSend) {
    if (!this.sent) this.send();
  } else {
    // If the connection can't send, then we've had a disconnection, and even if we've already sent
    // the request previously, we need to re-send it over this reconnected client, so reset the
    // sent flag to false.
    this.sent = false;
  }
};

SnapshotRequest.prototype._handleResponse = function(error, message) {
  this.emit('ready');

  if (error) {
    return this.callback(error);
  }

  var metadata = message.meta ? message.meta : null;
  var snapshot = new Snapshot(this.id, message.v, message.type, message.data, metadata);

  this.callback(null, snapshot);
};

},{"../../emitter":26,"../../snapshot":31}],24:[function(require,module,exports){
var SnapshotRequest = require('./snapshot-request');
var util = require('../../util');

module.exports = SnapshotTimestampRequest;

function SnapshotTimestampRequest(connection, requestId, collection, id, timestamp, callback) {
  SnapshotRequest.call(this, connection, requestId, collection, id, callback);

  if (!util.isValidTimestamp(timestamp)) {
    throw new Error('Snapshot timestamp must be a positive integer or null');
  }

  this.timestamp = timestamp;
}

SnapshotTimestampRequest.prototype = Object.create(SnapshotRequest.prototype);

SnapshotTimestampRequest.prototype._message = function() {
  return {
    a: 'nt',
    id: this.requestId,
    c: this.collection,
    d: this.id,
    ts: this.timestamp
  };
};

},{"../../util":33,"./snapshot-request":23}],25:[function(require,module,exports){
var SnapshotRequest = require('./snapshot-request');
var util = require('../../util');

module.exports = SnapshotVersionRequest;

function SnapshotVersionRequest(connection, requestId, collection, id, version, callback) {
  SnapshotRequest.call(this, connection, requestId, collection, id, callback);

  if (!util.isValidVersion(version)) {
    throw new Error('Snapshot version must be a positive integer or null');
  }

  this.version = version;
}

SnapshotVersionRequest.prototype = Object.create(SnapshotRequest.prototype);

SnapshotVersionRequest.prototype._message = function() {
  return {
    a: 'nf',
    id: this.requestId,
    c: this.collection,
    d: this.id,
    v: this.version
  };
};

},{"../../util":33,"./snapshot-request":23}],26:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;

exports.EventEmitter = EventEmitter;
exports.mixin = mixin;

function mixin(Constructor) {
  for (var key in EventEmitter.prototype) {
    Constructor.prototype[key] = EventEmitter.prototype[key];
  }
}

},{"events":3}],27:[function(require,module,exports){
function ShareDBError(code, message) {
  this.code = code;
  this.message = message || '';
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, ShareDBError);
  } else {
    this.stack = new Error().stack;
  }
}

ShareDBError.prototype = Object.create(Error.prototype);
ShareDBError.prototype.constructor = ShareDBError;
ShareDBError.prototype.name = 'ShareDBError';

ShareDBError.CODES = {
  ERR_APPLY_OP_VERSION_DOES_NOT_MATCH_SNAPSHOT: 'ERR_APPLY_OP_VERSION_DOES_NOT_MATCH_SNAPSHOT',
  ERR_APPLY_SNAPSHOT_NOT_PROVIDED: 'ERR_APPLY_SNAPSHOT_NOT_PROVIDED',
  ERR_CLIENT_ID_BADLY_FORMED: 'ERR_CLIENT_ID_BADLY_FORMED',
  ERR_CONNECTION_SEQ_INTEGER_OVERFLOW: 'ERR_CONNECTION_SEQ_INTEGER_OVERFLOW',
  ERR_CONNECTION_STATE_TRANSITION_INVALID: 'ERR_CONNECTION_STATE_TRANSITION_INVALID',
  ERR_DATABASE_ADAPTER_NOT_FOUND: 'ERR_DATABASE_ADAPTER_NOT_FOUND',
  ERR_DATABASE_DOES_NOT_SUPPORT_SUBSCRIBE: 'ERR_DATABASE_DOES_NOT_SUPPORT_SUBSCRIBE',
  ERR_DATABASE_METHOD_NOT_IMPLEMENTED: 'ERR_DATABASE_METHOD_NOT_IMPLEMENTED',
  ERR_DEFAULT_TYPE_MISMATCH: 'ERR_DEFAULT_TYPE_MISMATCH',
  ERR_DOC_MISSING_VERSION: 'ERR_DOC_MISSING_VERSION',
  ERR_DOC_ALREADY_CREATED: 'ERR_DOC_ALREADY_CREATED',
  ERR_DOC_DOES_NOT_EXIST: 'ERR_DOC_DOES_NOT_EXIST',
  ERR_DOC_TYPE_NOT_RECOGNIZED: 'ERR_DOC_TYPE_NOT_RECOGNIZED',
  ERR_DOC_WAS_DELETED: 'ERR_DOC_WAS_DELETED',
  ERR_INFLIGHT_OP_MISSING: 'ERR_INFLIGHT_OP_MISSING',
  ERR_INGESTED_SNAPSHOT_HAS_NO_VERSION: 'ERR_INGESTED_SNAPSHOT_HAS_NO_VERSION',
  ERR_MAX_SUBMIT_RETRIES_EXCEEDED: 'ERR_MAX_SUBMIT_RETRIES_EXCEEDED',
  ERR_MESSAGE_BADLY_FORMED: 'ERR_MESSAGE_BADLY_FORMED',
  ERR_MILESTONE_ARGUMENT_INVALID: 'ERR_MILESTONE_ARGUMENT_INVALID',
  ERR_OP_ALREADY_SUBMITTED: 'ERR_OP_ALREADY_SUBMITTED',
  ERR_OP_NOT_ALLOWED_IN_PROJECTION: 'ERR_OP_NOT_ALLOWED_IN_PROJECTION',
  ERR_OP_SUBMIT_REJECTED: 'ERR_OP_SUBMIT_REJECTED',
  ERR_OP_VERSION_MISMATCH_AFTER_TRANSFORM: 'ERR_OP_VERSION_MISMATCH_AFTER_TRANSFORM',
  ERR_OP_VERSION_MISMATCH_DURING_TRANSFORM: 'ERR_OP_VERSION_MISMATCH_DURING_TRANSFORM',
  ERR_OP_VERSION_NEWER_THAN_CURRENT_SNAPSHOT: 'ERR_OP_VERSION_NEWER_THAN_CURRENT_SNAPSHOT',
  ERR_OT_LEGACY_JSON0_OP_CANNOT_BE_NORMALIZED: 'ERR_OT_LEGACY_JSON0_OP_CANNOT_BE_NORMALIZED',
  ERR_OT_OP_BADLY_FORMED: 'ERR_OT_OP_BADLY_FORMED',
  ERR_OT_OP_NOT_APPLIED: 'ERR_OT_OP_NOT_APPLIED',
  ERR_OT_OP_NOT_PROVIDED: 'ERR_OT_OP_NOT_PROVIDED',
  ERR_PRESENCE_TRANSFORM_FAILED: 'ERR_PRESENCE_TRANSFORM_FAILED',
  ERR_PROTOCOL_VERSION_NOT_SUPPORTED: 'ERR_PROTOCOL_VERSION_NOT_SUPPORTED',
  ERR_QUERY_EMITTER_LISTENER_NOT_ASSIGNED: 'ERR_QUERY_EMITTER_LISTENER_NOT_ASSIGNED',
  /**
   * A special error that a "readSnapshots" middleware implementation can use to indicate that it
   * wishes for the ShareDB client to treat it as a silent rejection, not passing the error back to
   * user code.
   *
   * For subscribes, the ShareDB client will still cancel the document subscription.
   */
  ERR_SNAPSHOT_READ_SILENT_REJECTION: 'ERR_SNAPSHOT_READ_SILENT_REJECTION',
  /**
   * A "readSnapshots" middleware rejected the reads of specific snapshots.
   *
   * This error code is mostly for server use and generally will not be encountered on the client.
   * Instead, each specific doc that encountered an error will receive its specific error.
   *
   * The one exception is for queries, where a "readSnapshots" rejection of specific snapshots will
   * cause the client to receive this error for the whole query, since queries don't support
   * doc-specific errors.
   */
  ERR_SNAPSHOT_READS_REJECTED: 'ERR_SNAPSHOT_READS_REJECTED',
  ERR_SUBMIT_TRANSFORM_OPS_NOT_FOUND: 'ERR_SUBMIT_TRANSFORM_OPS_NOT_FOUND',
  ERR_TYPE_CANNOT_BE_PROJECTED: 'ERR_TYPE_CANNOT_BE_PROJECTED',
  ERR_TYPE_DOES_NOT_SUPPORT_PRESENCE: 'ERR_TYPE_DOES_NOT_SUPPORT_PRESENCE',
  ERR_UNKNOWN_ERROR: 'ERR_UNKNOWN_ERROR'
};

module.exports = ShareDBError;

},{}],28:[function(require,module,exports){
var Logger = require('./logger');
var logger = new Logger();
module.exports = logger;

},{"./logger":29}],29:[function(require,module,exports){
var SUPPORTED_METHODS = [
  'info',
  'warn',
  'error'
];

function Logger() {
  var defaultMethods = {};
  SUPPORTED_METHODS.forEach(function(method) {
    // Deal with Chrome issue: https://bugs.chromium.org/p/chromium/issues/detail?id=179628
    defaultMethods[method] = console[method].bind(console);
  });
  this.setMethods(defaultMethods);
}
module.exports = Logger;

Logger.prototype.setMethods = function(overrides) {
  overrides = overrides || {};
  var logger = this;

  SUPPORTED_METHODS.forEach(function(method) {
    if (typeof overrides[method] === 'function') {
      logger[method] = overrides[method];
    }
  });
};

},{}],30:[function(require,module,exports){
// This contains the master OT functions for the database. They look like
// ot-types style operational transform functions, but they're a bit different.
// These functions understand versions and can deal with out of bound create &
// delete operations.

var types = require('./types');
var ShareDBError = require('./error');
var util = require('./util');

var ERROR_CODE = ShareDBError.CODES;

// Returns an error string on failure. Rockin' it C style.
exports.checkOp = function(op) {
  if (op == null || typeof op !== 'object') {
    return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'Op must be an object');
  }

  if (op.create != null) {
    if (typeof op.create !== 'object') {
      return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'Create data must be an object');
    }
    var typeName = op.create.type;
    if (typeof typeName !== 'string') {
      return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'Missing create type');
    }
    var type = types.map[typeName];
    if (type == null || typeof type !== 'object') {
      return new ShareDBError(ERROR_CODE.ERR_DOC_TYPE_NOT_RECOGNIZED, 'Unknown type');
    }
  } else if (op.del != null) {
    if (op.del !== true) return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'del value must be true');
  } else if (!('op' in op)) {
    return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'Missing op, create, or del');
  }

  if (op.src != null && typeof op.src !== 'string') {
    return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'src must be a string');
  }
  if (op.seq != null && typeof op.seq !== 'number') {
    return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'seq must be a number');
  }
  if (
    (op.src == null && op.seq != null) ||
    (op.src != null && op.seq == null)
  ) {
    return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'Both src and seq must be set together');
  }

  if (op.m != null && typeof op.m !== 'object') {
    return new ShareDBError(ERROR_CODE.ERR_OT_OP_BADLY_FORMED, 'op.m must be an object or null');
  }
};

// Takes in a string (type name or URI) and returns the normalized name (uri)
exports.normalizeType = function(typeName) {
  return types.map[typeName] && types.map[typeName].uri;
};

// This is the super apply function that takes in snapshot data (including the
// type) and edits it in-place. Returns an error or null for success.
exports.apply = function(snapshot, op) {
  if (typeof snapshot !== 'object') {
    return new ShareDBError(ERROR_CODE.ERR_APPLY_SNAPSHOT_NOT_PROVIDED, 'Missing snapshot');
  }
  if (snapshot.v != null && op.v != null && snapshot.v !== op.v) {
    return new ShareDBError(ERROR_CODE.ERR_APPLY_OP_VERSION_DOES_NOT_MATCH_SNAPSHOT, 'Version mismatch');
  }

  // Create operation
  if (op.create) {
    if (snapshot.type) return new ShareDBError(ERROR_CODE.ERR_DOC_ALREADY_CREATED, 'Document already exists');

    // The document doesn't exist, although it might have once existed
    var create = op.create;
    var type = types.map[create.type];
    if (!type) return new ShareDBError(ERROR_CODE.ERR_DOC_TYPE_NOT_RECOGNIZED, 'Unknown type');

    try {
      snapshot.data = type.create(create.data);
      snapshot.type = type.uri;
      snapshot.v++;
    } catch (err) {
      return err;
    }

  // Delete operation
  } else if (op.del) {
    snapshot.data = undefined;
    snapshot.type = null;
    snapshot.v++;

  // Edit operation
  } else if ('op' in op) {
    var err = applyOpEdit(snapshot, op.op);
    if (err) return err;
    snapshot.v++;

  // No-op, and we don't have to do anything
  } else {
    snapshot.v++;
  }
};

function applyOpEdit(snapshot, edit) {
  if (!snapshot.type) return new ShareDBError(ERROR_CODE.ERR_DOC_DOES_NOT_EXIST, 'Document does not exist');

  if (edit === undefined) return new ShareDBError(ERROR_CODE.ERR_OT_OP_NOT_PROVIDED, 'Missing op');
  var type = types.map[snapshot.type];
  if (!type) return new ShareDBError(ERROR_CODE.ERR_DOC_TYPE_NOT_RECOGNIZED, 'Unknown type');

  try {
    snapshot.data = type.apply(snapshot.data, edit);
  } catch (err) {
    return new ShareDBError(ERROR_CODE.ERR_OT_OP_NOT_APPLIED, err.message);
  }
}

exports.transform = function(type, op, appliedOp) {
  // There are 16 cases this function needs to deal with - which are all the
  // combinations of create/delete/op/noop from both op and appliedOp
  if (op.v != null && op.v !== appliedOp.v) {
    return new ShareDBError(ERROR_CODE.ERR_OP_VERSION_MISMATCH_DURING_TRANSFORM, 'Version mismatch');
  }

  if (appliedOp.del) {
    if (op.create || 'op' in op) {
      return new ShareDBError(ERROR_CODE.ERR_DOC_WAS_DELETED, 'Document was deleted');
    }
  } else if (
    (appliedOp.create && ('op' in op || op.create || op.del)) ||
    ('op' in appliedOp && op.create)
  ) {
    // If appliedOp.create is not true, appliedOp contains an op - which
    // also means the document exists remotely.
    return new ShareDBError(ERROR_CODE.ERR_DOC_ALREADY_CREATED, 'Document was created remotely');
  } else if ('op' in appliedOp && 'op' in op) {
    // If we reach here, they both have a .op property.
    if (!type) return new ShareDBError(ERROR_CODE.ERR_DOC_DOES_NOT_EXIST, 'Document does not exist');

    if (typeof type === 'string') {
      type = types.map[type];
      if (!type) return new ShareDBError(ERROR_CODE.ERR_DOC_TYPE_NOT_RECOGNIZED, 'Unknown type');
    }

    try {
      op.op = type.transform(op.op, appliedOp.op, 'left');
    } catch (err) {
      return err;
    }
  }

  if (op.v != null) op.v++;
};

/**
 * Apply an array of ops to the provided snapshot.
 *
 * @param snapshot - a Snapshot object which will be mutated by the provided ops
 * @param ops - an array of ops to apply to the snapshot
 * @param options - options (currently for internal use only)
 * @return an error object if applicable
 */
exports.applyOps = function(snapshot, ops, options) {
  options = options || {};
  for (var index = 0; index < ops.length; index++) {
    var op = ops[index];
    if (options._normalizeLegacyJson0Ops) {
      try {
        normalizeLegacyJson0Ops(snapshot, op);
      } catch (error) {
        return new ShareDBError(
          ERROR_CODE.ERR_OT_LEGACY_JSON0_OP_CANNOT_BE_NORMALIZED,
          'Cannot normalize legacy json0 op'
        );
      }
    }
    snapshot.v = op.v;
    var error = exports.apply(snapshot, op);
    if (error) return error;
  }
};

exports.transformPresence = function(presence, op, isOwnOp) {
  var opError = this.checkOp(op);
  if (opError) return opError;

  var type = presence.t;
  if (typeof type === 'string') {
    type = types.map[type];
  }
  if (!type) return {code: ERROR_CODE.ERR_DOC_TYPE_NOT_RECOGNIZED, message: 'Unknown type'};
  if (!util.supportsPresence(type)) {
    return {code: ERROR_CODE.ERR_TYPE_DOES_NOT_SUPPORT_PRESENCE, message: 'Type does not support presence'};
  }

  if (op.create || op.del) {
    presence.p = null;
    presence.v++;
    return;
  }

  try {
    presence.p = presence.p === null ?
      null :
      type.transformPresence(presence.p, op.op, isOwnOp);
  } catch (error) {
    return {code: ERROR_CODE.ERR_PRESENCE_TRANSFORM_FAILED, message: error.message || error};
  }

  presence.v++;
};

/**
 * json0 had a breaking change in https://github.com/ottypes/json0/pull/40
 * The change added stricter type checking, which breaks fetchSnapshot()
 * when trying to rebuild a snapshot from old, committed ops that didn't
 * have this stricter validation. This method fixes up legacy ops to
 * pass the stricter validation
 */
function normalizeLegacyJson0Ops(snapshot, json0Op) {
  if (snapshot.type !== types.defaultType.uri) return;
  var components = json0Op.op;
  if (!components) return;
  for (var i = 0; i < components.length; i++) {
    var component = components[i];
    if (typeof component.lm === 'string') component.lm = +component.lm;
    var path = component.p;
    var element = snapshot.data;
    for (var j = 0; j < path.length; j++) {
      var key = path[j];
      // https://github.com/ottypes/json0/blob/73db17e86adc5d801951d1a69453b01382e66c7d/lib/json0.js#L21
      if (Object.prototype.toString.call(element) == '[object Array]') path[j] = +key;
      // https://github.com/ottypes/json0/blob/73db17e86adc5d801951d1a69453b01382e66c7d/lib/json0.js#L32
      else if (element.constructor === Object) path[j] = key.toString();
      element = element[key];
    }
  }
}

},{"./error":27,"./types":32,"./util":33}],31:[function(require,module,exports){
module.exports = Snapshot;
function Snapshot(id, version, type, data, meta) {
  this.id = id;
  this.v = version;
  this.type = type;
  this.data = data;
  this.m = meta;
}

},{}],32:[function(require,module,exports){

exports.defaultType = require('ot-json0').type;

exports.map = {};

exports.register = function(type) {
  if (type.name) exports.map[type.name] = type;
  if (type.uri) exports.map[type.uri] = type;
};

exports.register(exports.defaultType);

},{"ot-json0":6}],33:[function(require,module,exports){
(function (process){(function (){

exports.doNothing = doNothing;
function doNothing() {}

exports.hasKeys = function(object) {
  for (var key in object) return true;
  return false;
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
exports.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
};

exports.isValidVersion = function(version) {
  if (version === null) return true;
  return exports.isInteger(version) && version >= 0;
};

exports.isValidTimestamp = function(timestamp) {
  return exports.isValidVersion(timestamp);
};

exports.MAX_SAFE_INTEGER = 9007199254740991;

exports.dig = function() {
  var obj = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var key = arguments[i];
    obj = obj[key] || (i === arguments.length - 1 ? undefined : {});
  }
  return obj;
};

exports.digOrCreate = function() {
  var obj = arguments[0];
  var createCallback = arguments[arguments.length - 1];
  for (var i = 1; i < arguments.length - 1; i++) {
    var key = arguments[i];
    obj = obj[key] ||
      (obj[key] = i === arguments.length - 2 ? createCallback() : {});
  }
  return obj;
};

exports.digAndRemove = function() {
  var obj = arguments[0];
  var objects = [obj];
  for (var i = 1; i < arguments.length - 1; i++) {
    var key = arguments[i];
    if (!obj.hasOwnProperty(key)) break;
    obj = obj[key];
    objects.push(obj);
  };

  for (var i = objects.length - 1; i >= 0; i--) {
    var parent = objects[i];
    var key = arguments[i + 1];
    var child = parent[key];
    if (i === objects.length - 1 || !exports.hasKeys(child)) delete parent[key];
  }
};

exports.supportsPresence = function(type) {
  return type && typeof type.transformPresence === 'function';
};

exports.callEach = function(callbacks, error) {
  var called = false;
  callbacks.forEach(function(callback) {
    if (callback) {
      callback(error);
      called = true;
    }
  });
  return called;
};

exports.truthy = function(arg) {
  return !!arg;
};

exports.nextTick = function(callback) {
  if (typeof process !== 'undefined' && process.nextTick) {
    return process.nextTick.apply(null, arguments);
  }

  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  setTimeout(function() {
    callback.apply(null, args);
  });
};

}).call(this)}).call(this,require('_process'))
},{"_process":12}],34:[function(require,module,exports){
'use strict';

var isArray = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;

module.exports = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray(a)
      , arrB = isArray(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a!==a && b!==b;
};

},{}],35:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":12,"timers":35}]},{},[1]);


/* constants.js */
/* eslint-disable no-unused-vars */
const DEFAULT_CULLING_MASK = 0xFFFFFFFF;
const GEOMETRY_ONLY_CULLING_MASK = 1 | 2 | 4;
const GIZMO_MASK = 8;

// Layer ids
const LAYERID_WORLD = 0;
const LAYERID_DEPTH = 1;
const LAYERID_SKYBOX = 2;
const LAYERID_IMMEDIATE = 3;
const LAYERID_UI = 4;

// Layout groups
const ORIENTATION_HORIZONTAL = 0;
const ORIENTATION_VERTICAL = 1;
const FITTING_NONE = 0;
const FITTING_STRETCH = 1;
const FITTING_SHRINK = 2;
const FITTING_BOTH = 3;

// Buttons
const BUTTON_TRANSITION_MODE_TINT = 0;
const BUTTON_TRANSITION_MODE_SPRITE_CHANGE = 1;

// Scroll Views
const SCROLL_MODE_CLAMP = 0;
const SCROLL_MODE_BOUNCE = 1;
const SCROLL_MODE_INFINITE = 2;

const SCROLLBAR_VISIBILITY_SHOW_ALWAYS = 0;
const SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED = 1;


const CURVE_LINEAR = 0;
const CURVE_SMOOTHSTEP = 1;
const CURVE_CATMULL = 2;
const CURVE_CARDINAL = 3;
const CURVE_SPLINE = 4;
const CURVE_STEP = 5;

// Script Loading Type
const LOAD_SCRIPT_AS_ASSET = 0;
const LOAD_SCRIPT_BEFORE_ENGINE = 1;
const LOAD_SCRIPT_AFTER_ENGINE = 2;

// Anim system constants
const ANIM_INTERRUPTION_NONE = 'NONE';
const ANIM_INTERRUPTION_PREV = 'PREV_STATE';
const ANIM_INTERRUPTION_NEXT = 'NEXT_STATE';
const ANIM_INTERRUPTION_PREV_NEXT = 'PREV_STATE_NEXT_STATE';
const ANIM_INTERRUPTION_NEXT_PREV = 'NEXT_STATE_PREV_STATE';

const ANIM_GREATER_THAN = 'GREATER_THAN';
const ANIM_LESS_THAN = 'LESS_THAN';
const ANIM_GREATER_THAN_EQUAL_TO = 'GREATER_THAN_EQUAL_TO';
const ANIM_LESS_THAN_EQUAL_TO = 'LESS_THAN_EQUAL_TO';
const ANIM_EQUAL_TO = 'EQUAL_TO';
const ANIM_NOT_EQUAL_TO = 'NOT_EQUAL_TO';

const ANIM_PARAMETER_INTEGER = 'INTEGER';
const ANIM_PARAMETER_FLOAT = 'FLOAT';
const ANIM_PARAMETER_BOOLEAN = 'BOOLEAN';
const ANIM_PARAMETER_TRIGGER = 'TRIGGER';

const ANIM_STATE_START = 'START';
const ANIM_STATE_END = 'END';

// VERSION CONTROL
const MERGE_STATUS_AUTO_STARTED = 'merge_auto_started';
const MERGE_STATUS_AUTO_ENDED = 'merge_auto_ended';
const MERGE_STATUS_APPLY_STARTED = 'merge_apply_started';
const MERGE_STATUS_APPLY_ENDED = 'merge_apply_ended';
const MERGE_STATUS_READY_FOR_REVIEW = 'merge_ready_for_review';


// COPY-DELETE IN BACKEND
const COPY_OR_DELETE_IN_BACKEND_LIMIT = 500;


/* utils.js */
var utils = { };


// utils.deepCopy
utils.deepCopy = function deepCopy(data) {
    if (data == null || typeof(data) !== 'object')
        return data;

    if (data instanceof Array) {
        var arr = [ ];
        for(var i = 0; i < data.length; i++) {
            arr[i] = deepCopy(data[i]);
        }
        return arr;
    } else {
        var obj = { };
        for(var key in data) {
            if (data.hasOwnProperty(key))
                obj[key] = deepCopy(data[key]);
        }
        return obj;
    }
};

utils.isMobile = function() {
  return /Android/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/**
 * @name utils.implements
 * @description Adds properties and methods from the sourceClass
 * to the targetClass but only if properties with the same name do not
 * already exist in the targetClass.
 * @param {Object} targetClass The target class.
 * @param {Object} sourceClass The source class.
 * @example utils.implements(pcui.Container, pcui.IContainer);
 */
utils.implements = function (targetClass, sourceClass) {
    var properties = Object.getOwnPropertyDescriptors(sourceClass.prototype);
    for (var key in properties) {
        if (targetClass.prototype.hasOwnProperty(key)) {
            delete properties[key];
        }
    }

    Object.defineProperties(targetClass.prototype, properties);
};

/**
 * @name utils.proxy
 * @description Creates new properties on the target class that get / set
 * the properties of the member.
 * @param {Object} targetClass The target class
 * @param {String} memberName The name of the member of the target class that properties will be proxied to.
 * @param {String[]} properties A list of properties to be proxied.
 * @example utils.proxy(pcui.SliderInput, '_numericInput', ['max', 'min', 'placeholder'])
 */
utils.proxy = function (targetClass, memberName, properties) {
    properties.forEach(property => {
        Object.defineProperty(targetClass.prototype, property, {
            get: function () {
                return this[memberName][property];
            },
            set: function (value) {
                this[memberName][property] = value;
            }
        });
    });
};

// String.startsWith
if (! String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(str) {
            var that = this;
            var ceil = str.length;
            for(var i = 0; i < ceil; i++)
                if(that[i] !== str[i]) return false;
            return true;
        }
    });
}

// String.endsWith polyfill
if (! String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(str) {
            var that = this;
            for(var i = 0, ceil = str.length; i < ceil; i++)
                if (that[i + that.length - ceil] !== str[i])
                    return false;
            return true;
        }
    });
}

// Appends query parameter to string (supposedly the string is a URL)
// automatically figuring out if the separator should be ? or &.
// Example: url.appendQuery('t=123').appendQuery('q=345');
if (! String.prototype.appendQuery) {
    Object.defineProperty(String.prototype, 'appendQuery', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (queryParameter) {
            var separator = this.indexOf('?') !== -1 ? '&' : '?';
            return this + separator + queryParameter;
        }
    });
}

// element.classList.add polyfill
(function () {
    /*global DOMTokenList */
    var dummy  = document.createElement('div'),
        dtp    = DOMTokenList.prototype,
        toggle = dtp.toggle,
        add    = dtp.add,
        rem    = dtp.remove;

    dummy.classList.add('class1', 'class2');

    // Older versions of the HTMLElement.classList spec didn't allow multiple
    // arguments, easy to test for
    if (!dummy.classList.contains('class2')) {
        dtp.add    = function () {
            Array.prototype.forEach.call(arguments, add.bind(this));
        };
        dtp.remove = function () {
            Array.prototype.forEach.call(arguments, rem.bind(this));
        };
    }
})();

var bytesToHuman = function(bytes) {
    if (isNaN(bytes) || bytes === 0) return '0 B';
    var k = 1000;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
};


// todo move this into proper library

// replace the oldExtension in a path with the newExtension
// return the new path
// oldExtension and newExtension should have leading period
var swapExtension = function (path, oldExtension, newExtension) {
    while(path.indexOf(oldExtension) >= 0) {
        path = path.replace(oldExtension, newExtension);
    }
    return path;
};


/* ajax.js */
function Ajax(args) {
    if (typeof(args) === 'string')
        args = { url: args };

    return new AjaxRequest(args);
};

Ajax.get = function(url) {
    return new AjaxRequest({
        url: url
    });
};

Ajax.post = function(url, data) {
    return new AjaxRequest({
        method: 'POST',
        url: url,
        data: data
    });
};

Ajax.put = function(url, data) {
    return new AjaxRequest({
        method: 'PUT',
        url: url,
        data: data
    });
};

Ajax.delete = function(url) {
    return new AjaxRequest({
        method: 'DELETE',
        url: url
    });
};

Ajax.params = { };

Ajax.param = function(name, value) {
    Ajax.params[name] = value;
};



function AjaxRequest(args) {
    if (! args)
        throw new Error('no arguments provided');

    Events.call(this);

    // progress
    this._progress = 0.0;
    this.emit('progress', this._progress);

    // xhr
    this._xhr = new XMLHttpRequest();

    // send cookies
    if (args.cookies)
        this._xhr.withCredentials = true;

    // events
    this._xhr.addEventListener('load', this._onLoad.bind(this), false);
    // this._xhr.addEventListener('progress', this._onProgress.bind(this), false);
    this._xhr.upload.addEventListener('progress', this._onProgress.bind(this), false);
    this._xhr.addEventListener('error', this._onError.bind(this), false);
    this._xhr.addEventListener('abort', this._onAbort.bind(this), false);

    // url
    var url = args.url;

    // query
    if (args.query && Object.keys(args.query).length) {
        if (url.indexOf('?') === -1) {
            url += '?';
        }

        var query = [ ];
        for(var key in args.query) {
            query.push(key + '=' + args.query[key]);
        }

        url += query.join('&');
    }

    // templating
    var parts = url.split('{{');
    if (parts.length > 1) {
        for(var i = 1; i < parts.length; i++) {
            var ends = parts[i].indexOf('}}');
            var key = parts[i].slice(0, ends);

            if (Ajax.params[key] === undefined)
                continue;

            // replace
            parts[i] = Ajax.params[key] + parts[i].slice(ends + 2);
        }

        url = parts.join('');
    }

    // open request
    this._xhr.open(args.method || 'GET', url, true);

    this.notJson = args.notJson || false;

    // header for PUT/POST
    if (! args.ignoreContentType && (args.method === 'PUT' || args.method === 'POST' || args.method === 'DELETE'))
        this._xhr.setRequestHeader('Content-Type', 'application/json');

    if (args.auth && config.accessToken) {
        this._xhr.setRequestHeader('Authorization', 'Bearer ' + config.accessToken);
    }

    if (args.headers) {
        for (var key in args.headers)
            this._xhr.setRequestHeader(key, args.headers[key]);
    }

    // stringify data if needed
    if (args.data && typeof(args.data) !== 'string' && ! (args.data instanceof FormData)) {
        args.data = JSON.stringify(args.data);
    }

    // make request
    this._xhr.send(args.data || null);
};
AjaxRequest.prototype = Object.create(Events.prototype);


AjaxRequest.prototype._onLoad = function() {
    this._progress = 1.0;
    this.emit('progress', 1.0);

    if (this._xhr.status === 200 || this._xhr.status === 201) {
        if (this.notJson) {
            this.emit('load', this._xhr.status, this._xhr.responseText);
        } else {
            try {
                var json = JSON.parse(this._xhr.responseText);
            } catch(ex) {
                this.emit('error', this._xhr.status || 0, new Error('invalid json'));
                return;
            }
            this.emit('load', this._xhr.status, json);
        }
    } else {
        try {
            var json = JSON.parse(this._xhr.responseText);
            var msg = json.message;
            if (! msg) {
                msg = json.error || (json.response && json.response.error);
            }

            if (! msg) {
                msg = this._xhr.responseText;
            }

            this.emit('error', this._xhr.status, msg);
        } catch (ex) {
            this.emit('error', this._xhr.status);
        }
    }
};


AjaxRequest.prototype._onError = function(evt) {
    this.emit('error', 0, evt);
};


AjaxRequest.prototype._onAbort = function(evt) {
    this.emit('error', 0, evt);
};


AjaxRequest.prototype._onProgress = function(evt) {
    if (! evt.lengthComputable)
        return;

    var progress = evt.loaded / evt.total;

    if (progress !== this._progress) {
        this._progress = progress;
        this.emit('progress', this._progress);
    }
};


AjaxRequest.prototype.abort = function() {
    this._xhr.abort();
};


/* array.js */
Object.defineProperty(Array.prototype, 'equals', {
    enumerable: false,
    value: function(array) {
        if (! array)
            return false;

        if (this.length !== array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] instanceof Array && array[i] instanceof Array) {
                if (! this[i].equals(array[i]))
                    return false;
            } else if (this[i] !== array[i]) {
                return false;
            }
        }
        return true;
    }
});


/* observer.js */
"use strict";

function Observer(data, options) {
    Events.call(this);
    options = options || { };

    this._destroyed = false;
    this._path = '';
    this._keys = [ ];
    this._data = { };

    // array paths where duplicate entries are allowed - normally
    // we check if an array already has a value before inserting it
    // but if the array path is in here we'll allow it
    this._pathsWithDuplicates = null;
    if (options.pathsWithDuplicates) {
        this._pathsWithDuplicates = {};
        for (var i = 0; i < options.pathsWithDuplicates.length; i++) {
            this._pathsWithDuplicates[options.pathsWithDuplicates[i]] = true;
        }
    }

    this.patch(data);

    this._parent = options.parent || null;
    this._parentPath = options.parentPath || '';
    this._parentField = options.parentField || null;
    this._parentKey = options.parentKey || null;

    this._latestFn = options.latestFn || null;

    this._silent = false;

    var propagate = function(evt) {
        return function(path, arg1, arg2, arg3) {
            if (! this._parent)
                return;

            var key = this._parentKey;
            if (! key && (this._parentField instanceof Array)) {
                key = this._parentField.indexOf(this);

                if (key === -1)
                    return;
            }

            path = this._parentPath + '.' + key + '.' + path;

            var state;
            if (this._silent)
                state = this._parent.silence();

            this._parent.emit(path + ':' + evt, arg1, arg2, arg3);
            this._parent.emit('*:' + evt, path, arg1, arg2, arg3);

            if (this._silent)
                this._parent.silenceRestore(state);
        }
    };

    // propagate set
    this.on('*:set', propagate('set'));
    this.on('*:unset', propagate('unset'));
    this.on('*:insert', propagate('insert'));
    this.on('*:remove', propagate('remove'));
    this.on('*:move', propagate('move'));
}

// cache calls to path.split(path, '.')
// as they take considerable time especially during loading
// if there are a lot of observers like entities, assets etc.
Observer._splitPathsCache = {};
Observer._splitPath = function (path) {
    var cache = Observer._splitPathsCache;
    var result = cache[path];
    if (!result) {
        result = path.split('.');
        cache[path] = result;
    } else {
        result = result.slice();
    }

    return result;
};

Observer.prototype = Object.create(Events.prototype);


Observer.prototype.silence = function() {
    this._silent = true;

    // history hook to prevent array values to be recorded
    var historyState = this.history && this.history.enabled;
    if (historyState)
        this.history.enabled = false;

    // sync hook to prevent array values to be recorded as array root already did
    var syncState = this.sync && this.sync.enabled;
    if (syncState)
        this.sync.enabled = false;

    return [ historyState, syncState ];
};


Observer.prototype.silenceRestore = function(state) {
    this._silent = false;

    if (state[0])
        this.history.enabled = true;

    if (state[1])
        this.sync.enabled = true;
};


Observer.prototype._prepare = function(target, key, value, silent, remote) {
    var self = this;
    var state;
    var path = (target._path ? (target._path + '.') : '') + key;
    var type = typeof(value);

    target._keys.push(key);

    if (type === 'object' && (value instanceof Array)) {
        target._data[key] = value.slice(0);

        for(var i = 0; i < target._data[key].length; i++) {
            if (typeof(target._data[key][i]) === 'object' && target._data[key][i] !== null) {
                if (target._data[key][i] instanceof Array) {
                    target._data[key][i].slice(0);
                } else {
                    target._data[key][i] = new Observer(target._data[key][i], {
                        parent: this,
                        parentPath: path,
                        parentField: target._data[key],
                        parentKey: null
                    });
                }
            } else {
                state = this.silence();
                this.emit(path + '.' + i + ':set', target._data[key][i], null, remote);
                this.emit('*:set', path + '.' + i, target._data[key][i], null, remote);
                this.silenceRestore(state);
            }
        }

        if (silent)
            state = this.silence();

        this.emit(path + ':set', target._data[key], null, remote);
        this.emit('*:set', path, target._data[key], null, remote);

        if (silent)
            this.silenceRestore(state);
    } else if (type === 'object' && (value instanceof Object)) {
        if (typeof(target._data[key]) !== 'object') {
            target._data[key] = {
                _path: path,
                _keys: [ ],
                _data: { }
            };
        }

        for(var i in value) {
            if (typeof(value[i]) === 'object') {
                this._prepare(target._data[key], i, value[i], true, remote);
            } else {
                state = this.silence();

                target._data[key]._data[i] = value[i];
                target._data[key]._keys.push(i);

                this.emit(path + '.' + i + ':set', value[i], null, remote);
                this.emit('*:set', path + '.' + i, value[i], null, remote);

                this.silenceRestore(state);
            }
        }

        if (silent)
            state = this.silence();

        // passing undefined as valueOld here
        // but we should get the old value to be consistent
        this.emit(path + ':set', value, undefined, remote);
        this.emit('*:set', path, value, undefined, remote);

        if (silent)
            this.silenceRestore(state);
    } else {
        if (silent)
            state = this.silence();

        target._data[key] = value;

        this.emit(path + ':set', value, undefined, remote);
        this.emit('*:set', path, value, undefined, remote);

        if (silent)
            this.silenceRestore(state);
    }

    return true;
};


Observer.prototype.set = function(path, value, silent, remote, force) {
    var keys = Observer._splitPath(path);
    var length = keys.length;
    var key = keys[length - 1];
    var node = this;
    var nodePath = '';
    var obj = this;
    var state;

    for(var i = 0; i < length - 1; i++) {
        if (node instanceof Array) {
            node = node[keys[i]];

            if (node instanceof Observer) {
                path = keys.slice(i + 1).join('.');
                obj = node;
            }
        } else {
            if (i < length && typeof(node._data[keys[i]]) !== 'object') {
                if (node._data[keys[i]])
                    obj.unset((node.__path ? node.__path + '.' : '') + keys[i]);

                node._data[keys[i]] = {
                    _path: path,
                    _keys: [ ],
                    _data: { }
                };
                node._keys.push(keys[i]);
            }

            if (i === length - 1 && node.__path)
                nodePath = node.__path + '.' + keys[i];

            node = node._data[keys[i]];
        }
    }

    if (node instanceof Array) {
        var ind = parseInt(key, 10);
        if (node[ind] === value && !force)
            return;

        var valueOld = node[ind];
        if (valueOld instanceof Observer) {
            valueOld = valueOld.json();
        } else {
            valueOld = obj.json(valueOld);
        }

        node[ind] = value;

        if (value instanceof Observer) {
            value._parent = obj;
            value._parentPath = nodePath;
            value._parentField = node;
            value._parentKey = null;
        }

        if (silent)
            state = obj.silence();

        obj.emit(path + ':set', value, valueOld, remote);
        obj.emit('*:set', path, value, valueOld, remote);

        if (silent)
            obj.silenceRestore(state);

        return true;
    } else if (node._data && ! node._data.hasOwnProperty(key)) {
        if (typeof(value) === 'object') {
            return obj._prepare(node, key, value, false, remote);
        } else {
            node._data[key] = value;
            node._keys.push(key);

            if (silent)
                state = obj.silence();

            obj.emit(path + ':set', value, null, remote);
            obj.emit('*:set', path, value, null, remote);

            if (silent)
                obj.silenceRestore(state);

            return true;
        }
    } else {
        if (typeof(value) === 'object' && (value instanceof Array)) {
            if (value.equals(node._data[key]) && !force)
                return false;

            var valueOld = node._data[key];
            if (! (valueOld instanceof Observer))
                valueOld = obj.json(valueOld);

            if (node._data[key] && node._data[key].length === value.length) {
                state = obj.silence();

                // handle new array instance
                if (value.length === 0) {
                    node._data[key] = value;
                }

                for(var i = 0; i < node._data[key].length; i++) {
                    if (node._data[key][i] instanceof Observer) {
                        node._data[key][i].patch(value[i], true);
                    } else if (node._data[key][i] !== value[i]) {
                        node._data[key][i] = value[i];
                        obj.emit(path + '.' + i + ':set', node._data[key][i], valueOld && valueOld[i] || null, remote);
                        obj.emit('*:set', path + '.' + i, node._data[key][i], valueOld && valueOld[i] || null, remote);
                    }
                }

                obj.silenceRestore(state);
            } else {
                node._data[key] = [];
                value.forEach(val => {
                    this._doInsert(node, key, val, undefined, true);
                });

                state = obj.silence();

                for(var i = 0; i < node._data[key].length; i++) {
                    obj.emit(path + '.' + i + ':set', node._data[key][i], valueOld && valueOld[i] || null, remote);
                    obj.emit('*:set', path + '.' + i, node._data[key][i], valueOld && valueOld[i] || null, remote);
                }
                obj.silenceRestore(state);
            }

            if (silent)
                state = obj.silence();

            obj.emit(path + ':set', value, valueOld, remote);
            obj.emit('*:set', path, value, valueOld, remote);

            if (silent)
                obj.silenceRestore(state);

            return true;
        } else if (typeof(value) === 'object' && (value instanceof Object)) {
            var changed = false;
            var valueOld = node._data[key];
            if (! (valueOld instanceof Observer))
                valueOld = obj.json(valueOld);

            var keys = Object.keys(value);

            if (! node._data[key] || ! node._data[key]._data) {
                if (node._data[key]) {
                    obj.unset((node.__path ? node.__path + '.' : '') + key);
                } else {
                    changed = true;
                }

                node._data[key] = {
                    _path: path,
                    _keys: [ ],
                    _data: { }
                };
            }

            for(var n in node._data[key]._data) {
                if (! value.hasOwnProperty(n)) {
                    var c = obj.unset(path + '.' + n, true);
                    if (c) changed = true;
                } else if (node._data[key]._data.hasOwnProperty(n)) {
                    if (! obj._equals(node._data[key]._data[n], value[n])) {
                        var c = obj.set(path + '.' + n, value[n], true);
                        if (c) changed = true;
                    }
                } else {
                    var c = obj._prepare(node._data[key], n, value[n], true, remote);
                    if (c) changed = true;
                }
            }

            for(var i = 0; i < keys.length; i++) {
                if (value[keys[i]] === undefined && node._data[key]._data.hasOwnProperty(keys[i])) {
                    var c = obj.unset(path + '.' + keys[i], true);
                    if (c) changed = true;
                } else if (typeof(value[keys[i]]) === 'object') {
                    if (node._data[key]._data.hasOwnProperty(keys[i])) {
                        var c = obj.set(path + '.' + keys[i], value[keys[i]], true);
                        if (c) changed = true;
                    } else {
                        var c = obj._prepare(node._data[key], keys[i], value[keys[i]], true, remote);
                        if (c) changed = true;
                    }
                } else if (! obj._equals(node._data[key]._data[keys[i]], value[keys[i]])) {
                    if (typeof(value[keys[i]]) === 'object') {
                        var c = obj.set(node._data[key]._path + '.' + keys[i], value[keys[i]], true);
                        if (c) changed = true;
                    } else if (node._data[key]._data[keys[i]] !== value[keys[i]]) {
                        changed = true;

                        if (node._data[key]._keys.indexOf(keys[i]) === -1)
                            node._data[key]._keys.push(keys[i]);

                        node._data[key]._data[keys[i]] = value[keys[i]];

                        state = obj.silence();
                        obj.emit(node._data[key]._path + '.' + keys[i] + ':set', node._data[key]._data[keys[i]], null, remote);
                        obj.emit('*:set', node._data[key]._path + '.' + keys[i], node._data[key]._data[keys[i]], null, remote);
                        obj.silenceRestore(state);
                    }
                }
            }

            if (changed) {
                if (silent)
                    state = obj.silence();

                var val = obj.json(node._data[key]);

                obj.emit(node._data[key]._path + ':set', val, valueOld, remote);
                obj.emit('*:set', node._data[key]._path, val, valueOld, remote);

                if (silent)
                    obj.silenceRestore(state);

                return true;
            } else {
                return false;
            }
        } else {
            var data;
            if (! node.hasOwnProperty('_data') && node.hasOwnProperty(key)) {
                data = node;
            } else {
                data = node._data;
            }

            if (data[key] === value && !force)
                return false;

            if (silent)
                state = obj.silence();

            var valueOld = data[key];
            if (! (valueOld instanceof Observer))
                valueOld = obj.json(valueOld);

            data[key] = value;

            obj.emit(path + ':set', value, valueOld, remote);
            obj.emit('*:set', path, value, valueOld, remote);

            if (silent)
                obj.silenceRestore(state);

            return true;
        }
    }

    return false;
};


Observer.prototype.has = function(path) {
    var keys = Observer._splitPath(path);
    var node = this;
    for (var i = 0, len = keys.length; i < len; i++) {
        if (node == undefined)
            return undefined;

        if (node._data) {
            node = node._data[keys[i]];
        } else {
            node = node[keys[i]];
        }
    }

    return node !== undefined;
};


Observer.prototype.get = function(path, raw) {
    var keys = Observer._splitPath(path);
    var node = this;
    for (var i = 0; i < keys.length; i++) {
        if (node == undefined)
            return undefined;

        if (node._data) {
            node = node._data[keys[i]];
        } else {
            node = node[keys[i]];
        }
    }

    if (raw)
        return node;

    if (node == null) {
        return null;
    } else {
        return this.json(node);
    }
};


Observer.prototype.getRaw = function(path) {
    return this.get(path, true);
};


Observer.prototype._equals = function(a, b) {
    if (a === b) {
        return true;
    } else if (a instanceof Array && b instanceof Array && a.equals(b)) {
        return true;
    } else {
        return false;
    }
};


Observer.prototype.unset = function(path, silent, remote) {
    var keys = Observer._splitPath(path);
    var key = keys[keys.length - 1];
    var node = this;
    var obj = this;

    for(var i = 0; i < keys.length - 1; i++) {
        if (node instanceof Array) {
            node = node[keys[i]];
            if (node instanceof Observer) {
                path = keys.slice(i + 1).join('.');
                obj = node;
            }
        } else {
            node = node._data[keys[i]];
        }
    }

    if (! node._data || ! node._data.hasOwnProperty(key))
        return false;

    var valueOld = node._data[key];
    if (! (valueOld instanceof Observer))
        valueOld = obj.json(valueOld);

    // recursive
    if (node._data[key] && node._data[key]._data) {
        // do this in reverse order because node._data[key]._keys gets
        // modified as we loop
        for(var i = node._data[key]._keys.length - 1; i >= 0; i--) {
            obj.unset(path + '.' + node._data[key]._keys[i], true);
        }
    }

    node._keys.splice(node._keys.indexOf(key), 1);
    delete node._data[key];

    var state;
    if (silent)
        state = obj.silence();

    obj.emit(path + ':unset', valueOld, remote);
    obj.emit('*:unset', path, valueOld, remote);

    if (silent)
        obj.silenceRestore(state);

    return true;
};


Observer.prototype.remove = function(path, ind, silent, remote) {
    var keys = Observer._splitPath(path);
    var key = keys[keys.length - 1];
    var node = this;
    var obj = this;

    for(var i = 0; i < keys.length - 1; i++) {
        if (node instanceof Array) {
            node = node[parseInt(keys[i], 10)];
            if (node instanceof Observer) {
                path = keys.slice(i + 1).join('.');
                obj = node;
            }
        } else if (node._data && node._data.hasOwnProperty(keys[i])) {
            node = node._data[keys[i]];
        } else {
            return;
        }
    }

    if (! node._data || ! node._data.hasOwnProperty(key) || ! (node._data[key] instanceof Array))
        return;

    var arr = node._data[key];
    if (arr.length < ind)
        return;

    var value = arr[ind];
    if (value instanceof Observer) {
        value._parent = null;
    } else {
        value = obj.json(value);
    }

    arr.splice(ind, 1);

    var state;
    if (silent)
        state = obj.silence();

    obj.emit(path + ':remove', value, ind, remote);
    obj.emit('*:remove', path, value, ind, remote);

    if (silent)
        obj.silenceRestore(state);

    return true;
};


Observer.prototype.removeValue = function(path, value, silent, remote) {
    var keys = Observer._splitPath(path);
    var key = keys[keys.length - 1];
    var node = this;
    var obj = this;

    for(var i = 0; i < keys.length - 1; i++) {
        if (node instanceof Array) {
            node = node[parseInt(keys[i], 10)];
            if (node instanceof Observer) {
                path = keys.slice(i + 1).join('.');
                obj = node;
            }
        } else if (node._data && node._data.hasOwnProperty(keys[i])) {
            node = node._data[keys[i]];
        } else {
            return;
        }
    }

    if (! node._data || ! node._data.hasOwnProperty(key) || ! (node._data[key] instanceof Array))
        return;

    var arr = node._data[key];

    var ind = arr.indexOf(value);
    if (ind === -1) {
        return;
    }

    if (arr.length < ind)
        return;

    var value = arr[ind];
    if (value instanceof Observer) {
        value._parent = null;
    } else {
        value = obj.json(value);
    }

    arr.splice(ind, 1);

    var state;
    if (silent)
        state = obj.silence();

    obj.emit(path + ':remove', value, ind, remote);
    obj.emit('*:remove', path, value, ind, remote);

    if (silent)
        obj.silenceRestore(state);

    return true;
};


Observer.prototype.insert = function(path, value, ind, silent, remote) {
    var keys = Observer._splitPath(path);
    var key = keys[keys.length - 1];
    var node = this;
    var obj = this;

    for(var i = 0; i < keys.length - 1; i++) {
        if (node instanceof Array) {
            node = node[parseInt(keys[i], 10)];
            if (node instanceof Observer) {
                path = keys.slice(i + 1).join('.');
                obj = node;
            }
        } else if (node._data && node._data.hasOwnProperty(keys[i])) {
            node = node._data[keys[i]];
        } else {
            return;
        }
    }

    if (! node._data || ! node._data.hasOwnProperty(key) || ! (node._data[key] instanceof Array))
        return;

    var arr = node._data[key];

    value = obj._doInsert(node, key, value, ind);

    if (ind === undefined) {
        ind = arr.length - 1;
    }

    var state;
    if (silent)
        state = obj.silence();

    obj.emit(path + ':insert', value, ind, remote);
    obj.emit('*:insert', path, value, ind, remote);

    if (silent)
        obj.silenceRestore(state);

    return true;
};

Observer.prototype._doInsert = function(node, key, value, ind, allowDuplicates) {
    const arr = node._data[key];

    if (typeof(value) === 'object' && ! (value instanceof Observer) && value !== null) {
        if (value instanceof Array) {
            value = value.slice(0);
        } else {
            value = new Observer(value);
        }
    }

    const path = node._path ? `${node._path}.${key}` : key;
    if (value !== null && !allowDuplicates && (!this._pathsWithDuplicates || !this._pathsWithDuplicates[path])) {
        if (arr.indexOf(value) !== -1) {
            return;
        }
    }


    if (ind === undefined) {
        arr.push(value);
    } else {
        arr.splice(ind, 0, value);
    }

    if (value instanceof Observer) {
        value._parent = this;
        value._parentPath = path;
        value._parentField = arr;
        value._parentKey = null;
    } else {
        value = this.json(value);
    }

    return value;
};

Observer.prototype.move = function(path, indOld, indNew, silent, remote) {
    var keys = Observer._splitPath(path);
    var key = keys[keys.length - 1];
    var node = this;
    var obj = this;

    for(var i = 0; i < keys.length - 1; i++) {
        if (node instanceof Array) {
            node = node[parseInt(keys[i], 10)];
            if (node instanceof Observer) {
                path = keys.slice(i + 1).join('.');
                obj = node;
            }
        } else if (node._data && node._data.hasOwnProperty(keys[i])) {
            node = node._data[keys[i]];
        } else {
            return;
        }
    }

    if (! node._data || ! node._data.hasOwnProperty(key) || ! (node._data[key] instanceof Array))
        return;

    var arr = node._data[key];

    if (arr.length < indOld || arr.length < indNew || indOld === indNew)
        return;

    var value = arr[indOld];

    arr.splice(indOld, 1);

    if (indNew === -1)
        indNew = arr.length;

    arr.splice(indNew, 0, value);

    if (! (value instanceof Observer))
        value = obj.json(value);

    var state;
    if (silent)
        state = obj.silence();

    obj.emit(path + ':move', value, indNew, indOld, remote);
    obj.emit('*:move', path, value, indNew, indOld, remote);

    if (silent)
        obj.silenceRestore(state);

    return true;
};


Observer.prototype.patch = function(data, removeMIssingKeys) {
    if (typeof(data) !== 'object')
        return;

    for(var key in data) {
        if (typeof(data[key]) === 'object' && ! this._data.hasOwnProperty(key)) {
            this._prepare(this, key, data[key]);
        } else if (this._data[key] !== data[key]) {
            this.set(key, data[key]);
        }
    }

    if (removeMIssingKeys) {
        for (var key in this._data) {
            if (!data.hasOwnProperty(key)) {
                this.unset(key);
            }
        }
    }
};


Observer.prototype.json = function(target) {
    var obj = { };
    var node = target === undefined ? this : target;
    var len, nlen;

    if (node instanceof Object && node._keys) {
        len = node._keys.length;
        for (var i = 0; i < len; i++) {
            var key = node._keys[i];
            var value = node._data[key];
            var type = typeof(value);

            if (type === 'object' && (value instanceof Array)) {
                obj[key] = value.slice(0);

                nlen = obj[key].length;
                for(var n = 0; n < nlen; n++) {
                    if (typeof(obj[key][n]) === 'object')
                        obj[key][n] = this.json(obj[key][n]);
                }
            } else if (type === 'object' && (value instanceof Object)) {
                obj[key] = this.json(value);
            } else {
                obj[key] = value;
            }
        }
    } else {
        if (node === null) {
            return null;
        } else if (typeof(node) === 'object' && (node instanceof Array)) {
            obj = node.slice(0);

            len = obj.length;
            for(var n = 0; n < len; n++) {
                obj[n] = this.json(obj[n]);
            }
        } else if (typeof(node) === 'object') {
            for(var key in node) {
                if (node.hasOwnProperty(key))
                    obj[key] = node[key];
            }
        } else {
            obj = node;
        }
    }
    return obj;
};


Observer.prototype.forEach = function(fn, target, path) {
    var node = target || this;
    path = path || '';

    for (var i = 0; i < node._keys.length; i++) {
        var key = node._keys[i];
        var value = node._data[key];
        var type = (this.schema && this.schema.has(path + key) && this.schema.get(path + key).type.name.toLowerCase()) || typeof(value);

        if (type === 'object' && (value instanceof Array)) {
            fn(path + key, 'array', value, key);
        } else if (type === 'object' && (value instanceof Object)) {
            fn(path + key, 'object', value, key);
            this.forEach(fn, value, path + key + '.');
        } else {
            fn(path + key, type, value, key);
        }
    }
};

/**
 * Returns the latest observer instance. This is important when
 * dealing with undo / redo where the observer might have been deleted
 * and/or possibly re-created.
 * @returns {Observer} The latest instance of the observer.
 */
Observer.prototype.latest = function () {
    return this._latestFn ? this._latestFn() : this;
};

Observer.prototype.destroy = function() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.emit('destroy');
    this.unbind();
};

Object.defineProperty(Observer.prototype, 'latestFn', {
    get: function () {
        return this._latestFn;
    },
    set: function (value) {
        this._latestFn = value;
    }
});


/* observer-list.js */
"use strict";

function ObserverList(options) {
    Events.call(this);
    options = options || { };

    this.data = [ ];
    this._indexed = { };
    this.sorted = options.sorted || null;
    this.index = options.index || null;
}

ObserverList.prototype = Object.create(Events.prototype);


Object.defineProperty(ObserverList.prototype, 'length', {
    get: function() {
        return this.data.length;
    }
});


ObserverList.prototype.get = function(index) {
    if (this.index) {
        return this._indexed[index] || null;
    } else {
        return this.data[index] || null;
    }
};


ObserverList.prototype.set = function(index, value) {
    if (this.index) {
        this._indexed[index] = value;
    } else {
        this.data[index] = value;
    }
};


ObserverList.prototype.indexOf = function(item) {
    if (this.index) {
        var index = (item instanceof Observer && item.get(this.index)) || item[this.index]
        return (this._indexed[index] && index) || null;
    } else {
        var ind = this.data.indexOf(item);
        return ind !== -1 ? ind : null;
    }
};


ObserverList.prototype.position = function(b, fn) {
    var l = this.data;
    var min = 0;
    var max = l.length - 1;
    var cur;
    var a, i;
    fn = fn || this.sorted;

    while (min <= max) {
        cur = Math.floor((min + max) / 2);
        a = l[cur];

        i = fn(a, b);

        if (i === 1) {
            max = cur - 1;
        } else if (i === -1) {
            min = cur + 1;
        } else {
            return cur;
        }
    }

    return -1;
};


ObserverList.prototype.positionNextClosest = function(b, fn) {
    var l = this.data;
    var min = 0;
    var max = l.length - 1;
    var cur;
    var a, i;
    fn = fn || this.sorted;

    if (l.length === 0)
        return -1;

    if (fn(l[0], b) === 0)
        return 0;

    while (min <= max) {
        cur = Math.floor((min + max) / 2);
        a = l[cur];

        i = fn(a, b);

        if (i === 1) {
            max = cur - 1;
        } else if (i === -1) {
            min = cur + 1;
        } else {
            return cur;
        }
    }

    if (fn(a, b) === 1)
        return cur;

    if ((cur + 1) === l.length)
        return -1;

    return cur + 1;
};


ObserverList.prototype.has = function(item) {
    if (this.index) {
        var index = (item instanceof Observer && item.get(this.index)) || item[this.index]
        return !! this._indexed[index];
    } else {
        return this.data.indexOf(item) !== -1;
    }
};


ObserverList.prototype.add = function(item) {
    if (this.has(item))
        return null;

    var index = this.data.length;
    if (this.index) {
        index = (item instanceof Observer && item.get(this.index)) || item[this.index];
        this._indexed[index] = item;
    }

    var pos = 0;

    if (this.sorted) {
        pos = this.positionNextClosest(item);
        if (pos !== -1) {
            this.data.splice(pos, 0, item);
        } else {
            this.data.push(item);
        }
    } else {
        this.data.push(item);
        pos = this.data.length - 1;
    }

    this.emit('add', item, index, pos);
    if (this.index) {
        const id = item.get(this.index);
        if (id) {
            this.emit(`add[${id}]`, item, index, pos)
        }
    }

    return pos;
};


ObserverList.prototype.move = function(item, pos) {
    var ind = this.data.indexOf(item);
    this.data.splice(ind, 1);
    if (pos === -1) {
        this.data.push(item);
    } else {
        this.data.splice(pos, 0, item);
    }

    this.emit('move', item, pos);
};


ObserverList.prototype.remove = function(item) {
    if (! this.has(item))
        return;

    var ind = this.data.indexOf(item);

    var index = ind;
    if (this.index) {
        index = (item instanceof Observer && item.get(this.index)) || item[this.index];
        delete this._indexed[index];
    }

    this.data.splice(ind, 1);

    this.emit('remove', item, index);
};


ObserverList.prototype.removeByKey = function(index) {
    if (this.index) {
        var item = this._indexed[index];

        if (! item)
            return;

        var ind = this.data.indexOf(item);
        this.data.splice(ind, 1);

        delete this._indexed[index];

        this.emit('remove', item, ind);
    } else {
        if (this.data.length < index)
            return;

        var item = this.data[index];

        this.data.splice(index, 1);

        this.emit('remove', item, index);
    }
};


ObserverList.prototype.removeBy = function(fn) {
    var i = this.data.length;
    while(i--) {
        if (! fn(this.data[i]))
            continue;

        if (this.index) {
            delete this._indexed[this.data[i][this.index]];
        }
        this.data.splice(i, 1);

        this.emit('remove', this.data[i], i);
    }
};


ObserverList.prototype.clear = function() {
    var items = this.data.slice(0);

    this.data = [ ];
    this._indexed = { };

    var i = items.length;
    while(i--) {
        this.emit('remove', items[i], i);
    }
};


ObserverList.prototype.forEach = function(fn) {
    for(var i = 0; i < this.data.length; i++) {
        fn(this.data[i], (this.index && this.data[i][this.index]) || i);
    }
};


ObserverList.prototype.find = function(fn) {
    var items = [ ];
    for(var i = 0; i < this.data.length; i++) {
        if (! fn(this.data[i]))
            continue;

        var index = i;
        if (this.index)
            index = this.data[i][this.index];

        items.push([ index, this.data[i] ]);
    }
    return items;
};


ObserverList.prototype.findOne = function(fn) {
    for(var i = 0; i < this.data.length; i++) {
        if (! fn(this.data[i]))
            continue;

        var index = i;
        if (this.index)
            index = this.data[i][this.index];

        return [ index, this.data[i] ];
    }
    return null;
};


ObserverList.prototype.map = function(fn) {
    return this.data.map(fn);
};


ObserverList.prototype.sort = function(fn) {
    this.data.sort(fn);
};


ObserverList.prototype.array = function() {
    return this.data.slice(0);
};


ObserverList.prototype.json = function() {
    var items = this.array();
    for(var i = 0; i < items.length; i++) {
        if (items[i] instanceof Observer) {
            items[i] = items[i].json();
        }
    }
    return items;
};


/* observer-sync.js */
function ObserverSync(args) {
    Events.call(this);
    args = args || { };

    this.item = args.item;
    this._enabled = args.enabled || true;
    this._prefix = args.prefix || [ ];
    this._paths = args.paths || null;
    this._sync = args.sync || true;

    this._initialize();
}
ObserverSync.prototype = Object.create(Events.prototype);


ObserverSync.prototype._initialize = function() {
    var self = this;
    var item = this.item;

    // object/array set
    item.on('*:set', function(path, value, valueOld) {
        if (! self._enabled) return;

        // if this happens it's a bug
        if (item.sync !== self) {
            log.error('Garbage Observer Sync still pointing to item', item);
        }

        // check if path is allowed
        if (self._paths) {
            var allowedPath = false;
            for(var i = 0; i < self._paths.length; i++) {
                if (path.indexOf(self._paths[i]) !== -1) {
                    allowedPath = true;
                    break;
                }
            }

            // path is not allowed
            if (! allowedPath)
                return;
        }

        // full path
        var p = self._prefix.concat(path.split('.'));

        // need jsonify
        if (value instanceof Observer || value instanceof ObserverList)
            value = value.json();

        // can be array value
        var ind = path.lastIndexOf('.');
        if (ind !== -1 && (this.get(path.slice(0, ind)) instanceof Array)) {
            // array index should be int
            p[p.length - 1] = parseInt(p[p.length - 1], 10);

            // emit operation: list item set
            self.emit('op', {
                p: p,
                li: value,
                ld: valueOld
            });
        } else {
            // emit operation: object item set
            var obj = {
                p: p,
                oi: value
            };

            if (valueOld !== undefined) {
                obj.od = valueOld;
            }

            self.emit('op', obj);
        }
    });

    // unset
    item.on('*:unset', function(path, value) {
        if (! self._enabled) return;

        self.emit('op', {
            p: self._prefix.concat(path.split('.')),
            od: null
        });
    });

    // list move
    item.on('*:move', function(path, value, ind, indOld) {
        if (! self._enabled) return;
        self.emit('op', {
            p: self._prefix.concat(path.split('.')).concat([ indOld ]),
            lm: ind
        });
    });

    // list remove
    item.on('*:remove', function(path, value, ind) {
        if (! self._enabled) return;

        // need jsonify
        if (value instanceof Observer || value instanceof ObserverList)
            value = value.json();

        self.emit('op', {
            p: self._prefix.concat(path.split('.')).concat([ ind ]),
            ld: value
        });
    });

    // list insert
    item.on('*:insert', function(path, value, ind) {
        if (! self._enabled) return;

        // need jsonify
        if (value instanceof Observer || value instanceof ObserverList)
            value = value.json();

        self.emit('op', {
            p: self._prefix.concat(path.split('.')).concat([ ind ]),
            li: value
        });
    });
};


ObserverSync.prototype.write = function(op) {
    // disable history if available
    var historyReEnable = false;
    if (this.item.history && this.item.history.enabled) {
        historyReEnable = true;
        this.item.history.enabled = false;
    }

    if (op.hasOwnProperty('oi')) {
        // set key value
        var path = op.p.slice(this._prefix.length).join('.');

        this._enabled = false;
        this.item.set(path, op.oi, false, true);
        this._enabled = true;


    } else if (op.hasOwnProperty('ld') && op.hasOwnProperty('li')) {
        // set array value
        var path = op.p.slice(this._prefix.length).join('.');

        this._enabled = false;
        this.item.set(path, op.li, false, true);
        this._enabled = true;


    } else if (op.hasOwnProperty('ld')) {
        // delete item
        var path = op.p.slice(this._prefix.length, -1).join('.');

        this._enabled = false;
        this.item.remove(path, op.p[op.p.length - 1], false, true);
        this._enabled = true;


    } else if (op.hasOwnProperty('li')) {
        // add item
        var path = op.p.slice(this._prefix.length, -1).join('.');
        var ind = op.p[op.p.length - 1];

        this._enabled = false;
        this.item.insert(path, op.li, ind, false, true);
        this._enabled = true;


    } else if (op.hasOwnProperty('lm')) {
        // item moved
        var path = op.p.slice(this._prefix.length, -1).join('.');
        var indOld = op.p[op.p.length - 1];
        var ind = op.lm;

        this._enabled = false;
        this.item.move(path, indOld, ind, false, true);
        this._enabled = true;


    } else if (op.hasOwnProperty('od')) {
        // unset key value
        var path = op.p.slice(this._prefix.length).join('.');
        this._enabled = false;
        this.item.unset(path, false, true);
        this._enabled = true;


    } else {
        console.log('unknown operation', op);
    }

    // reenable history
    if (historyReEnable)
        this.item.history.enabled = true;

    this.emit('sync', op);
};

Object.defineProperty(ObserverSync.prototype, 'enabled', {
    get: function() {
        return this._enabled;
    },
    set: function(value) {
        this._enabled = !! value;
    }
});

Object.defineProperty(ObserverSync.prototype, 'prefix', {
    get: function() {
        return this._prefix;
    },
    set: function(value) {
        this._prefix = value || [ ];
    }
});

Object.defineProperty(ObserverSync.prototype, 'paths', {
    get: function() {
        return this._paths;
    },
    set: function(value) {
        this._paths = value || null;
    }
});


/* observer-history.js */
function ObserverHistory(args) {
    Events.call(this);
    args = args || {};

    this.item = args.item;
    this._history = args.history;
    this._enabled = args.enabled || true;
    this._prefix = args.prefix || '';
    this._combine = args.combine || false;

    this._events = [];

    this._initialize();
}
ObserverHistory.prototype = Object.create(Events.prototype);


ObserverHistory.prototype._initialize = function () {
    var self = this;

    this._events.push(this.item.on('*:set', function (path, value, valueOld) {
        if (!self._enabled || !self._history) return;

        // need jsonify
        if (value instanceof Observer)
            value = value.json();

        // action
        var action = {
            name: self._prefix + path,
            combine: self._combine,
            undo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;

                if (valueOld === undefined) {
                    item.unset(path);
                } else {
                    item.set(path, valueOld);
                }

                item.history.enabled = true;
            },
            redo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;

                if (value === undefined) {
                    item.unset(path);
                } else {
                    item.set(path, value);
                }

                item.history.enabled = true;
            }
        };

        self._history.add(action);
    }));

    this._events.push(this.item.on('*:unset', function (path, valueOld) {
        if (!self._enabled || !self._history) return;

        // action
        var action = {
            name: self._prefix + path,
            combine: self._combine,
            undo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.set(path, valueOld);
                item.history.enabled = true;
            },
            redo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.unset(path);
                item.history.enabled = true;
            }
        };

        self._history.add(action);
    }));

    this._events.push(this.item.on('*:insert', function (path, value, ind) {
        if (!self._enabled || !self._history) return;

        // need jsonify
        // if (value instanceof Observer)
        //     value = value.json();

        // action
        var action = {
            name: self._prefix + path,
            combine: self._combine,
            undo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.removeValue(path, value);
                item.history.enabled = true;
            },
            redo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.insert(path, value, ind);
                item.history.enabled = true;
            }
        };

        self._history.add(action);
    }));

    this._events.push(this.item.on('*:remove', function (path, value, ind) {
        if (!self._enabled || !self._history) return;

        // need jsonify
        // if (value instanceof Observer)
        //     value = value.json();

        // action
        var action = {
            name: self._prefix + path,
            combine: self._combine,
            undo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.insert(path, value, ind);
                item.history.enabled = true;
            },
            redo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.removeValue(path, value);
                item.history.enabled = true;
            }
        };

        self._history.add(action);
    }));

    this._events.push(this.item.on('*:move', function (path, value, ind, indOld) {
        if (!self._enabled || !self._history) return;

        // action
        var action = {
            name: self._prefix + path,
            combine: self._combine,
            undo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.move(path, ind, indOld);
                item.history.enabled = true;
            },
            redo: function () {
                var item = self.item.latest();
                if (!item) return;

                item.history.enabled = false;
                item.move(path, indOld, ind);
                item.history.enabled = true;
            }
        };

        self._history.add(action);
    }));
};

ObserverHistory.prototype.destroy = function () {
    this._events.forEach(function (evt) {
        evt.unbind();
    });

    this._events.length = 0;
    this.item = null;
};

Object.defineProperty(ObserverHistory.prototype, 'enabled', {
    get: function () {
        return this._enabled;
    },
    set: function (value) {
        this._enabled = !!value;
    }
});


Object.defineProperty(ObserverHistory.prototype, 'prefix', {
    get: function () {
        return this._prefix;
    },
    set: function (value) {
        this._prefix = value || '';
    }
});

Object.defineProperty(ObserverHistory.prototype, 'combine', {
    get: function () {
        return this._combine;
    },
    set: function (value) {
        this._combine = !! value;
    }
});


/* editor/editor.js */
(function () {
    'use strict';

    function Editor() {
        Events.call(this);

        this._hooks = { };
    }
    Editor.prototype = Object.create(Events.prototype);


    Editor.prototype.method = function (name, fn) {
        if (this._hooks[name] !== undefined) {
            throw new Error('can\'t override hook: ' + name);
        }
        this._hooks[name] = fn;
    };


    Editor.prototype.methodRemove = function (name) {
        delete this._hooks[name];
    };


    Editor.prototype.call = function (name) {
        if (this._hooks[name]) {
            var args = Array.prototype.slice.call(arguments, 1);

            try {
                return this._hooks[name].apply(null, args);
            } catch (ex) {
                console.info('%c%s %c(editor.method error)', 'color: #06f', name, 'color: #f00');
                log.error(ex);
            }
        } else {
            // console.info('%c%s %c - editor.method does not exist yet', 'color: #06f', name, 'color: #f00');
        }
        return null;
    };


    // editor
    window.editor = new Editor();
})();


// config
(function () {
    'use strict';

    var applyConfig = function (path, value) {
        if (typeof(value) === 'object') {
            for (const key in value) {
                applyConfig((path ? path + '.' : '') + key, value[key]);
            }
        } else {
            Ajax.param(path, value);
        }
    };

    applyConfig('', config);
})();


/* launch/first-load.js */
(function () {
    'use strict';

    var visible = ! document.hidden;

    document.addEventListener('visibilitychange', function () {
        if (visible === ! document.hidden)
            return;

        visible = ! document.hidden;
        if (visible) {
            editor.emit('visible');
        } else {
            editor.emit('hidden');
        }
        editor.emit('visibility', visible);
    }, false);

    editor.method('visibility', function () {
        return visible;
    });

    // first load
    document.addEventListener('DOMContentLoaded', function () {
        editor.emit('load');
    }, false);
})();


/* launch/messenger.js */
editor.on('load', function () {
    'use strict';

    if (typeof(Messenger) === 'undefined')
        return;

    var messenger = new Messenger();

    messenger.connect(config.url.messenger.ws);

    messenger.on('connect', function () {
        this.authenticate(null, 'designer');
    });

    messenger.on('welcome', function () {
        this.projectWatch(config.project.id);
    });

    messenger.on('message', function (evt) {
        editor.emit('messenger:' + evt.name, evt.data);
    });
});


/* launch/modules.js */
editor.once('load', function () {
    'use strict';

    // check for wasm module support
    function wasmSupported() {
        try {
            if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
                const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (module instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        } catch (e) { }
        return false;
    }

    // load a script
    function loadScriptAsync(url, doneCallback) {
        var tag = document.createElement('script');
        tag.onload = function () {
            doneCallback();
        };
        tag.onerror = function () {
            throw new Error('failed to load ' + url);
        };
        tag.async = true;
        tag.src = url;
        document.head.appendChild(tag);
    }

    // load and initialize a wasm module
    function loadWasmModuleAsync(moduleName, jsUrl, binaryUrl, doneCallback) {
        loadScriptAsync(jsUrl, function () {
            var lib = window[moduleName];
            window[moduleName + 'Lib'] = lib;
            lib({ locateFile: function () { return binaryUrl; } } ).then( function (instance) {
                window[moduleName] = instance;
                doneCallback();
            });
        });
    }

    editor.method('editor:loadModules', function (modules, urlPrefix, doneCallback) {
        if (typeof modules === "undefined" || modules.length === 0) {
            // caller may depend on callback behaviour being async
            setTimeout(doneCallback);
        } else {
            var asyncCounter = modules.length;
            var asyncCallback = function () {
                asyncCounter--;
                if (asyncCounter === 0) {
                    doneCallback();
                }
            };

            var wasm = wasmSupported();
            modules.forEach(function (m) {
                if (!m.hasOwnProperty('preload') || m.preload) {
                    if (wasm) {
                        loadWasmModuleAsync(m.moduleName, urlPrefix + m.glueUrl, urlPrefix + m.wasmUrl, asyncCallback);
                    } else {
                        if (!m.fallbackUrl) {
                            throw new Error('wasm not supported and no fallback supplied for module ' + m.moduleName);
                        }
                        loadWasmModuleAsync(m.moduleName, urlPrefix + m.fallbackUrl, "", asyncCallback);
                    }
                } else {
                    asyncCallback();
                }
            });
        }
    });
});


/* launch/pc-bootstrap.js */
(function() {
    // Shared Lib
    var CANVAS_ID = 'application-canvas';

    // Needed as we will have edge cases for particlar versions of iOS
    // returns null if not iOS
    var getIosVersion = function () {
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            var version = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            return version;
        }

        return null;
    };

    var lastWindowHeight = window.innerHeight;
    var lastWindowWidth = window.innerWidth;
    var windowSizeChangeIntervalHandler = null;

    var pcBootstrap = {
        reflowHandler: null,
        iosVersion: getIosVersion(),

        createCanvas: function () {
            canvas = document.createElement('canvas');
            canvas.setAttribute('id', CANVAS_ID);
            canvas.setAttribute('tabindex', 0);
            // canvas.style.visibility = 'hidden';

            // Disable I-bar cursor on click+drag
            canvas.onselectstart = function () { return false; };

            document.body.appendChild(canvas);

            return canvas;
        },

        resizeCanvas: function (app, canvas) {
            canvas.style.width = '';
            canvas.style.height = '';
            app.resizeCanvas(canvas.width, canvas.height);

            var fillMode = app._fillMode;

            if (fillMode == pc.FILLMODE_NONE || fillMode == pc.FILLMODE_KEEP_ASPECT) {
                if ((fillMode == pc.FILLMODE_NONE && canvas.clientHeight < window.innerHeight) || (canvas.clientWidth / canvas.clientHeight >= window.innerWidth / window.innerHeight)) {
                    canvas.style.marginTop = Math.floor((window.innerHeight - canvas.clientHeight) / 2) + 'px';
                } else {
                    canvas.style.marginTop = '';
                }
            }

            lastWindowHeight = window.innerHeight;
            lastWindowWidth = window.innerWidth;

            // Work around when in landscape to work on iOS 12 otherwise
            // the content is under the URL bar at the top
            if (this.iosVersion && this.iosVersion[0] <= 12) {
                window.scrollTo(0, 0);
            }
        },

        reflow: function (app, canvas) {
            this.resizeCanvas(app, canvas);

            // Poll for size changes as the window inner height can change after the resize event for iOS
            // Have one tab only, and rotrait to portrait -> landscape -> portrait
            if (windowSizeChangeIntervalHandler === null) {
                windowSizeChangeIntervalHandler = setInterval(function () {
                    if (lastWindowHeight !== window.innerHeight || lastWindowWidth !== window.innerWidth) {
                        this.resizeCanvas(app, canvas);
                    }
                }.bind(this), 100);

                // Don't want to do this all the time so stop polling after some short time
                setTimeout(function() {
                    if (!!windowSizeChangeIntervalHandler) {
                        clearInterval(windowSizeChangeIntervalHandler);
                        windowSizeChangeIntervalHandler = null;
                    }
                }, 2000);
            }
        }
    };

    // Expose the reflow to users so that they can override the existing
    // reflow logic if need be
    window.pcBootstrap = pcBootstrap;
})();


/* editor/settings/settings.js */
editor.once('load', function () {
    'use strict';

    editor.method('settings:create', function (args) {
        // settings observer
        var settings = new Observer(args.data);
        settings.id = args.id;

        // Get settings
        editor.method('settings:' + args.name, function () {
            return settings;
        });

        var doc;

        settings.reload = function () {
            var connection = editor.call('realtime:connection');

            if (doc)
                doc.destroy();

            doc = connection.get('settings', settings.id);

            // handle errors
            doc.on('error', function (err) {
                log.error(err);
                editor.emit('settings:' + args.name + ':error', err);
            });

            // load settings
            doc.on('load', function () {
                var data = doc.data;

                // remove unnecessary fields
                delete data._id;
                delete data.name;
                delete data.user;
                delete data.project;
                delete data.item_id;
                delete data.branch_id;
                delete data.checkpoint_id;

                if (! settings.sync) {
                    settings.sync = new ObserverSync({
                        item: settings,
                        paths: Object.keys(settings._data)
                    });

                    // local -> server
                    settings.sync.on('op', function (op) {
                        if (doc)
                            doc.submitOp([op]);
                    });
                }

                var history = settings.history.enabled;
                if (history) {
                    settings.history.enabled = false;
                }

                settings.sync._enabled = false;
                for (const key in data) {
                    if (data[key] instanceof Array) {
                        settings.set(key, data[key].slice(0));
                    } else {
                        settings.set(key, data[key]);
                    }
                }
                settings.sync._enabled = true;
                if (history)
                    settings.history.enabled = true;

                // server -> local
                doc.on('op', function (ops, local) {
                    if (local) return;

                    var history = settings.history.enabled;
                    if (history)
                        settings.history.enabled = false;
                    for (let i = 0; i < ops.length; i++) {
                        settings.sync.write(ops[i]);
                    }
                    if (history)
                        settings.history.enabled = true;
                });

                editor.emit('settings:' + args.name + ':load');
            });

            // subscribe for realtime events
            doc.subscribe();
        };

        if (! args.deferLoad) {
            editor.on('realtime:authenticated', function () {
                settings.reload();
            });
        }

        editor.on('realtime:disconnected', function () {
            if (doc) {
                doc.destroy();
                doc = null;
            }
        });

        settings.disconnect = function () {
            if (doc) {
                doc.destroy();
                doc = null;
            }

            if (settings.sync) {
                settings.sync.unbind();
                delete settings.sync;
            }
        };


        return settings;
    });
});


/* editor/settings/project-settings.js */
editor.once('load', function () {
    'use strict';

    var syncPaths = [
        'antiAlias',
        'batchGroups',
        'fillMode',
        'resolutionMode',
        'height',
        'width',
        'use3dPhysics',
        'preferWebGl2',
        'powerPreference',
        'preserveDrawingBuffer',
        'scripts',
        'transparentCanvas',
        'useDevicePixelRatio',
        'useLegacyScripts',
        'useKeyboard',
        'useMouse',
        'useGamepads',
        'useTouch',
        'vr',
        'loadingScreenScript',
        'externalScripts',
        'plugins',
        'layers',
        'layerOrder',
        'i18nAssets',
        'areaLightDataAsset',
        'useLegacyAmmoPhysics',
        'useLegacyAudio',
        'maxAssetRetries'
    ];

    var data = {};
    for (let i = 0; i < syncPaths.length; i++)
        data[syncPaths[i]] = config.project.settings.hasOwnProperty(syncPaths[i]) ? config.project.settings[syncPaths[i]] : null;

    var settings = editor.call('settings:create', {
        name: 'project',
        id: config.project.settings.id,
        data: data
    });

    if (! settings.get('useLegacyScripts')) {
        pc.script.legacy = false;
    } else {
        pc.script.legacy = true;
    }

    // add history
    settings.history = new ObserverHistory({
        item: settings,
        history: editor.call('editor:history')
    });

    settings.on('*:set', function (path, value) {
        const parts = path.split('.');
        let obj = config.project.settings;
        for (let i = 0; i < parts.length - 1; i++) {
            if (! obj.hasOwnProperty(parts[i]))
                obj[parts[i]] = {};

            obj = obj[parts[i]];
        }

        // this is limited to simple structures for now
        // so take care
        if (value instanceof Object) {
            const path = parts[parts.length - 1];
            obj[path] = {};
            for (const key in value) {
                obj[path][key] = value[key];
            }
        } else {
            obj[parts[parts.length - 1]] = value;
        }
    });

    settings.on('*:unset', function (path) {
        var parts = path.split('.');
        var obj = config.project.settings;
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        delete obj[parts[parts.length - 1]];
    });

    settings.on('*:insert', function (path, value, index) {
        var parts = path.split('.');
        var obj = config.project.settings;
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        var arr = obj[parts[parts.length - 1]];
        if (Array.isArray(arr)) {
            arr.splice(index, 0, value);
        }
    });

    settings.on('*:remove', function (path, value, index) {
        var parts = path.split('.');
        var obj = config.project.settings;
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        var arr = obj[parts[parts.length - 1]];
        if (Array.isArray(arr)) {
            arr.splice(index, 1);
        }
    });

    // migrations
    editor.on('settings:project:load', function () {
        var history = settings.history.enabled;
        var sync = settings.sync.enabled;

        settings.history.enabled = false;
        settings.sync.enabled = editor.call('permissions:write');

        if (! settings.get('batchGroups')) {
            settings.set('batchGroups', {});
        }
        if (! settings.get('layers')) {
            settings.set('layers', {
                0: {
                    name: 'World',
                    opaqueSortMode: 2,
                    transparentSortMode: 3
                },
                1: {
                    name: 'Depth',
                    opaqueSortMode: 2,
                    transparentSortMode: 3
                },
                2: {
                    name: 'Skybox',
                    opaqueSortMode: 0,
                    transparentSortMode: 3
                },
                3: {
                    name: 'Immediate',
                    opaqueSortMode: 0,
                    transparentSortMode: 3
                },
                4: {
                    name: 'UI',
                    opaqueSortMode: 1,
                    transparentSortMode: 1
                }
            });

            settings.set('layerOrder', []);
            settings.insert('layerOrder', {
                layer: LAYERID_WORLD,
                transparent: false,
                enabled: true
            });
            settings.insert('layerOrder', {
                layer: LAYERID_DEPTH,
                transparent: false,
                enabled: true
            });
            settings.insert('layerOrder', {
                layer: LAYERID_SKYBOX,
                transparent: false,
                enabled: true
            });
            settings.insert('layerOrder', {
                layer: LAYERID_WORLD,
                transparent: true,
                enabled: true
            });
            settings.insert('layerOrder', {
                layer: LAYERID_IMMEDIATE,
                transparent: false,
                enabled: true
            });
            settings.insert('layerOrder', {
                layer: LAYERID_IMMEDIATE,
                transparent: true,
                enabled: true
            });
            settings.insert('layerOrder', {
                layer: LAYERID_UI,
                transparent: true,
                enabled: true
            });
        }

        if (settings.get('useKeyboard') === null) {
            settings.set('useKeyboard', true);
        }
        if (settings.get('useMouse') === null) {
            settings.set('useMouse', true);
        }
        if (settings.get('useTouch') === null) {
            settings.set('useTouch', true);
        }
        if (settings.get('useGamepads') === null) {
            settings.set('useGamepads', !!settings.get('vr'));
        }

        if (!settings.get('i18nAssets')) {
            settings.set('i18nAssets', []);
        }

        if (!settings.get('areaLightDataAsset')) {
            settings.set('areaLightDataAsset', null);
        }

        if (!settings.get('externalScripts')) {
            settings.set('externalScripts', []);
        }

        if (settings.get('powerPreference') === null) {
            settings.set('powerPreference', 'default');
        }

        if (settings.get('maxAssetRetries') === null) {
            settings.set('maxAssetRetries', 0);
        }

        settings.history.enabled = history;
        settings.sync.enabled = sync;
    });
});


/* editor/settings/project-user-settings.js */
editor.once('load', function () {
    'use strict';

    var isConnected = false;

    var settings = editor.call('settings:create', {
        name: 'projectUser',
        id: 'project_' + config.project.id + '_' + config.self.id,
        deferLoad: true,
        data: {
            editor: {
                cameraNearClip: 0.1,
                cameraFarClip: 1000,
                cameraClearColor: [
                    0.118,
                    0.118,
                    0.118,
                    1
                ],
                showFog: false,
                gridDivisions: 8,
                gridDivisionSize: 1,
                snapIncrement: 1,
                localServer: 'http://localhost:51000',
                launchDebug: true,
                launchMinistats: false,
                locale: 'en-US',
                pipeline: {
                    texturePot: true,
                    textureDefaultToAtlas: false,
                    searchRelatedAssets: true,
                    preserveMapping: false,
                    overwriteModel: true,
                    overwriteAnimation: true,
                    overwriteMaterial: false,
                    overwriteTexture: true,
                    useGlb: false,
                    useContainers: false,
                    defaultAssetPreload: true,
                    animSampleRate: 10,
                    animCurveTolerance: 0,
                    animEnableCubic: false,
                    animUseFbxFilename: false
                }
            },
            branch: config.self.branch.id,
            favoriteBranches: null
        },
        userId: config.self.id
    });

    // add history
    settings.history = new ObserverHistory({
        item: settings,
        history: editor.call('editor:history')
    });

    // migrations
    editor.on('settings:projectUser:load', function () {
        setTimeout(function () {
            var history = settings.history.enabled;
            settings.history.enabled = false;

            var sync = settings.sync.enabled;
            settings.sync.enabled = editor.call('permissions:read'); // read permissions enough for project user settings

            if (!settings.has('editor.launchMinistats')) {
                settings.set('editor.launchMinistats', false);
            }

            if (! settings.has('editor.pipeline'))
                settings.set('editor.pipeline', {});

            if (! settings.has('editor.pipeline.texturePot'))
                settings.set('editor.pipeline.texturePot', false);

            if (! settings.has('editor.pipeline.searchRelatedAssets'))
                settings.set('editor.pipeline.searchRelatedAssets', true);

            if (! settings.has('editor.pipeline.preserveMapping'))
                settings.set('editor.pipeline.preserveMapping', false);

            if (! settings.has('editor.pipeline.textureDefaultToAtlas'))
                settings.set('editor.pipeline.textureDefaultToAtlas', false);

            if (! settings.has('editor.pipeline.overwriteModel'))
                settings.set('editor.pipeline.overwriteModel', true);

            if (! settings.has('editor.pipeline.overwriteAnimation'))
                settings.set('editor.pipeline.overwriteAnimation', true);

            if (! settings.has('editor.pipeline.overwriteMaterial'))
                settings.set('editor.pipeline.overwriteMaterial', false);

            if (! settings.has('editor.pipeline.overwriteTexture'))
                settings.set('editor.pipeline.overwriteTexture', true);

            if (! settings.has('editor.locale')) {
                settings.set('editor.locale', 'en-US');
            }

            if (! settings.has('editor.renameDuplicatedEntities')) {
                settings.set('editor.renameDuplicatedEntities', false);
            }

            if (!settings.get('favoriteBranches')) {
                if (config.project.masterBranch) {
                    settings.set('favoriteBranches', [config.project.masterBranch]);
                } else {
                    settings.set('favoriteBranches', []);
                }
            }

            if (!settings.has('editor.pipeline.useGlb')) {
                settings.set('editor.pipeline.useGlb', false);
            }
            if (!settings.has('editor.pipeline.useContainers')) {
                settings.set('editor.pipeline.useContainers', false);
            }

            if (!settings.has('editor.pipeline.defaultAssetPreload')) {
                settings.set('editor.pipeline.defaultAssetPreload', true);
            }

            if (!settings.has('editor.pipeline.animSampleRate')) {
                settings.set('editor.pipeline.animSampleRate', 10);
            }

            if (!settings.has('editor.pipeline.animCurveTolerance')) {
                settings.set('editor.pipeline.animCurveTolerance', 0);
            }

            if (!settings.has('editor.pipeline.animEnableCubic')) {
                settings.set('editor.pipeline.animEnableCubic', false);
            }

            if (!settings.has('editor.pipeline.animUseFbxFilename')) {
                settings.set('editor.pipeline.animUseFbxFilename', false);
            }

            if (!settings.has('editor.showFog')) {
                settings.set('editor.showFog', false);
            }

            settings.history.enabled = history;
            settings.sync.enabled = sync;
        });
    });

    var reload = function () {
        // config.project.hasReadAccess is only for the launch page
        if (isConnected && (editor.call('permissions:read') || config.project.hasReadAccess)) {
            settings.reload(settings.scopeId);
        }
    };

    // handle permission changes
    editor.on('permissions:set:' + config.self.id, function (accesslevel) {
        if (editor.call('permissions:read')) {
            // reload settings
            if (! settings.sync) {
                settings.history.enabled = true;
                reload();
            }
        } else {
            // unset private settings
            if (settings.sync) {
                settings.disconnect();
                settings.history.enabled = false;
            }
        }
    });

    editor.on('realtime:authenticated', function () {
        isConnected = true;
        reload();
    });

    editor.on('realtime:disconnected', function () {
        isConnected = false;
    });
});


/* launch/viewport-loading.js */
editor.once('load', function () {
    'use strict';

    editor.method('viewport:loadingScreen', function () {
        pc.script.createLoadingScreen(function (app) {
            var showSplash = function () {
                // splash wrapper
                var wrapper = document.createElement('div');
                wrapper.id = 'application-splash-wrapper';
                document.body.appendChild(wrapper);

                // splash
                var splash = document.createElement('div');
                splash.id = 'application-splash';
                wrapper.appendChild(splash);
                splash.style.display = 'none';

                var logo = document.createElement('img');
                logo.src = 'https://playcanvas.com/static-assets/images/play_text_252_white.png';
                splash.appendChild(logo);
                logo.onload = function () {
                    splash.style.display = 'block';
                };

                var container = document.createElement('div');
                container.id = 'progress-bar-container';
                splash.appendChild(container);

                var bar = document.createElement('div');
                bar.id = 'progress-bar';
                container.appendChild(bar);

            };

            var hideSplash = function () {
                var splash = document.getElementById('application-splash-wrapper');
                splash.parentElement.removeChild(splash);
            };

            var setProgress = function (value) {
                var bar = document.getElementById('progress-bar');
                if (bar) {
                    value = Math.min(1, Math.max(0, value));
                    bar.style.width = value * 100 + '%';
                }
            };

            var createCss = function () {
                var css = [
                    'body {',
                    '    background-color: #283538;',
                    '}',

                    '#application-splash-wrapper {',
                    '    position: absolute;',
                    '    top: 0;',
                    '    left: 0;',
                    '    height: 100%;',
                    '    width: 100%;',
                    '    background-color: #283538;',
                    '}',

                    '#application-splash {',
                    '    position: absolute;',
                    '    top: calc(50% - 28px);',
                    '    width: 264px;',
                    '    left: calc(50% - 132px);',
                    '}',

                    '#application-splash img {',
                    '    width: 100%;',
                    '}',

                    '#progress-bar-container {',
                    '    margin: 20px auto 0 auto;',
                    '    height: 2px;',
                    '    width: 100%;',
                    '    background-color: #1d292c;',
                    '}',

                    '#progress-bar {',
                    '    width: 0%;',
                    '    height: 100%;',
                    '    background-color: #f60;',
                    '}',
                    '@media (max-width: 480px) {',
                    '    #application-splash {',
                    '        width: 170px;',
                    '        left: calc(50% - 85px);',
                    '    }',
                    '}'

                ].join('\n');

                var style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }

                document.head.appendChild(style);
            };


            createCss();

            showSplash();

            app.on('preload:end', function () {
                app.off('preload:progress');
            });
            app.on('preload:progress', setProgress);
            app.on('start', hideSplash);
        });

    });
});


/* launch/viewport.js */
editor.once('load', function () {
    'use strict';

    // Wait for assets, hierarchy and settings to load before initializing application and starting.
    var done = false;
    var hierarchy = false;
    var assets = false;
    var settings = false;
    var sourcefiles = false;
    var libraries = false;
    var sceneData = null;
    var sceneSettings = null;
    var loadingScreen = false;
    var scriptList = [];
    var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
    var canvas;
    var app;
    var scriptPrefix;

    var layerIndex = {};

    // try to start preload and initialization of application after load event
    var init = function () {
        if (!done && assets && hierarchy && settings && (!legacyScripts || sourcefiles) && libraries && loadingScreen) {
            // prevent multiple init calls during scene loading
            done = true;

            // Skip parseScenes if using pre-1.4.0 engine or invalid config
            if (app._parseScenes) {
                app._parseScenes(config.scenes);
            }

            // load assets that are in the preload set
            app.preload(function (err) {
                // load scripts that are in the scene data
                app._preloadScripts(sceneData, function (err) {
                    if (err) log.error(err);

                    // create scene
                    app.scene = app.loader.open("scene", sceneData);
                    app.root.addChild(app.scene.root);

                    // update scene settings now that scene is loaded
                    app.applySceneSettings(sceneSettings);

                    // clear stored loading data
                    sceneData = null;
                    sceneSettings = null;
                    scriptList = null;

                    if (err) log.error(err);

                    app.start();
                });
            });
        }
    };

    var createLoadingScreen = function () {

        var defaultLoadingScreen = function () {
            editor.call('viewport:loadingScreen');
            loadingScreen = true;
            init();
        };

        // if the project has a loading screen script then
        // download it and execute it
        if (config.project.settings.loadingScreenScript) {
            var loadingScript = document.createElement('script');
            if (config.project.settings.useLegacyScripts) {
                loadingScript.src = scriptPrefix + '/' + config.project.settings.loadingScreenScript;
            } else {
                loadingScript.src = '/api/assets/' + config.project.settings.loadingScreenScript + '/download?branchId=' + config.self.branch.id;
            }

            loadingScript.onload = function () {
                loadingScreen = true;
                init();
            };

            loadingScript.onerror = function () {
                log.error("Could not load loading screen script: " + config.project.settings.loadingScreenScript);
                defaultLoadingScreen();
            };

            var head = document.getElementsByTagName('head')[0];
            head.insertBefore(loadingScript, head.firstChild);
        } else {
            // no loading screen script so just use default splash screen
            defaultLoadingScreen();
        }
    };

    var createLayer = function (key, data) {
        var id = parseInt(key, 10);
        return new pc.Layer({
            id: id,
            enabled: id !== LAYERID_DEPTH, // disable depth layer - it will be enabled by the engine when needed
            name: data.name,
            opaqueSortMode: data.opaqueSortMode,
            transparentSortMode: data.transparentSortMode
        });
    };

    canvas = pcBootstrap.createCanvas();

    // convert library properties into URLs
    var libraryUrls = [];
    if (config.project.settings.use3dPhysics) {
        libraryUrls.push(config.url.physics);
    }

    var queryParams = (new pc.URI(window.location.href)).getQuery();

    scriptPrefix = config.project.scriptPrefix;

    // queryParams.local can be true or it can be a URL
    if (queryParams.local)
        scriptPrefix = queryParams.local === 'true' ? 'http://localhost:51000' : queryParams.local;

    // WebGL 1.0 enforced?
    var preferWebGl2 = config.project.settings.preferWebGl2;
    if (queryParams.hasOwnProperty('webgl1')) {
        try {
            preferWebGl2 = queryParams.webgl1 === undefined ? false : !JSON.parse(queryParams.webgl1);
        } catch (ex) { }
    }

    var powerPreference = config.project.settings.powerPreference;

    // listen for project setting changes
    var projectSettings = editor.call('settings:project');
    var projectUserSettings = editor.call('settings:projectUser');

    // legacy scripts
    pc.script.legacy = projectSettings.get('useLegacyScripts');

    // playcanvas app
    var useMouse = projectSettings.has('useMouse') ? projectSettings.get('useMouse') : true;
    var useKeyboard = projectSettings.has('useKeyboard') ? projectSettings.get('useKeyboard') : true;
    var useTouch = projectSettings.has('useTouch') ? projectSettings.get('useTouch') : true;
    var useGamepads = projectSettings.has('useGamepads') ? projectSettings.get('useGamepads') : !!projectSettings.get('vr');

    app = new pc.Application(canvas, {
        elementInput: new pc.ElementInput(canvas, {
            useMouse: useMouse,
            useTouch: useTouch
        }),
        mouse: useMouse ? new pc.Mouse(canvas) : null,
        touch: useTouch && pc.platform.touch ? new pc.TouchDevice(canvas) : null,
        keyboard: useKeyboard ? new pc.Keyboard(window) : null,
        gamepads: useGamepads ? new pc.GamePads() : null,
        scriptPrefix: scriptPrefix,
        scriptsOrder: projectSettings.get('scripts') || [],
        assetPrefix: '/api/',
        graphicsDeviceOptions: {
            preferWebGl2: preferWebGl2,
            powerPreference: powerPreference,
            antialias: config.project.settings.antiAlias !== false,
            alpha: config.project.settings.transparentCanvas !== false,
            preserveDrawingBuffer: !!config.project.settings.preserveDrawingBuffer
        }
    });

    if (projectSettings.get('maxAssetRetries')) {
        app.loader.enableRetry(projectSettings.get('maxAssetRetries'));
    }

    if (queryParams.useBundles === 'false') {
        app.enableBundles = false;
    }

    if (queryParams.ministats) {
        // eslint-disable-next-line no-unused-vars
        var miniStats = new pcx.MiniStats(app);
    }

    if (canvas.classList) {
        canvas.classList.add('fill-mode-' + config.project.settings.fillMode);
    }

    if (config.project.settings.useDevicePixelRatio) {
        app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
    }

    app.setCanvasResolution(config.project.settings.resolutionMode, config.project.settings.width, config.project.settings.height);
    app.setCanvasFillMode(config.project.settings.fillMode, config.project.settings.width, config.project.settings.height);

    // batch groups
    var batchGroups = config.project.settings.batchGroups;
    if (batchGroups) {
        for (var batchGroupId in batchGroups) {
            var grp = batchGroups[batchGroupId];
            app.batcher.addGroup(grp.name, grp.dynamic, grp.maxAabbSize, grp.id, grp.layers);
        }
    }

    // layers
    if (config.project.settings.layers && config.project.settings.layerOrder) {
        var composition = new pc.LayerComposition("viewport");

        for (var key in config.project.settings.layers) {
            layerIndex[key] = createLayer(key, config.project.settings.layers[key]);
        }

        for (var i = 0, len = config.project.settings.layerOrder.length; i < len; i++) {
            var sublayer = config.project.settings.layerOrder[i];
            var layer = layerIndex[sublayer.layer];
            if (!layer) continue;

            if (sublayer.transparent) {
                composition.pushTransparent(layer);
            } else {
                composition.pushOpaque(layer);
            }

            composition.subLayerEnabled[i] = sublayer.enabled;
        }

        app.scene.layers = composition;
    }

    // localization
    if (app.i18n) { // make it backwards compatible ...
        if (config.self.locale) {
            app.i18n.locale = config.self.locale;
        }

        if (config.project.settings.i18nAssets) {
            app.i18n.assets = config.project.settings.i18nAssets;
        }
    }

    if (config.project.settings.areaLightDataAsset) {
        var id = config.project.settings.areaLightDataAsset;
        var engineAsset = app.assets.get(id);
        if (engineAsset) {
            app.setAreaLightLuts(engineAsset);
        } else {
            app.assets.on('add:' + id, function () {
                var engineAsset = app.assets.get(id);
                app.setAreaLightLuts(engineAsset);
            });
        }
    }

    editor.call('editor:loadModules', config.wasmModules, "", function () {
        app._loadLibraries(libraryUrls, function (err) {
            libraries = true;
            if (err) log.error(err);
            init();
        });
    });

    var style = document.head.querySelector ? document.head.querySelector('style') : null;

    // append css to style
    var createCss = function () {
        if (!document.head.querySelector)
            return;

        if (!style)
            style = document.head.querySelector('style');

        // css media query for aspect ratio changes
        var css = "@media screen and (min-aspect-ratio: " + config.project.settings.width + "/" + config.project.settings.height + ") {";
        css += "    #application-canvas.fill-mode-KEEP_ASPECT {";
        css += "        width: auto;";
        css += "        height: 100%;";
        css += "        margin: 0 auto;";
        css += "    }";
        css += "}";

        style.innerHTML = css;
    };

    createCss();

    var refreshResolutionProperties = function () {
        app.setCanvasResolution(config.project.settings.resolutionMode, config.project.settings.width, config.project.settings.height);
        app.setCanvasFillMode(config.project.settings.fillMode, config.project.settings.width, config.project.settings.height);
        pcBootstrap.resizeCanvas(app, canvas);
    };

    projectSettings.on('width:set', function (value) {
        config.project.settings.width = value;
        createCss();
        refreshResolutionProperties();
    });
    projectSettings.on('height:set', function (value) {
        config.project.settings.height = value;
        createCss();
        refreshResolutionProperties();
    });

    projectSettings.on('fillMode:set', function (value, oldValue) {
        config.project.settings.fillMode = value;
        if (canvas.classList) {
            if (oldValue)
                canvas.classList.remove('fill-mode-' + oldValue);

            canvas.classList.add('fill-mode-' + value);
        }

        refreshResolutionProperties();
    });

    projectSettings.on('resolutionMode:set', function (value) {
        config.project.settings.resolutionMode = value;
        refreshResolutionProperties();
    });

    projectSettings.on('useDevicePixelRatio:set', function (value) {
        config.project.settings.useDevicePixelRatio = value;
        app.graphicsDevice.maxPixelRatio = value ? window.devicePixelRatio : 1;
    });

    projectSettings.on('preferWebGl2:set', function (value) {
        config.project.settings.preferWebGl2 = value;
    });

    projectSettings.on('powerPreference:set', function (value) {
        config.project.settings.powerPreference = value;
    });

    projectSettings.on('i18nAssets:set', function (value) {
        app.i18n.assets = value;
    });

    projectSettings.on('areaLightDataAsset:set', function (value) {
        var id = value;
        var engineAsset = app.assets.get(id);
        if (engineAsset) {
            app.setAreaLightLuts(engineAsset);
        } else {
            app.assets.on('add:' + id, function () {
                var engineAsset = app.assets.get(id);
                app.setAreaLightLuts(engineAsset);
            });
        }
    });

    projectSettings.on('i18nAssets:insert', function (value) {
        app.i18n.assets = projectSettings.get('i18nAssets');
    });

    projectSettings.on('i18nAssets:remove', function (value) {
        app.i18n.assets = projectSettings.get('i18nAssets');
    });

    projectSettings.on('maxAssetRetries:set', function (value) {
        if (value > 0) {
            app.loader.enableRetry(value);
        } else {
            app.loader.disableRetry();
        }
    });

    // locale change
    projectUserSettings.on('editor.locale:set', function (value) {
        if (value) {
            app.i18n.locale = value;
        }
    });

    projectSettings.on('*:set', function (path, value) {
        var parts;

        if (path.startsWith('batchGroups')) {
            parts = path.split('.');
            if (parts.length < 2) return;
            var groupId = parseInt(parts[1], 10);
            var groupSettings = projectSettings.get('batchGroups.' + groupId);
            if (!app.batcher._batchGroups[groupId]) {
                app.batcher.addGroup(
                    groupSettings.name,
                    groupSettings.dynamic,
                    groupSettings.maxAabbSize,
                    groupId,
                    groupSettings.layers
                );

                app.batcher.generate();
            } else {
                app.batcher._batchGroups[groupId].name = groupSettings.name;
                app.batcher._batchGroups[groupId].dynamic = groupSettings.dynamic;
                app.batcher._batchGroups[groupId].maxAabbSize = groupSettings.maxAabbSize;

                app.batcher.generate([groupId]);
            }
        } else if (path.startsWith('layers')) {
            parts = path.split('.');
            // create layer
            var layer;
            if (parts.length === 2) {
                layer = createLayer(parts[1], value);
                layerIndex[layer.id] = layer;
                var existing = app.scene.layers.getLayerById(layer.id);
                if (existing) {
                    app.scene.layers.remove(existing);
                }
            } else if (parts.length === 3) { // change layer property
                layer = layerIndex[parts[1]];
                if (layer) {
                    layer[parts[2]] = value;
                }
            }
        } else if (path.startsWith('layerOrder.')) {
            parts = path.split('.');

            if (parts.length === 3) {
                if (parts[2] === 'enabled') {
                    var subLayerId = parseInt(parts[1], 10);
                    // Unlike Editor, DON'T add 2 to subLayerId here
                    app.scene.layers.subLayerEnabled[subLayerId] = value;
                    editor.call('viewport:render');
                }
            }
        }
    });

    projectSettings.on('*:unset', function (path, value) {
        if (path.startsWith('batchGroups')) {
            var propNameParts = path.split('.')[1];
            if (propNameParts.length === 2) {
                var id = propNameParts[1];
                app.batcher.removeGroup(id);
            }
        } else if (path.startsWith('layers.')) {
            var parts = path.split('.');

            // remove layer
            var layer = layerIndex[parts[1]];
            if (layer) {
                app.scene.layers.remove(layer);
                delete layerIndex[parts[1]];
            }
        }
    });

    projectSettings.on('layerOrder:insert', function (value, index) {
        var id = value.get('layer');
        var layer = layerIndex[id];
        if (!layer) return;

        var transparent = value.get('transparent');

        if (transparent) {
            app.scene.layers.insertTransparent(layer, index);
        } else {
            app.scene.layers.insertOpaque(layer, index);
        }
    });

    projectSettings.on('layerOrder:remove', function (value) {
        var id = value.get('layer');
        var layer = layerIndex[id];
        if (!layer) return;

        var transparent = value.get('transparent');

        if (transparent) {
            app.scene.layers.removeTransparent(layer);
        } else {
            app.scene.layers.removeOpaque(layer);
        }
    });

    projectSettings.on('layerOrder:move', function (value, indNew, indOld) {
        var id = value.get('layer');
        var layer = layerIndex[id];
        if (!layer) return;

        var transparent = value.get('transparent');
        if (transparent) {
            app.scene.layers.removeTransparent(layer);
            app.scene.layers.insertTransparent(layer, indNew);
        } else {
            app.scene.layers.removeOpaque(layer);
            app.scene.layers.insertOpaque(layer, indNew);
        }
    });

    pcBootstrap.reflow(app, canvas);
    pcBootstrap.reflowHandler = function () { pcBootstrap.reflow(app, canvas); };

    window.addEventListener('resize', pcBootstrap.reflowHandler, false);
    window.addEventListener('orientationchange', pcBootstrap.reflowHandler, false);

    // get application
    editor.method('viewport:app', function () {
        return app;
    });

    editor.on('entities:load', function (data) {
        hierarchy = true;
        sceneData = data;
        init();
    });

    editor.on('assets:load', function () {
        assets = true;
        init();
    });

    editor.on('sceneSettings:load', function (data) {
        settings = true;
        sceneSettings = data.json();
        init();
    });

    if (legacyScripts) {
        editor.on('sourcefiles:load', function (scripts) {
            // eslint-disable-next-line no-unused-vars
            scriptList = scripts;
            sourcefiles = true;
            init();
        });
    }

    createLoadingScreen();
});


/* launch/viewport-error-console.js */
editor.once('load', function () {
    'use strict';

    // console
    var panel = document.createElement('div');
    panel.id = 'application-console';
    panel.classList.add('hidden');
    document.body.appendChild(panel);

    var errorCount = 0;

    panel.addEventListener('mousedown', function (evt) {
        evt.stopPropagation();
    }, false);
    panel.addEventListener('click', function (evt) {
        evt.stopPropagation();
    }, false);

    // close button img
    var closeBtn = document.createElement('img');
    closeBtn.src = 'https://playcanvas.com/static-assets/images/icons/fa/16x16/remove.png';
    panel.appendChild(closeBtn);

    closeBtn.addEventListener('click', function () {
        var i = panel.childNodes.length;
        while (i-- > 1) {
            panel.childNodes[i].parentElement.removeChild(panel.childNodes[i]);
        }

        panel.classList.add('hidden');
    });

    var logTimestamp = null;
    var stopLogs = false;

    var append = function (msg, cls) {
        if (stopLogs) return;

        // prevent too many log messages
        if (panel.childNodes.length <= 1) {
            logTimestamp = Date.now();
        } else if (panel.childNodes.length > 60) {
            if (Date.now() - logTimestamp < 2000) {
                stopLogs = true;
                msg = "Too many logs. Open the browser console to see more details.";
            }
        }

        // create new DOM element with the specified inner HTML
        var element = document.createElement('p');
        element.innerHTML = msg.replace(/\n/g, '<br/>');
        if (cls)
            element.classList.add(cls);

        // var links = element.querySelectorAll('.code-link');
        // for(var i = 0; i < links.length; i++) {
        //     links[i].addEventListener('click', function(evt) {
        //         evt.preventDefault();
        //         var scope = window;

        //         // TODO
        //         // possible only when launcher and editor are within same domain (HTTPS)
        //         // var scope = window.opener || window;

        //         scope.open(this.getAttribute('href') + this.getAttribute('query'), this.getAttribute('href')).focus();
        //     }, false);
        // }

        panel.appendChild(element);

        panel.classList.remove('hidden');
        return element;
    };

    var onError = function (msg, url, line, col, e) {
        if (url) {
            // check if this is a playcanvas script
            var codeEditorUrl = '';
            var query = '';
            var target = null;
            var assetId = null;

            // if this is a playcanvas script
            // then create a URL that will open the code editor
            // at that line and column
            if (url.indexOf('api/files/code') !== -1) {
                var parts = url.split('//')[1].split('/');

                target = '/editor/code/' + parts[4] + '/';
                if (parts.length > 9) {
                    target += parts.slice(9).join('/');
                } else {
                    target += parts.slice(6).join('/');
                }

                codeEditorUrl = config.url.home + target;
                query = '?line=' + line + '&col=' + col + '&error=true';
            } else if (!editor.call('settings:project').get('useLegacyScripts') && url.indexOf('/api/assets/') !== -1 && url.indexOf('.js') !== -1) {
                assetId = parseInt(url.match(/\/api\/assets\/files\/.+?id=([0-9]+)/)[1], 10);
                target = 'codeeditor:' + config.project.id;
                codeEditorUrl = config.url.home + '/editor/code/' + config.project.id;
                query = '?tabs=' + assetId + '&line=' + line + '&col=' + col + '&error=true';
            } else {
                codeEditorUrl = url;
            }

            var slash = url.lastIndexOf('/');
            var relativeUrl = url.slice(slash + 1);
            errorCount++;

            append(pc.string.format('<a href="{0}{1}" target="{2} class="code-link" id="{6}">[{3}:{4}]</a>: {5}', codeEditorUrl, query, target, relativeUrl, line, msg, 'error-' + errorCount), 'error');

            if (assetId) {
                var link = document.getElementById('error-' + errorCount);
                link.addEventListener('click', function (e) {
                    var existing = window.open('', target);
                    try {
                        if (existing) {
                            e.preventDefault();
                            e.stopPropagation();

                            if (existing.editor && existing.editor.isCodeEditor) {
                                existing.editor.call('integration:selectWhenReady', assetId, {
                                    line: line,
                                    col: col,
                                    error: true
                                });
                            } else {
                                existing.location.href = codeEditorUrl + query;
                            }
                        }
                    } catch (ex) {
                        // if we try to access 'existing' and it's in a different
                        // domain an exception will be raised
                        window.open(codeEditorUrl + query, target);
                    }
                });
            }

            // append stacktrace as well
            if (e && e.stack)
                append(e.stack.replace(/ /g, '&nbsp;'), 'trace');
        } else {
            // Chrome only shows 'Script error.' if the error comes from
            // a different domain.
            if (msg && msg !== 'Script error.') {
                append(msg, 'error');
            } else {
                append('Error loading scripts. Open the browser console for details.', 'error');
            }
        }
    };

    // catch errors and show them to the console
    window.onerror = onError;

    // redirect console.error to the in-game console
    var consoleError = console.error;
    console.error = function (...args) {
        var errorPassed = false;
        consoleError(...args);

        args.forEach(item => {
            if (item instanceof Error && item.stack) {
                var msg = item.message;
                var lines = item.stack.split('\n');
                if (lines.length >= 2) {
                    var line = lines[1];
                    var url = line.slice(line.indexOf('(') + 1);
                    var m = url.match(/:[0-9]+:[0-9]+\)/);
                    if (m) {
                        url = url.slice(0, m.index);
                        var parts = m[0].slice(1, -1).split(':');

                        if (parts.length === 2) {
                            var lineNumber = parseInt(parts[0], 10);
                            var colNumber = parseInt(parts[1], 10);

                            onError(msg, url, lineNumber, colNumber, item);
                            errorPassed = true;
                        }
                    }
                }
            }

            if (item instanceof Error) {
                if (!errorPassed)
                    append(item.message, 'error');
            } else {
                append(item.toString(), 'error');
            }
        });
    };

});


/* launch/tools.js */
var now = function () {
    return performance.timing.navigationStart + performance.now();
};

if (! performance || ! performance.now || ! performance.timing)
    now = Date.now;

var start = now();

editor.once('load', function () {
    'use strict';

    // times
    var timeBeginning = performance.timing ? performance.timing.responseEnd : start;
    var timeNow = now() - timeBeginning;
    var timeHover = 0;

    var epoc = ! window.performance || ! performance.now || ! performance.timing;
    editor.method('tools:epoc', function () {
        return epoc;
    });

    editor.method('tools:time:now', function () { return now() - timeBeginning; });
    editor.method('tools:time:beginning', function () { return timeBeginning; });
    editor.method('tools:time:hover', function () { return timeHover; });

    editor.method('tools:time:toHuman', function (ms, precision) {
        var s = ms / 1000;
        var m = ('00' + Math.floor(s / 60)).slice(-2);
        if (precision) {
            s = ('00.0' + (s % 60).toFixed(precision)).slice(-4);
        } else {
            s = ('00' + Math.floor(s % 60)).slice(-2);
        }
        return m + ':' + s;
    });

    // root panel
    var root = document.createElement('div');
    root.id = 'dev-tools';
    root.style.display = 'none';
    document.body.appendChild(root);
    editor.method('tools:root', function () {
        return root;
    });

    // variabled
    // var updateInterval;
    var enabled = false;

    if (location.search && location.search.indexOf('profile=true') !== -1)
        enabled = true;

    if (enabled)
        root.style.display = 'block';

    // view
    var scale = 0.2; // how many pixels in a ms
    var capacity = 0; // how many ms can fit
    var scroll = {
        time: 0, // how many ms start from
        auto: true, // auto scroll to the end
        drag: {
            x: 0,
            time: 0,
            bar: false,
            barTime: 0,
            barMove: false
        }
    };

    var resize;

    editor.method('tools:enabled', function () { return enabled; });

    editor.method('tools:enable', function () {
        if (enabled)
            return;

        enabled = true;
        root.style.display = 'block';
        resize();
        editor.emit('tools:clear');
        editor.emit('tools:state', true);

        // updateInterval = setInterval(function() {
        //     update();
        //     editor.emit('tools:render');
        // }, 1000 / 60);
    });

    editor.method('tools:disable', function () {
        if (! enabled)
            return;

        enabled = false;
        root.style.display = 'none';
        editor.emit('tools:clear');
        editor.emit('tools:state', false);
        // clearInterval(updateInterval);
    });

    // methods to access view params
    editor.method('tools:time:capacity', function () { return capacity; });
    editor.method('tools:scroll:time', function () { return scroll.time; });

    // size
    var left = 300;
    var right = 0;
    var width = 0;
    var height = 0;
    // resizing
    resize = function () {
        var rect = root.getBoundingClientRect();

        if (width === rect.width && height === rect.height)
            return;

        width = rect.width;
        height = rect.height;
        capacity = Math.floor((width - left - right) / scale);
        scroll.time = Math.max(0, Math.min(timeNow - capacity, Math.floor(scroll.time)));

        editor.emit('tools:resize', width, height);
    };
    window.addEventListener('resize', resize, false);
    window.addEventListener('orientationchange', resize, false);
    setInterval(resize, 500);
    resize();
    editor.method('tools:size:width', function () { return width; });
    editor.method('tools:size:height', function () { return height; });

    editor.on('tools:clear', function () {
        timeBeginning = now();
        timeNow = 0;
        timeHover = 0;
        scroll.time = 0;
        scroll.auto = true;
    });

    var mouse = {
        x: 0,
        y: 0,
        click: false,
        down: false,
        up: false,
        hover: false
    };

    var flushMouse = function () {
        if (mouse.up)
            mouse.up = false;

        if (mouse.click) {
            mouse.click = false;
            mouse.down = true;
        }
    };

    var update = function () {
        timeNow = now() - timeBeginning;

        if (scroll.auto)
            scroll.time = Math.max(0, timeNow - capacity);

        if (mouse.click) {
            scroll.drag.x = mouse.x;
            scroll.drag.time = scroll.time;
            scroll.drag.bar = mouse.y < 23;
            if (scroll.drag.bar) {
                scroll.drag.barTime = ((mouse.x / (width - 300)) * timeNow) - scroll.time;
                scroll.drag.barMove = scroll.drag.barTime >= 0 && scroll.drag.barTime <= capacity;
            }
            scroll.auto = false;
            root.classList.add('dragging');
            editor.emit('tools:scroll:start');
        } else if (mouse.down) {
            if (scroll.drag.bar) {
                if (scroll.drag.barMove) {
                    scroll.time = ((mouse.x / (width - 300)) * timeNow) - scroll.drag.barTime;
                } else {
                    scroll.time = ((mouse.x / (width - 300)) * timeNow) - (capacity / 2);
                }
            } else {
                scroll.time = scroll.drag.time + ((scroll.drag.x - mouse.x) / scale);
            }
            scroll.time = Math.max(0, Math.min(timeNow - capacity, Math.floor(scroll.time)));
        } else if (mouse.up) {
            if (Math.abs((scroll.time + capacity) - timeNow) < 32)
                scroll.auto = true;

            root.classList.remove('dragging');
            editor.emit('tools:scroll:end');
        }

        if (mouse.hover && ! mouse.down) {
            if (mouse.y < 23) {
                timeHover = Math.floor((mouse.x / (width - 300)) * timeNow);
            } else if (mouse.y < 174) {
                timeHover = Math.floor(mouse.x / scale + scroll.time);
            } else {
                timeHover = 0;
            }
        } else {
            timeHover = 0;
        }

        flushMouse();
    };

    root.addEventListener('mousemove', function (evt) {
        evt.stopPropagation();

        var rect = root.getBoundingClientRect();
        mouse.x = evt.clientX - (rect.left + 300);
        mouse.y = evt.clientY - rect.top;
        mouse.hover = mouse.x > 0;
        if (mouse.y < 23) {
            timeHover = Math.floor((mouse.x / (width - 300)) * timeNow);
        } else {
            timeHover = Math.floor(mouse.x / scale + scroll.time);
        }
    }, false);

    root.addEventListener('mousedown', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        if (evt.button !== 0 || mouse.click || mouse.down || ! mouse.hover)
            return;

        mouse.click = true;
    }, false);

    root.addEventListener('mouseup', function (evt) {
        evt.stopPropagation();

        if (evt.button !== 0 || ! mouse.down)
            return;

        mouse.down = false;
        mouse.up = true;
    }, false);

    root.addEventListener('mouseleave', function (evt) {
        mouse.hover = false;
        timeHover = 0;
        if (! mouse.down)
            return;

        mouse.down = false;
        mouse.up = true;
    }, false);

    root.addEventListener('mousewheel', function (evt) {
        evt.stopPropagation();

        if (! mouse.hover)
            return;

        scroll.time = Math.max(0, Math.min(timeNow - capacity, Math.floor(scroll.time + evt.deltaX / scale)));
        if (evt.deltaX < 0) {
            scroll.auto = false;
        } else if (Math.abs((scroll.time + capacity) - timeNow) < 16) {
            scroll.auto = true;
        }
    }, false);

    // alt + t
    window.addEventListener('keydown', function (evt) {
        if (evt.keyCode === 84 && evt.altKey) {
            if (enabled) {
                editor.call('tools:disable');
            } else {
                editor.call('tools:enable');
            }
        }
    }, false);

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var frameLast = 0;

    var onFrame = function () {
        requestAnimationFrame(onFrame);

        if (enabled) {
            var now = Date.now();

            if ((now - frameLast) >= 40) {
                frameLast = now;

                update();
                editor.emit('tools:render');
            }
        }
    };
    requestAnimationFrame(onFrame);
});


/* launch/tools-overview.js */
editor.once('load', function () {
    'use strict';

    // variables
    var enabled = editor.call('tools:enabled');
    var events = [];
    var eventsIndex = { };

    // canvas
    var canvas = document.createElement('canvas');
    canvas.classList.add('overview');
    editor.call('tools:root').appendChild(canvas);

    // context
    var ctx = canvas.getContext('2d');
    ctx.font = '10px Arial';

    var render = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var now = editor.call('tools:time:now');
        var scrollTime = editor.call('tools:scroll:time');
        var capacity = editor.call('tools:time:capacity');
        ctx.textBaseline = 'alphabetic';

        var startX = scrollTime / now * canvas.width;
        var endX = (Math.min(now, scrollTime + capacity)) / now * canvas.width;

        // view rect
        ctx.beginPath();
        ctx.rect(startX, 0, endX - startX, canvas.height);
        ctx.fillStyle = '#303030';
        ctx.fill();
        // line bottom
        ctx.beginPath();
        ctx.moveTo(startX, canvas.height - 0.5);
        ctx.lineTo(endX, canvas.height - 0.5);
        ctx.strokeStyle = '#2c2c2c';
        ctx.stroke();

        // events
        var x, x2, e;
        for (var i = 0; i < events.length; i++) {
            e = events[i];
            x = e.t / now * canvas.width;

            if (events[i].t2 !== null) {
                var t2 = e.t2;
                if (e.t2 === -1)
                    t2 = now;

                x2 = Math.max(t2 / now * canvas.width, x + 1);

                ctx.beginPath();
                ctx.rect(x, Math.floor((canvas.height - 8) / 2), x2 - x, 8);
                ctx.fillStyle = editor.call('tools:timeline:color', e.k);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(x, 1);
                ctx.lineTo(x, canvas.height - 1);
                ctx.strokeStyle = editor.call('tools:timeline:color', e.k);
                ctx.stroke();
            }
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';

        // start/end text
        ctx.fillStyle = '#fff';
        // start time
        ctx.textAlign = 'left';
        ctx.strokeText('00:00.0 FPS', 2.5, canvas.height - 2.5);
        ctx.fillText('00:00.0 FPS', 2.5, canvas.height - 2.5);
        // now time
        ctx.textAlign = 'right';
        ctx.strokeText(editor.call('tools:time:toHuman', now, 1), canvas.width - 2.5, canvas.height - 2.5);
        ctx.fillText(editor.call('tools:time:toHuman', now, 1), canvas.width - 2.5, canvas.height - 2.5);

        var startTextWidth = 0;
        ctx.textBaseline = 'top';

        var text, measures, offset;

        // view start
        if (scrollTime > 0) {
            text = editor.call('tools:time:toHuman', scrollTime, 1);
            measures = ctx.measureText(text);
            offset = 2.5;
            if (startX + 2.5 + measures.width < endX - 2.5) {
                startTextWidth = measures.width;
                ctx.textAlign = 'left';
            } else {
                offset = -2.5;
                ctx.textAlign = 'right';
            }
            ctx.strokeText(text, startX + offset, 0);
            ctx.fillText(text, startX + offset, 0);
        }

        // view end
        if ((scrollTime + capacity) < now - 100) {
            text = editor.call('tools:time:toHuman', Math.min(now, scrollTime + capacity), 1);
            measures = ctx.measureText(text);
            offset = 2.5;
            if (endX - 2.5 - measures.width - startTextWidth > startX + 2.5) {
                ctx.textAlign = 'right';
                offset = -2.5;
            } else {
                ctx.textAlign = 'left';
            }
            ctx.strokeText(text, endX + offset, 0);
            ctx.fillText(text, endX + offset, 0);
        }

        ctx.lineWidth = 1;
    };

    // resize
    editor.on('tools:resize', function (width, height) {
        canvas.width = width - 300 - 32;
        canvas.height = 24;
        render();
    });
    canvas.width = editor.call('tools:size:width') - 300 - 32;
    canvas.height = 24;

    editor.on('tools:clear', function () {
        events = [];
        eventsIndex = { };
    });

    editor.on('tools:timeline:add', function (item) {
        var found = false;

        // check if can extend existing event
        for (var i = 0; i < events.length; i++) {
            if (events[i].t2 !== null && events[i].k === item.k && (events[i].t - 1) <= item.t && (events[i].t2 === -1 || (events[i].t2 + 1) >= item.t)) {
                found = true;
                events[i].t2 = item.t2;
                eventsIndex[item.i] = events[i];
                break;
            }
        }

        if (! found) {
            var obj = {
                i: item.i,
                t: item.t,
                t2: item.t2,
                k: item.k
            };
            events.push(obj);
            eventsIndex[obj.i] = obj;
        }
    });

    editor.on('tools:timeline:update', function (item) {
        if (! enabled || ! eventsIndex[item.i])
            return;

        eventsIndex[item.i].t2 = item.t2;
    });

    editor.on('tools:render', render);
});


/* launch/tools-timeline.js */
editor.once('load', function () {
    'use strict';

    // variables
    var enabled = editor.call('tools:enabled');
    var counter = 0;
    var scale = 0.2;
    var events = [];
    var cacheAssetLoading = { };
    var cacheShaderCompile = [];
    var cacheShaderCompileEvents = [];
    var cacheLightmapper = null;
    var cacheLightmapperEvent = null;
    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    // canvas
    var canvas = document.createElement('canvas');
    canvas.classList.add('timeline');
    editor.call('tools:root').appendChild(canvas);

    // context
    var ctx = canvas.getContext('2d');

    // colors for different kinds of events
    var kindColors = {
        '': '#ff0',
        'asset': '#6f6',
        'shader': '#f60',
        'update': '#06f',
        'render': '#07f',
        'physics': '#0ff',
        'lightmap': '#f6f'
    };
    var kindColorsOverview = {
        '': '#ff0',
        'asset': '#6f6',
        'shader': '#f60',
        'update': '#06f',
        'render': '#07f',
        'physics': '#0ff',
        'lightmap': '#f6f'
    };

    var render = function () {
        var i;
        var x;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var barMargin = 1;
        var barHeight = 8;
        var stack = [];
        var scaleMs = 1000 * scale;
        var now = editor.call('tools:time:now');
        var scrollTime = editor.call('tools:scroll:time');
        var timeHover = editor.call('tools:time:hover');
        ctx.textBaseline = 'alphabetic';

        // grid
        var secondsX = Math.floor(canvas.width * scale);
        ctx.strokeStyle = '#2c2c2c';
        ctx.fillStyle = '#989898';
        var offset = scaleMs - ((scrollTime * scale) % scaleMs) - scaleMs;
        for (x = 0; x <= secondsX; x++) {
            var barX = Math.floor(x * scaleMs + offset) + 0.5;
            if (x > 0) {
                ctx.beginPath();
                ctx.moveTo(barX, 0);
                ctx.lineTo(barX, canvas.height);
                ctx.stroke();
            }

            var s = Math.floor(x + (scrollTime / 1000));
            var m = Math.floor(s / 60);
            s %= 60;
            ctx.fillText((m ? m + 'm ' : '') + s + 's', barX + 2.5, canvas.height - 2.5);
        }

        // events
        var e, x2 = 0, y;
        x = 0;
        for (i = 0; i < events.length; i++) {
            e = events[i];
            x = Math.floor((e.t - scrollTime) * scale);

            if (x > canvas.width)
                break;

            // time
            if (e.t2 !== null) {
                if (isNaN(e.t2)) {
                    console.log(e);
                    continue;
                }
                // range
                var t2 = e.t2 - scrollTime;
                if (e.t2 === -1)
                    t2 = now - scrollTime;


                x2 = Math.max(Math.floor(t2 * scale), x + 1);

                if (x2 < 0)
                    continue;

                y = 0;
                var foundY = false;
                for (var n = 0; n < stack.length; n++) {
                    if (stack[n] < e.t) {
                        stack[n] = t2 + scrollTime;
                        y = n * (barHeight + barMargin);
                        foundY = true;
                        break;
                    }
                }
                if (! foundY) {
                    y = stack.length * (barHeight + barMargin);
                    stack.push(t2 + scrollTime);
                }

                ctx.beginPath();
                ctx.rect(x + 0.5, y + 1, x2 - x + 0.5, barHeight);
                ctx.fillStyle = kindColors[e.k] || '#fff';
                ctx.fill();
            } else {
                if (x < 0)
                    continue;

                // single event
                ctx.beginPath();
                ctx.moveTo(x + 0.5, 1);
                ctx.lineTo(x + 0.5, canvas.height - 1);
                ctx.strokeStyle = kindColors[e.k] || '#fff';
                ctx.stroke();
            }
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        for (i = 0; i < events.length; i++) {
            e = events[i];
            x = Math.floor((e.t - scrollTime) * scale);

            if (x > canvas.width)
                break;

            if (e.t2 !== null || x < 0)
                continue;

            // name
            if (e.n) {
                ctx.fillStyle = kindColors[e.k] || '#fff';
                ctx.strokeText(e.n, x + 2.5, canvas.height - 12.5);
                ctx.strokeText((e.t / 1000).toFixed(2) + 's', x + 2.5, canvas.height - 2.5);
                ctx.fillText(e.n, x + 2.5, canvas.height - 12.5);
                ctx.fillText((e.t / 1000).toFixed(2) + 's', x + 2.5, canvas.height - 2.5);
            }
        }
        ctx.lineWidth = 1;

        // now
        ctx.beginPath();
        ctx.moveTo(Math.floor((now - scrollTime) * scale) + 0.5, 0);
        ctx.lineTo(Math.floor((now - scrollTime) * scale) + 0.5, canvas.height);
        ctx.strokeStyle = '#989898';
        ctx.stroke();

        // hover
        if (timeHover > 0) {
            x = (timeHover - scrollTime) * scale;
            ctx.beginPath();
            ctx.moveTo(Math.floor(x) + 0.5, 0);
            ctx.lineTo(Math.floor(x) + 0.5, canvas.height);
            ctx.strokeStyle = '#989898';
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#fff';
            ctx.strokeText((timeHover / 1000).toFixed(1) + 's', Math.floor(x) + 2.5, canvas.height - 22.5);
            ctx.fillText((timeHover / 1000).toFixed(1) + 's', Math.floor(x) + 2.5, canvas.height - 22.5);
            ctx.lineWidth = 1;
        }
    };

    // resize
    editor.on('tools:resize', function (width, height) {
        canvas.width = width - 300 - 32;
        canvas.height = 275;
        scale = canvas.width / editor.call('tools:time:capacity');
        ctx.font = '10px Arial';
        render();
    });
    canvas.width = editor.call('tools:size:width') - 300 - 32;
    canvas.height = 275;
    ctx.font = '10px Arial';
    scale = canvas.width / editor.call('tools:time:capacity');

    editor.on('tools:clear', function () {
        events = [];
        cacheAssetLoading = { };
        cacheShaderCompile = [];
        cacheShaderCompileEvents = [];
    });

    editor.on('tools:state', function (state) {
        enabled = state;
    });

    editor.method('tools:timeline:color', function (kind) {
        return kindColorsOverview[kind] || '#fff';
    });

    // add event to history
    var addEvent = function (args) {
        if (! enabled) return;

        var e = {
            i: ++counter,
            t: args.time,
            t2: args.time2 || null,
            n: args.name || '',
            k: args.kind || ''
        };
        events.push(e);
        editor.emit('tools:timeline:add', e);
        return e;
    };
    editor.method('tools:timeline:add', addEvent);

    // subscribe to app reload start
    app.once('preload:start', function () {
        if (! enabled) return;

        addEvent({
            time: editor.call('tools:time:now'),
            name: 'preload'
        });
    });

    // subscribe to app start
    app.once('start', function () {
        if (! enabled) return;

        addEvent({
            time: editor.call('tools:time:now'),
            name: 'start'
        });
    });


    // render frames
    // app.on('frameEnd', function() {
    //     var e = addEvent(app.stats.frame.renderStart - editor.call('tools:time:beginning'), null, 'render');
    //     e.t2 = (app.stats.frame.renderStart - editor.call('tools:time:beginning')) + app.stats.frame.renderTime;
    // });

    // subscribe to asset loading start
    app.assets.on('load:start', function (asset) {
        if (! enabled) return;

        cacheAssetLoading[asset.id] = addEvent({
            time: editor.call('tools:time:now'),
            time2: -1,
            kind: 'asset'
        });
    });

    // subscribe to asset loading end
    app.assets.on('load', function (asset) {
        if (! enabled || ! cacheAssetLoading[asset.id])
            return;

        cacheAssetLoading[asset.id].t2 = editor.call('tools:time:now');
        editor.emit('tools:timeline:update', cacheAssetLoading[asset.id]);
        delete cacheAssetLoading[asset.id];
    });


    var onShaderStart = function (evt) {
        if (! enabled) return;

        var time = evt.timestamp;
        if (editor.call('tools:epoc'))
            time -= editor.call('tools:time:beginning');

        var item = addEvent({
            time: time,
            time2: -1,
            kind: 'shader'
        });

        cacheShaderCompile.push(evt.target);
        cacheShaderCompileEvents[cacheShaderCompile.length - 1] = item;
    };

    var onShaderEnd = function (evt) {
        if (! enabled) return;

        var ind = cacheShaderCompile.indexOf(evt.target);
        if (ind === -1)
            return;

        var time = evt.timestamp;
        if (editor.call('tools:epoc'))
            time -= editor.call('tools:time:beginning');

        cacheShaderCompileEvents[ind].t2 = time;
        editor.emit('tools:timeline:update', cacheShaderCompileEvents[ind]);
        cacheShaderCompile.splice(ind, 1);
        cacheShaderCompileEvents.splice(ind, 1);
    };

    var onLightmapperStart = function (evt) {
        if (! enabled) return;

        var time = evt.timestamp;
        if (editor.call('tools:epoc'))
            time -= editor.call('tools:time:beginning');

        var item = addEvent({
            time: time,
            time2: -1,
            kind: 'lightmap'
        });

        cacheLightmapper = evt.target;
        cacheLightmapperEvent = item;
    };

    var onLightmapperEnd = function (evt) {
        if (! enabled) return;

        if (cacheLightmapper !== evt.target)
            return;

        var time = evt.timestamp;
        if (editor.call('tools:epoc'))
            time -= editor.call('tools:time:beginning');

        cacheLightmapperEvent.t2 = time;
        editor.emit('tools:timeline:update', cacheLightmapperEvent);
        cacheLightmapper = null;
    };

    // subscribe to shader compile and linking
    app.graphicsDevice.on('shader:compile:start', onShaderStart);
    app.graphicsDevice.on('shader:link:start', onShaderStart);
    app.graphicsDevice.on('shader:compile:end', onShaderEnd);
    app.graphicsDevice.on('shader:link:end', onShaderEnd);

    // subscribe to lightmapper baking
    app.graphicsDevice.on('lightmapper:start', onLightmapperStart);
    app.graphicsDevice.on('lightmapper:end', onLightmapperEnd);

    // add performance.timing events if available
    if (performance.timing) {
        // dom interactive
        addEvent({
            time: performance.timing.domInteractive - editor.call('tools:time:beginning'),
            name: 'dom'
        });
        // document load
        addEvent({
            time: performance.timing.loadEventEnd - editor.call('tools:time:beginning'),
            name: 'load'
        });
    }

    editor.on('tools:render', render);
});


/* launch/tools-frame.js */
editor.once('load', function () {
    'use strict';

    var enabled = editor.call('tools:enabled');
    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    editor.on('tools:state', function (state) {
        enabled = state;
    });

    var fieldsCustom = { };

    var panel = document.createElement('div');
    panel.classList.add('frame');
    editor.call('tools:root').appendChild(panel);

    var addPanel = function (args) {
        var element = document.createElement('div');
        element.classList.add('panel');
        panel.appendChild(element);

        element._header = document.createElement('div');
        element._header.classList.add('header');
        element._header.textContent = args.title;
        element.appendChild(element._header);

        element._header.addEventListener('click', function () {
            if (element.classList.contains('folded')) {
                element.classList.remove('folded');
            } else {
                element.classList.add('folded');
            }
        }, false);

        return element;
    };

    var addField = function (args) {
        var row = document.createElement('div');
        row.classList.add('row');

        row._title = document.createElement('div');
        row._title.classList.add('title');
        row._title.textContent = args.title || '';
        row.appendChild(row._title);

        row._field = document.createElement('div');
        row._field.classList.add('field');
        row._field.textContent = args.value || '-';
        row.appendChild(row._field);

        // eslint-disable-next-line accessor-pairs
        Object.defineProperty(row, 'value', {
            set: function (value) {
                this._field.textContent = value !== undefined ? value : '';
            }
        });

        return row;
    };

    var panelApp;

    editor.method('tools:frame:field:add', function (name, title, value) {
        var field = addField({
            title: title,
            value: value
        });
        fieldsCustom[name] = field;
        panelApp.appendChild(field);
    });

    editor.method('tools:frame:field:value', function (name, value) {
        if (! fieldsCustom[name])
            return;

        fieldsCustom[name].value = value;
    });


    // convert number of bytes to human form
    var bytesToHuman = function (bytes) {
        if (isNaN(bytes) || bytes === 0) return '0 B';
        var k = 1000;
        var sizes = ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    };


    // frame
    var panelFrame = addPanel({
        title: 'Frame'
    });
    // scene
    var panelScene = addPanel({
        title: 'Scene'
    });
    // drawCalls
    var panelDrawCalls = addPanel({
        title: 'Draw Calls'
    });
    // batching
    var panelBatching = addPanel({
        title: 'Batching'
    });
    // particles
    var panelParticles = addPanel({
        title: 'Particles'
    });
    // shaders
    var panelShaders = addPanel({
        title: 'Shaders'
    });
    // lightmapper
    var panelLightmap = addPanel({
        title: 'Lightmapper'
    });
    // vram
    var panelVram = addPanel({
        title: 'VRAM'
    });
    // app
    panelApp = addPanel({
        title: 'App'
    });


    var fields = [{
        key: ['frame', 'fps'],
        panel: panelFrame,
        title: 'FPS',
        update: false
    }, {
        key: ['frame', 'ms'],
        panel: panelFrame,
        title: 'MS',
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['frame', 'cameras'],
        title: 'Cameras',
        panel: panelFrame
    }, {
        key: ['frame', 'cullTime'],
        title: 'Cull Time',
        panel: panelFrame,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['frame', 'sortTime'],
        title: 'Sort Time',
        panel: panelFrame,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['frame', 'shaders'],
        title: 'Shaders',
        panel: panelFrame
    }, {
        key: ['frame', 'materials'],
        title: 'Materials',
        panel: panelFrame
    }, {
        key: ['frame', 'triangles'],
        title: 'Triangles',
        panel: panelFrame,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['frame', 'otherPrimitives'],
        title: 'Other Primitives',
        panel: panelFrame
    }, {
        key: ['frame', 'shadowMapUpdates'],
        title: 'ShadowMaps Updates',
        panel: panelFrame
    }, {
        key: ['frame', 'shadowMapTime'],
        title: 'ShadowMaps Time',
        panel: panelFrame,
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['frame', 'updateTime'],
        title: 'Update Time',
        panel: panelFrame,
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['frame', 'physicsTime'],
        title: 'Physics Time',
        panel: panelFrame,
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['frame', 'renderTime'],
        title: 'Render Time',
        panel: panelFrame,
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['frame', 'forwardTime'],
        title: 'Forward Time',
        panel: panelFrame,
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['scene', 'meshInstances'],
        title: 'Mesh Instances',
        panel: panelScene
    }, {
        key: ['scene', 'drawCalls'],
        title: 'Draw Calls (potential)',
        panel: panelScene
    }, {
        key: ['scene', 'lights'],
        title: 'Lights',
        panel: panelScene
    }, {
        key: ['scene', 'dynamicLights'],
        title: 'Lights (Dynamic)',
        panel: panelScene
    }, {
        key: ['scene', 'bakedLights'],
        title: 'Lights (Baked)',
        panel: panelScene
    }, {
        key: ['drawCalls', 'total'],
        title: 'Total',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'forward'],
        title: 'Forward',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'skinned'],
        title: 'Skinned',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'shadow'],
        title: 'Shadow',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'depth'],
        title: 'Depth',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'instanced'],
        title: 'Instanced',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'removedByInstancing'],
        title: 'Instancing Benefit',
        panel: panelDrawCalls,
        format: function (value) {
            return '-' + value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'immediate'],
        title: 'Immediate',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['drawCalls', 'misc'],
        title: 'Misc',
        panel: panelDrawCalls,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['batcher', 'createTime'],
        title: 'Create Time',
        panel: panelBatching,
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['batcher', 'updateLastFrameTime'],
        title: 'Update Last Frame Time',
        panel: panelBatching,
        format: function (value) {
            return value.toFixed(2);
        }
    }, {
        key: ['particles', 'updatesPerFrame'],
        title: 'Updates',
        panel: panelParticles
    }, {
        key: ['particles', 'frameTime'],
        title: 'Update Time',
        panel: panelParticles,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['shaders', 'linked'],
        title: 'Linked',
        panel: panelShaders,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['shaders', 'vsCompiled'],
        title: 'Compiled VS',
        panel: panelShaders,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['shaders', 'fsCompiled'],
        title: 'Compiled FS',
        panel: panelShaders,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['shaders', 'materialShaders'],
        title: 'Materials',
        panel: panelShaders,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['shaders', 'compileTime'],
        title: 'Compile Time',
        panel: panelShaders,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['lightmapper', 'renderPasses'],
        title: 'Render Passes',
        panel: panelLightmap,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['lightmapper', 'lightmapCount'],
        title: 'Textures',
        panel: panelLightmap,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['lightmapper', 'shadersLinked'],
        title: 'Shaders Linked',
        panel: panelLightmap,
        format: function (value) {
            return value.toLocaleString();
        }
    }, {
        key: ['lightmapper', 'totalRenderTime'],
        title: 'Total Render Time',
        panel: panelLightmap,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['lightmapper', 'forwardTime'],
        title: 'Forward Time',
        panel: panelLightmap,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['lightmapper', 'fboTime'],
        title: 'FBO Time',
        panel: panelLightmap,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['lightmapper', 'shadowMapTime'],
        title: 'ShadowMap Time',
        panel: panelLightmap,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['lightmapper', 'compileTime'],
        title: 'Shader Compile Time',
        panel: panelLightmap,
        format: function (value) {
            return value.toFixed(3);
        }
    }, {
        key: ['vram', 'ib'],
        title: 'Index Buffers',
        panel: panelVram,
        format: bytesToHuman
    }, {
        key: ['vram', 'vb'],
        title: 'Vertex Buffers',
        panel: panelVram,
        format: bytesToHuman
    }, {
        key: ['vram', 'texShadow'],
        title: 'Shadowmaps',
        panel: panelVram,
        format: bytesToHuman
    }, {
        key: ['vram', 'texLightmap'],
        title: 'Lightmaps',
        panel: panelVram,
        format: bytesToHuman
    }, {
        key: ['vram', 'texAsset'],
        title: 'Texture Assets',
        panel: panelVram,
        format: bytesToHuman
    }, {
        key: ['vram', 'tex'],
        title: 'Textures Other',
        panel: panelVram,
        format: function (bytes) {
            return bytesToHuman(bytes - (app.stats.vram.texLightmap + app.stats.vram.texShadow + app.stats.vram.texAsset));
        }
    }, {
        key: ['vram', 'tex'],
        title: 'Textures Total',
        panel: panelVram,
        format: bytesToHuman
    }, {
        key: ['vram', 'totalUsed'],
        title: 'Total',
        panel: panelVram,
        format: bytesToHuman
    }];

    // create fields
    for (var i = 0; i < fields.length; i++) {
        fields[i].field = addField({
            title: fields[i].title || fields[i].key[1]
        });
        fields[i].panel.appendChild(fields[i].field);

        if (fields[i].custom)
            fieldsCustom[fields[i].custom] = fields[i].field;
    }


    // controlls for skip rendering
    var row = document.createElement('div');
    row.classList.add('row');
    panelDrawCalls.appendChild(row);

    var title = document.createElement('div');
    title.classList.add('title');
    title.textContent = 'Camera Drawcalls Limit';
    title.style.fontSize = '11px';
    row.appendChild(title);

    var cameraSkipFrames;
    var rowCameraSkip;

    var cameras = document.createElement('select');
    cameras.classList.add('cameras');
    row.appendChild(cameras);
    cameras.addEventListener('mousedown', function (evt) {
        evt.stopPropagation();
    });
    cameras.addEventListener('change', function () {
        if (cameras.value === 'none') {
            rowCameraSkip.style.display = 'none';
            pc.ForwardRenderer.skipRenderCamera = null;
        } else {
            rowCameraSkip.style.display = '';

            var entity = app.root.findByGuid(cameras.value);
            if (entity && entity.camera) {
                pc.ForwardRenderer.skipRenderCamera = entity.camera.camera;
                pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
            }
        }
    });

    var cameraIndex = { };
    var cameraAddQueue = [];

    var cameraNone = document.createElement('option');
    cameraNone.value = 'none';
    cameraNone.selected = true;
    cameraNone.textContent = 'Disabled';
    cameras.appendChild(cameraNone);


    // frames control
    rowCameraSkip = document.createElement('div');
    rowCameraSkip.classList.add('row');
    rowCameraSkip.style.display = 'none';
    panelDrawCalls.appendChild(rowCameraSkip);

    var cameraSkipFramesLeft0 = document.createElement('div');
    cameraSkipFramesLeft0.classList.add('drawcallsLimitButton');
    cameraSkipFramesLeft0.textContent = '|<';
    cameraSkipFramesLeft0.addEventListener('click', function () {
        cameraSkipFrames.value = '0';
        pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
    });
    rowCameraSkip.appendChild(cameraSkipFramesLeft0);

    var cameraSkipFramesLeft10 = document.createElement('div');
    cameraSkipFramesLeft10.classList.add('drawcallsLimitButton');
    cameraSkipFramesLeft10.textContent = '<<';
    cameraSkipFramesLeft10.addEventListener('click', function () {
        cameraSkipFrames.value = Math.max(0, (parseInt(cameraSkipFrames.value, 10) || 0) - 10);
        pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
    });
    rowCameraSkip.appendChild(cameraSkipFramesLeft10);

    var cameraSkipFramesLeft1 = document.createElement('div');
    cameraSkipFramesLeft1.classList.add('drawcallsLimitButton');
    cameraSkipFramesLeft1.textContent = '<';
    cameraSkipFramesLeft1.addEventListener('click', function () {
        cameraSkipFrames.value = Math.max(0, (parseInt(cameraSkipFrames.value, 10) || 0) - 1);
        pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
    });
    rowCameraSkip.appendChild(cameraSkipFramesLeft1);

    cameraSkipFrames = document.createElement('input');
    cameraSkipFrames.classList.add('framesSkip');
    cameraSkipFrames.type = 'text';
    cameraSkipFrames.value = '0';
    rowCameraSkip.appendChild(cameraSkipFrames);
    cameraSkipFrames.addEventListener('mousedown', function (evt) {
        evt.stopPropagation();
    });
    cameraSkipFrames.addEventListener('change', function () {
        pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
    }, false);
    cameraSkipFrames.addEventListener('keydown', function (evt) {
        var inc = 0;

        if (evt.keyCode === 38) {
            inc = evt.shiftKey ? 10 : 1;
        } else if (evt.keyCode === 40) {
            inc = evt.shiftKey ? -10 : -1;
        }

        if (inc === 0)
            return;

        evt.preventDefault();
        evt.stopPropagation();

        cameraSkipFrames.value = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, (parseInt(cameraSkipFrames.value, 10) || 0) + inc));
        pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
    });

    var cameraSkipFramesRight1 = document.createElement('div');
    cameraSkipFramesRight1.classList.add('drawcallsLimitButton');
    cameraSkipFramesRight1.textContent = '>';
    cameraSkipFramesRight1.addEventListener('click', function () {
        cameraSkipFrames.value = Math.min(Number.MAX_SAFE_INTEGER, (parseInt(cameraSkipFrames.value, 10) || 0) + 1);
        pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
    });
    rowCameraSkip.appendChild(cameraSkipFramesRight1);

    var cameraSkipFramesRight10 = document.createElement('div');
    cameraSkipFramesRight10.classList.add('drawcallsLimitButton');
    cameraSkipFramesRight10.textContent = '>>';
    cameraSkipFramesRight10.addEventListener('click', function () {
        cameraSkipFrames.value = Math.min(Number.MAX_SAFE_INTEGER, (parseInt(cameraSkipFrames.value, 10) || 0) + 10);
        pc.ForwardRenderer.skipRenderAfter = parseInt(cameraSkipFrames.value, 10) || 0;
    });
    rowCameraSkip.appendChild(cameraSkipFramesRight10);


    var cameraAdd = function (id) {
        if (cameraAddQueue) {
            cameraAddQueue.push(id);
            return;
        }

        if (cameraIndex[id])
            return;

        var entity = app.root.findByGuid(id);
        if (! entity)
            return;

        var option = cameraIndex[id] = document.createElement('option');
        option.value = id;
        option.entity = entity;
        option.textContent = entity.name;
        cameras.appendChild(option);
    };

    var cameraRemove = function (id) {
        if (! cameraIndex[id])
            return;

        if (cameraIndex[id].selected)
            cameras.value = 'none';

        cameras.removeChild(cameraIndex[id]);
        delete cameraIndex[id];
    };

    editor.on('entities:add', function (obj) {
        var id = obj.get('resource_id');

        obj.on('components.camera:set', function () {
            cameraAdd(id);
        });
        obj.on('components.camera:unset', function () {
            cameraRemove(id);
        });
        obj.on('name:set', function (value) {
            if (! cameraIndex[id])
                return;

            cameraIndex.textContent = value;
        });

        if (obj.has('components.camera'))
            cameraAdd(id);
    });

    app.on('start', function () {
        if (cameraAddQueue) {
            var queue = cameraAddQueue;
            cameraAddQueue = null;

            for (var i = 0; i < queue.length; i++)
                cameraAdd(queue[i]);
        }
    });

    // update frame fields
    app.on('frameEnd', function () {
        if (! enabled)
            return;

        for (var i = 0; i < fields.length; i++) {
            if (fields[i].ignore)
                continue;

            if (! app.stats.hasOwnProperty(fields[i].key[0]) || ! app.stats[fields[i].key[0]].hasOwnProperty(fields[i].key[1]))
                continue;

            var value = app.stats[fields[i].key[0]][fields[i].key[1]];

            if (fields[i].format)
                value = fields[i].format(value);

            fields[i].field.value = value;
        }
    });
});


/* launch/tools-toolbar.js */
editor.once('load', function () {
    'use strict';

    // variables
    var toolbar = document.createElement('div');
    toolbar.classList.add('toolbar');
    editor.call('tools:root').appendChild(toolbar);

    // button close
    var btnClose = document.createElement('div');
    btnClose.innerHTML = '&#57650;';
    btnClose.classList.add('button');
    toolbar.appendChild(btnClose);
    btnClose.addEventListener('click', function () {
        editor.call('tools:disable');
    });
});


/* launch/entities.js */
editor.once('load', function () {
    'use strict';

    var entities = new ObserverList({
        index: 'resource_id'
    });

    function createLatestFn(resourceId) {
        return function () {
            return entities.get(resourceId);
        };
    }

    // on adding
    entities.on('add', function (obj) {
        editor.emit('entities:add', obj);
    });

    editor.method('entities:add', function (obj) {
        entities.add(obj);

        // function to get latest version of entity observer
        obj.latestFn = createLatestFn(obj.get('resource_id'));
    });

    // on removing
    entities.on('remove', function (obj) {
        editor.emit('entities:remove', obj);
    });

    editor.method('entities:remove', function (obj) {
        entities.remove(obj);
    });

    // remove all entities
    editor.method('entities:clear', function () {
        entities.clear();
    });

    // Get entity by resource id
    editor.method('entities:get', function (resourceId) {
        return entities.get(resourceId);
    });

    editor.on('scene:raw', function (data) {
        for (var key in data.entities) {
            entities.add(new Observer(data.entities[key]));
        }

        editor.emit('entities:load', data);
    });
});


/* launch/entities-sync.js */
editor.once('load', function () {
    'use strict';

    var syncPaths = [
        'name',
        'parent',
        'children',
        'position',
        'rotation',
        'scale',
        'enabled',
        'template_id',
        'template_ent_ids',
        'components'
    ];


    editor.on('entities:add', function (entity) {
        if (entity.sync)
            return;

        entity.sync = new ObserverSync({
            item: entity,
            prefix: ['entities', entity.get('resource_id')],
            paths: syncPaths
        });
    });


    // server > client
    editor.on('realtime:op:entities', function (op) {
        var entity = null;
        if (op.p[1])
            entity = editor.call('entities:get', op.p[1]);

        if (op.p.length === 2) {
            if (op.hasOwnProperty('od')) {
                // delete entity
                if (entity) {
                    editor.call('entities:remove', entity);
                } else {
                    console.log('delete operation entity not found', op);
                }
            } else if (op.hasOwnProperty('oi')) {
                // new entity
                editor.call('entities:add', new Observer(op.oi));
            } else {
                console.log('unknown operation', op);
            }
        } else if (entity) {
            // write operation
            entity.sync.write(op);
        } else {
            console.log('unknown operation', op);
        }
    });
});


/* editor/schema/schema.js */
editor.once('load', function () {
    'use strict';

    /**
     * Gets the schema object that corresponds to the specified dot separated
     * path from the specified schema object.
     *
     * @param {string} path - The path separated by dots
     * @param {object} schema - The schema object
     * @returns {object} The sub schema
     */
    var pathToSchema = function (path, schema) {
        if (typeof(path) === 'string') {
            path = path.split('.');
        }

        if (typeof(path) === 'number') {
            path = [path];
        }

        var result = schema;
        for (let i = 0, len = path.length; i < len; i++) {
            var p = path[i];
            if (result.$type === 'map' && result.$of) {
                result = result.$of;
            } else if (result[p] || (result.$type && result.$type[p])) {
                result = result[p] || result.$type[p];
            } else if (!isNaN(parseInt(p, 10)) && Array.isArray(result) || Array.isArray(result.$type)) {
                result = Array.isArray(result) ? result[0] : result.$type[0];
            } else {
                return null;
            }
        }

        return result;
    };

    /**
     * Converts the specified schema object to a type recursively.
     *
     * @param {object} schema - The schema object or field of a parent schema object.
     * @param {boolean} fixedLength - Whether the specified schema field has a fixed length if it's an array type.
     * @returns {string} The type
     */
    var schemaToType = function (schema, fixedLength) {
        if (typeof schema === 'string') {
            if (schema === 'map' || schema === 'mixed') {
                schema = 'object';
            }

            return schema.toLowerCase();
        }

        if (schema.$editorType) {
            return schema.$editorType;
        }

        if (Array.isArray(schema)) {
            if (schema[0] === 'number' && fixedLength) {
                if (fixedLength === 2) {
                    return 'vec2';
                } else if (fixedLength === 3) {
                    return 'vec3';
                } else if (fixedLength === 4) {
                    return 'vec4';
                }
            }

            return 'array:' + schemaToType(schema[0]);
        }

        if (schema.$type) {
            return schemaToType(schema.$type, schema.$length);
        }

        return 'object';
    };

    /**
     * Gets the type of the specified schema object,
     *
     * @param {object} schemaField - A field of the schema
     * @param {boolean} fixedLength - Whether this field has a fixed length if it's an array type
     * @returns {string} The type
     */
    editor.method('schema:getType', function (schemaField, fixedLength) {
        return schemaToType(schemaField, fixedLength);
    });

    /**
     * Gets the type of the specified path from the specified schema
     *
     * @param {object} schema - The schema object
     * @param {string} path - A path separated by dots
     * @param {string} The - type
     */
    editor.method('schema:getTypeForPath', function (schema, path) {
        var subSchema = pathToSchema(path, schema);
        var type = subSchema && schemaToType(subSchema);

        if (! type) {
            console.warn('Unknown type for ' + path);
            type = 'string';
        }

        return type;
    });

    editor.method('schema:getMergeMethodForPath', function (schema, path) {
        var h = pathToSchema(path, schema);

        return h && h.$mergeMethod;
    });
});


/* editor/schema/schema-components.js */
editor.once('load', function () {
    'use strict';

    var projectSettings = editor.call('settings:project');

    var schema = config.schema.scene.entities.$of.components;

    var componentName;

    // make titles for each component
    for (componentName in schema) {
        var title;
        switch (componentName) {
            case 'audiosource':
                title = 'Audio Source';
                break;
            case 'audiolistener':
                title = 'Audio Listener';
                break;
            case 'particlesystem':
                title = 'Particle System';
                break;
            case 'rigidbody':
                title = 'Rigid Body';
                break;
            case 'scrollview':
                title = 'Scroll View';
                break;
            case 'layoutgroup':
                title = 'Layout Group';
                break;
            case 'layoutchild':
                title = 'Layout Child';
                break;
            default:
                title = componentName[0].toUpperCase() + componentName.substring(1);
                break;
        }

        schema[componentName].$title = title;
    }

    // some property defaults should be dynamic so
    // patch them in
    if (schema.screen) {
        // default resolution to project resolution for screen components
        schema.screen.resolution.$default = function () {
            return [
                projectSettings.get('width'),
                projectSettings.get('height')
            ];
        };
        schema.screen.referenceResolution.$default = function () {
            return [
                projectSettings.get('width'),
                projectSettings.get('height')
            ];
        };
    }

    if (schema.element) {
        schema.element.fontAsset.$default = function () {
            // Reuse the last selected font, if it still exists in the library
            var lastSelectedFontId = editor.call('settings:projectUser').get('editor.lastSelectedFontId');
            var lastSelectedFontStillExists = lastSelectedFontId !== -1 && !!editor.call('assets:get', lastSelectedFontId);

            if (lastSelectedFontStillExists) {
                return lastSelectedFontId;
            }

            // Otherwise, select the first available font in the library
            var firstAvailableFont = editor.call('assets:findOne', function (asset) { return ! asset.get('source') && asset.get('type') === 'font'; });

            return firstAvailableFont ? parseInt(firstAvailableFont[1].get('id'), 10) : null;
        };
    }

    // Paths in components that represent assets.
    // Does not include asset script attributes.
    var assetPaths = [];
    var gatherAssetPathsRecursively = function (schemaField, path) {
        if (schemaField.$editorType === 'asset' || schemaField.$editorType === 'array:asset') {
            // this is for cases like components.model.mapping
            assetPaths.push(path);
            return;
        }

        for (const fieldName in schemaField) {
            if (fieldName.startsWith('$')) continue;

            var field = schemaField[fieldName];
            var type = editor.call('schema:getType', field);
            if (type === 'asset' || type === 'array:asset') {
                assetPaths.push(path + '.' + fieldName);
            } else if (type === 'object' && field.$of) {
                gatherAssetPathsRecursively(field.$of, path + '.' + fieldName + '.*');
            }
        }
    };

    for (componentName in schema) {
        gatherAssetPathsRecursively(schema[componentName], 'components.' + componentName);
    }


    editor.method('components:assetPaths', function () {
        return assetPaths;
    });

    if (editor.call('settings:project').get('useLegacyScripts')) {
        schema.script.scripts.$default = [];
        delete schema.script.order;
    }

    var list = Object.keys(schema).sort(function (a, b) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        }

        return 0;
    });

    editor.method('components:convertValue', function (component, property, value) {
        var result = value;

        if (value) {
            var data = schema[component];
            if (data && data[property]) {
                var type = editor.call('schema:getType', data[property]);
                switch (type) {
                    case 'rgb':
                        result = new pc.Color(value[0], value[1], value[2]);
                        break;
                    case 'rgba':
                        result = new pc.Color(value[0], value[1], value[2], value[3]);
                        break;
                    case 'vec2':
                        result = new pc.Vec2(value[0], value[1]);
                        break;
                    case 'vec3':
                        result = new pc.Vec3(value[0], value[1], value[2]);
                        break;
                    case 'vec4':
                        result = new pc.Vec4(value[0], value[1], value[2], value[3]);
                        break;
                    case 'curveset':
                        result = new pc.CurveSet(value.keys);
                        result.type = value.type;
                        break;
                    case 'curve':
                        result = new pc.Curve(value.keys);
                        result.type = value.type;
                        break;
                    case 'entity':
                        result = value; // Entity fields should just be a string guid
                        break;
                }
            }
        }

        // for batchGroupId convert null to -1 for runtime
        if (result === null && property === 'batchGroupId')
            result = -1;

        return result;
    });

    editor.method('components:list', function () {
        var result = list.slice(0);
        var idx;

        // filter out zone (which is not really supported)
        if (!editor.call('users:hasFlag', 'hasZoneComponent')) {
            idx = result.indexOf('zone');
            if (idx !== -1) {
                result.splice(idx, 1);
            }
        }

        return result;
    });

    editor.method('components:schema', function () {
        return schema;
    });

    editor.method('components:getDefault', function (component) {
        var result = {};
        for (const fieldName in schema[component]) {
            if (fieldName.startsWith('$')) continue;
            var field = schema[component][fieldName];
            if (field.hasOwnProperty('$default')) {
                result[fieldName] = utils.deepCopy(field.$default);
            }
        }

        resolveLazyDefaults(result);

        return result;
    });

    function resolveLazyDefaults(defaults) {
        // Any functions in the default property set are used to provide
        // lazy resolution, to handle cases where the values are not known
        // at startup time.
        Object.keys(defaults).forEach(function (key) {
            var value = defaults[key];

            if (typeof value === 'function') {
                defaults[key] = value();
            }
        });
    }

    editor.method('components:getFieldsOfType', function (component, type) {
        var matchingFields = [];

        for (const field in schema[component]) {
            if (schema[component][field].$editorType === type) {
                matchingFields.push(field);
            }
        }

        return matchingFields;
    });

});


/* editor/assets/assets-bundles.js */
editor.once('load', function () {
    'use strict';

    var INVALID_TYPES = ['script', 'folder', 'bundle'];

    // stores <asset id, [bundle assets]> index for mapping
    // any asset it to the bundles that it's referenced from
    var bundlesIndex = {};

    // stores all bundle assets
    var bundleAssets = [];

    var addToIndex = function (assetIds, bundleAsset) {
        if (! assetIds) return;

        for (let i = 0; i < assetIds.length; i++) {
            if (! bundlesIndex[assetIds[i]]) {
                bundlesIndex[assetIds[i]] = [bundleAsset];
                editor.emit('assets:bundles:insert', bundleAsset, assetIds[i]);
            } else {
                if (bundlesIndex[assetIds[i]].indexOf(bundleAsset) === -1) {
                    bundlesIndex[assetIds[i]].push(bundleAsset);
                    editor.emit('assets:bundles:insert', bundleAsset, assetIds[i]);
                }
            }
        }
    };

    // fill bundlexIndex when a new bundle asset is added
    editor.on('assets:add', function (asset) {
        if (asset.get('type') !== 'bundle') return;

        bundleAssets.push(asset);
        addToIndex(asset.get('data.assets'), asset);

        asset.on('data.assets:set', function (assetIds) {
            addToIndex(assetIds, asset);
        });

        asset.on('data.assets:insert', function (assetId) {
            addToIndex([assetId], asset);
        });

        asset.on('data.assets:remove', function (assetId) {
            if (! bundlesIndex[assetId]) return;
            var idx = bundlesIndex[assetId].indexOf(asset);
            if (idx !== -1) {
                bundlesIndex[assetId].splice(idx, 1);
                editor.emit('assets:bundles:remove', asset, assetId);
                if (! bundlesIndex[assetId].length) {
                    delete bundlesIndex[assetId];
                }
            }
        });
    });

    // remove bundle asset from bundlesIndex when a bundle asset is
    // removed
    editor.on('assets:remove', function (asset) {
        if (asset.get('type') !== 'bundle') return;

        var idx = bundleAssets.indexOf(asset);
        if (idx !== -1) {
            bundleAssets.splice(idx, 1);
        }

        for (const id in bundlesIndex) {
            idx = bundlesIndex[id].indexOf(asset);
            if (idx !== -1) {
                bundlesIndex[id].splice(idx, 1);
                editor.emit('assets:bundles:remove', asset, id);

                if (! bundlesIndex[id].length) {
                    delete bundlesIndex[id];
                }
            }
        }
    });

    /**
     * Returns all of the bundle assets for the specified asset
     *
     * @param {Observer} asset - The asset
     * @returns {Observer[]} The bundles for the asset or an empty array.
     */
    editor.method('assets:bundles:listForAsset', function (asset) {
        return bundlesIndex[asset.get('id')] || [];
    });

    /**
     * Returns a list of all the bundle assets
     *
     * @returns {Observer[]} The bundle assets
     */
    editor.method('assets:bundles:list', function () {
        return bundleAssets.slice();
    });

    /**
     * Returns true if the specified asset id is in a bundle
     *
     * @returns {boolean} True of false
     */
    editor.method('assets:bundles:containAsset', function (assetId) {
        return !!bundlesIndex[assetId];
    });

    var isAssetValid = function (asset, bundleAsset) {
        var id = asset.get('id');
        if (asset.get('source')) return false;
        if (INVALID_TYPES.indexOf(asset.get('type')) !== -1) return false;

        if (bundleAsset) {
            var existingAssetIds = bundleAsset.getRaw('data.assets');
            if (existingAssetIds.indexOf(id) !== -1) return false;
        }

        return true;
    };

    /**
     * Checks if the specified asset is valid to be added to a bundle
     * with the specified existing asset ids
     */
    editor.method('assets:bundles:canAssetBeAddedToBundle', isAssetValid);

    /**
     * Adds assets to the bundle asset. Does not add already existing
     * assets or assets with invalid types.
     *
     * @param {Observer[]} assets - The assets to add to the bundle
     * @param {Observer} bundleAsset - The bundle asset
     */
    editor.method('assets:bundles:addAssets', function (assets, bundleAsset) {
        var validAssets = assets.filter(function (asset) {
            return isAssetValid(asset, bundleAsset);
        });

        var len = validAssets.length;
        if (!len) return;

        var undo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (let i = 0; i < len; i++) {
                asset.removeValue('data.assets', validAssets[i].get('id'));
            }
            asset.history.enabled = history;
        };

        var redo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (let i = 0; i < len; i++) {
                if (isAssetValid(validAssets[i], asset)) {
                    asset.insert('data.assets', validAssets[i].get('id'));
                }
            }
            asset.history.enabled = history;
        };

        redo();

        editor.call('history:add', {
            name: 'asset.' + bundleAsset.get('id') + '.data.assets',
            undo: undo,
            redo: redo
        });

        return len;
    });

    /**
     * Removes the specified assets from the specified bundle asset
     *
     * @param {Observer[]} assets - The assets to remove
     * @param {Observer} bundleAsset - The bundle asset
     */
    editor.method('assets:bundles:removeAssets', function (assets, bundleAsset) {
        var redo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (let i = 0; i < assets.length; i++) {
                asset.removeValue('data.assets', assets[i].get('id'));
            }
            asset.history.enabled = history;
        };

        var undo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (let i = 0; i < assets.length; i++) {
                if (isAssetValid(assets[i], asset)) {
                    asset.insert('data.assets', assets[i].get('id'));
                }
            }
            asset.history.enabled = history;
        };

        redo();

        editor.call('history:add', {
            name: 'asset.' + bundleAsset.get('id') + '.data.assets',
            undo: undo,
            redo: redo
        });
    });

    /**
     * Calculates the file size of a bundle Asset by adding up the file
     * sizes of all the assets it references.
     *
     * @param {Observer} The - bundle asset
     * @returns {number} The file size
     */
    editor.method('assets:bundles:calculateSize', function (bundleAsset) {
        var size = 0;
        var assets = bundleAsset.get('data.assets');
        for (let i = 0; i < assets.length; i++) {
            var asset = editor.call('assets:get', assets[i]);
            if (! asset || !asset.has('file.size')) continue;

            size += asset.get('file.size');
        }
        return size;
    });
});


/* launch/viewport-binding-entities.js */
editor.once('load', function () {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    // entities awaiting parent
    var awaitingParent = { };

    // queue for hierarchy resync
    var awaitingResyncHierarchy = false;

    var resyncHierarchy = function () {
        awaitingResyncHierarchy = false;

        // sync hierarchy
        app.root.syncHierarchy();
    };

    var createEntity = function (obj) {
        var entity = new pc.Entity(obj.get('name'));

        entity.setGuid(obj.get('resource_id'));
        entity.setLocalPosition(obj.get('position.0'), obj.get('position.1'), obj.get('position.2'));
        entity.setLocalEulerAngles(obj.get('rotation.0'), obj.get('rotation.1'), obj.get('rotation.2'));
        entity.setLocalScale(obj.get('scale.0'), obj.get('scale.1'), obj.get('scale.2'));
        entity._enabled = obj.has('enabled') ? obj.get('enabled') : true;

        if (obj.has('labels')) {
            obj.get('labels').forEach(function (label) {
                entity.addLabel(label);
            });
        }

        if (obj.has('tags')) {
            obj.get('tags').forEach(function (tag) {
                entity.tags.add(tag);
            });
        }

        entity.template = obj.get('template');

        return entity;
    };

    var processEntity = function (obj) {
        // create entity
        var entity = createEntity(obj);

        // add components
        var components = obj.json().components;
        for (var key in components)
            app.systems[key].addComponent(entity, components[key]);

        // parenting
        if (! obj.get('parent')) {
            // root
            app.root.addChild(entity);

        } else {
            // get parent
            var parent = editor.call('entities:get', obj.get('parent'));
            if (parent) {
                parent = app.root.findByGuid(parent.get('resource_id'));
            }

            if (! parent) {
                // if parent not available, then await
                if (! awaitingParent[obj.get('parent')])
                    awaitingParent[obj.get('parent')] = [];

                // add to awaiting children
                awaitingParent[obj.get('parent')].push(obj);
            } else {
                // if parent available, addChild
                parent.addChild(entity);
            }
        }

        // check if there are awaiting children
        if (awaitingParent[obj.get('resource_id')]) {
            // add all awaiting children
            for (var i = 0; i < awaitingParent[obj.get('resource_id')].length; i++) {
                var awaiting = awaitingParent[obj.get('resource_id')][i];
                entity.addChild(app.root.getByGuid(awaiting.get('resource_id')));
            }

            // delete awaiting queue
            delete awaitingParent[obj.get('resource_id')];
        }

        // queue resync hierarchy
        // done on timeout to allow bulk entity creation
        // without sync after each entity
        if (! awaitingResyncHierarchy) {
            awaitingResyncHierarchy = true;
            setTimeout(resyncHierarchy, 0);
        }

        return entity;
    };

    editor.on('entities:add', function (obj) {
        var sceneLoading = editor.call("isLoadingScene");
        if (! app.root.findByGuid(obj.get('resource_id')) && !sceneLoading) {
            // create entity if it does not exist and all initial entities have loaded
            processEntity(obj);
        }

        var resetPhysics = function (entity) {
            var pos = obj.get('position');
            var rot = obj.get('rotation');
            var scale = obj.get('scale');

            // if the entity has an element component
            // then only set z and let the rest be handled
            // by the element component (unless autoWidth or autoHeight is true in which case we need to be able to modify position)
            if (! entity.element || entity.element.autoWidth || entity.element.autoHeight) {
                entity.setLocalPosition(pos[0], pos[1], pos[2]);
            } else {
                var localPos = entity.getLocalPosition();
                entity.setLocalPosition(localPos.x, localPos.y, pos[2]);
            }

            entity.setLocalEulerAngles(rot[0], rot[1], rot[2]);
            entity.setLocalScale(scale[0], scale[1], scale[2]);

            if (entity.enabled) {
                if (entity.rigidbody && entity.rigidbody.enabled) {
                    entity.rigidbody.syncEntityToBody();

                    // Reset velocities
                    entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
                    entity.rigidbody.angularVelocity = pc.Vec3.ZERO;
                }
            }
        };

        // subscribe to changes
        obj.on('*:set', function (path, value) {
            var entity = app.root.findByGuid(obj.get('resource_id'));
            if (! entity)
                return;

            if (path === 'name') {
                entity.name = obj.get('name');

            } else if (path.startsWith('position')) {
                resetPhysics(entity);

            } else if (path.startsWith('rotation')) {
                resetPhysics(entity);

            } else if (path.startsWith('scale')) {
                resetPhysics(entity);

            } else if (path.startsWith('enabled')) {
                entity.enabled = obj.get('enabled');

            } else if (path.startsWith('parent')) {
                var parent = editor.call('entities:get', obj.get('parent'));
                if (parent && parent.entity && entity.parent !== parent.entity)
                    entity.reparent(parent.entity);
            } else if (path === 'components.model.type' && value === 'asset') {
                // WORKAROUND
                // entity deletes asset when switching to primitive, restore it
                // do this in a timeout to allow the model type to change first
                setTimeout(function () {
                    var assetId = obj.get('components.model.asset');
                    if (assetId)
                        entity.model.asset = assetId;
                });
            }
        });

        obj.on('tags:insert', function (value) {
            var entity = app.root.findByGuid(obj.get('resource_id'));
            if (entity) {
                entity.tags.add(value);
            }
        });

        obj.on('tags:remove', function (value) {
            var entity = app.root.findByGuid(obj.get('resource_id'));
            if (entity) {
                entity.tags.remove(value);
            }
        });

        var reparent = function (child, index) {
            var childEntity = editor.call('entities:get', child);
            if (!childEntity)
                return;

            childEntity = app.root.findByGuid(childEntity.get('resource_id'));
            var parentEntity = app.root.findByGuid(obj.get('resource_id'));

            if (childEntity && parentEntity) {
                if (childEntity.parent)
                    childEntity.parent.removeChild(childEntity);

                // skip any graph nodes
                if (index > 0) {
                    var i, len;
                    var children = parentEntity.children;
                    for (i = 0, len = children.length; i < len && index > 0; i++) {
                        if (children[i] instanceof pc.Entity) {
                            index--;
                        }
                    }

                    index = i;
                }

                // re-insert
                parentEntity.insertChild(childEntity, index);
            }
        };

        obj.on('children:insert', reparent);
        obj.on('children:move', reparent);
    });

    editor.on('entities:remove', function (obj) {
        var entity = app.root.findByGuid(obj.get('resource_id'));
        if (entity) {
            entity.destroy();
            editor.call('viewport:render');
        }
    });
});


/* launch/viewport-binding-components.js */
editor.once('load', function () {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    // converts the data to runtime types
    var runtimeComponentData = function (component, data) {
        var result = {};
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                result[key] = editor.call('components:convertValue', component, key, data[key]);
            }
        }

        return result;
    };

    editor.on('entities:add', function (obj) {

        function onSetProperty(entity, component, property, parts, value) {
            // edit component property
            if (component === 'script' && property === 'scripts' && !editor.call('settings:project').get('useLegacyScripts')) {
                if (parts.length <= 2) {
                    return;
                } else if (parts.length === 3) {
                    for (let i = entity.script.scripts.length - 1; i >= 0; i--) {
                        entity.script.destroy(entity.script.scripts[i].__scriptType);
                    }

                    for (const script in value) {
                        entity.script.create(script, value[script]);
                    }
                } else {
                    var script = entity.script[parts[3]];

                    if (parts.length === 4) {
                        // new script
                        const data = obj.get('components.script.scripts.' + parts[3]);
                        entity.script.create(parts[3], data);
                    } else if (script && parts.length === 5 && parts[4] === 'enabled') {
                        // enabled
                        script.enabled = value;
                    } else if (script && parts.length === 6 && parts[4] === 'attributes' && !pc.createScript.reservedAttributes[parts[5]]) {
                        // set attribute
                        script[parts[5]] = value;
                        // TODO scripts2
                        // check if attribute is new
                    } else if (script && parts.length > 6 && parts[4] === 'attributes' && !pc.createScript.reservedAttributes[parts[5]]) {
                        // update attribute
                        script[parts[5]] = obj.get('components.script.scripts.' + parts[3] + '.attributes.' + parts[5]);
                    }
                }
            } else {
                if (component === 'element') {
                    if (property === 'width') {
                        // do not set width for elements with autoWidth or split horizontal anchors
                        if (entity.element.autoWidth || Math.abs(entity.element.anchor.x - entity.element.anchor.z) > 0.001) {
                            return;
                        }
                    } else if (property === 'height') {
                        // do not set height for elements with autoHeight or split vertical anchors
                        if (entity.element.autoHeight || Math.abs(entity.element.anchor.y - entity.element.anchor.w) > 0.001) {
                            return;
                        }
                    }
                } else if (component === 'model' || component === 'render') {
                    if (property === 'aabbCenter' || property === 'aabbHalfExtents') {
                        const aabbCenter = obj.get(`components.${component}.aabbCenter`);
                        const aabbHalfExtents = obj.get(`components.${component}.aabbHalfExtents`);
                        if (aabbCenter && aabbHalfExtents) {
                            entity[component].customAabb = new pc.BoundingBox(new pc.Vec3(aabbCenter), new pc.Vec3(aabbHalfExtents));
                        }
                        return;
                    }
                }

                value = obj.get('components.' + component + '.' + property);
                entity[component][property] = editor.call('components:convertValue', component, property, value);
            }
        }

        // subscribe to changes
        obj.on('*:set', function (path, value) {
            if (obj._silent || ! path.startsWith('components'))
                return;

            var entity = app.root.findByGuid(obj.get('resource_id'));
            if (! entity)
                return;

            var parts = path.split('.');
            var component = parts[1];
            var property = parts[2];

            if (!entity[component]) {
                if (!property) {
                    // add component
                    const data = runtimeComponentData(component, value);
                    app.systems[component].addComponent(entity, data);

                    // render
                    editor.call('viewport:render');
                }
            } else if (!property) {
                for (const field in value) {
                    onSetProperty(entity, component, field, [parts[0], parts[1], field], value[field]);
                }
            } else {
                onSetProperty(entity, component, property, parts, value);
            }
        });


        obj.on('*:unset', function (path) {
            if (obj._silent || ! path.startsWith('components'))
                return;

            var entity = app.root.findByGuid(obj.get('resource_id'));
            if (! entity) return;

            var parts = path.split('.');
            var component = parts[1];
            var property = parts[2];

            if (property) {
                if (component === 'script' && property === 'scripts' && ! editor.call('settings:project').get('useLegacyScripts')) {
                    if (! entity.script || parts.length <= 3)
                        return;

                    var script = entity.script[parts[3]];
                    if (! script)
                        return;

                    if (parts.length === 4) {
                        // remove script
                        entity.script.destroy(parts[3]);
                    } else if (parts.length === 6 && parts[4] === 'attributes' && ! pc.createScript.reservedAttributes[parts[5]]) {
                        // unset attribute
                        delete script[parts[5]];
                        delete script.__attributes[parts[5]];
                    } else if (parts.length > 6 && parts[4] === 'attributes' && ! pc.createScript.reservedAttributes[parts[5]]) {
                        // update attribute
                        script[parts[5]] = obj.get('components.script.scripts.' + parts[3] + '.attributes.' + parts[5]);
                    }
                } else if ((component === 'model' || component === 'render') && (property === 'aabbCenter' || property === 'aabbHalfExtents')) {
                    entity[component].customAabb = null;
                } else {
                    // edit component property
                    var value = obj.get('components.' + component + '.' + property);
                    entity[component][property] = editor.call('components:convertValue', component, property, value);
                }
            } else if (entity[component]) {
                // remove component
                app.systems[component].removeComponent(entity);
            }
        });

        var setComponentProperty = function (path, value, ind) {
            if (obj._silent || ! path.startsWith('components'))
                return;

            var entity = app.root.findByGuid(obj.get('resource_id'));
            if (! entity) return;

            var parts = path.split('.');
            var component = parts[1];
            var property = parts[2];

            if (property) {
                if (component === 'script') {
                    if (property === 'order') {
                        // update script order
                        entity.script.move(value, ind);
                    } else if (property === 'scripts') {
                        if (! entity.script || parts.length <= 3)
                            return;

                        var script = entity.script[parts[3]];
                        if (! script)
                            return;

                        if (parts.length > 6 && parts[4] === 'attributes' && ! pc.createScript.reservedAttributes[parts[5]]) {
                            // update attribute
                            script[parts[5]] = obj.get('components.script.scripts.' + parts[3] + '.attributes.' + parts[5]);
                        }
                    }
                } else {
                    // edit component property
                    value = obj.get('components.' + component + '.' + property);
                    entity[component][property] = editor.call('components:convertValue', component, property, value);
                }
            }
        };

        obj.on('*:insert', setComponentProperty);
        obj.on('*:remove', setComponentProperty);
        obj.on('*:move', setComponentProperty);
    });
});


/* launch/viewport-binding-assets.js */
editor.once('load', function () {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var regexFrameUpdate = /^data\.frames\.(\d+)/;
    var regexFrameRemove = /^data\.frames\.(\d+)$/;
    var regexI18n = /^i18n\.[^\.]+?$/;

    var attachSetHandler = function (asset) {
        // do only for target assets
        if (asset.get('source'))
            return;

        var timeout;
        var updatedFields = { };

        var onChange = function (path, value) {
            var realtimeAsset = app.assets.get(asset.get('id'));
            var parts = path.split('.');

            updatedFields[parts[0]] = true;
            if (timeout)
                clearTimeout(timeout);

            // do the update in a timeout to avoid rapid
            // updates to the same fields
            timeout = setTimeout(function () {
                for (var key in updatedFields) {
                    var raw = asset.get(key);

                    // do not hot-reload script if it has no `swap` methods already defined
                    if (key === 'file' && asset.get('type') === 'script' && realtimeAsset.data && realtimeAsset.data.scripts) {
                        var swappable = false;

                        for (var script in realtimeAsset.data.scripts) {
                            var scriptType = app.scripts.get(script);
                            if (scriptType && scriptType.prototype.hasOwnProperty('swap')) {
                                swappable = true;
                                break;
                            }
                        }

                        if (! swappable)
                            continue;
                    }

                    // this will trigger the 'update' event on the asset in the engine
                    // handling all resource loading automatically
                    realtimeAsset[key] = raw;
                }

                timeout = null;
            });
        };

        // attach update handler
        asset.on('*:set', function (path, value) {
            var realtimeAsset;

            // handle i18n changes
            if (regexI18n.test(path)) {
                var parts = path.split('.');
                realtimeAsset = app.assets.get(asset.get('id'));
                if (realtimeAsset) {
                    realtimeAsset.addLocalizedAssetId(parts[1], value);
                }
            } else if (path.startsWith('tags')) {
                if (path === 'tags') {
                    realtimeAsset = app.assets.get(asset.get('id'));
                    if (!realtimeAsset) return;

                    realtimeAsset.tags.clear();
                    value.forEach(tag => {
                        realtimeAsset.tags.add(tag);
                    });
                }
            } else if (asset.get('type') === 'textureatlas') {
                // handle texture atlases specifically for better performance
                realtimeAsset = app.assets.get(asset.get('id'));
                if (! realtimeAsset) return;

                var match = path.match(regexFrameUpdate);
                if (match) {
                    var frameKey = match[1];
                    var frame = asset.get('data.frames.' + frameKey);
                    if (realtimeAsset.resource) {
                        if (frame) {
                            realtimeAsset.resource.setFrame(frameKey, {
                                rect: new pc.Vec4(frame.rect),
                                pivot: new pc.Vec2(frame.pivot),
                                border: new pc.Vec4(frame.border)
                            });
                        }
                    }

                    if (! realtimeAsset.data.frames) {
                        realtimeAsset.data.frames = {};
                    }

                    realtimeAsset.data.frames[frameKey] = frame;
                }
            } else {
                // everything else
                onChange(path, value);
            }
        });
        asset.on('*:unset', function (path, value) {
            var realtimeAsset;

            // handle deleting i18n
            if (regexI18n.test(path)) {
                realtimeAsset = app.assets.get(asset.get('id'));
                if (realtimeAsset) {
                    var parts = path.split('.');
                    realtimeAsset.removeLocalizedAssetId(parts[1]);
                }

            } else if (asset.get('type') === 'textureatlas') {
                // handle deleting frames from texture atlas
                realtimeAsset = app.assets.get(asset.get('id'));
                if (! realtimeAsset) return;

                var match = path.match(regexFrameRemove);
                if (match) {
                    var frameKey = match[1];
                    if (realtimeAsset.resource) {
                        realtimeAsset.resource.removeFrame(frameKey);
                    }

                    if (realtimeAsset.data.frames && realtimeAsset.data.frames[frameKey]) {
                        delete realtimeAsset.data.frames[frameKey];
                    }

                    editor.call('viewport:render');
                }
            } else {
                // everything else
                onChange(path, value);
            }

        });

        // handle changing sprite frame keys
        if (asset.get('type') === 'sprite') {
            var onFrameKeys = function () {
                var realtimeAsset = app.assets.get(asset.get('id'));
                if (realtimeAsset) {
                    if (realtimeAsset.resource) {
                        realtimeAsset.resource.frameKeys = asset.get('data.frameKeys');
                    }

                    realtimeAsset.data.frameKeys = asset.get('data.frameKeys');
                }
            };

            asset.on('data.frameKeys:set', onFrameKeys);
            asset.on('data.frameKeys:insert', onFrameKeys);
            asset.on('data.frameKeys:remove', onFrameKeys);
            asset.on('data.frameKeys:move', onFrameKeys);
        }

        // tags add
        asset.on('tags:insert', function (tag) {
            app.assets.get(asset.get('id')).tags.add(tag);
        });
        // tags remove
        asset.on('tags:remove', function (tag) {
            app.assets.get(asset.get('id')).tags.remove(tag);
        });
    };

    // after all initial assets are loaded...
    editor.on('assets:load', function () {
        var assets = editor.call('assets:list');
        assets.forEach(attachSetHandler);

        // add assets to asset registry
        editor.on('assets:add', function (asset) {
            // do only for target assets
            if (asset.get('source'))
                return;

            // raw json data
            var assetJson = asset.json();

            // engine data
            var data = {
                id: parseInt(assetJson.id, 10),
                name: assetJson.name,
                tags: assetJson.tags,
                file: assetJson.file ? {
                    filename: assetJson.file.filename,
                    url: assetJson.file.url,
                    hash: assetJson.file.hash,
                    size: assetJson.file.size,
                    variants: assetJson.file.variants || null
                } : null,
                data: assetJson.data,
                type: assetJson.type
            };

            // create and add to registry
            var newAsset = new pc.Asset(data.name, data.type, data.file, data.data);
            newAsset.id = parseInt(assetJson.id, 10);
            app.assets.add(newAsset);

            // tags
            newAsset.tags.add(data.tags);

            // i18n
            if (assetJson.i18n) {
                for (var locale in assetJson.i18n) {
                    newAsset.addLocalizedAssetId(locale, assetJson.i18n[locale]);
                }
            }

            attachSetHandler(asset);
        });

        // remove assets from asset registry
        editor.on('assets:remove', function (asset) {
            var realtimeAsset = app.assets.get(asset.get('id'));
            if (realtimeAsset)
                app.assets.remove(realtimeAsset);
        });
    });
});


/* launch/viewport-binding-scene.js */
editor.once('load', function () {
    'use strict';

    editor.on('sceneSettings:load', function (sceneSettings) {
        var app = editor.call('viewport:app');
        if (! app) return; // webgl not available

        var updating;

        // apply settings
        var applySettings = function () {
            updating = false;

            app.applySceneSettings(sceneSettings.json());
        };

        // queue settings apply
        var queueApplySettings = function () {
            if (updating)
                return;

            updating = true;

            setTimeout(applySettings, 1000 / 30);
        };

        // on settings change
        sceneSettings.on('*:set', queueApplySettings);

        // initialize
        queueApplySettings();
    });

});


/* launch/viewport-scene-handler.js */
editor.once('load', function () {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    app.loader.removeHandler("scene");
    app.loader.removeHandler("hierarchy");
    app.loader.removeHandler("scenesettings");

    var loadSceneByItemId = function (itemId, callback) {
        // Get a specific scene from the server and pass result to callback
        Ajax({
            url: '{{url.api}}/scenes/' + itemId + '?branchId=' + config.self.branch.id,
            cookies: true
        })
        .on('error', function (status, data) {
            if (callback) {
                callback(data);
            }
        })
        .on('load', function (status, data) {
            if (callback) {
                callback(null, data);
            }
        });
    };

    var SharedSceneHandler = function (app, handler) {
        this._app = app;
        this._handler = handler;
    };

    SharedSceneHandler.prototype = {
        load: function (url, callback, settingsOnly) {
            var id = parseInt(url.replace("/api/", "").replace(".json", ""), 10);

            if (typeof(id) === "number" && !isNaN(id)) {
                // load scene from server to get its unique id
                loadSceneByItemId(id, function (err, scene) {
                    if (err) {
                        return callback(err);
                    }

                    editor.call('loadScene', scene.uniqueId, callback, settingsOnly);
                });
            } else {
                this._handler.load(url, callback);
            }
        },

        open: function (url, data) {
            return this._handler.open(url, data);
        },

        patch: function (asset, assets) {
            return this._handler.patch(asset, assets);
        }
    };
    app.loader.addHandler("scene", new SharedSceneHandler(app, new pc.SceneHandler(app)));


    var SharedHierarchyHandler = function (app, handler) {
        this._app = app;
        this._handler = handler;
    };

    SharedHierarchyHandler.prototype = {
        load: function (url, callback, settingsOnly) {
            var id = parseInt(url.replace("/api/", "").replace(".json", ""), 10);
            if (typeof(id) === "number" && !isNaN(id)) {
                loadSceneByItemId(id, function (err, scene) {
                    if (err) {
                        return callback(err);
                    }

                    editor.call('loadScene', scene.uniqueId, function (err, scene) {
                        // do this in a timeout so that any errors raised while
                        // initializing scripts are not swallowed by the connection error handler
                        setTimeout(function () {
                            callback(err, scene);
                        });
                    }, settingsOnly);

                });

            } else {
                // callback("Invalid URL: can't extract scene id.")
                this._handler.load(url, callback);
            }
        },

        open: function (url, data) {
            return this._handler.open(url, data);
        },

        patch: function (asset, assets) {
            return this._handler.patch(asset, assets);
        }
    };
    app.loader.addHandler("hierarchy", new SharedHierarchyHandler(app, new pc.HierarchyHandler(app)));

    var SharedSceneSettingsHandler = function (app, handler) {
        this._app = app;
        this._handler = handler;
    };

    SharedSceneSettingsHandler.prototype = {
        load: function (url, callback) {
            if (typeof url === 'string') {
                url = {
                    load: url,
                    original: url
                };
            }

            var id = parseInt(url.original.replace("/api/", "").replace(".json", ""), 10);
            if (typeof(id) === "number") {
                loadSceneByItemId(id, function (err, scene) {
                    if (err) {
                        return callback(err);
                    }

                    editor.call('loadScene', scene.uniqueId, function (err, scene) {
                        callback(err, scene);
                    }, true);
                });

            } else {
                // callback("Invalid URL: can't extract scene id.")
                this._handler.load(url, callback);
            }
        },

        open: function (url, data) {
            return this._handler.open(url, data);
        },

        patch: function (asset, assets) {
            return this._handler.patch(asset, assets);
        }
    };
    app.loader.addHandler("scenesettings", new SharedSceneSettingsHandler(app, new pc.SceneSettingsHandler(app)));
});


/* launch/viewport-connection.js */
editor.once('load', function () {
    'use strict';

    var icon = document.createElement('img');
    icon.classList.add('connecting');
    icon.src = 'https://playcanvas.com/static-assets/platform/images/loader_transparent.gif';
    icon.width = 32;
    icon.height = 32;

    var hidden = true;

    editor.on('realtime:connected', function () {
        if (!hidden) {
            document.body.removeChild(icon);
            hidden = true;
        }
    });

    editor.on('realtime:disconnected', function () {
        if (hidden) {
            document.body.appendChild(icon);
            hidden = false;
        }
    });

    editor.on('realtime:error', function (err) {
        log.error(err);
    });
});


/* launch/assets.js */
editor.once('load', function () {
    'use strict';

    var uniqueIdToItemId = {};

    var assets = new ObserverList({
        index: 'id'
    });

    function createLatestFn(id) {
        // function to get latest version of asset observer
        return function () {
            return assets.get(id);
        };
    }

    // list assets
    editor.method('assets:list', function () {
        return assets.array();
    });

    // allow adding assets
    editor.method('assets:add', function (asset) {
        uniqueIdToItemId[asset.get('uniqueId')] = asset.get('id');

        // function to get latest version of asset observer
        asset.latestFn = createLatestFn(asset.get('id'));

        assets.add(asset);
    });

    // allow removing assets
    editor.method('assets:remove', function (asset) {
        assets.remove(asset);
        asset.destroy();
    });

    // remove all assets
    editor.method('assets:clear', function () {
        assets.clear();
        uniqueIdToItemId = {};
    });

    // get asset by item id
    editor.method('assets:get', function (id) {
        return assets.get(id);
    });

    // get asset by unique id
    editor.method('assets:getUnique', function (uniqueId) {
        var id = uniqueIdToItemId[uniqueId];
        return id ? assets.get(id) : null;
    });

    // find assets by function
    editor.method('assets:find', function (fn) {
        return assets.find(fn);
    });

    // find one asset by function
    editor.method('assets:findOne', function (fn) {
        return assets.findOne(fn);
    });

    // publish added asset
    assets.on('add', function (asset) {
        editor.emit('assets:add[' + asset.get('id') + ']', asset);
        editor.emit('assets:add', asset);
    });

    // publish remove asset
    assets.on('remove', function (asset) {
        editor.emit('assets:remove', asset);
        delete uniqueIdToItemId[asset.get('id')];
    });
});


/* launch/assets-sync.js */
editor.once('load', function () {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var settings = editor.call('settings:project');
    var docs = { };

    var assetNames = { };

    var queryParams = (new pc.URI(window.location.href)).getQuery();
    var concatenateScripts = (queryParams.concatenateScripts === 'true');
    var concatenatedScriptsUrl = '/projects/' + config.project.id + '/concatenated-scripts/scripts.js?branchId=' + config.self.branch.id;
    var useBundles = (queryParams.useBundles !== 'false');

    var getFileUrl = function (folders, id, revision, filename, useBundles) {
        if (useBundles) {
            // if we are using bundles then this URL should be the URL
            // in the tar archive
            return ['files/assets', id, revision, filename].join('/');
        }

        var path = '';
        for (var i = 0; i < folders.length; i++) {
            var folder = editor.call('assets:get', folders[i]);
            if (folder) {
                path += encodeURIComponent(folder.get('name')) + '/';
            } else {
                path += (assetNames[folders[i]] || 'unknown') + '/';
            }
        }
        return 'assets/files/' + path + encodeURIComponent(filename) + '?id=' + id + '&branchId=' + config.self.branch.id;
    };

    editor.method('loadAsset', function (uniqueId, callback) {
        var connection = editor.call('realtime:connection');

        var doc = connection.get('assets', '' + uniqueId);

        docs[uniqueId] = doc;

        // error
        doc.on('error', function (err) {
            if (connection.state === 'connected') {
                console.log(err);
                return;
            }

            editor.emit('realtime:assets:error', err);
        });

        // ready to sync
        doc.on('load', function () {
            var key;

            var assetData = doc.data;
            if (! assetData) {
                log.error('Could not load asset: ' + uniqueId);
                doc.unsubscribe();
                doc.destroy();
                return callback && callback();
            }

            // notify of operations
            doc.on('op', function (ops, local) {
                if (local) return;

                for (var i = 0; i < ops.length; i++) {
                    editor.emit('realtime:op:assets', ops[i], uniqueId);
                }
            });

            assetData.id = parseInt(assetData.item_id, 10);
            assetData.uniqueId = parseInt(uniqueId, 10);

            // delete unecessary fields
            delete assetData.item_id;
            delete assetData.branch_id;

            if (assetData.type === 'template' && !assetData.preload) {
                // handle async template
                assetData.file = {
                    filename: assetData.name + '.json'
                };
            }

            if (assetData.file) {
                if (concatenateScripts && assetData.type === 'script' && assetData.preload && !assetData.data.loadingType) {
                    assetData.file.url = concatenatedScriptsUrl;
                } else {
                    assetData.file.url = getFileUrl(assetData.path, assetData.id, assetData.revision, assetData.file.filename);
                }

                if (assetData.file.variants) {
                    for (key in assetData.file.variants) {
                        assetData.file.variants[key].url = getFileUrl(assetData.path, assetData.id, assetData.revision, assetData.file.variants[key].filename);
                    }
                }
            }

            var asset = editor.call('assets:get', assetData.id);
            // asset can exist if we are reconnecting to c3
            var assetExists = !!asset;

            if (!assetExists) {
                var options = null;

                // allow duplicate values in data.frameKeys of sprite asset
                if (assetData.type === 'sprite') {
                    options = {
                        pathsWithDuplicates: ['data.frameKeys']
                    };
                }

                asset = new Observer(assetData, options);
                editor.call('assets:add', asset);

                var _asset = asset.asset = new pc.Asset(assetData.name, assetData.type, assetData.file, assetData.data);
                _asset.id = parseInt(assetData.id, 10);
                _asset.preload = assetData.preload ? assetData.preload : false;

                // tags
                _asset.tags.add(assetData.tags);

                // i18n
                if (assetData.i18n) {
                    for (var locale in assetData.i18n) {
                        _asset.addLocalizedAssetId(locale, assetData.i18n[locale]);
                    }
                }
            } else {
                for (key in assetData)
                    asset.set(key, assetData[key]);
            }

            if (callback)
                callback(asset);
        });

        // subscribe for realtime events
        doc.subscribe();
    });

    var createEngineAsset = function (asset, wasmAssetIds) {
        var sync;

        // if engine asset already exists return
        if (app.assets.get(asset.get('id'))) return;

        // handle bundle assets
        if (useBundles && asset.get('type') === 'bundle') {
            sync = asset.sync.enabled;
            asset.sync.enabled = false;

            // get the assets in this bundle
            // that have a file
            var assetsInBundle = asset.get('data.assets').map(function (id) {
                return editor.call('assets:get', id);
            }).filter(function (asset) {
                return asset && asset.has('file.filename');
            });

            if (assetsInBundle.length) {
                // set the main filename and url for the bundle asset
                asset.set('file', {});
                asset.set('file.filename', asset.get('name') + '.tar');
                asset.set('file.url', getFileUrl(asset.get('path'), asset.get('id'), asset.get('revision'), asset.get('file.filename')));

                // find assets with variants
                var assetsWithVariants = assetsInBundle.filter(function (asset) {
                    return asset.has('file.variants');
                });

                ['dxt', 'etc1', 'etc2', 'pvr', 'basis'].forEach(function (variant) {
                    // search for assets with the specified variants and if some
                    // exist then generate the variant file
                    for (var i = 0, len = assetsWithVariants.length; i < len; i++) {
                        if (assetsWithVariants[i].has('file.variants.' + variant)) {
                            if (! asset.has('file.variants')) {
                                asset.set('file.variants', {});
                            }

                            var filename = asset.get('name') + '-' + variant + '.tar';
                            asset.set('file.variants.' + variant, {
                                filename: filename,
                                url: getFileUrl(asset.get('path'), asset.get('id'), asset.get('revision'), filename)

                            });
                            return;
                        }
                    }
                });
            }

            asset.sync.enabled = sync;
        }

        if (useBundles && asset.get('type') !== 'bundle') {
            // if the asset is in a bundle then replace its url with the url that it's supposed to have in the bundle
            if (editor.call('assets:bundles:containAsset', asset.get('id'))) {
                var file = asset.get('file');
                if (file) {
                    sync = asset.sync.enabled;
                    asset.sync.enabled = false;

                    asset.set('file.url', getFileUrl(asset.get('path'), asset.get('id'), asset.get('revision'), file.filename, true));
                    if (file.variants) {
                        for (var key in file.variants) {
                            asset.set('file.variants.' + key + '.url', getFileUrl(asset.get('path'), asset.get('id'), asset.get('revision'), file.variants[key].filename, true));
                        }
                    }

                    asset.sync.enabled = sync;
                }
            }
        }

        // create the engine asset
        var assetData = asset.json();
        var engineAsset = asset.asset = new pc.Asset(assetData.name, assetData.type, assetData.file, assetData.data);
        engineAsset.id = parseInt(assetData.id, 10);
        engineAsset.preload = assetData.preload ? assetData.preload : false;
        if (assetData.type === 'script' &&
            assetData.data &&
            assetData.data.loadingType > 0) {
            // disable load on script before/after engine scripts
            engineAsset.loaded = true;
        } else if (wasmAssetIds.hasOwnProperty(assetData.id)) {
            // disable load on module assets
            engineAsset.loaded = true;
        }

        // tags
        engineAsset.tags.add(assetData.tags);

        // i18n
        if (assetData.i18n) {
            for (var locale in assetData.i18n) {
                engineAsset.addLocalizedAssetId(locale, assetData.i18n[locale]);
            }
        }

        // add to the asset registry
        app.assets.add(engineAsset);
    };

    var onLoad = function (data) {
        editor.call('assets:progress', 0.5);

        var total = data.length;
        if (!total) {
            editor.call('assets:progress', 1);
            editor.emit('assets:load');
        }

        var count = 0;
        var scripts = { };

        var legacyScripts = settings.get('useLegacyScripts');

        // get the set of wasm asset ids i.e. the wasm module ids and linked glue/fallback
        // script ids. the list is used to suppress the asset system from the loading
        // the scripts again.
        var getWasmAssetIds = function () {
            var result = { };
            editor.call('assets:list')
            .forEach(function (a) {
                var asset = a.asset;
                if (asset.type !== 'wasm' || !asset.data) {
                    return;
                }
                result[asset.id] = 1;
                if (asset.data.glueScriptId) {
                    result[asset.data.glueScriptId] = 1;
                }
                if (asset.data.fallbackScriptId) {
                    result[asset.data.fallbackScriptId] = 1;
                }
            });
            return result;
        };

        var loadScripts = function (wasmAssetIds) {
            var order = settings.get('scripts');

            for (var i = 0; i < order.length; i++) {
                if (! scripts[order[i]])
                    continue;

                var asset = editor.call('assets:get', order[i]);
                if (asset) {
                    createEngineAsset(asset, wasmAssetIds);
                }
            }
        };

        var load = function (uniqueId) {
            editor.call('loadAsset', uniqueId, function (asset) {
                count++;
                editor.call('assets:progress', (count / total) * 0.5 + 0.5);

                if (! legacyScripts && asset && asset.get('type') === 'script')
                    scripts[asset.get('id')] = asset;

                if (count === total) {
                    var wasmAssetIds = getWasmAssetIds();

                    if (! legacyScripts)
                        loadScripts(wasmAssetIds);

                    // sort assets by script first and then by bundle
                    var assets = editor.call('assets:list');
                    assets.sort(function (a, b) {
                        var typeA = a.get('type');
                        var typeB = b.get('type');
                        if (typeA === 'script' && typeB !== 'script') {
                            return -1;
                        }
                        if (typeB === 'script' && typeA !== 'script') {
                            return 1;
                        }
                        if (typeA === 'bundle' && typeB !== 'bundle') {
                            return -1;
                        }
                        if (typeB === 'bundle' && typeA !== 'bundle') {
                            return 1;
                        }
                        return 0;
                    });

                    // create runtime asset for every asset observer
                    assets.forEach(function (a) { createEngineAsset(a, wasmAssetIds); });

                    editor.call('assets:progress', 1);
                    editor.emit('assets:load');
                }
            });
        };

        var connection = editor.call('realtime:connection');

        // do bulk subsribe in batches of 'batchSize' assets
        var batchSize = 256;
        var startBatch = 0;

        while (startBatch < total) {
            // start bulk subscribe
            connection.startBulk();
            for (var i = startBatch; i < startBatch + batchSize && i < total; i++) {
                assetNames[data[i].id] = data[i].name;
                load(data[i].uniqueId);
            }
            // end bulk subscribe and send message to server
            connection.endBulk();

            startBatch += batchSize;
        }
    };

    // load all assets
    editor.on('realtime:authenticated', function () {
        Ajax({
            url: '{{url.api}}/projects/{{project.id}}/assets?branchId={{self.branch.id}}&view=launcher',
            auth: true,
            cookies: true
        })
        .on('load', function (status, data) {
            onLoad(data);
        })
        .on('progress', function (progress) {
            editor.call('assets:progress', 0.1 + progress * 0.4);
        })
        .on('error', function (status, evt) {
            console.log(status, evt);
        });
    });

    editor.call('assets:progress', 0.1);

    editor.on('assets:remove', function (asset) {
        var id = asset.get('uniqueId');
        if (docs[id]) {
            docs[id].unsubscribe();
            docs[id].destroy();
            delete docs[id];
        }
    });

    // hook sync to new assets
    editor.on('assets:add', function (asset) {
        if (asset.sync)
            return;

        asset.sync = new ObserverSync({
            item: asset
        });

        var setting = false;

        asset.on('*:set', function (path, value) {
            if (setting || ! path.startsWith('file') || path.endsWith('.url') || ! asset.get('file'))
                return;

            setting = true;

            var parts = path.split('.');

            // NOTE: if we have concatenated scripts then this will reset the file URL to the original URL and not the
            // concatenated URL which is what we want for hot reloading
            if ((parts.length === 1 || parts.length === 2) && parts[1] !== 'variants') {
                asset.set('file.url', getFileUrl(asset.get('path'), asset.get('id'), asset.get('revision'), asset.get('file.filename')));
            } else if (parts.length >= 3 && parts[1] === 'variants') {
                var format = parts[2];
                asset.set('file.variants.' + format + '.url', getFileUrl(asset.get('path'), asset.get('id'), asset.get('revision'), asset.get('file.variants.' + format + '.filename')));
            }

            setting = false;
        });
    });

    // server > client
    editor.on('realtime:op:assets', function (op, uniqueId) {
        var asset = editor.call('assets:getUnique', uniqueId);
        if (asset) {
            asset.sync.write(op);
        } else {
            log.error('realtime operation on missing asset: ' + op.p[1]);
        }
    });
});


/* launch/assets-messenger.js */
editor.once('load', function () {
    'use strict';

    var validRuntimeAssets = {
        'material': 1, 'model': 1, 'cubemap': 1, 'text': 1, 'json': 1, 'html': 1, 'css': 1, 'script': 1, 'texture': 1, 'textureatlas': 1, 'sprite': 1
    };

    var create = function (data) {
        if (data.asset.source || data.asset.status !== 'complete' && ! validRuntimeAssets.hasOwnProperty(data.asset.type))
            return;

        var uniqueId = parseInt(data.asset.id, 10);
        if (! uniqueId)
            return;

        editor.call('loadAsset', uniqueId);
    };

    // create or update
    editor.on('messenger:asset.new', create);

    // remove
    editor.on('messenger:asset.delete', function (data) {
        var asset = editor.call('assets:getUnique', data.asset.id);
        if (! asset) return;
        editor.call('assets:remove', asset);
    });

    // remove multiple
    editor.on('messenger:assets.delete', function (data) {
        for (var i = 0; i < data.assets.length; i++) {
            var asset = editor.call('assets:getUnique', parseInt(data.assets[i], 10));
            if (! asset) continue;
            editor.call('assets:remove', asset);
        }
    });
});


/* launch/scene-settings.js */
editor.once('load', function () {
    'use strict';

    var sceneSettings = new Observer();

    editor.once('scene:raw', function (data) {
        sceneSettings.patch(data.settings);

        editor.emit("sceneSettings:load", sceneSettings);
    });

    editor.method('sceneSettings', function () {
        return sceneSettings;
    });
});


/* launch/scene-settings-sync.js */
editor.once('load', function () {
    'use strict';

    editor.on('sceneSettings:load', function (settings) {
        if (settings.sync) return;

        settings.sync = new ObserverSync({
            item: settings,
            prefix: ['settings']
        });

        // client > server
        settings.sync.on('op', function (op) {
            editor.call('realtime:op', op);
        });

        // server > client
        editor.on('realtime:op:settings', function (op) {
            settings.sync.write(op);
        });
    });
});


/* launch/sourcefiles.js */
editor.once('load', function () {
    'use strict';

    if (! editor.call('settings:project').get('useLegacyScripts'))
        return;


    var onLoad = function (data) {
        var filenames = data.result.map(function (item) {
            return item.filename;
        });

        editor.emit("sourcefiles:load", filenames);
    };

    // load scripts
    Ajax({
        url: '{{url.home}}{{project.repositoryUrl}}',
        cookies: true,
        auth: true
    })
    .on('load', function (status, data) {
        onLoad(data);
    })
    .on('error', function (status, evt) {
        console.log(status, evt);
        editor.emit("sourcefiles:load", []);
    });
});


/* launch/load.js */
editor.once('load', function () {
    'use strict';

    var auth = false;
    var socket, connection;
    var data;
    var reconnectAttempts = 0;
    var reconnectInterval = 1;

    var connect;
    var reconnect;

    editor.method('realtime:connection', function () {
        return connection;
    });

    connect = function () {
        if (reconnectAttempts > 8) {
            editor.emit('realtime:cannotConnect');
            return;
        }

        reconnectAttempts++;
        editor.emit('realtime:connecting', reconnectAttempts);

        var shareDbMessage = connection.socket.onmessage;

        connection.socket.onmessage = function (msg) {
            try {
                if (msg.data.startsWith('auth')) {
                    if (!auth) {
                        auth = true;
                        // eslint-disable-next-line no-unused-vars
                        data = JSON.parse(msg.data.slice(4));

                        editor.emit('realtime:authenticated');
                    }
                } else if (! msg.data.startsWith('permissions') && ! msg.data.startsWith('chat') && ! msg.data.startsWith('selection') && ! msg.data.startsWith('whoisonline') && ! msg.data.startsWith('fs:')) {
                    shareDbMessage(msg);
                }
            } catch (e) {
                log.error(e);
            }

        };

        connection.on('connected', function () {
            reconnectAttempts = 0;
            reconnectInterval = 1;

            this.socket.send('auth' + JSON.stringify({
                timeout: false
            }));

            editor.emit('realtime:connected');
        });

        connection.on('error', function (msg) {
            editor.emit('realtime:error', msg);
        });

        var onConnectionClosed = connection.socket.onclose;
        connection.socket.onclose = function (reason) {
            auth = false;

            editor.emit('realtime:disconnected', reason);
            onConnectionClosed(reason);

            // try to reconnect after a while
            editor.emit('realtime:nextAttempt', reconnectInterval);

            if (editor.call('visibility')) {
                setTimeout(reconnect, reconnectInterval * 1000);
            } else {
                editor.once('visible', reconnect);
            }

            reconnectInterval++;
        };
    };

    reconnect = function () {
        // create new socket...
        socket = new WebSocket(config.url.realtime.http);
        // ... and new sharedb connection
        connection = new window.share.Connection(socket);
        // connect again
        connect();
    };

    if (editor.call('visibility')) {
        reconnect();
    } else {
        editor.once('visible', reconnect);
    }
});


/* launch/scene-loading.js */
editor.once('load', function () {
    'use strict';

    // cache
    var loaded = {};
    var sceneLoadingCount = 0;
    var loadScene = function (id, callback, settingsOnly) {
        if (loaded[id]) {
            if (callback)
                callback(null, loaded[id].data);

            return;
        }

        ++sceneLoadingCount;

        var connection = editor.call('realtime:connection');
        var scene = connection.get('scenes', '' + id);

        // error
        scene.on('error', function (err) {
            if (callback)
                callback(new Error(err));

            --sceneLoadingCount;
        });

        // ready to sync
        scene.on('load', function () {
            // cache loaded scene for any subsequent load requests
            loaded[id] = scene;

            // notify of operations
            scene.on('op', function (ops, local) {
                if (local)
                    return;

                for (var i = 0; i < ops.length; i++) {
                    var op = ops[i];

                    // console.log('in: [ ' + Object.keys(op).filter(function(i) { return i !== 'p' }).join(', ') + ' ]', op.p.join('.'));

                    if (op.p[0]) {
                        editor.emit('realtime:op:' + op.p[0], op);
                    }
                }
            });

            // notify of scene load
            var snapshot = scene.data;
            if (settingsOnly !== true) {
                editor.emit('scene:raw', snapshot);
            }
            if (callback) {
                callback(null, snapshot);
            }

            --sceneLoadingCount;
        });

        // subscribe for realtime events
        scene.subscribe();
    };

    editor.method('loadScene', loadScene);
    editor.method('isLoadingScene', function () {
        return sceneLoadingCount > 0;
    });

    editor.on('realtime:authenticated', function () {
        var startedLoading = false;

        // if we are reconnecting try to reload
        // all scenes that we've already loaded
        for (var id in loaded) {
            startedLoading = true;
            loaded[id].destroy();
            delete loaded[id];

            editor.call('loadScene', id);
        }

        // if no scenes have been loaded at
        // all then we are initializing
        // for the first time so load the main scene
        if (! startedLoading) {
            editor.call('loadScene', config.scene.uniqueId);
        }
    });
});

