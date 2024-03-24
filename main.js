import { Telegraf, Markup, Scenes, session } from 'telegraf'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
// import { createPost } from './CreatePost'
// import { showMenu, closeMenu } from './menu.js'
// import { settings } from './scenes/start.js'
import { BOT_EVENT_NAMES, COMMANDS, COMMAND_NAMES, POST_OBJECT } from './constants.js'
// import { getBackKeyboard } from "./utils/keyboards.js"
// import { showMenu } from './menu.js'
import { greeterScene } from './scenes/greeter.js'
import { echoScene } from "./scenes/echo.js"
import { createStartScene } from './scenes/create.js'
import { createDescriptionScene } from './scenes/createDescription.js'
import { createPublishScene } from './scenes/createPublish.js'
import { createImageScene } from './scenes/createImage.js'
import { createBtnCallbackTextScene, createBtnScene } from './scenes/add-buttons/createButton.js'
import useStore from './store.js'
import { addBtnToPostScene } from './scenes/addBtnToPost.js'
import { postScene } from './scenes/create-post/createPost.js'

dotenv.config()
// const token = '6777534638:AAHkgIIYsjnDiSNxGHakbC0fP9bmC4UealE'
const bot = new Telegraf(process.env.BOT_API_TOKEN)
const { getState, setState } = useStore

const buttons = getState().buttons
const alerts = Object.keys(buttons)
// const postStore = usePostStore()
// const keyboard = new Markup.keyboard()

let activeStep = 'start'

const stage = new Scenes.Stage(
    [
        greeterScene,
        echoScene,
        createStartScene,
        createDescriptionScene,
        createPublishScene,
        createImageScene,
        createBtnScene,
        addBtnToPostScene,
        createBtnCallbackTextScene,
        postScene,
    ], {
        ttl: 10,
    },
);
bot.telegram.setMyCommands(COMMANDS)
bot.use(session())
bot.use(stage.middleware())

bot.command(COMMAND_NAMES.CREATE, async (ctx) => {
    // const chatId = ctx.chat.id
    // showMenu(bot, chatId)
    // await ctx.scene.enter('create-post')
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
    // console.log('Create')
    setState({
        currentUUID: uuidPost,
    })
    setState({
        ...getState(),
        [uuidPost]: POST_OBJECT,
    })
    await ctx.reply('Введите название поста.')
    // console.log('getState', getState())
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
                    // ...allBtn,
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
    // console.log('Create')
    // console.log('state', state)
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
                    [
                        // ...allBtn,
                    ]
                ]
            },
        })
    }
    await ctx.reply('Публикация успешна')
    // state.buttons = []
    // state.title = ''
    // state.description = ''
    // state.fileId = ''
    // state.buttonCaption = ''
    // state.buttonText = ''
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
    // ctx.chat.id
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
                        // ...allBtn,
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
// bot.command(COMMAND_NAMES.START, (ctx) => {
//     ctx.reply('Try /echo or /greeter')
// })
// bot.command(COMMAND_NAMES.GREETER, (ctx) => ctx.scene.enter(COMMAND_NAMES.GREETER))

// bot.command('id', async (context) => {
//     await context.sendMessage('text', { chat_id: -1002044073401 })
// })


// bot.on('message', async (ctx) => {
//     console.log(ctx.update.message.photo[0])
//     // await ctx.replyWithPhoto(ctx.update.message.photo[0].file_id)
//     await ctx.sendPhoto(ctx.update.message.photo[0].file_id, {
//         chat_id: -1002044073401,
//         caption: 'Post title',
//         text: 'post text',
//     })
// })
// const alerts = ['uuid1', 'uud2']
// alerts.map((alert) => {
// //     // console.log(alert)
//     const callbackText = buttons[alert].callbackText
//     bot.action(alert, async (ctx) => {
//         await ctx.answerCbQuery(alert, {
//             callback_query_id: ctx.update.callback_query.id,
//             text: callbackText,
//             show_alert: true,
//         })
//     })
// })
// bot.action('alert1', async (ctx) => {
//     console.log('log1', ctx.match)
//     await ctx.answerCbQuery('alert2', {
//         callback_query_id: ctx.update.callback_query.id,
//         text: ctx.update.callback_query.id,
//         show_alert: true,
//     })
// })
// bot.action('alert2', async (ctx) => {
//     console.log('log2', ctx.match)
//     await ctx.answerCbQuery('alert2', {
//         callback_query_id: ctx.update.callback_query.id,
//         text: ctx.update.callback_query.id,
//         show_alert: true,
//     })
// })
// bot.action('alert3', async (ctx) => {
//     console.log('log3', ctx.match)
//     // await ctx.answerCbQuery('alert3', {
//     //     callback_query_id: ctx.update.callback_query.id,
//     //     text: ctx.update.callback_query.id,
//     //     show_alert: true,
//     // })
//     // await ctx.callbackQuery()
// })
// bot.hears('alert3', async (ctx) => {
//     console.log('hears_log3', ctx.match)
// })

