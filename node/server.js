const express = require('express');
const parser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // Add this line
const User = require('./userModel');
require("./database").connect();

const app = express();
app.use(parser.urlencoded({ extended: true, limit: '50mb' }));
app.use(parser.json({ limit: '50mb', extended: false }));
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", async (req, res) => {
  console.log("client connected");
  res.status(201).json({ message: "connected" });
});

app.get("/user", async (req, res) => {
  try {
    const userData = await User.find();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/user", upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'document', maxCount: 1 }]), async (req, res) => {
  try {
    if (req.files) {
      const formData = req.body;
      const profileImage = req.files['profileImage'][0].buffer;
      const document = req.files['document'][0].buffer;

      const newUser = new User({
        ...formData,
        profileImage: {
          data: profileImage,
          contentType: req.files['profileImage'][0].mimetype,
        },
        document: {
          data: document,
          contentType: req.files['document'][0].mimetype,
        },
      });

      await newUser.save();
      res.status(201).json({ message: "User data saved successfully" });
    } else {
      const formData = req.body;

      console.log("Received request data:", formData);

      const newUser = new User(formData);
      await newUser.save();
      res.status(201).json({ message: "User data saved successfully" });
    }
  } catch (error) {
    console.error("Error during form submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/user", async (req, res) => {
  const formData = req.body;

  console.log("Received request data:", formData);  

  try {
    const newUser = new User(formData);
    await newUser.save();
    res.status(201).json({ message: "User data saved successfully" });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    }

    console.error("Error saving user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/delete", async (req, res) => {
  const { ids } = req.body;

  try {
    await User.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Selected rows deleted successfully" });
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: "User ID is undefined" });
    }

    const userData = await User.findById(id);
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Received PUT request with id:", id);

  try {
    const updatedData = req.body;
    await User.findByIdAndUpdate(id, updatedData);
    res.status(200).json({ message: "User data updated successfully" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(4455, () => {
  console.log('Server running on port 4455');
});
