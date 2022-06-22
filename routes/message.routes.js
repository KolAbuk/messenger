const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const Message = require("../models/Message");
const log = require("../modules/log");
const router = Router();

router.post(
  "/send",
  [
    check("from", "from not exist").exists({
      checkFalsy: true,
      checkNull: true,
    }),
    check("to", "to not exist").exists({ checkFalsy: true, checkNull: true }),
    check("time", "time not exist").exists({
      checkFalsy: true,
      checkNull: true,
    }),
    check("type", "type not exist").exists({
      checkFalsy: true,
      checkNull: true,
    }),
    check("body", "body not exist").exists({
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
          message: "Некорректные данные сообщения",
        });
      }
      const { from, to, time, type, body } = req.body;
      const mess = await Message({
        from: from,
        to: to,
        time: time,
        type: type,
        body: body,
      });
      const s = await mess.save();
      if (!s) {
        return res.status(400).json({ message: "Ошибка отправки сообщения" });
      }
      res.json({ from: from, to: to, time: time, type: type, body: body });
    } catch (e) {
      log(e.name);
      log(e.message);
      log(e.stack);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте позже" });
    }
  }
);
router.post(
  "/get",
  [
    check("chatId", "chatId not exist").exists({
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
      const { chatId, lastMsgId } = req.body;
      const mess = await Message.find({
        to: chatId,
      });
      const id = mess.map((x) => x.id).indexOf(lastMsgId);
      if (!mess) {
        return res.status(400).json({ message: "Ошибка получения сообщения" });
      }
      if (mess.length === 0) {
        setTimeout(() => {
          return res.status(490).json({ message: "Сообщений в этом чате нет" });
        }, 10 * 1000);
      } else if (!lastMsgId) {
        return res.json({ chatId: chatId, messages: mess });
      } else if (id == mess.length - 1) {
        setTimeout(() => {
          return res.status(488).json({ message: "Новых сообщений нет" });
        }, 10 * 1000);
      } else {
        return res.json({ messages: mess.slice(id + 1) });
      }
    } catch (e) {
      log(e.name);
      log(e.message);
      log(e.stack);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте позже" });
    }
  }
);
module.exports = router;
