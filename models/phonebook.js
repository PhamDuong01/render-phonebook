import mongoose from 'mongoose';
import 'dotenv/config';

// mongoose.set('tristQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose
    .connect(url)
    .then((result) => {
        console.log('connected to MongoDB');
    })
    .catch((err) => {
        console.log('error connecting to MongoDB: ', err.message);
    });

const phonebookSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        minLength: 3,
    },
    number: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(?:\d{2}-\d{6,}|\d{3}-\d{5,})$/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`,
        },
        required: true,
        minLength: 8,
    },
});

phonebookSchema.set('toJSON', {
    transform: (document, returnObject) => {
        returnObject.id = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    },
});

const Phonebook = mongoose.model('Phonebook', phonebookSchema);
export default Phonebook;
