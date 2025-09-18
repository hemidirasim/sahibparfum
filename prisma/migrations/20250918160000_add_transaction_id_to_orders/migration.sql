-- Add transactionId column to orders table
ALTER TABLE "orders" ADD COLUMN "transactionId" INTEGER;

-- Create index for transactionId for better query performance
CREATE INDEX "orders_transactionId_idx" ON "orders"("transactionId");
