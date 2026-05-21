import { rest } from "msw";

const fakeUser = { id: "1", email: "test@example.com", aud: "authenticated" };

export const handlers = [
  // Sign up
  rest.post(new RegExp("https?://.*/auth/v1/signup"), async (req, res, ctx) => {
    let email = "test@example.com";
    try {
      const body = await req.json();
      email = body?.email ?? email;
    } catch (e) {
      // ignore
    }
    return res(
      ctx.status(200),
      ctx.json({
        user: { ...fakeUser, email },
        access_token: "fake-access-token",
        refresh_token: "fake-refresh-token",
      })
    );
  }),

  // Token (sign in)
  rest.post(new RegExp("https?://.*/auth/v1/token"), async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: "fake-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "fake-refresh-token",
        user: fakeUser,
      })
    );
  }),

  // Simple users list for /rest/v1/users
  rest.get(new RegExp("https?://.*/rest/v1/users"), (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([fakeUser]));
  }),
];
