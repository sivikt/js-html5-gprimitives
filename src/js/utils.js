// Значения по умолчанию.
//function hello(text) {
// alert("Hello, " + (text||"world"));
//}
//
// Не выдает ошибку в случае отсутствия одного из ключей.
// Если же все на месте, присвоит переменной значение
// h['x']['y'], иначе - null.
// var element = h && h['x'] && h['x']['y'];
// assigning values to an array is faster than using push()
// Use join() to Build Strings
// var paragraphs = document.getElementsByTagName('p');
// for (var i = 0, paragraph; paragraph = paragraphs[i]; i++) {
//   doSomething(paragraph);
// }
// This works well for all collections and arrays as long as the array does not contain things that are treated as boolean false.
// 
// In cases where you are iterating over the childNodes you can also use the firstChild and nextSibling properties.
// 
// var parentNode = document.getElementById('foo');
// for (var child = parentNode.firstChild; child; child = child.nextSibling) {
//   doSomething(child);
// }

// applying config to the object
function apply(o, c, defaults){
    // no "this" reference for friendly out of scope calls
  if(defaults){
    apply(o, defaults);
  }
  if(o && c && typeof c == 'object'){
    for(var p in c){
      o[p] = c[p];
    }
  }
  return o;
};

// print object fields
function dump(d, l){
  if (l == null) l = 1;
  var s = '';
  if (typeof(d) == "object") {
    s += typeof(d) + " {\n";
    for (var k in d){
      for (var i=0; i<l; i++) s += "  ";
      s += k+": " + Dump(d[k],l+1);
    }
    for (var i = 0; i < l-1; i++) s += "  ";
    s += "}\n"
  } else {
    s += "" + d + "\n";
  }
  return s;
}

// extend interface
/*function extend(Child, Parent) {
    var F = function() { }
    F.prototype = Parent.prototype
    Child.prototype = new F()
    Child.prototype.constructor = Child
    Child.superclass = Parent.prototype
}*/


// extend interface
function Class() { };

Class.prototype.construct = function(){};

Class.extend = function(def) {

  var classDef = (
    function() {
      if (arguments[0] !== Class) {
		this.construct.apply(this, arguments);
      }
    }
  );

  var proto = new this(Class);
  var superClass = this.prototype;

  proto.getSuper = (
    function(){
      return superClass;
    }
  );
  
  for (var n in def) {
    var item = def[n];
    if (item instanceof Function) 
      item.$ = superClass;
    else 
      classDef[n] = item;
    proto[n] = item;
  }

  classDef.getSuper = proto.getSuper;
  classDef.prototype = proto;
  classDef.extend = this.extend;

  return classDef;
};

// stores data by user agent and user platform
var USER_DATA = {
  Browser: {
    KHTML: /Konqueror|KHTML/.test(navigator.userAgent) && !/Apple/.test(navigator.userAgent),
    Safari: /KHTML/.test(navigator.userAgent) && /Apple/.test(navigator.userAgent),
    Opera: !!window.opera,
    MSIE: !!(window.attachEvent && !window.opera),
    Gecko: /Gecko/.test(navigator.userAgent) && !/Konqueror|KHTML/.test(navigator.userAgent)
  },
  OS: {
    Windows: navigator.platform.indexOf("Win") > -1,
    Mac: navigator.platform.indexOf("Mac") > -1,
    Linux: navigator.platform.indexOf("Linux") > -1
  }
};

