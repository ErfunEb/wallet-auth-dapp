export function parseDurationToSeconds(duration: string): number {
  const regex = /^(\d+)(s|m|h|d)$/i;
  const match = duration.match(regex);

  if (!match) {
    throw new Error(`Invalid duration format: "${duration}"`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported time unit: "${unit}"`);
  }
}
