-- Add tags column to projects table to support multiple tags per project
ALTER TABLE projects ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];