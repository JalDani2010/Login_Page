const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const LogInCollection = require("./mongoose.js");
const port = process.env.PORT || 3000;
const connectDB = require("./db.js");

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const tempelatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.static(publicPath));

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword, mobile_number } = req.body;

  // Check if password and confirm password match
  if (password !== confirmPassword) {
    return res.send("Passwords do not match!");
  }

  try {
    const checking = await LogInCollection.findOne({ email });

    if (checking) {
      return res.send("User details already exist");
    } else {
      const newUser = new LogInCollection({
        name,
        email,
        password,
        mobile_number,
      });

      // Confirm password is set in schema, but it won't be saved in DB
      newUser.confirmPassword = confirmPassword;

      await newUser.save();

      return res.status(201).render("home", {
        naming: name,
      });
    }
  } catch (e) {
    console.error(e);
    return res.send("Error occurred during signup");
  }
});

app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ email: req.body.email });

    if (!check) {
      return res.send("Wrong details");
    }

    const isMatch = await check.comparePassword(req.body.password);

    if (isMatch) {
      return res.status(201).render("home", { naming: `${req.body.name}` });
    } else {
      return res.send("Incorrect password");
    }
  } catch (e) {
    console.error(e);
    return res.send("Wrong details");
  }
});

app.listen(port, () => {
  console.log("Port connected");
});
