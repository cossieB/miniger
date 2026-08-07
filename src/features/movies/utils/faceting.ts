import type { MovieData } from "~/types";

export type FilterState = {
    studioIds: number[];
    videoCodecs: string[];
    tags: string[];
    actorIds: number[];
};

export type FacetResults = {
    studios: { id: number; name: string; count: number }[];
    videoCodecs: { id: string; count: number }[];
    tags: { id: string; count: number }[];
    actors: { id: number; name: string; count: number }[];
};

// Extracted for brevity
type MovieItem = MovieData[number];

/**
 * Helper to safely extract video codecs from a movie's metadata
 */
function getVideoCodecs(movie: MovieItem): string[] {
    if (!movie.metadata?.streams) return [];
    return movie.metadata.streams
        .filter((stream) => stream.codec_type === "video")
        .map((stream) => stream.codec_name);
}

/**
 * 3. Analyzes an array of movies and generates the facet counts for the UI
 */
export function generateFacets(movies: MovieData): FacetResults {
    const studiosMap = new Map<number, { name: string; count: number }>();
    const codecsMap = new Map<string, number>();
    const tagsMap = new Map<string, number>();
    const actorsMap = new Map<number, { name: string; count: number }>();

    for (const movie of movies) {
        // Tally Studios
        if (movie.studioId !== null) {
            const existing = studiosMap.get(movie.studioId);
            if (existing) {
                existing.count++;
            } 
            else {
                studiosMap.set(movie.studioId, { name: movie.studioName || "Unknown", count: 1 });
            }
        }

        // Tally Codecs
        const movieCodecs = getVideoCodecs(movie);
        for (const codec of movieCodecs) {
            codecsMap.set(codec, (codecsMap.get(codec) || 0) + 1);
        }

        // Tally Tags
        for (const tag of movie.tags) {
            tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
        }

        // Tally Actors
        for (const actor of movie.actors) {
            const existing = actorsMap.get(actor.actorId);
            if (existing) {
                existing.count++;
            } else {
                actorsMap.set(actor.actorId, { name: actor.name, count: 1 });
            }
        }
    }

    // Convert maps to sorted arrays for UI rendering
    return {
        studios: Array.from(studiosMap.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count), // Sort largest count first

        videoCodecs: Array.from(codecsMap.entries())
            .map(([codec, count]) => ({ id: codec, count }))
            .sort((a, b) => b.count - a.count),

        tags: Array.from(tagsMap.entries())
            .map(([tag, count]) => ({ id: tag, count }))
            .sort((a, b) => b.count - a.count),

        actors: Array.from(actorsMap.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count),
    };
}

/**
 * 4. The wrapper function you will call when a user clicks a filter.
 * It returns both the filtered data and the updated facet counts.
 */
export function applyFacetedSearch(movies: MovieData, activeFilters: Partial<FilterState>) {
    const filteredMovies = filterMovies(movies, activeFilters);
    const updatedFacets = generateFacets(filteredMovies);

    return {
        results: filteredMovies,
        facets: updatedFacets
    };
}

export function filterMovies(movies: MovieData, filters: Partial<FilterState>): MovieData {
    return movies.filter((movie) => {

        // Studio check (AND logic)
        // All selected studio IDs must equal the movie's single studioId.
        // If >1 studio is selected, this will always fail.
        if (filters.studioIds && filters.studioIds.length > 0) {
            if (!filters.studioIds.every((id) => movie.studioId === id)) {
                return false;
            }
        }

        // Video Codec check (AND logic)
        // The movie must contain ALL of the selected video codecs.
        if (filters.videoCodecs && filters.videoCodecs.length > 0) {
            const codecs = getVideoCodecs(movie);
            if (!filters.videoCodecs.every((c) => codecs.includes(c))) {
                return false;
            }
        }

        // Tags check (AND logic)
        // The movie must have ALL of the selected tags.
        if (filters.tags && filters.tags.length > 0) {
            if (!filters.tags.every((t) => movie.tags.includes(t))) {
                return false;
            }
        }

        // Actors check (AND logic)
        // The movie must feature ALL of the selected actors.
        if (filters.actorIds && filters.actorIds.length > 0) {
            if (!filters.actorIds.every((id) => movie.actors.some((a) => a.actorId === id))) {
                return false;
            }
        }

        // Passes all active filters
        return true;
    });
}