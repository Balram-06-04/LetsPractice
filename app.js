require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const User = require("./userModel");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("./cloudinary");
const fs = require("fs");

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

// Multer config (temporary local storage, just for upload)
const upload = multer({ dest: "uploads/" });

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public"));
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

    try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "users", // optional Cloudinary folder
        });

        // Delete temp file
        fs.unlinkSync(req.file.path);

        // Save user with Cloudinary URL
        const newUser = new User({
            name,
            email,
            password,
            image: result.secure_url,
        });

        await newUser.save();
        res.json(newUser);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving data" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
