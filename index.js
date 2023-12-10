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
        return cb(null, "./uploads/user-img");
    },
    filename: (req, file, cb) => {
        return cb(null, `user_img_${Date.now()}_${file.originalname}`);
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
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.listen(port, () => {
            console.log(`Chat server listening on port ${port}`);
        });


        // backend api start 
        app.get('/', (req, res) => {
            res.send('Chat app server is running...');
        });

        app.post('/user-profile-image', upload.single('image'), (req, res) => {
            console.log("body", req.body);
            console.log("file", req.file);
            if (req.file) {
                res.send({ mess: "Upload successful" });
            } else {
                res.send({ error: 'can not upload' });
            }
        });
        // backend api end

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);