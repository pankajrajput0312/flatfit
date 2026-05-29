export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatHeaderDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function getScoreLabel(percentage: number): string {
  if (percentage >= 100) return 'Perfect day';
  if (percentage >= 70) return 'Strong progress';
  if (percentage >= 40) return 'Keep going';
  return 'Just getting started';
}
