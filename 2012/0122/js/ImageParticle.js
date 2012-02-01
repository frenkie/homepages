/**
 * Modified ImageParticle.js from https://github.com/sebleedelisle/JavaScript-PixelPounding-demos
 * - added particle age
 * - added possibility to save attribute states
 * - added option to use functions for updating attributes
 * - moved functions to ImageParticle.prototype
 */

function ImageParticle(img, posx, posy) {

	// the image to use for the particle.
	this.img = img;

	// the position of the particle
	this.posX = posx;
	this.posY = posy;
    this.size = 1;

	// the velocity
	this.velX = 0;
	this.velY = 0;

	// multiply the particle size by this every frame
	this.shrink = 1;

	// if maxSize is a positive value, limit the size of
	// the particle (this is for growing particles).
	this.maxSize = -1;

	// if true then make the particle flicker
	this.shimmer = false;

	// multiply the velocity by this every frame to create
	// drag. A number between 0 and 1, closer to one is
	// more slippery, closer to 0 is more sticky. values
	// below 0.6 are pretty much stuck :)
	this.drag = 0;

	// add this to the yVel every frame to simulate gravity
	this.gravity = 0;

	// current transparency of the image
	this.alpha = 1;
	// subtracted from the alpha every frame to make it fade out
	this.fade = 0;

	// the amount to rotate every frame
	this.spin = 0;
	// the current rotation
	this.rotation = 0;

	// the blendmode of the image render. 'source-over' is the default
	// 'lighter' is for additive blending.
	this.compositeOperation = 'source-over';


    //lifespan
    this.attributeStates = {};
    this.born = 0;
    this.age = 0;
    this.freeze = false;

    this.saveAttributeStates();
}

ImageParticle.prototype = {

    conceive: function(){
        var d = new Date();
        this.born = d.getTime();
    },

    growOlder: function(){
        if(this.born === 0){
            this.conceive();
        }else{
            var d = new Date();
            this.age = d.getTime() - this.born;
        }
    },

    frozen: function(){
        return (typeof this.freeze == "function")? this.freeze() : this.freeze;
    },

    saveAttributeStates: function(){
        for(var a in this){
            if(this.hasOwnProperty(a)){

                var attrib = this[a],
                    attribType = typeof attrib;

                switch(attribType){
                    case "string": case "number":
                        this.attributeStates[a] = attrib;   
                        break;
                }
            }
        }
    },

    getSavedAttributeStates : function(){
        return this.attributeStates;
    },

	update : function() {

        if(this.frozen()){return;}

		// simulate drag
        if(this.drag !== 0){
            this.updateValue("velX", this.drag, "*");
            this.updateValue("velY", this.drag, "*");
        }
		
		// add gravity force to the y velocity
        if(this.gravity !== 0){
            this.updateValue("velY", this.gravity, "+");
        }
		
		// and the velocity to the position
        this.updateValue("posX", this.velX, "+");
        this.updateValue("posY", this.velY, "+");
		
		// shrink the particle
        this.updateValue("size", this.shrink, "*");

		// if maxSize is set and we're bigger, resize!
		if((this.maxSize>0) && (this.size>this.maxSize)){
			this.updateValue("size", this.maxSize);
        }
		
		// and fade it out
        this.updateValue("alpha", this.fade, "-");
		if(this.alpha<0){ this.alpha = 0; }
		
		// rotate the particle by the spin amount.
        this.updateValue("rotation", this.spin, "+");
	},

    updateValue: function(attrib, change, operator){

        operator = operator || "=";

        if(typeof change == "function"){

            this[attrib] = change.call(this);

        }else{
            switch(operator){

                case "*":
                    this[attrib] *= change;
                    break;

                case "+":
                    this[attrib] += change;
                    break;

                case "-":
                    this[attrib] -= change;
                    break;

                default:
                    this[attrib] = change;
                    break;
            }
        }
    },
	
	render : function(c) {

        //start lifespan or grow old
        this.growOlder();
	
		// if we're fully transparent, no need to render!
		if(this.alpha ==0) return;
		
		// save the current canvas state
		c.save();
		
		// move to where the particle should be
		c.translate(this.posX, this.posY);
		
		// scale it dependent on the size of the particle
		var s = this.shimmer ? this.size * Math.random() : this.size; //this.shimmer ? this.size * 0 : this.size; 
		c.scale(s,s);
		
		// and rotate
		c.rotate(this.rotation * ImageParticle.TO_RADIANS);
						
		// move the draw position to the center of the image
		c.translate(this.img.width*-0.5, this.img.width*-0.5);
		
		// set the alpha to the particle's alpha
		c.globalAlpha = this.alpha; 
		
		// set the composition mode
		c.globalCompositeOperation = this.compositeOperation;
				
		// and draw it! 
		c.drawImage(this.img,0,0);
		
		// and restore the canvas state
		c.restore();
					
	}
};

ImageParticle.TO_RADIANS = Math.PI / 180;