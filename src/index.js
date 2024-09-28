const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const LogInCollection = require("./mongoose.js");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const tempelatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");
// console.log(publicPath);

app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.static(publicPath));

// hbs.registerPartials(partialPath)

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    mobile_number: req.body.mobile_number,
  };

  try {
    const checking = await LogInCollection.findOne({ email: req.body.email });

    if (checking) {
      return res.send("user details already exist");
    } else {
      const newUser = new LogInCollection(data);
      await newUser.save();

      return res.status(201).render("home", {
        naming: req.body.name,
      });
    }
  } catch (e) {
    return res.send("Error occurred during signup");
  }
});

app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ email: req.body.email });

    if (!check) {
      return res.send("wrong details");
    }

    const isMatch = await check.comparePassword(req.body.password);

    if (isMatch) {
      return res.status(201).render("home", { naming: `${req.body.name}` });
    } else {
      return res.send("incorrect password");
    }
  } catch (e) {
    // Catch any other errors
    console.error(e);
    return res.send("wrong details");
  }
});

app.listen(port, () => {
  console.log("port connected");
});
