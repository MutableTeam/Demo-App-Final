-- Add missing columns to the existing neon_auth.game_stats table
ALTER TABLE neon_auth.game_stats 
ADD COLUMN IF NOT EXISTS player_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS wave INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS play_duration INTEGER DEFAULT 0;

-- Create index for better performance on leaderboard queries
CREATE INDEX IF NOT EXISTS idx_game_stats_score_desc ON neon_auth.game_stats (game_type, score DESC);

-- Insert sample data for testing
INSERT INTO neon_auth.game_stats (user_id, game_type, score, games_played, games_won, player_name, wave, play_duration)
VALUES 
  ('anonymous', 'galactic-vanguard', 15000, 1, 0, 'Space Ace', 8, 420),
  ('anonymous', 'galactic-vanguard', 12500, 1, 0, 'Star Fighter', 6, 380),
  ('anonymous', 'galactic-vanguard', 10000, 1, 0, 'Galaxy Hero', 5, 320),
  ('anonymous', 'galactic-vanguard', 8500, 1, 0, 'Cosmic Pilot', 4, 280),
  ('anonymous', 'galactic-vanguard', 7000, 1, 0, 'Void Runner', 3, 240)
ON CONFLICT DO NOTHING;
