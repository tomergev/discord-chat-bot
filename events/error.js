const { Events } = require('discord.js')

module.exports = (client) => {
  client.on(Events.Error, (err) => {
    console.log('events/error')
    console.error(err)
  })
}