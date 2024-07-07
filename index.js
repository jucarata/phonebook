const express = require("express")
const cors = require("cors")

const app = express()
const morgan = require("morgan")
app.use(express.json())
app.use(cors())

morgan.token("resBody", (request) => (request.method === 'POST')?JSON.stringify(request.body):'')

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :resBody'))

let contacts = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const getID = () => {
  return (contacts.length > 0)?
    Math.floor(Math.random() * Number.MAX_VALUE)
    : 0
}

app.get("/api/persons", (request, response) => {
    response.json(contacts)
})

app.get("/info", (request, response) => {"`"
    const totalContacts = `<p>Phonebook has info for ${contacts.length} persons<p/>`
    const date = `<p>${new Date()}<p/>`
    const info = `<div>${totalContacts}${date}<div/>`

    response.send(info)
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const contact = contacts.find(c => c.id === id)

    return (contact)? 
        response.json(contact) 
        : response.status(404).json({ error: 'Not Found' })
})

app.post("/api/persons", (request, response) => {
    const contact = request.body
    const found = contacts.find(c => c.name === contact.name)

    if(!contact.name && !contact.number){
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }

    if(found){
      return response.status(409).json({ 
        error: 'Contact already exists' 
      })
    }


    const newContact = {id: getID(), name: contact.name, number: contact.number}

    contacts = contacts.concat(newContact)

    response.status(201).json(newContact)
})

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    contacts = contacts.filter(c => c.id !== id)

    response.status(204).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log("Server is running in " + PORT)
})