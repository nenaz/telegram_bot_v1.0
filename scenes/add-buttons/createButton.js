import { Scenes, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { SCENE_NAMES } from '../../constants.js'
import useStore from '../../store.js'

const SCENE_ACTIONS = {
    ADD_BTN: 'addBtn',
    ADD_CANCEL: 'addCancel',
}

// const { leave } = Scenes.Stage
const { setState, getState, addButtons } = useStore
let btnCaption = ''
// const uuid = uuidv4()
// let uuid = ''

export const createBtnScene = new Scenes.BaseScene(SCENE_NAMES.CREATE_BTN)
export const createBtnCallbackTextScene = new Scenes.BaseScene(SCENE_NAMES.CREATE_CALLBACK_TEXT)

createBtnScene.enter(async (ctx) => {
    await ctx.reply('Add btn?', Markup.inlineKeyboard([
            [
                Markup.button.callback('Add', SCENE_ACTIONS.ADD_BTN),
                Markup.button.callback('Cancel', SCENE_ACTIONS.ADD_CANCEL),
            ]
        ])
    )
})

createBtnScene.leave(async (ctx) => {
    // await ctx.reply("exiting scene")
})

createBtnScene.action(SCENE_ACTIONS.ADD_CANCEL, async (ctx) => {
    await ctx.deleteMessage(ctx.update.callback_query.message.message_id)
    // await ctx.scene.leave()
})
createBtnScene.action(SCENE_ACTIONS.ADD_BTN, async (ctx, next) => {
    await ctx.reply('Ведите название кнопки')
    await next()
})

createBtnScene.on('message', async (ctx, next) => {
    btnCaption = ctx.message.text
    await ctx.scene.enter(SCENE_NAMES.CREATE_CALLBACK_TEXT)
    await next()
})

createBtnCallbackTextScene.enter(async (ctx, next) => {
    await ctx.reply('Ведите тект, который покажется при нажатии кнопки')
    await next()
})

// createBtnCallbackTextScene.on('text', (ctx) => {
//     console.log('ctx', ctx)
// })

createBtnCallbackTextScene.on('text', async (ctx) => {
    console.log('ctx.message.text', ctx.update.message.text)
    const uuid = uuidv4()
    setState({
        buttons: {
            ...getState().buttons,
            [uuid]: {
                button: Markup.button.callback(btnCaption, `send ${uuid}`),
                callbackText: ctx.update.message.text,
            },
        },
    })
    console.log('getState', getState())
    // await ctx.telegram.action('uuid', ())
    await ctx.scene.leave()
})
// createBtnCallbackTextScene.action(uuid, async (ctx) => {
//     await ctx.answerCbQuery(btnCaption, {
//         callback_query_id: ctx.update.callback_query.id,
//         text: btnCaption,
//         show_alert: true,
//     })
// })

createBtnCallbackTextScene.leave(async (ctx) => {
    await ctx.reply("Кнопка добавлена")
    // console.log('getState', getState())
})
