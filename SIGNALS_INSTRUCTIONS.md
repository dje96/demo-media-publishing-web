# Snowplow Signals Integration Instructions

## Prompt for LLM Agent

Use this prompt when asking an LLM to implement Snowplow Signals integration in a new application:

---

**I want to integrate Snowplow Signals into my Next.js application to provide personalized recommendations based on user behavior attributes calculated from Snowplow events.**

### Context

- I have Snowplow tracking already set up in my application
- I have a Signals service configured in Snowplow Console with calculated user attributes
- I have my Signals API credentials (API URL, API Key, API Key ID, Organization ID)
- I want to use these attributes to personalize content/product recommendations

### Documentation Reference

Please refer to the official Snowplow Signals documentation:
- **Connection Guide:** https://docs.snowplow.io/docs/signals/connection/#signals-nodejs-sdk
- **Retrieving Attributes:** https://docs.snowplow.io/docs/signals/retrieve-attributes/

### Implementation Requirements

1. **Install the Signals Node.js SDK** - Use `@snowplow/signals-node` package

2. **Create a Server-Side API Route** (CRITICAL - See Roadblocks below)
   - Create a Next.js API route at `/app/api/signals/route.ts`
   - This route must handle the Signals API calls server-side
   - Accept session ID from client, call Signals API, return attributes

3. **Retrieve Snowplow Session ID**
   - Primary: Use `window.snowplow('getSessionId')` if tracker is available
   - Fallback: Parse from `_sp_id` cookie (see critical parsing details below)

4. **Build Personalization Logic**
   - Create function to fetch user attributes via your API route
   - Use attributes to filter/sort/rank recommendations
   - Always include fallback to default recommendations

5. **Update UI Component**
   - Make it a client component (`'use client';`)
   - Use React hooks for async loading
   - Show loading states and handle errors gracefully

### Critical Roadblocks & Solutions

#### 1. CORS Error (MOST IMPORTANT)
**Problem:** Direct browser calls to Signals API fail with CORS errors:
```
Access to XMLHttpRequest at 'https://...signals.snowplowanalytics.com' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:** NEVER call Signals API directly from browser. ALWAYS use a server-side Next.js API route. The browser calls YOUR API route, which then calls Signals API server-side (no CORS restrictions).

#### 2. Session ID Cookie Parsing
**Problem:** The session ID is in a specific position in the cookie, and cookie names have suffixes.

**Details:**
- Cookie name format: `_sp_id.1fff` (has suffix, not just `_sp_id`)
- Use `name.startsWith('_sp_id')` to find the cookie
- Cookie value format: `domain_userid.timestamp.visit_count.last_event.previous_session.CURRENT_SESSION_ID.other.data`
- **The session ID is at INDEX 5** (not 4) when splitting by dots
- Example: `parts[5]` contains the actual session ID UUID

#### 3. Snowplow Tracker Timing
**Problem:** Tracker may not be initialized when you try to access it.

**Solution:** Add a delay (~1 second) before trying to access `window.snowplow('getSessionId')`, or rely on cookie fallback.

#### 4. Client Component Directive
**Problem:** Components using React hooks (`useState`, `useEffect`) fail with error about needing client component.

**Solution:** Add `'use client';` directive at the very top of any component file that uses React hooks.

#### 5. Empty Session ID Handling
**Problem:** If session ID retrieval fails, empty string causes API errors.

**Solution:** Always check if session ID exists before making API calls. Return early or use fallback if empty.

### What to Avoid

1. ❌ **Don't call Signals API directly from browser** - Always use server-side API route
2. ❌ **Don't use index 4 for session ID** - Use index 5 from cookie
3. ❌ **Don't match cookie name exactly** - Use `startsWith('_sp_id')` because of suffixes
4. ❌ **Don't forget `'use client';` directive** - Required for components using hooks
5. ❌ **Don't skip error handling** - Always provide fallbacks for when Signals is unavailable
6. ❌ **Don't hardcode session IDs** - Always retrieve dynamically from tracker or cookie
7. ❌ **Don't skip loading states** - Users need feedback while fetching recommendations

### Best Practices

1. ✅ **Always provide fallbacks** - Default recommendations if Signals unavailable
2. ✅ **Handle errors gracefully** - Try-catch blocks around all Signals calls
3. ✅ **Show loading states** - Skeleton loaders while fetching
4. ✅ **Log for debugging** - Console logs for successful attribute retrieval (optional)
5. ✅ **Test with real data** - Wait for Signals to calculate attributes before testing
6. ✅ **Use environment variables** - Store API credentials in `.env.local` (not hardcoded)

### Testing Checklist

- [ ] Verify API route works (no CORS errors)
- [ ] Confirm session ID is retrieved correctly
- [ ] Check that attributes are returned from Signals
- [ ] Test fallback behavior when no attributes available
- [ ] Verify loading states display properly
- [ ] Test error handling (temporarily break connection)
- [ ] Confirm recommendations change based on user behavior

### Example Personalization Strategies

Based on your Signals attributes, you can personalize by:
- Most engaged category/product type (using heartbeat metrics)
- Last viewed category/brand/collection
- User activity level (show trending items to active users)
- Multiple attribute combinations

Always include fallback logic for new users without calculated attributes yet.

---

## Additional Notes

- Signals attributes may take a few minutes to calculate after events are tracked
- The session ID changes when a new session starts
- Some attributes may be arrays, others may be single values - check your Signals service configuration
- Consider caching recommendations briefly to avoid excessive API calls

