export type MovieData = {
    tags: any;
    actors: any;
    rowId: string;
    isOnDb: boolean;
    metadata: {
        streams: ({
            codec_name: string;
            codec_type: "video";
            width: number;
            height: number;
        } | {
            codec_name: string;
            codec_type: "audio";
            width: null;
            height: null;
        })[];
        format: {
            duration: string;
            size: string;
            bit_rate: string;
        };
    } | null;
    title: string;
    releaseDate: string | null;
    path: string;
    dateAdded: string;
    filmId: number;
    studioId: number | null;
    studioName: string | null;
}[]

export type MovieTableData = NonNullable<MovieData>[number]