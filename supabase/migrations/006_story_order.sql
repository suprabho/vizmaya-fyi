-- Add order column for explicit story sorting on home page.
-- 0-indexed, lower numbers appear first. Null/omitted defaults to Infinity.

alter table stories add column order integer;
create index if not exists idx_stories_order on stories(order);
