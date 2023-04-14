require('dotenv').config()

const { getEncodedToken } = require("@cashu/cashu-ts")
const { Faucet, utils } = require("@gandlaf21/cashu-tools")
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
      getEncodedToken(faucet.currentToken)
  }
  res.send({ token: responseString })
})

app.get('/balance', async (req, res) => {
  res.send({
    remaining: utils.getAmountForTokenSet(faucet.allTokens?.token?.map(t => t.proofs)?.flat() ?? []),
    mintCount: faucet.wallets.length
  })
})

app.get('/charge', async (req, res) => {
  const token = req.query.token
  let message = 'charging faucet failed'
  try {
    message = await faucet.charge(token)
  } catch (error) {
    message = message + ': ' + error
  }
  res.send({ message })
})

function writeTokensToFile() {
  try {
    const data = JSON.stringify({
      tokens: faucet.allTokens
    }
    )
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

app.listen(port, () => {
  const whitelist = getWhitelist()
  faucet = new Faucet(process.env.FAUCET_INTERVAL, process.env.SATS_PER_INTERVAL, whitelist)
  faucet.start()
  setInterval(writeTokensToFile, 10000)
  console.log(`Faucet listening on port ${port}`)
})

function getWhitelist() {
  if (!process.env.MINT_WHITELIST) {
    return []
  }
  return process.env.MINT_WHITELIST.split(",");
}