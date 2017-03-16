var canvas = document.querySelector('.fireworks'),
    ctx = canvas.getContext('2d'),
    
    // full screen dimensions
    canvasWidth = window.innerWidth,
    canvasHeight = window.innerHeight,
    
    fireworks = [],
    particles = [],
    smokePuffs = [],
    
    maxSmokeVelocity = 1,
    
    hue = 120,
    
    // When launching fireworks via a click (tap),
    // too many will get launched at once without
    // some limitation applied. We will use this
    // to limit to one launch per 5 loop ticks.
    limiterTotal = 5,
    limiterTick = 0,
    
    // These will be used to time the auto launches
    // of fireworks to one launch per 80 loop ticks.
    timerTotal = 80,
    timerTick = 0,
    
    mouseDown = false,
    mouseXposition, 
    mouseYposition,
    
    smokeImage = new Image();

// Preloading the smoke image
smokeImage.src = 'images/smoke.png';

// Set canvas dimensions to match dimensions of browser's
// inner window.
canvas.width = canvasWidth;
canvas.height = canvasHeight;

//
// Helper functions...
//

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Calculate the distance between two points
function calculateDistance(point1X, point1Y, point2X, point2Y) {
    
    var xDistance = point1X - point2X,
        yDistance = point1Y - point2Y;
    
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    
}

//
// Create a Firework particle class constructor function
//
function Firework(startX, startY, targetX, targetY) {
    
    this.x = startX;
    this.y = startY;
    
    this.startX = startX;
    this.startY = startY;
    
    this.targetX = targetX;
    this.targetY = targetY;
    
    // distance between starting and ending points
    this.distanceToTarget = calculateDistance(startX, startY, targetX, targetY);
    
    this.distanceTraveled = 0;
    
    // track the coordinates of where the Firework particle
    // has been as it is flying toward the target to create
    // a trail effect
    
    this.coordinates = [];
    this.coordinateCount = 5;
    
    // populate the initial coordinates collection with 
    // the current coordinates of the Firework particle
    while (this.coordinateCount--) {
        
        this.coordinates.push([this.x, this.y]);
        
    }
    
    this.angle = Math.atan2(targetY - startY, targetX - startX);
        
    this.speed = 2;

    this.acceleration = 1.05;

    this.brightness = randRange(50, 70);

    // circle target indicator radius
    this.targetRadius = 1;
    
}

//
// Draw the Firework particle - method of the Firework class
//

Firework.prototype.draw = function() {
    
    ctx.beginPath();
    
    // Move to the last tracked coordinate (last element) in the
    // this.coordinates array and 
    // then draw a line to the current x and y coordinate
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    
    ctx.lineTo(this.x, this.y);
    
    ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
    
    ctx.stroke();
    
    // Draw the circle for this firework's target as
    // a pulsing circle
    
    ctx.beginPath();
    
    ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI*2);
    
    ctx.stroke();
    
}

// 
// Update (animate) the Firework particle
//
Firework.prototype.update = function(index) {
    
    // remove the last element in the coordinates array property
    this.coordinates.pop();
    
    // Add current coordinates of the firework to the
    // beginning of the coordinates array (insert)
    this.coordinates.unshift([this.x, this.y]);
    
    
    // Make the target circle pulsate by adjusting its radius
    if (this.targetRadius < 8) {
        
        this.targetRadius += .3;
        
    } else {
        
        this.targetRadius = 1;
        
    }
    
    // speed up the firework
    this.speed *= this.acceleration;
    
    // calculate the current velocities based on angle and speed
    
    var velocityX = Math.cos(this.angle) *  this.speed,
        velocityY = Math.sin(this.angle) * this.speed;
    
    // How far will the firework have traveled with above
    // velocities applied?
    
    this.distanceTraveled = calculateDistance(this.startX, this.startY, this.x + velocityX, this.y + velocityY);
    
    // If the distance traveled,, including velocities,
    // is greateer than the initial distance to the target
    // then the target is reached
    
    if (this.distanceTraveled >= this.distanceToTarget) {
        
        // create explosion (another particle)
        
        createExplosion(this.targetX, this.targetY);
        
        // create smoke (another particle)
        
        createSmoke(this.targetX, this.targetY);
        
        // cleanup firework particle by removing it from array
        
        fireworks.splice(index, 1);
        
    } else { // we have not reached target so move our particle
        
        this.x += velocityX;
        this.y += velocityY;
        
    }
}

//
// Create Explosion particles
//
function createExplosion(x, y) {
    
    var particleCount = 80;
    
    while(particleCount--) {
        particles.push(new ExplosionParticle(x, y));
    }
    
}

//
// ExplosionParticle Constructor function
//

function ExplosionParticle(x, y) {
    
    this.x = x;
    this.y = y;
    
    // Track the past coordinates of each explosion
    // particle to create a trail effect
    this.coordinates = [];
    this.coordinateCount = Math.round(randRange(10, 20));
    
    // populate the initial coordinate collection with the 
    // current coordinates 
    while(this.coordinateCount--) {
        
        this.coordinates.push([this.x, this.y]);
        
    }
    
    this.angle = randRange(0, Math.PI*2);
    
    this.speed = randRange(1, 10);
    
    this.friction = .95;
    
    this.gravity = 1;
    
    this.hue = randRange(hue - 20, hue + 20);
    this.brightness = randRange(50, 80);
    
    this.alpha = 1;
    
    this.decay = randRange(.003, .006);
    
}

