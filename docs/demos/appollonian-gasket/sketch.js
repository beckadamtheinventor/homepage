
const epsilon = 0.1;
const WIDTH = 1024;
const HEIGHT = 1024;
const circles = [];
let queue = [];
const inputs = [];
const plotted = [];
let hasfinishedinput = false;
let maxradius = 0;
const animationCenter = [WIDTH*0.5, HEIGHT*0.5];
let enable_animation = false;

function setup() {
	pixelDensity(1);
	createCanvas(WIDTH, HEIGHT);
	document.getElementById("defaultCanvas0").style['height'] = "512px";
	document.getElementById("defaultCanvas0").style['width'] = "512px";
}

function mousePressed() {
	if (mouseX < 0 || mouseX >= WIDTH || mouseY < 0 || mouseY >= HEIGHT) {
		return;
	}
	if (mouseButton == CENTER) {
		animationCenter[0] = mouseX;
		animationCenter[1] = mouseY;
	}
	if (mouseButton != LEFT) {
		return;
	}
	if (hasfinishedinput) {
		inputs.length = 0;
		hasfinishedinput = false;
	}
	if (inputs.length < 2) {
		inputs.push(new Complex(mouseX, mouseY))
	}
	if (inputs.length >= 2 && !hasfinishedinput) {
		plotted[0] = inputs[0];
		plotted[1] = inputs[1];
		circles.length = 0;
		queue.length = 0;
		let d = dist(inputs[0].a, inputs[0].b, inputs[1].a, inputs[1].b);
		circles.push(new Circle(-1 / d, (inputs[0].a+inputs[1].a)*0.5, (inputs[0].b+inputs[1].b)*0.5));
		circles.push(new Circle(2 / d, inputs[0].a, inputs[0].b));
		circles.push(new Circle(2 / d, inputs[1].a, inputs[1].b));
		hasfinishedinput = true;
		queue.push([circles[0], circles[1], circles[2]])
		maxradius = circles[0].r;
		for (let i=0; i<8; i++) {
			nextCircles();
		}
	}
}

function animateCircles() {
	if (plotted.length >= 2) {
		enable_animation = !enable_animation;
	}
}

function nextCircles() {
	let nextQueue = []
	for (let triplet of queue) {
		let [c1, c2, c3] = triplet;
		let newCircles = descartes(c1, c2, c3);
		for (let circle of newCircles) {
			if (validateNewCircle(circle, c1, c2, c3)) {
				circles.push(circle)
				nextQueue.push([c1, c2, circle]);
				nextQueue.push([c2, c3, circle]);
				nextQueue.push([c3, c1, circle]);
			}
		}
	}
	queue = nextQueue;
}

function validateNewCircle(c4, c1, c2, c3) {
	let d;
	if (c4.r <= 0.75) {
		return false;
	}
	for (let other of circles) {
		if (c4.dist(other) < epsilon && abs(c4.r - other.r) < epsilon) {
			return false;
		}
	}
	// check if all four circles are mutually tangent
	function isTangent(c1, c2) {
		let d = c1.dist(c2);
		return abs(d - (c1.r + c2.r)) < epsilon || abs(d - abs(c2.r - c1.r)) < epsilon;
	}
	return isTangent(c4, c1) && isTangent(c4, c2) && isTangent(c4, c3);
}

function draw() {
	background(0);
	stroke(0);
	// loadPixels();
	for (let c4 of circles) {
		if (c4.x <= -2*c4.r || c4.x >= WIDTH+2*c4.r) {
			continue;
		}
		if (c4.y <= -2*c4.r || c4.y >= WIDTH+2*c4.r) {
			continue;
		}
		strokeWeight(min(3, max(1, 5 * c4.r / maxradius)));
		if (c4.r < maxradius) {
			c4.show(pow((maxradius - c4.r)/maxradius, 3) * 200 + 20);
		} else {
			c4.show(255);
		}
	}
	// updatePixels();
	if (inputs.length == 1) {
		stroke(0);
		strokeWeight(1);
		fill(0,180,0);
		circle(inputs[0].a, inputs[0].b, 50);
		stroke(0,180,0);
		strokeWeight(10);
		line(mouseX, mouseY, inputs[0].a, inputs[0].b);
	}
	if (plotted.length >= 2) {
		document.getElementById("animate").hidden = false;
	}
	
	if (enable_animation) {
		stepAnimation();
	}
}

function stepAnimation() {
	for (let circle of circles) {
		const c = Math.cos(PI/1000);
		const s = Math.sin(PI/1000);
		let x = (circle.x - animationCenter[0]) * 1.0 / WIDTH;
		let y = (circle.y - animationCenter[1]) * 1.0 / HEIGHT;
		let tmp = c*x - s*y;
		y = s*x + c*y;
		x = tmp;
		circle.position(x*WIDTH + animationCenter[0], y*HEIGHT + animationCenter[1]);
	}
}

/* Unused right now. Eventually might be able to write a more efficient circle routine... */
function px(x, y, c) {
	if (x>=0 && x<WIDTH && y>=0 && y<HEIGHT) {
		let i = (int(y)*WIDTH + int(x)) * 4;
		pixels[i+0] = c;
		pixels[i+1] = c;
		pixels[i+2] = c;
		pixels[i+3] = 255;
	}
}


function descartes(c1, c2, c3) {
	let k1 = c1.b;
	let k2 = c2.b;
	let k3 = c3.b;
	let k4s = k1 + k2 + k3;
	let k4r = 2 * sqrt(k1 * k2 + k2 * k3 + k3 * k1);
	// just use complex class for storage
	let k4 = new Complex(k4s + k4r, k4s - k4r);
	let zk1 = c1.center.scale(k1);
	let zk2 = c2.center.scale(k2);
	let zk3 = c3.center.scale(k3);
	let sum = zk1.add(zk2).add(zk3);
	let root = zk1.multiply(zk2).add(zk2.multiply(zk3)).add(zk3.multiply(zk1));
	root = root.sqrt().scale(2);
	let res = [sum.add(root).scale(1/k4.a), sum.sub(root).scale(1/k4.a),
			   sum.add(root).scale(1/k4.b), sum.sub(root).scale(1/k4.b)]
	return [new Circle(k4.a, res[0].a, res[0].b),
			new Circle(k4.a, res[1].a, res[1].b),
			new Circle(k4.b, res[2].a, res[2].b),
			new Circle(k4.b, res[3].a, res[3].b)]
}