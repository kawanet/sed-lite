import {chromium} from "playwright"
import {fileURLToPath, pathToFileURL} from "node:url"

const html = fileURLToPath(new URL("./tests.html", import.meta.url))

const run = async () => {
    const browser = await chromium.launch()

    try {
        const page = await browser.newPage()
        const pageErrors = []
        page.on("pageerror", error => pageErrors.push(error))

        await page.goto(pathToFileURL(html).href)

        const failures = await page.evaluate(async () => await Promise.race([
            window.mochaDone,
            new Promise((_, reject) => setTimeout(
                () => reject(new Error("Mocha did not finish within 60 seconds")),
                60_000,
            )),
        ]))

        if (pageErrors.length) {
            throw new AggregateError(pageErrors, "Browser page errors occurred")
        }
        if (failures) {
            throw new Error(`Mocha reported ${failures} failed test(s)`)
        }
    } finally {
        await browser.close()
    }
}

run().catch(error => {
    console.error(error)
    process.exitCode = 1
})
