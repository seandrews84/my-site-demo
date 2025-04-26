// Original author: Justin Chambers (where i got this code from, i only changed a few numbers :)
// Date: 03/2018
// Description: This is a particle flow field animation using p5.js

// Array to hold all particle objects
var particles = [];
// Number of particles to create based on screen size and density
var nums;
// Controls how many particles to create per unit area (lower value = more particles)
var particleDensity = 1000;
// Scale of the Perlin noise field - affects how smooth/chaotic the flow appears
var noiseScale = 2400;
// Maximum lifespan of a particle before it respawns
var maxLife = 10;
// Controls the speed of particle movement (higher value = faster movement)
var simulationSpeed = 0.8;
// Counter used for fading effects
var fadeFrame = 0;
// Background color of the animation
var backgroundColor;
// Current visual mode (0-3) affecting color scheme and behavior
var visualMode = 0;
// Total number of available visual modes
var numModes = 4;
// Toggle for inverting the color scheme
var invertColors = false;

/**
 * Setup function - runs once at the beginning
 * Initializes the canvas and creates the initial particles
 */
function setup(){
	// Calculate number of particles based on screen size and density
	nums = windowWidth * windowHeight / particleDensity;
	// Set initial background color (dark blue-black)
	backgroundColor = color(0, 0, 10);
	// Create canvas with full window dimensions
	createCanvas(windowWidth, windowHeight);
	// Set initial background
	background(backgroundColor);
	// Initialize all particle objects
	for(var i = 0; i < nums; i++){
		particles[i] = new Particle();
	}
}

/**
 * Draw function - runs continuously in a loop
 * Updates and displays all particles, handles visual effects
 */
function draw(){
	// No outline for shapes
	noStroke();
	
	// Increment fade frame counter
	++fadeFrame;
	// Apply fading effect every 5 frames
	if(fadeFrame % 5 == 0){
		// Use different blend modes based on color inversion setting
		if(invertColors){
			blendMode(ADD); // Additive blending when colors are inverted
		} else {
			blendMode(DIFFERENCE); // Difference blending normally
		}
		// Apply a subtle fade effect with very low opacity white
		fill(1, 1, 1);
		rect(0,0,width,height);

		// Apply background color with different blend mode
		if(invertColors){
			blendMode(DARKEST);
		} else {
			blendMode(LIGHTEST);
		}
		fill(backgroundColor);
		rect(0,0,width,height);
	}
	
	// Reset to normal blend mode for particle rendering
	blendMode(BLEND);
	// Enable anti-aliasing
	smooth();
	// Update and display each particle
	for(var i = 0; i < nums; i++){
		// Vary iteration count based on particle index (more iterations for earlier particles)
		var iterations = map(i,0,nums,5,1);
		// Vary particle size based on particle index
		var radius = map(i,0,nums,1,2);		
		// Alternative radius mapping (commented out)
		// var radius = map(i,0,nums,2,6);
		
		// Move the particle (with specified iteration count)
		particles[i].move(iterations);
		// Check if particle is off-screen and respawn if needed
		particles[i].checkEdge();
		
		// Full opacity initially
		var alpha = 255;
		// Variable to store particle color
		var particleColor;
		// Variable for fade in/out effect
		var fadeRatio;
		// Calculate fade-in effect (particles start faint, become opaque)
		fadeRatio = min(particles[i].life * 5 / maxLife, 1);
		// Apply fade-out effect as particles age (combine with fade-in)
		fadeRatio = min((maxLife - particles[i].life) * 5 / maxLife, fadeRatio);
		
		// Determine which color scheme to use
		var colorCase = visualMode;
		if(visualMode == 0) {
			// In mode 0, color depends on horizontal position (divides screen into 3 sections)
			colorCase = int(particles[i].pos.x / width * 3) + 1;
		}
		
		// Apply different color schemes based on the color case
		switch(colorCase) {
			case 1:
				// Grayscale based on particle life (with background color influence)
				var lifeRatioGrayscale = min(255, (255 * particles[i].life / maxLife) + red(backgroundColor));
				particleColor = color(lifeRatioGrayscale, alpha * fadeRatio);
				break;
			case 2:
				// Use the particle's preset color
				particleColor = particles[i].color;
				break;
			case 3:
				// Modified color based on the particle's preset color (blue shifted)
				particleColor = color(blue(particles[i].color) + 70, green(particles[i].color) + 20, red(particles[i].color) - 50);
				break;
		}
		
		// Invert colors if that option is enabled
		if(invertColors){
			particleColor = color(255 - red(particleColor), 255 - green(particleColor), 255 - blue(particleColor));
		}
		
		// Set fill color with calculated opacity for the particle
		fill(red(particleColor), green(particleColor), blue(particleColor), alpha * fadeRatio);
		// Draw the particle
		particles[i].display(radius);
	} 
}

