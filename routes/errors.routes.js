const { Router } = require("express");
const log = require("../modules/log");
const router = Router();

router.post("/", async (req, res) => {
  try {
    const error = req.body;
    log(error, "./data/errors/errors.txt");
    res.status(200).json({ message: "Ошибка в обработке" });
  } catch (e) {
    log(e);
  }
});
module.exports = router;
