# ToDo App (P4)

Application built with Vue 3, Supabase, and Vercel.

## Documentation (PromptPack)

Complete documentation is available in `docs/p4/`:

- [**Start Here: PromptPack Index**](docs/p4/promptpack.md)
- [Scope & MVP](docs/p4/scope.md)
- [Data Model & SQL](docs/p4/data_model.md)
- [RLS Policies](docs/p4/security_rls.md)
- [Component Map](docs/p4/ui_map.md)
- [Deployment Guide](docs/p4/deploy_vercel.md)

## Development Setup

1. Copy `.env.example` to `.env` and fill in Supabase credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/lib/supabase.ts`: Supabase client instance.
- `src/router`: Vue Router configuration.
- `src/views`: Page components.
- `src/composables`: Shared logic (Auth, Todos, etc).
