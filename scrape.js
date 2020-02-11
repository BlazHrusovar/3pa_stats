const puppeteer = require('puppeteer');
const variables = require('./variables');

let browser;

const fetchData = async () => {
    try {
        const playerName = parseArguments();
        
        console.log('Fetching data...');

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        initHandlers(page);

        await page.setUserAgent(variables.userAgent);

        await page.goto(variables.url, { waitUntil: 'networkidle2' });

        await page.waitForSelector(variables.searchIconSelector);

        await page.click(variables.searchIconSelector);

        await page.type(variables.searchInputSelector, playerName);

        const el = await page.$('.stats-search__section.stats-search__section--none');

        checkNoPlayers(el);

        await page.keyboard.press('ArrowDown');

        await page.keyboard.press('Enter');

        await page.waitForSelector(variables.threePointAvgSelector);

        await page.click(variables.threePointAvgSelector);

        const data = await page.evaluate(parseTable);

        console.log(data);

        await closeBrowser();
    } catch (err) {
        handleException(err, 1);
    }

}

const parseTable = () => {
    const tradSplitTableSelector = '[template="player/player-traditional"] > .nba-stat-table > .nba-stat-table__overflow > table > tbody > tr';

    const rows = document.querySelectorAll(tradSplitTableSelector);

    let data = [];

    for (let row of rows) {
        let obj = {};
        for (let cell of row.cells) {
            if (cell.className == 'first') {
                obj['date'] = cell.innerText;
            }
            if (cell.className == 'sorted') {
                obj['points'] = cell.innerText;
            }
        }
        data.push(obj);
    }

    return {
        data
    };
}

const checkNoPlayers = (el) => {
    if (!el._remoteObject.description.includes('.ng-hide')) {
        handleException('Player not found.', 0);
    }
}

const initHandlers = (page) => {
    page.on('error', async () => {
        handleException('Page load unsuccessful.', 1);
    });
}

const validatePlayer = (playerName) => {
    if (!playerName) {
        handleException('Please enter player name. Example \'node scrape.js Luka Doncic\'', 0);
    }
}

const closeBrowser = async () => {
    await browser.close();
}

const handleException = async (err, statusCode) => {
    console.error(err);
    closeBrowser();
    process.exit(statusCode);
}

const parseArguments = () => {
    let playerName = '';
    for (let i = 2; i < process.argv.length; i++) {
        playerName += process.argv[i] + ' ';
    }
    validatePlayer(playerName);
    return playerName;
}

//Run
(async () => {
    fetchData();
})().catch((err) => {
    handleException(err, 0);
});