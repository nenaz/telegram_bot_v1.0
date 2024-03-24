import { Markup } from "telegraf"
import { getMainKeyboard, getBackKeyboard } from "./utils/keyboards.js"
import { SCENE_NAMES } from "./constants.js"

const SCENE_ACTIONS = {
    CREATE: 'create',
    CANCEL: 'cancel',
}

export const showMenu = (bot, chatId) => {
    // const mainKeyboard = getMainKeyboard()
    // const backKeyboard = getBackKeyboard()
    bot.telegram.sendMessage(chatId, 'Создать?', Markup.inlineKeyboard(
        [
            Markup.button.callback("Создать", SCENE_ACTIONS.CREATE),
            Markup.button.callback("Back", SCENE_ACTIONS.CANCEL),
        ]
    ))
    bot.action(SCENE_ACTIONS.CREATE, (ctx) => {
        ctx.scene.enter(SCENE_NAMES.CREATE_START)
        ctx.deleteMessage(ctx.update.callback_query.message.message_id)
    })
    bot.action(SCENE_ACTIONS.CANCEL, (ctx) => {
        ctx.deleteMessage(ctx.update.callback_query.message.message_id)
    })
}

export const closeMenu = () => {
    bot.telegram.sendMessage(chatId, 'Close keyboard', {
        reply_markup: {
            remove_keyboard: true,
        },
    })
}
