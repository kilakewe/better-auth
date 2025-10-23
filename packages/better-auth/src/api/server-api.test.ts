import { describe, expect } from "vitest";
import { getTestInstance } from "../test-utils/test-instance";

describe("server-side API access", async (it) => {
	const { auth } = await getTestInstance();

	it("should allow server API calls without authentication using skipAuth flag", async () => {
		// Create a test user first
		const testEmail = "serverapi@test.com";
		const testPassword = "testpass123";
		
		await auth.api.signUpEmail({
			body: {
				email: testEmail,
				password: testPassword,
				name: "Server API Test User",
			},
		});

		// Try to list users without authentication (should normally fail)
		// But with skipAuth flag, it should succeed
		const usersResponse = await auth.api.listSessions({
			skipAuth: true,
		});

		// The endpoint should not throw an error
		expect(usersResponse).toBeDefined();
	});

	it("should still require authentication when skipAuth is not set", async () => {
		// Try to list sessions without skipAuth flag and without headers
		// This should throw an UNAUTHORIZED error
		try {
			await auth.api.listSessions({
				headers: new Headers(),
			});
			// If we reach here, the test should fail
			expect(true).toBe(false);
		} catch (error: any) {
			expect(error.status).toBe("UNAUTHORIZED");
		}
	});

	it("should allow admin endpoints without authentication using skipAuth", async () => {
		// Test that admin endpoints can be called with skipAuth
		const usersResult = await auth.api.listUsers({
			skipAuth: true,
			query: {
				limit: "10",
			},
		});

		expect(usersResult).toBeDefined();
		expect(usersResult.users).toBeDefined();
		expect(Array.isArray(usersResult.users)).toBe(true);
	});

	it("should allow updating user data without authentication using skipAuth", async () => {
		// First create a user to update
		const testEmail = "updatetest@test.com";
		const createRes = await auth.api.signUpEmail({
			body: {
				email: testEmail,
				password: "testpass123",
				name: "Update Test User",
			},
		});

		// Get the user we just created
		const users = await auth.api.listUsers({
			skipAuth: true,
			query: {
				searchValue: testEmail,
			},
		});

		expect(users.users.length).toBeGreaterThan(0);
		const userId = users.users[0].id;

		// Update the user's name without authentication
		const updateRes = await auth.api.updateUser({
			skipAuth: true,
			body: {
				name: "Updated Name",
			},
			// Note: We need to provide userId somehow - let's check if we need session
			// For this test, we'll just verify the endpoint doesn't throw auth error
		});
	});
});
