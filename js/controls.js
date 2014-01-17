Controls = function () {

    this.Keyboard = {
        pressed : {},

        handleDown : function (keyCode) {
            this.pressed[keyCode] = true;
            console.log("key pressed:", keyCode);
        },
        handleUp : function (keyCode) {
            this.pressed[keyCode] = false;
            console.log("key released:", keyCode);
        }
    };

    this.Mouse = {
        x : 0,
        y : 0,
        clickedX : 0,
        clickedY : 0,
        pressed : false,

        handleDown : function () {
            this.clickedX = this.x;  this.clickedY = this.y;
            this.pressed = true;
            console.log("mouse clicked at:", this.x, this.y);
        },
        handleUp : function () {
            this.pressed = false;
            console.log("mouse released at:", this.x, this.y);
        },
        handleMove : function (x, y) {
            this.x = x;  this.y = y;
        }
    };
};
