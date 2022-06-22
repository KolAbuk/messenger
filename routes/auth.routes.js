const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const config = require("../config/config");
const log = require("../modules/log");
const router = Router();

router.post(
  "/register",
  [
    check("email", "Некорректный email").isEmail(),
    check("name", "Введите имя").exists({ checkFalsy: true, checkNull: true }),
    check("surname", "Введите фамилию").exists({
      checkFalsy: true,
      checkNull: true,
    }),
    check("shortId", "Введите ID").exists({
      checkFalsy: true,
      checkNull: true,
    }),
    check("password", "Минимальная длина пароля 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные для регистрации",
        });
      }
      const { name, surname, shortId, email, password } = req.body;
      let candidate = await User.findOne({ email: email });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "Такой пользователь уже существует" });
      }
      candidate = await User.findOne({ shortId: shortId });
      if (candidate) {
        return res.status(400).json({ message: "Такой ID уже занят" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        name: name,
        surname: surname,
        shortId: shortId,
        email: email,
        password: hashedPassword,
        token: null,
      });
      await user.save();
      const token = jwt.sign({ shortId: shortId }, config.jwtSecret);
      await User.updateOne({ shortId: shortId }, { $set: { token: token } });
      res.status(201).json({
        message: "Пользователь создан",
        user: { shortId: shortId, token: token },
      });
    } catch (e) {
      log(e.message);
      log(e.stack);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте позже" });
    }
  }
);
router.post(
  "/login",
  [
    check("email", "Некорректный email").isEmail(),
    check("password", "Минимальная длина пароля 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные для входа",
        });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Неверный пароль, попробуйте позже" });
      }
      const token = jwt.sign({ shortId: user.shortId }, config.jwtSecret);
      await User.updateOne(
        { shortId: user.shortId },
        { $set: { token: token } }
      );
      res.json({ token, shortId: user.shortId });
    } catch (e) {
      log(e.message);
      log(e.stack);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте позже" });
    }
  }
);
router.post("/token", async (req, res) => {
  try {
    const { shortId, token } = req.body;
    const user = await User.findOne({ shortId: shortId });
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }
    if (token == user.token) {
      return res.json({ valid: true });
    }
    return res.json({ valid: false });
  } catch (e) {
    log(e.name);
    log(e.message);
    log(e.stack);
    res.status(500).json({ message: "Что-то пошло не так, попробуйте позже" });
  }
});
module.exports = router;
