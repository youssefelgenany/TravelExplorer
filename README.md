# TravelExplorer

## Motivation

TravelExplorer is a web application designed to help users discover and organize their travel destinations. The project was created to provide a simple, user-friendly platform where travelers can browse destinations by category (Hiking, Cities, Islands), learn about different places through descriptions and videos, and maintain a personal "Want-to-Go" list. The application addresses the need for a centralized place to explore travel options and keep track of destinations users are interested in visiting.

## Build Status

The project is currently functional with the following known issues and limitations:

- **Database Connection**: The application requires MongoDB to be running locally on `mongodb://127.0.0.1:27017/`. If MongoDB is not running, the application will fail to connect.
- **Session Management**: Sessions are stored in memory, which means user sessions will be lost when the server restarts.
- **Password Security**: Passwords are currently stored in plain text in the database, which is a security concern for production use.
- **Error Handling**: Some error handling could be improved, particularly for edge cases in user input validation.
- **Search Functionality**: The search feature currently searches within user collections rather than a dedicated destinations database, which may limit search accuracy.
- **No Input Sanitization**: User inputs are not sanitized, which could potentially lead to security vulnerabilities.

## Code Style

The project follows the following coding conventions:

- **Naming Convention**: Uses camelCase for variables and functions (e.g., `wantToGoList`, `existingUser`)
- **File Structure**: Follows Express.js conventions with separate directories for routes, views, and public assets
- **Variable Declaration**: Uses `var` for variable declarations (consistent with older JavaScript style)
- **Async/Await**: Uses async/await pattern for asynchronous database operations
- **Indentation**: Uses consistent spacing (appears to use spaces)
- **Route Organization**: Routes are defined directly in `app.js` rather than being separated into route modules (except for unused route files)

## Tech/Framework Used

TravelExplorer is built using the following technologies:

- **Backend Framework**: Node.js with Express.js (v4.16.1)
- **Database**: MongoDB (v6.12.0) with native MongoDB driver
- **Template Engine**: EJS (v3.1.10) for server-side rendering
- **Session Management**: express-session (v1.18.1) for user session handling
- **Middleware**: 
  - cookie-parser (v1.4.4) for parsing cookies
  - morgan (v1.9.1) for HTTP request logging
  - body-parser functionality via Express built-in methods
- **Frontend**: HTML, CSS, Bootstrap 4.3.1 for styling and responsive design
- **Server**: Native Node.js HTTP server

This is essentially a **MEN stack** application (MongoDB, Express, Node.js) with EJS templating, without React (no R in MERN).

## Features

The TravelExplorer application includes the following features:

1. **User Registration**: New users can create an account with a username and password
2. **User Authentication**: Registered users can log in to access the application
3. **Session Management**: User sessions are maintained using express-session, allowing users to stay logged in during their visit
4. **Destination Categories**: Destinations are organized into three main categories:
   - Hiking (e.g., Annapurna, Inca Trail)
   - Cities (e.g., Paris, Rome)
   - Islands (e.g., Bali, Santorini)
5. **Destination Pages**: Each destination has its own page with descriptions and embedded videos
6. **Want-to-Go List**: Users can add destinations to their personal "Want-to-Go" list
7. **Duplicate Prevention**: The system prevents adding the same destination multiple times to a user's list
8. **Search Functionality**: Users can search for destinations using a search bar in the navigation
9. **Persistent Data**: User accounts and want-to-go lists are stored in MongoDB and persist across sessions
10. **Responsive Navigation**: Bootstrap-based navigation bar with search functionality

## Code Examples

### 1. User Registration Function

```javascript
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
```

### 2. User Login Function

```javascript
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
            req.session.password = password; 
            return res.redirect('/home');
        } else {
            return res.status(401).send('<h2>Invalid password. Please try again.</h2>');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error.');
    }
});
```

### 3. Add to Want-to-Go List Function

