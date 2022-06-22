const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const Chat = require("../models/Chat");
const User = require("../models/User");
const log = require("../modules/log");
const router = Router();

router.post(
  "/create",
  [
    check("shortId", "Введите shortId").exists({
      checkFalsy: true,
      checkNull: true,
    }),
    check("secondId", "Введите secondId").exists({
      checkFalsy: true,
      checkNull: true,
    }),
    check("name", "Введите name").exists({
      checkFalsy: true,
      checkNull: true,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные",
        });
      }
      const { shortId, secondId, name } = req.body;
      const user = await User.findOne({ shortId: secondId });
      if (!user) {
        return res.status(400).json({ message: "Собеседник не найден" });
      }
      const cht = await Chat.findOne({
        users: { $in: [shortId, secondId] },
      });
      if (cht && cht.users.length == 2) {
        return res
          .status(400)
          .json({ message: "Чат уже существует", chatId: cht.id });
      }
      const chat = new Chat({
        name: name,
        users: [shortId, secondId],
      });
      const d = await chat.save();
      return res.json({ message: "Чат создан", chatId: d.id });
    } catch (e) {
      log(e.message);
      log(e.stack);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте позже" });
    }
  }
);
router.post("/get", async (req, res) => {
  try {
    const { shortId } = req.body;
    const cht = await Chat.find({
      users: { $in: [shortId] },
    });
     return res
      .status(200)
      .json({ message: "Чаты пользователя", chatList: cht });
  } catch (e) {
    log(e.message);
    log(e.stack);
    res.status(500).json({ message: "Что-то пошло не так, попробуйте позже" });
  }
});
module.exports = router;
