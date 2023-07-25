require('dotenv').config()

const { 
  Client, 
  Collection,
  GatewayIntentBits,
  REST, 
  Routes, 
} = require('discord.js')
const askCommand = require('./commands/ask')
const clientReadyEvent = require('./events/clientReady')
const errorEvent = require('./events/error')
const guildCreateEvent = require('./events/guildCreate')
const interactionCreateEvent = require('./events/interactionCreate')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const commands = [askCommand.data]
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN_SECRET)

client.login(process.env.DISCORD_TOKEN_SECRET)
client.commands = new Collection()
client.commands.set(askCommand.data.name, askCommand)

rest.put(
  Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
  { body: commands },
)

clientReadyEvent(client, rest, commands)
errorEvent(client)
guildCreateEvent(client, rest, commands)
interactionCreateEvent(client)
