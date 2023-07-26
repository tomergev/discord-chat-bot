const { SlashCommandBuilder } = require('discord.js')
const get = require('lodash.get')
const { generateResponse } = require('../openai')

const splitReplyEvery2000Chars = (reply) => {
  const arr = []
  for (let index = 0; index < reply.length; index += 2000) {
    arr.push(reply.slice(index, index + 2000))
  }
  return arr
}

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
      // TODO: Create a button that allows users to copy the message
      const { data } = await generateResponse(prompt) || {}
      const reply = get(data, 'choices.0.message.content', '')
      if (reply.length <= 2000) return interaction.editReply(reply)
      
      const replies = splitReplyEvery2000Chars(reply)
      for (const [index, replyChunk] of replies.entries()) {
        if (index === 0) await interaction.editReply(replyChunk)
        else await interaction.followUp({ content: replyChunk, ephemeral: true })
      }
    },
}