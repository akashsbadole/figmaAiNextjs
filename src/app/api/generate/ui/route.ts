import { NextRequest, NextResponse } from 'next/server'
import { getGeminiAI } from '@/lib/gemini'
import { auth } from '@clerk/nextjs/server'

// Keep the system prompt focused on JSON CanvasElements
const UI_GENERATION_PROMPT = `You are an expert AI design assistant that generates user interfaces.
Your output must be a valid JSON array of CanvasElement objects, using the following schema:
export type CanvasElementType = 'rectangle' | 'text' | 'image'
export interface CanvasElement {
  id: string; // unique short ID (e.g., 'el-123')
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string; // hex color
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  label?: string; // a readable name like 'Header', 'Submit Button', etc.
  componentType?: string; // semantic type e.g., 'button', 'input', 'card'
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  children?: CanvasElement[]; // nested elements if appropriate
}

Rules for generation:
1. Coordinates should be sensible. Consider the parent container or screen size.
2. Provide good default sizes. e.g. a button might be 120x40.
3. Colors should be harmonious (blue, gray, white, etc) unless otherwise specified.
4. Try to construct complex UI out of simpler rectangles and text elements.
5. You must return ONLY the raw JSON array. Do not wrap in markdown or add explanations.
`

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, image, mode, existingElements } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // mode: 'standard' -> gemini-2.5-flash, 'experimental' -> gemini-2.5-pro
    const modelName = mode === 'experimental' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'
    const gemini = getGeminiAI(modelName)

    let systemPrompt = UI_GENERATION_PROMPT
    if (existingElements && existingElements.length > 0) {
      systemPrompt += `\nExisting canvas context:\n${JSON.stringify(existingElements)}\nIf the prompt asks to modify these, return the updated elements. Otherwise, return the new elements to add or the complete layout.`
    }

    const images = image ? [image] : undefined
    
    // Call our new generateUIJson method
    const result = await gemini.generateUIJson(prompt, images, systemPrompt)

    return NextResponse.json({ elements: result })
  } catch (error) {
    console.error('UI Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error during generation' },
      { status: 500 }
    )
  }
}
