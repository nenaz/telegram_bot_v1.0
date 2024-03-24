import { Scenes, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { SCENE_NAMES } from '../constants.js'
import useStore from '../store.js'

const SCENE_ACTIONS = {
    ADD_BTN: 'addBtn',
    ADD_CANCEL: 'addCancel',
}

// const { leave } = Scenes.Stage
const { setState, getState } = useStore
const buttons = getState().buttons
const btnArr = [
    Markup.button.callback("Далее", "next")
]

Object.values(buttons).map((item) => {
    btnArr.push(item.button)
});
export const addBtnToPostScene = new Scenes.BaseScene(SCENE_NAMES.ADD_BTN_TO_POST)

addBtnToPostScene.enter(async (ctx) => {
    await ctx.reply('Add btn?', Markup.inlineKeyboard([
            btnArr
        ])
    )
})

// addBtnToPostScene.leave(async (ctx) => {
//     await ctx.reply("exiting scene")
// })

// addBtnToPostScene.action(SCENE_ACTIONS.ADD_CANCEL, (ctx) => {
//     ctx.scene.leave()
// })
// addBtnToPostScene.action(SCENE_ACTIONS.ADD_BTN, async (ctx) => {
//     await ctx.reply('Ведите название кнопки')
// })

// addBtnToPostScene.on('message', (ctx) => {
//     const uuid = uuidv4()
//     console.log('uuid', uuid)
//     setState({
//        [uuid]: Markup.button.callback(ctx.message.text, uuid),
//     })
// })

Object.keys(buttons).map((item) => {
    addBtnToPostScene.action(item, async (ctx) => {
        setState(ctx.callbackQuery.data)
    })
})
