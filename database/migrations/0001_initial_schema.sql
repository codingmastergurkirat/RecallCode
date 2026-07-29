-- RecallCode initial schema
-- Run with the Supabase SQL editor or Supabase CLI.

create extension if not exists pgcrypto;

create type public.question_difficulty as enum ('Easy', 'Medium', 'Hard');
create type public.submission_status as enum (
  'accepted',
  'runtime_error',
  'compile_error',
  'failed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  username text unique,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length
    check (username is null or char_length(username) between 3 and 32)
);

create table public.patterns (
  id smallserial primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  difficulty public.question_difficulty not null,
  pattern_id smallint references public.patterns(id) on delete set null,
  topic text not null,
  companies text[] not null default '{}',
  tags text[] not null default '{}',
  leetcode_url text not null,
  hints text[] not null default '{}',
  estimated_time smallint not null default 25
    check (estimated_time between 5 and 180),
  starter_code jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_tags (
  question_id uuid not null references public.questions(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  primary key (question_id, tag)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  language text not null,
  code text not null,
  status public.submission_status not null,
  runtime_ms integer,
  memory_kb integer,
  stdout text,
  stderr text,
  created_at timestamptz not null default now()
);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  review_date timestamptz not null default now(),
  ease_factor numeric(4, 2) not null default 2.50
    check (ease_factor between 1.30 and 3.50),
  interval integer not null default 0 check (interval between 0 and 30),
  repetitions integer not null default 0 check (repetitions >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_id, front)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  quality smallint not null check (quality between 0 and 5),
  previous_interval integer not null,
  next_interval integer not null,
  previous_ease_factor numeric(4, 2) not null,
  next_ease_factor numeric(4, 2) not null,
  reviewed_at timestamptz not null default now()
);

create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique
    references public.submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  feedback text not null,
  mistakes jsonb not null default '[]'::jsonb,
  better_solution text not null,
  time_complexity text not null,
  space_complexity text not null,
  interview_tips jsonb not null default '[]'::jsonb,
  similar_questions jsonb not null default '[]'::jsonb,
  provider text not null,
  model text not null,
  created_at timestamptz not null default now()
);

create table public.active_recall_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  prompt text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, question_id, prompt)
);

create table public.active_recall_answers (
  id uuid primary key default gen_random_uuid(),
  recall_question_id uuid not null
    references public.active_recall_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answer text not null,
  confidence smallint not null default 3 check (confidence between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recall_question_id)
);

create table public.pattern_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern_id smallint not null references public.patterns(id) on delete cascade,
  solved_count integer not null default 0,
  attempted_count integer not null default 0,
  mastery_percentage numeric(5, 2) not null default 0
    check (mastery_percentage between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, pattern_id)
);

create table public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stat_date date not null default current_date,
  problems_solved integer not null default 0,
  reviews_completed integer not null default 0,
  study_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, stat_date)
);

create index questions_pattern_idx on public.questions(pattern_id);
create index questions_difficulty_idx on public.questions(difficulty);
create index questions_topic_idx on public.questions(topic);
create index questions_tags_gin_idx on public.questions using gin(tags);
create index questions_companies_gin_idx on public.questions using gin(companies);
create index submissions_user_created_idx
  on public.submissions(user_id, created_at desc);
create index submissions_user_question_idx
  on public.submissions(user_id, question_id);
create index flashcards_due_idx
  on public.flashcards(user_id, review_date);
create index reviews_user_reviewed_idx
  on public.reviews(user_id, reviewed_at desc);
create index active_recall_question_idx
  on public.active_recall_questions(user_id, question_id);
create index daily_stats_user_date_idx
  on public.daily_stats(user_id, stat_date desc);

insert into public.patterns (name, slug, description, sort_order)
values
  ('Array', 'array', 'Indexing, traversal, and in-place transformations.', 1),
  ('Hash Map', 'hash-map', 'Constant-time lookup and frequency tracking.', 2),
  ('Two Pointers', 'two-pointers', 'Coordinate indices to reduce nested work.', 3),
  ('Sliding Window', 'sliding-window', 'Maintain a changing contiguous range.', 4),
  ('Stack', 'stack', 'Model nested or monotonic state with LIFO order.', 5),
  ('Binary Search', 'binary-search', 'Discard half of a monotonic search space.', 6),
  ('Linked List', 'linked-list', 'Rewire nodes with careful pointer invariants.', 7),
  ('Tree', 'tree', 'Traverse and combine hierarchical subproblems.', 8),
  ('Trie', 'trie', 'Index strings by their shared prefixes.', 9),
  ('Heap', 'heap', 'Keep the next extreme value available.', 10),
  ('Backtracking', 'backtracking', 'Explore a choice tree and undo decisions.', 11),
  ('Graph', 'graph', 'Traverse relationships and connectivity.', 12),
  ('Dynamic Programming', 'dynamic-programming', 'Reuse overlapping subproblem results.', 13),
  ('Greedy', 'greedy', 'Make a locally optimal choice with a provable invariant.', 14),
  ('Intervals', 'intervals', 'Sort and reason about overlapping ranges.', 15),
  ('Math & Geometry', 'math-geometry', 'Use arithmetic and spatial invariants.', 16),
  ('Bit Manipulation', 'bit-manipulation', 'Represent compact state with bit operations.', 17),
  ('Union Find', 'union-find', 'Track disjoint connected components.', 18)
