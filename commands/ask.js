const { SlashCommandBuilder } = require('discord.js')
const get = require('lodash.get')
const { generateResponse } = require('../openai')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('What would you like to know?')
    .addStringOption((option) => (
      option.setName('prompt')
        .setDescription("What's your question?")
        .setRequired(true)
    )),
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true })
      const prompt = interaction.options.getString('prompt')
      // TODO: If response is more than 2,000 characters, find a way to make it appear over multiple messages
      // TODO: Create a button that allows users to copy the message
      const { data } = await generateResponse(`${prompt}. The response must be less than 2000 characters`) || {}
      const reply = get(data, 'choices.0.message.content')
      interaction.editReply(reply)
    },
}