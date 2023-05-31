const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");

const { validateToken } = require("../middleware/AuthMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      username: username,
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

router.get("/verify", validateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        income: true,
        credit: true,
        expenses: true,
      },
    });

    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to verify user" });
  }
});

router.put("/update", validateToken, async (req, res) => {
  const { userId, income, credit, expenses } = req.body;
  
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        income: income,
        expenses: expenses,
        credit: credit,
      },
    });

    res.json({ message: "Income updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update income" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const user = await prisma.User.findFirst({
    where: {
      username,
    },
  });

  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.User.create({
      data: {
        username: username,
        password: hash,
        email: email,
        income: 0,
        credit: 0,
        expenses: 0,
      },
    });
    res.json({ message: "User Created!" });
  } else {
    res.json({ message: "User already exists!" });
  }
});

module.exports = router;