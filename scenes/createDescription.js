import { Scenes } from 'telegraf'
import { SCENE_NAMES } from '../constants.js'
import useStore from '../store.js'

const { enter, leave } = Scenes.Stage
const { setState } = useStore

// const data = {}

export const createDescriptionScene = new Scenes.BaseScene(SCENE_NAMES.CREATE_DESCRIPTION)

createDescriptionScene.leave((ctx) => {
    // console.log('ctx', ctx.update)
    // ctx.deleteMessage(ctx.update.callback_query.message.message_id)
})

createDescriptionScene.enter(async (ctx) => {
    await ctx.reply('Введите тест поста')
})

createDescriptionScene.on('message', async (ctx) => {
    // console.log(ctx.message.text)
    // ctx.state.postText = ctx.message.text
    // ctx.state.postTitle = data.postTitle
    setState({ description: ctx.message.text })
    // await ctx.scene.leave()
    await ctx.scene.enter(SCENE_NAMES.CREATE_IMAGE)
})