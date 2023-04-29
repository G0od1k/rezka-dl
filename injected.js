const rdl = {}

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

        let network = performance
            .getEntriesByType("resource")
            .map((x) => x.name)
            .filter((x) => vttRegExp.test(x) || videoRegExp.test(x))

        network.forEach((url) => {
            let id = getEpisodeId(
                document.querySelector(".b-simple_episodes__list>li.active")
            )

            rdl[id] ??= {}

            if (vttRegExp.test(url)) {
                rdl[id].vtt = url
            } else {
                rdl[id].url = url.replace(/(.+\.mp4).+/, "$1")
            }
        })

        performance.clearResourceTimings()
    }, 500)
})()

chrome.runtime.onMessage.addListener((req, from, res) => {
    if (req == "req-rdl") {
        res(rdl)
    } else if (req == "req-select") {
        selectList(document.querySelectorAll(".b-simple_episodes__list>li"))
    }
})

function getEpisodeId(el) {
    return (
        ["season", "episode"]
            .map((x) => el?.getAttribute(`data-${x}_id`) ?? 0)
            .join("s") + "e"
    )
}

async function selectList(list) {
    let i = -1
    while (++i < list.length) {
        list[i].click()
        await new Promise((res) =>
            (function test() {
                if (rdl[getEpisodeId(list[i])]?.url) {
                    res()
                }
                setTimeout(test, 500)
            })()
        )
        await new Promise((res) => setTimeout(res, 750))
    }
}
