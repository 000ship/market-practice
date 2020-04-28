const express = require("express");
const sequelize = require("./util/database");

const app = express();

// View routes
const shopRoutes = require("./routes/shop");

// Api Routes
const apiPostRoutes = require("./routes/api/post");

// Using routes
app.use(shopRoutes);
app.use(apiPostRoutes);

// sequelize.sync({ force: true })
sequelize
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
