/*
  Warnings:

  - You are about to drop the column `driveId` on the `filechunk` table. All the data in the column will be lost.
  - Added the required column `driveAccountId` to the `FileChunk` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `filechunk` DROP FOREIGN KEY `FileChunk_driveId_fkey`;

-- DropForeignKey
ALTER TABLE `filechunk` DROP FOREIGN KEY `FileChunk_fileId_fkey`;

-- DropIndex
DROP INDEX `FileChunk_driveId_idx` ON `filechunk`;

-- AlterTable
ALTER TABLE `filechunk` DROP COLUMN `driveId`,
    ADD COLUMN `driveAccountId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `FileChunk_driveAccountId_idx` ON `FileChunk`(`driveAccountId`);

-- AddForeignKey
ALTER TABLE `FileChunk` ADD CONSTRAINT `FileChunk_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileChunk` ADD CONSTRAINT `FileChunk_driveAccountId_fkey` FOREIGN KEY (`driveAccountId`) REFERENCES `DriveAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Rename driveId to driveAccountId
ALTER TABLE `FileChunk` RENAME COLUMN `driveId` TO `driveAccountId`;

-- Drop the old index
DROP INDEX `FileChunk_driveId_idx` ON `FileChunk`;

-- Create the new index
CREATE INDEX `FileChunk_driveAccountId_idx` ON `FileChunk`(`driveAccountId`);

-- Drop the old foreign key
ALTER TABLE `FileChunk` DROP FOREIGN KEY `FileChunk_driveId_fkey`;

-- Add the new foreign key
ALTER TABLE `FileChunk` ADD CONSTRAINT `FileChunk_driveAccountId_fkey` FOREIGN KEY (`driveAccountId`) REFERENCES `DriveAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update the file relation to include onDelete: Cascade
ALTER TABLE `FileChunk` DROP FOREIGN KEY `FileChunk_fileId_fkey`;
ALTER TABLE `FileChunk` ADD CONSTRAINT `FileChunk_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
