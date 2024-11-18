

const epsilon = 1e-9
const grid_size = 32
let scale = 1
let offset = [-1, -1]
let redraw = false
let optimalWidth  = 400
let currentWidth  = optimalWidth
let currentHeight = currentWidth
let step = 1

// function keyPressed() {
	// return !(keyCode == UP_ARROW || keyCode == DOWN_ARROW || keyCode == LEFT_ARROW || keyCode == ARROW)
// }

function mouseDragged() {
	const s = scale
	document.getElementById("position_x").setAttribute("value", offset[0] - s*movedX)
	document.getElementById("position_y").setAttribute("value", offset[1] - s*movedY)
	redraw = true
	return true
}

function mouseWheel(event) {
	// if (mouseX >= 0 && mouseX < currentWidth && mouseY >= 0 && mouseY < currentHeight) {
		const factor = event.delta>0 ? 1.2 : (1.0 / 1.2)
		const s = float(document.getElementById("scale").value)
		document.getElementById("scale").setAttribute("value", s * factor)
		// document.getElementById("position_y").setAttribute("value", (offset[1] / factor))
		// document.getElementById("position_x").setAttribute("value", (offset[0] / factor))
		redraw = true
		return false
	// }
	// return true
}

function draw() {

	if (redraw || keyIsDown(ENTER)) {
		// console.log("redrawing")
		// console.log(document.getElementById("position_x").value, document.getElementById("position_y").value, document.getElementById("scale").value)
		drawnoise()
		let s = document.getElementById("scale").value
		let x = document.getElementById("position_x").value
		let y = document.getElementById("position_y").value
		let vmin = float(document.getElementById("minvalue").value)
		let vmax = float(document.getElementById("maxvalue").value)
		let vscale = float(document.getElementById("valuescale").value)
		let oscale = float(document.getElementById("finalscale").value)
		let exp = float(document.getElementById("exponent").value)
		updateUrlAndPage()
	}
}

function setup() {
	let x, y, s, vmin, vmax, vscl, oscl, exp
	try {
		let p = new URLSearchParams(window.location.href)
		x = p.get("x")
		y = p.get("y")
		s = p.get("s")
		vmin = p.get("vmin")
		vmax = p.get("vmax")
		vscl = p.get("vscl")
		oscl = p.get("oscl")
		exp = p.get("exp")
	} catch (ignored) {}
	
	// console.log(s, x, y, vmin, vmax, vscl, oscl, exp)
	
	if (s) { document.getElementById("scale").setAttribute("value", s) }
	if (x) { document.getElementById("position_x").setAttribute("value", x) }
	if (y) { document.getElementById("position_y").setAttribute("value", y) }
	if (vmin) { document.getElementById("minvalue").setAttribute("value", vmin) }
	if (vmax) { document.getElementById("maxvalue").setAttribute("value", vmax) }
	if (vscl) { document.getElementById("valuescale").setAttribute("value", vscl) }
	if (oscl) { document.getElementById("finalscale").setAttribute("value", oscl) }
	if (exp) { document.getElementById("exponent").setAttribute("value", exp) }

	// console.log(s, x, y, vmin, vmax, vscl, oscl, exp)


	updateUrlAndPage()

	pixelDensity(1)
	createCanvas(1, 1)
	updateCanvas(optimalWidth, optimalWidth)
	drawnoise()
}

/**
 * http://stackoverflow.com/a/10997390/11236
 */