on conflict (slug) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

create trigger flashcards_set_updated_at
before update on public.flashcards
for each row execute function public.set_updated_at();

create trigger active_recall_answers_set_updated_at
before update on public.active_recall_answers
for each row execute function public.set_updated_at();

create trigger pattern_progress_set_updated_at
before update on public.pattern_progress
for each row execute function public.set_updated_at();

create trigger daily_stats_set_updated_at
before update on public.daily_stats
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.refresh_pattern_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_pattern_id smallint;
  total_questions integer;
  attempted integer;
  solved integer;
begin
  select q.pattern_id into target_pattern_id
  from public.questions q
  where q.id = new.question_id;

  if target_pattern_id is null then
    return new;
  end if;

  select count(*) into total_questions
  from public.questions q
  where q.pattern_id = target_pattern_id;

  select
    count(distinct s.question_id),
    count(distinct s.question_id) filter (where s.status = 'accepted')
  into attempted, solved
  from public.submissions s
  join public.questions q on q.id = s.question_id
  where s.user_id = new.user_id and q.pattern_id = target_pattern_id;

  insert into public.pattern_progress (
    user_id,
    pattern_id,
    solved_count,
    attempted_count,
    mastery_percentage
  )
  values (
    new.user_id,
    target_pattern_id,
    solved,
    attempted,
    case
      when total_questions = 0 then 0
      else round((solved::numeric / total_questions::numeric) * 100, 2)
    end
  )
  on conflict (user_id, pattern_id)
  do update set
    solved_count = excluded.solved_count,
    attempted_count = excluded.attempted_count,
    mastery_percentage = excluded.mastery_percentage,
    updated_at = now();

  if new.status = 'accepted' and (
    select count(*)
    from public.submissions s
    where s.user_id = new.user_id
      and s.question_id = new.question_id
      and s.status = 'accepted'
  ) = 1 then
    insert into public.daily_stats (user_id, stat_date, problems_solved)
    values (new.user_id, current_date, 1)
    on conflict (user_id, stat_date)
    do update set
      problems_solved = public.daily_stats.problems_solved + 1,
      updated_at = now();
  end if;

  return new;
end;
$$;

create trigger submissions_refresh_progress
after insert on public.submissions
for each row execute function public.refresh_pattern_progress();

