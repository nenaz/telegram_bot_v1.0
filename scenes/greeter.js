import { Scenes, Markup } from 'telegraf'
import { COMMAND_NAMES } from '../constants.js'

const { enter, leave } = Scenes.Stage

// Greeter scene
export const greeterScene = new Scenes.BaseScene(COMMAND_NAMES.GREETER);
// greeterScene.enter(ctx => ctx.reply("Hi"));
greeterScene.enter(async (ctx) => {
    // const { backKeyboard } = getBackKeyboard()
    await ctx.reply('Первая сцена "Приветственная"', Markup.inlineKeyboard([
        // Markup.button.callback('', 'backButtonId1'),
        Markup.button.callback('Вторая сцена', 'goToEchoScene'),
    ]))
})
// greeterScene.leave(ctx => ctx.reply("Bye"))
greeterScene.leave(ctx => ctx.reply("exiting greeter scene"))
greeterScene.hears("hi", enter(COMMAND_NAMES.GREETER));
greeterScene.on("message", ctx => ctx.reply("Send hi"))
// greeterScene.action('backButtonId1', () => { console.log('text') })
greeterScene.action('goToEchoScene', (ctx) => { ctx.scene.enter(COMMAND_NAMES.ECHO) })
greeterScene.action('backButtonId2', (ctx) => { console.log('backButtonId') })
