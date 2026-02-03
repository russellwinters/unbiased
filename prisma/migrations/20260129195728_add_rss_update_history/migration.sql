-- CreateTable
CREATE TABLE "RSSUpdateHistory" (
    "id" TEXT NOT NULL,
    "updateType" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "sourcesCreated" INTEGER NOT NULL DEFAULT 0,
    "sourcesUpdated" INTEGER NOT NULL DEFAULT 0,
    "articlesCreated" INTEGER NOT NULL DEFAULT 0,
    "articlesUpdated" INTEGER NOT NULL DEFAULT 0,
    "articlesSkipped" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration" INTEGER,

    CONSTRAINT "RSSUpdateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RSSUpdateHistory_requestedAt_idx" ON "RSSUpdateHistory"("requestedAt");

-- CreateIndex
CREATE INDEX "RSSUpdateHistory_completedAt_idx" ON "RSSUpdateHistory"("completedAt");