// returns element coordinates on the screen
var IS_IE = USER_DATA['Browser'].MSIE;
// for static element (without scrolls)
function getPosition(e){
  var left = 0;
  var top = 0;

  while (e.offsetParent) {
    left += e.offsetLeft + (e.currentStyle ?
      (parseInt(e.currentStyle.borderLeftWidth)).NaN0() : 0);
    top += e.offsetTop + (e.currentStyle ?
      (parseInt(e.currentStyle.borderTopWidth)).NaN0() : 0);
    e = e.offsetParent;
  }

  left += e.offsetLeft + (e.currentStyle ?
      (parseInt(e.currentStyle.borderLeftWidth)).NaN0() : 0);
  top += e.offsetTop + (e.currentStyle ?
      (parseInt(e.currentStyle.borderTopWidth)).NaN0(): 0);   

  return {x:left, y:top};
}
// for element hidden by scrolls
function getAlignedPosition(e) {
  var left = 0;
  var top = 0;

  while (e.offsetParent) {
    left += e.offsetLeft + (e.currentStyle ?
      (parseInt(e.currentStyle.borderLeftWidth)).NaN0() : 0);
    top += e.offsetTop + (e.currentStyle ?
      (parseInt(e.currentStyle.borderTopWidth)).NaN0() : 0);
    e = e.offsetParent;
    if (e.scrollLeft) {left -= e.scrollLeft; }
    if (e.scrollTop) {top -= e.scrollTop; }
  }

  var docBody = document.documentElement ?
    document.documentElement : document.body;

  left += e.offsetLeft +
    (e.currentStyle ?
        (parseInt(e.currentStyle.borderLeftWidth)).NaN0()
        : 0) +
    (IS_IE ? (parseInt(docBody.scrollLeft)).NaN0() : 0) -
    (parseInt(docBody.clientLeft)).NaN0();
  top += e.offsetTop +
    (e.currentStyle ?
        (parseInt(e.currentStyle.borderTopWidth)).NaN0()
        : 0) +
    (IS_IE ? (parseInt(docBody.scrollTop)).NaN0() : 0) -
    (parseInt(docBody.clientTop)).NaN0();

  return {x:left, y:top};
}

// returns mouse coordinates
function getMouseCoords(ev) {
  if (ev.pageX || ev.pageY) {
    return {x:ev.pageX, y:ev.pageY};
  }

  var docBody = document.documentElement
            ? document.documentElement
            : document.body;

  return {
    x: ev.clientX + docBody.scrollLeft - docBody.clientLeft,
    y: ev.clientY + docBody.scrollTop - docBody.clientTop
  };
}

// returns mouse offset in the element target
function getMouseOffset(target, ev, aligned) {
  ev = ev || window.event;
  if (aligned == null) aligned = false;

  var docPos  = aligned
    ? getAlignedPosition(target)
    : getPosition(target);
  var mousePos = getMouseCoords(ev);

  return {
    x: mousePos.x - docPos.x,
    y: mousePos.y - docPos.y
  };
}

// create method reference
function createMethodReference(object, methodName) {
  return function () {
    return object[methodName].apply(object, arguments);
  };
}

// clone object
function clone(o) {
  if(!o || 'object' !== typeof o) {
    return o;
  }
  varc = 'function' === typeof o.pop ? [] : {};
  var p, v;
  for(p in o) {
    if(o.hasOwnProperty(p)) {
      v = o[p];
      if(v && 'object' === typeof v) {
	c[p] = clone(v);
      } else {
	c[p] = v;
      }
    }
  }
  return c;
}


function Hash() {
  this.length = 0;
  this.items = new Array();
  for (var i = 0; i < arguments.length; i++) {
    this.items[arguments[i][0]] = arguments[i][1];
  }
}

// time and time delta
function $time(startTime) {
  var now = new Date().getTime();
  return startTime ? now - startTime : now;
};

// gets height of element
function findOffsetHeight(e) {
  var res = 0;
  while ((res == 0) && e.parentNode) {
    e = e.parentNode;
    res = e.offsetHeight;
  }
  return res;
}

function getOffsetHeight(e) {
  return this.element.offsetHeight ||
      this.element.style.pixelHeight ||
      findOffsetHeight(e);
}

// traversal DOM tree
function walkTree(node, mapFunction, dataPackage) {
  if (node == null) return;
  mapFunction(node, dataPackage);
  for (var i = 0; i < node.childNodes.length; i++) {
    walkTree(node.childNodes[i], mapFunction, dataPackage);
  }
}

function searchTree(node, searchFunction, dataPackage) {
  if (node == null) return;
  var funcResult = searchFunction(node, dataPackage);
  if (funcResult) return funcResult;
  for (var i = 0; i < node.childNodes.length; i++) {
    var searchResult = searchTree(node.childNodes[i],
              searchFunction, dataPackage);
    if (searchResult) return searchResult;
  }
}

