import z from "zod";

const SearchMovieSchema = z.object({
    id: z.number(),
    title: z.string(),
    release_date: z.iso.date().optional().catch(undefined),
    poster_path: z.string().nullable().optional(),
});

const SearchTvSchema = z.object({
    id: z.number(),
    name: z.string(),
    first_air_date: z.string().optional().catch(undefined),
    poster_path: z.string().nullable().optional(),
});

const SearchPersonSchema = z.object({
    id: z.number(),
    name: z.string(),
    profile_path: z.string().nullable().optional(),
});

const SearchResponse = <T extends z.ZodTypeAny>(schema: T) => z.object({
    page: z.number(),
    results: z.array(schema),
    total_pages: z.number(),
    total_results: z.number(),
});

const TMDBActor = z.object({
    id: z.number(),
    birthday: z.iso.date().optional().catch(undefined),
    gender: z.number().optional(),
    imdb_id: z.string().optional(),
    name: z.string(),
    profile_path: z.string().optional()
});

const TMDBMovie = z.object({
    id: z.number(),
    genres: z.array(z.object({
        name: z.string()
    })).default([]).catch([]),
    title: z.string(),
    release_date: z.iso.date(),
    poster_path: z.string().optional()
});

const TMDBTv = z.object({
    id: z.number(),
    genres: z.array(z.object({
        name: z.string()
    })).default([]).catch([]),
    name: z.string(),
    first_air_date: z.iso.date().optional().catch(undefined),
    poster_path: z.string().optional()
});

const TMDBCredits = z.object({
    cast: z.array(z.object({
        id: z.number(),
        name: z.string(),
        gender: z.number(),
        known_for_department: z.string().optional(),
        profile_path: z.string().nullable().optional() 
    }))
});

export type Actor = z.infer<typeof TMDBActor>;
export type Movie = z.infer<typeof TMDBMovie>;
export type Tv = z.infer<typeof TMDBTv>;

export class TMDBClient {
    constructor(private readonly apiKey: string) {}

    public async search(query: string, type: "movie"): Promise<z.infer<ReturnType<typeof SearchResponse<typeof SearchMovieSchema>>> | null>;
    public async search(query: string, type: "tv"): Promise<z.infer<ReturnType<typeof SearchResponse<typeof SearchTvSchema>>> | null>;
    public async search(query: string, type: "person"): Promise<z.infer<ReturnType<typeof SearchResponse<typeof SearchPersonSchema>>> | null>;
    public async search(
        query: string,
        type: "movie" | "tv" | "person" = "movie"
    ) {
        const baseUrl = `https://api.themoviedb.org/3/search/${type}`;
        const url = new URL(baseUrl);
        url.searchParams.append("query", query);

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: {
                accept: "application/json",
                authorization: `Bearer ${this.apiKey}`
            }
        });

        if (!res.ok) {
            throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        const schema = type === "movie" ? SearchResponse(SearchMovieSchema)
            : type === "tv" ? SearchResponse(SearchTvSchema)
            : SearchResponse(SearchPersonSchema);

        const parsed = schema.safeParse(data);

        if (!parsed.success) {
            console.error(`TMDB Search parsing error for ${type} ("${query}"):`, parsed.error);
            return null;
        }

        return parsed.data;
    }

    public async detail(id: number, type: "movie"): Promise<Movie | null>;
    public async detail(id: number, type: "tv"): Promise<Tv | null>;
    public async detail(id: number, type: "person"): Promise<Actor | null>;
    public async detail(id: number): Promise<Movie | null>;
    public async detail(
        id: number,
        type: "movie" | "tv" | "person" = "movie"
    ) {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}`, {
            method: "GET",
            headers: {
                accept: "application/json",
                authorization: `Bearer ${this.apiKey}`
            }
        });

        if (!res.ok) {
            throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        const schema = type === "movie" ? TMDBMovie
            : type === "tv" ? TMDBTv
            : TMDBActor;

        const parsed = schema.safeParse(data);

        if (!parsed.success) {
            console.error(`TMDB Parsing error for ${type} (${id}):`, parsed.error);
            return null;
        }

        return parsed.data;
    }

    public async movieCredits(id: number) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits`, {
            method: "GET",
            headers: {
                accept: "application/json",
                authorization: `Bearer ${this.apiKey}`
            }
        });

        if (!res.ok) {
            throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const parsed = TMDBCredits.safeParse(data);

        if (!parsed.success) {
            console.error(`TMDB Credits parsing error for movie (${id}):`, parsed.error);
            return [];
        }

        return parsed.data.cast;
    }
}