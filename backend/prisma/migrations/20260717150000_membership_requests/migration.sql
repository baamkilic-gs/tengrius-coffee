CREATE TYPE "MembershipRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "MembershipRequest" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "requested_tier" "MembershipTier" NOT NULL,
    "status" "MembershipRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "MembershipRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "MembershipRequest" ADD CONSTRAINT "MembershipRequest_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
