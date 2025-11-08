-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `_sqlx_migrations` (
	`version` integer PRIMARY KEY,
	`description` text NOT NULL,
	`installed_on` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`success` numeric NOT NULL,
	`checksum` blob NOT NULL,
	`execution_time` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `actor` (
	`actor_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`dob` text,
	`nationality` text,
	`gender` text,
	`image` text
);
--> statement-breakpoint
CREATE TABLE `studio` (
	`studio_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`website` text
);
--> statement-breakpoint
CREATE TABLE `film` (
	`film_id` integer PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`title` text NOT NULL,
	`studio_id` integer,
	`release_date` numeric,
	`date_added` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`studio_id`) REFERENCES `studio`(`studio_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `actor_film` (
	`actor_id` integer NOT NULL,
	`film_id` integer NOT NULL,
	PRIMARY KEY(`actor_id`, `film_id`),
	FOREIGN KEY (`film_id`) REFERENCES `film`(`film_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `actor`(`actor_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `film_tag` (
	`film_id` integer NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`film_id`, `tag`),
	FOREIGN KEY (`film_id`) REFERENCES `film`(`film_id`) ON UPDATE no action ON DELETE cascade
);

*/