
const epsilon = 1e-9;
let currentWidth = 1;
let currentHeight = 1;
let max_iterations = 12;
let scale = 1;
let offset = [-1, -1];
let redraw = false;

// function keyPressed() {
	// return !(keyCode == UP_ARROW || keyCode == DOWN_ARROW || keyCode == LEFT_ARROW || keyCode == ARROW);
// }

function resetViewport() {
	document.getElementById("position_x").setAttribute("value", -100);
	document.getElementById("position_y").setAttribute("value", 0);
	document.getElementById("scale").setAttribute("value", 3);
}

function mouseDragged() {
	const s = 1;
	document.getElementById("position_x").setAttribute("value", offset[0] - s*movedX);
	document.getElementById("position_y").setAttribute("value", offset[1] - s*movedY);
	redraw = true;
	return true;
}

function mouseWheel(event) {
	const factor = event.delta>0 ? 1.25 : (1.0 / 1.25);
	const s = float(document.getElementById("scale").value);
	document.getElementById("scale").setAttribute("value", s * factor);
	document.getElementById("position_x").setAttribute("value", (offset[0] / factor));
	document.getElementById("position_y").setAttribute("value", (offset[1] / factor));
	return false;
}

function draw() {
	let w = float(document.getElementById("canvas_width").value);
	let h = float(document.getElementById("canvas_height").value);
	document.getElementById("canvas_width").value = min(1024, w);
	document.getElementById("canvas_height").value = min(1024, h);
	if (abs(w - currentWidth) >= epsilon || abs(h - currentHeight) >= epsilon) {
		offset[0] = offset[0] * w / currentWidth;
		offset[1] = offset[1] * h / currentHeight;
		document.getElementById("position_x").setAttribute("value", offset[0]);
		document.getElementById("position_y").setAttribute("value", offset[1]);
		currentWidth = w;
		currentHeight = h;
		updateCanvas(w, h);
		// console.log("updated canvas size to " + w + ", " + h);
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
	updateCanvas(512, 512);
	drawfractal();
}

function updateCanvas(x, y) {
	x = min(x, 1024);
	y = min(y, 1024);
	resizeCanvas(x, y);
	updateCanvasElement(x, y);
}
function updateCanvasElement(w, h) {
	w = min(w, top.innerWidth);
	h = min(h, top.innerHeight);
	document.getElementById("defaultCanvas0").style['height'] = `{w}px`;
	document.getElementById("defaultCanvas0").style['width'] = `{h}px`;
}

function px(x, y, c) {
	let i = (int(y)*currentWidth + int(x)) * 4;
	c = min(255, max(0, int(c)));
	pixels[i+0] = c;
	pixels[i+1] = c;
	pixels[i+2] = c;
	pixels[i+3] = 255;
}

function drawfractal() {
	background(0);
	let vmin = float(document.getElementById("minvalue").value)
	let vmax = float(document.getElementById("maxvalue").value)
	let vscale = float(document.getElementById("valuescale").value)
	let oscale = float(document.getElementById("finalscale").value)
	let exp = float(document.getElementById("exponent").value);
	offset[0] = float(document.getElementById("position_x").value);
	offset[1] = float(document.getElementById("position_y").value);
	scale = float(document.getElementById("scale").value) / currentWidth;
	max_iterations = float(document.getElementById("iterations").value);
	document.getElementById("iterations").value = max_iterations = min(max_iterations, 100);
	step = max(1, float(document.getElementById("step").value));
	// const step = 1;
	loadPixels();
	for (let y=0; y<currentHeight; y+=step) {
		for (let x=0; x<currentWidth; x+=step) {
			let c = mandelbrot((x+offset[0]-currentWidth*0.5)*scale, (y+offset[1]-currentHeight*0.5)*scale);
			px(x, y, vmin + oscale * pow(vscale * c / max_iterations, exp) * (vmax - vmin));
		}
	}
	// px(currentHeight/2, currentWidth/2, 0);
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

