import os, sys, gzip

class CompressedJS:
	_steps = [
		[b".fromByteArray", b"`1R"],
		[b".toLowerCase", b"`1L"],
		[b".toUpperCase", b"`1U"],
		[b".length", b"`1l"],
		[b".prototype", b"`1p"],
		[b".join", b"`1j"],
		[b".charCodeAt", b"`1a"],
		[b".fromCharCode", b"`1A"],
		[b".indexOf", b"`1i"],
		[b".slice", b"`1."],
		[b".splice", b"`1,"],
		[b".replace", b"`1~"],
		[b"console.log(", b"`CL"],
		[b"isFinite", b"`1+"],
		[b"isInteger", b"`1I"],
		[b"descriptor", b"`dc"],
		[b"Symbol", b"`SY"],
		[b"Uint8Array", b"`4u"],
		[b"CSSRuleList", b"`CR"],
		[b"CSSValueList", b"`CV"],
		[b"CSSStyleDeclaration", b"`CD"],
		[b"HTMLFormElement", b"`HF"],
		[b"HTMLSelectElement", b"`HE"],
		[b"URLSearchParams", b"`US"],
		[b"readUInt32BE", b"`R>"],
		[b"readUInt32LE", b"`R<"],
		[b"readUInt16BE", b"`r>"],
		[b"readUInt16LE", b"`r<"],
		[b"writeUInt32BE", b"`W>"],
		[b"writeUInt32LE", b"`W<"],
		[b"writeUInt16BE", b"`w>"],
		[b"writeUInt16LE", b"`w<"],
		[b"setPrototypeOf", b"`SP"],
		[b"toPrimitive", b"`TP"],
		[b"base64", b"`64"],
		[b"byteLength", b"`BL"],
		[b"throw new TypeError(", b"`2T"],
		[b"throw new RangeError(", b"`2R"],
		[b"throw new Error(", b"`2E"],
		[b"throw new ", b"`2t"],
		[b"getConstructor", b"`1g"],
		[b"document", b"`dd"],
		[b"encoding", b"`en"],
		[b"utf-8", b"`UT"],
		[b"UTF-8", b"`UT"],
		[b"versions", b"`VV"],
		[b"version", b"`Vv"],
		[b"write", b"`ww"],
		[b"read", b"`rr"],
		[b"value", b"`vv"],
		[b"symbol", b"`sy"],
		[b"enumerable", b"`ea"],
		[b"unhandled", b"`uh"],
		[b"Error", b"`2e"],
		# [b"do{", b"`1Q"],
		[b"while (", b"`1W"],
		[b"while(", b"`1W"],
		[b"function", b"`1f"],
		[b"object", b"`1o"],
		[b"typeof", b"`1t"],
		[b"Function", b"`1F"],
		[b"Object", b"`1O"],
		[b"void", b"`1V"],
		[b"Buffer", b"`2B"],
		[b"DataView", b"`2D"],
		[b"internals", b"`2i"],
		# [b"var", b"`v"],
		# [b"let", b"`v"],
		[b"const", b"`1c"],
		[b"module", b"`1m"],
		[b"exports", b"`1e"],
		[b"undefined", b"`1u"],
		[b"null", b"`1N"],
		[b"new", b"`1n"],
		[b"string", b"`1s"],
		[b"String", b"`1S"],
		[b"toString", b"`2c"],
		[b"valueOf", b"`2C"],
		[b"number", b"`2n"],
		[b"Number", b"`2N"],
		[b"arguments", b"`2A"],
		[b"argument", b"`2a"],
		[b"window", b"`1w"],
		[b"return", b"`1r"],
		[b"Array", b"`3A"],
		[b"array", b"`3a"],
		# [b"CSS", b"`3C"],
		# [b"css", b"`3c"],
		[b"this", b"`3t"],
		[b"break", b"`3B"],
		# [b"try", b"`3T"],
		[b"catch", b"`3E"],
		[b"finally", b"`3F"],
		[b"Math.", b"`3M"],
		[b"switch", b"`3S"],
		[b"case", b"`3s"],
		[b"default", b"`3d"],
		[b"alloc", b"`3m"],
		# [b"127", b"`31"],
		# [b"255", b"`32"],
		[b"16383", b"`33"],
		[b"16384", b"`34"],
		# [b"128", b"`41"],
		# [b"256", b"`42"],
		[b"16384", b"`43"],
		[b"65536", b"`44"],
		[b"-2147483648", b"`-M"],
		[b"2147483647", b"`+M"],
		[b"`", b"``"],
	]
	_template = b"var s=\"$$D\".split(\"\t\"),d=\"$$V\"\nfor(var i of s){d=d.replaceAll('`'+i.slice(0,2),i.slice(2))};setTimeout(d,0)"
	_gzipstub = b"fetch('$$F').then(d=>d.body.pipeThrough(new DecompressionStream('gzip'))).then(d=>setTimeout(d,0))";
	def __init__(self):
		self.data = ""
		self.usedSteps = {k:0 for k,_ in CompressedJS._steps}
	
	def _wordlen(self, src, i):
		j = i
		while src[i].isalnum():
			i += 1
			if i >= len(src):
				break
		return i - j
	
	def parse(self, src):
		i = 0;
		progress = 0
		src = src.replace(b"\\", b"\\\\").replace(b'"', b'\\"').replace(b'\n', b'\\n')
		data = []
		while i < len(src):
			if i >= progress+65536:
				progress = i
				print(f"{str(round(100*i/len(src), 2))}% complete")
			processed = False
			for k, v in CompressedJS._steps:
				if src.startswith(k, i):
					self.usedSteps[k] += 1
					data.append(v)
					i += len(k)
					processed = True
					break
			if not processed:
				data.append(bytes([src[i]]))
				i += 1
			
		self.data = b"".join(data)
		return src

	def compile(self):
		steps = []
		for k,v in self._steps:
			if self.usedSteps[k] > len(k)/3 - 1:
				steps.append(v[1:]+k.replace(b"\"", b"`\"").replace(b"\n", b"`n"))
			else:
				self.data = self.data.replace(v, k)
		return CompressedJS._template.replace(b"$$D", b"\t".join(steps), 1).replace(b"$$V", self.data, 1)

	def write(self, fd):
		fd.write(self.compile())

	def writeBinary(self, name):
		with gzip.open(name, "w") as fd:
			fd.write(self.compile())
		with open(name, "rb") as fd:
			fd.seek(0, 2)
			return fd.tell()

	def writeStub(self, fd, name):
		fd.write(CompressedJS._gzipstub.replace(b"$$F", bytes(name, 'UTF-8'), 1))

if __name__=='__main__':
	if len(sys.argv) < 3:
		print(f"Usage, {sys.argv[0]} src.js dest.js")
		exit(0)
	with open(sys.argv[1], "rb") as fd:
		data = fd.read()
	oldSize = len(data)
	cjs = CompressedJS()
	print("Step 1/2")
	cjs.parse(data)
	print("Step 2/2")
	with open(sys.argv[2], "wb") as fd:
		cjs.write(fd)
		newSize = fd.tell()

	print(f"Success! Old size: {oldSize} New size: {newSize}")
