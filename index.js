const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT||5000;

// Middleware
app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('Bistro boss is satting')
})

app.listen(port,()=>{
    console.log(`Bistro bosss is satting on the port ${port}`);
})