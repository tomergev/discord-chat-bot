const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
    organization: 'org-LdGf0GJuqZWkSR8buj7OKJCz',
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

// TODO: Rename function
const generateResponse = async (prompt) => {
  return await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'system', 
      content: prompt, 
    }],
  })
}

module.exports = {
  generateResponse
}