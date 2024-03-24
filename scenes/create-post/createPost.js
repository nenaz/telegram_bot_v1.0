import { Scenes, Composer, Markup } from 'telegraf'
import useStore from '../../store.js'

const { getState } = useStore

const setTitle = new Composer()
const setDescription = new Composer()
const setImage = new Composer()
const publish = new Composer()
const final = new Composer()

setTitle.command('create_post', async (ctx) => {
    await ctx.reply('Введите название поста')
})
setTitle.on('text', async (ctx) => {
    ctx.wizard.state.title = ctx.message.text
    await ctx.reply('Введите текст поста')
    return ctx.wizard.next()
    // return ctx.wizard.steps[ctx.wizard.cursor](ctx)
})

// setDescription.on('text', ctx => ctx.reply(ctx.message.text))
setDescription.on('text', async (ctx) => {
    ctx.wizard.state.text = ctx.message.text
    await ctx.reply('Загрузить изображение', Markup.inlineKeyboard([
        [
            Markup.button.callback("Пропустить", "next"),
        ]
    ]))
    return await ctx.wizard.next()
})
setDescription.action('next', async (ctx) => {
    await ctx.wizard.next()
})

setImage.on('message', async (ctx) => {
    ctx.wizard.state.fileId = ctx.update.message.photo[0].file_id
    await ctx.reply('Опубликовать?', Markup.inlineKeyboard(
        [
            Markup.button.callback("Опубликовать", "publish"),
            Markup.button.callback("Отмена", "cancel"),
        ]
    ))
    await ctx.wizard.next()
})

publish.action('publish', async (ctx) => {
    const buttons = getState().buttons
    const allBtn = Object.values(buttons).map((button) => button.button)
    console.log('ctx.wizard.fileId', ctx.wizard.fileId)
    if (ctx.wizard.fileId) {
        await ctx.sendPhoto(state.fileId, {
            chat_id: process.env.CHAT_ID,
            caption: ctx.wizard.title,
            text: ctx.wizard.text,
            reply_markup: {
                inline_keyboard: [
                    [
                        ...allBtn,
                    ]
                ]
            }
        })
        ctx.scene.leave()
    } else {
        await ctx.sendMessage(ctx.wizard.text, {
            chat_id: process.env.CHAT_ID,
            reply_markup: {
                inline_keyboard: [
                    [
                        ...allBtn,
                    ]
                ]
            },
        })
        // ctx.scene.leave()
    }
})
setImage.action('cancel', (ctx) => {
    ctx.scene.leave()
})

export const postScene = new Scenes.WizardScene('create-post', setTitle, setDescription, setImage, publish, final)