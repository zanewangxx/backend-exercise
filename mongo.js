require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
if (!url) {
  console.error('Missing MONGODB_URI. Set it in your environment or .env.')
  process.exit(1)
}

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number (use NN-NNN... or NNN-NNN..., total length >= 8)`,
    },
  },
})

const Person = mongoose.model('Person', personSchema)

// Usage:
//   node mongo.js             -> list all persons
//   node mongo.js add Name 123-456 -> add a person

const [,, cmd, name, number] = process.argv

if (!cmd) {
  Person.find({}).then((result) => {
    result.forEach((p) => console.log(p.name, p.number))
    mongoose.connection.close()
  })
} else if (cmd === 'add' && name && number) {
  const person = new Person({ name, number })
  person.save().then(() => {
    console.log(`added ${name} number: ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('Usage:\n  node mongo.js\n  node mongo.js add "Name" "123-456"')
  mongoose.connection.close()
}
