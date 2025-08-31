require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const User = require("./userModel");
const mongoose = require("mongoose");
const multer = require("multer");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Multer config (store images in public/uploads/)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique name
    }
});
const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/getAllUsers", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

app.post("/submit", upload.single("image"), async (req, res) => {
    const { name, email, password } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    try {
        const newUser = new User({ name, email, password, image: imagePath });
        await newUser.save();
        res.json(newUser);
        // res.json({ message: "User data saved successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving data" });
    }
});

app.listen(port, () => {
    console.log("Server Upp....");
});
