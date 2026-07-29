create or replace function public.store_learning_pack(
  p_submission_id uuid,
  p_pack jsonb,
  p_provider text,
  p_model text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_submission public.submissions%rowtype;
  feedback_id uuid;
  inserted_flashcards integer;
  inserted_recall integer;
begin
  select * into target_submission
  from public.submissions
  where id = p_submission_id
    and user_id = auth.uid()
    and status = 'accepted';

  if not found then
    raise exception 'Accepted submission not found';
  end if;

  insert into public.ai_feedback (
    submission_id,
    user_id,
    feedback,
    mistakes,
    better_solution,
    time_complexity,
    space_complexity,
    interview_tips,
    similar_questions,
    provider,
    model
  )
  values (
    target_submission.id,
    target_submission.user_id,
    p_pack ->> 'feedback',
    coalesce(p_pack -> 'mistakes', '[]'::jsonb),
    p_pack ->> 'better_solution',
    p_pack ->> 'time_complexity',
    p_pack ->> 'space_complexity',
    coalesce(p_pack -> 'interview_tips', '[]'::jsonb),
    coalesce(p_pack -> 'similar_questions', '[]'::jsonb),
    p_provider,
    p_model
  )
  on conflict (submission_id)
  do update set
    feedback = excluded.feedback,
    mistakes = excluded.mistakes,
    better_solution = excluded.better_solution,
    time_complexity = excluded.time_complexity,
    space_complexity = excluded.space_complexity,
    interview_tips = excluded.interview_tips,
    similar_questions = excluded.similar_questions,
    provider = excluded.provider,
    model = excluded.model
  returning id into feedback_id;

  insert into public.flashcards (
    question_id,
    user_id,
    front,
    back,
    difficulty
  )
  select
    target_submission.question_id,
    target_submission.user_id,
    card ->> 'front',
    card ->> 'back',
    greatest(1, least(5, (card ->> 'difficulty')::integer))
  from jsonb_array_elements(coalesce(p_pack -> 'flashcards', '[]'::jsonb)) card
  where nullif(trim(card ->> 'front'), '') is not null
    and nullif(trim(card ->> 'back'), '') is not null
  on conflict (user_id, question_id, front)
  do update set
    back = excluded.back,
    difficulty = excluded.difficulty;
  get diagnostics inserted_flashcards = row_count;

  insert into public.active_recall_questions (
    user_id,
    question_id,
    prompt,
    sort_order
  )
  select
    target_submission.user_id,
    target_submission.question_id,
    prompt.value,
    prompt.ordinality::smallint
  from jsonb_array_elements_text(
    coalesce(p_pack -> 'active_recall', '[]'::jsonb)
  ) with ordinality as prompt(value, ordinality)
  where nullif(trim(prompt.value), '') is not null
  on conflict (user_id, question_id, prompt) do nothing;
  get diagnostics inserted_recall = row_count;

  return jsonb_build_object(
    'feedback_id', feedback_id,
    'flashcards', inserted_flashcards,
    'active_recall_questions', inserted_recall
  );
end;
$$;

revoke all on function public.store_learning_pack(uuid, jsonb, text, text)
from public, anon;
grant execute on function public.store_learning_pack(uuid, jsonb, text, text)
to authenticated;
