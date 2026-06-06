# Foundr Role-Based Onboarding Architecture

## Flow

```
Signup / Login
    ↓
RootNavigator → needsOnboarding(profile)?
    ↓ yes
OnboardingNavigator
  1. OnboardingWelcome      (role selection)
  2. OnboardingGoals        (multi-select goals)
  3. OnboardingQuickProfile (6–7 fields by role)
  4. OnboardingMatch        (recommendations + completion bar)
    ↓ completeOnboarding()
MainNavigator (tabs)
    ↓
ProfileScreen (progressive completion, role-specific sections)
```

## Frontend modules

| Module | Path | Responsibility |
|--------|------|----------------|
| Roles | `src/constants/memberRoles.ts` | 5 roles, goals, labels |
| Schemas | `src/modules/profile/schemas/` | Per-role TypeScript types |
| Completion | `src/modules/profile/completion.ts` | Weighted % calculator |
| Onboarding | `src/modules/onboarding/` | Wizard UI + draft store |
| Recommendations | `src/modules/recommendations/` | Match API + client fallback |
| Gate | `src/modules/profile/needsOnboarding.ts` | Legacy user compatibility |

## Database

Migration: `database/migrations/20260603_role_based_onboarding.sql`

- Extends `member_role` enum: `advisor`, `professional`, `service_provider`
- Adds to `profiles`: `onboarding_completed`, `onboarding_goals`, `profile_completion`, `onboarding_step`
- Creates 1:1 tables: `founder_profiles`, `investor_profiles`, `advisor_profiles`, `professional_profiles`, `service_provider_profiles`

## API (NestJS reference)

DTOs: `server/onboarding/onboarding.dto.ts`  
Controller sketch: `server/onboarding/onboarding.controller.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PATCH | `/profiles/me/onboarding` | Save step progress |
| POST | `/profiles/me/onboarding/complete` | Mark complete + upsert role profile |
| GET | `/recommendations/matches?role=&goals=` | Server-side match ranking |
| PATCH | `/profiles/me` | Fallback (already exists) |

## Backward compatibility

- Existing users with `role != other` + name/headline/location → `onboarding_completed = true` (SQL backfill)
- Client `isLegacyProfileComplete()` skips wizard for those users
- Unknown API fields ignored by older backends; client falls back to `PATCH /profiles/me`

## Migration plan

1. Run SQL migration on PostgreSQL/Supabase
2. Deploy backend endpoints + profile DTO with `roleProfile` nested object
3. Ship mobile app (this branch) — works with fallback to `/profiles/me`
4. Verify new signup → onboarding → main → profile completion increases on save
5. Monitor `profile_completion` distribution; tune weights in `completion.ts`