create or replace function public.submit_flashcard_review(
  card_id uuid,
  review_quality integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  card public.flashcards%rowtype;
  next_repetitions integer;
  next_interval integer;
  next_ease numeric(4, 2);
  next_review_date timestamptz;
begin
  if review_quality < 0 or review_quality > 5 then
    raise exception 'Review quality must be between 0 and 5';
  end if;

  select * into card
  from public.flashcards
  where id = card_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Flashcard not found';
  end if;

  next_ease := greatest(
    1.30,
    card.ease_factor
      + (0.1 - (5 - review_quality) * (0.08 + (5 - review_quality) * 0.02))
  );

  if review_quality < 3 then
    next_repetitions := 0;
    next_interval := 1;
  else
    next_repetitions := card.repetitions + 1;
    next_interval := case
      when next_repetitions = 1 then 1
      when next_repetitions = 2 then 3
      when next_repetitions = 3 then 7
      when next_repetitions = 4 then 14
      else 30
    end;
  end if;

  next_review_date := now() + make_interval(days => next_interval);

  update public.flashcards
  set
    repetitions = next_repetitions,
    interval = next_interval,
    ease_factor = next_ease,
    review_date = next_review_date,
    difficulty = 6 - greatest(review_quality, 1)
  where id = card.id;

  insert into public.reviews (
    flashcard_id,
    user_id,
    quality,
    previous_interval,
    next_interval,
    previous_ease_factor,
    next_ease_factor
  )
  values (
    card.id,
    card.user_id,
    review_quality,
    card.interval,
    next_interval,
    card.ease_factor,
    next_ease
  );

  insert into public.daily_stats (user_id, stat_date, reviews_completed)
  values (card.user_id, current_date, 1)
  on conflict (user_id, stat_date)
  do update set
    reviews_completed = public.daily_stats.reviews_completed + 1,
    updated_at = now();

  return jsonb_build_object(
    'flashcard_id', card.id,
    'review_date', next_review_date,
    'interval', next_interval,
    'ease_factor', next_ease,
    'repetitions', next_repetitions
  );
end;
$$;

create or replace function public.get_dashboard_stats(target_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'total_solved', (
      select count(distinct s.question_id)
      from public.submissions s
      where s.user_id = target_user_id and s.status = 'accepted'
    ),
    'reviews_today', (
      select count(*)
      from public.flashcards f
      where f.user_id = target_user_id and f.review_date <= now()
    ),
    'flashcards', (
      select count(*)
      from public.flashcards f
      where f.user_id = target_user_id
    ),
    'current_streak', (
      with recursive streak(day, count) as (
        select current_date, 0
        union all
        select day - 1, count + 1
        from streak
        where exists (
          select 1 from public.daily_stats d
          where d.user_id = target_user_id
            and d.stat_date = streak.day
            and (d.problems_solved > 0 or d.reviews_completed > 0)
        ) and count < 3650
      )
      select coalesce(max(count), 0) from streak
    ),
    'average_mastery', (
      select coalesce(round(avg(p.mastery_percentage), 1), 0)
      from public.pattern_progress p
      where p.user_id = target_user_id
    )
  )
  where target_user_id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.patterns enable row level security;
alter table public.questions enable row level security;
alter table public.question_tags enable row level security;
alter table public.submissions enable row level security;
alter table public.flashcards enable row level security;
alter table public.reviews enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.active_recall_questions enable row level security;
alter table public.active_recall_answers enable row level security;
alter table public.pattern_progress enable row level security;
alter table public.daily_stats enable row level security;

create policy "Profiles are visible to their owner"
on public.profiles for select using (auth.uid() = id);
create policy "Users can create their own profile"
on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Authenticated users can read patterns"
on public.patterns for select to authenticated using (true);
create policy "Authenticated users can read questions"
on public.questions for select to authenticated using (true);
create policy "Authenticated users can read question tags"
on public.question_tags for select to authenticated using (true);

create policy "Users can read their submissions"
on public.submissions for select using (auth.uid() = user_id);
create policy "Users can create their submissions"
on public.submissions for insert with check (auth.uid() = user_id);

create policy "Users can read their flashcards"
on public.flashcards for select using (auth.uid() = user_id);
create policy "Users can create their flashcards"
on public.flashcards for insert with check (auth.uid() = user_id);
create policy "Users can update their flashcards"
on public.flashcards for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);
create policy "Users can delete their flashcards"
on public.flashcards for delete using (auth.uid() = user_id);

create policy "Users can read their reviews"
on public.reviews for select using (auth.uid() = user_id);
create policy "Users can create their reviews"
on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can read their AI feedback"
on public.ai_feedback for select using (auth.uid() = user_id);
create policy "Users can create their AI feedback"
on public.ai_feedback for insert with check (auth.uid() = user_id);

create policy "Users can read their recall questions"
on public.active_recall_questions for select using (auth.uid() = user_id);
create policy "Users can create their recall questions"
on public.active_recall_questions for insert with check (auth.uid() = user_id);
create policy "Users can delete their recall questions"
on public.active_recall_questions for delete using (auth.uid() = user_id);

create policy "Users can read their recall answers"
on public.active_recall_answers for select using (auth.uid() = user_id);
create policy "Users can create their recall answers"
on public.active_recall_answers for insert with check (auth.uid() = user_id);
create policy "Users can update their recall answers"
on public.active_recall_answers for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their pattern progress"
on public.pattern_progress for select using (auth.uid() = user_id);
create policy "Users can read their daily stats"
on public.daily_stats for select using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.patterns, public.questions, public.question_tags
to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.submissions to authenticated;
grant select, insert, update, delete on public.flashcards to authenticated;
grant select, insert on public.reviews, public.ai_feedback to authenticated;
grant select, insert, delete on public.active_recall_questions to authenticated;
grant select, insert, update on public.active_recall_answers to authenticated;
grant select on public.pattern_progress, public.daily_stats to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.get_dashboard_stats(uuid) to authenticated;
grant execute on function public.submit_flashcard_review(uuid, integer)
to authenticated;
