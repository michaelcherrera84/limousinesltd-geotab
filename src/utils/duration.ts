/**
 * Converts a duration from seconds to a formatted string in HH:MM format.
 *
 * @param {number} totalSeconds - The duration in seconds to be formatted. Must be a non-negative number.
 * @return {string} A string representing the duration in HH:MM format, with each unit zero-padded to two digits.
 */
export function formatDuration(totalSeconds: number): string {
    totalSeconds = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours.toString().padStart(2, '0')}:` + `${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats a duration string by splitting it into hours and minutes,
 * and returning the components in "hours:minutes" format.
 *
 * @param {string} duration - The duration string in "HH:MM" format.
 * @return {string} The formatted duration string.
 */
export function formatDurationString(duration: string): string {
    const [hours, minutes] = duration.split(':');
    return `${hours}:${minutes}`;
}

/**
 * Parses a duration string in the format "HH:MM:SS" and converts it to the total number of seconds.
 *
 * @param {string} duration - A string representing the duration, formatted as "HH:MM:SS".
 * @return {number} The total duration in seconds.
 */
export function parseDuration(duration?: string): number {
    if (!duration) return 0;
    const [hours = '0', minutes = '0', seconds = '0'] = duration.split(':');

    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

/**
 * Sums up an array of duration strings and returns the total duration as a formatted string.
 *
 * @param {Array<string | undefined>} durations - An array of duration strings or undefined values.
 * Each string represents a duration in a specific format (e.g., "HH:MM:SS").
 * @return {string} - The total duration formatted as a string.
 */
export function sumDurations(durations: (string | undefined)[]): string {
    const totalSeconds = durations.reduce((sum, duration) => sum + parseDuration(duration), 0);
    return formatDuration(totalSeconds);
}

/**
 * Adds multiple duration strings together and returns the total duration as a formatted string.
 *
 * @param {Array<string | undefined>} durations - An array of duration strings in a supported format or undefined.
 * @return {string} A formatted string representing the total combined duration.
 */
export function addDurations(...durations: (string | undefined)[]): string {
    const totalSeconds = durations.reduce((sum, duration) => sum + parseDuration(duration), 0);
    return formatDuration(totalSeconds);
}
