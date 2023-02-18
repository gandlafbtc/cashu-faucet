require('dotenv').config()

const { getEncodedProofs } = require("@gandlaf21/cashu-ts")
const { AnarchoFaucet, utils } = require("@gandlaf21/cashu-tools")
const rateLimit = require('express-rate-limit')
const cors = require('cors');
const fs = require('fs')

const express = require('express')
const app = express()
const port = process.env.PORT

let faucet

const limiter = rateLimit({
  windowMs: process.env.REQUEST_TIMEOUT_INTERVAL, // 15 seconds
  max: process.env.REQUEST_TIMEOUT_MAX, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(limiter)
app.use(cors());

app.get('/', (req, res) => {
  let responseString = "Token has already been claimed! waiting for next token..."
  if (faucet.currentToken) {
    responseString =
      getEncodedProofs(faucet.currentToken.proofs, faucet.currentToken.mints)
  }
  res.send({ token: responseString })
})

app.get('/balance', async (req, res) => {
  res.send({
    remaining: utils.getAmountForTokenSet(faucet.balance),
    mintCount: faucet.wallets.length
  })
})

app.get('/charge', async (req, res) => {
  const token = req.query.token
  const message = await faucet.charge(token)
  res.send({ message })
})

app.listen(port, async () => {
  faucet = new AnarchoFaucet(process.env.FAUCET_INTERVAL, process.env.SATS_PER_INTERVAL)
  await faucet.start()
  setInterval(writeTokensToFile, 10000)
  console.log(`Example app listening on port ${port}`)
})



function writeTokensToFile() {
  try {
    const data = JSON.stringify({tokens: faucet.balance, mints: faucet.wallets.map(w=> { return {mint: w.mint.mintUrl, keysets: w.keysets}})})
    fs.writeFile('tokens.json', data, err => {
      if (err) {
        throw err
      }
      console.log('saved tokens to file.')
    })
  } catch (error) {
    console.log(error)
  }
}