// 1. UNIMPLEMENTED/ABSTRACT
// 2. CachedValue

//==============================================

UNIMPLEMENTED = function (message) {
  return function () {
    throw message;
  }
}

ABSTRACT = function () {
  return UNIMPLEMENTED('calling unimplemented function of abstract class');
};

//==============================================

CachedValue = function (synchFunction) {
  this.synch = synchFunction;
  this.valid = false;
  this.val = undefined;
}
CachedValue.prototype.get = function() {
  if(!this.valid)
    this.val = this.synch();
  return this.val;
};
CachedValue.prototype.desynch = function() {
  this.valid = false;
};

//==============================================
