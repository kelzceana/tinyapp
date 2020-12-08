const express = require('express');
const app = express();
const PORT = 8080;

//setting ejs as the new engine
app.set("view engine", "ejs")

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};
//.....app routes..........
app.get('/', (req, res) => {
  res.send('Hello!')
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase )
})
app.get('/urls', (req, res) => {
  const templatedVars = { urls: urlDatabase}
  res.render('urls_index', templatedVars)
})
app.get('/urls/:shortURL', (req, res) => {
  const templatedVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  res.render('urls_show', templatedVars)
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});