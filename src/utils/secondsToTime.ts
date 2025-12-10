export function secondsToTime(s: number): string {
    const pad = (num: number) => num.toString().padStart(2, "0")

    const totalSeconds = Math.floor(s);

    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    const paddedSeconds = pad(seconds);
    const paddedMinutes = pad(minutes);
    const paddedHours = pad(hours);

    if (days > 0) {
        return `${days}:${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    else if (totalHours > 0) {
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    else {
        return `${paddedMinutes}:${paddedSeconds}`;
    }
}