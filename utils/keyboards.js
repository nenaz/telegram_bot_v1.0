import { Markup } from 'telegraf'

export const getMainKeyboard = () => {
    let mainKeyboard = Markup.inlineKeyboard([
        // ["Create"]
        Markup.button.callback("Create", "backButtonId2"),
    ])
    mainKeyboard = mainKeyboard.oneTime()

    return mainKeyboard
}

export const getBackKeyboard = () => {
    let backKeyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback("Back", "backButtonId"),
        ]
    ])

    backKeyboard = backKeyboard.oneTime()

    return backKeyboard
}
