-- Keep security-definer functions off the public API's default execution path.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.refresh_pattern_progress() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- The dashboard RPC must never disclose another user's data.
revoke all on function public.get_dashboard_stats(uuid) from public, anon;
revoke all on function public.submit_flashcard_review(uuid, integer)
from public, anon;