//
// Draw the Explosion particle - method of the Explosion class
//

ExplosionParticle.prototype.draw = function() {
    
    ctx.beginPath();
    
    // Move to the last tracked coordinate (last element) in the
    // this.coordinates array and 
    // then draw a line to the current x and y coordinate
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    
    ctx.quadraticCurveTo(this.x + 1, this.y - Math.round(randRange(5, 10)), this.x, this.y);
    
    ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    
    ctx.stroke();
    
}

// 
// Update (animate) the Explosion particle
//
ExplosionParticle.prototype.update = function(index) {
    
    // remove the last element in the coordinates array property
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    
    // slow down the explosion particle
    this.speed *= this.friction;
    
    // calculate the current velocities based on angle and speed
    
    this.x += Math.cos(this.angle) *  this.speed;
    
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    
    this.alpha -= this.decay;
    
    if (this.alpha <= this.decay) {
        particles.splice(index, 1); // remove this particle
    }
    
}

//
// Create smoke for the explosion
//

function createSmoke(x, y) {
    
    var puffCount = 1;
    
    for (var i = 0; i < puffCount; i++) {
        
        smokePuffs.push(new SmokeParticle(x, y));
        
    }
    
}

//
// SmokeParticle cconstructor function
//
function SmokeParticle(x, y) {
    
    this.x = randRange(x - 25, x + 25);
    this.y = randRange(y - 15, y + 15);
    
    this.xVelocity = randRange(.2, maxSmokeVelocity);
    
    this.yVelocity = randRange(-.1, -maxSmokeVelocity);
    
    this.alpha = 1; 
    
}

SmokeParticle.prototype.draw = function(index) {
    
    if (smokeImage) {
        
        ctx.save();
        
        ctx.globalAlpha = 0.3;
        
        ctx.drawImage(smokeImage, this.x - smokeImage.width/2, this.y - smokeImage.height/2);
        
        ctx.restore();
        
    }
    
    
}

SmokeParticle.prototype.update = function(index) {
    
    this.x += this.xVelocity;
    this.y += this.yVelocity;
    
    this.alpha -= .001;
    
    if (this.alpha <= 0) {
        
        smokePuffs.splice(index, 1);
        
    }
    
}

//
// heartBeat will be called framerate time per second
//
function heartBeat() {
    
    // Call this function recursively framerate times per second
    requestAnimationFrame(heartBeat);
    
    // increase the hue value slightly to get different
    // firework colors over time.
    hue += 0.5;
    
    // Normally, ctx.clearRect() would be used to clear the
    // canvas (either all of it or part of it), but we want
    // to create a trail effect on our firework as it travels
    // through the night sky...
    //
    // Setting the composite operation of the  context to 
    // a value of 'destination-out' will allow us to clear
    // the canvas at a specific opacity, rather than wiping
    // completely clear.
    ctx.globalCompositeOperation = 'destination-out';
    
    // Decrease the alpha value to create more prominent trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Setting a new composite operation value of 'lighter'
    // creates bright highlight points as the fireworks and 
    // particles overlap each other.
    ctx.globalCompositeOperation = 'lighter';
    
    // Loop over each Firework particle, draw it, and animate it.
    var i = fireworks.length;
    
    while(i--) {
        
        fireworks[i].draw();
        fireworks[i].update(i);
        
    }
    
    
    // Loop over each Explosion particle, draw it, and animate it.
    var i = particles.length;
    
    while(i--) {
        
        particles[i].draw();
        particles[i].update(i);
        
    }
    
    // Loop over each Smoke particle, draw it, and animate it.
    var i = smokePuffs.length;
    
    while(i--) {
        
        smokePuffs[i].draw();
        smokePuffs[i].update(i);
        
    }
    
    // Launch fireworks automatically to random target coordinates
    // when the mouse is not pressed down
    if (timerTick >= timerTotal) {
        
        if (!mouseDown) { // mouse is not down
        
            // Launch a firework particle from bottom-middle
            // of screen, then set random target coordinates.
            // Note, target y-position should always be in
            // top half of screen.
            fireworks.push(new Firework(canvasWidth/2, canvasHeight, randRange(0, canvasWidth), randRange(0, canvasHeight/2)));
            
            timerTick = 0;
        }
        
    } else {
        
        timerTick++;
        
    }
    
    // Limit the rate at which fireworks get launched when user
    // presses mouse down
    if (limiterTick >= limiterTotal) {
        
        if (mouseDown) {
            
            // Launch firework from bottom-middle of screen,
            // then set random target coordinates based on 
            // mouse position.

            fireworks.push(new Firework(canvasWidth/2, canvasHeight, mouseXposition, mouseYposition));
            
            limiterTick = 0;

            
        }
        
    } else {
        
     
        limiterTick++;
        
    }
    
}

canvas.addEventListener('mousemove', function(e) {
    
    mouseXposition = e.pageX - canvas.offsetLeft;
    mouseYposition = e.pageY - canvas.offsetTop;
    
});

canvas.addEventListener('mousedown', function(e) {
    
    e.preventDefault();
    mouseDown = true;
    
});

canvas.addEventListener('mouseup', function(e) {
    
    e.preventDefault();
    mouseDown = false;
    
});

// Call heartBeat() once the page loads
window.onload = heartBeat;