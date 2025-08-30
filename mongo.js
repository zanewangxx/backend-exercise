const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://wangzhen:${password}@notesdb.jzkbioj.mongodb.net/PersonRecord?retryWrites=true&w=majority&appName=notesDB`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Record = mongoose.model('Person', personSchema)

if(process.argv.length === 3){
    Record.find({}).then(result => {
        result.forEach(record => {
            console.log(record.name, record.number)
        })
        mongoose.connection.close()
    })
}
if (process.argv.length === 5){
    const name = process.argv[3]
    const number = process.argv[4]

    const record = new Record({name: name, number: number})

    record.save().then(() => {
        console.log(`added ${name} number: ${number} to phonebook`)
        mongoose.connection.close()
    })
}