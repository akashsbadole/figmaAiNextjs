import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

// Initialize Gemini AI
const getGeminiModel = (modelName: string = 'gemini-2.5-flash'): GenerativeModel => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: modelName })
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export class GeminiAI {
  private model: GenerativeModel
  private history: Array<{ role: string; parts: Array<{ text: string }> }> = []

  constructor(modelName: string = 'gemini-2.5-flash') {
    this.model = getGeminiModel(modelName)
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<string> {
    try {
      // Build chat history
      const chatHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))

      // Create chat session
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      })

      // Get the last user message
      const lastUserMessage = messages[messages.length - 1]?.content || ''

      // Add system prompt if provided
      const prompt = systemPrompt
        ? `SYSTEM: ${systemPrompt}\n\nUSER: ${lastUserMessage}`
        : lastUserMessage

      // Generate response
      const result = await chat.sendMessage(prompt)
      const response = result.response
      const text = response.text()

      return text
    } catch (error) {
      console.error('Gemini AI error:', error)
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${prompt}`
        : prompt

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini AI error:', error)

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid or missing Gemini API key. Please check your configuration.')
        }
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw new Error('Gemini API quota exceeded. Please try again later.')
        }
        if (error.message.includes('model') || error.message.includes('not found')) {
          throw new Error('Gemini model not available. Please check the model name.')
        }
      }

      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    try {
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${prompt}\n\nIMPORTANT: Respond with valid JSON only. No markdown code blocks, no explanations.`
        : `${prompt}\n\nIMPORTANT: Respond with valid JSON only. No markdown code blocks, no explanations.`

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      let text = response.text()

      // Clean up response if it contains markdown
      text = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()

      return JSON.parse(text) as T
    } catch (error) {
      console.error('Gemini AI error:', error)
      throw new Error(`Failed to generate JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Singleton instance
let geminiInstance: GeminiAI | null = null

export const getGeminiAI = (modelName?: string): GeminiAI => {
  if (!geminiInstance) {
    geminiInstance = new GeminiAI(modelName)
  }
  return geminiInstance
}

// Reset instance (useful for testing)
export const resetGeminiAI = () => {
  geminiInstance = null
}
