
GLBufferedStatic = function () {

    var numItems = -1;

    var posData  = [],  hasPos  = false,  posBuffer;
    var normData = [],  hasNorm = false,  normBuffer;
    var uvData   = [],  hasUv   = false,  uvBuffer;

    this.pos = function (x,y,z) {
        posData.push(x, y, z);
        hasPos = true;
    };

    this.posv = function (vec, offset) {
        this.pos(vec[offset], vec[offset+1], vec[offset+2]);
    }

    this.norm = function (x,y,z) {
        normData.push(x, y, z);
        hasNorm = true;
    };

    this.normv = function (vec, offset) {
        this.norm(vec[offset], vec[offset+1], vec[offset+2]);
    }

    this.uv = function (u,v) {
        uvData.push(u, v);
        hasUv = true;
    };

    this.uvv = function (vec, offset) {
        this.uv(vec[offset], vec[offset+1]);
    };

    this.posnorm = function (px,py,pz,  nx,ny,nz) {
        this.pos(px, py, pz);
        this.norm(nx, ny, nz);
    };

    this.posnormv = function (vec, offset) {
        this.posv(vec, offset);
        this.normv(vec, offset+3);
    }

    this.beforeDrawDo = function () {}; // do nothing by default

    this.draw = function (primitive, shader, noprep) {
        finalize();
        this.draw = real_draw;
        this.draw(primitive, shader);
    }

    var real_draw = function (primitive, shader, noprep) {
        if( noprep === undefined || noprep === false )
            shader.prepareToDraw();
        if( hasPos ) {
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.enableVertexAttribArray(shader.attributes["position"]);
            gl.vertexAttribPointer(shader.attributes["position"], 3, gl.FLOAT, false, 0, 0);
        }
        if( hasNorm ) {
            gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
            gl.enableVertexAttribArray(shader.attributes["normal"]);
            gl.vertexAttribPointer(shader.attributes["normal"], 3, gl.FLOAT, false, 0, 0);
        }
        if( hasUv ) {
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.enableVertexAttribArray(shader.attributes["uv"]);
            gl.vertexAttribPointer(shader.attributes["uv"], 2, gl.FLOAT, false, 0, 0);
        }
        gl.drawArrays(primitive, 0, numItems);
    }

    var finalize = function () {
        numItems = posData.length / 3;

        if( hasPos ) {
            posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData), gl.STATIC_DRAW);
        }
        if( hasNorm ) {
            normBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normData), gl.STATIC_DRAW);
        }
        if( hasUv ) {
            uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);
        }

        posData = normData = uvData = null;   // no further data allowed
    }
};
