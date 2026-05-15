require('dotenv').config()


const TelegramApi = require('node-telegram-bot-api')
const { addLead } = require('./sheets')

const token = process.env.BOT_TOKEN

const bot = new TelegramApi(token, { polling: true })

const awaitingLeadId = {}

bot.setMyCommands([
    { command: '/start', description: 'Початок роботи' },
    { command: '/lead', description: 'Додати ID ліда в таблицю' },
])

bot.on('message', async (msg) => {
    const text = msg.text
    const chatId = msg.chat.id
    const firstName = msg.from.first_name || ''

    try {
        if (text === '/start') {
            return bot.sendMessage(
                chatId,
                `Привіт, ${firstName}!\nВикористовуй /lead щоб додати ID ліда в таблицю.`
            )
        }

        if (text === '/lead') {
            awaitingLeadId[chatId] = true
            return bot.sendMessage(chatId, 'Введіть ID ліда:')
        }

        if (awaitingLeadId[chatId]) {
            awaitingLeadId[chatId] = false
            const leadId = text.trim()
            await addLead(leadId)
            return bot.sendMessage(chatId, `Збережено! ID ліда: ${leadId}`)
        }

        return bot.sendMessage(chatId, 'Я тебе не розумію. Спробуй /lead')
    } catch (e) {
        console.error(e)
        awaitingLeadId[chatId] = false
        return bot.sendMessage(chatId, 'Помилка при збереженні. Спробуй ще раз.')
    }
})