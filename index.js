import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

var name = "";

app.use(bodyParser.urlencoded({extended:true}));

function generateName(req, res, next){  //custom middleware function!!
    name = req.body.street+req.body.pet;
    next();
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/submit", generateName, (req, res) => {//using custom middleware only in post request as in get request there is no body it might crash if declared globally
    res.send(`<h1>Your band name is: </h1><h2>${name}</h2>`);
    

});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})