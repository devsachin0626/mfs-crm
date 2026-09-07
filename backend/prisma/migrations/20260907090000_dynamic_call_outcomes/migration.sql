ALTER TABLE "lead_histories"
ALTER COLUMN "callOutcome" TYPE TEXT
USING "callOutcome"::TEXT;

DROP TYPE IF EXISTS "CallOutcome";

CREATE TABLE "call_outcomes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#2563eb',
    "leadStatusId" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "marksLeadLost" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "call_outcomes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "call_outcomes_code_key" ON "call_outcomes"("code");
CREATE UNIQUE INDEX "call_outcomes_name_key" ON "call_outcomes"("name");
CREATE INDEX "call_outcomes_leadStatusId_idx" ON "call_outcomes"("leadStatusId");

ALTER TABLE "call_outcomes"
ADD CONSTRAINT "call_outcomes_leadStatusId_fkey"
FOREIGN KEY ("leadStatusId") REFERENCES "lead_statuses"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "call_outcomes"
    ("id", "code", "name", "description", "color", "requiresFollowUp", "marksLeadLost", "sortOrder", "isActive", "isSystem")
VALUES
    ('system-connected', 'CONNECTED', 'Connected', 'Customer answered the call', '#16a34a', false, false, 10, true, true),
    ('system-no-answer', 'NO_ANSWER', 'No Answer', 'Call was not answered', '#64748b', false, false, 20, true, true),
    ('system-busy', 'BUSY', 'Busy', 'Customer line was busy', '#f59e0b', false, false, 30, true, true),
    ('system-call-back', 'CALL_BACK', 'Call Back', 'Customer requested another call', '#2563eb', true, false, 40, true, true),
    ('system-interested', 'INTERESTED', 'Interested', 'Customer showed interest', '#059669', true, false, 50, true, true),
    ('system-demo', 'DEMO', 'Demo', 'Demo or detailed discussion', '#7c3aed', false, false, 60, true, true),
    ('system-not-interested', 'NOT_INTERESTED', 'Not Interested', 'Lead will be marked Lost', '#dc2626', false, true, 70, true, true),
    ('system-wrong-number', 'WRONG_NUMBER', 'Wrong Number', 'Invalid customer number', '#991b1b', false, true, 80, true, true);
