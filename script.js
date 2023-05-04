const nameNode = document.querySelector(`#name`)

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, "req-rdl", (json) => {
        nameNode.placeholder = json.name

        getSeasons(json)
            .reverse()
            .forEach((x) => {
                let seasonNode = document
                        .querySelector("template#se")
                        .content.cloneNode(true),
                    seCheckbox = seasonNode.querySelector(`h2 > input`),
                    seVttCheckbox = seasonNode.querySelector(`h2 > .vtt`)

                seasonNode.querySelector(`h2`).id = `h${x}s`
                seasonNode.querySelector(`.ep_list`).id = `ep_l${x}s`

                seCheckbox.after(x)

                seCheckbox.oninput = function () {
                    document
                        .querySelectorAll(`#ep_l${x}s .epq`)
                        .forEach((x) => (x.checked = seCheckbox.checked))
                }

                seVttCheckbox.oninput = function () {
                    document
                        .querySelectorAll(`#ep_l${x}s .vtt`)
                        .forEach(
                            (x) =>
                                (x.checked = x.disabled
                                    ? false
                                    : seVttCheckbox.checked)
                        )
                }

                nameNode.after(seasonNode)
            })

        json.eps.forEach((x) => {
            let episodeNode = document
                    .querySelector("template#ep")
                    .content.firstElementChild.cloneNode(true),
                nameNode = episodeNode.querySelector(".name")

            episodeNode.id = `e${x.s}s${x.e}e`

            nameNode.textContent = x.e
            nameNode.href = x.url

            if (!x.url) {
                nameNode.classList.add("noUrl")
            }

            if (!x.vtt) {
                episodeNode.querySelector(".vtt").disabled = true
                episodeNode.querySelector(".vtt").checked = false
            }

            document.querySelector(`#ep_l${x.s}s`).appendChild(episodeNode)
        })

        document
            .querySelectorAll(`h2:has(+ .ep_list .vtt:not(:disabled)) > .vtt`)
            .forEach((x) => {
                x.disabled = false
                x.checked = true
            })

        if (json.isFilm) {
            document
                .querySelectorAll(`h2`)
                .forEach((x) => x.parentNode.removeChild(x))
            document.querySelector("#e0s0e > a").textContent = `Фільм`
        }

        document.querySelector(`#download`).onclick = function () {
            let name = nameNode.value || nameNode.placeholder

            if (json.info.isFilm) {
                download(json.eps[0].url, name + ".mp4")
                vttQ(json.eps[0])
                    ? download(json.eps[0].vtt, name + ".vtt")
                    : false
                return
            }

            json.eps.forEach((x) => {
                if (epQ(x)) {
                    download(x.url, `${name}_${x.s}s${x.e}e.mp4`)
                    vttQ(x)
                        ? download(x.vtt, `${name}_${x.s}s${x.e}e.vtt`)
                        : false
                }
            })
        }
    })
})

document.querySelector("#selectAll").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, "req-select")
    })
}

function getSeasons(json) {
    return json.eps
        .map((x) => x.s)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a - b)
}

function vttQ(ep) {
    return document.querySelector(`#e${ep.s}s${ep.e}e>.vtt`).checked
}

function epQ(ep) {
    return document.querySelector(`#e${ep.s}s${ep.e}e>.epq`).checked
}

function download(url, name) {
    chrome.downloads.download({ url: url, filename: name })
}
