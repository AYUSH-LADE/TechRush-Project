# Campus Lost &amp; Found — Frontend Build Instructions for Antigravity

This is a ready-to-paste prompt for Antigravity, built to match your actual backend
exactly (routes, field names, and auth pattern taken from your API Quick Reference
and controller structure). Antigravity is agentic — it scaffolds files, runs the
dev server, and tests in its own browser — so the prompt below is deliberately
detailed rather than a short request.

---

## 1. File Structure (matches your existing repo layout)

```
lost-and-found/
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js              ← base axios instance + JWT interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx       ← logged-in user + token state
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── ItemCard.jsx
    │   │   ├── ItemFilters.jsx
    │   │   └── Loader.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Explore.jsx           ← browse/search all active items
    │   │   ├── ItemDetail.jsx        ← single item view
    │   │   ├── Dashboard.jsx         ← "my reports"
    │   │   ├── ReportItem.jsx        ← report lost/found form
    │   │   └── Admin.jsx             ← flag/remove posts
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 2. Prompt to Paste Into Antigravity

```
GOAL
Build the React frontend for "Campus Lost & Found" — a web app where students
report lost/found items, search for them, and admins moderate posts. Use React
(Vite), React Router, Axios, and Tailwind CSS. Visual style: clean, trustworthy,
campus-utility feel — soft blues, rounded cards, generous spacing, no clutter.

TECH STACK
- React 18 + Vite
- React Router DOM v6
- Axios
- Tailwind CSS
- Context API for auth (no Redux, no localStorage for tokens — keep the token
  in React state/Context only)

FILE STRUCTURE
Create exactly this structure under frontend/:

frontend/
└── src/
    ├── api/axios.js
    ├── context/AuthContext.jsx
    ├── components/ (Navbar, ProtectedRoute, ItemCard, ItemFilters, Loader)
    ├── pages/ (Login, Signup, Explore, ItemDetail, Dashboard, ReportItem, Admin)
    ├── App.jsx
    └── main.jsx

