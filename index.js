const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nt7otjy.mongodb.net/?retryWrites=true&w=majority`;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('./uploads'));

// multer dest and filename config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, "./uploads/profile-img");
    },
    filename: (req, file, cb) => {
        return cb(null, `profile_img_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });



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
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const chatApp = client.db('chat_app');
        const users = chatApp.collection('user');

        app.listen(port, () => {
            console.log(`Chat app server listening on port ${port}`);
        });


        // backend api start 
        app.get('/', (req, res) => {
            res.send('Chat app server is running...');
        });

        app.post('/user-profile-image', upload.single('image'), async (req, res) => {
            if (!req.body && !req.file) {
                return res.status(404).json({ error: true, message: "Please fill the input box with correct information." });
            }

            const userData = {
                name: req.body?.name,
                email: req.body?.email,
                user_img_url: req.file?.path,
                password: req.body?.password
            }
            const result = await users.insertOne(userData);
            const domainName = req.get('origin');

            res.status(200).send({ result, imgURL: `${domainName}/${req.file.path}` });
        });
        // backend api end

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);