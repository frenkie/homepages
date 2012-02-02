januari 22
## Cloudy Day and Starry Night -
### HTML5 canvas particle experiments based on Seb Lee Delisle Fronteers '11 presentation

[Seb Lee Delisle](sebleedelisle.com) gave an excellent presentation on creative coding at the [Fronteers 2011 conference](http://fronteers.nl/congres/2011/).
The source code for his html5 canvas particle experiments is on [github](https://github.com/sebleedelisle/JavaScript-PixelPounding-demos) and inspired me to turn my homepage into a particle experiment based on the time of the day.

The result is [my homepage](http://frankbosma.nl/homepages/2012/0122/) showing particle clouds if you visit it between 7 am and 6 pm and a particle filled starry night between 6 pm and 7 am.


### IE support
Support for IE is added through [Flashcanvas](http://flashcanvas.net/) which has excellent documentation on how to implement it and what it supports. I use the non pro version.
I also tried it with [ExplorerCanvas](http://code.google.com/p/explorercanvas/) but that didn't work out with mage particles in combination with scaling, alpha channels and about a 125 of them :). Because Flashcanvas worked out of the box I decided to stick with that.


### Code
Take a look at <code>js/main.js</code> to see what's going on. Based on the time of day <code>CloudyDay</code> or <code>StarryNight</code> is initialised with a reference to a canvas element.

**ImageParticle.js**

Both particle systems use Seb Lee Delisle's <code>js/ImageParticle.js</code> class and a white partially transparent image. The class basically provides an easy way to render an Image on the canvas through an update and render function of an ImageParticle instance. You can set various attributes on the instance like positioning and x and y velocity. The latter wil change the current x and y position of a particle each time you call update() so you can animate it. Same thing can be done with transparency and rotation.


**Modifications**

I modified the ImageParticle class to keep track of a particle's age and to accept functions for updating particle attributes. In combination with a particle's age and Robert Penner's world famous [easing functions](http://www.robertpenner.com/easing/) those attribute functions give you sweet property animations. Another addition I made is a way to save and retreive an ImageParticle's state. The easing functions for example need the start values of a particle's attributes.

#### Starry Night
Starry Night is a clear example of the mentioned easing functions when you see the stars dropping from te sky with a bounce.

The alpha flickering is based on a [cosine wave](http://en.wikipedia.org/wiki/Cosine_wave) and the particle's age.

```javascript
    var flickerSpeed = Shared.randomRange(70, 80);
    particle.fade = (function(theParticle, theFlicker) {

        var startAlpha = theParticle.getSavedAttributeStates().alpha;

        return function() {

            var age = theParticle.age / theFlicker; //don't age too fast

            return startAlpha - Math.cos(age) * 0.5 * (startAlpha / 2.5);
                    //lower the alpha value with between 0 and 0.5 of a quarter of it's start value
        };
    })(particle, flickerSpeed);
```

Would have made for an interesting math class back in my high school years if we got (co)sine and pi explained this way.

![shooting star](http://frankbosma.nl/homepages/2012/0122/img/readme-shooting-star.jpg)

An occasional shooting star can be seen which consists of 26 image particles following the same path a small time distance apart. One leading star and 25 trailing stars.


#### Cloudy Day

Cloudy Day is a particle systems that creates random particle clouds. No more than 2 on 1 screen because of performance.

Creating a realistic enough [cumulus cloud](http://en.wikipedia.org/wiki/Cumulus_cloud) has been a fun experiment. I'm still not completely satisfied so if you know of a better/another way, please let me know in the comments!

**sine waves**

![A cloud based on two sine wave halfs](http://frankbosma.nl/homepages/2012/0122/img/readme-sine-cloud.jpg)

At first I thought the easiest mathematical way was seeing a cumulus cloud as the shape of two sine wave halfs glued together and filled with cloud particles, plus some randomness. Half a sine wave is <code>Math.PI</code> seconds so floating the clouds in from the left side of the screen means I would only have to generate particles for <code>Math.PI</code> seconds adding them to the cloud, vertical slice by slice.

```javascript
    //generates a vertical slice of particles, called for 3.14 seconds, 30 times per second
    generate: function(){
        var rangeY = Math.sin(this.age / 1000),   //this.age is the age of a cloud in milliseconds
            numParticles = Math.ceil(rangeY * 2); //through rangeY Math.sin determines
                                                  //the number of particles

        //x position of the new particles is relative and at random distance of 1 of the previous ones
        var posX,
            pl = this.particles.length;
        if (pl) {
            var last = this.particles[pl - 1];
            posX = last.posX - last.velX * Shared.randomRange(1.3, 3.5);
        } else {
            posX = -1;
        }

        //y position of the particles is relative to the current y position of the cloud
        //this.maxRangeY is a random value per cloud between 10 and 75
        while(numParticles !== 0) {

            //top half of the sine wave, Math.sin (reflected by rangeY)
            //now determines the maximum vertical deviation.
            this.createParticle(posX, this.posY + Shared.randomRange(1, rangeY * this.maxRangeY));

            //bottom half of the sine wave
            this.createParticle(posX, this.posY - Shared.randomRange(1, rangeY * this.maxRangeY));

            numParticles--;
        }
    },

    //adding randomness to size, alpha, rotation and a little bit of horizontal speed
    //should create a dynamic cloud
    createParticle: function(posX, posY) {
        var particle = new ImageParticle(this.particleImage, posX, posY);

        particle.size = Shared.randomRange(0.15, 0.35);
        particle.alpha = Shared.randomRange(0.5, 0.8);
        particle.rotation = Shared.randomRange(0, 200);
        particle.velX = Shared.randomRange(0.8, 0.9);

        this.particles.push(particle);
    }
```

In the end that made all clouds look like sine waves shapes even when adding randomness.

![Clouds based on two sine wave halfs](http://frankbosma.nl/homepages/2012/0122/img/readme-sine-clouds.jpg)

So i ditched the realistic look and followed Seb's advice to add more randomness and simple equations instead of trying to be too realistic.

**random**

![Clouds based on a lot of randomness](http://frankbosma.nl/homepages/2012/0122/img/readme-random-clouds.jpg)

As you can see there is a lot of diversity in the clouds.

```javascript
    generate: function(){
        var rangeY = Shared.randomRange(1, this.maxRangeY), //rangeY isn't based on Math.sin anymore
            numParticles = Math.ceil(rangeY / 50); //we now just use a random number of particles

        var posX,
            pl = this.particles.length;
        if (pl) {
            var last = this.particles[pl - 1];
            posX = last.posX - last.velX * Shared.randomRange(1.3, 3.5);
        } else {
            posX = -1;
        }

        while(numParticles !== 0){

            //top half of the cloud,
            //the deviation of the y position is now more random, because rangeY
            //isn't based on a sine function anymore
            this.createParticle(posX, this.posY + Shared.randomRange(1,
                                                                rangeY + Shared.randomRange(1, 10)));

            //bottom half of the cloud
            this.createParticle(posX, this.posY - Shared.randomRange(1,
                                                                rangeY + Shared.randomRange(1, 10)));

            numParticles--;
        }
    }
```

### to infinity and beyond
Well that about sums it up. I hope these experiments got you interested in experimenting with canvas and/or particles. Be sure to check out Seb Lee Delisle's mentioned [particle experiments](https://github.com/sebleedelisle/JavaScript-PixelPounding-demos) for more creativity or check out my code from github and start fooling around! His or my slightly modified ImageParticle.js is a good start. Enjoy! Show me your experiments in the comments and oh, do let me know if you discover a good way to draw clouds :)