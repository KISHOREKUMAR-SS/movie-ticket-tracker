const puppeteer = require('puppeteer');

async function scrapeBookMyShow() {
    console.log("Starting the invisible browser...");
    
    // Launch browser in headless mode (invisible)
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Helps bypass some basic blocks
    });
    
    const page = await browser.newPage();
    
    // STEALTH MODE: Disguise the robot as a normal Windows 10 Google Chrome user
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        console.log("Navigating to BookMyShow Trichy...");
        // Go directly to the exact page listing the movies
        await page.goto('https://in.bookmyshow.com/explore/movies-trichy', { waitUntil: 'networkidle2' });

        console.log("Scanning the page for movie titles...");
        
        // This is the "brain" of the scraper. It looks at the HTML code of the website.
        const movies = await page.evaluate(() => {
            const movieElements = document.querySelectorAll('div.sc-7o7nez-0'); // BookMyShow's movie title CSS class
            
            let titleList = [];
            movieElements.forEach((element) => {
                if(element.innerText.trim() !== "") {
                     titleList.push(element.innerText.trim());
                }
            });
            return titleList;
        });

        console.log("--- LIVE MOVIES FOUND ---");
        console.log(movies);

    } catch (error) {
        console.error("Scraping failed. BookMyShow might have blocked the bot:", error.message);
    } finally {
        await browser.close();
        console.log("Browser closed.");
    }
}

// Run the function
scrapeBookMyShow();