-- Ensure game_stats table exists and has proper indexes for high scores
-- The table already exists, but let's add indexes for better performance

-- Add index for faster score queries
CREATE INDEX IF NOT EXISTS idx_game_stats_score_desc ON game_stats (game_type, score DESC);

-- Add index for user queries
CREATE INDEX IF NOT EXISTS idx_game_stats_user_game ON game_stats (user_id, game_type);

-- Insert some sample high scores for testing
INSERT INTO game_stats (user_id, game_type, score, games_played, games_won, created_at)
VALUES 
  ('anonymous', 'galactic-vanguard', 15000, 1, 0, NOW()),
  ('anonymous', 'galactic-vanguard', 12500, 1, 0, NOW()),
  ('anonymous', 'galactic-vanguard', 10000, 1, 0, NOW()),
  ('anonymous', 'galactic-vanguard', 8500, 1, 0, NOW()),
  ('anonymous', 'galactic-vanguard', 7000, 1, 0, NOW())
ON CONFLICT DO NOTHING;
