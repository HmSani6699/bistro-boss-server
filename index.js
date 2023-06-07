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
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorizad access' })
  }
  const token = authorization.split(' ')[1];

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
     
      res.send({ token })
    })


    //--------------------//
    //     USERS COLLATION  //
    //--------------------//

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await userCollaction.findOne(query);
      if (user?.rol !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    }

    app.get('/users',verifyJWT,verifyAdmin, async (req, res) => {
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
      console.log(result);
      res.send(result)
    })

    //--------------------//
    //     MENU COLLATION  //
    //--------------------//
    app.get('/menu', async (req, res) => {
      const menu = await menuCollaction.find().toArray();
      res.send(menu)
    })

    app.post('/menu', verifyJWT, verifyAdmin, async (req, res) => {
      const newItem = req.body;
      const result = await menuCollaction.insertOne(newItem)
      res.send(result);
    })

    app.delete('/menu/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(144,query);
      const result = await menuCollaction.deleteOne(query);
      console.log(result);
      res.send(result)
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


      if (!email) {
        res.send([])
      }

      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(401).send({ error: true, message: 'forbiddent access' })
      }
    

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