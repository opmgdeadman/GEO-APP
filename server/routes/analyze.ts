import { Router } from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { calculateScores } from '../services/scoring';
import { getGeminiAnalysis, rewriteContent } from '../services/gemini';

const router = Router();

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const { projectId, content, topic } = req.body;
  
  if (!content || !topic || !projectId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify project ownership
    const projectStmt = db.prepare('SELECT user_id FROM projects WHERE id = ?');
    const project = projectStmt.get(projectId) as any;
    
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 1. Deterministic Scoring
    const scores = calculateScores(content, topic);

    // 2. AI Analysis (Strengths/Weaknesses)
    const aiAnalysis = await getGeminiAnalysis(content, topic);

    // 3. Save to DB
    const insertStmt = db.prepare(`
      INSERT INTO analyses (
        project_id, input_text, geo_score, entity_score, structure_score, 
        citation_score, clarity_score, formatting_score, 
        weaknesses, strengths, suggestions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = insertStmt.run(
      projectId,
      content,
      scores.geo_score,
      scores.entity_score,
      scores.structure_score,
      scores.citation_score,
      scores.clarity_score,
      scores.formatting_score,
      JSON.stringify(aiAnalysis.weaknesses),
      JSON.stringify(aiAnalysis.strengths),
      JSON.stringify(aiAnalysis.suggestions)
    );

    res.json({
      id: info.lastInsertRowid,
      ...scores,
      ...aiAnalysis
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.post('/rewrite', authenticateToken, async (req: AuthRequest, res) => {
  const { content, topic, suggestions } = req.body;
  
  if (!content || !topic) {
    return res.status(400).json({ error: 'Content and topic required' });
  }

  try {
    const rewritten = await rewriteContent(content, topic, suggestions || []);
    res.json({ rewritten });
  } catch (error) {
    res.status(500).json({ error: 'Rewrite failed' });
  }
});

export default router;
