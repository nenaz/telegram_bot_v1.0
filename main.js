import { Telegraf, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { BOT_EVENT_NAMES, COMMANDS, COMMAND_NAMES, POST_OBJECT } from './constants.js'
import useStore from './store.js'

dotenv.config()
const bot = new Telegraf(process.env.BOT_API_TOKEN)
const { getState, setState } = useStore

let activeStep = 'start'
bot.telegram.setMyCommands(COMMANDS)

bot.command(COMMAND_NAMES.CREATE, async (ctx) => {
    await ctx.reply('Создать пост?', {
        reply_markup: {
            inline_keyboard: [
                [
                    Markup.button.callback('Создать', BOT_EVENT_NAMES.create),
                    Markup.button.callback('Нет', BOT_EVENT_NAMES.cancel),
                ],
            ],
        },
    })
    activeStep = 'setPostTitle'
})

bot.action(BOT_EVENT_NAMES.create, async (ctx) => {
    const uuidPost = uuidv4()
    setState({
        currentUUID: uuidPost,
    })
    setState({
        ...getState(),
        [uuidPost]: POST_OBJECT,
    })
    await ctx.reply('Введите название поста.')
})
bot.action(BOT_EVENT_NAMES.cancel, (ctx) => {
    console.log('Cancel', ctx.update.callback_query.message.message_id)
    ctx.deleteMessage(ctx.update.callback_query.message.message_id)
})
bot.action(BOT_EVENT_NAMES.skip, (ctx) => {
    activeStep = 'postCreateButton'
    
    ctx.reply('Добавить кнопки к посту?', {
        reply_markup: {
            inline_keyboard: [
                [
                    Markup.button.callback('Добавить', BOT_EVENT_NAMES.addButton),
                    Markup.button.callback('Продолжить', BOT_EVENT_NAMES.next),
                ]
            ]
        }
    })
})
bot.action(BOT_EVENT_NAMES.next, async (ctx) => {
    activeStep = 'publication'
    await ctx.reply('Опубликовать?', Markup.inlineKeyboard(
        [
            Markup.button.callback('Опубликовать', BOT_EVENT_NAMES.publication),
            Markup.button.callback('Предпросмотр', BOT_EVENT_NAMES.preview),
            Markup.button.callback('Cбросить публикацию', BOT_EVENT_NAMES.reset),
        ]
    ))
})
bot.action(BOT_EVENT_NAMES.addButton, (ctx) => {
    activeStep = 'setBtnCaption'
    ctx.reply('Введите заголовок кнопки')
})
bot.action(BOT_EVENT_NAMES.createPostBtn, async (ctx) => {
    activeStep = 'createPostBtn'
    const currentUUID = getState().currentUUID
    const state = getState()[currentUUID]
    console.log('state', state)
    const buttonCaption = state.buttonCaption
    const buttonText = state.buttonText
    const uuid = uuidv4()
    setState({
        [currentUUID]: {
            ...state,
            buttons: {
                ...state.buttons,
                [uuid]: {
                    button: Markup.button.callback(buttonCaption, `send ${uuid}`),
                    callbackText: buttonText,
                },
            },
        },
    })
    await ctx.reply('Кнопка создана и будет добавлена к посту')
    await ctx.reply('Добавить кнопки к посту?', {
        reply_markup: {
            inline_keyboard: [
                [
                    Markup.button.callback('Добавить', BOT_EVENT_NAMES.addButton),
                    Markup.button.callback('Продолжить', BOT_EVENT_NAMES.next),
                ]
            ]
        }
    })
})
bot.action(BOT_EVENT_NAMES.publication, async (ctx) => {
    const currentUUID = getState().currentUUID
    const state = getState()[currentUUID]
    const buttons = state.buttons
    const allBtn = Object.values(buttons).map((button) => button.button)
    if (state.fileId) {
        await ctx.sendPhoto(state.fileId, {
            chat_id: process.env.CHAT_ID,
            caption: state.description,
            text: state.description,
            reply_markup: {
                inline_keyboard: [
                    [
                        ...allBtn,
                    ]
                ]
            }
        })
    } else if (buttons.length > 0) {
        await ctx.sendMessage(state.description, {
            chat_id: process.env.CHAT_ID,
            reply_markup: {
                inline_keyboard: [
                    [
                        ...allBtn,
                    ]
                ]
            },
        })
    } else {
        await ctx.sendMessage(state.description, {
            chat_id: process.env.CHAT_ID,
            reply_markup: {
                inline_keyboard: [
                    []
                ]
            },
        })
    }
    await ctx.reply('Публикация успешна')
})
bot.action(BOT_EVENT_NAMES.reset, (ctx) => {
    console.log('reset')
    const state = getState()
    state.buttons = []
    state.title = ''
    state.description = ''
    state.fileId = ''
    state.buttonCaption = ''
    state.buttonText = ''
})
bot.action(BOT_EVENT_NAMES.preview, async (ctx) => {
    console.log('preview')
    const currentUUID = getState().currentUUID
    const state = getState()[currentUUID]
    console.log('state', state)
    console.log('state', state.buttons)
    const buttons = state.buttons
    const allBtn = Object.values(buttons).map((button) => button.button)
    if (state.fileId) {
        ctx.replyWithPhoto(state.fileId, {
            caption: state.description,
            text: state.description,
            reply_markup: {
                inline_keyboard: [
                    [
                        ...allBtn,
                    ]
                ]
            }
        })
    } else if (buttons.length > 0) {
        await ctx.reply(state.description, {
            reply_markup: {
                inline_keyboard: [
                    [
                        ...allBtn,
                    ]
                ]
            },
        })
    } else {
        await ctx.reply(state.description, {
            reply_markup: {
                inline_keyboard: [
                    [
                    ]
                ]
            },
        })
    }
    await ctx.reply('Опубликовать?', Markup.inlineKeyboard(
        [
            Markup.button.callback('Опубликовать', BOT_EVENT_NAMES.publication),
            Markup.button.callback('Cбросить публикацию', BOT_EVENT_NAMES.reset),
        ]
    ))
})

bot.action(/send (.+)/, async (ctx,next) => {
    let msgID = ctx.match[1]
    const currentUUID = getState().currentUUID
    const state = getState()[currentUUID]
    const buttons = state?.buttons
    if (buttons && buttons[msgID]) {
        await ctx.answerCbQuery(buttons[msgID]?.callbackText, {show_alert: true,})
    }
})

bot.on('text', (ctx) => {
    const currentUUID = getState().currentUUID
    if (activeStep === 'setPostTitle') {
        setState({ 
            [currentUUID]: {
                ...getState()[currentUUID],
                title: ctx.message.text,
            },
        })
        ctx.reply('Введете текст поста')
        activeStep = 'setPostText'
    } else if (activeStep === 'setPostText') {
        setState({
            [currentUUID]: {
                ...getState()[currentUUID],
                description: ctx.message.text,
            },
        })
        ctx.reply('Добавте картинку', {
            reply_markup: {
                inline_keyboard: [
                    [
                        Markup.button.callback('Пропустить', BOT_EVENT_NAMES.skip)
                    ]
                ]
            }
        })
        activeStep = 'setPostPhoto'
    } else if (activeStep === 'setBtnCaption') {
        setState({ 
            [currentUUID]: {
                ...getState()[currentUUID],
                buttonCaption: ctx.message.text,
            },
        })
        ctx.reply('Введите текст который будет показан при нажатии')
        activeStep = 'setBtnText'
    } else if (activeStep === 'setBtnText') {
        setState({ 
            [currentUUID]: {
                ...getState()[currentUUID],
                buttonText: ctx.message.text,
            },
        })
        ctx.reply('Создать кнопку', {
            reply_markup: {
                inline_keyboard: [
                    [
                        Markup.button.callback('Добавить', BOT_EVENT_NAMES.createPostBtn),
                    ]
                ]
            }
        })
    }
})
bot.on('photo', (ctx) => {
    console.log('ctx', ctx.update.message)
    const currentUUID = getState().currentUUID
    setState({ 
        [currentUUID]: {
            ...getState()[currentUUID],
            fileId: ctx.update.message.photo[0].file_id,
        },
    })
    activeStep = 'setPostButtons'

    ctx.reply('Добавить кнопки к посту?', {
        reply_markup: {
            inline_keyboard: [
                [
                    Markup.button.callback('Добавить', BOT_EVENT_NAMES.addButton),
                    Markup.button.callback('Продолжить', BOT_EVENT_NAMES.next),
                ]
            ]
        }
    })
})

bot.launch()
