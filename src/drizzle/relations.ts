import { relations } from "drizzle-orm/relations";
import { studio, film, actorFilm, actor, filmTag } from "./schema";

export const filmRelations = relations(film, ({one, many}) => ({
	studio: one(studio, {
		fields: [film.studioId],
		references: [studio.studioId]
	}),
	actorFilms: many(actorFilm),
	filmTags: many(filmTag),
}));

export const studioRelations = relations(studio, ({many}) => ({
	films: many(film),
}));

export const actorFilmRelations = relations(actorFilm, ({one}) => ({
	film: one(film, {
		fields: [actorFilm.filmId],
		references: [film.filmId]
	}),
	actor: one(actor, {
		fields: [actorFilm.actorId],
		references: [actor.actorId]
	}),
}));

export const actorRelations = relations(actor, ({many}) => ({
	actorFilms: many(actorFilm),
}));

export const filmTagRelations = relations(filmTag, ({one}) => ({
	film: one(film, {
		fields: [filmTag.filmId],
		references: [film.filmId]
	}),
}));