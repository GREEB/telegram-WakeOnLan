# Telegram WOL proxy for home server

This is meant to be run on a SBC, this will simply do WOL in your network from telegram

## Setup

1. Copy `example.env` to `.env` and add your bot token [how to obtain bot token](https://core.telegram.org/bots/tutorial).
2. Copy `devices.example.json` to `devices.json` and add your devices macaddr [here how you can find that](https://itssc.rpi.edu/hc/en-us/articles/360001995831-How-to-find-your-MAC-Address-for-MacOS-Linux-Windows)
3. Get chat id by using command `/id`
4. Put chatId into `.env` `AUTHED_CHAT`

## Install

 - to install :`pnpm install`
 - to run deving: `ts-node index.ts`
 - to run forever: use `forever`, `pm2` or any other tools
 
## Features

`/wake` command will show you buttons and you can wake up a server

`/status` command will let you ping an ip

## intended usage

This is good for a Plex setup at home that is sleeping, it may have auto sleep that sleeps the server if disk and network is idle. Telegram is basically used as a proxy to wake it up from a PI or other SBC in your network

## Files

- `index.ts` basically all the code
- `wol.ts` wol code from [ts-wol](https://www.npmjs.com/package/ts-wol)
- `devices.json` an object with key=name and value=macaddr
    - Example: 
```JSON
[
    {
        "name": "pc1",
        "mac": "00:00:00:00:00:00",
        "ip": "192.168.0.1"
    },
    {
        "name": "pc1",
        "mac": "00:00:00:00:00:00",
        "ip": "192.168.0.2"
    }
]
```

## Credit

- [ts-wol](https://www.npmjs.com/package/ts-wol)