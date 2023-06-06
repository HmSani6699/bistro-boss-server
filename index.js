const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');
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

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log({ authorization });
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorizad access' })
  }
  const token = authorization.split(' ')[1];
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    console.log(err);
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorizad access 0000000' })
    }
    // console.log(decoded);
    req.decoded = decoded;
    next()
  });
}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollaction = client.db("bistroBossDB").collection("user");
    const menuCollaction = client.db("bistroBossDB").collection("menu");
    const reviewCollaction = client.db("bistroBossDB").collection("review");
    const cardsCollaction = client.db("bistroBossDB").collection("cards");


    //--------------------//
    // JWT //
    //--------------------//
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log(token);
      res.send({ token })
    })


    //--------------------//
    //     USERS COLLATION  //
    //--------------------//

    app.get('/users', async (req, res) => {
      const result = await userCollaction.find().toArray();
      res.send(result)
    })

    app.post('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollaction.findOne(query);
      if (existingUser) {
        return {}
      }
      const result = await userCollaction.insertOne(user);
      res.send(result)
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = { $set: { rol: `admin` }, };
      const result = await userCollaction.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.get('/users/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        res.send({admin:false})
      }

      const query = { email: email }
      const user = await userCollaction.findOne(query);
      const result = { admin: user?.rol === 'admin' };
      res.send(result)

    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollaction.deleteOne(query);
      res.send(result)
    })

    //--------------------//
    //     MENU COLLATION  //
    //--------------------//
    app.get('/menu', async (req, res) => {
      const menu = await menuCollaction.find().toArray();
      res.send(menu)
    })

    //--------------------//
    //    REVIEW COLLATION    //
    //--------------------//
    app.get('/review', async (req, res) => {
      const menu = await reviewCollaction.find().toArray();
      res.send(menu)
    })


    //--------------------//
    //    CARDS COLLATION    //
    //--------------------//

    app.get('/carts', verifyJWT, async (req, res) => {
      const email = req.query.email;

      console.log(req.headers.authorization);

      if (!email) {
        res.send([])
      }

      const decodedEmail = req.decoded.email;
      console.log(131, decodedEmail, email);
      if (email !== decodedEmail) {
        return res.status(401).send({ error: true, message: 'forbiddent access' })
      }
      console.log('ami vallo ');

      const query = { email: email };
      const result = await cardsCollaction.find(query).toArray();
      res.send(result)
    })

    app.post('/cards', async (req, res) => {
      const cards = req.body;
      const result = await cardsCollaction.insertOne(cards);
      res.send(result)
    })

    app.delete('/cards/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cardsCollaction.deleteOne(query);
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