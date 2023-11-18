const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4gu2b8y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware to check MongoDB connection
const checkMongoDBConnection = (req, res, next) => {
  if (!client.topology.isConnected()) {
    return res.status(500).send({ error: "MongoDB client is not connected." });
  }
  next();
};

app.use(checkMongoDBConnection);
const usersCollection = client
  .db("ZedandZed-Invigo-Tech-DB")
  .collection("user");
const inventoryCollection = client
  .db("ZedandZed-Invigo-Tech-DB")
  .collection("inventory");
//GET METHOD API's

//User API -- GET
app.get("/users", async (req, res) => {
  const cursor = usersCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});
app.get("/inventory", async (req, res) => {
  const cursor = inventoryCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// POST METHOD API's
// User API -- POST
app.post("/users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };

  try {
    const existingUser = await usersCollection.findOne(query);

    if (existingUser) {
      return res.send({ message: "user already exists" });
    }

    const result = await usersCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    console.error("Error in /users endpoint:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
app.post("/add-inventory", async (req, res) => {
  const inventory = req.body;
  const result = await inventoryCollection.insertOne(inventory);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("ZedandZed-Invigo-Tech is running");
});

async function startServer() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Start the server
    app.listen(port, () => {
      console.log(`ZedandZed-Invigo-Tech is running on ${port}`);
    });
  } catch (error) {
    console.error("Error during MongoDB connection:", error);
  }
}

startServer();
