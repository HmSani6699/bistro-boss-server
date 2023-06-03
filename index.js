const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fnxcgsn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollaction = client.db("bistroBossDB").collection("menu");
    const reviewCollaction = client.db("bistroBossDB").collection("review");
    const cardsCollaction = client.db("bistroBossDB").collection("cards");

    //--------------------//
    //     MENU COLLATION  //
    //--------------------//
    app.get('/menu', async (req, res) => {
      const menu = await menuCollaction.find().toArray();
      res.send(menu)
    })

    //--------------------//
    //    REIEW COLLATION    //
    //--------------------//
    app.get('/review', async (req, res) => {
      const menu = await reviewCollaction.find().toArray();
      res.send(menu)
    })


    //--------------------//
    //    CARDS COLLATION    //
    //--------------------//

    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cardsCollaction.find(query).toArray();
      res.send(result)
    })

    app.post('/cards', async (req, res) => {
      const cards = req.body;
      // console.log(cards);
      const result = await cardsCollaction.insertOne(cards);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Bistro boss is satting')
})

app.listen(port, () => {
  console.log(`Bistro bosss is satting on the port ${port}`);
})