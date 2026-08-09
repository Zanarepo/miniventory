const res = await fetch("https://api.resend.com/emails", {
  method: "OPTIONS",
  headers: {
    "Origin": "http://localhost:5173",
    "Access-Control-Request-Method": "POST"
  }
});
console.log(res.status, Object.fromEntries(res.headers.entries()));
