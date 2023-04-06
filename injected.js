const rdl = {}

;(async () => {
    const vttRegExp = /vtt$/
    const videoRegExp = /.+\.stream\.voidboost\.\w+\/.*\.mp4.*/

    interval = setInterval(() => {
        rdl.name = document
            .querySelector(`#main div.b-post__origtitle`)
            ?.textContent.split(` / `)
            .slice(-1)[0]
            .replace(/[\/\\:*?"<>|]/g, (m) =>
                String.fromCodePoint(m.codePointAt() + 0xfee0)
            )

        let network = performance
            .getEntriesByType("resource")
            .map((x) => x.name)
            .filter((x) => vttRegExp.test(x) || videoRegExp.test(x))

        network.forEach((url) => {
            let id =
                ["season", "episode"]
                    .map((x) =>
                        document
                            .querySelector(".b-simple_episodes__list>li.active")
                            .getAttribute(`data-${x}_id`)
                    )
                    .join("s") + "e"

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

chrome.runtime.onMessage.addListener((message) => {
    if (message == "req-rdl") {
        chrome.runtime.sendMessage(JSON.stringify(rdl))
    }
})
