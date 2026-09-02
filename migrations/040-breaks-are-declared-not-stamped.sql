-- 040: a reporting-basis break is a fact about the company, not a stamp on each row.
--
-- Option E of the review on 2026-09-02. The reason an "unapplied" state could exist at all is that
-- a confirmed break lived in one database as a decision and had to be copied into another as a
-- column value. Anything that must be copied can be forgotten. So the break becomes a row of its
-- own here, and the score derives each year's basis from it — there is nothing to apply, because
-- there is nothing that could be out of date.
--
-- basis_id on scope12 and scope3 stays where it is and is no longer read by the scoring. It is not
-- dropped: it holds the history of what was stamped, and dropping columns to tidy up on the same
-- day their replacement lands is how you lose the ability to check the replacement.
--
-- The write path from the ops app is deliberately NOT part of this migration. Today the break is
-- recorded here by apply_basis_break, called from the VPS. Giving the review app a narrow way to
-- declare a break itself needs a secret and a grant, and that is tomorrow's work with a clear head.

begin;

create table if not exists public.reporting_basis_breaks (
  id                   bigserial primary key,
  company_id           text not null references public.companies(company_id),
  -- Every reading taken from this publication onward is on the later basis. The basis follows the
  -- publication a figure came from, never the calendar year — see migration 038.
  from_reporting_year  integer not null,
  note                 text not null,
  confirmed_at         timestamptz not null default now(),
  source               text not null default 'ops review',
  unique (company_id, from_reporting_year)
);

comment on table public.reporting_basis_breaks is
  'Confirmed reporting-basis breaks. One row per company per publication where the basis changed. The scoring derives every year''s basis from this, so a break cannot be recorded and left unapplied.';

alter table public.reporting_basis_breaks enable row level security;
drop policy if exists "public demo read" on public.reporting_basis_breaks;
create policy "public demo read" on public.reporting_basis_breaks for select to anon, authenticated using (true);
grant select on public.reporting_basis_breaks to anon, authenticated;

-- Basis 1 until a break says otherwise, then one more for each break at or before this publication.
create or replace function public.basis_of(p_company_id text, p_reporting_year integer)
returns integer language sql stable as $$
  select 1 + (
    select count(*)::int from public.reporting_basis_breaks b
     where b.company_id = p_company_id
       and b.from_reporting_year <= p_reporting_year)
$$;

comment on function public.basis_of(text, integer) is
  'Which reporting basis a figure taken from this publication sits on. Derived, never stored, so it cannot disagree with the confirmed breaks.';

-- The break H&M's Sellpy judgement produced, already stamped onto their readings this afternoon.
-- Carried over so the derived basis matches what is on the rows and the change below is provably
-- inert rather than merely believed to be.
insert into public.reporting_basis_breaks (company_id, from_reporting_year, note, source)
values ('FASH_HM', 2024,
  'Sellpy scope 1 and 2 emissions moved from scope 3 category 15 into the group boundary. Confirmed as a basis change in the ops review; applied 2026-09-02.',
  'ops review')
on conflict (company_id, from_reporting_year) do nothing;

commit;
