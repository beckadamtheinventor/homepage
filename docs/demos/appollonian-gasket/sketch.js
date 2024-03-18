
const epsilon = 0.1;
let circles = [];
let queue = [];
let inputs = [];
let hasfinishedinput = false;
let maxradius = 0;

function setup() {
	createCanvas(512, 512);
}

function mousePressed() {
	if (hasfinishedinput) {
		inputs = [];
		hasfinishedinput = false;
	}
	if (inputs.length < 2) {
		inputs.push(new Complex(mouseX, mouseY))
	}
	if (inputs.length >= 2 && !hasfinishedinput) {
		circles = [];
		queue = [];
		let d = dist(inputs[0].a, inputs[0].b, inputs[1].a, inputs[1].b);
		circles.push(new Circle(2 / d, inputs[0].a, inputs[0].b));
		circles.push(new Circle(2 / d, inputs[1].a, inputs[1].b));
		circles.push(new Circle(-1 / d, (inputs[0].a+inputs[1].a)*0.5, (inputs[0].b+inputs[1].b)*0.5));
		hasfinishedinput = true;
		queue.push([circles[0], circles[1], circles[2]])
		maxradius = max(circles[0].r, circles[1].r, circles[2].r);
		for (let i=0; i<20; i++) {
			nextCircles();
		}
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
	if (c4.r < 0.5) {
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
	for (let circle of circles) {
		circle.show((maxradius - circle.r)/maxradius * 200 + 30);
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