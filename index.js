const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
//Inventory API -- GET
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

//Inventory API --POST
app.post("/add-inventory", async (req, res) => {
  const inventory = req.body;
  const result = await inventoryCollection.insertOne(inventory);
  res.send(result);
});

//PUT API's

//Inventory API -- Put
app.put("/inventory/:id", async (req, res) => {
  const inventoryId = req.params.id;

  // Check if inventoryId is a valid ObjectId
  if (!ObjectId.isValid(inventoryId)) {
    return res.status(400).send({ error: "Invalid inventoryId" });
  }

  const updatedData = req.body;

  try {
    const query = { _id: new ObjectId(inventoryId) };
    const update = { $set: { ...updatedData } };

    // Exclude _id from the update to avoid the immutable field error
    delete update.$set._id;

    const result = await inventoryCollection.updateOne(query, update);

    if (result.matchedCount === 0) {
      return res.status(404).send({ error: "Inventory not found" });
    }

    res.send({ message: "Inventory updated successfully" });
  } catch (error) {
    console.error("Error in /inventory/:id PUT endpoint:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//DELETE API's

// inventory API -- DELETE

app.delete("/inventory/:id", async (req, res) => {
  const inventoryId = req.params.id;

  try {
    const query = { _id: new ObjectId(inventoryId) };

    const result = await inventoryCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Inventory not found" });
    }

    res.send({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error in /inventory/:id DELETE endpoint:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
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
