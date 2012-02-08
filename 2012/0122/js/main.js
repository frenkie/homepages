var Paths = Paths || {
    images : "img"
};

var Shared = {
    SCREEN_WIDTH : (function(){
        if(window.innerWidth){
            return window.innerWidth;

        }else if(document.documentElement.clientWidth){
            return document.documentElement.clientWidth;

        }else if(document.body.clientWidth){
            return document.body.clientWidth;
        }
        return 0;
    })(),
    SCREEN_HEIGHT : (function(){
        if(window.innerHeight){
            return window.innerHeight;

        }else if(document.documentElement.clientHeight){
            return document.documentElement.clientHeight;

        }else if(document.body.clientHeight){
            return document.body.clientHeight;
        }
        return 0;
    })(),

    mouseDown : false,

    init : function() {

        this.HALF_WIDTH = this.SCREEN_WIDTH / 2;
        this.HALF_HEIGHT = this.SCREEN_HEIGHT / 2;

        this.mouseX = this.HALF_WIDTH;
        this.mouseY = this.HALF_HEIGHT;

        FB.addEvent(document, 'mousemove', function(e) {
            Shared.onMouseMove.call(Shared, e)
        });
        FB.addEvent(document, 'mousedown', function(e) {
            Shared.onMouseDown.call(Shared, e)
        });
        FB.addEvent(document, 'mouseup', function(e) {
            Shared.onMouseUp.call(Shared, e)
        });

        this.canvas = this.createCanvas(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

        document.body.appendChild(this.canvas);
    },

    createCanvas : function(width, height){

        var elem = document.createElement('canvas');
            elem.width = width;
            elem.height = height;

        if(!(elem.getContext && elem.getContext('2d')) && typeof G_vmlCanvasManager != "undefined"){
            G_vmlCanvasManager.initElement(elem);
        }
        return elem;
    },

    canvasSupported : function(){

        var elem = document.createElement('canvas');

        if( !(elem.getContext && elem.getContext('2d')) && typeof G_vmlCanvasManager != "undefined"){
            G_vmlCanvasManager.initElement(elem);
            if(!!(elem.getContext && elem.getContext('2d'))){
                elem = null;
                return true;
            }
        }
        return !!(elem.getContext && elem.getContext('2d'));
    },

    onMouseMove : function(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    },

    onMouseDown : function(event) {
        this.mouseDown = true;
    },

    onMouseUp : function(event) {
        this.mouseDown = false;
    },

    //http://robertpenner.com/easing/easing_demo.html
    easing : {
        Elastic : {
            // t: current time, b: beginning value, c: change in value, d: duration, a: amplitude (optional), p: period (optional)
            // t and d can be in frames or seconds/milliseconds
            easeOut : function (t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (!a || a < Math.abs(c)) {
                    a = c * 0.1;
                    var s = p / 4;
                }
                else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            }
        },

        Quad: {
            easeOut : function (t, b, c, d) {
                if (t < 0) t = 0;
                if (t >= d) {
                    return b + c;
                }
                return -c * (t /= d) * (t - 2) + b;
            }
        }
    },

    randomRange : function(min, max) {
        return ((Math.random() * (max - min)) + min);
    }
};


//Starry night
var StarryNight = {

    MAX_PARTICLES: 125,

    init : function(canvas) {

        var body = document.getElementsByTagName("body")[0];
            body.className = "starry-night";

        this.context = canvas.getContext('2d');

        this.particles = [];
        this.shootingStarParticles = [];

        this.particleImage = new Image();
        this.particleImage.onload = function(){
            setInterval(function() {
                StarryNight.loop.call(StarryNight);
            }, 1000/30);

            StarryNight.shootingStarLoop.call(StarryNight);
        };
        this.particleImage.src = Paths.images +'/ParticleWhite.png';
    },

    shootingStarLoop : function(){

        setTimeout(function() {
            StarryNight.createShootingStar.call(StarryNight, function(){
                StarryNight.shootingStarLoop.call(StarryNight);
            });
        }, Shared.randomRange(6000, 15000));
    },

    loop: function() {

        // make some particles
        if (this.particles.length < StarryNight.MAX_PARTICLES) {
            this.makeParticle(5);
        }

        // clear the canvas
        this.context.clearRect(0, 0, Shared.SCREEN_WIDTH, Shared.SCREEN_HEIGHT);

        // iterate through each particle
        this.updateParticles(this.particles);
        this.updateParticles(this.shootingStarParticles);

    },

    updateParticles: function(list) {

        for (i = 0; i < list.length; i++) {
            var particle = list[i];

            // render it
            particle.render(this.context);

            // and then update. We always render first so particle
            // appears in the starting point.
            particle.update();
        }
    },

    makeParticle: function(particleCount) {

        for (var i = 0; i < particleCount; i++) {

            var particle = new ImageParticle(this.particleImage,
                    Shared.randomRange(0, Shared.SCREEN_WIDTH),
                    Shared.randomRange(0, Shared.HALF_HEIGHT * 1.2));

            particle.size = Shared.randomRange(0.05, 0.1);
            particle.alpha = Shared.randomRange(0.6, 0.95);

            // save the attribute values at the start so we can use them in update functions
            particle.saveAttributeStates();

            //smooth flicker fade in out in out in out ...
            var flickerSpeed = Shared.randomRange(70, 80);
            particle.fade = (function(theParticle, theFlicker) {

                var startAlpha = theParticle.getSavedAttributeStates().alpha;
                var twentypcAlpha = startAlpha * 0.2;

                return function() {

                    var age = theParticle.age / theFlicker; //don't age too fast

                    return startAlpha - Math.cos(age) * twentypcAlpha;
                };
            })(particle, flickerSpeed);


            //nice bouncing out of the sky
            particle.velY = (function(theParticle, posY) {

                //minimum of 400 milliseconds plus percentage of distance
                var duration = (posY / Shared.HALF_HEIGHT) * 900 + 400;

                return function() {

                    var startValues = theParticle.getSavedAttributeStates();

                    return Shared.easing.Elastic.easeOut(theParticle.age,
                            startValues.posY,
                            posY - startValues.posY,
                            duration,
                            0.2);
                };
            })(particle, particle.posY);


            particle.posY = -20; //position outside top of screen

            // save the attribute values again now that we changed posY
            particle.saveAttributeStates();

            // add particle to the array
            this.particles.push(particle);
        }
    },

    createShootingStar: function(afterCallback) {

        var shooting = [],
                duration = 650,
                posX = Shared.randomRange(20, Shared.SCREEN_WIDTH - 20),
                posY = Shared.randomRange(20, Shared.HALF_HEIGHT * 0.4),
                endPosY = posY + Shared.randomRange(100, 200),
                xDiff = Shared.randomRange(175, 250);
        var endPosX;

        if (posX > Shared.HALF_WIDTH) {
            endPosX = posX - xDiff;
        } else {
            endPosX = posX + xDiff;
        }

        var star = new ImageParticle(this.particleImage, posX, posY);
        star.size = 0.15;
        star.alpha = 0.7;
        star.fade = function() {

            if (this.age >= duration) {
                return 0;
            } else {
                return this.alpha - 0.08;
            }
        };

        star.velX = (function(theStar, theEndX) {
            return function() {
                var startValues = theStar.getSavedAttributeStates();

                return Shared.easing.Quad.easeOut(theStar.age,
                        startValues.posX,
                        theEndX - startValues.posX,
                        duration);
            };
        })(star, endPosX);

        star.velY = (function(theStar, theEndY) {
            return function() {
                var startValues = theStar.getSavedAttributeStates();

                return Shared.easing.Quad.easeOut(theStar.age,
                        startValues.posY,
                        theEndY - startValues.posY,
                        duration);
            };
        })(star, endPosY);

        star.saveAttributeStates();

        shooting.push(star);

        //create a trail of stars for the shooting star to project it's beam
        for (var a = 0; a < 25; a++) {
            var trail = new ImageParticle(this.particleImage, posX, posY);
            trail.size = 0.1;
            trail.fade = (function(theStar, idx) {

                return function() {
                    if (theStar.age >= duration - 4 * (35 - idx)) {
                        return 0;
                    } else {
                        return theStar.alpha - idx * 0.008;
                    }
                };

            })(trail, a);
            
            trail.velX = (function(theStar, theEndX, idx) {
                return function() {
                    var startValues = theStar.getSavedAttributeStates();

                    return Shared.easing.Quad.easeOut(theStar.age - idx * 5,
                            startValues.posX,
                            theEndX - startValues.posX,
                            duration);
                };
            })(trail, endPosX, a);

            trail.velY = (function(theStar, theEndY, idx) {
                return function() {
                    var startValues = theStar.getSavedAttributeStates();

                    return Shared.easing.Quad.easeOut(theStar.age - idx * 5,
                            startValues.posY,
                            theEndY - startValues.posY,
                            duration);
                };
            })(trail, endPosY, a);

            trail.alpha = 0.6;
            trail.saveAttributeStates();

            shooting.push(trail);
        }


        this.shootingStarParticles = shooting;

        setTimeout(function(){

            StarryNight.shootingStarParticles = [];
            afterCallback();

        }, duration * 2); //falling should be finished then, so we can cleanup
    }
};


var CloudyDay = {

    init : function(canvas) {
        
        var body = document.getElementsByTagName("body")[0];
        body.className = "cloudy-day";

        this.context = canvas.getContext('2d');

        this.clouds = [];

        this.particleImage = new Image();
        this.particleImage.src = Paths.images +'/ParticleWhite3.png';

        setInterval(function() {

            CloudyDay.loop.call(CloudyDay);

        }, 1000 / 30);

        setTimeout(function() {
            CloudyDay.makeCloud.call(CloudyDay);
        }, Shared.randomRange(1000, 4000));
    },

    loop: function() {

        // clear the canvas
        this.context.clearRect(0, 0, Shared.SCREEN_WIDTH, Shared.SCREEN_HEIGHT);
        var shiftClouds = false;

        for (var i = 0; i < this.clouds.length; i++) {

            var cloud = this.clouds[i];

            cloud.update();

            if (cloud.finished()) {
                shiftClouds = true;
            }
        }
        if(shiftClouds){
            this.clouds.shift();//
        }
    },

    makeCloud: function() {

        var cloud = new Cloud({
            particleImage : this.particleImage,
            context: this.context,
            posY:  Shared.randomRange(40, Shared.SCREEN_HEIGHT - 40)
        });

        this.clouds.push(cloud);

        this.scheduleCloud();
    },

    scheduleCloud: function() {
        (function(that) {
            setTimeout(function() {
                if (that.clouds.length == 1) {
                    that.makeCloud.call(that);
                } else {
                    that.scheduleCloud.call(that);
                }
            }, Shared.randomRange(20000, 30000));
        })(this);
    }
};

function Cloud(cfg) {
    this.particleImage = cfg.particleImage;
    this.context = cfg.context;
    this.posY = cfg.posY;

    this.particles = [];

    this.generateDuration = Math.PI * 1000;

    this.maxRangeY = Shared.randomRange(25, 75);

    this.age = 0;
    this.born = 0;
}
Cloud.prototype = {


    conceive: function() {
        var d = new Date();
        this.born = d.getTime();
    },

    growOlder: function() {
        if (this.born === 0) {
            this.conceive();
        } else {
            var d = new Date();
            this.age = d.getTime() - this.born;
        }
    },

    update : function() {

        this.growOlder();

        if (this.age < this.generateDuration) {

            this.generate();
        }
        this.updateParticles();
    },

    generate: function(){
        var rangeY = Shared.randomRange(1, this.maxRangeY),
            numParticles = Math.ceil(rangeY / 50);

        var posX,
            pl = this.particles.length;
        if (pl) {
            var last = this.particles[pl - 1];
            posX = last.posX - last.velX * Shared.randomRange(1.3, 3.5);
        } else {
            posX = -1;
        }

        while(numParticles !== 0){

            //top half of the sine wave
            this.createParticle(posX, this.posY + Shared.randomRange(1, rangeY + Shared.randomRange(1, 10)));

            //bottom half of the sine wave
            this.createParticle(posX, this.posY - Shared.randomRange(1, rangeY + Shared.randomRange(1, 10)));

            numParticles--;
        }
    },

    createParticle: function(posX, posY) {
        var particle = new ImageParticle(this.particleImage, posX, posY);

        particle.size = Shared.randomRange(0.15, 0.35);
        particle.alpha = Shared.randomRange(0.5, 0.8);
        particle.rotation = Shared.randomRange(0, 200);
        particle.velX = Shared.randomRange(0.8, 0.9);

        this.particles.push(particle);
    },

    updateParticles: function() {

        for (i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];

            // render it
            particle.render(this.context);

            // and then update. We always render first so particle
            // appears in the starting point.
            particle.update();
        }
    },

    finished: function() {

        var pl = this.particles.length;
        if (pl) {
            return this.particles[pl - 1].posX > (Shared.SCREEN_WIDTH + 30);
        } else {
            return false;
        }
    }
};


FB.addEvent(window, "load", function() {

    if ( Shared.canvasSupported() ){
        var now = new Date();

        Shared.init();

        if (now.getHours() >= 18 || now.getHours() < 7) {
           StarryNight.init(Shared.canvas);
        } else {
           CloudyDay.init(Shared.canvas);
        }
    }
});