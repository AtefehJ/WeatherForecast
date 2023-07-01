const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
require("dotenv").config();
const date = require(__dirname + "/date.js");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

let city = null;
let description = null;
let temperature = null;
let imageURL = null;

app.get("/", function (req, res) {
  const day = date.getDate();
  res.render("index", {
    todayDate: day,
    myCity: city,
    myDescription: description,
    myTemp: temperature,
    myImage: imageURL,
  });
});

app.post("/", function (req, res) {
  city = req.body.cityName;
  const apiKey = process.env.API_KEY;
  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=imperial&appid=" +
    apiKey;

  try {
    https.get(url, function (response) {
      response.on("data", function (data) {
        const weatherData = JSON.parse(data);
        // console.log(weatherData);
        if (weatherData.message === "city not found") {
          res.render("index", {
            todayDate: day,
            myCity: weatherData.message,
            myDescription: null,
            myTemp: null,
            myImage: null,
          });
        } else {
          day = date.getDate();
          city = weatherData.name;
          temperature = weatherData.main.temp;
          description = weatherData.weather[0].description;
          let icon = weatherData.weather[0].icon;
          imageURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
          // res.redirect("/");
          res.render("index", {
            todayDate: day,
            myCity: city,
            myDescription: description,
            myTemp: temperature,
            myImage: imageURL,
          });
        }
      });
    });
  } catch (err) {
    res.render("index", {
      todayDate: day,
      myCity: "Something went wrong",
      myDescription: null,
      myTemp: null,
      myImage: null,
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
