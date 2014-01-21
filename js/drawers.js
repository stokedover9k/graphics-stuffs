var ObjDrawer = function (glBuffered, primitive, shader) {
    this.glBuffered = glBuffered;
    this.primitive = primitive;
    this.shader = shader;
}

ObjDrawer.prototype.draw = function() {
    this.glBuffered.draw(this.primitive, this.shader);
};

//========================================================

var SphereDrawer = function (resolution, shader) {
    var verts = createSphere(resolution * 2, resolution);

    var sphere = new GLBufferedStatic;

    for (var i = 0; i < verts.length; i += 8) {
        sphere.posnormv(verts, i);
        sphere.uvv(verts, i+6);
    };

    return new ObjDrawer(sphere, gl.TRIANGLE_STRIP, shader);
}

//========================================================

var ConeDrawer = function (resolution, widthRatio, shader) {
    var verts = createConePart(resolution, widthRatio, Math.PI * 2);

    var cone = new GLBufferedStatic;

    for (var i = 0; i < verts.length; i += 8) {
        cone.posnormv(verts, i);
        cone.uvv(verts, i+6);
    };

    return new ObjDrawer(cone, gl.TRIANGLE_STRIP, shader);
}
