const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  let randomSt = '';
  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomSt += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return randomSt;
}
// ---Database start---

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// ---Database start---

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies['username']};
  res.render("urls_new", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies['username']
                     };
  res.render("urls_index", templateVars);
});


app.get("/urls/:id", (req, res) => {
  console.log(req.cookies);
  let templateVars = { shortURL: req.params.id,
                       urlDatabase: urlDatabase,
                       username: req.cookies['username']
                     };
  res.render('urls_show', templateVars);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Interaction:

// Creates short URL

app.post("/urls", (req, res) => {
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect(`/urls/${tinyURL}`);
});

// Short URL redirect

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Deletes data

app.post("/urls/:id/delete", (req, res) => {
  let toDelete = req.params.id;
  delete urlDatabase[toDelete];
  res.redirect('/urls');
});

// Updates data

app.post("/urls/:id/update", (req, res) => {
  let updated = req.params.id;
  urlDatabase[updated] = req.body.longURL;
  res.redirect(`/urls/${updated}`);
});

// Handles cookies

app.post("/login", (req, res) => {
  let user = req.body.username;
  res.cookie('username', user);
  res.redirect('/urls');
});

// Registration

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  let userId = generateRandomString();
  users[userId] = { id: userId,
                    email: req.body.email,
                    password: req.body.password
                  };
  console.log(users);
  res.cookie('userId', users[userId].id);
  res.redirect('/urls');
});

// Logout

app.post("/logout", (req, res) => {
  res.clearCookie('username', 'userId');
  res.redirect('/urls');
});