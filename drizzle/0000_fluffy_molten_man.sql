CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`leetcodeTarget` int NOT NULL DEFAULT 5,
	`status` enum('active','completed','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`date` timestamp NOT NULL,
	`webDevCompleted` boolean NOT NULL DEFAULT false,
	`gymCompleted` boolean NOT NULL DEFAULT false,
	`leetcodeCount` int NOT NULL DEFAULT 0,
	`studyMinutes` int NOT NULL DEFAULT 0,
	`gymDurationMinutes` int NOT NULL DEFAULT 0,
	`journal` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `dailyProgress_challenge_date_unique` UNIQUE(`challengeId`,`date`)
);
--> statement-breakpoint
CREATE TABLE `gymLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dailyProgressId` int NOT NULL,
	`workoutType` varchar(100),
	`exercises` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gymLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leetcodeProblems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dailyProgressId` int NOT NULL,
	`problemNumber` varchar(32),
	`problemName` varchar(180),
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
	`url` varchar(1024),
	`notes` text,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leetcodeProblems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `webDevLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dailyProgressId` int NOT NULL,
	`topic` varchar(180),
	`project` varchar(180),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webDevLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `challenges` ADD CONSTRAINT `challenges_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dailyProgress` ADD CONSTRAINT `dailyProgress_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gymLogs` ADD CONSTRAINT `gymLogs_dailyProgressId_dailyProgress_id_fk` FOREIGN KEY (`dailyProgressId`) REFERENCES `dailyProgress`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leetcodeProblems` ADD CONSTRAINT `leetcodeProblems_dailyProgressId_dailyProgress_id_fk` FOREIGN KEY (`dailyProgressId`) REFERENCES `dailyProgress`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webDevLogs` ADD CONSTRAINT `webDevLogs_dailyProgressId_dailyProgress_id_fk` FOREIGN KEY (`dailyProgressId`) REFERENCES `dailyProgress`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `challenges_user_status_idx` ON `challenges` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `dailyProgress_challenge_date_idx` ON `dailyProgress` (`challengeId`,`date`);--> statement-breakpoint
CREATE INDEX `gymLogs_daily_idx` ON `gymLogs` (`dailyProgressId`);--> statement-breakpoint
CREATE INDEX `leetcodeProblems_daily_idx` ON `leetcodeProblems` (`dailyProgressId`);--> statement-breakpoint
CREATE INDEX `webDevLogs_daily_idx` ON `webDevLogs` (`dailyProgressId`);