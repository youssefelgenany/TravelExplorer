var express = require('express');
var path = require('path');
var fs =  require('fs');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req, res){
  res.render('login');
});

const session = require('express-session');



let db;

var MongoClient = require('mongodb').MongoClient;
async function run() {
    try {
        const client = await MongoClient.connect('mongodb://127.0.0.1:27017/', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected successfully to server");
         db = client.db('myDB');


        
    } catch (err) {
        console.error("Error:", err);
    }
};
app.get('/registration',function(req,res){
    res.render('registration')
});
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
}));
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('<h2>All fields are required. Please <a href="registration">try again</a>.</h2>');
    }

    try {
        const existingUser = await db.collection('myCollection').findOne({ username });

        if (existingUser) {
            return res.status(400).send('<h2>Username already taken. Please <a href="registration">try again</a>.</h2>');
        }

        await db.collection('myCollection').insertOne({ username, password });
        return res.send('<h2>Registration successful! Please <a href="/">log in</a>.</h2>');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error.');
    }
});
app.use(express.static('public'));
var express = require('express');


app.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('<h2>All fields are required. Please try again.</h2>');
    }
   
    try {
        const user = await db.collection('myCollection').findOne({ username });

        if (!user) {
            return res.status(401).send('<h2>Unregistered user. Please <a href="registration">register</a>.</h2>');
        }

        if (user.password === password) {
            req.session.username = username;
          
         
            req.session.password=password; 
            return res.redirect('/home');
        } else {
            return res.status(401).send('<h2>Invalid password. Please try again.</h2>');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error.');
    }
});
app.get('/home',function(req,res){
    res.render('home')
});

app.get('/hiking',function(req,res){
    res.render('hiking')
});
app.get('/inca',function(req,res){
    res.render('inca')
});
app.get('/annapurna',function(req,res){
    res.render('annapurna')
});
app.get('/cities',function(req,res){
    res.render('cities')
});
app.get('/paris',function(req,res){
    res.render('paris')
});

app.get('/rome',function(req,res){
    res.render('rome')
});
app.get('/islands',function(req,res){
    res.render('islands')
});
app.get('/bali',function(req,res){
    res.render('bali')
});
app.get('/santorini',function(req,res){
    res.render('santorini')
});


app.get("/wanttogo", async (req, res) => {
    const { username } = req.session; 

    if (!username) {
        return res.status(401).send("Please log in to view your Want-to-Go list.");
    }

    try {
        
        const user = await db.collection('myCollection').findOne({ username });

        if (!user) {
            return res.status(404).send("User  not found. Please log in again.");
        }
        
        const destinations = user.wantToGoList || []; 
        res.render('wanttogo', { destinations });
        console.log("Destinations:", {destinations});
    } catch (err) {
        console.error("Error fetching destinations:", err);
        res.status(500).send("Error loading destinations");
    }
});
  
// Add search route
app.post('/search', async (req, res) => {
  const query = req.body.Search || '';
  try {
      const results = await db.collection('myCollection').find({ destination: { $regex: query, $options: 'i' } }).toArray();
      res.render('searchresults', { query, results });
  } catch (err) {
      console.error("Search error:", err);
      res.status(500).send('Server error during search.');
  }
});


app.post('/add-to-want-to-go-list', async (req, res) => {
    const { username } = req.session; 
    console.log("Session Data:", req.session);
    const { destination } = req.body; 

    if (!username) {
        return res.status(401).json({ message: 'Please log in to add destinations to your Want-to-Go list.' });
    }

    
    if (!destination) {
        return res.status(400).json({ message: 'Destination is required. Please try again.' });
    }

    try {
     
        const user = await db.collection('myCollection').findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please log in again.' });
        }

      
        if (!user.wantToGoList) {
            user.wantToGoList = [];
        }
     
        if (user.wantToGoList.includes(destination)) {
            return res.status(400).json({ message: 'Destination already in your Want-to-Go list.' })};

    
        user.wantToGoList.push(destination);
        
        await db.collection('myCollection').updateOne(
            { username },
            { $set: { wantToGoList: user.wantToGoList } }
        );

        return res.json({ success: true, message: 'Destination added to your Want-to-Go list!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
    
});


run();
app.listen(3000);