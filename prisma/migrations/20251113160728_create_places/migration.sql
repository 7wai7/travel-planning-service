-- CreateTable
CREATE TABLE "Place" (
    "id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "locationName" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Place_locationName_idx" ON "Place"("locationName");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
