const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const photosDir = path.join(__dirname, 'public', 'images');

let photos = fs.readdirSync(photosDir).filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
let scores = {};

// Initialize scores
photos.forEach(photo => {
  scores[photo] = 0;
});

// Generate all pairs of photos
let pairs = [];
for (let i = 0; i < photos.length; i++) {
  for (let j = i + 1; j < photos.length; j++) {
    pairs.push([photos[i], photos[j]]);
  }
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/photos', (req, res) => {
  if (pairs.length === 0) {
    return res.status(400).send('All comparisons done.');
  }
  const [photo1, photo2] = pairs.shift();
  res.json({ photo1, photo2 });
});

app.post('/vote', express.json(), (req, res) => {
  const { winner, loser } = req.body;
  scores[winner]++;
  if (pairs.length === 0) {
    const sortedPhotos = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    return res.status(200).json({ bestPhoto: sortedPhotos[0], scores });
  }
  res.status(200).json({ message: 'Vote recorded.' });
});

app.get('/results', (req, res) => {
  const sortedPhotos = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  res.json({ bestPhoto: sortedPhotos[0], scores });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
