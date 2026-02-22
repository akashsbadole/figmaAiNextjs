import { NextRequest, NextResponse } from 'next/server'
import { getGeminiAI } from '@/lib/gemini'
import { auth } from '@clerk/nextjs/server'

const CODE_GENERATION_PROMPT = `You are an expert Frontend Developer. 
Your task is to take a JSON array of UI CanvasElements and convert them into clean, accessible, modern React/Tailwind CSS code.
Output your code as a single React functional component string.

Guidelines:
1. Use semantic HTML elements (<button>, <input>, <section>, etc) where appropriate based on the 'componentType' or 'label'.
2. Map the visual properties (fill, cornerRadius, font size, coordinates) into Tailwind CSS utility classes or inline styles if exact matching is needed.
3. Return ONLY the code in your response. No markdown blocks, no explanations.
`

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { elements } = await req.json()

    if (!elements || elements.length === 0) {
      return NextResponse.json({ error: 'Elements are required' }, { status: 400 })
    }

    const gemini = getGeminiAI('gemini-2.5-flash')
    
    const prompt = `Convert the following UI layout elements into a React component with Tailwind CSS:\n${JSON.stringify(elements, null, 2)}`

    let code = await gemini.generateText(prompt, CODE_GENERATION_PROMPT)
    
    // Clean up potential markdown blocks if AI includes them
    code = code.replace(/```(?:tsx|jsx|javascript|typescript|react)?\n?/, '').replace(/```$/s, '').trim()

    return NextResponse.json({ code })
  } catch (error) {
    console.error('Code Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error during generation' },
      { status: 500 }
    )
  }
}
