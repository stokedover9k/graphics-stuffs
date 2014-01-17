var pMatrix = new (function () {
    
    var fov = 45,  ar = 1.5,  near = 0.1,  far = 100;
    var p_matrix = mat4.create();
    var p_matrix_valid = false;

    this.setFov  = function (t) { p_matrix_valid = false;  fov = t;  }
    this.setAr   = function (t) { p_matrix_valid = false;  ar = t;   }
    this.setNear = function (t) { p_matrix_valid = false;  near = t; }
    this.setFar  = function (t) { p_matrix_valid = false;  far = t;  }

    function p_compute() { mat4.perspective(p_matrix, fov, ar, near, far); }

    this.get = function () {
        if( !p_matrix_valid )
            p_compute();
        return p_matrix;
    };
})();

var mvMatrix = new (function () {

    var top = mat4.create();
    var stack = [top];

    var temp = mat4.create();

    this.transform = function (m) {
        mat4.multiply(top, top, m);
    }

    this.translate = function (x, y, z) {
        this.translatev([x,y,z]);
    }
    this.translatev = function (t) {
        mat4.identity(temp);
        mat4.translate(temp, temp, t);
        this.transform(temp);
    }

    this.scale = function (x, y, z) {
        this.scalev([x,y,z]);
    }
    this.scaleu = function (t) {
        this.scalev([t, t, t]);
    }
    this.scalev = function (t) {
        mat4.identity(temp);
        mat4.scale(temp, temp, t);
        this.transform(temp);
    }

    this.rotate = function (rad, axisX, axisY, axisZ) {
        this.rotatev(rad, [axisX, axisY, axisZ]);
    }
    this.rotatev = function (rad, axis) {
        mat4.identity(temp);
        mat4.rotate(temp, temp, rad, axis);
        this.transform(temp);
    }

    this.rotateX = function (rad) {
        mat4.identity(temp);
        mat4.rotateX(temp, temp, rad);
        this.transform(temp);
    }
    this.rotateY = function (rad) {
        mat4.identity(temp);
        mat4.rotateY(temp, temp, rad);
        this.transform(temp);
    }
    this.rotateZ = function (rad) {
        mat4.identity(temp);
        mat4.rotateZ(temp, temp, rad);
        this.transform(temp);
    }

    this.size = function () {
        return stack.length;
    }

    this.clear = function () {
        mat4.identity(top);
        stack = [top];
    }

    this.push = function () {
        top = mat4.clone(top);
        stack.push(top);
    }

    this.pop = function () {
        stack.pop();
        top = stack[stack.length-1];
    }

    this.push_and_set = function (m) {
        top = m;
        stack.push(m);
    }

    this.top = function () {
        return top;
    }

})();

/*
    mvMatrix.push();
        mvMatrix.translate([1, 2, 3]);
    mvMatrix.pop();
    mvMatrix.push();
        mvMatrix.transform(translation_matrix);
    mvMatrix.pop();
*/

var Camera = new function () {
    
    zoom = -5;
    spin = 0;
    tilt = 0;

    var transform_valid_ = false;
    var m = mat4.create();
    var rot_ = mat4.create(), trans_ = mat4.create();

    this.setZoom = function (t) { transform_valid_ = false;  zoom = t; };
    this.setSpin = function (t) { transform_valid_ = false;  spin = t; };
    this.setTilt = function (t) { transform_valid_ = false;  tilt = t; };

    this.getZoom = function () { return zoom; };
    this.getSpin = function () { return spin; };
    this.getTilt = function () { return tilt; };

    this.getTransform = function () {
        if( !transform_valid_ ) {
            mat4.identity(rot_);
            mat4.rotateY(rot_, rot_, glMatrix.toRadian(spin));
            mat4.rotateX(rot_, rot_, glMatrix.toRadian(tilt));

            mat4.identity(trans_);
            mat4.translate(trans_, trans_, [0, 0, zoom]);

            mat4.identity(m);
            mat4.multiply(m, trans_, rot_);
            transform_valid_ = true;
        }
        return m;
    }

};
