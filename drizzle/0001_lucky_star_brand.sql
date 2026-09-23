CREATE TABLE `goalProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`date` timestamp NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`currentValue` int NOT NULL DEFAULT 0,
	`targetValue` int NOT NULL DEFAULT 1,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goalProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `goalProgress_goal_date_unique` UNIQUE(`goalId`,`date`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('Career','Education','Fitness','Health','Coding','Finance','Personal Growth','Creativity','Other') NOT NULL DEFAULT 'Personal Growth',
	`type` enum('completion','numeric','time','habit') NOT NULL DEFAULT 'completion',
	`targetValue` int NOT NULL DEFAULT 1,
	`unit` varchar(50),
	`frequency` enum('daily','weekly','weekdays') NOT NULL DEFAULT 'daily',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`startDate` timestamp,
	`durationDays` int NOT NULL DEFAULT 90,
	`isArchived` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementKey` varchar(64) NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `userAchievements_user_key_unique` UNIQUE(`userId`,`achievementKey`)
);
--> statement-breakpoint
CREATE TABLE `weeklyReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`weekNumber` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`overallPercent` int NOT NULL DEFAULT 0,
	`summaryText` text,
	`recommendationsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `weeklyReviews_user_challenge_week_unique` UNIQUE(`userId`,`challengeId`,`weekNumber`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `goalProgress` ADD CONSTRAINT `goalProgress_goalId_goals_id_fk` FOREIGN KEY (`goalId`) REFERENCES `goals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `goalProgress` ADD CONSTRAINT `goalProgress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `goalProgress` ADD CONSTRAINT `goalProgress_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `goals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `goals` ADD CONSTRAINT `goals_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAchievements` ADD CONSTRAINT `userAchievements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weeklyReviews` ADD CONSTRAINT `weeklyReviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weeklyReviews` ADD CONSTRAINT `weeklyReviews_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `goalProgress_user_date_idx` ON `goalProgress` (`userId`,`date`);--> statement-breakpoint
CREATE INDEX `goalProgress_challenge_date_idx` ON `goalProgress` (`challengeId`,`date`);--> statement-breakpoint
CREATE INDEX `goals_user_challenge_idx` ON `goals` (`userId`,`challengeId`);--> statement-breakpoint
CREATE INDEX `goals_user_archived_idx` ON `goals` (`userId`,`isArchived`);