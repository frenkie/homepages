var Paths = Paths || {
    images : "img"
};

var Shared = {
    SCREEN_WIDTH : window.innerWidth,
    SCREEN_HEIGHT : window.innerHeight,
    HALF_WIDTH : window.innerWidth / 2,
    HALF_HEIGHT : window.innerHeight / 2,
    mouseDown : false,

    init : function() {

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

        this.canvas = Shared.createCanvas();
        document.body.appendChild(this.canvas);
        this.canvas.width = Shared.SCREEN_WIDTH;
        this.canvas.height = Shared.SCREEN_HEIGHT;
    },

    createCanvas : function(){

        var elem = document.createElement('canvas');
        if(typeof G_vmlCanvasManager != "undefined" && !Shared.canvasSupported){
            G_vmlCanvasManager.initElement(elem);
        }
        return elem;
    },

    canvasSupported : (function(){
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    })(),

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
        this.fallingStarParticles = [];

        this.particleImage = new Image();
        this.particleImage.src = Paths.images +'/ParticleWhite.png';

        setInterval(function() {
            StarryNight.loop.call(StarryNight);
        }, 1000 / 30);

        this.fallingStarLoop();
    },

    fallingStarLoop : function(){

        setTimeout(function() {
            StarryNight.createFallingStar.call(StarryNight, function(){
                StarryNight.fallingStarLoop.call(StarryNight);
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

        // iteratate through each particle
        this.updateParticles(this.particles);
        this.updateParticles(this.fallingStarParticles);

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

            //smooth flicker fade in out in out in out ...
            var flickerSpeed = Shared.randomRange(70, 80);
            particle.fade = (function(theParticle, theFlicker) {
                return function() {

                    var startValues = theParticle.getSavedAttributeStates();
                    var age = theParticle.age / theFlicker;

                    return startValues.alpha - Math.cos(age) * 0.5 * (startValues.alpha / 2.5);
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


            // save the attribute values at the start so we can use them in update functions
            particle.saveAttributeStates();

            // add particle to the array
            this.particles.push(particle);
        }
    },

    createFallingStar: function(afterCallback) {

        var falling = [],
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

        falling.push(star);

        //create a trail of stars for the falling star
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

            falling.push(trail);
        }


        this.fallingStarParticles = falling;

        setTimeout(function(){

            StarryNight.fallingStarParticles = [];
            afterCallback();

        }, duration * 2);
    }
};


var CloudyDay = {

    MAX_PARTICLES: 75,

    init : function(canvas) {

        var body = document.getElementsByTagName("body")[0];
        body.className = "cloudy-day";

        this.context = canvas.getContext('2d');

        this.clouds = [];
        this.numClouds = 0;

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

        for (var i = 0; i < this.clouds.length; i++) {

            var cloud = this.clouds[i];

            cloud.update();

            if (cloud.finished()) {
                this.clouds.shift();
            }
        }
    },

    makeCloud: function() {
        this.numClouds++;

        var cloud = new Cloud({
            name:  this.numClouds,
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
                    CloudyDay.makeCloud.call(CloudyDay);
                } else {
                    that.scheduleCloud.call(that);
                }
            }, Shared.randomRange(20000, 30000));
        })(this);
    },

    makeParticle: function(particleCount) {

        for (var i = 0; i < particleCount; i++) {

            var particle = new ImageParticle(this.particleImage,
                    Shared.randomRange(0, Shared.SCREEN_WIDTH),
                    Shared.randomRange(0, Shared.HALF_HEIGHT));

            particle.size = Shared.randomRange(0.05, 0.1);
            particle.alpha = Shared.randomRange(0.6, 0.95);

            //smooth flicker fade in out in out in out ...
            var flickerSpeed = Shared.randomRange(70, 80);
            particle.fade = (function(theParticle, theFlicker) {
                return function() {

                    var startValues = theParticle.getSavedAttributeStates();
                    var age = theParticle.age / theFlicker;

                    return startValues.alpha - Math.cos(age) * 0.5 * (startValues.alpha / 2);
                };
            })(particle, flickerSpeed);


            //nice bouncing out of the sky
            particle.velY = (function(theParticle, posY) {

                //minimum of 400 milliseconds plus percentage of distance
                var duration = (posY / Shared.HALF_HEIGHT) * 1400 + 400;

                return function() {

                    var startValues = theParticle.getSavedAttributeStates();
                    var age = theParticle.age;

                    return Shared.easing.Elastic.easeOut(age,
                            startValues.posY,
                            posY - startValues.posY,
                            duration,
                            0.2);
                };
            })(particle, particle.posY);

            particle.posY = -20; //position outside top of screen


            // save the attribute values at the start so we can use them in update functions
            particle.saveAttributeStates();

            // add particle to the array
            this.particles.push(particle);
        }
    }
};

function Cloud(cfg) {
    this.particleImage = cfg.particleImage;
    this.context = cfg.context;
    this.posY = cfg.posY;
    this.name = cfg.name;

    this.particles = [];

    this.generateDuration = Math.PI * 1000;

    this.maxRangeY = Shared.randomRange(10, 75);

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

            var rangeY = Shared.randomRange(1, this.maxRangeY),
                    numParticles = Math.ceil(rangeY / 50);
            if (numParticles == 0) {
                numParticles = 1;
            }

            var posX = 0,
                    pl = this.particles.length;
            if (pl) {
                var last = this.particles[pl - 1];
                posX = last.posX - last.velX * Shared.randomRange(1.3, 3.5);
            } else {
                posX = -1;
            }

            for (var a = 0; a < numParticles; a++) {

                this.createParticle(posX, this.posY + Shared.randomRange(1, rangeY + Shared.randomRange(1, 10)));
                this.createParticle(posX, this.posY - Shared.randomRange(1, rangeY + Shared.randomRange(1, 10)));
            }
        }
        this.updateParticles();
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
            return this.particles[pl - 1].posX > Shared.SCREEN_WIDTH + 30;
        } else {
            return false;
        }
    }
};


if ( Shared.canvasSupported ){

    FB.addEvent(window, "load", function() {

        var now = new Date();

        Shared.init();

        if (now.getHours() >= 18 || now.getHours() < 7) {
            StarryNight.init(Shared.canvas);
        } else {
            CloudyDay.init(Shared.canvas);
        }
    });
}