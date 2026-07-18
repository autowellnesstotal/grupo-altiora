-- AlterTable
ALTER TABLE "twoFactor" ADD COLUMN     "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor"("secret");
