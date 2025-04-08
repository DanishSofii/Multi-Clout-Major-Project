/*
  Warnings:

  - A unique constraint covering the columns `[userId,provider]` on the table `DriveAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DriveAccount_userId_provider_key` ON `DriveAccount`(`userId`, `provider`);
