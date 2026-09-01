-- What actually moved, line by line, so a category-move verdict can be seen rather than inferred.
--
-- Felix, 2026-08-28: "can't we compare cat 15 vs scope 1 & 2?" Yes, and that is the test the
-- year-total check could not do. H&M's 2022 scope 1 restatement says in its own words that Sellpy
-- moved out of scope 3 category 15 and into group scope 1 and 2. The year total rose 31.7% anyway,
-- because category 1 grew by 1.95m tCO2e in the same report for unrelated reasons -- so a check on
-- the year blames the restatement in front of it for a change somewhere else entirely.
--
-- This returns every line for the year in both publications, scope 1 and 2 included as its own
-- row, so the pair can be read off directly. Scoring is not involved; this is evidence for a human.
create or replace function public.move_breakdown(
  p_company_id text, p_year integer, p_first_pub integer, p_last_pub integer
) returns table (
  line text, sort_key integer, first_ghg numeric, last_ghg numeric, difference numeric
)
language sql stable as $$
  with s3 as (
    select category,
      sum(ghg) filter (where reporting_year = p_first_pub) as f,
      sum(ghg) filter (where reporting_year = p_last_pub)  as l
    from scope3
    where company_id = p_company_id and year = p_year
      and reporting_year in (p_first_pub, p_last_pub) and row_status = 'ok'
    group by category
  ),
  s12 as (
    select
      sum(coalesce(scope1_ghg,0) + coalesce(scope2_location_ghg,0)) filter (where reporting_year = p_first_pub) as f,
      sum(coalesce(scope1_ghg,0) + coalesce(scope2_location_ghg,0)) filter (where reporting_year = p_last_pub)  as l
    from scope12
    where company_id = p_company_id and year = p_year
      and reporting_year in (p_first_pub, p_last_pub)
  )
  select 'Scope 1 and 2'::text, 0, s12.f, s12.l, coalesce(s12.l,0) - coalesce(s12.f,0) from s12
  where s12.f is not null or s12.l is not null
  union all
  select 'Scope 3 category ' || s3.category, s3.category, s3.f, s3.l, coalesce(s3.l,0) - coalesce(s3.f,0)
  from s3
  where s3.f is not null or s3.l is not null
  order by 2;
$$;

comment on function public.move_breakdown is
  'Every line of one year in two publications, scope 1 and 2 included, so a reviewer can see which category an activity left and which it arrived in.';

grant execute on function public.move_breakdown to anon, authenticated;
