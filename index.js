const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rfjtmur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const productsCollection = client.db("scic-products").collection("products");

        // get all products
        app.get("/products", async (req, res) => {

            const { page = 1, search = "", sort = "" } = req.query;
            const limit = 9;
            const skip = (page - 1) * limit;

            let query = {};
            if (search) {
                query = { brand_name : { $regex: search, $options: 'i' }}; 
            }
            // if (category_name) {
            //     query = category_name;
            // }
            // if (brand) {
            //     query = brand_name;
            // }

            let sortOption = {};
            if (sort === "priceLowToHigh") {
                sortOption.price = 1;
            } else if (sort === "priceHighToLow") {
                sortOption.price = -1;
            } else if (sort === "newest") {
                sortOption.createdAt = -1;
            }

            // const total = await productsCollection.countDocuments(query);
            const products = await productsCollection.find(query).skip(skip).limit(limit).sort(sortOption).toArray();
            // 
            
            res.send({ products });
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is Running....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))