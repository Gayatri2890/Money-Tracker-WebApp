const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/moneydb', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

// Create Transaction Schema
const transactionSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    type: String,
    date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        const balance = calculateBalance(transactions);
        res.render('index', { transactions, balance });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.post('/add-transaction', async (req, res) => {
    try {
        const newTransaction = new Transaction({
            description: req.body.description,
            amount: parseFloat(req.body.amount),
            type: req.body.type
        });

        await newTransaction.save();
        res.redirect('/');
    } catch (error) {
        res.status(400).send('Error adding transaction.');
    }
});

// Calculate the current balance
function calculateBalance(transactions) {
    let balance = 0;
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            balance += transaction.amount;
        } else {
            balance -= transaction.amount;
        }
    });
    return balance.toFixed(2);
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
