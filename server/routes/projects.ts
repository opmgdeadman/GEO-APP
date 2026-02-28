import { Router } from 'express';
import db from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all projects for user
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC');
    const projects = stmt.all(req.user!.id);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create new project
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name required' });

  try {
    const stmt = db.prepare('INSERT INTO projects (user_id, name) VALUES (?, ?)');
    const info = stmt.run(req.user!.id, name);
    res.json({ id: info.lastInsertRowid, name, user_id: req.user!.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get analyses for a project
router.get('/:projectId/analyses', authenticateToken, (req: AuthRequest, res) => {
  try {
    // Verify ownership
    const projectStmt = db.prepare('SELECT user_id FROM projects WHERE id = ?');
    const project = projectStmt.get(req.params.projectId) as any;
    
    if (!project || project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stmt = db.prepare('SELECT * FROM analyses WHERE project_id = ? ORDER BY created_at DESC');
    const analyses = stmt.all(req.params.projectId);
    
    // Parse JSON fields
    const parsedAnalyses = analyses.map((a: any) => ({
      ...a,
      weaknesses: JSON.parse(a.weaknesses),
      strengths: JSON.parse(a.strengths),
      suggestions: JSON.parse(a.suggestions)
    }));

    res.json(parsedAnalyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

export default router;
