const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");

const { validateToken } = require("../middleware/AuthMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { username, password, email } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      username: username,
      email: email,
    },
  });

  if (user) {
    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        const accessToken = sign(
          { username: user.username, id: user.id, email: user.email },
          "important"
        );
        res.json({
          message: "Login Successful",
          accessToken: accessToken,
          username: username,
          userId: user.id,
          email: user.email,
        });
      } else {
        res.json({ message: "Wrong username/password combination!" });
      }
    });
  } else {
    res.json({ message: "User doesn't exist" });
  }
});

router.get("/verify", validateToken, (req, res) => {
  res.json({ user: req.user });
});

router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const user = await prisma.User.findFirst({
    where: {
      username,
      email,
    },
  });

  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.User.create({
      data: {
        username: username,
        password: hash,
        email: email,
      },
    });
    res.json({ message: "User Created!" });
  } else {
    res.json({ message: "User already exists!" });
  }
});

module.exports = router;