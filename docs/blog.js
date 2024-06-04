async function load(p) {
	return fetch(`blog/${p}.txt`)
		.then(r => {
			return r.ok ? r.text() : `<span class=\"error\">Error ${r.status} loading post \"${p}\"</span>`
		})
		.then(t => {
			t = t.split("\n")
			return "<a href=\"%PAGE%\"><b>" + t[0] + "</b></a><p class=\"bordered\">" + t.slice(1).join("<br>") + "</p><hr>"
		})
}

async function loadPosts() {
	const params = new URL(document.location).searchParams
	const e = document.getElementById("blogcontent")
	if (e == null) {
		return
	}
	e.innerHTML = ""
	let page = null
	if (params != null && params != undefined) {
		page = params.get("p")
	}
	
	let ic = await fetch("blog/index")
		.then(r => {
			return r.ok ? r.text() : ""
		})
	const t = ic.split("\n")
	let n = 0
	for (let i=t.length-1; i>=0; i--) {
		if (t[i].length > 0) {
			const c = await load(t[i], e)
			if (page != null) {
				if (!(c.includes(page) || t[i].includes(page))) {
					continue
				}
			}
			const url = new URL(document.location)
			url.searchParams.set("p", t[i])
			e.innerHTML += c.replace("%PAGE%", url.toString())
			n++
		}
	}
	if (n <= 0) {
		e.innerHTML = "<p>It's quiet. Too quiet...</p><hr>"
	}
}
