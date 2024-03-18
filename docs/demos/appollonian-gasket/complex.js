class Complex {
  constructor(a, b) {
    this.a = a
    this.b = b
  }
  add(n) {
    return new Complex(this.a+n.a, this.b+n.b);
  }
  sub(n) {
    return new Complex(this.a-n.a, this.b-n.b);
  }
  scale(n) {
    return new Complex(this.a*n, this.b*n);
  }
  multiply(n) {
    return new Complex(this.a*n.a - this.b*n.b, this.a*n.b + this.b*n.a)
  }
  root(n) {
	  let r = sqrt(this.a * this.a + this.b * this.b)
	  let angle = atan2(this.b, this.a)
	  r = pow(r, 1/n);
	  angle /= n;
	  return new Complex(r * cos(angle), r * sin(angle));
  }
  sqrt() {
	  return this.root(2);
  }
}