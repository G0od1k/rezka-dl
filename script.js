const nameNode = document.querySelector(`#name`)

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, "req-rdl")
})

chrome.runtime.onMessage.addListener((message) => {
    let json = JSON.parse(message)

    nameNode.placeholder = json.name

    let seasons = getSeasons(json).reverse()

    seasons.forEach((x) => {
        let h = document.createElement(`h2`),
            epList = document.createElement(`div`)

        h.textContent = x
        h.id = `h${x}s`
        epList.className = `ep_list`
        epList.id = `ep_l${x}s`

        nameNode.after(epList)
        nameNode.after(h)
    })

    Object.keys(json)
        .filter((x) => x != "name")
        .sort((a, b) => a.match(/\d+/g)[1] - b.match(/\d+/g)[1])
        .forEach((x) => {
            let episodeNode = document
                .querySelector("template#ep")
                .content.firstElementChild.cloneNode(true)

            episodeNode.id = `e` + x

            episodeNode.querySelector(".name").textContent = x

            if (!json[x].url) {
                episodeNode.querySelector(".name").classList.add("noUrl")
            }

            if (!json[x].vtt) {
                episodeNode.querySelector(".vtt").disabled = true
                episodeNode.querySelector(".vtt").checked = false
            }

            document
                .querySelector(`#ep_l${x.match(/\d+/)[0]}s`)
                .appendChild(episodeNode)
        })

    document.querySelector(`#download`).onclick = function () {
        let name = nameNode.value || nameNode.placeholder

        if (isFilm(json)) {
            download(json["0s0e"].url, name + ".mp4")
            vttQ("0s0e") ? download(json["0s0e"].vtt, name + ".vtt") : false
            return
        }
        getSortedEpisodes(json).forEach((x) => {
            if (epQ(x)) {
                download(json[x].url, `${name}_${x}.mp4`)
                vttQ(x) ? download(json[x].vtt, `${name}_${x}.vtt`) : false
            }
        })
    }
})

function getSeasons(json) {
    return Object.keys(json)
        .filter((x) => x != "name")
        .map((x) => getSe(x))
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a - b)
}

function isFilm(json) {
    return Object.keys(json).join("") == "name0s0e"
}

function vttQ(ep) {
    return document.querySelector(`#e${ep}>.vtt`).checked
}

function epQ(ep) {
    return document.querySelector(`#e${ep}>.epq`).checked
}

function getSortedEpisodes(json) {
    return Object.keys(json)
        .filter((x) => x != "name")
        .sort((a, b) => {
            return getEp(a) - getEp(b) && getSe(a) - getSe(b)
        })
}

function getSe(string) {
    return string.match(/\d+/g)[0]
}

function getEp(string) {
    return string.match(/\d+/g)[1]
}

function download(url, name) {
    chrome.downloads.download({ url: url, filename: name })
}
