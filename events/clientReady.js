const { Events, Routes } = require('discord.js')

module.exports = (client, rest, commands) => {
  client.once(Events.ClientReady, ({ guilds, user } = {}) => {
    console.log(`Ready! Logged in as ${user.tag}`)
    guilds.cache.forEach((guild) => {
      rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guild.id),
        { body: commands },
      )
    })
  })
}