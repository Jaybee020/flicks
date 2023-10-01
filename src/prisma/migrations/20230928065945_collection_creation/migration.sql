-- CreateTable
CREATE TABLE "Collection" (
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_address_key" ON "Collection"("address");
