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
    
}

// Call heartBeat() once the page loads
window.onload = heartBeat;