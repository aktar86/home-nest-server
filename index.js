const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.HN_USER}:${process.env.HN_PASS}@first-mongodb-project.ii5tnsm.mongodb.net/?appName=First-MongoDB-Project`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create database
    const db = client.db("properties_DB");
    const propertiesCollection = db.collection("properties");
    const reviewsCollection = db.collection("reviews");

    //review related APIs
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find().sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    });

    //properties APIs here
    app.get("/properties", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.property_owner_mail = email;
      }

      const cursor = propertiesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get specific data
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.findOne(query);
      res.send(result);
    });

    //post properties
    app.post("/properties", async (req, res) => {
      const newPropertiy = req.body;
      const result = await propertiesCollection.insertOne(newPropertiy);
      res.send(result);
    });

    //delete properties
    app.delete("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.deleteOne(query);
      res.send(result);
    });

    //update properties using modal
    app.patch("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProperty = req.body;

      const query = { _id: new ObjectId(id) };
      const options = {};
      const updateDoc = {
        $set: {
          property_name: updatedProperty.property_name,
          category: updatedProperty.category,
          property_price: updatedProperty.property_price,
          property_location: updatedProperty.property_location,
          property_img_url: updatedProperty.property_img_url,
          description: updatedProperty.description,
        },
      };

      const result = await propertiesCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    //latest-properties
    app.get("/featured-properties", async (req, res) => {
      const cursor = propertiesCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
