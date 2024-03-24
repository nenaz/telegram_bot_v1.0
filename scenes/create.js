import { Scenes, Markup } from 'telegraf'
import { SCENE_NAMES } from '../constants.js'
import useStore from '../store.js'

const { enter, leave } = Scenes.Stage
const { setState } = useStore

export const createStartScene = new Scenes.BaseScene(SCENE_NAMES.CREATE_START)


createStartScene.enter(async (ctx) => {
    await ctx.reply('Введите название поста')
})

createStartScene.on('message', async (ctx) => {
    // updateTitle(ctx.message.text)
    // const bears = useStore.use.bears()
    // ctx.state.postTitle = ctx.message.text
    // postStore.updateTitle(ctx.message.text)
    
    setState({ title: ctx.message.text })
    // console.log('useStore.setBears', useStore.setBears)
    // console.log('bears', getState())
    // console.log('getState', getState())
    // console.log(ctx)
    await ctx.scene.enter(SCENE_NAMES.CREATE_DESCRIPTION)
    // await ctx.scene.leave()
})

createStartScene.leave((ctx) => {
    // console.log('ctx', ctx.update)
})