```javascript
app.post('/add-to-want-to-go-list', async (req, res) => {
    const { username } = req.session; 
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
            return res.status(400).json({ message: 'Destination already in your Want-to-Go list.' });
        }

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
```

### 4. MongoDB Connection Function

```javascript
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
}
```

### 5. Search Functionality

```javascript
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
```

### 6. Want-to-Go List Retrieval Function

```javascript
app.get("/wanttogo", async (req, res) => {
    const { username } = req.session; 

    if (!username) {
        return res.status(401).send("Please log in to view your Want-to-Go list.");
    }

    try {
        const user = await db.collection('myCollection').findOne({ username });

        if (!user) {
            return res.status(404).send("User not found. Please log in again.");
        }
        
        const destinations = user.wantToGoList || []; 
        res.render('wanttogo', { destinations });
    } catch (err) {
        console.error("Error fetching destinations:", err);
        res.status(500).send("Error loading destinations");
    }
});
```

## Installation

To run the TravelExplorer project, you need to install the following:

### Prerequisites

1. **Node.js**: Install Node.js (version 12 or higher recommended). Download from [nodejs.org](https://nodejs.org/)
2. **MongoDB**: Install MongoDB Community Edition. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
3. **npm**: Comes bundled with Node.js

### Installation Steps

1. **Clone or download the project** to your local machine

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```
   This will install all required packages listed in `package.json`:
   - express
   - ejs
   - mongodb
   - express-session
   - cookie-parser
   - morgan
   - And other dependencies

3. **Start MongoDB**:
   - Make sure MongoDB is installed and running on your system
   - MongoDB should be accessible at `mongodb://127.0.0.1:27017/`
   - On Windows, you may need to start MongoDB as a service or run `mongod` manually
   - On macOS/Linux, you can start MongoDB with: `sudo systemctl start mongod` or `mongod`

4. **Run the application**:
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   node ./bin/www
   ```

5. **Access the application**:
   - Open your web browser and navigate to `http://localhost:3000`
   - The application should be running and ready to use

### Note
Ensure MongoDB is running before starting the application, as the app will attempt to connect to the database on startup.

## Contribute

Contributions to TravelExplorer are welcome! Here are some areas where the project could benefit from improvements:

- **Security Enhancements**: Implement password hashing (bcrypt) instead of storing plain text passwords
- **Error Handling**: Improve error handling and user feedback throughout the application
- **Code Organization**: Refactor routes into separate route modules for better maintainability
- **Input Validation**: Add input sanitization and validation to prevent security vulnerabilities
- **Database Schema**: Create a proper destinations collection/database for better search functionality
- **Session Storage**: Implement persistent session storage (e.g., MongoDB session store) instead of memory storage
- **UI/UX Improvements**: Enhance the user interface and user experience
- **Testing**: Add unit tests and integration tests
- **Documentation**: Improve inline code documentation and API documentation
- **Environment Configuration**: Use environment variables for database connection strings and secrets

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description of your changes

## Credits

This project was developed as a part of the GUC introduction to communication networks course. The following resources were used in the development of this project:

- **Express.js Documentation**: [expressjs.com](https://expressjs.com/) - For Express.js framework reference and best practices
- **MongoDB Node.js Driver Documentation**: [mongodb.github.io/node-mongodb-native](https://mongodb.github.io/node-mongodb-native/) - For MongoDB integration guidance
- **EJS Documentation**: [ejs.co](https://ejs.co/) - For template engine reference
- **Bootstrap Documentation**: [getbootstrap.com](https://getbootstrap.com/) - For UI components and styling
- **Node.js Documentation**: [nodejs.org](https://nodejs.org/) - For Node.js API reference
- **Stack Overflow**: Community Q&A for troubleshooting and problem-solving during development
- **MDN Web Docs**: [developer.mozilla.org](https://developer.mozilla.org/) - For JavaScript and web development reference
