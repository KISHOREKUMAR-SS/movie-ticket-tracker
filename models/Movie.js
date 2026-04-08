const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Jana Nayagan"
  theater: { type: String, required: true }, // e.g., "LA Cinemas, Trichy"
  isTicketOpen: { type: Boolean, default: false } // Changes to true when live
});

module.exports = mongoose.model('Movie', movieSchema);