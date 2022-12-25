var shell = require('shelljs')
const fs = require("fs")
const Discord = require("discord.js")
const VDiscord = require('@discordjs/voice')
const player = VDiscord.createAudioPlayer({behaviors: {noSubscriber: VDiscord.NoSubscriberBehavior.Pause}})
const client = new Discord.Client({
	intents: [
		//yetkiler
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildVoiceStates,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent
	]
})
var loop = false
const json = require("./config.json")
const prefixregex = json.prefix.replace("$", "\\\$")
const translate_help = `\`\`\`
translate [--help] TRANSLATING_LANGUAGE TRANSLATED_LANGUAGE TRANSLATING_TEXT
    --help        shows this help message

TRANSLATING_LANGUAGE:
    language that you write to translate, e.g. turkish

TRANSLATED_LANGUAGE:
    language that you want to get, e.g. english

TRANSLATING_TEXT:
    the text that you want to translated, e.g. "Merhaba, Ben on dört yaşındayım."

example for command:
    $ translate tr en "Merhaba, Ben on dört yaşındayım."
    > "Hello, I am fourteen years old."
\`\`\``

async function translate(lang1, lang2, text) {
	const res = await fetch("https://translate.terraprint.co/translate", {
		method: "POST",
		body: JSON.stringify({
			q: text,
			source: lang1,
			target: lang2,
			format: "text",
			api_key: ""
		}),
		headers: { "Content-Type": "application/json" }
	})
	return res.json()
}

function error(err,msg) {
	try {
		msg.reply(`Error while downloading sound:\`\`\`\n${"" + err}\n\`\`\``)
	} catch {
		console.log(`Error while downloading sound:\n${"" + err}\n`)
	}
}

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", async (msg) => {
	if (msg.author.bot && msg.author.id != 1051276127760556135) return

	if (RegExp(prefixregex).test(msg.content) && !msg.author.bot) {
		var argv = msg.content.replace(RegExp('^' + prefixregex), '')
		var args = argv.split(' ')
		const tmp = args.indexOf('')
		if (tmp > -1) args.splice(tmp, 1)
		switch (args[0]) {
			case "translate":
				if (args[3] == undefined) { //yep, actually there is no --help lol 
					msg.reply(translate_help)
					break
				}
				try {
					var translated = await translate(args[1], args[2], argv.replace(RegExp('^' + args[0]), '').replace(' ' + args[1], '').replace(' ' + args[2], '').replace(/^ /, ''))
					msg.reply(translated.translatedText)
				} catch (err) {
					console.log(`\`\`\`${err}\`\`\``)
				} finally {
					break
				}
			case "echo":
				if (args[1] != undefined) {
					msg.reply(argv.replace(RegExp('^' + args[0]), ''))
				}
				break
			case "ram":
				if (args[1] != undefined) {
					msg.delete()
					msg.channel.send(argv.replace(RegExp('^' + args[0]), ''))
				}
				break
			case "neofetch":
				msg.reply(`\`\`\`\n${shell.exec("neofetch --stdout --color_blocks off", { silent: true }).stdout}\n\`\`\``)
				break
			case "where":
				msg.reply("idk, I forgor :skull:")
				break
			case "whoami":
				msg.reply(`${msg.author.username}`)
				break
			case "play":
				if (!msg.member.voice.channel) {
					msg.reply("you aren't in any voice channel!")
					break
				}
				shell.exec("rm -v tmp.*",{silent: true})
				download = undefined; resource = undefined; stream = undefined
				const connection = VDiscord.joinVoiceChannel({ channelId: msg.member.voice.channel.id, guildId: msg.member.voice.channel.guild.id, adapterCreator: msg.member.voice.channel.guild.voiceAdapterCreator })
				if (args[1]) {
					if (args[1].startsWith("https://")) {
						 if (args[1].includes("youtube.com/") || args[1].includes("youtu.be/")) {
							msg.reply("sorry, for discord rules, we can't get mp3 from youtube :c\nbut you can use Invidious or piped!")
							break
						}
						msg.reply(`<#${msg.member.voice.channel.id}>: playing "${shell.exec(`yt-dlp ${args[1]} --print title`,{silent: true}).stdout.replace('\n','')}"`)
						shell.exec(`yt-dlp ${args[1]} --output tmp.opus -x --audio-format opus`, {silent: true}) //.stdout.replace('\n','')
						resource = VDiscord.createAudioResource(fs.createReadStream("tmp.opus"))
						do {
							connection.subscribe(player)
							player.play(resource)
						} while (loop)
						break
					} msg.reply("you should give url or file, not string!")
					break
				} else {
					flag = true
					msg.attachments.forEach(file => {
						if (file.contentType == "audio/mpeg" ||
						file.contentType == "video/mp4") {
							flag = false
							msg.reply(`<#${msg.member.voice.channel.id}>: playing "${file.name}"`)
							shell.exec(`yt-dlp ${file.url} --output tmp.opus -x`, { silent: true })
							resource = VDiscord.createAudioResource(fs.createReadStream("tmp.opus"))
							do {
								connection.subscribe(player)
								player.play(resource)
							} while (loop)
						}
					})
					if (flag) msg.reply("you should give url or file!")
					break
				}
			/*case "loop":
				if (loop) {loop = false ; msg.reply("loop inactive") }
				else { loop = true ; msg.reply("loop active!") }
				break*/
			default:
				msg.channel.send(`discord-shell: ${args[0]}: command not found`)
				break
		}
	} else {
		switch (msg.content.toLowerCase()) {
			case "<@1051276127760556135>" || "<@!1051276127760556135>":
				msg.channel.send(`\`${json.prefix}<command>\``)
				break
			default:
				//console.log(msg.author.id)
				break
		}

		if (msg.author.id != 482321074483101716) {
			if (msg.content.toLowerCase().includes("fuck")) {
				msg.reply("AYO WTH DUDE, CALM DOWN")
			} if (msg.content.toLowerCase().includes("nigga") || msg.content.toLowerCase().includes("negro")) {
				msg.reply("WTH DUDE, DON'T BE RACIST!")
			}
		}
	}
})

client.login(json.token)
