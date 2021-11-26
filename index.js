const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

// MongoDb 
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const e = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r252i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



const icepoint = async () => {
    try {
        await client.connect();
        const usersCollection = client.db('TheIcePoint').collection('users');
        const icecreamsCollection = client.db('TheIcePoint').collection('icecreams');
        const ordersCollection = client.db('TheIcePoint').collection('orders');
        const reviewsCollection = client.db('TheIcePoint').collection('reviews');

        /***************************** 
         * Ice Creams
         * ************************** */
        // Add Ice Creams
        app.post('/icecreams', async (req, res) => {
            const icecream = req.body
            const result = await icecreamsCollection.insertOne(icecream);
            res.send(result);
        })
        // Get All Ice Creams
        app.get('/icecreams', async (req, res) => {
            const limit = Number(req.query.limit)
            let result
            if (limit)
                result = await icecreamsCollection.find({}).limit(limit).toArray();
            else
                result = await icecreamsCollection.find({}).toArray();
            res.send(result);
        })
        // Get Single Ice Creams
        app.get('/icecreams/:icecreamID', async (req, res) => {
            const icecreamID = req.params.icecreamID;
            const result = await icecreamsCollection.findOne({ _id: ObjectId(icecreamID) });
            res.send(result);
        })
        // Update Specific Ice Cream
        app.put('/icecreams/:icecreamID', async (req, res) => {
            const icecream = req.body
            const icecreamID = req.params.icecreamID;
            const filter = { _id: ObjectId(icecreamID) }
            const updateDoc = {
                $set: {
                    title: icecream.title,
                    unitPrice: icecream.unitPrice,
                    overview: icecream.overview,
                    picture: icecream.picture,
                }
            }
            const result = await icecreamsCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        // Delete Single Ice Creams
        app.delete('/icecreams/:icecreamID', async (req, res) => {
            const icecreamID = req.params.icecreamID
            const filter = { _id: ObjectId(icecreamID) }
            const result = await icecreamsCollection.deleteOne(filter)
            res.send(result)
        })

        /*********************
         * Order
         * ****************** */

        // Get All Orders 
        app.get('/orders', async (req, res) => {
            let result = { status: 'not found' }
            const email = req.query.email
            console.log(email)
            try {
                if (email)
                    result = await ordersCollection.find({ email }).toArray();
                else
                    result = await ordersCollection.find({}).toArray();
            }
            catch (e) {
            }
            finally {
                res.send(result)
            }
        })
        // New Order Placed
        app.post('/orders', async (req, res) => {
            const item = req.body
            let result = { status: 404 }
            try {
                result = await ordersCollection.insertOne(item);

            }
            catch (e) {
            }
            finally {
                res.send(result)
            }
        })

        // Update Single Order
        app.put('/orders', async (req, res) => {
            const order = req.body
            console.log('Body Order Update ', order)
            let result = { status: 'not found' }
            const filter = { _id: ObjectId(order._id) }
            const updateDoc = {
                $set: {
                    fullName: order.fullName,
                    address: order.address,
                    contact: order.contact,
                    status: order.status,
                    unitPrice: order.unitPrice,
                }
            }
            try {
                result = await ordersCollection.updateOne(filter, updateDoc)
            }
            catch (e) { }
            finally {
                res.send(result)
            }
        })

        // Get Single Order
        app.get('/orders/:orderID', async (req, res) => {
            const orderID = req.params.orderID
            let result = { status: 'not found' }
            const filter = { _id: ObjectId(orderID) }
            try {
                result = await ordersCollection.findOne(filter)
            }
            catch (e) { }
            finally {
                res.send(result)
            }
        })

        // Delete Single Order
        app.delete('/orders/:orderID', async (req, res) => {
            const orderID = req.params.orderID
            let result = { status: 'not found' }
            const filter = { _id: ObjectId(orderID) }
            try {
                result = await ordersCollection.deleteOne(filter)
            }
            catch (e) { }
            finally {
                res.send(result)
            }
        })

        // Confirm or Cancel Single Order
        app.put('/orders/:orderID', async (req, res) => {
            const orderID = req.params.orderID
            const actionType = req.body.actionType
            console.log('request body ', actionType)
            let result = { status: 'not found' }
            const filter = { _id: ObjectId(orderID) }
            const updateDoc = {
                $set: {
                    status: actionType,
                }
            }
            try {
                result = await ordersCollection.updateOne(filter, updateDoc)
            }
            catch (e) { }
            finally {
                res.send(result)
            }
        })

        /********************
         * Reviews
         * ****************** */
        // Add Reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body
            let result = { status: 404 }
            try {
                result = await reviewsCollection.insertOne(review);
            }
            catch (e) {
            }
            finally {
                res.send(result)
            }
        })

        // All Reviews
        app.get('/reviews', async (req, res) => {
            const email = req.query.email
            let result = { status: 404 }
            try {
                if (email)
                    result = await reviewsCollection.find({ email }).toArray();
                else
                    result = await reviewsCollection.find({}).toArray();
            }
            catch (e) {
            }
            finally {
                res.send(result)
            }
        })

        // Delete Reviews
        app.delete('/reviews/:reviewID', async (req, res) => {
            const reviewID = req.params.reviewID
            let result = { status: 404 }
            try {
                const filter = { _id: ObjectId(reviewID) }
                result = await reviewsCollection.deleteOne(filter);
            }
            catch (e) {
            }
            finally {
                res.send(result)
            }
        })

        // User Added
        app.post('/users', async (req, res) => {
            const userInfo = req.body
            const result = await usersCollection.insertOne(userInfo);
            res.send(result);
        })
        //Set User Role To Admin
        app.put('/user/admin', async (req, res) => {
            const user = req.body
            console.log('Admin body ', user)
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    email: user.email,
                    pass: user.pass,
                    userName: user.userName,
                    authorizedBy: user.authorizedBy,
                    role: user.role
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        // Check User Already Exist
        app.get('/user', async (req, res) => {
            const email = req.query.email
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send(user);
        })
        // Check Role of Users
        app.get('/user/admin', async (req, res) => {
            const email = req.query.email
            console.log('User Mail is ', email)
            let isAdmin = false
            const query = { email }
            const user = await usersCollection.findOne(query);
            if (user?.role === 'admin')
                isAdmin = true
            res.send(isAdmin);
        })


        // Default API to check server 
        app.get('/', (req, res) => {
            res.send('TheIcePoint');
        })
    }
    finally {
    }
}

icepoint().catch(() => console.dir());
app.listen(PORT, () => console.log('The Ice Point Connection Established'));