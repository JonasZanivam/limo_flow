-- CreateEnum
CREATE TYPE "ProposalTramiteType" AS ENUM ('GENERATED', 'SENT', 'WAITING', 'ACCEPTED', 'REJECTED', 'CONTRACT_CREATED', 'NOTE');

-- CreateTable
CREATE TABLE "ProposalTramite" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "type" "ProposalTramiteType" NOT NULL,
    "description" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalTramite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProposalTramite_proposalId_idx" ON "ProposalTramite"("proposalId");

-- AddForeignKey
ALTER TABLE "ProposalTramite" ADD CONSTRAINT "ProposalTramite_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalTramite" ADD CONSTRAINT "ProposalTramite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
