require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
// Get all persons
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => res.json(persons))
    .catch(next)
})

// Get single person by id
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (!person) return res.status(404).end()
      res.json(person)
    })
    .catch(next)
})

// Delete person
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(next)
})

// Create person
app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  Person.findOne({ name: body.name })
    .then((existing) => {
      if (existing) {
        return res.status(400).json({ error: 'name must be unique' })
      }
      const person = new Person({ name: body.name, number: body.number })
      return person.save()
    })
    .then((saved) => {
      if (saved) res.status(201).json(saved)
    })
    .catch(next)
})

// Update person number
app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  const update = {}
  if (name !== undefined) update.name = name
  if (number !== undefined) update.number = number

  Person.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true, context: 'query' })
    .then((updated) => {
      if (!updated) return res.status(404).end()
      res.json(updated)
    })
    .catch(next)
})

// Info endpoint
app.get('/api/info', (req, res, next) => {
  Person.countDocuments({})
    .then((count) => {
      const date = new Date()
      res.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
    })
    .catch(next)
})

// Unknown endpoint
app.use((req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
})

// Error handler
app.use((error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  console.error(error)
  res.status(500).json({ error: 'internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
