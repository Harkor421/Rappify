#!/usr/bin/env node
/**
 * Tries to refresh a set of Rappi bearer tokens by hitting
 * /ms/application-user/auth. Reports HTTP status and whether the server
 * handed back an X-Refresh-Token. Useful for diagnosing "is this token
 * fully dead or just stale?" without touching the production gist.
 *
 * Usage:
 *   node scripts/test-refresh.mjs              # test the hardcoded set
 *   node scripts/test-refresh.mjs <auth> <dev> # test a single pair
 */

const AUTH_ENDPOINT = "https://services.grability.rappi.com/ms/application-user/auth";

const CANDIDATES = [
  {
    label: "current-gist (Jun 02)",
    authorization:
      "Bearer ft.gAAAAABqH2ILKUMRhFFx5duGvx6m-ftzomB8se22UIBdYxqHKRZRZat0GGBzACQtktvt2r9D0-cM7lg6FYen1TPvG5FUUuQIQMcsVB538e8CIzjMDKGfjh8FMtpmZ5Jft6HJqrFLfei1u8SOoBPaNOzRaVQomUZwQvFfQlSlgEWlCNf8hebOIn6sAMHtfSw6HT9rprJiMJ83YIX8rSHETwUSxrcbomM663ZDVJ-qqV7xI1L3MbdBKHUWG8-zMZDAz8Y0-nvVXtEO0uPFztexDX0c-4X9V75jV8yj0gy_5bvkFgrVTB9PkIcM9Q7yxbMlFHNd9HEPy66BK5IGxD_ZDdFzk3Vepk5-N7F_vtKIRoxv-u2rpkbCHqODpFYpfp9VnVgBlSs19ixBXc9VawbBZDga2mFS7V7eUA==",
    deviceid: "a61c9d41-4e2f-460b-a5ce-378c3baf4212",
    app_version: "1.156.0",
  },
  {
    label: "prev-gist (May 25)",
    authorization:
      "Bearer ft.gAAAAABqE_XPbM-8vlYGD8hpV4H_Nw6IStMQ8aP6fzsm3tVG0OgoxfjxSWhSo4bOx82eL6wjSNyytUEzqzmOBXKjMUubGNJ6-nDR1A1n0Jlaanux2-_mbFxCjOfM9do_ofnZUwMxwh_4qzaN6InTaiUKkxCKm5TIoTHS7vjWwsdoqGSsH1BIWjCdSuCAK8EBYcg6MGVif4rqFNRk0aTkTpTrs2T1KY5WX4t2jOYZT8AlLz41hUBDTrkv0uwK_NypAQq0fNshZOJ1f594oX4sg-agzPOPfC7WXp76lRDPQVd4O6zxzV8F_1ctqoiU7iOkOpnXhCznu5RudrlB62pVj-NNIFeL3IJAVrLA8bBHdMVvVZ_dcPm55jD16PhoH3KUX8EkADY1juYxaxYKsQWFLuqD8m1UtPO5sw==",
    deviceid: "de1f3359-277e-4239-832a-b9165fa80e1a",
    app_version: "1.161.2",
  },
  {
    label: "oldest-gist (May 25)",
    authorization:
      "Bearer ft.gAAAAABqApwGMbRWYCA9RCVYHT5ukR5BzNL7Dkv43lFVWg6PQWQmwY6qFN7H4gjJp5lJJWbOK6DTooQ1NEEDADS-Z_nberwTLqoHpo4OFiDBkr_dTAFPYshzEmMM4fY4NdmYO0PZvYMpa-c9En1pCPlIMDoUSvtFFODKyFCJs8gC0HTNGbA3uC_f4M3GipegL68V_JcnYi_RfiMrtSGsIBbIMmUrKO284_KD5F_Cj3jhm0xwx2DceKZsXoHJLEG3YN0weQgf41Vhcn6612ibukZLL75aMM9yfI0RRk4xExrig5SXGUNv-CQzFwrb41E3s1l4eY0ww5Cg_UgcM8X0EcNo-uKjPWX2pEh_WVoaxudldTrU00cWdq35G_98VwhCDFeX9xEA64D_JaoxKrQfiMDH5Qj9plwkvQ==",
    deviceid: "4f6aff85-ccfe-4bfd-8f4b-f742ac962f02",
    app_version: "1.161.2",
  },
];

