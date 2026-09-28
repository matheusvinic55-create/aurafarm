export interface QuestProgress { id: string; status: 'active' | 'complete' | 'claimed'; objectives: Record<string, number> }