bot.action(/send (.+)/, async (ctx,next) => {
    let msgID = ctx.match[1]
    const currentUUID = getState().currentUUID
    const state = getState()[currentUUID]
    // console.log('ctx.match', ctx.match)
    // console.log('msgID', msgID)
    // console.log(getState().buttons)
    const buttons = state?.buttons
    // ctx.telegram.copyMessage(chatTo,notifyChannel,msgID)
    // return ctx.answerCbQuery('Announcement mad2e!').then(() => next())
    if (buttons && buttons[msgID]) {
        await ctx.answerCbQuery(buttons[msgID]?.callbackText, {show_alert: true,})
    }
})
// bot.handleUpdate()
// bot.telegram.answerCbQuery('alert', 'text2', {
//     show_alert: true,
// })
// bot.on('callback_query', async (ctx) => {
//     await ctx.answerCbQuery(ctx.update.callback_query.id, ctx.update.callback_query.data)
//     // console.log('callback_query', ctx)
// })


// bot.command(COMMAND_NAMES.ADD_BTN, async (ctx, next) => {
//     await ctx.scene.enter(SCENE_NAMES.CREATE_BTN)
//     await next()
// })

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
        // console.log('getState', getState())
    } else if (activeStep === 'setPostText') {
        // console.log('postText')
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
        // console.log('setBtnCaption')
        setState({ 
            [currentUUID]: {
                ...getState()[currentUUID],
                buttonCaption: ctx.message.text,
            },
        })
        ctx.reply('Введите текст который будет показан при нажатии')
        activeStep = 'setBtnText'
    } else if (activeStep === 'setBtnText') {
        // console.log('setBtnText')
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
                        // ...allBtn,
                        // Markup.button.callback('Продолжить', BOT_EVENT_NAMES.next),
                    ]
                ]
            }
        })
    }
})
bot.on('photo', (ctx) => {
    const currentUUID = getState().currentUUID
    setState({ 
        [currentUUID]: {
            ...getState()[currentUUID],
            fileId: ctx.update.message.photo[0].file_id,
        },
    })
    activeStep = 'setPostButtons'

    // const buttons = getState().buttons
    // const allBtn = Object.values(buttons).map((button) => button.button)
    ctx.reply('Добавить кнопки к посту?', {
        reply_markup: {
            inline_keyboard: [
                [
                    Markup.button.callback('Добавить', BOT_EVENT_NAMES.addButton),
                    // ...allBtn,
                    Markup.button.callback('Продолжить', BOT_EVENT_NAMES.next),
                ]
            ]
        }
    })
})
// bot.on('message', (ctx) => ctx.reply(`bot.on.message ${ctx.message.text}`))

bot.launch()















// bot.use(stage.middleware())
// bot.hears('settings', Scenes.Stage.enter('settings'))
// bot.command('start', async (ctx) => {
//     await ctx.reply(
//         'Helllo, press button for Start app',
//         // Markup.inlineKeyboard([
//         //     Markup.button.callback('Create', 'create'),
//         //     Markup.button.callback('Cancel', 'Cancel'),
//         //     // Markup.button.callback('Options 3', 'data 3'),
//         // ])
//     )
// })

// bot.on('message', (ctx) => {
//     const chatId = ctx.chat.id

//     if (ctx.message.text === "create") {
//         showMenu(bot, chatId)
//     } else {
//         closeMenu()
//     }
// })

// bot.action.Markup.callback()

// bot.on('message', async (context) => {
//     // console.log('message', context)
//     const test = await context.sendMessage(context.message.text, "Dee", {
//         chat_id: -1002044073401,
//         // reply_markup: Markup.inlineKeyboard([Markup.button.text("text")])
//         reply_markup: {
//             keyboard: [
//                 ['1'],
//                 ['2'],
//             ],
//         },
//     })
//     console.log('test', test)
// })

// import TelegramBot from "node-telegram-bot-api"

// const token = '6643642697:AAGseOWI7VmKuDno3Hc6OeLDrI0ttsIuuy4'
// const bot = new TelegramBot(token, { polling: true })

// bot.on('message', msg => {
//     const text = msg.text
//     const chatId = msg.chat.id
// })


// bot.launch()