// Creates a parametric sheet of X-by-Y vertices.
// Surface is made using triangle strips.
// Each vertex is represented as 8 values: [x,y,z,  nx,ny,nz,  u,v].
// Returns a flat array of such values.
//
// @arg getPoint is a function(u, v) returning [x, y, z]
// @arg getNormal is a function(u, v) returning [nx, ny, nz]
function createParametric (X, Y, getPoint, getNormal) {
  var vertices = [];

  function realX(x, y) { return ( y % 2 == 0 ) ? x : X - x; }

  function addVertexUV(u, v) {
    var normal = getNormal(u, v);
    var point = getPoint(u, v);
    vertices.push(point[0],point[1],point[2],  normal[0],normal[1],normal[2],  u,v);
  }

  function addVertex (x, y) {
    addVertexUV(x/X, y/Y);
  }

  function addDiag (x, y) {
    addVertex(realX(x, y), y+1);
    addVertex(realX(x+1, y), y);
  }
  
  for (var y = 0; y < Y; y++) {
    addVertex(realX(0, y), y);

    for (var x = 0; x < X; x++)
      addDiag(x, y);

    addVertex(realX(X, y), y+1);
    addVertex(realX(X, y), y+1);
  };

  return vertices;
}

function createSphere(N, M) {
  function point(u, v) {
    var x, y, z, r;
    y = Math.sin(u * Math.PI * 2);
    r = Math.cos(u * Math.PI * 2);
    x = r * Math.cos(v * Math.PI);
    z = r * Math.sin(v * Math.PI);
    return [x, y, z];
  }

  // For a unit sphere centered at origin, the normal
  // vector is the same as the point on the surface vector.
  return createParametric(N, M, point, point);
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
  for (var i = 0; i < steps; i++)
    addSide(stepArc * i);

  return vertices;
}
