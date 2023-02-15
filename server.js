require('dotenv').config()

const { CashuMint, CashuWallet, getEncodedProofs } = require("@gandlaf21/cashu-ts")
const { Faucet, utils } = require ("@gandlaf21/cashu-tools")
const rateLimit = require('express-rate-limit')
const cors = require('cors');

const express = require('express')
const app = express()
const port = process.env.PORT

let faucet

const limiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(limiter)
app.use(cors());

app.get('/', (req, res) => {
    let responseString ="Token has already been claimed! waiting for next token..."
    if(faucet.currentToken.length>0){
         responseString = 
        getEncodedProofs(faucet.currentToken ,[{url:process.env.MINT_URL, keysets: [...new Set(faucet.currentToken.map(t=>t.id))]}])
    }
  res.send({token: responseString})
})

app.get('/balance', async (req, res) => {
  res.send({remaining: utils.getAmountForTokenSet(faucet.balance)})
})

app.get('/charge', async (req, res) => {
    const token = req.query.token
    const message  = await faucet.charge(token)
    console.log("all Tokens: ", getEncodedProofs(faucet.balance ,[{url:process.env.MINT_URL, keysets: [...new Set(faucet.currentToken.map(t=>t.id))]}]))
    res.send({message})
  })

app.listen(port, async () => {
    const cashuMint = new CashuMint(process.env.MINT_URL)
    const keys  = await cashuMint.getKeys()
    const cashuWallet = new CashuWallet(keys, cashuMint)
    faucet = new Faucet(cashuWallet, process.env.FAUCET_INTERVAL, process.env.SATS_PER_INTERVAL)
    await faucet.start()
    console.log(`Example app listening on port ${port}`)
})

