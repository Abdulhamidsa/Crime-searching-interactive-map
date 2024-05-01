const express = require("express");
const { Database } = require("arangojs");
const casual = require("casual");
const app = express();
const port = process.env.PORT || 3000;
const arangoURL = "https://de8f177248f7.arangodb.cloud:8529";
const dbName = "_systems";
const username = "root";
const password = "5Qtab6B84KlZBSso9kkg";

// Create a new ArangoDB database instance
const db = new Database({
  url: arangoURL,
  databaseName: dbName,
  auth: { username, password },
});
app.get("/insert-crimes", async (req, res) => {
  try {
    const info = await db.version();
    console.log("Connected to ArangoDB", info);
    const collection = db.collection("test");
    console.log("Accessed collection:", collection.name);
    for (let i = 0; i < 5; i++) {
      const criminalData = {
        name: casual.full_name,
        email: casual.email,
        address: casual.address,
        phone: casual.phone,
        age: casual.integer(18, 90),
      };
      const crimeData = {
        crime_type: casual.random_element(["Robbery", "Assault", "Burglary", "Fraud", "Drug trafficking", "Murder", "Kidnapping"]),
        location: {
          latitude: generateRandomCoordinate(-90, 90),
          longitude: generateRandomCoordinate(-180, 180),
        },
        date_time: casual.date("YYYY-MM-DDTHH:mm:ssZ"),
        description: casual.sentences(5),
      };
      const friends = [];
      const family = [];
      const data = {
        criminal: criminalData,
        crime: crimeData,
        friends: friends,
        family: family,
      };
      const result = await collection.save(data);
      console.log("Inserted document:", result);
    }
    res.status(200).send("Crimes inserted successfully");
  } catch (error) {
    console.error("Failed to insert crimes into ArangoDB", error);
    res.status(500).send("Internal server error");
  }
});
function generateRandomCoordinate(min, max) {
  return Math.random() * (max - min) + min;
}
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
