/*
  Warnings:

  - Added the required column `volumeId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE `Volume` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `size` BIGINT NOT NULL,
    `used` BIGINT NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Volume_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create default volume for existing files
INSERT INTO `Volume` (`id`, `name`, `size`, `used`, `userId`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as id,
    'Default Volume' as name,
    1099511627776 as size, -- 1TB
    COALESCE(SUM(size), 0) as used,
    userId,
    NOW() as createdAt,
    NOW() as updatedAt
FROM `File`
GROUP BY userId;

-- AlterTable
ALTER TABLE `File` ADD COLUMN `volumeId` VARCHAR(191);

-- Update existing files to use default volume
UPDATE `File` f
JOIN `Volume` v ON f.userId = v.userId
SET f.volumeId = v.id
WHERE f.volumeId IS NULL;

-- Make volumeId required
ALTER TABLE `File` MODIFY COLUMN `volumeId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `File_volumeId_idx` ON `File`(`volumeId`);

-- AddForeignKey
ALTER TABLE `Volume` ADD CONSTRAINT `Volume_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_volumeId_fkey` FOREIGN KEY (`volumeId`) REFERENCES `Volume`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
