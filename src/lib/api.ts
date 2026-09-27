export async function generateStudyMaterial(topic: string, mode: 'flashcards' | 'summary' | 'mcq' | 'plan'): Promise<string> {
  const response = await fetch('http://localhost:3001/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, mode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate study material from server');
  }

  return data.result;
}

export async function refineStudyMaterial(currentData: any, instruction: string): Promise<string> {
  const response = await fetch('http://localhost:3001/api/refine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentData, instruction }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to refine flashcards from server');
  }

  return data.result;
}
