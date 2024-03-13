async function load(p, e) {
	fetch(`blog/${p}.txt`)
		.then(r => {
			return r.ok ? r.text() : `<span class=\"error\">Error ${r.status} loading post \"${p}\"</span>`
		})
		.then(t => {
			e.innerHTML += "<b>" + p + "</b><p class=\"bordered\">" + t.split("\n").join("<br>") + "</p><hr>"
		})
}

async function loadPosts() {
	const e = document.getElementById("blogcontent")
	if (e == null) {
		return
	}
	e.innerHTML = ""
	fetch("blog/index")
		.then(r => {
			return r.ok ? r.text() : ""
		})
		.then(r => {
			const t = r.split("\n")
			let n = 0
			for (let i=t.length-1; i>=0; i--) {
				if (t[i].length > 0) {
					load(t[i], e)
					n++
				}
			}
			return n
		})
		.then(n => {
			if (n <= 0) {
				e.innerHTML = "<p>It's quiet. Too quiet...</p><hr>"
			}
		})
}
