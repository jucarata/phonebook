const express = require("express")
const app = express()
require('dotenv').config()

const cors = require("cors")
const morgan = require("morgan")
const Contact = require("./models/contacts")

app.use(express.json())
app.use(cors())

morgan.token("resBody", (request) => (request.method === 'POST')?JSON.stringify(request.body):'')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :resBody'))


let contacts = []

const getAll = () => {
  return Contact.find({}).then(contactsReturned => contactsReturned.map(contact => contact.toJSON()))
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}


app.get("/api/persons", (request, response) => {
    getAll().then(contactsReturned => {
      //Each contact has database format {_id: {object}, _v: version
      contacts = contactsReturned
      response.json(contactsReturned)
    })
})

//Hasta el momento solo funciona si previamente se cargaron los contactos con el metodo get(api/contacts)
app.get("/info", (request, response) => { 
    if(contacts.length === 0){
      getAll().then(contactsReturned => {
        const totalContacts = `<p>Phonebook has info for ${contactsReturned.length} persons<p/>`
        const date = `<p>${new Date()}<p/>`
        const info = `<div>${totalContacts}${date}<div/>`

        contacts = contactsReturned
        return response.send(info)
      })
    } else {
      const totalContacts = `<p>Phonebook has info for ${contacts.length} persons<p/>`
      const date = `<p>${new Date()}<p/>`
      const info = `<div>${totalContacts}${date}<div/>`
      
      return response.send(info)
    }
})

app.get("/api/persons/:id", (request, response, next) => {
    const id = request.params.id
    Contact.findById(id)
      .then(contactReturned => {
        return (contactReturned)? 
          response.json(contactReturned) 
          : response.status(404).json({ error: 'Not Found' })
      })
      .catch(error => next(error))
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


    const newContact = new Contact({
      name: contact.name, 
      number: contact.number
    })

    newContact.save().then(contactReturned => {
      contacts = contacts.concat(contactReturned.toJSON())
      response.status(201).json(contactReturned)
    })
    
})

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id

    Contact.findByIdAndDelete(id)
      .then(contactReturned => {
        contacts = contacts.filter(c => c.id !== id)
        response.status(204).end()
      })
      .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
    const id = request.params.id
    Contact.findByIdAndUpdate(id, request.body, {new: true})
      .then(contactUpdated => {
        contacts = contacts.map(contact => (contact.id !== id)? contact : contactUpdated.toJSON())
        response.json(contactUpdated) 
      })
      .catch(error => next(error))
})

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log("Server is running in " + PORT)
})