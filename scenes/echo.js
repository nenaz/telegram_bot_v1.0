import { Scenes, Markup } from 'telegraf'
import { COMMAND_NAMES } from '../constants.js'
import { getBackKeyboard } from '../utils/keyboards.js'

const { enter, leave } = Scenes.Stage

// Echo scene
export const echoScene = new Scenes.BaseScene(COMMAND_NAMES.ECHO)
echoScene.enter(async (ctx) => {
    // await ctx.reply('Вторая сцена "Эхо"', Markup.inlineKeyboard([
    //     Markup.button.callback('Назад', 'goToGreeterScene'),
    // ]).oneTime())
    // console.log('ctx', ctx)
    const backKeyboard = getBackKeyboard()
    await ctx.reply('Вторая сцена "Эхо"', backKeyboard.oneTime())
})
echoScene.leave(ctx => ctx.reply("exiting echo scene"))
echoScene.command("back", leave())
echoScene.action('backButtonId', (ctx) => {
    console.log('ctx', ctx)
    ctx.scene.enter(COMMAND_NAMES.GREETER)
})
