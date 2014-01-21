/**************************************************
  *************************************************
  !!!!! DEPRECATION !!!!!

  The code in this file is being deprecated. Let's
  thin it out and grab whatever is worth anything
  into a new geom.js.
  *************************************************
  *************************************************/

function createCube() {
  var vertices = [];

  function addFace(c, a, b) {
     var x = c[0], y = c[1], z = c[2];
     var A = a[0], B = a[1], C = a[2];
     var D = b[0], E = b[1], F = b[2];

     vertices.push(x-A-D, y-B-E, z-C-F, x,y,z, 0,0);
     vertices.push(x+A-D, y+B-E, z+C-F, x,y,z, 1,0);
     vertices.push(x+A+D, y+B+E, z+C+F, x,y,z, 1,1);
     vertices.push(x-A+D, y-B+E, z-C+F, x,y,z, 0,1);
     vertices.push(x-A-D, y-B-E, z-C-F, x,y,z, 0,0);
  }

  var xn = [-1,0,0], yn = [0,-1,0], zn = [0,0,-1];
  var xp = [ 1,0,0], yp = [0, 1,0], zp = [0,0, 1];

  addFace(xn, yn, zn);
  addFace(xp, yp, zp);
  addFace(yn, zn, xn);
  addFace(yp, zp, xp);
  addFace(zn, xn, yn);
  addFace(zp, xp, yp);

  return vertices;
}

// @arg zPos is the position of the circle on the z coordinates
// @arg zNormalDir should be 1 or -1 and is the direction of the normal (positive z or negative z)
function createCircleWithZ(steps, zPos, zNormalDir) {
  var vertices = [];

  function addVertex(ang) {
    var s = Math.sin(ang);    var c = Math.cos(ang);
    vertices.push(c, s, zPos,   0,0,zNormalDir,  (zNormalDir * c/2+0.5),(s/2+0.5));
  }

  // draw this in triangles adding vertices in both directions of the 0-angle
  // so that no vertices need to be repeated (GL uses last 2 vertices to
  // complete the triangles).
  addVertex(0);
  for (var i = 0; i < steps/2; i++) {
    addVertex(  Math.PI * 2 / steps * i);
    addVertex(- Math.PI * 2 / steps * i);
  }
  if( steps % 2 == 0 )
    addVertex(Math.PI);

  return vertices;
}

function createPartCircle(steps, missingArc) {
  var vertices = [];

  var arc = 2 * Math.PI - missingArc;
  var stepArc = arc / (steps-1);

  var h = 1;

  function addSide(ang) {
    var s1 = Math.sin(ang);
    var c1 = Math.cos(ang);
    
    vertices.push(c1,s1,0,  c1,s1,0,  0,0)
    vertices.push(c1,s1,h,  c1,s1,0,  0,0)
  }

  for (var i = 0; i < steps; i++) {
    addSide( arc / steps * i );
  };

  return vertices;
}


function createCircle(steps) {
  return createCircleWithZ(steps, 0, 1);
}

function createTube(steps) {

  var vertices = [];

  function addFace (ang1, ang2) {
    var s1 = Math.sin(ang1);    var c1 = Math.cos(ang1);    var s2 = Math.sin(ang2);    var c2 = Math.cos(ang2);
    vertices.push(c1, s1, 1,   c1, s1, 0,   ang1/Math.PI/2, 0);
    vertices.push(c1, s1,-1,   c1, s1, 0,   ang1/Math.PI/2, 1);
    vertices.push(c2, s2,-1,   c2, s2, 0,   ang2/Math.PI/2, 1);
    vertices.push(c2, s2, 1,   c2, s2, 0,   ang2/Math.PI/2, 0);
    vertices.push(c1, s1, 1,   c1, s1, 0,   ang1/Math.PI/2, 0);
  }

  for( var i = 0; i < steps; i++ ) {
    var a1 = Math.PI * 2 / steps * i;
    var a2 = Math.PI * 2 / steps * (i + 1);
    addFace(a1, a2);
  }

  return vertices;
}

function createCylinder(steps) {
  var vertices = createTube(steps);

  vertices = vertices.concat(createCircleWithZ(steps, 1, 1));
  vertices = vertices.concat(createCircleWithZ(steps, -1, -1));

  return vertices;
}

// Creates a parametric sheet of X-by-Y vertices.
// Surface is made using triangle strips.
// @arg getPoint is a function(u, v) returning [x, y, z]
// @arg getNormal is a function(u, v) returning [x, y, z]
function createParametric (X, Y, getPoint, getNormal) {
  var vertices = [];

  function flipX(x, y) { return ( y % 2 == 0 ) ? x : X - x; }

  function addVertexUV(u, v) {
    var normal = getNormal(u, v);
    var point = getPoint(u, v);
    vertices.push(point[0],point[1],point[2],  normal[0],normal[1],normal[2],  u,v);
  }

  function addVertex (x, y) { addVertexUV(x/X, y/Y); }
  function addDiag (x, y) { addVertex(flipX(x, y), y+1);    addVertex(flipX(x+1, y), y); }
  
  for (var y = 0; y < Y; y++) {
    addVertex(flipX(0, y), y);

    for (var x = 0; x < X; x++) { addDiag(x, y); };

    addVertex(flipX(X, y), y+1);
    addVertex(flipX(X, y), y+1);
  };

  return vertices;
}

function getPoint (u, v) { return [1-u*2, 1-v*2, 0]; }
function getNormal(u, v) { return [0,0,1]; }
function createSquareSheet(X, Y) { return createParametric(X, Y, getPoint, getNormal); }

function getSpherePoint(u, v) {
  var x, y, z, r;
  y = Math.sin(u * Math.PI * 2);
  r = Math.cos(u * Math.PI * 2);
  x = r * Math.cos(v * Math.PI);
  z = r * Math.sin(v * Math.PI);
  return [x, y, z];
}
function getSphereNormal(u, v) {
  return getSpherePoint(u, v);
}

function createSphere(N, M) {
  return createParametric(N, M, getSpherePoint, getSphereNormal);
}

function createConePart(steps, topWidthRatio, arc) {

  arc = arc || 2 * Math.PI;
  var xMin = 0, xMax = 1;

  var vertices = [];

  var r1 = 1;  var r2 = topWidthRatio;

  var xaxis = vec3.fromValues(1,0,0);

  function addSide(ang) {
    var s = Math.sin(ang);  var c = Math.cos(ang);

    var left = vec3.fromValues(xMin, r1*c, r1*s);
    var right = vec3.fromValues(xMax, r2*c, r2*s);

    var tangent = vec3.cross(vec3.create(), xaxis, left);
    var diff = vec3.subtract(vec3.create(), right, left);
    var normal = vec3.cross(vec3.create(), tangent, diff);
    vec3.normalize(normal, normal);

    vertices.push(right[0],right[1],right[2],  normal[0],normal[1],normal[2],  ang/arc,1);
    vertices.push(left[0],left[1],left[2],  normal[0],normal[1],normal[2],  ang/arc,0);
  }

  var stepArc = arc / (steps-1);
  for (var i = 0; i < steps; i++) {
    addSide(stepArc * i);
  }

  return vertices;
}
