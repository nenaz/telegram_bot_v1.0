import { Scenes, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { SCENE_NAMES } from '../constants.js'
import useStore from '../store.js'

// const { enter, leave } = Scenes.Stage
const { getState } = useStore
dotenv.config()
// const data = {}
const buttons = getState().buttons

export const createPublishScene = new Scenes.BaseScene(SCENE_NAMES.CREATE_PUBLISH)


createPublishScene.leave(async (ctx) => {
    await ctx.reply("Опубликовано!")
})

createPublishScene.enter(async (ctx) => {
    await ctx.reply('Опубликовать?', Markup.inlineKeyboard(
        [
            Markup.button.callback("Опубликовать", "publish"),
            Markup.button.callback("Отмена", "backButtonId"),
        ]
    ))
})

createPublishScene.action('publish', async (ctx) => {
    const state = getState()
    const buttons = getState().buttons

    console.log('ctx.update', ctx.update.callback_query.message.message_id)
    const allBtn = Object.values(buttons).map((button) => button.button)
    if (state.fileId) {
        await ctx.sendPhoto(state.fileId, {
            chat_id: process.env.CHAT_ID,
            caption: state.title,
            text: state.description,
            reply_markup: {
                inline_keyboard: [
                    [
                        // Markup.button.callback("1", "send 1"),
                        // Markup.button.callback("2", "send 2"),
                        // Markup.button.callback("3", "send 3"),
                        // Markup.button.callback('📢', `send ${ctx.update.callback_query.message.message_id}`),
                        ...allBtn,
                    ]
                ]
            },
            callback: () => {
                console.log('callback')
            }
        })
    } else {
        console.log('getState', getState().buttons)
        await ctx.sendMessage(state.description, {
            chat_id: process.env.CHAT_ID,
            reply_markup: {
                inline_keyboard: [
                    [
                        // Markup.button.callback("Пропустить2", "uud2"),
                        // Markup.button.callback("Alert2", "uuid1"),
                        // buttons.rywiiiw1.button,
                        // buttons.rywiiiw2.button,
                        ...allBtn,
                    ]
                ]
            },
        })
        // await ctx.deleteMessage(data.message_id)
    }
    await ctx.scene.leave()
})
// createPublishScene.on('message', (ctx) => {
//     console.log(ctx.message.text)
//     ctx.state.postText = ctx.message.text
//     console.log(ctx.state)
//     ctx.scene.enter(SCENE_NAMES.CREATE_PUBLISH)
// })