function updateURLParameter(url, param, paramVal){
    var newAdditionalURL = ""
    var tempArray = url.split("?")
    var baseURL = tempArray[0]
    var additionalURL = tempArray[1]
    var temp = ""
    if (additionalURL) {
        tempArray = additionalURL.split("&")
        for (var i=0; i<tempArray.length; i++){
            if(tempArray[i].split('=')[0] != param){
                newAdditionalURL += temp + tempArray[i]
                temp = "&"
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal
    return baseURL + "?" + newAdditionalURL + rows_txt
}

function updateUrlAndPage() {
	let x = float(document.getElementById("position_x").value)
	let y = float(document.getElementById("position_y").value)
	let s = float(document.getElementById("scale").value)
	let vmin = float(document.getElementById("minvalue").value)
	let vmax = float(document.getElementById("maxvalue").value)
	let vscale = float(document.getElementById("valuescale").value)
	let oscale = float(document.getElementById("finalscale").value)
	let exp = float(document.getElementById("exponent").value)

	document.getElementById("info_text").innerHTML = `x=${x},y=${y},s=${s},<br>vmin=${vmin},vmax=${vmax},vscale=${vscale},exp=${exp},oscale=${oscale}`

	try {
		let url = window.location.href
		url = updateURLParameter(url, "x", x)
		url = updateURLParameter(url, "y", y)
		url = updateURLParameter(url, "s", s)
		url = updateURLParameter(url, "vmin", vmin)
		url = updateURLParameter(url, "vmax", vmax)
		url = updateURLParameter(url, "vscl", vscale)
		url = updateURLParameter(url, "oscl", oscale)
		url = updateURLParameter(url, "exp", exp)
		window.history.replaceState('', '', url);
	} catch (ignored) {
		
	}
}

function updateCanvas(x, y) {
	x = min(x, 1024)
	y = min(y, 1024)
	resizeCanvas(x, y)
	updateCanvasElement(x, y)
}

function updateCanvasElement(w, h) {
	// w = min(w, top.innerWidth)
	// h = min(h, top.innerHeight)
	// document.getElementById("defaultCanvas0").style['height'] = `{w}px`
	// document.getElementById("defaultCanvas0").style['width'] = `{h}px`
}

function px(x, y, c) {
	let i = (int(y)*currentWidth + int(x)) * 4
	c = min(255, max(0, int(c)))
	pixels[i+0] = c
	pixels[i+1] = c
	pixels[i+2] = c
	pixels[i+3] = 255
}

function drawnoise() {
	background(0)
	offset[0] = float(document.getElementById("position_x").value)
	offset[1] = float(document.getElementById("position_y").value)
	scale = float(document.getElementById("scale").value) / currentWidth
	let vmin = float(document.getElementById("minvalue").value)
	let vmax = float(document.getElementById("maxvalue").value)
	let vscale = float(document.getElementById("valuescale").value)
	let oscale = float(document.getElementById("finalscale").value)
	let exp = float(document.getElementById("exponent").value)
	loadPixels()
	for (let y=0; y<currentHeight; y+=step) {
		for (let x=0; x<currentWidth; x+=step) {
			let v = genpixel((x-currentWidth*0.5)*scale+offset[0], (y-currentHeight*0.5)*scale+offset[1])
			px(x, y, vmin + oscale * pow(vscale * v, exp) * (vmax - vmin))
		}
	}
	// px(currentHeight/2, currentWidth/2, 0)
	updatePixels()
}

function random2D(x, y) {
	let v = Math.sin(x*12.9898 + y*78.233) * 43758.5453
	return v - Math.floor(v)
}

function lerp(a,b,v) {
	return a + (b-a)*v
}

function gradNoise2D(x, y) {
	let xf = x - Math.floor(x)
	let yf = y - Math.floor(y)
	x = Math.floor(x)
	y = Math.floor(y)
	xf = xf * xf * (3 - 2 * xf)
	yf = yf * yf * (3 - 2 * yf)
	let v00 = random2D(x - 0.5, y - 0.5)
	let v01 = random2D(x - 0.5, y + 0.5)
	let v10 = random2D(x + 0.5, y - 0.5)
	let v11 = random2D(x + 0.5, y + 0.5)
	return lerp(lerp(v00, v01, yf), lerp(v10, v11, yf), xf)
}

function genpixel(x, y) {
	let v = gradNoise2D(x, y)
	let m = 1
	let f = 1
	let s = 1
	for (let i=0; i<4; i++) {
		v += gradNoise2D(x*s, y*s) * f
		m += f
		f *= 0.75
		s *= 1.5
	}
	return v / m
}

