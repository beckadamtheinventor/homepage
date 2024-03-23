class Circle {
  constructor(b, x, y) {
    this.position(x, y);
    this.bend(b);
  }
  position(x, y) {
    this.x = x;
    this.y = y;
	this.center = new Complex(x, y);
  }
  bend(b) {
    this.b = b
    this.r = abs(1 / b);
  }
  dist(other) {
	  return dist(this.center.a, this.center.b, other.center.a, other.center.b);
  }
  show(c) {
    fill(c);
	circle(this.x, this.y, this.r*2);
	// const r2 = this.r*this.r;
    // for (let y=-this.r; y<this.r; y++) {
		// const w = pow(r2 - y*y, 0.5) - 1;
		// for (let x=-w; x<w; x++) {
			// px(this.x + x, this.y + y, c);
		// }
	// }
  }
}
