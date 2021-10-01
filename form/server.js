const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/", (req, res) => res.sendFile(path.join(__dirname + "/index.html")));

app.post("/get-postcodes", (req, res) => {
  const { postcode } = req.body;
  console.log(postcode);
  (async () => {
    const options = {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    try {
      const result = await axios.get(
        `http://kodpocztowy.intami.pl/api/${postcode}`
      );
      console.log(result.data);
      res.json(result.data);
    } catch (error) {
      console.log(error);
    }
  })();
});

app.listen(8080, () => {
  console.log("git");
});
