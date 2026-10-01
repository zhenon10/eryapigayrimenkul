CREATE TABLE `agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`specialty` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`photo_id` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`photo_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agents_slug_unique` ON `agents` (`slug`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`district` text DEFAULT '' NOT NULL,
	`property_type` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`listing_id` integer,
	`state` text DEFAULT 'yeni' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `inquiries_state_idx` ON `inquiries` (`state`,`created_at`);--> statement-breakpoint
CREATE TABLE `listing_images` (
	`listing_id` integer NOT NULL,
	`media_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`listing_id`, `media_id`),
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref_no` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`type` text NOT NULL,
	`district` text NOT NULL,
	`neighborhood` text DEFAULT '' NOT NULL,
	`price` integer NOT NULL,
	`area_gross` integer,
	`area_net` integer,
	`rooms` text DEFAULT '' NOT NULL,
	`bathrooms` integer,
	`floor` text DEFAULT '' NOT NULL,
	`building_age` integer,
	`heating` text DEFAULT '' NOT NULL,
	`deed_status` text DEFAULT '' NOT NULL,
	`zoning` text DEFAULT '' NOT NULL,
	`parcel` text DEFAULT '' NOT NULL,
	`badge` text DEFAULT '' NOT NULL,
	`features` text DEFAULT '[]' NOT NULL,
	`virtual_tour_url` text DEFAULT '' NOT NULL,
	`video_url` text DEFAULT '' NOT NULL,
	`lat` real,
	`lng` real,
	`agent_id` integer,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_ref_no_unique` ON `listings` (`ref_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `listings_slug_unique` ON `listings` (`slug`);--> statement-breakpoint
CREATE INDEX `listings_public_idx` ON `listings` (`is_published`,`status`,`type`,`district`);--> statement-breakpoint
CREATE INDEX `listings_price_idx` ON `listings` (`price`);--> statement-breakpoint
CREATE INDEX `listings_agent_idx` ON `listings` (`agent_id`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_key_unique` ON `media` (`key`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);