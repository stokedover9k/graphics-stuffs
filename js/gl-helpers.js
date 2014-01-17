
var gl;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) { }
    if (!gl)
        alert("Could not initialise WebGL, sorry :-(");
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript)
        return null;

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader (idVertex, idFragment) {
    var fragmentShader = getShader(gl, idFragment);
    var vertexShader = getShader(gl, idVertex);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        alert("Could not initialise shaders");

    gl.useProgram(shaderProgram);

    return shaderProgram;
}

function pinUniform (name_in_shader, name_anchor) {
    return {
        onto : function (shaderProgram) {
            if( !shaderProgram.uniforms )
                shaderProgram.uniforms = {};
            shaderProgram.uniforms[name_anchor] = gl.getUniformLocation(shaderProgram, name_in_shader);
        }
    }
}

function pinAttribute (name_in_shader, name_anchor) {
    return {
        onto : function (shaderProgram) {
            if( !shaderProgram.attributes )
                shaderProgram.attributes = {};
            shaderProgram.attributes[name_anchor] = gl.getAttribLocation(shaderProgram, name_in_shader);
        }
    }
}
