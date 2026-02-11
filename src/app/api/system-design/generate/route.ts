import { NextRequest, NextResponse } from 'next/server'
import { getGeminiAI } from '@/lib/gemini'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'

const SYSTEM_DESIGN_SYSTEM_PROMPT = `You are an expert System Design Architect AI with deep knowledge of:

1. Software Architecture
- Microservices vs Monolithic
- Event-driven architecture
- Service-oriented architecture (SOA)
- Serverless architecture
- Cloud-native patterns
- Distributed systems

2. Database Design
- Relational vs NoSQL
- Database normalization
- Sharding and partitioning
- Caching strategies
- Data replication
- CAP theorem considerations

3. Scalability & Performance
- Horizontal vs vertical scaling
- Load balancing
- CDN integration
- Caching layers (Redis, Memcached)
- Database indexing
- Query optimization

4. Security
- Authentication & authorization
- OAuth 2.0, JWT
- Encryption at rest and in transit
- Rate limiting
- DDoS protection
- Security best practices

5. DevOps & Infrastructure
- CI/CD pipelines
- Containerization (Docker, Kubernetes)
- Infrastructure as Code
- Monitoring and logging
- Disaster recovery
- Backup strategies

6. Industry-Specific Patterns
- E-commerce: Inventory management, payment processing, order systems
- Fintech: Transaction processing, fraud detection, compliance
- Social Media: Real-time updates, graph databases, content delivery
- SaaS: Multi-tenancy, API design, billing systems
- IoT: Message queues, time-series databases, edge computing

Your Task:
Generate a comprehensive system design architecture based on the user's requirements. Provide detailed recommendations covering components, technologies, data flow, and scalability considerations.

System Design Structure:
{
  "name": "System Name",
  "description": "Brief description",
  "overview": "High-level architecture overview",
  "components": [
    {
      "name": "Component Name",
      "type": "frontend" | "backend" | "database" | "cache" | "queue" | "service",
      "description": "Component description",
      "technologies": ["tech1", "tech2"],
      "responsibilities": ["responsibility1", "responsibility2"],
      "scalability": "How it scales"
    }
  ],
  "dataFlow": [
    {
      "from": "Component A",
      "to": "Component B",
      "description": "Data flow description",
      "protocol": "HTTP/REST", "GraphQL", "gRPC", "WebSocket", etc.
    }
  ],
  "database": {
    "primary": {
      "type": "PostgreSQL" | "MySQL" | "MongoDB" | etc.,
      "reasoning": "Why this database",
      "keyCollections": ["collection1", "collection2"]
    },
    "caches": [
      {
        "type": "Redis" | "Memcached" | etc.,
        "purpose": "What it caches"
      }
    ]
  },
  "api": {
    "style": "REST" | "GraphQL" | "gRPC",
    "endpoints": [
      {
        "path": "/api/endpoint",
        "method": "GET" | "POST" | "PUT" | "DELETE",
        "description": "Endpoint description"
      }
    ]
  },
  "security": {
    "authentication": "OAuth 2.0" | "JWT" | "Session-based",
    "authorization": "RBAC" | "ABAC",
    "encryption": "TLS 1.3",
    "considerations": ["security consideration 1", "security consideration 2"]
  },
  "scaling": {
    "strategy": "horizontal" | "vertical" | "hybrid",
    "loadBalancing": "Load balancer approach",
    "caching": "Caching strategy",
    "cdn": "CDN usage"
  },
  "deployment": {
    "platform": "AWS" | "GCP" | "Azure" | "Docker" | "Kubernetes",
    "architecture": "deployment architecture description",
    "ci_cd": "CI/CD approach"
  },
  "monitoring": {
    "metrics": ["metric1", "metric2"],
    "logging": "Logging strategy",
    "alerting": "Alerting approach"
  },
  "considerations": {
    "challenges": ["challenge1", "challenge2"],
    "tradeoffs": ["tradeoff1", "tradeoff2"],
    "futureEnhancements": ["enhancement1", "enhancement2"]
  }
}

Guidelines:
- Provide specific technology recommendations with reasoning
- Consider scalability from the start
- Address security comprehensively
- Include monitoring and observability
- Consider operational concerns
- Address data consistency and availability
- Provide clear data flow diagrams (in text)
- Consider cost implications
- Suggest phased implementation approach

Respond with valid JSON only. No markdown, no explanations.`

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { prompt, scale } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build the user prompt
    let userPrompt = `Generate a comprehensive system design architecture based on these requirements: "${prompt}"`

    if (scale) {
      userPrompt += `\n\nExpected scale: ${scale}. Design the system to handle this scale effectively.`
    }

    userPrompt += `\n\nGenerate a detailed system design covering components, technologies, data flow, databases, APIs, security, scaling, deployment, and monitoring. Provide specific technology recommendations with reasoning. Return ONLY valid JSON.`

    // Use Gemini AI to generate system design
    const gemini = getGeminiAI()
    const aiResponse = await gemini.generateText(userPrompt, SYSTEM_DESIGN_SYSTEM_PROMPT)

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse the AI response
    let designData
    try {
      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()

      designData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response:', aiResponse)
      throw new Error('Failed to parse system design from AI response')
    }

    // Generate a name
    const name = designData.name || 'System Design'

    // Generate unique share slug
    const shareSlug = randomBytes(8).toString('hex').slice(0, 8)

    // Save to database
    const savedDesign = await db.systemDesign.create({
      data: {
        name,
        description: prompt.substring(0, 200),
        prompt,
        userId: user.id,
        designData: JSON.stringify(designData),
        isPublic: false,
        shareSlug
      }
    })

    return NextResponse.json({
      success: true,
      id: savedDesign.id,
      shareSlug: savedDesign.shareSlug,
      name: savedDesign.name,
      designData
    })

  } catch (error) {
    console.error('Error generating system design:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate system design',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
