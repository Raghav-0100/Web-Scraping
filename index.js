const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        userDataDir: "./tmp",
    });

    const page = await browser.newPage();

    await page.goto(
        "https://www.amazon.in/s?bbn=81107432031&rh=n%3A81107432031%2Cp_85%3A10440599031&_encoding=UTF8",
        { waitUntil: 'networkidle2' }
    );

    let items = [];
    let isBtnDisabled = false;

    while (!isBtnDisabled) {
        const productsHandles = await page.$$('.s-main-slot .s-result-item');

        for (const productHandle of productsHandles) {
            let title = "NULL";
            let price = "NULL";
            let img = "NULL";

            title = await page.evaluate(el => {
                const titleElement = el.querySelector("h2 > a > span");
                return titleElement ? titleElement.textContent : null;
            }, productHandle);

            price = await page.evaluate(el => {
                const prices = el.querySelector(".a-price > .a-offscreen");
                return prices ? prices.textContent : null;
            }, productHandle);

            img = await page.evaluate(el => {
                const imageElement = el.querySelector(".s-image");
                return imageElement ? imageElement.getAttribute("src") : null;
            }, productHandle);

            items.push({ title, price, img });

            if (title) {
                fs.appendFile(
                    "results.csv",
                    `${title.replace(/,/g, ".")},${price},${img}\n`,
                    function (err) {
                        if (err) throw err;
                    }
                );
            }
        }

        // Check if the next button is disabled
        isBtnDisabled = await page.evaluate(() => {
            const nextButton = document.querySelector('.s-pagination-item.s-pagination-next');
            return nextButton ? nextButton.classList.contains('s-pagination-disabled') : true;
        });

        if (!isBtnDisabled) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
                page.click('.s-pagination-item.s-pagination-next')
            ]);
        }
    }

    console.log(items);

    await browser.close();
})();
