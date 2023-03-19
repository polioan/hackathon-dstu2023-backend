'use strict'

const path = require('node:path')

module.exports = {
  uploadPath: path.join(__dirname, 'uploads'),
  port: 3333,
  dbPath: 'database.db',
}
