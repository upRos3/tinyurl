const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
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
    password: 'test'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'test2@test',
    password: 'test'
  }
}

const urlDatabase = {
  'b2xVn2': {
              long: 'http://www.lighthouselabs.ca'
            },
  '9sm5xK': {
              long: 'http://www.google.com'
            }
};

// ---Database end ---

app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.cookies['userId']]};
  if (!req.cookies['userId']) {
    res.redirect('/login')
  }
  res.render('urls_new', templateVars);
});


app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Shows all links

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user: users[req.cookies['userId']]
                     };
  if (!req.cookies['userId']) {
    res.redirect('/login')
  }
  res.render('urls_index', templateVars);
});

// Shows link information

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase: urlDatabase,
                       user: users[req.cookies['userId']]
                     };
  res.render('urls_show', templateVars);
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// Interaction:

// Creates short URL

app.post('/urls', (req, res) => {
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = { long: req.body.longURL,
                           userID: req.cookies['userId']
                         };
                         console.log(urlDatabase);
  res.redirect(`/urls/${tinyURL}`);
});



// Short URL redirect

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
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

// Handles cookies

app.post('/login', (req, res) => {
  let email = req.body.email;
  let pass = req.body.password


  for (let user in users) {
    if (users[user].email === email && users[user].password === pass) {
      res.cookie('userId', users[user].id);
      res.redirect('/urls');
      return null;
    }
  }
  res.clearCookie('userId');
  res.status(403).send('Username and password combination does not match')

});

// Registration

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req, res) => {
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;


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
                      password: req.body.password
                    };
                    console.log(users);

  res.cookie('userId', users[userId].id);
  res.redirect('/urls');
});

// Logout

app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});