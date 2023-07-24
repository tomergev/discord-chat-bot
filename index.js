require('dotenv').config()

const { 
  Client, 
  Collection,
  Events, 
  GatewayIntentBits,
  REST, 
  Routes, 
  SlashCommandBuilder,
} = require('discord.js')
const get = require('lodash.get')
const { generateResponse } = require('./openai')
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits

try {
  const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] })
  
  client.login(process.env.DISCORD_TOKEN_SECRET)
  client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
  })
  
  const chatGptCommand = {
    data: new SlashCommandBuilder()
      .setName('ask')
      .setDescription('What would you like to know?')
      .addStringOption((option) => (
        option.setName('prompt')
          .setDescription('What would you like to ask me?')
          .setRequired(true)
      )),
      async execute(interaction) {
        try {
          await interaction.deferReply({ ephemeral: true })
          const prompt = interaction.options.getString('prompt')
          const { data } = await generateResponse(`${prompt}. The response must be less than 2000 characters`) || {}
          const reply = get(data, 'choices.0.message.content')
          interaction.editReply(reply)
        } catch (err) {
          // console.error(err)
        }
      },
  }

  client.commands = new Collection()
  client.commands.set(chatGptCommand.data.name, chatGptCommand)
  
  const rest = new REST().setToken(process.env.DISCORD_TOKEN_SECRET)
  const guildId = '1131699017898803391'
  rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guildId),
    { body: [chatGptCommand.data] },
  )

  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) return
  
    const command = interaction.client.commands.get(interaction.commandName)
  
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }
  
    command.execute(interaction)
  })

} catch (err) {
  // console.error(err)
}