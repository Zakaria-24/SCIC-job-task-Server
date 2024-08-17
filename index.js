const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://radiant-strudel-258d0a.netlify.app',
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

        app.get('/products', async (req, res) => {
            try {
                // Extract query parameters
                const { search, category, brand_name, minPrice, maxPrice, sortBy, sortOrder } = req.query;
                
                // Build the query object
                const query = {};

                // Search functionality using regex for handling capitalization, word spacing etc.
                if (search) {
                    query.$or = [
                        // { category_name: { $regex: search, $options: 'i' } },
                        { brand_name: { $regex: search, $options: 'i' } },
                        // { short_description: { $regex: search, $options: 'i' } }
                    ];
                }

                // Filter by category
                if (category) {
                    query.category_name = category;
                }

                // Filter by brand
                if (brand_name) {
                    query.brand_name = brand_name;
                }

                // Filter by price range
                if (minPrice || maxPrice) {
                    query.price = {};
                    if (minPrice) query.price.$gte = parseFloat(minPrice);
                    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
                }

                // Sorting
                const sortOptions = {};
                if (sortBy) {
                    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
                }

                // Fetch the results from the database
                const results = await productsCollection.find(query).sort(sortOptions).toArray();

                res.json(results);

            } catch (error) {
                console.error('Error connecting to MongoDB:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is Running....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))


