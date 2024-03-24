import { Scenes } from 'telegraf'
import { getBackKeyboard, getMainKeyboard } from '../utils/keyboards.js'

const Scene = Scenes.BaseScene
const { leave } = Scenes.Stage
export const settings = new Scene('settings')

settings.enter(async (ctx) => {
    const { backKeyboard } = getBackKeyboard()
    await ctx.reply('settings.wait_to_change', backKeyboard)
})

settings.leave(async (ctx) => {
    const { mainKeyboard } = getMainKeyboard()
    await ctx.reply('settings.wait_next', mainKeyboard)
    await ctx.scene.leave()
})

settings.hears('Back', leave())
settings.action('backButtonId', console.log('text'))

