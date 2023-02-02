const rdl = {}

;(async () => {
    const vttRegExp = /vtt$/
    const videoRegExp = /.+\.stream\.voidboost\.\w+\/.*\.mp4.*/

    interval = setInterval(() => {
        let network = performance
            .getEntriesByType("resource")
            .map((x) => x.name)
            .filter((x) => vttRegExp.test(x) || videoRegExp.test(x))

        network.forEach((url) => {
            let id =
                [".b-simple_seasons__list", ".b-simple_episodes__list"]
                    .map(
                        (x) =>
                            document
                                .querySelector(x + ">li.active")
                                ?.textContent?.match(/\d+/)[0] ?? "0"
                    )
                    .join("s") + "e"

            rdl[id] ??= {}

            if (vttRegExp.test(url)) {
                rdl[id].vtt = url
            } else {
                rdl[id].url = url.replace(/(.+\.mp4).+/, "$1")
            }
        })

        rdl.name = document
            .querySelector(`#main div.b-post__origtitle`)
            ?.textContent.replace(/[\/\\:*?"<>|]/g, (m) =>
                String.fromCodePoint(m.codePointAt() + 0xfee0)
            )

        performance.clearResourceTimings()
    }, 500)
})()

chrome.runtime.onMessage.addListener((message) => {
    if (message == "req-rdl") {
        chrome.runtime.sendMessage(JSON.stringify(rdl))
    }
})
