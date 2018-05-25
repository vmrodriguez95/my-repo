
const express = require('express');
const https = require('https');
const path = require("path");
const config = require("./config");
const connection = require("./connection");
const app = express();
const port = process.env.PORT || 8080;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

app.use('/css', express.static(path.join(__dirname, '../assets/css')));
app.use('/img', express.static(path.join(__dirname, '../assets/images')));
app.use('/js', express.static(path.join(__dirname, '../assets/js')));

//Render templates
app.get('/', (req, res) => {
    res.render('login', {firebaseConfig: JSON.stringify(config.firebase)});
});

app.get('/dashboard/:user', (req, res) => {
    res.render('index', {firebaseConfig: JSON.stringify(config.firebase)});
});

//Ajax requests
app.get('/users/check', (req, res) => {
    if(req.xhr) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(connection.users.checkUser(req.query.uid));
    } else {
        res.redirect("/");
    }
});

app.get('/search', (req, res) => {
    if(req.xhr) {
        let url = `${config.youtube.url}?key=${config.youtube.key}&q=${req.query.q}&part=${config.youtube.part}&type=${config.youtube.type}&maxResults=${config.youtube.maxResults}`;
        let data = '';
        
        https.get(url, (response) => {
            response.on("data", (chunk) => {
                data += chunk.toString();
            });
            
            response.on('end', () => {
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end(data);
            });
        });
    } else {
        res.redirect("/");
    }
});

app.get('/carousel', (req, res) => {
    res.render("carousel");
});

app.listen(port, () => {
    console.log("Server ready!!");
});