require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

// Connect to the database
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB!');
    
    // Create the Jana Nayagan entry
    const newMovie = new Movie({
      title: "Jana Nayagan",
      theater: "LA Cinemas, Trichy",
      isTicketOpen: false
    });

    // Save it to the database
    await newMovie.save();
    console.log('Successfully added Jana Nayagan to the database!');
    
    // Close the connection
    process.exit();
  })
  .catch((err) => {
    console.log('Error:', err);
    process.exit();
  });