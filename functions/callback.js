export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.REDIRECT_URI,
      }),
    }
  );

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    const html = `<!DOCTYPE html>
<html>
<body>
<script>
window.opener.postMessage(
  'authorization:github:error:${tokenData.error_description}',
  '*'
);
window.close();
</script>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  const token = tokenData.access_token;

  const html = `<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<script>
(function() {
  var msg = 'authorization:github:success:{"token":"${token}","provider":"github"}';
  window.opener.postMessage(msg, window.location.origin);
  setTimeout(function() { window.close(); }, 1000);
})();
</script>
<p>Connexion réussie, fermeture...</p>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
