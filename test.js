import { Telegraf, Markup, session, Scenes } from "telegraf"

const token = '6777534638:AAHkgIIYsjnDiSNxGHakbC0fP9bmC4UealE'
const bot = new Telegraf(token)
const { enter, leave } = Scenes.Stage

const greeterScene = new Scenes.BaseScene("greeter");
greeterScene.enter(ctx => ctx.reply("Hi"));
greeterScene.leave(ctx => ctx.reply("Bye"));
greeterScene.hears("hi", enter("greeter"));
greeterScene.on("message", ctx => ctx.replyWithMarkdown("Send `hi`"));

const echoScene = new Scenes.BaseScene("echo");
echoScene.enter(ctx => ctx.reply("echo scene"));
echoScene.leave(ctx => ctx.reply("exiting echo scene"));
echoScene.command("back", leave());
echoScene.on("text", ctx => ctx.reply(ctx.message.text));
echoScene.on("message", ctx => ctx.reply("Only text messages please"));

const stage = new Scenes.Stage([greeterScene, echoScene], {
	ttl: 10,
});

bot.use(session());
bot.use(stage.middleware());
bot.command("greeter", ctx => ctx.scene.enter("greeter"));
bot.command("echo", ctx => ctx.scene.enter("echo"));

bot.on("message", ctx => ctx.reply("Try /echo or /greeter"));

bot.launch()
