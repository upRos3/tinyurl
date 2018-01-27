const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const password = "";
app.use(cookieSession({
  name: 'session',
  keys: ['dafj23djJ19IPa'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.set('view engine', 'ejs');

function generateRandomString() {
  let randomSt = '';
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomSt += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return randomSt;
}

// ---Database start---

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'test@test',
    password: bcrypt.hashSync('test', 10)
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'test2@test',
    password: bcrypt.hashSync('test', 10)
  }
}

const urlDatabase = {
  'b2xVn2': { userID: 'userRandomID',
              long: 'http://www.lighthouselabs.ca'
            },
  '9sm5xK': { userID: 'user2RandomID',
              long: 'http://www.google.com'
            }
};

// ---Database end ---

// User filter for both data sets

let urlsForUser = function(userId) {
  let obj = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userId) {
      obj[id] = urlDatabase[id]
    }
  } return obj;
}
// Index
app.get('/', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login')
  } else {
    res.redirect('/urls');
  }
});

// Is there any need for this?
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.session.userId]};
  if (!req.session.userId) {
    res.redirect('/login')
  }
  res.render('urls_new', templateVars);
});

// Easter egg?
app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Shows all links

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.userId),
                       user: users[req.session.userId]
                     };
  if (!req.session.userId) {
    res.redirect('/login');
  }
  res.render('urls_index', templateVars);
});

// Shows link information

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase: urlsForUser(req.session.userId),
                       user: users[req.session.userId]
                     };

  if (!req.session.userId) {
    res.redirect('/login');
  } // Here is a problem with the logic. Stops registered user from updating link
  if (urlDatabase[req.params.id].userID !== req.session.userId) {
    res.status(401).send('Access Unauthorised');;
  }
  res.render('urls_show', templateVars);
});


// Middleware to parse incoming request bodies

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// Interaction:

// Creates short URL

app.post('/urls', (req, res) => {
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = { userID: req.session.userId,
                           long: req.body.longURL
                         };

  res.redirect(`/urls/${tinyURL}`);
});



// Short URL redirect

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].long;
  res.redirect(longURL);
});

// Deletes data

app.post('/urls/:id/delete', (req, res) => {
  let toDelete = req.params.id;
  delete urlDatabase[toDelete];
  res.redirect('/urls');
});

// Updates data

app.post('/urls/:id/update', (req, res) => {
  let updated = req.params.id;
  urlDatabase[updated] = req.body.longURL;
  res.redirect(`/urls/${updated}`);
});

app.get('/login', (req, res) => {
  res.render('urls_login');
})

// Login checks

app.post('/login', (req, res) => {

  // Filters emails
  let emailBod = req.body.email;
  let findUserByEmail = function () {
    for (let userId in users) {
      if (users[userId].email === emailBod) {
        return users[userId];
      }
    }
  }

  // Ensures that a falce ID by the findUserByEmail function can not continue
  if (findUserByEmail() === undefined) {
    req.session = null;
    res.status(403).send('Username and password combination does not match');
    return null;
  }

  let pass = bcrypt.compareSync(req.body.password, findUserByEmail().password)

 // Checks password

  if (pass === false) {
      req.session = null;
      res.status(403).send('Username and password combination does not match')
      return null;
  } else {
      req.session.userId = findUserByEmail().id;
      res.redirect('/urls');
  }
});

// Registration process

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req, res) => {
  let userId = generateRandomString();
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);

// Able to register under same email. Check logic
// Searches for invalid registration

  if (!email) {
    res.status(400).send('There is no email address!');
  }

  if (!password) {
    res.status(400).send('There is no password!');
  }


  for (let email in users[userId]) {
    if (email === users[userId]) {
      res.status(400).send('Email already exists');
    }
  }
    users[userId] = { id: userId,
                      email: req.body.email,
                      password: password
                    };

  req.session.userId = users[userId].id;
  res.redirect('/urls');
});

// Logout

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});