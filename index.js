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

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN_SECRET)

const chatGptCommand = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('What would you like to know?')
    .addStringOption((option) => (
      option.setName('prompt')
        .setDescription('What would you like to know?')
        .setRequired(true)
    )),
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true })
      const prompt = interaction.options.getString('prompt')
      const { data } = await generateResponse(`${prompt}. The response must be less than 2000 characters`) || {}
      const reply = get(data, 'choices.0.message.content')
      interaction.editReply(reply)
    },
}

client.login(process.env.DISCORD_TOKEN_SECRET)
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
  // const guilds = c?.guilds?.cache || []
  // guilds.forEach((guild) => {
  //   rest.put(
  //     Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guild.id),
  //     { body: [chatGptCommand.data] },
  //   )
  // })
})

client.commands = new Collection()
client.commands.set(chatGptCommand.data.name, chatGptCommand)

rest.put(
  Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
  { body: [chatGptCommand.data] },
)


client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction?.client?.commands?.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
})

// TODO: When a bot is authorized on a new guild while the app is running. The /ask command is being registered, it comes up as an option on the new sever, guild
// But, the /ask command doesnt work.... ??? 

// client.on(Events.GuildCreate, (guild) => {
//   console.log(guild.id, guild)
//   rest.put(
//     Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guild.id),
//     { body: [chatGptCommand.data] },
//   )
// })

client.on(Events.Error, (err) => {
  console.error(err)
})
