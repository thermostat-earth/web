-- 025-regrant-review-view.sql
-- Dropping a view drops its grants. restatements_for_review was dropped and recreated in 019 to
-- add two columns, which silently removed anon's SELECT — and anon is how the ops app reads it.
-- That would have turned one error message into a different one.

begin;
grant select on public.restatements_for_review to anon, authenticated;
commit;
