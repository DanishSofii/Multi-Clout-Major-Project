-- DropForeignKey
ALTER TABLE `driveaccount` DROP FOREIGN KEY `DriveAccount_userId_fkey`;

-- DropIndex
DROP INDEX `DriveAccount_userId_provider_key` ON `driveaccount`;

-- AddForeignKey
ALTER TABLE `DriveAccount` ADD CONSTRAINT `DriveAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