/**
 * Particle class - defines behavior and properties of each particle
 */
function Particle(){
	// Initialize particle properties
	// Velocity vector (initially zero)
	this.vel = createVector(0, 0);
	// Random starting position
	this.pos = createVector(random(0, width), random(0, height));
	// Random initial life value
	this.life = random(0, maxLife);
	// Random direction flip (-1 or 1)
	this.flip = int(random(0,2)) * 2 - 1;
	
	// Assign one of three possible colors
	var randColor = int(random(0,3));
	switch(randColor) {
		case 0:
			this.color = color(110,57,204); // Purple
			break;
		case 1:
			this.color = color(7,153,242);  // Blue
			break;
		case 2:
			this.color = color(255,255,255); // White
			break;
	}
	
	/**
	 * Move the particle based on the flow field
	 * @param {number} iterations - Number of movement steps to calculate
	 */
	this.move = function(iterations){
		// Decrease particle life and respawn if it's dead
		if((this.life -= 0.06667) < 0)
			this.respawn();
			
		// Perform multiple movement iterations for smoother paths
		while(iterations > 0){
			var angle = 0;
			
			// Commented out alternative flow patterns
			// switch(int(random(6)))
			// {
			// 	case 0: angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale*this.flip;   //Pattern 1
			// 		break;
			// 	case 1: angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale*this.flip* int(random(2)); //Pattern 2
			// 		break;
			// 	case 2: angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale*this.flip*iterations / noiseScale; //Pattern 3
			// 		break;
			// 	case 3: angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale*this.flip*iterations; //Pattern 4
			// 		break;
			// 	case 4: angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale*this.flip/iterations; //Pattern 5
			// 		break;
			// 	case 5: angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale*this.flip*random(1); //Pattern 6
			// 		break;
			// }
			
			// Calculate movement angle based on Perlin noise at particle position
			// This creates a flowing field effect where particles follow a coherent pattern
			angle = noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*TWO_PI*noiseScale*this.flip;
			
			// Calculate velocity vector from angle
			this.vel.x = cos(angle);
			this.vel.y = sin(angle);
			// Apply simulation speed
			this.vel.mult(simulationSpeed);
			// Update position based on velocity
			this.pos.add(this.vel);
			// Decrement iteration counter
			--iterations;
		}
	}

	/**
	 * Check if particle is off-screen and respawn if needed
	 */
	this.checkEdge = function(){
		if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0){
			this.respawn();
		}
	}
	
	/**
	 * Respawn the particle at a random position with full life
	 */
	this.respawn = function(){
		this.pos.x = random(0, width);
		this.pos.y = random(0, height);
		this.life = maxLife;
	}

	/**
	 * Display the particle as a circle
	 * @param {number} r - Radius of the particle
	 */
	this.display = function(r){
		ellipse(this.pos.x, this.pos.y, r, r);
	}
}

/**
 * Advance to the next visual mode and reset particles
 * Called when user presses a key or taps the screen
 */
function advanceVisual() {
	// Cycle through visual modes
	visualMode = ++visualMode % numModes;
	// If returning to mode 0, toggle color inversion and update background
	if(visualMode == 0){
		invertColors = !invertColors;
		backgroundColor = invertColors ? color(235, 235, 235) : color(20, 20, 20);
	}
	// Generate new noise pattern
	noiseSeed(random()*Number.MAX_SAFE_INTEGER);
	// Reset background
	background(backgroundColor);
	// Respawn all particles with random life values
	for(var i = 0; i < nums; i++){
		particles[i].respawn();
		particles[i].life = random(0,maxLife);
  }
}

/**
 * Respond to keyboard input by advancing visual mode
 */
function keyPressed() {
	advanceVisual();
}

/**
 * Respond to touch/click input by advancing visual mode
 */
function touchStarted() {
	advanceVisual();
}