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

app.get('/:user', (req, res) => {
    res.render('index', {firebaseConfig: JSON.stringify(config.firebase)});
});

//Ajax requests
app.get('/users/check', (req, res) => {
    console.log(connection.users.checkUser(req.query.uid));
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("OK");
});

app.get('/search', (req, res) => {
    let url = `${config.youtube.url}?key=${config.youtube.key}&q=${req.query.q}&part=${config.youtube.part}&type=${config.youtube.type}`;
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
});

app.listen(port, () => {
    console.log("Server ready!!");
});