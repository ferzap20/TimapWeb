# Security Audit Report - TIMAP

**Date**: 2026-02-07
**Status**: 🔴 **CRITICAL SECURITY ISSUE IDENTIFIED**

---

## Critical Finding: Inadequate RLS Policies

### Issue Description

The current Row-Level Security (RLS) policies in the database **DO NOT properly enforce authorization**. The policies check if `creator_id IS NOT NULL` but do not verify that the authenticated user actually owns the match.

### Current (INSECURE) Policies

Located in: `supabase/migrations/20260121221403_20260121_fix_security_issues.sql`

```sql
-- UPDATE policy - INSECURE
CREATE POLICY "Creators can update their matches"
  ON matches FOR UPDATE
  USING (creator_id IS NOT NULL)  -- ❌ Only checks field exists!
  WITH CHECK (creator_id IS NOT NULL);  -- ❌ Doesn't verify ownership!

-- DELETE policy - INSECURE
CREATE POLICY "Creators can delete their matches"
  ON matches FOR DELETE
  USING (creator_id IS NOT NULL);  -- ❌ Only checks field exists!
```

### Security Impact

**SEVERITY: HIGH**

- ❌ **Any user can update ANY match** by modifying the creator_id in their request
- ❌ **Any user can delete ANY match** regardless of ownership
- ❌ **Client-side authorization checks in api.ts can be bypassed** by modifying browser requests

### Root Cause

The application uses **anonymous localStorage-based user IDs** instead of proper authentication. This means:

1. There is no server-side session or JWT token to verify user identity
2. The `creator_id` is sent from the client and can be easily modified
3. RLS policies cannot verify if the requester is the actual creator

### Proof of Concept

An attacker could:
```javascript
// In browser console, modify any match:
const { data, error } = await supabase
  .from('matches')
  .update({ title: 'HACKED' })
  .eq('id', 'ANY_MATCH_ID')
  .select();
// This would succeed even if the attacker isn't the creator
```

---

## Recommended Solutions

### Option 1: Implement Proper Authentication (RECOMMENDED)

**Pros**: Most secure, industry standard
**Cons**: Requires user authentication flow
**Effort**: Medium (8-12 hours)

1. Enable Supabase Authentication (email, OAuth, or magic link)
2. Update RLS policies to use `auth.uid()`:
   ```sql
   CREATE POLICY "Creators can update their matches"
     ON matches FOR UPDATE
     USING (auth.uid()::text = creator_id)
     WITH CHECK (auth.uid()::text = creator_id);
   ```
3. Update client code to use `supabase.auth.signIn()`
4. Store user_id from `supabase.auth.getUser()` instead of localStorage

### Option 2: Use Server-Side RPC Functions (MEDIUM SECURITY)

**Pros**: Works with anonymous users
**Cons**: More complex, still vulnerable to determined attackers
**Effort**: Low (2-4 hours)

1. Create Postgres functions that verify creator_id server-side
2. Pass current user_id as parameter and verify within function
3. Use `security definer` functions with internal checks

Example:
```sql
CREATE OR REPLACE FUNCTION safe_update_match(
  p_match_id uuid,
  p_creator_id text,
  p_updates jsonb
)
RETURNS matches
SECURITY DEFINER
AS $$
DECLARE
  v_match matches;
BEGIN
  -- Verify ownership server-side
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;

  IF v_match.creator_id != p_creator_id THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  -- Perform update
  UPDATE matches
  SET ...
  WHERE id = p_match_id
  RETURNING * INTO v_match;

  RETURN v_match;
END;
$$ LANGUAGE plpgsql;
```

### Option 3: Accept the Risk (NOT RECOMMENDED)

**Pros**: No code changes needed
**Cons**: Insecure, data can be tampered with
**Use Case**: Only for development/testing environments

- Document that the app is for demo purposes only
- Add warnings to users about data integrity
- Monitor for abuse and implement rate limiting

---

## Immediate Action Required

**Before deploying to production**, you MUST:

1. ✅ Choose and implement one of the solutions above
2. ✅ Test authorization with curl/Postman by attempting to update another user's match
3. ✅ Add integration tests that verify unauthorized updates are blocked
4. ✅ Document the security model in README

---

## Current Safe Operations

The following operations ARE properly secured by the existing `safe_join_match` RPC function:

- ✅ Joining matches (prevents duplicates, checks capacity)
- ✅ Preventing duplicate participants (enforced by UNIQUE constraint)

---

## Additional Security Recommendations

### 1. Rate Limiting

Implement rate limiting to prevent abuse:
```sql
-- Add to Supabase Edge Functions or use Supabase rate limiting
```

### 2. Input Validation

Current validation is good but could be enhanced:
- ✅ Input sanitization removes `<>` characters
- ✅ Length limits (500 chars)
- ⚠️ Consider using a validation library like `zod` for schema validation

### 3. Audit Logging

Add audit trail for match modifications:
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text,
  record_id uuid,
  action text,
  user_id text,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);
```

---

## Verification Checklist

After implementing fixes, verify:

- [ ] Attempt to update another user's match (should FAIL)
- [ ] Attempt to delete another user's match (should FAIL)
- [ ] Verify RLS policies block unauthorized access at database level
- [ ] Test with modified browser requests (DevTools network tab)
- [ ] Add automated tests for authorization checks

---

## Contact

For questions about this security audit, refer to:
- Supabase RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
- OWASP Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
