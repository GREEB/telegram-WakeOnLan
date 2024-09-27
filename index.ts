import { Telegraf, Markup, Format } from 'telegraf'
import dotenv from 'dotenv';
import path from 'path';
import { wol } from './wol';
import fs from 'fs'
import ping from 'ping'

interface deviceData{ 
    name: string,
    mac: string,
    ip: string
}

dotenv.config({ path: path.join(__dirname, '.env') });

const bot = new Telegraf(process.env.BOT_TOKEN as string)
const devices: deviceData[] = JSON.parse(fs.readFileSync('devices.json', 'utf-8'))

const helpText = `
    *List of commands*
    \\- [/help](/help) this command
    \\- [/id](/id) get chat id
    \\- [/wake](/wake) wake up a device
    \\- [/status](/status) ping a device
    `
bot.command('id',(ctx) => {

    ctx.replyWithMarkdownV2('this chat has the id: `' + ctx.chat.id + '` add this id to \\.env `AUTHED_CHAT`' )
})

bot.command('help',(ctx) => {
    ctx.replyWithMarkdownV2(helpText)
})

bot.command('wake', (ctx) => {
    if (process.env.AUTHED_CHAT?.length === 0){
        ctx.replyWithMarkdownV2('No `AUTHED_CHAT` id set get this chat id by typing `/id`')
        return;
    }
    if (process.env.AUTHED_CHAT as string !== String(ctx.chat.id)){
        ctx.replyWithMarkdownV2('Not Authed chat')
        return;
    }
    const deviceButtons = devices.map((deviceName, i) =>
        Markup.button.callback(deviceName.name + " " + deviceName.mac, `wake:${i}`)
    );
    ctx.reply(
        'Choose a device to wake up:',
        Markup.inlineKeyboard(deviceButtons, { columns: 2 })
    ); 
})

bot.command('status', (ctx) => {
    if (process.env.AUTHED_CHAT?.length === 0){
        ctx.replyWithMarkdownV2('No `AUTHED_CHAT` id set get this chat id by typing `/id`')
        return;
    }
    if (process.env.AUTHED_CHAT as string !== String(ctx.chat.id)){
        ctx.replyWithMarkdownV2('Not Authed chat')
        return;
    }
    const deviceButtons = Object.values(devices).map((deviceName, i) =>
        Markup.button.callback(deviceName.name, `status:${i}`)
    );
    ctx.reply(
        'Choose a device to ping:',
        Markup.inlineKeyboard(deviceButtons, { columns: 2 })
    ); 
})

bot.on('callback_query', async (ctx:any) => {
    const [command, deviceId] = ctx.update.callback_query.data.split(':');
    if (command === "wake"){
        if (deviceId) {
            const device = devices[deviceId]
            const macAddress = device.mac;
            try {
                wol(macAddress);
                await ctx.reply(`${device.name} is waking up!`);
            } catch (error:any) {
                await ctx.reply(`Failed to wake up ${device.name}. Error: ${error.message}`);
            }
        } else {
            await ctx.reply(`Unknown device selected.`);
        }
        await ctx.answerCbQuery();
    }
    if (command === "status"){
        const device = devices[deviceId]
        const status = await pingHost(device.ip)
        await ctx.reply(`${device.name} is ${status ? "up" : "down"}`);
        await ctx.answerCbQuery();
    }
});

const pingHost = (host: string) =>{
    return new Promise((resolve, reject)=>{
        ping.sys.probe(host, function(isAlive:boolean | null){
            resolve(isAlive)
        });
    })
}

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))