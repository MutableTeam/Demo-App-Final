-- Create dedicated table for Galactic Vanguard high scores
CREATE TABLE IF NOT EXISTS galactic_vanguard_highscores (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  wave INTEGER NOT NULL DEFAULT 1,
  play_duration INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance on leaderboard queries
CREATE INDEX IF NOT EXISTS idx_galactic_vanguard_score_desc ON galactic_vanguard_highscores (score DESC);

-- Insert sample high scores for testing
INSERT INTO galactic_vanguard_highscores (player_name, score, wave, play_duration)
VALUES 
  ('Space Ace', 15000, 8, 420),
  ('Star Fighter', 12500, 6, 380),
  ('Galaxy Hero', 10000, 5, 320),
  ('Cosmic Pilot', 8500, 4, 280),
  ('Void Runner', 7000, 3, 240)
ON CONFLICT DO NOTHING;
