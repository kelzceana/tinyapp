const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

//setting ejs as the new engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
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
app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

app.get('/urls/:shortURL', (req, res) => {
  const templatedVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  res.render('urls_show', templatedVars)
})

app.post('/urls', (req, res) => {
  console.log(req.body)
  res.send('received new url')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});


const generateRandomString = function(num) {
  const letter = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const number = '123456790'.split('')
  let holder = '';
  let newStr = '';

  for (let i = 0; i < num; i++){
    holder = Math.floor(Math.random() * 25);
    if (holder > 8) {
      newStr += letter[holder];
    } else {
      newStr += number[holder];
    }
  }
  return newStr;
};