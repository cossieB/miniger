import { sqliteTable, integer, text, numeric, blob, primaryKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const sqlxMigrations = sqliteTable("_sqlx_migrations", {
	version: integer().primaryKey(),
	description: text().notNull(),
	installedOn: numeric("installed_on").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	success: numeric().notNull(),
	checksum: blob().notNull(),
	executionTime: integer("execution_time").notNull(),
});

export const actor = sqliteTable("actor", {
	actorId: integer("actor_id").primaryKey().notNull(),
	name: text().notNull(),
	dob: text(),
	nationality: text(),
	gender: text(),
	image: text(),
});

export const studio = sqliteTable("studio", {
	studioId: integer("studio_id").primaryKey().notNull(),
	name: text().notNull(),
	website: text(),
});

export const film = sqliteTable("film", {
	filmId: integer("film_id").primaryKey().notNull(),
	path: text().notNull(),
	title: text().notNull(),
	studioId: integer("studio_id").references(() => studio.studioId, { onDelete: "set null" } ),
	releaseDate: numeric("release_date"),
	dateAdded: numeric("date_added").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const actorFilm = sqliteTable("actor_film", {
	actorId: integer("actor_id").notNull().references(() => actor.actorId, { onDelete: "cascade" } ),
	filmId: integer("film_id").notNull().references(() => film.filmId, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.actorId, table.filmId], name: "actor_film_actor_id_film_id_pk"})
]);

export const filmTag = sqliteTable("film_tag", {
	filmId: integer("film_id").notNull().references(() => film.filmId, { onDelete: "cascade" } ),
	tag: text().notNull(),
},
(table) => [
	primaryKey({ columns: [table.filmId, table.tag], name: "film_tag_film_id_tag_pk"})
]);

