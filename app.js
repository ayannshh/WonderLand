const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Listing = require('./models/listing');
const port = 8080;

// 1. Database Connection
main()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/WonderLand'); 
}

// 2. Settings & Middleware
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));

// 3. Routes

// Home Route
app.get('/', (req, res ) => {
    res.send('Hello World!')
});

// INDEX - Show all listings
app.get("/listings", async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.render('listings/index', { listings });
    } catch (err) {
        res.status(500).send("Error fetching listings: " + err.message);
    }
});

// NEW - Show form to create
app.get("/listings/new", (req, res) => {
    res.render('listings/new');
});

// SHOW - Details of one listing
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render('listings/show', { listing });
});

// CREATE - Save new listing to DB
app.post("/listings", async (req, res) => {
    try {
        const { title, description, price, location, country } = req.body;
        const newListing = new Listing({ title, description, price, location, country });
        await newListing.save();
        res.redirect('/listings');
    } catch (err) {
        res.status(500).send("Error creating listing: " + err.message);
    }
});

// EDIT - Show form for one listing
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render('listings/edit', { listing });
});

// UPDATE - Save edited listing 
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    try {
        const { title, description, price, location, country } = req.body;
        await Listing.findByIdAndUpdate(id, { title, description, price, location, country });
        res.redirect(`/listings/${id}`);
    } catch (err) {
        res.status(500).send("Error updating listing: " + err.message);
    }
});

// DELETE - Remove listing
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    try {
        await Listing.findByIdAndDelete(id);
        res.redirect('/listings');
    } catch (err) {
        res.status(500).send("Error deleting listing: " + err.message);
    }
});

// 4. Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});