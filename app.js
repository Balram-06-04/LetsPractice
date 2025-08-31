const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const User = require("./userModel");
const mongoose = require("mongoose");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


mongoose.connect("mongodb://localhost:27017/BALLU_DB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public"));
})

app.get("/getAllUsers", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
})

app.post("/submit", async (req, res) => {
    const { name,email, password ,image  } = req.body;

    try {
        const newUser = new User({name, email, password ,image  });
        await newUser.save();
        res.json({ message: "User data saved successfully!" });
    } catch (err) {
        console.error("❌ Error saving user data:", err);
        res.status(500).json({ message: "Error saving data" });
    }
});


app.listen(port, () => {
    console.log("Server Upp....");
})