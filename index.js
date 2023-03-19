'use strict'

const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const formidable = require('formidable')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const cors = require('cors')
const { uploadPath, port, dbPath } = require('./config')

const app = express()

app.use(cors())

app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'dist')))

let db

app.post('/', (req, res) => {
  const form = new formidable.IncomingForm()

  form.parse(req)

  form.on('fileBegin', (_, file) => {
    file.path = path.join(uploadPath, file.name) // path traversal :((
  })

  form.on('file', (_, file) => {
    console.log('Uploaded ' + file.name)
  })

  res.sendFile(path.join(__dirname, 'admin.html'))
})

app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'))
})

app.get('/drop_files', async (_, res) => {
  try {
    const dirs = await fs.promises.readdir(path.join(__dirname, 'uploads'))
    for (const file in dirs) {
      await fs.promises.unlink(path.join(__dirname, 'uploads', file))
    }
  } catch (e) {
    res.sendStatus(500)
  }
})

app.get('/db', (_, res) => {
  res.sendFile(path.join(__dirname, dbPath))
})

app.get('/data', async (_, res) => {
  try {
    const result = await db.all("SELECT * FROM 'Telegram_result_Ui'")
    res.json(result)
  } catch (e) {
    res.sendStatus(500)
  }
})

async function main() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
  await new Promise(resolve => app.listen(port, resolve))
}

main()
  .then(() => console.log(`Started at port ${port}`))
  .catch(console.error)
