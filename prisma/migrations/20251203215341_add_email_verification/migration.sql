-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verificationToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_verificationToken_key` ON `user`(`verificationToken`);

