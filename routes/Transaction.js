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

router.delete("/delete/:id", validateToken, async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await prisma.transaction.delete({
        where: {
            id: parseInt(transactionId),
        },
    });

    if (transaction) {
        res.json({ message: "Transaction deleted successfully" });
    } else {
        res.json({ message: "Failed to delete transaction" });
    }
})

// A ROUTE TO UPDATE TRANSACTION DETAILS
router.put("/update", validateToken, async (req, res) => {
    const { id, amount, category } = req.body;
    const transaction = await prisma.transaction.update({
        where: {
            id: parseInt(id),
        },
        data: {
            amount: amount,
            category: category,
        },
    });

    if (transaction) {
        res.json({ message: "Transaction updated successfully" });
    } else {
        res.json({ message: "Failed to update transaction" });
    }
});

module.exports = router;