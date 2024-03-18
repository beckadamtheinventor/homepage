
const epsilon = 1e-9;
let currentWidth = 1;
let currentHeight = 1;
let max_iterations = 12;
let scale = 1;
let offset = [-1, -1];

// function keyPressed() {
	// return !(keyCode == UP_ARROW || keyCode == DOWN_ARROW || keyCode == LEFT_ARROW || keyCode == ARROW);
// }

function draw() {
	let redraw = false;

	let w = float(document.getElementById("canvas_width").value);
	let h = float(document.getElementById("canvas_height").value);
	if (abs(w - currentWidth) >= epsilon || abs(h - currentHeight) >= epsilon) {
		currentWidth = w;
		currentHeight = h;
		updateCanvas(w, h);
		// console.log("updated canvas size to " + w + ", " + h);
		redraw = true;
	}

	const factor = 1.25;
	const s = float(document.getElementById("scale").value);
	if (keyIsDown(UP_ARROW)) {
		document.getElementById("position_y").setAttribute("value", offset[1] - s*0.0625);
		redraw = true;
	}
	if (keyIsDown(DOWN_ARROW)) {
		document.getElementById("position_y").setAttribute("value", offset[1] + s*0.0625);
		redraw = true;
	}
	if (keyIsDown(LEFT_ARROW)) {
		document.getElementById("position_x").setAttribute("value", offset[0] - s*0.0625);
		redraw = true;
	}
	if (keyIsDown(RIGHT_ARROW)) {
		document.getElementById("position_x").setAttribute("value", offset[0] + s*0.0625);
		redraw = true;
	}
	// '+' keycodes
	if (keyIsDown(107) || keyIsDown(187) || keyIsDown(61)) {
		document.getElementById("scale").setAttribute("value", s / factor);
		document.getElementById("position_x").setAttribute("value", offset[0] + 0.125*s);
		document.getElementById("position_y").setAttribute("value", offset[1] + 0.125*s);
		redraw = true;
	}
	// '-' keycodes
	if (keyIsDown(109) || keyIsDown(189) || keyIsDown(173)) {
		document.getElementById("scale").setAttribute("value", s * factor);
		document.getElementById("position_x").setAttribute("value", offset[0] - 0.125*s*factor);
		document.getElementById("position_y").setAttribute("value", offset[1] - 0.125*s*factor);
		redraw = true;
	}
	if (redraw || keyIsDown(ENTER)) {
		// console.log("redrawing");
		// console.log(document.getElementById("position_x").value, document.getElementById("position_y").value, document.getElementById("scale").value)
		drawfractal();
	}
}

function setup() {
	pixelDensity(1);
	createCanvas(1, 1);
	updateCanvas(1024, 1024);
	drawfractal();
}

function updateCanvas(x, y) {
	resizeCanvas(x, y);
	document.getElementById("defaultCanvas0").style['height'] = "512px";
	document.getElementById("defaultCanvas0").style['width'] = "512px";
}

function px(x, y, c) {
	let i = (int(y)*currentWidth + int(x)) * 4;
	pixels[i+0] = c;
	pixels[i+1] = c;
	pixels[i+2] = c;
	pixels[i+3] = 255;
}

function drawfractal() {
	background(0);
	offset[0] = float(document.getElementById("position_x").value);
	offset[1] = float(document.getElementById("position_y").value);
	scale = float(document.getElementById("scale").value) / currentWidth;
	max_iterations = float(document.getElementById("iterations").value);
	step = max(1, float(document.getElementById("step").value));
	exp = float(document.getElementById("exponent").value);
	// const step = 1;
	loadPixels();
	for (let y=0; y<currentHeight; y+=step) {
		for (let x=0; x<currentWidth; x+=step) {
			let c = int(mandelbrot(x*scale+offset[0], y*scale+offset[1]));
			px(x+0, y+0, 55 + 200 * pow(c, exp) / pow(max_iterations, exp));
		}
	}
	updatePixels();
}

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

