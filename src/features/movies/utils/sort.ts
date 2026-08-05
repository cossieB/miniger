import type { MovieData } from "~/types";

// Extracted the single item type from your array definition
export type MovieItem = MovieData[number];

export type SortKey =
    | 'title'
    | 'releaseDate'
    | 'path'
    | 'studioName'
    | 'dateAdded'
    | 'duration'
    | 'size'
    | 'bit_rate';

export type SortDirection = 'asc' | 'desc';

export interface SortCriterion {
    key: SortKey;
    direction: SortDirection;
}

/**
 * Extracts and normalizes the value for accurate sorting.
 * Strings are kept as strings, dates are converted to timestamps, 
 * and string-numbers (size, duration) are converted to numbers.
 */
function extractValue(item: MovieItem, key: SortKey): string | number | null {
    switch (key) {
        case 'title':
        case 'path':
        case 'studioName':
        case 'releaseDate':
            return item[key] ?? null;

        case 'dateAdded':
            return item[key] ? new Date(item[key] as string).getTime() : null;

        case 'duration':
        case 'size':
        case 'bit_rate':
            // Access nested metadata safely and convert the string to a number
            const metaValue = item.metadata?.format?.[key];
            return metaValue ? Number(metaValue) : null;

        default:
            return null;
    }
}

/**
 * Sorts an array of MovieData by any combination of keys and directions.
 */
export function sortMovies(movies: MovieData, criteria: SortCriterion[]): MovieData {
    // Create a shallow copy so we don't mutate the original array
    return [...movies].sort((a, b) => {
        for (const { key, direction } of criteria) {
            const valA = extractValue(a, key);
            const valB = extractValue(b, key);

            // If values are identical, move to the next sort criterion
            if (valA === valB) continue;

            // Handle nulls: push nulls to the bottom for ASC, top for DESC
            if (valA === null) return direction === 'asc' ? 1 : -1;
            if (valB === null) return direction === 'asc' ? -1 : 1;

            let comparison = 0;

            if (typeof valA === 'string' && typeof valB === 'string') {
                // Natural sort for strings (e.g., "Movie 2" comes before "Movie 10")
                comparison = valA.localeCompare(valB, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            }

            // If there's a difference, return it based on the requested direction
            if (comparison !== 0) {
                return direction === 'asc' ? comparison : -comparison;
            }
        }

        // If all criteria match exactly, preserve original order
        return 0;
    });
}