import puppeteer from 'puppeteer';
import crypto from "node:crypto"
import WebSocket from 'ws';
const domain = "https://qr.macleod.space"
async function timePageLoad(cookie) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(domain);

    if (cookie)
        await page.setCookie(cookie)
    await page.goto(domain);

    await page.reload()


    await page.setViewport({ width: 1080, height: 1024 });

    await page.waitForSelector('#timings');

    const textSelector = await page.waitForSelector(
        'text/ms'
    );
    const timing = await textSelector?.evaluate(el => el.textContent);
    await browser.close();
    return Number(timing.slice(0, -2))
}

function avg(...nums) {
    return nums.reduce((a, el) => a + el, 0) / nums.length
}
async function repeat(f, n) {
    let arr = []
    for (const ni of Array.from({ length: n })) {
        arr.push(await f())
    }
    return arr
}

async function fullRun() {
    const initial = await timePageLoad()
    const response = await fetch(domain + "/.well-known/callback/inject-user", {
        method: "PUT",
        body: JSON.stringify({
            username: "random-user",
            avatar: "https://thispersondoesnotexist.com",
            email: "some-user@example.com",
            id: crypto.randomUUID()
        })
    })
    const signature = await response.text()
    return avg(...await repeat(async () => await timePageLoad({
        name: 'auth:token',
        value: signature,
        'expires': Date.now() / 1000 + 10,
    }), 3))
}
const client = new WebSocket("wss://metrics-coordinate.s.workers.dev/provider")
while (true) {
    client.send(JSON.stringify([String(await fullRun()), process.argv[2]]))
}
