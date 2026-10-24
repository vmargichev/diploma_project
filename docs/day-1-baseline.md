# Day 1 working baseline

Date: 24 October 2026.

## Scope and evidence

- Started the existing PostgreSQL container and both development servers.
- Preserved the existing database: 9 users, 12 courses, 18 enrollments at inspection.
- Existing migrations were applied already. Added migration 0006 to fix the course DateField default; creating a course previously returned a serialization error because it received a datetime.
- Django checks passed. All 15 backend tests passed, including 8 new baseline tests and 7 corrected existing tests.
- Backend tests cover both roles logging in and refreshing tokens, invalid credentials, public catalogue, enrolled curriculum, anonymous/cross-user access rejection for the three core student endpoints, instructor course listing, and course creation under the authenticated instructor's identity.
- Frontend production build passed, with a large-bundle warning (about 1.87 MB main JS before compression).
- Frontend lint runs after fixing its command but reports 63 errors and 19 warnings. This remains an open check.
- Installed Python dependencies pass `pip check`. The working set is captured in `requirements-baseline.txt`; a fresh environment install is not yet verified.
- Browser verified student login, dashboard with four enrolled courses, curriculum, and opening a previously locked non-preview lesson. Actual video playback is not established: demo lesson media is missing.
- Browser verified instructor login and John Smith's dashboard with his four courses, after logging out of the student account.

## Changes

- Shared Axios client attaches current credentials and refreshes expired tokens, deduplicating concurrent refresh requests. The old helper checked the function itself rather than token expiry and read the refresh response incorrectly.
- User data now follows the authentication store instead of being decoded once at module import. Login cookies work over local HTTP and use Secure on HTTPS.
- Public routes no longer get forced to login merely because there are no session cookies.
- Instructor routes require a teacher claim. New logins include that claim; existing sessions should sign out and sign back in.
- Core student summary, enrollment list, and enrollment detail endpoints require authentication and matching user identity.
- Instructor course listing resolves the user ID supplied by the frontend. Course creation resolves the teacher from the authenticated user and ignores a submitted teacher identity.
- Enrollment screens unlock lessons based on enrollment instead of the public-preview flag. Catalogue title links use the actual course slug.
- Registration sends teacher requests only when requested.
- Added environment examples, configurable PostgreSQL connection, local CORS defaults, console email default, corrected Anymail setting keys, database healthcheck and loopback port binding.
- Corrected outdated cart tests to match the actual 20-character cart ID, numeric user ID, and flat serialized user field. Renamed the duplicate-cart test to describe its real assertion.

## Open issues and boundaries

1. Many inherited endpoints outside the repaired core flow still use AllowAny or lack ownership checks, including notes, completion, Q&A, profile and commerce operations. Public serializers also expose more nested user/enrollment data than necessary. This is a local development baseline, not a deployment-ready access-control audit. Prioritize permissions and minimal public serializers before exposure or real user data.
2. Instructor endpoints beyond course listing still have inconsistent user-ID versus teacher-ID conventions. Review each as it enters the demonstration path.
3. Demo avatars and video files are absent. Add actual educational content for the final demonstration.
4. Lint debt, large frontend bundle, duplicated course screens, and some placeholder navigation remain.
5. Payments and external email delivery were not exercised. No external messages or transactions were sent.
6. Browser token-expiry timing and registration UI were not exhaustively tested. Backend refresh is covered by tests.
7. Legacy Python/Django/frontend dependencies need a separate compatibility and upgrade review; avoid mixing a broad upgrade with the five-day feature delivery.

## Next implementation slice

Add Exercise linked to VariantItem, Submission linked to Exercise and User, and Evaluation linked to Submission. Store rubric/reference answer on Exercise; code, attempt timestamp and status on Submission; structured verdict, explanation, hint, model/prompt version and latency on Evaluation. Keep reference answers instructor-only. Use Django admin for exercise authoring and implement one complete submission-to-feedback path before expanding to 5–8 exercises. No student code execution in the Django process.

Existing uncommitted work was present before this baseline. It has been preserved; changes have not been committed or pushed.
