// Simple objects for constructing hierarchical objects in space. Each
// can be queried for
// - location in world coordinates
// - location in object coordinates
// - total transformation applied to the object (relative to root)
// - local transformation applied to the object (relative parent)
// - parent/children
// 
// Note that rendering is not this library's responsibility. Thus,
// though a drawing function could be attached to each body part, that
// code doesn't belong here.

// Types:
// + BPart
// + BPartRoot

// Body Part type. This is an element in a hierarchical
// object.
BPart = function () {
  this._matCache = mat4.create();
  this._vecCache = vec3.create();
  this._loc = vec3.create();
  this._mpt = MPTIdentity();

  this.children = [];

  this.parent = null;
}

// @arg {BPart} child
BPart.prototype.addChild = function (child) {
  child.setParent(this);
}

// @arg {BPart} parent
BPart.prototype.setParent = function (parent) {
  this.parent = parent;
  parent.children.push(this);
}

// @arg {MPT} t
BPart.prototype.setMPT = function (mpt) {
  this._mpt = mpt;
}

// @return {MPT}
BPart.prototype.getMPT = function () {
  return this._mpt;
}

// @return {vec3}
BPart.prototype.loc = function() {
  return this._loc;
};

// @return {vec3}
BPart.prototype.worldLoc = function() {
  return vec3.transformMat4(this._vecCache, this._loc, this.worldMatrix());
};

// @return {mat4}
BPart.prototype.matrix = function() {
  return this._mpt.matrix();
};

// @return {mat4}
BPart.prototype.worldMatrix = function() {
  return mat4.multiply(this._matCache, this.parent.worldMatrix(), this.matrix());
};

//==============================================

// Root element for a hierarchical object.
// Inherits from BPart.
BPartRoot = function (transform) {
  BPart.call(this);

  if(transform)
    this.setMPT(transform);
}

BPartRoot.prototype = Object.create(BPart.prototype);
BPartRoot.prototype.constructor = BPartRoot;

// @override
BPartRoot.prototype.worldMatrix = function() {
    return mat4.copy(this._matCache, this.matrix());
};

// @override
BPartRoot.prototype.setParent = UNIMPLEMENTED("cannot set parent of root");
