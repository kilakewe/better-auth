# Using Server-Side API Without Authentication

The `skipAuth` flag allows you to call Better Auth API methods from your server without needing user authentication. This is useful for administrative operations, background jobs, or server-side scripts.

## Usage

When calling API methods on the server, you can pass `skipAuth: true` to bypass authentication checks:

```typescript
import { betterAuth } from "better-auth";

const auth = betterAuth({
  // ... your config
  plugins: [admin()] // Include admin plugin for admin operations
});

// Create a user from a server-side script without authentication
const newUser = await auth.api.createUser({
  skipAuth: true,
  body: {
    email: "admin@example.com",
    password: "securePassword",
    name: "Admin User",
    role: "admin",
  },
});

// List all users without authentication
const users = await auth.api.listUsers({
  skipAuth: true,
  query: {
    limit: "100",
  },
});

// Set user roles without authentication
await auth.api.setRole({
  skipAuth: true,
  body: {
    userId: "user-id-here",
    role: "admin",
  },
});
```

## Important Notes

1. **Server-Side Only**: The `skipAuth` flag is intended for server-side use only. Never expose APIs with `skipAuth` to client-side code.

2. **Endpoint Compatibility**: Some endpoints rely on session context (like `updateUser` which updates "the current user"). These endpoints may not work properly with `skipAuth` since there's no session context. Use endpoint-specific methods that accept user IDs explicitly instead.

3. **Security**: Since `skipAuth` bypasses all authentication checks, ensure that:
   - Code using `skipAuth` is only executed server-side
   - Access to server-side code is properly secured
   - You validate and sanitize all inputs

## Example Use Cases

### Background Job to Clean Up Expired Sessions
```typescript
async function cleanupExpiredSessions() {
  const users = await auth.api.listUsers({
    skipAuth: true,
    query: { limit: "1000" },
  });
  
  for (const user of users.users) {
    // Clean up logic here
  }
}
```

### Admin CLI Tool
```typescript
async function promoteUserToAdmin(email: string) {
  const users = await auth.api.listUsers({
    skipAuth: true,
    query: { searchValue: email },
  });
  
  if (users.users.length === 0) {
    console.error("User not found");
    return;
  }
  
  await auth.api.setRole({
    skipAuth: true,
    body: {
      userId: users.users[0].id,
      role: "admin",
    },
  });
  
  console.log(`Successfully promoted ${email} to admin`);
}
```

### Bulk User Import
```typescript
async function importUsers(csvData: Array<{email: string, name: string}>) {
  for (const userData of csvData) {
    await auth.api.createUser({
      skipAuth: true,
      body: {
        email: userData.email,
        name: userData.name,
        password: generateTemporaryPassword(),
        role: "user",
      },
    });
  }
}
```

## Endpoints That Support `skipAuth`

The following endpoints work well with `skipAuth`:

### Admin Plugin Endpoints
- `createUser` - Create a new user
- `listUsers` - List all users with optional filters
- `setRole` - Set a user's role
- `banUser` / `unbanUser` - Ban or unban users
- `listUserSessions` - List sessions for a specific user
- `revokeUserSession` / `revokeUserSessions` - Revoke user sessions
- `removeUser` - Delete a user
- `impersonateUser` - Impersonate a user (creates a session)

Note: Regular endpoints like `updateUser`, `listSessions`, etc. that rely on the current user's session context will not work properly with `skipAuth` since there is no session.
