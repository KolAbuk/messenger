const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config/config");
const log = require("./modules/log");
const localtunnel = require("localtunnel");

const app = express();

const PORT = config.PORT || 5000;
let reqCount = 0;
app.use(cors());
app.use(express.json({ extended: true }));
app.use(function (req, res, next) {
  //log(req.url);
  reqCount++;
  log(reqCount);
  log(req.headers["x-forwarded-for"]);
  next();
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/errors", require("./routes/errors.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/message", require("./routes/message.routes"));

const start = async () => {
  try {
    const tunnel = await localtunnel({
      subdomain: "kolabuk-msngr",
      port: 4500,
    });
    const url = tunnel.url;
    if (url != "https://kolabuk-msngr.loca.lt") {
      log("[TUNNEL ERROR] url: " + url);
    }
    log("[TUNNEL] url: " + url);

    await mongoose.connect(config.mongoUrl);

    app.listen(PORT, () => {
      log("Server has been started at port " + PORT);
    });
  } catch (e) {
    log(e.name);
    log(e.message);
    log(e.stack);
  }
};
(async () => {
  await start();
})();
