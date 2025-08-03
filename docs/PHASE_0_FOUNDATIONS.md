# Phase 0: Foundations Implementation

This document describes the foundational systems and patterns for the Customer Support AI Agent Admin Portal. All examples assume you’re working from the `main` branch of the [agent‑hub‑lite](https://github.com/andlengo26/agent-hub-lite) repo.

---

## 🎨 Design Tokens

**Where:** `tailwind.config.ts` & `index.css`

- **Colors:** Brand palette using HSL color space—no raw hexes in components  
- **Spacing:** Semantic scale (`space-1` through `space-6`)  
- **Typography:** Inter font family, `text-sm` through `text-2xl`  
- **Radii:** `radius-sm` / `radius-md` / `radius-lg`  
- **Dark Mode:** Automatic dark mode support via CSS variables
- **Semantic tokens:** All design tokens are accessible through CSS custom properties

```css
/* index.css */
:root {
  --primary: 213 94% 68%;
  --surface: 210 40% 98%; 
  --text-primary: 222 84% 4.9%;
  /* ... */
}
```
🧩 Component Library
All UI patterns use these reusable, token‑driven components:

Buttons: <Button variant="primary" size="md">

Inputs: <InputField>, <TextAreaField>, <SelectField>, <CheckboxField>

Tables: <EnhancedDataTable> with pagination, selection, empty states

Modals/Drawers: <FormModal>, <Drawer>

Avatars & Badges: <Avatar size="md">, <Badge status="active">

Toasts: toast.success(), toast.error()

Utility Components: <EmptyState>, <SearchInput>, <BulkActionsToolbar>

tsx
Copy
Edit
import { EnhancedDataTable, FormModal, InputField } from '@/components/ui';

<EnhancedDataTable 
  columns={columns}
  data={rows}
  pagination
  selectable
  emptyState={{ 
    icon: '/images/empty.svg', 
    message: "No records found", 
    actionLabel: "Add new" 
  }}
/>
📁 Static JSON Mocks (Development)
All dev data lives under public/mocks/:

File	Purpose
chats.json	Chat transcripts & metadata
users.json	Agent profiles & roles
organizations.json	Organization records + members: [...]
engagements.json	Engagement history logs
documents.json	Document metadata for Content Management
faqs.json	FAQ entries for AI knowledge
resources.json	Shareable resources list
scraperJobs.json	URL scraper job configs
domains.json	Whitelisted domains for security
health.json	System health status

Access pattern:

ts
Copy
Edit
// src/lib/api-client.ts
const BASE = import.meta.env.DEV ? '/mocks' : '/api';
export function getChats() {
  return fetch(`${BASE}/chats.json`).then(r => r.json());
}
⚙️ API Layer & Data Hooks
API Client (src/lib/api-client.ts)

Chooses /mocks/*.json in dev, real endpoints in prod

Type‑safe methods (getChats(), getUsers(), etc.)

React Query Hooks (src/hooks/useApiQuery.ts)

useChats(), useUsers(), useOrganizations(), useEngagements(), …

Handles isLoading, isError, and data caching

Component Integration

Components call hooks directly, no manual fetch

arduino
Copy
Edit
JSON Files → API Client → React Query Hooks → UI Components
🔒 Configuration & Feature Flags
Environment Variables (.env.example → .env.local):

env
Copy
Edit
VITE_MOCK_ENABLED=true          # use /mocks/*.json
VITE_API_BASE_URL=https://api…  # prod endpoint
VITE_FEATURE_CHAT=true
VITE_FEATURE_ANALYTICS=false
useFeatureFlag('chat') to gate features

Mock toggle drives JSON vs API calls

📋 Usage Examples
Button & Tokens
tsx
Copy
Edit
// ✅ token‑driven
<Button variant="primary" size="md" className="px-space-4 py-space-2">
  Save Changes
</Button>
Data Fetch
ts
Copy
Edit
import { useChats } from '@/hooks/useApiQuery';

function ChatList() {
  const { data: chats, isLoading } = useChats();
  if (isLoading) return <SkeletonTable rows={5} />;
  return <EnhancedDataTable columns={columns} data={chats} />;
}
Empty State
tsx
Copy
Edit
<EmptyState
  icon="/images/empty-chats.svg"
  message="No chat requests yet"
  actionLabel="Invite First Chat"
  onActionClick={openInviteModal}
/>
✅ Next Steps
Phase 1: Agent Console – Build the new three‑pane workspace

Phase 2: Engagements & Content – Integrate engagements, docs, FAQs

Phase 3: Production API – Swap /mocks for real backend endpoints

Phase 4: Testing & QA – Add unit, integration, and a11y tests

Phase 5: Storybook – Document components & edge states

By centralizing on static JSON mocks, a single API‑client, and a unified component library, we ensure consistency, reliability, and a smooth path to production.