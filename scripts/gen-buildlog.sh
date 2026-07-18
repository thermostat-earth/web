#!/bin/sh
# Regenerate BUILDLOG.md from git history. Derived, so it can never drift.
# Date + subject only (no sha) so it is stable across the post-commit amend.
{
  echo "# ThermoStat build log"
  echo
  echo "_Auto-generated from git history on every commit (post-commit hook). Do not edit by hand._"
  echo
  git log --pretty=format:"- %ad  %s" --date=short
  echo
} > BUILDLOG.md
