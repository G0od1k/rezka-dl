const rdl = { eps: [] }

;(async () => {
    const vttRegExp = /vtt$/
    const videoRegExp = /stream\.voidboost\.\w+\/.*\.mp4.*/

    interval = setInterval(() => {
        rdl.name = (
            document.querySelector(`#main div.b-post__origtitle`) ||
            document.querySelector(`h1`)
        )?.textContent
            .split(` / `)
            .slice(-1)[0]
            .replace(/[\/\\:*?"<>|]/g, (m) =>
                String.fromCodePoint(m.codePointAt() + 0xfee0)
            )

        rdl.isFilm = !document.querySelector("#simple-episodes-tabs")

        let network = performance
            .getEntriesByType("resource")
            .map((x) => x.name)
            .filter((x) => vttRegExp.test(x) || videoRegExp.test(x))

        network.forEach((url) => {
            let episode = getEpisode(
                document.querySelector(".b-simple_episodes__list>li.active")
            )

            if (vttRegExp.test(url)) {
                episode.vtt = url
            } else {
                episode.url = url.replace(/(.+\.mp4).+/, "$1")
            }
        })

        performance.clearResourceTimings()
    }, 500)
})()

chrome.runtime.onMessage.addListener((req, from, res) => {
    if (req == "req-rdl") {
        rdl.eps = rdl.eps.sort((a, b) => {
            return a.s - b.s || a.e - b.e
        })
        res(rdl)
    } else if (req == "req-select") {
        document
            .querySelectorAll(".b-simple_episodes__list")
            .forEach((x) => (x.style.display = null))

        selectList(document.querySelectorAll(".b-simple_episodes__list>li"))
    }
})

function getEpisode(el) {
    let [s, e] = ["season", "episode"].map((x) =>
        parseInt(el?.getAttribute(`data-${x}_id`) ?? 0)
    )

    let episode = rdl.eps.filter((x) => x.s == s && x.e == e)[0]

    if (!episode) {
        episode = { s, e }
        rdl.eps.push(episode)
    }

    return episode
}

async function selectList(list) {
    let i = -1
    while (++i < list.length) {
        list[i].click()
        await new Promise((res) =>
            (function test() {
                if (getEpisode(list[i]).url) {
                    res()
                    return
                }
                setTimeout(test, 500)
            })()
        )
        await new Promise((res) => setTimeout(res, 750))
    }
}
