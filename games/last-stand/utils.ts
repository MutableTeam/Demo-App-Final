// Format time in seconds to MM:SS format
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Format score with commas
export function formatScore(score: number): string {
  return score.toLocaleString()
}

// Get leaderboard time remaining
export function getLeaderboardTimeRemaining(gameMode: string, currentTime: Date): string {
  // For hourly leaderboards, reset at the top of each hour
  if (gameMode === "hourly") {
    const nextHour = new Date(currentTime)
    nextHour.setHours(nextHour.getHours() + 1)
    nextHour.setMinutes(0)
    nextHour.setSeconds(0)

    const timeRemaining = Math.max(0, (nextHour.getTime() - currentTime.getTime()) / 1000)
    return formatTime(timeRemaining)
  }

  // For daily leaderboards, reset at midnight
  if (gameMode === "daily") {
    const tomorrow = new Date(currentTime)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeRemaining = Math.max(0, (tomorrow.getTime() - currentTime.getTime()) / 1000)
    return formatTime(timeRemaining)
  }

  // For practice mode, no time limit
  return "--:--"
}
