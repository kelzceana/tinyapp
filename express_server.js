const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

const { generateRandomString, emailLookUp, getUserByEmail, checksession, urlsForUser} = require('./helper');

//setting ejs as the new engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['LIGHTHOUSE'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
//.......User Object..............
const users = {
  "userRandomID": {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

//......urldatabase Object
const urlDatabase = {
  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
//.....app routes..........

app.get('/', (req, res) => {
  const cookey = req.session.user_id;
  if (checksession(cookey, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
app.get("/urls.json", (req, res) => {
  res.json(users);
});
app.get('/urls', (req, res) => {
  
  const templatedVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render('urls_index', templatedVars);

});
app.get('/urls/new', (req, res) => {
  const cookey = req.session.user_id;
  if (!checksession(cookey, users)) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render('urls_new', templateVars);
  }
});
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = getUserByEmail(email, users);
  if (!emailLookUp(email, users)) {
    res.statusCode = 403;
    res.send("User cannot be found");
  } else if (emailLookUp(email, users)) {
    if (!bcrypt.compareSync(password, users[user_id].password)) {
      res.statusCode = 403;
      res.send("Username or password does not match");
    } else {
      req.session.user_id = user_id; // create a cookie
      res.redirect('/urls');
    }
  }
   
});
app.get('/login', (req, res) => {
  const templatedVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render('url_login', templatedVars);
});
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});
app.get('/register', (req, res) => {
  const templatedVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render('urls_registration', templatedVars);
});
app.post('/register', (req, res) => {
  const user_id = generateRandomString(4);
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.statusCode = 400;
    res.send(`${res.statusCode} Bad Request response no input`);
  } else if (emailLookUp(userEmail, users)) {
    res.statusCode = 400;
    res.send(`${res.statusCode} User Email Exist`);
  } else {
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
 
});
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templatedVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render('urls_show', templatedVars);
  } else {
    res.status(404).send("The short URL you entered does not correspond with a long URL at this time.");
  }
});
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  }
});
app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to a valid account to create short URLs.");
  }
});
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  const useUrl = urlsForUser(userID, urlDatabase);
  if (Object.keys(useUrl).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to delete this short URL.");
  }
});
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const useUrl = urlsForUser(userID, urlDatabase);
  if (Object.keys(useUrl).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
  
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