function buildHeaders({ authorization, deviceid, app_version }) {
  const ver = app_version || "1.156.0";
  return {
    accept: "application/json",
    "accept-language": "es-CO",
    "app-version": ver,
    "app-version-name": ver,
    authorization,
    "content-type": "application/json; charset=UTF-8",
    deviceid,
    needappsflyerid: "false",
    vendor: "rappi",
    "x-application-id": `rappi-home-web/v${ver}`,
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    origin: "https://www.rappi.com.co",
    referer: "https://www.rappi.com.co/",
  };
}

async function testOne(creds) {
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(AUTH_ENDPOINT, {
      method: "GET",
      headers: buildHeaders(creds),
    });
  } catch (err) {
    return { ok: false, error: err.message, ms: Date.now() - t0 };
  }
  const ms = Date.now() - t0;
  const allHeaders = {};
  res.headers.forEach((v, k) => {
    allHeaders[k] = v;
  });
  let body = null;
  try {
    const text = await res.text();
    body = text || null;
  } catch {
    /* ignore */
  }
  return {
    status: res.status,
    ok: res.ok,
    headers: allHeaders,
    body,
    ms,
  };
}

function looksLikeBearer(value) {
  if (!value || typeof value !== "string") return false;
  const stripped = value.replace(/^Bearer\s+/i, "");
  return stripped.startsWith("ft.") && stripped.length > 80;
}

function fingerprint(token) {
  if (!token) return "n/a";
  const stripped = token.replace(/^Bearer\s+/i, "");
  return `${stripped.slice(0, 18)}…${stripped.slice(-8)} (len ${stripped.length})`;
}

async function main() {
  const args = process.argv.slice(2);
  const targets = args.length >= 2
    ? [{
        label: "cli-arg",
        authorization: args[0].startsWith("Bearer ") ? args[0] : `Bearer ${args[0]}`,
        deviceid: args[1],
        app_version: args[2] || "1.156.0",
      }]
    : CANDIDATES;

  console.log(`Testing ${targets.length} token(s) against ${AUTH_ENDPOINT}\n`);

  const successes = [];
  for (const t of targets) {
    process.stdout.write(`▸ ${t.label.padEnd(24)} `);
    process.stdout.write(`fp=${fingerprint(t.authorization)}\n`);
    const r = await testOne(t);
    if (r.error) {
      console.log(`  ✗ network error: ${r.error}`);
    } else {
      console.log(`  status: ${r.status}  (${r.ms}ms)`);
      console.log(`  headers:`);
      for (const [k, v] of Object.entries(r.headers)) {
        const preview = v.length > 80 ? v.slice(0, 60) + "…(" + v.length + ")" : v;
        console.log(`    ${k}: ${preview}`);
      }
      const refreshHeader = r.headers["x-refresh-token"];
      if (looksLikeBearer(refreshHeader)) {
        console.log(`  ✓ X-Refresh-Token looks like a bearer: ${fingerprint(refreshHeader)}`);
        successes.push({ candidate: t, refreshed: refreshHeader });
      } else if (refreshHeader) {
        console.log(
          `  ⚠ X-Refresh-Token present but value is "${refreshHeader}" — likely a flag, not a bearer`,
        );
      }
      if (r.body) {
        const bodyPreview = r.body.length > 400 ? r.body.slice(0, 400) + "…" : r.body;
        console.log(`  body: ${bodyPreview}`);
      }
    }
    console.log("");
  }

  if (successes.length === 0) {
    console.log("Result: NO usable refresh token returned.");
    console.log("Either all bearers are dead, or the refresh mechanism isn't via X-Refresh-Token.");
    console.log("Inspect the headers/body above for clues (cookies? a different header? body?).");
    process.exit(1);
  }

  console.log(`Result: ${successes.length} token(s) refreshable. Use:\n`);
  for (const s of successes) {
    const out = {
      authorization: s.refreshed.startsWith("Bearer ") ? s.refreshed : `Bearer ${s.refreshed}`,
      deviceid: s.candidate.deviceid,
      app_version: s.candidate.app_version,
      updated_at: new Date().toISOString(),
    };
    console.log(`# ${s.candidate.label} — refreshed`);
    console.log(JSON.stringify(out, null, 2));
    console.log("");
  }
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
