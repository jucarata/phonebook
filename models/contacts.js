const mongoose = require("mongoose")
require('dotenv').config()

mongoose.set('strictQuery', false)

const URL = process.env.MONGODB_URI

console.log('Connecting to', URL)

mongoose.connect(URL)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const contactScheme = mongoose.Schema({
  name: String,
  number: String
})

contactScheme.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model("Contact", contactScheme)