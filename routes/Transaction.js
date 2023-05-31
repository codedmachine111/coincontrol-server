const express = require("express");
const router = express.Router();

const { validateToken } = require("../middleware/AuthMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", validateToken, async (req, res) => {
    const listOfTransactions = await prisma.transaction.findMany({
        where: {
            userId: req.user.id,
        },
    });

    res.json({ listOfTransactions: listOfTransactions });
});

router.post("/add", validateToken, async (req, res) => {
    const { userId, amount, category } = req.body;
    const transaction = await prisma.transaction.create({
        data: {
            amount: amount,
            category: category,
            userId: userId,
        },
    });

    if (transaction) {
        res.json({ message: "Transaction added successfully" });
    } else {
        res.json({ message: "Failed to add transaction" });
    }
})

module.exports = router;