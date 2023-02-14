# Cashu faucet

A faucet that you can charge up with Cashu tokens and then releases fractions of that token slooowlyyy.

## How to use

Setting up a cashu faucet is a easy 3 step process:

### 1. Configure

Set the values to your liking in the `.env` file:

```properties
# Express server port
PORT=3000
# Cashu mint URL
MINT_URL='https://legend.lnbits.com/cashu/api/v1/4gr9Xcmz3XEkUNwiBiQGoC'
# Min Interval in milliseconds. Only schedules new token after the current token is redeemed 
FAUCET_INTERVAL=10000
# Satoshis per interval. 
SATS_PER_INTERVAL=10
```

### 2. Run
Run this command in the directory:`cashu-faucet`
```bash
node server.js
```

### 3. Charge
Go to your browser, and call the following url. Make sure you provide a valid token:

`https://{your-host}:{port}/charge?token={cashu_token}`

### Done!

The faucet will now start dripping Cashu tokens at `https://{your-host}:{port}/` 

😎 
