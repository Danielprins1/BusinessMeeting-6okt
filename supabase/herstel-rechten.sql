-- Alleen nodig als de statuspagina (/status) "permission denied" meldt.
-- Geeft de server (service_role) de rechten op de speltabellen. Kan veilig vaker worden uitgevoerd.
grant usage on schema public to service_role;
grant all on public.games, public.players, public.questions, public.fake_answers,
  public.answer_options, public.votes, public.round_scores to service_role;
