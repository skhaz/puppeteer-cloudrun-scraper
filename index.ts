import express from 'express'

const app = express()

app.get('/', async (request, response) => {
  response.send('Hello World!')
})

app.listen(process.env.PORT, () => {
  process.on('SIGINT', async () => {
    process.exit()
  })
})
