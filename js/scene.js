
// Returns an elbow position for a two-link arm based at
// the origin and reaching for point C.
// @arg a length of first link
// @arg b length of second link
// @arg C point to reach
// @arg D hint vector for elbow
function ik2 (a, b, C, D) {
    var c = vec3.squaredLength(C);
    var x = ((a*a-b*b)/c + 1)/2;
    var tmp = vec3.scale(vec3.create(), C, vec3.dot(C, D)/c);
    vec3.subtract(D, D, tmp);
    var y = Math.sqrt(Math.max(0, a*a - x*x*c)/vec3.squaredLength(D));
    vec3.scale(C, C, x);
    vec3.scale(D, D, y);
    return vec3.add(D, C, D);
}

//=================================================

function toonScene (scene) {
    var sphereDrawer = new SphereDrawer(6, shaderProgram);
    var coneDrawer = new ConeDrawer(6, .8, shaderProgram);

    function scaleSetColorDrawSphere (scale, color) {
        return function () {
            mvMatrix.scalev(scale);
            sphereDrawer.shader.setColor(color);
            sphereDrawer.draw();
        }
    }

    function uniScaleSetColorDrawSphere (scale, color) {
        return scaleSetColorDrawSphere([scale, scale, scale], color);
    }

    function scaleSetColorDrawCone (scale, color) {
        return function () {
            mvMatrix.scalev(scale);
            coneDrawer.shader.setColor(color);
            coneDrawer.draw();
        }
    }

    var drawJoint = uniScaleSetColorDrawSphere(.2, [.5,.1,.1]);

    // recursively draw body parts
    function drawBPart (part) {
        mvMatrix.push();
            mvMatrix.transform(part.matrix())
            for (var i = part.children.length - 1; i >= 0; i--)
                drawBPart(part.children[i]);
            if( part.draw )
                part.draw();
        mvMatrix.pop();
    }

    //--------- Meet Freddy -----------

    var freddy = {
        root   : new BPartRoot(),
        body   : new BPart(),

        hip    : new BPart(),
        upleg  : new BPart(),
        knee   : new BPart(),
        lowleg : new BPart(),
        ankle  : new BPart(),

        shoulder : new BPart(),
        uparm    : new BPart(),
        elbow    : new BPart(),
        lowarm   : new BPart(),
        wrist    : new BPart(),
    };

    //--------- Link Freddy -----------

    freddy.body.setParent(freddy.root);

    // ...leg

    freddy.hip.setParent(freddy.body);
    freddy.hip.setMPT(
        MPTTranslate(vec3.fromValues(0,-1,0))
        .then(MPTRotateX(Math.PI/2))
        .then(MPTRotateY(-Math.PI/2))
        .toConst()           // Combine into one static transformation for efficiency.
        .then(MPTRotateZ(0))   // Bend hip.
        );
    freddy.hip.bend = freddy.hip.getMPT().components[1];

    freddy.upleg.setParent(freddy.hip);
    freddy.upleg.length = 1;
    freddy.upleg.width = .15;

    freddy.knee.setParent(freddy.upleg);
    freddy.knee.setMPT(
        MPTTranslate(vec3.fromValues(1,0,0))
        .toConst()           // Turn into a static transformation for efficiency.
        .then(MPTRotateZ(0))   // Bend knee.
        );
    freddy.knee.bend = freddy.knee.getMPT().components[1];

    freddy.lowleg.setParent(freddy.knee);
    freddy.lowleg.length = .7;
    freddy.lowleg.width = .1;

    freddy.ankle.setParent(freddy.lowleg);
    freddy.ankle.setMPT(
        MPTTranslate(vec3.fromValues(freddy.lowleg.length, 0, 0))
        .toConst()
        .then(MPTRotateZ(0))   // Bend foot at ankle
        );
    freddy.ankle.bend = freddy.ankle.getMPT().components[1];

    // ...arm

    freddy.shoulder.setParent(freddy.body);
    freddy.shoulder.setMPT(
        MPTTranslate(vec3.fromValues(0,1,0))
        .then(MPTRotateX(Math.PI/2))
        .then(MPTRotateY(Math.PI/2))
        .toConst()           // Combine into one static transformation for efficiency.
        .then(MPTRotateZ(0))   // Bned shoulder.
        );
    freddy.shoulder.bend = freddy.shoulder.getMPT().components[1];

    freddy.uparm.setParent(freddy.shoulder);
    freddy.uparm.length = 1;
    freddy.uparm.width = .15;

    freddy.elbow.setParent(freddy.uparm);
    freddy.elbow.setMPT(
        MPTTranslate(vec3.fromValues(1,0,0))
        .toConst()           // Turn into a static transformation for efficiency.
        .then(MPTRotateZ(0))   // Bend elbow.
        );
    freddy.elbow.bend = freddy.elbow.getMPT().components[1];

    freddy.lowarm.setParent(freddy.elbow);
    freddy.lowarm.length = .7;
    freddy.lowarm.width = .1;

    freddy.wrist.setParent(freddy.lowarm);
    freddy.wrist.setMPT(
        MPTTranslate(vec3.fromValues(freddy.lowarm.length, 0, 0))
        .toConst()
        .then(MPTRotateZ(0))   // Bend hand at wrist.
        );
    freddy.wrist.bend = freddy.wrist.getMPT().components[1];

    // ...foot

    freddy.ankle.uniformToeBend = MPTRotateZ(0);

    function addToe (angle, falangeeLength) {
        var falangee1 = new BPart();
        falangee1.setParent(freddy.ankle);
        falangee1.setMPT(
            MPTRotateX(angle)
            .then(MPTRotateZ(Math.PI/2))
            .toConst()
            .then(freddy.ankle.uniformToeBend)
            );
        falangee1.bend = falangee1.getMPT().components[1];

        falangee1.draw = scaleSetColorDrawCone([falangeeLength, .075, .075], [.5, .5, .1]);

        var falangee2 = new BPart();
        falangee2.setParent(falangee1);
        falangee2.setMPT(
            MPTTranslate(vec3.fromValues(falangeeLength, 0, 0))
            .then(freddy.ankle.uniformToeBend)
            );
        falangee2.bend = falangee2.getMPT().components[1];

        falangee2.draw = scaleSetColorDrawCone([falangeeLength, .075, .075], [.5, .5, .1]);
    }

    addToe( Math.PI/4, .4);  // right toe
    addToe(-Math.PI/4, .4);  // left toe
    addToe( Math.PI,   .4);  // heal

    // ...hand

    freddy.wrist.uniformFingerBend = MPTRotateZ(0);

    function addFinger (angle, falangeeLength) {
        var falangee1 = new BPart();
        falangee1.setParent(freddy.wrist);
        falangee1.setMPT(
            MPTRotateX(angle)
            .then(MPTRotateZ(Math.PI/2))
            .toConst()
            .then(freddy.wrist.uniformFingerBend)
            );
        falangee1.bend = falangee1.getMPT().components[1];

        falangee1.draw = scaleSetColorDrawCone([falangeeLength, .075, .075], [.5, .5, .1]);

        var falangee2 = new BPart();
        falangee2.setParent(falangee1);
        falangee2.setMPT(
            MPTTranslate(vec3.fromValues(falangeeLength, 0, 0))
            .then(freddy.wrist.uniformFingerBend)
            );
        falangee2.bend = falangee2.getMPT().components[1];

        falangee2.draw = scaleSetColorDrawCone([falangeeLength, .075, .075], [.5, .5, .1]);
    }

    addFinger(Math.PI/3*1, .4);
    addFinger(Math.PI/3*3, .4);
    addFinger(Math.PI/3*5, .4);

    //--------- How to draw Freddy ----------

    var drawBody = (function () {
        var body = scaleSetColorDrawSphere([1,1,.5], [.4,.4,.4]);
        var eye = uniScaleSetColorDrawSphere(.2, [.1,.1,.5]);

        var leftEyeLoc  = vec3.normalize(vec3.create(), vec3.fromValues(.7,.7,1));
        var rightEyeLoc = vec3.normalize(vec3.create(), vec3.fromValues(-.7,.7,1));
        
        return function () {
            body();
            mvMatrix.push();
                mvMatrix.translatev(leftEyeLoc);
                eye();
            mvMatrix.pop();
            mvMatrix.push();
                mvMatrix.translatev(rightEyeLoc);
                eye();
            mvMatrix.pop();
        }
    })();

    freddy.root  .draw = uniScaleSetColorDrawSphere(.3, [.6,.6,.6]);
    freddy.body  .draw = drawBody;

    freddy.hip   .draw = drawJoint;
    freddy.upleg .draw = scaleSetColorDrawCone([freddy.upleg.length, freddy.upleg.width, freddy.upleg.width], [.5, .5, .1]);
    freddy.knee  .draw = drawJoint;
    freddy.lowleg.draw = scaleSetColorDrawCone([freddy.lowleg.length, freddy.lowleg.width, freddy.lowleg.width], [.5, .5, .1]);
    freddy.ankle .draw = drawJoint;

    freddy.shoulder.draw = drawJoint;
    freddy.uparm   .draw = scaleSetColorDrawCone([freddy.uparm.length, freddy.uparm.width, freddy.uparm.width], [.5, .5, .1]);
    freddy.elbow   .draw = drawJoint;
    freddy.lowarm  .draw = scaleSetColorDrawCone([freddy.lowarm.length, freddy.lowarm.width, freddy.lowarm.width], [.5, .5, .1]);
    freddy.wrist   .draw = drawJoint;

    freddy.draw = function () {
        drawBPart(this.root);
    }

    //--------- How to move Freddy -----------

    freddy.update = function () {
        freddy.hip.bend.setAngle(Math.PI/6 + Math.sin(time) * Math.PI/3);
        freddy.knee.bend.setAngle( -(Math.sin(time + Math.PI/3)+1) * Math.PI/4 );

        freddy.ankle.uniformToeBend.setAngle(-.3 - .3 * Math.sin(time - Math.PI/4));
    }

    //--------- Put Freddy into the scene --------

    scene.objects.push(freddy);
}
