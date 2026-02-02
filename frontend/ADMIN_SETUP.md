# Admin Access Setup Guide

## How Admin Access Works

Your app checks if a user is admin by comparing their email to the `ADMIN_EMAIL` environment variable in Convex Dashboard.

**Code location:** `frontend/convex/lib/auth.ts`
```typescript
const isAdmin = user.email === process.env.ADMIN_EMAIL || 
                (user as any).role === "admin";
```

## Critical: Set ADMIN_EMAIL in Production Deployment

Since you have separate dev and production deployments, you need to set `ADMIN_EMAIL` in **both**:

### Step 1: Set in Production Deployment

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. **IMPORTANT:** Make sure you're viewing the **production deployment** (`ardent-hawk-798`)
   - Check the top-left corner - it should say "ardent-hawk-798"
   - If it says "usable-avocet-679", click the deployment selector and switch to production
3. Navigate to **Settings** → **Environment Variables**
4. Find or add `ADMIN_EMAIL`
5. Set it to your **exact email address** (the one you used to sign up)
   - Example: `your-email@example.com`
   - **Important:** Must match exactly (case-sensitive, no spaces)
6. Click **Save**

### Step 2: Verify Email Match

The email comparison is **case-sensitive**. Make sure:

- ✅ `ADMIN_EMAIL` in Convex = `your-email@example.com`
- ✅ Email you signed up with = `your-email@example.com`
- ✅ No extra spaces or characters
- ✅ Same capitalization

### Step 3: Test Admin Access

1. **Log out** of your production site
2. **Log back in** with your admin email
3. Check the sidebar - you should see:
   - "Tag Management" link
   - "Media Type Creator" link
   - "Admin" badge next to your name

## Troubleshooting

### Issue: Still Not Seeing Admin Pages

**Check 1: Right Deployment?**
- Go to Convex Dashboard
- Verify you're in **production** (`ardent-hawk-798`), not dev
- Check that `ADMIN_EMAIL` is set there

**Check 2: Email Match?**
- In Convex Dashboard → Environment Variables
- Copy the exact value of `ADMIN_EMAIL`
- Compare it character-by-character with the email you signed up with
- Make sure there are no spaces, extra characters, or case differences

**Check 3: Logged Out and Back In?**
- Admin status is checked when you log in
- You may need to log out and log back in for changes to take effect

**Check 4: Check Browser Console**
- Open DevTools → Console
- Look for any errors from `checkIsAdmin` query
- Check Network tab for the query response

### Issue: Works in Dev But Not Production

This is expected! You need to set `ADMIN_EMAIL` separately in each deployment:

- **Dev deployment** (`usable-avocet-679`): Set `ADMIN_EMAIL` for local dev
- **Production deployment** (`ardent-hawk-798`): Set `ADMIN_EMAIL` for production

They are separate databases and separate configurations.

## Quick Checklist

- [ ] Opened Convex Dashboard → **Production deployment** (`ardent-hawk-798`)
- [ ] Set `ADMIN_EMAIL` = your exact email address
- [ ] Verified email matches exactly (no spaces, correct case)
- [ ] Saved the environment variable
- [ ] Logged out and logged back in
- [ ] Checked sidebar for admin links

## Alternative: Multiple Admin Emails

If you need multiple admin emails, you can modify the code to support comma-separated emails:

```typescript
// In frontend/convex/lib/auth.ts
const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
const isAdmin = adminEmails.includes(user.email) || (user as any).role === "admin";
```

Then set `ADMIN_EMAIL` in Convex Dashboard as: `email1@example.com,email2@example.com`

---

## Need Help?

If admin access still doesn't work after following these steps:
1. Check Convex Dashboard → Logs for any errors
2. Verify your email in the browser (check what email you're logged in as)
3. Compare it exactly with `ADMIN_EMAIL` in Convex Dashboard
