const express = require('express')
const app = express()
app.use(express.json())
const cors = require('cors')
app.use(cors())

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)

    if(note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.put('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id)
  const body = req.body

  const noteIndex = notes.findIndex(n => n.id === id)
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'note not found' })
  }

  const updatedNote = { ...notes[noteIndex], ...body }
  notes[noteIndex] = updatedNote
  res.json(updatedNote)
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  const note = {
    id: generateId(),
    content: body.content,
    important: body.important || false,
  }
  notes = notes.concat(note)
  response.json(note)
})

const PORT = process.env.PORT3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})