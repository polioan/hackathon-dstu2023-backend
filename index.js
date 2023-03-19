'use strict'

const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const formidable = require('formidable')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { uploadPath, port, dbPath } = require('./config')

const app = express()

app.use(cors())

app.use(
  fileUpload({
    limits: { fileSize: 1024 * 1024 * 1024 },
  })
)

app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'dist')))

let db

app.post('/', (req, res) => {
  if (req.files) {
    const files = Array.isArray(req.files.upload)
      ? req.files.upload
      : [req.files.upload]
    for (const file of files) {
      file.mv(path.join(uploadPath, file.name))
    }
  }

  res.sendFile(path.join(__dirname, 'admin.html'))
})

app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'))
})

app.get('/drop_files', async (_, res) => {
  try {
    for (const file of await fs.promises.readdir(uploadPath)) {
      try {
        await fs.promises.unlink(path.join(uploadPath, file))
      } catch {}
    }
  } catch (e) {
    res.sendStatus(500)
  }
  res.sendFile(path.join(__dirname, 'admin.html'))
})

app.get('/db', (_, res) => {
  res.sendFile(path.join(__dirname, dbPath))
})

app.get('/data', async (_, res) => {
  try {
    const tables = await db.all(
      "select name from sqlite_master where type='table'"
    )
    const uitables = tables
      .filter(v => v?.name?.toLowerCase().endsWith('ui'))
      .map(v => v.name)
    const result = await db.all(`SELECT * FROM '${uitables.at(-1)}'`)
    res.json(result)
  } catch {
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
