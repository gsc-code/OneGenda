const bodyParser = require('body-parser');
const path = require(`path`);
const express = require('express');
const app = express();

// Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// POST handler to read data
// app.post('/login', (req, res) => {
//     console.log({
//       name: req.body.name,
//       message: req.body.message
//     });
//     res.send('Thanks for your message!');
// });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/easyu/index.html'));
});

// Show form when user browses to /login
// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, '/easyu/login.html'));
// });

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});