-- The arithmetic behind "they moved it between categories, the total is the same".
--
-- The first attempt compared whole-year totals between the two publications and would have been
-- useless: H&M's 2022 was reported with 4 categories in the 2022 disclosure and 10 in the 2024
-- report, so the totals differ by 2.5m tCO2e for a reason that has nothing to do with anything
-- moving. Comparing coverage is not comparing arithmetic.
--
-- So compare like with like: only the categories that carry a figure in BOTH publications, and
-- scope 1 and 2 only if both publications gave it. If an activity moved from one counted category
-- into another, that sum is unchanged. If it moved out of what is counted, the sum drops, and the
-- verdict is false.
create or replace function public.category_move_check(
  p_company_id text, p_year integer, p_first_pub integer, p_last_pub integer
) returns table (
  first_total numeric, last_total numeric, difference numeric, pct_difference numeric,
  categories_compared integer, scope12_compared boolean
)
language sql stable as $$
  with shared as (
    select a.category
    from scope3 a
    join scope3 b
      on b.company_id = a.company_id and b.year = a.year and b.category = a.category
     and b.reporting_year = p_last_pub and b.row_status = 'ok' and b.ghg is not null
    where a.company_id = p_company_id and a.year = p_year
      and a.reporting_year = p_first_pub and a.row_status = 'ok' and a.ghg is not null
  ),
  s3 as (
    select
      sum(ghg) filter (where reporting_year = p_first_pub) as first_ghg,
      sum(ghg) filter (where reporting_year = p_last_pub)  as last_ghg
    from scope3
    where company_id = p_company_id and year = p_year
      and category in (select category from shared)
      and reporting_year in (p_first_pub, p_last_pub)
  ),
  s12 as (
    select
      sum(coalesce(scope1_ghg,0) + coalesce(scope2_location_ghg,0)) filter (where reporting_year = p_first_pub) as first_ghg,
      sum(coalesce(scope1_ghg,0) + coalesce(scope2_location_ghg,0)) filter (where reporting_year = p_last_pub)  as last_ghg,
      count(*) filter (where reporting_year = p_first_pub) > 0
        and count(*) filter (where reporting_year = p_last_pub) > 0 as both_present
    from scope12
    where company_id = p_company_id and year = p_year
      and reporting_year in (p_first_pub, p_last_pub)
  )
  select
    coalesce(s3.first_ghg,0) + case when s12.both_present then coalesce(s12.first_ghg,0) else 0 end,
    coalesce(s3.last_ghg,0)  + case when s12.both_present then coalesce(s12.last_ghg,0)  else 0 end,
    (coalesce(s3.last_ghg,0)  + case when s12.both_present then coalesce(s12.last_ghg,0)  else 0 end)
      - (coalesce(s3.first_ghg,0) + case when s12.both_present then coalesce(s12.first_ghg,0) else 0 end),
    case when coalesce(s3.first_ghg,0) + case when s12.both_present then coalesce(s12.first_ghg,0) else 0 end = 0 then null
      else round(100.0 * ((coalesce(s3.last_ghg,0) + case when s12.both_present then coalesce(s12.last_ghg,0) else 0 end)
        - (coalesce(s3.first_ghg,0) + case when s12.both_present then coalesce(s12.first_ghg,0) else 0 end))
        / (coalesce(s3.first_ghg,0) + case when s12.both_present then coalesce(s12.first_ghg,0) else 0 end), 2) end,
    (select count(*)::int from shared),
    coalesce(s12.both_present, false)
  from s3, s12;
$$;

comment on function public.category_move_check is
  'Totals for one year across only the categories both publications reported, so a "moved between categories" verdict can be tested instead of trusted. A difference means something left what is counted.';

grant execute on function public.category_move_check to anon, authenticated;
