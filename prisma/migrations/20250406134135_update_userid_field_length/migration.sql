-- DropForeignKey
ALTER TABLE `driveaccount` DROP FOREIGN KEY `DriveAccount_userId_fkey`;

-- AlterTable
ALTER TABLE `driveaccount` MODIFY `userId` VARCHAR(500) NOT NULL;

-- AddForeignKey
ALTER TABLE `DriveAccount` ADD CONSTRAINT `DriveAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