// remove node or node childrens
function removeChildrenRecursively(node)
{
  if (!node) return;
  while (node.hasChildNodes()) {
    removeChildrenRecursively(node.firstChild);
    node.removeChild(node.firstChild);
  }
}

function removeElementById(nodeId) {
  document.getElementById(nodeId).parentNode.removeChild(
  document.getElementById(nodeId));
}

// works with element attributes
var IS_SAFARI = USER_DATA['Browser'].Safari;

function getElmAttr(elm, attrName, ns) {
  // IE6 fails getAttribute when used on table element
  var elmValue = null;
  try {
    elmValue = (elm.getAttribute
          ? elm.getAttribute((ns ? (ns + NS_SYMB) : '')
          + attrName) : null);
  } catch (e) { return null; }
  if (!elmValue && IS_SAFARI) {
    elmValue = (elm.getAttributeNS
          ? elm.getAttributeNS(ns, attrName)
          : null);
  }
  return elmValue;
}

function setElmAttr(elm, attrName, value, ns) {
  if (!IS_SAFARI || !ns) {
    return (elm.setAttribute
          ? elm.setAttribute((ns ? (ns + NS_SYMB) : '')
          + attrName, value) : null);
  } else {
    return (elm.setAttributeNS
          ? elm.setAttributeNS(ns, attrName, value)
          : null);
  }
}

function remElmAttr(elm, attrName, ns) {
  if (!IS_SAFARI || !ns) {
    return (elm.removeAttribute
          ? elm.removeAttribute((ns ? (ns + NS_SYMB) : '')
          + attrName) : null);
  } else {
    return (elm.removeAttributeNS
          ? elm.removeAttributeNS(ns, attrName)
          : null);
  }
}

// logging and scrolling
function LOG(informerName, text) {
  var logElement = document.getElementById('LOG_DIV');
  if (logElement) {
    logElement.appendChild(document.createTextNode(
            informerName + ': ' + text));
    logElement.appendChild(document.createElement('br'));
    logElement.scrollTop += 50;
  }
}

// the stub class to allow using console when browser have it,
// if not - just pass all calls
if (typeof console == 'undefined') {
  console = {
    log: function() { },

    info: function() { },

    warn: function() { },

    error: function() { }
  };
}

//
// Create proper-derivable "class".
//
// Version: 1.2
//

function newClass(parent, prop) {
  // Dynamically create class constructor.
  var clazz = function() {
    // Stupid JS need exactly one "operator new" calling for parent
    // constructor just after class definition.
    if (clazz.preparing) return delete(clazz.preparing);
    // Call custom constructor.
    if (clazz.constr) {
      this.constructor = clazz; // we need it!
      clazz.constr.apply(this, arguments);
    }
  }
  clazz.prototype = {}; // no prototype by default
  if (parent) {
    parent.preparing = true;
    clazz.prototype = new parent;
    clazz.prototype.constructor = parent;
    clazz.constr = parent; // BY DEFAULT - parent constructor
  }
  if (prop) {
    var cname = "constructor";
    for (var k in prop) {
      if (k != cname) clazz.prototype[k] = prop[k];
    }
    if (prop[cname] && prop[cname] != Object)
      clazz.constr = prop[cname];
  }
  return clazz;
}

/* getElementByClass
/**********************/
function getElementByClass(theClass, tagName, handler) {
  var allHTMLTags = tagName ? document.getElementsByTagName(tagName) : document.getElementsByTagName('*');
  var founded = [];
  for (var i = 0, elem; elem = allHTMLTags[i]; i++) {
    var classes = elem.className.split(' ');
    
    for (var j = 0, cls; cls = classes[j]; j++) {
      if (cls == theClass) {
	if (handler) {
	  handler(elem);
	}
	
	founded.push(elem);
	break;
      }
    }
  }
  
  return founded;
}

function fpart(x) {
  return x - Math.floor(x);
}

function ipart(x) {
  return Math.floor(x);
}