BACKEND API CONTRACT — MATCH THIS EXACTLY
Base URL comes from import.meta.env.VITE_API_BASE_URL (default http://localhost:5000/api).
Every request that changes data needs the header: Authorization: Bearer <token>.
Read-only requests (search, view single item) need no token.

1. POST /api/auth/register  — public
   body (JSON): { name, email, password }
   returns: { user, token }

2. POST /api/auth/login  — public
   body (JSON): { email, password }
   returns: { user, token }

3. POST /api/items  — token required
   body: multipart/form-data with fields:
     title, description, category, location, type ("lost" | "found"), image (file)
   Do NOT send reporter name/id — backend reads it from the token.
   returns: created item

4. GET /api/items?category=&location=&type=&keyword=  — public
   all query params optional, omit any filter not in use
   returns: array of items

5. GET /api/items/:id  — public
   returns: full item details including reporter name + email

6. GET /api/items/mine  — token required
   returns: array of items reported by the logged-in user

7. PUT /api/items/:id/claim  — token required, owner only
   no body — item id in URL
   returns: updated item with status "claimed"

8. DELETE /api/items/:id  — token required, owner only
   no body — item id in URL

9. Admin (token required, role must be "admin"):
   PUT    /api/admin/items/:id/flag   → flags the post
   DELETE /api/admin/items/:id/flag   → removes the post
   A non-admin token gets rejected — handle this as a 403 error state in the UI.

There is also GET /health on the backend (no /api prefix) for a basic server
status check — not needed in the UI, just be aware it exists.

PAGE-BY-PAGE REQUIREMENTS

1. Login.jsx
   - Email + password form
   - On submit, POST /api/auth/login, store { user, token } in AuthContext
   - On success, redirect to /dashboard
   - Show inline error on 401 (invalid credentials)
   - Link to Signup

2. Signup.jsx
   - Name, email, password form
   - On submit, POST /api/auth/register, store { user, token } in AuthContext
   - On success, redirect to /dashboard
   - Show inline error if email already exists

3. Explore.jsx (public, default landing route "/")
   - Filter bar: category, location, type (lost/found), keyword — all optional
   - On filter change, call GET /api/items with the relevant query params built
     from non-empty filters only
   - Render results as a responsive grid of ItemCard (image, title, category,
     location, type badge)
   - Empty state when no items match
   - Loading state while fetching

4. ItemDetail.jsx  (route: /items/:id)
   - GET /api/items/:id on mount
   - Show image, title, description, category, location, type, status,
     reporter name and email
   - If logged in AND item.reportedBy matches current user AND status is not
     "claimed": show a "Mark as Claimed" button → PUT /api/items/:id/claim,
     then refresh the item
   - If logged in AND item.reportedBy matches current user: show a "Delete"
     button → DELETE /api/items/:id, then redirect to /dashboard
   - If not the owner, just show reporter contact info so they can reach out

5. Dashboard.jsx  (protected route)
   - GET /api/items/mine on mount
   - List the user's own reports with status badges (active/claimed)
   - Each item links to ItemDetail
   - Empty state: "You haven't reported anything yet" with a button to /report

6. ReportItem.jsx  (protected route, route: /report)
   - Form fields: title, description, category (dropdown), location, type
     (radio: Lost / Found), image (file input with preview)
   - Submit as multipart/form-data to POST /api/items with the JWT header
   - On success, redirect to /dashboard
   - Client-side validation: all fields required except image is optional
     unless you decide to require it — default to optional

7. Admin.jsx  (protected route, admin-role only)
   - If current user role !== "admin", redirect to "/"
   - List all items (reuse GET /api/items with no filters, or a dedicated
     admin listing if you prefer)
   - Each item has "Flag" (PUT /api/admin/items/:id/flag) and "Remove"
     (DELETE /api/admin/items/:id/flag) buttons
   - Handle 403 gracefully with an inline "not authorized" message if the
     token turns out not to be an admin token

ROUTING (App.jsx)
/            → Explore (public)
/login       → Login (public)
/signup      → Signup (public)
/items/:id   → ItemDetail (public)
/report      → ReportItem (protected)
/dashboard   → Dashboard (protected)
/admin       → Admin (protected, admin only)

Wrap protected routes in a ProtectedRoute component that checks AuthContext
for a valid token and redirects to /login if missing (and to / if an admin
route is hit by a non-admin).

AXIOS SETUP (api/axios.js)
- Create one axios instance with baseURL from VITE_API_BASE_URL
- Add a request interceptor that attaches Authorization: Bearer <token> from
  AuthContext when a token exists
- Add a response interceptor that catches 401s and logs the user out
  (clears AuthContext, redirects to /login)

DESIGN GUIDELINES
- Mobile-first, test at 375px / 768px / 1280px
- Tailwind only, no separate CSS files beyond a minimal index.css reset
- Rounded-xl cards, soft shadows, consistent spacing
- Primary color: calm blue; status badges: green = active/found-available,
  gray = claimed
- Every page needs a visible loading state and a friendly error state —
  never leave a blank screen on a failed request
- Icons: lucide-react

WHAT TO DO
1. Scaffold the Vite + React + Tailwind project matching the file structure above
2. Implement AuthContext and the axios instance first — everything else depends
   on them
3. Build each page per the requirements above, wired directly to the real API
   contract (no mock data needed — the backend already exists and matches this
   contract exactly)
4. Run the dev server and click through every route to confirm nothing errors,
   including the protected-route redirects and the admin 403 handling
5. Do not modify or create any backend files — this is frontend-only

When done, summarize what was built and flag anything you had to assume or
guess about (e.g. exact category list, exact location list) so I can confirm
or correct it.
```

---

## 3. Notes Before You Run This

- **Category and location lists aren't specified** in your API reference — Antigravity will likely invent placeholder options (e.g. Electronics, Bags, Documents). Decide your real list now and either edit the prompt's dropdown values or correct the agent's output afterward.
- **Claim vs Flag/Remove naming**: your admin endpoints use `/flag` for both flagging *and* removing (`PUT` flags, `DELETE` on the same path removes) — this is called out explicitly in the prompt so Antigravity doesn't invent a different URL pattern.
- **No token in localStorage**: kept as an explicit rule since agentic tools often default to `localStorage` for auth persistence, which fails in some sandboxed environments and is generally worth avoiding here.
