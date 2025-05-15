import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { row, columns } = req.body
  if (!row || !columns) {
    return res.status(400).json({ error: 'Missing row or columns' })
  }

  const prompt = `
Given this row of data:
${JSON.stringify(row, null, 2)}
And these are the destination table columns:
${JSON.stringify(columns)}
Return a new object that maps as much relevant data as possible from the row to the destination columns. If a column cannot be filled, leave it out or set it to null.
Return only the object as JSON.`

  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2', // Change to your Ollama model name if needed
        prompt,
        stream: false
      })
    })
    const data = await ollamaResponse.json()
    // Try to parse the model's response as JSON
    try {
      return res.status(200).json(JSON.parse(data.response))
    } catch {
      // fallback: try to extract JSON from the response string
      const match = data.response.match(/\{[\s\S]*\}/)
      if (match) {
        return res.status(200).json(JSON.parse(match[0]))
      }
      return res.status(500).json({ error: 'Failed to parse Ollama response', raw: data.response })
    }
  } catch (e) {
    return res.status(500).json({ error: 'Ollama call failed', details: (e as Error).message })
  }
} 