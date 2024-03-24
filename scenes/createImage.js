import { Scenes, Markup } from 'telegraf'
import { SCENE_NAMES } from '../constants.js'
import useStore from '../store.js'

const { enter, leave } = Scenes.Stage
const { setState } = useStore

export const createImageScene = new Scenes.BaseScene(SCENE_NAMES.CREATE_IMAGE)

createImageScene.leave((ctx) => {
    // ctx.deleteMessage(ctx.update.callback_query.message.message_id)
})

createImageScene.enter(async (ctx) => {
    await ctx.reply('Загрузить изображение', Markup.inlineKeyboard([
        [
            Markup.button.callback("Пропустить", "next"),
        ]
    ]))
})
createImageScene.on('message', async (ctx) => {
    setState({ fileId: ctx.update.message.photo[0].file_id })
    await ctx.scene.enter(SCENE_NAMES.CREATE_PUBLISH)
})
createImageScene.action('next', async (ctx) => {
    // await ctx.scene.enter(SCENE_NAMES.ADD_BTN_TO_POST)
    await ctx.scene.enter(SCENE_NAMES.CREATE_PUBLISH)
    // ctx.scene.leave()
})