-- Add password reset fields to users table
ALTER TABLE users ADD COLUMN "resetToken" TEXT;
ALTER TABLE users ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

-- Add indexes for better performance
CREATE INDEX "users_resetToken_idx" ON "users"("resetToken");
