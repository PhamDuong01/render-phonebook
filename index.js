import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: 4,
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
    {
        id: 5,
        name: 'Duong',
        number: '39-23-6423122',
    },
];

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
morgan.token('body', (req) => {
    return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (req, res) => {
    res.status(200).json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = persons.find((person) => person.id === id);
    if (!data) return res.status(404).send('not found');
    return res.json(data);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const person = persons.find((person) => person.id === id);
    persons = persons.filter((person) => person.id !== id);
    return res.json(person);
});

app.post('/api/persons', (req, res) => {
    const id = Math.floor(Math.random() * 10000);
    const { name, number } = req.body;
    if (!name || !number) return res.status(400).json({ error: 'Name or number must not empty' });
    if (persons.find((person) => person.name === name)) return res.status(400).json({ error: 'name must be unique' });
    const newPerson = { name: name, number: number, id: id };

    persons.push(newPerson);
    return res.status(201).json(newPerson).end();
});

app.get('/info', (req, res) => {
    const time = new Date();
    const data = JSON.stringify(`
        ${Date.now().toLocaleString()}
        `);

    return res.status(200).send(`
        <div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${time}</p>
        </div>`);
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
