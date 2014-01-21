// Matrix Parametrized Transformations (MPT's)
//
// The objects in this library are useful for animation (transformations
// parametrized with time, e.g.). The library provides a series of factories
// for different transformation types (e.g. MPTRotateX is a rotation
// about the X-axis with a single degree parameter). It is not advised
// to call directly onto MPT types (e.g. CachedMPT, ComboMPT, etc.), but
// to use factories instead.
//
// CONTENTS:
//
// + Types:
//   - MPT
//   - ConstMPT
//   - CachedMPT
//   - ComboMPT
//
// + Factories:
//   - MPTIdentity
//   - MPTTranslate
//   - MPTScale
//   - MPTRotateX
//   - MPTRotateY
//   - MPTRotateZ
//   - MPTRotate

//=================  TYPES  ====================
//==============================================

// Abstract type for Matrix Parametrized Transformations
// + matrix() [abstract]
// + apply(dest, left)
// + then(other)
// + toConst()
MPT = function () {};

// Get the matrix for this transformation.
MPT.prototype.matrix = ABSTRACT;

// Apply this transformation to a matrix. The other
// matrix is the left operand.
MPT.prototype.apply = function(dest, leftMatrix) {
  return mat4.multiply(dest, leftMatrix, this.matrix());
};

// Get a single transformation representing the combination
// of this transformation on the left and another transfomation
// on the right.
// @return {ComboMPT}
MPT.prototype.then = function(other) {
  return new ComboMPT(this, other);
};

// Get a constant transformation object using the current
// state of the this transformation.
MPT.prototype.toConst = function() {
  return new ConstMPT(this.matrix());
};

//==============================================

// A transformation that won't change (unless the callee of
// the matrix method modifies the retrieved matrix; DON'T DO IT!).
ConstMPT = function (matrix) {
  this.mat = matrix;
}

ConstMPT.prototype = Object.create(MPT.prototype);
ConstMPT.prototype.constructor = ConstMPT;

// @override
ConstMPT.prototype.matrix = function() {
  return this.mat;
};

//==============================================

// A matrix transformation wrapper for the CachedValue type.
// This is intended as a private type, but you can see example
// usage in the constructors below (e.g. MTRotate).
CachedMPT = function (synchFunction) {
  this.val = new CachedValue(synchFunction);
}

CachedMPT.prototype = Object.create(MPT.prototype);
CachedMPT.prototype.constructor = CachedMPT;

// @override
CachedMPT.prototype.matrix = function() {
  return this.val.get();
};

//==============================================

// A transformation which is a combination of other transformations.
// Individual transformations are stored in this.components array in order.
// Calling 'then' method will append another transformation to this array.
ComboMPT = function (left, right) {
  this.components = [left, right];
  this._cache = mat4.create();
}
ComboMPT.prototype = Object.create(MPT.prototype);
ComboMPT.prototype.constructor = ComboMPT;

// The individual transformations which which make up this transformation.
ComboMPT.prototype.components = [];

// @override
ComboMPT.prototype.matrix = function() {
  var n = this.components.length;
  mat4.multiply(this._cache, this.components[0].matrix(), this.components[1].matrix());
  for (var i = 2; i < n; i++)
    mat4.multiply(this._cache, this._cache, this.components[i].matrix());
  return this._cache;
};

// @override
ComboMPT.prototype.then = function(other) {
  this.components.push(other);
  return this;
};

//===============  FACTORIES  ==================
//==============================================

// Identity transformation.
MPTIdentity = function () {
  var matrix = mat4.create();

  var mt = new MPT();
  mt.matrix = function () { return matrix; }

  return mt;
}

//==============================================

// Translation transformation.
// @arg {vec3} loc
// + getLoc(): {vec3}
// + setLoc({vec3})
MPTTranslate = function (loc) {
  var matrix = mat4.create();

  var mt = new CachedMPT(function () {
    mat4.identity(matrix);
    return mat4.translate(matrix, matrix, loc);
  });

  mt.getLoc = function () { return loc; }
  mt.setLoc = function (newloc) {
    vec3.copy(loc, newloc);
    this.val.desynch();
  }

  return mt;
}

//==============================================

// Scale transformation.
// @arg {vec3} scale
// + getScale(): {vec3}
// + setScale({vec3})
MPTScale = function (scale) {
  var matrix = mat4.create();

  var mt = new CachedMPT(function () {
    mat4.identity(matrix);
    return mat4.scale(matrix, matrix, scale);
  });

  mt.getScale = function () { return scale; }
  mt.setScale = function (newscale) {
    vec3.copy(scale, newscale);
    this.val.desynch();
  }

  return mt;
}

//==============================================

// Rotation transformation around the X-axis.
// @arg {Number} ang
// + getAngle(): {Number}
// + setAngle({Number})
MPTRotateX = function (ang) {
  var matrix = mat4.create();

  var mt = new CachedMPT(function () {
    mat4.identity(matrix);
    return mat4.rotateX(matrix, matrix, ang);
  });

  mt.getAngle = function () { return ang; }
  mt.setAngle = function (newang) {
    ang = newang;
    this.val.desynch();
  }

  return mt;
}

//==============================================

// Rotation transformation around the Y-axis.
// @arg {Number} ang
// + getAngle(): {Number}
// + setAngle({Number})
MPTRotateY = function (ang) {
  var matrix = mat4.create();

  var mt = new CachedMPT(function () {
    mat4.identity(matrix);
    return mat4.rotateY(matrix, matrix, ang);
  });

  mt.getAngle = function () { return ang; }
  mt.setAngle = function (newang) {
    ang = newang;
    this.val.desynch();
  }

  return mt;
}

//==============================================

// Rotation transformation around the Z-axis.
// @arg {Number} ang
// + getAngle(): {Number}
// + setAngle({Number})
MPTRotateZ = function (ang) {
  var matrix = mat4.create();

  var mt = new CachedMPT(function () {
    mat4.identity(matrix);
    return mat4.rotateZ(matrix, matrix, ang);
  });

  mt.getAngle = function () { return ang; }
  mt.setAngle = function (newang) {
    ang = newang;
    this.val.desynch();
  }

  return mt;
}

//==============================================

// Rotation transformation around given axis.
// @arg {Number} ang
// @arg {vec3} axis
// + getAngle(): {Number}
// + setAngle({Number})
// + getAxis(): {vec3}
// + setAxis({vec3})
MPTRotate = function (ang, axis) {
  var matrix = mat4.create();

  var mt = new CachedMPT(function () {
    mat4.identity(matrix);
    return mat4.rotate(matrix, matrix, ang, axis);
  });

  mt.getAxis = function () { return axis; }
  mt.getAngle = function () { return ang; }

  mt.setAxis = function (newaxis) {
    vec3.copy(axis, newaxis);
    this.val.desynch();
  }
  mt.setAngle = function (newang) {
    ang = newang;
    this.val.desynch();
  }

  return mt;
}
