import express from "express";

const app = express();

app.get("/healthCheck", (req, res) => {
  res.send("Everything is working fine");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
