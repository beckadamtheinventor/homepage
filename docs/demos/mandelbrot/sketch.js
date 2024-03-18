
const epsilon = 0.1;
const WIDTH = 1024;
const HEIGHT = 1024;
let max_iterations = 12;
let scale = 8 / WIDTH;
let offset = [-1, -1];


function mousePressed() {
	drawfractal();
}

function setup() {
	pixelDensity(1);
	createCanvas(WIDTH, HEIGHT);
	drawfractal();
}

function px(x, y, c) {
	let i = (int(y)*WIDTH + int(x)) * 4;
	pixels[i+0] = c;
	pixels[i+1] = c;
	pixels[i+2] = c;
	pixels[i+3] = 255;
}

function drawfractal() {
	background(0);
	offset[0] = float(document.getElementById("position_x").value);
	offset[1] = float(document.getElementById("position_y").value);
	scale = float(document.getElementById("scale").value) / WIDTH;
	max_iterations = float(document.getElementById("iterations").value);
	step = float(document.getElementById("step").value);
	exp = float(document.getElementById("exponent").value);
	// const step = 1;
	loadPixels();
	for (let y=0; y<HEIGHT; y+=step) {
		for (let x=0; x<WIDTH; x+=step) {
			let c = int(mandelbrot(x*scale+offset[0], y*scale+offset[1]));
			px(x+0, y+0, 55 + 200 * pow(c, exp) / pow(max_iterations, exp));
		}
	}
	updatePixels();
}

// function draw() {}

function mandelbrot(x0, y0) {
	let x = 0
	let y = 0
	let i;
	for (i=0; i<max_iterations; i++) {
		let x2 = x * x;
		let y2 = y * y;
		if (x2 + y2 >= 4) {
			break;
		}
		y = 2*x*y + y0;
		x = x2 - y2 + x0;
	}
	return i;
}

