-- 1. Task: remove the periods.completed column as its not needed.

-- 1a) drop dependent views
DROP VIEW IF EXISTS daily_analytics, weekly_analytics, monthly_analytics;

-- 1b) drop column
ALTER TABLE periods DROP COLUMN completed;

