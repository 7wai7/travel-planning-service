-- CreateEnum
CREATE TYPE "TripRole" AS ENUM ('OWNER', 'COLLABORATOR');

-- CreateTable
CREATE TABLE "TripParticipants" (
    "user_id" INTEGER NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "TripRole" NOT NULL DEFAULT 'COLLABORATOR',

    CONSTRAINT "TripParticipants_pkey" PRIMARY KEY ("user_id","trip_id")
);

-- AddForeignKey
ALTER TABLE "TripParticipants" ADD CONSTRAINT "TripParticipants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripParticipants" ADD CONSTRAINT "TripParticipants_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
