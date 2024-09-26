import { Telegraf, Markup, Format } from 'telegraf'
import dotenv from 'dotenv';
import path from 'path';
import { wol } from './wol';
import * as devicesJson from './devices.json';
dotenv.config({ path: path.join(__dirname, '.env') });

const bot = new Telegraf(process.env.BOT_TOKEN as string)

const devices:{ [key: string]: string } = devicesJson[0]

const helpText = `
    *List of commands*
    \\- [/help](/help) this command
    \\- [/id](/id) get chat id
    \\- [/wake](/wake) wake up a device
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
    const deviceButtons = Object.keys(devices).map((deviceName) =>
        Markup.button.callback(deviceName, deviceName)
    );
    ctx.reply(
        'Choose a device to wake up:',
        Markup.inlineKeyboard(deviceButtons, { columns: 2 })
    ); 
})

bot.on('callback_query', async (ctx:any) => {
    const deviceName = ctx.callbackQuery?.data;
    if (deviceName && devices[deviceName]) {
        const macAddress = devices[deviceName];
        try {
            wol(macAddress);
            await ctx.reply(`${deviceName} is waking up!`);
        } catch (error:any) {
            await ctx.reply(`Failed to wake up ${deviceName}. Error: ${error.message}`);
        }
    } else {
        await ctx.reply(`Unknown device selected.`);
    }
    await ctx.answerCbQuery();
});


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))