const { Events } = require('discord.js')

module.exports = (client) => {
  client.on(Events.Error, (err) => {
    console.error(err)
  })
}