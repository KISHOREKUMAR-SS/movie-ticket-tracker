require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const Movie = require('./models/Movie');
const sendAlertEmail = require('./services/emailService');

const app = express();

app.use(cors());
app.use(express.json());

// --- THIS SERVES YOUR FRONTEND WEBSITE ---
// (This replaced the old text message!)
app.use(express.static('public'));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Database error:', err));

// --- API ROUTES FOR FRONTEND ---

// Get all tracked movies
app.get('/api/movies', async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

// Admin Control: Manually toggle status from the React panel
app.post('/api/movies/toggle/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  movie.isTicketOpen = !movie.isTicketOpen;
  await movie.save();
  res.json(movie);
});

// Add a new movie to track
app.post('/api/movies', async (req, res) => {
  try {
    const newMovie = new Movie({
      title: req.body.title,
      theater: req.body.theater || "Any",
      isTicketOpen: false // Always starts as false
    });
    await newMovie.save();
    res.status(200).json({ message: "Movie successfully added to tracker!" });
  } catch (error) {
    console.error("Error adding movie:", error);
    res.status(500).json({ error: "Failed to add movie" });
  }
});

// --- THE REAL-TIME BACKGROUND TRACKER ---

// Runs every 1 minute for testing purposes
cron.schedule('* * * * *', async () => {
  
  // 1. Check if there are any movies waiting for tickets
  const trackedMovies = await Movie.find({ isTicketOpen: false });
  if (trackedMovies.length === 0) return; 

  console.log("Starting real-time scan of BookMyShow Trichy...");

  // 2. Launch the invisible browser
  const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Go to the Trichy BookMyShow page
await page.goto('https://in.bookmyshow.com/explore/movies-trichy', { waitUntil: 'domcontentloaded', timeout: 60000 });
      // 3. Scrape the live text from the website
      const liveTextArray = await page.evaluate(() => {
          const elements = document.querySelectorAll('div.sc-7o7nez-0');
          let textList = [];
          elements.forEach((el) => {
              if(el.innerText.trim() !== "") textList.push(el.innerText.trim());
          });
          return textList;
      });

      // 4. Check if your tracked movies match the live website
      for (let movie of trackedMovies) {
          // Checks if the BookMyShow list includes the movie title from your database
          const isLive = liveTextArray.some(liveText => 
              liveText.toLowerCase().includes(movie.title.toLowerCase())
          );

          if (isLive) {
              console.log(`🚨 SPOTTED ON BOOKMYSHOW: ${movie.title}! Sending alert...`);
              
              // Send the email notification so you can manually book
              sendAlertEmail(movie.title, "BookMyShow Trichy");
              
              // Update database to "Open" so it stops scanning for this movie
              movie.isTicketOpen = true;
              await movie.save();
          }
      }
  } catch (error) {
      console.error("Tracker encountered an error:", error.message);
  } finally {
      await browser.close();
      console.log("Scan complete. Browser closed.");
  }
});

// --- START SERVER ---
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));