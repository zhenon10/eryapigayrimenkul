CREATE TABLE `landing_content` (
	`path` text PRIMARY KEY NOT NULL,
	`intro` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`meta_description` text DEFAULT '' NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `removed_listings` (
	`ref_no` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`type` text NOT NULL,
	`district` text NOT NULL,
	`neighborhood` text DEFAULT '' NOT NULL,
	`removed_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `listings` ADD `published_at` integer;--> statement-breakpoint
UPDATE `listings` SET `published_at` = `created_at` WHERE `is_published` = 1 AND `published_at` IS NULL;
