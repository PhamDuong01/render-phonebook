import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';

import Phonebook from './models/phonebook.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

morgan.token('body', (req) => {
    return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', async (req, res) => {
    const result = await Phonebook.find({});
    return res.json(result);
});

app.get('/api/persons/:id', async (req, res, next) => {
    const id = req.params.id;
    Phonebook.find({ _id: id })
        .then((result) => {
            console.log(result);
            if (result.length > 0) {
                return res.json(result);
            }
            return res.json({ message: `Person is not exist on server` });
        })
        .catch((err) => next(err));
});

app.delete('/api/persons/:id', async (req, res, next) => {
    const id = req.params.id;
    Phonebook.findByIdAndDelete({ _id: id })
        .then((result) => {
            return res.json(result);
        })
        .catch((err) => next(err));
});

app.put('/api/persons/:id', async (req, res, next) => {
    const id = req.params.id;
    const { name, number } = req.body;
    const updatePerson = new Phonebook({ name, number });
    Phonebook.findByIdAndUpdate({ _id: id }, updatePerson, { new: true, runValidators: true })
        .then((result) => {
            return res.json(result);
        })
        .catch((err) => next(err));
});

app.post('/api/persons', async (req, res, next) => {
    const { name, number } = req.body;
    // if (!name || !number) return res.status(400).json({ error: 'Name or number must not empty' });
    const phonebook = new Phonebook({ name: name, number: number });
    console.log(phonebook);
    phonebook
        .save()
        .then((result) => {
            return res.status(201).json(result).end();
        })
        .catch((err) => next(err));
});

app.get('/info', (req, res) => {
    const time = new Date();
    const data = JSON.stringify(`
        ${Date.now().toLocaleString()}
        `);
    Phonebook.find({}).then((result) => {
        return res.status(200).send(`
            <div>
                <p>Phonebook has info for ${result.length} people</p>
                <p>${time}</p>
            </div>`);
    });
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    } else if (err.name === 'ValidationError') {
        return res.status(400).send({ error: err.message });
    }

    next(err);
};

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
