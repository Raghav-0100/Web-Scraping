const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page= await browser.newPage();

await page.goto(
    "https://www.amazon.in/s?i=kitchen&bbn=81107432031&rh=n%3A81107432031%2Cp_85%3A10440599031&page=2&_encoding=UTF8",{
      waitUntil: "load"
    }
);
const is_disabled= await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled')!==null;

console.log(is_disabled)

await browser.close();
})();
