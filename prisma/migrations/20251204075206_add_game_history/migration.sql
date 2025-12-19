-- CreateTable
CREATE TABLE `game` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `redPlayerId` INTEGER NOT NULL,
    `yellowPlayerId` INTEGER NULL,
    `winner` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'waiting',
    `startedAt` DATETIME(3) NULL,
    `finishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `game_roomId_key`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game` ADD CONSTRAINT `game_redPlayerId_fkey` FOREIGN KEY (`redPlayerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game` ADD CONSTRAINT `game_yellowPlayerId_fkey` FOREIGN KEY (`yellowPlayerId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
