-- 021-publication-order.sql
-- Give every reading a publication-order key, so scoring can pick the most recently PUBLISHED
-- figure rather than the highest reporting_year.
--
-- Felix's rule, reiterated 2026-08-27: the most recent publication wins. Until now that was
-- approximated by reporting_year, which is not a publication date — H&M's climate transition plan
-- was published in March 2024 and covers 2021-2023, while their annual report published a year
-- later covers 2022-2024. The two orderings happen to agree on every figure we hold today, but
-- they will not once documents arrive out of order.
--
-- Kept as a stored column rather than a join so the fourteen ORDER BY clauses inside
-- score_company change by one word each, instead of every subquery growing a join.

begin;

alter table public.scope12 add column if not exists pub_order date;
alter table public.scope3  add column if not exists pub_order date;

create or replace function public.set_pub_order() returns trigger
language plpgsql as $$
begin
  -- The document's publication date where known. Where it is not, the last day of the reporting
  -- year stands in — the same fallback the detection view uses, so the two cannot disagree.
  new.pub_order := coalesce(
    (select d.published_on from public.documents d where d.id = new.document_id),
    make_date(new.reporting_year, 12, 31)
  );
  return new;
end $$;

drop trigger if exists scope12_pub_order on public.scope12;
create trigger scope12_pub_order before insert or update of document_id, reporting_year
  on public.scope12 for each row execute function public.set_pub_order();

drop trigger if exists scope3_pub_order on public.scope3;
create trigger scope3_pub_order before insert or update of document_id, reporting_year
  on public.scope3 for each row execute function public.set_pub_order();

update public.scope12 s set pub_order = coalesce(
  (select d.published_on from public.documents d where d.id = s.document_id),
  make_date(s.reporting_year, 12, 31));
update public.scope3 s set pub_order = coalesce(
  (select d.published_on from public.documents d where d.id = s.document_id),
  make_date(s.reporting_year, 12, 31));

alter table public.scope12 alter column pub_order set not null;
alter table public.scope3  alter column pub_order set not null;

commit;
