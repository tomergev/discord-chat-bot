const { Events, Routes } = require('discord.js')

module.exports = (client, rest, commands) => {
  // TODO: This code causes the "/ask" command to appear twice, but it also prevents a bug which occurs when a bot is first added to a server, but the bots doesnt work...
  client.on(Events.GuildCreate, (guild) => {
    rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guild.id),
      { body: commands },
    )
  })
}