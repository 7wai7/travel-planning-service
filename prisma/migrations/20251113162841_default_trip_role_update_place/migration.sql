-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_trip_id_fkey";

-- AlterTable
ALTER TABLE "TripParticipants" ALTER COLUMN "role" SET DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
