-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('CONNECTED', 'NO_ANSWER', 'BUSY', 'CALL_BACK', 'INTERESTED', 'DEMO', 'NOT_INTERESTED', 'WRONG_NUMBER');

-- AlterTable
ALTER TABLE "lead_histories" ADD COLUMN     "callOutcome" "CallOutcome";
