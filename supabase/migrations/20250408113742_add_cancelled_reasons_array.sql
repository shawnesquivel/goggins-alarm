-- Add new columns
ALTER TABLE sessions 
ADD COLUMN cancelled_reason_details text NULL;

-- Migrate existing data from old column and then drop it
UPDATE sessions 
SET cancelled_reasons = string_to_array(cancelled_reason, ', ')
WHERE cancelled_reason IS NOT NULL;

ALTER TABLE sessions DROP COLUMN cancelled_reason;

-- Add an index for better query performance on the array
CREATE INDEX idx_sessions_cancelled_reasons ON sessions USING GIN (cancelled_reasons);

-- Add a comment to explain the columns
COMMENT ON COLUMN sessions.cancelled_reasons IS 'Array of predefined cancellation reasons';
COMMENT ON COLUMN sessions.cancelled_reason_details IS 'Additional context or notes about the cancellation';
