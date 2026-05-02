export async function onRequest(context) {
  const { env } = context;
  const state = crypto.randomUUID();
  
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.REDIRECT_URI,
    scope: "repo,user",
    state: state,
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}
