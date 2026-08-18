import http from 'k6/http';
import { check, sleep } from 'k6';

const SUPABASE_URL = 'https://giosjwjhalhmwcuyzfos.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_';

export const options = {
  stages: [
    { duration: '20s', target: 7 },
    { duration: '40s', target: 7 },

    { duration: '20s', target: 14 },
    { duration: '40s', target: 14 },

    { duration: '20s', target: 25 },
    { duration: '40s', target: 25 },

    { duration: '20s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const clientId = `k6-${__VU}`;
  const scoreCount = (__ITER % 10) + 1;

  const response = http.post(
    `${SUPABASE_URL}/rest/v1/rpc/k6_autosave_write`,
    JSON.stringify({
      p_client: clientId,
      p_scores: scoreCount,
      p_comment: `autosave test vu=${__VU} iter=${__ITER}`,
    }),
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      tags: { name: 'Supabase autosave RPC' },
    }
  );

  check(response, {
    'autosave returned 200': (r) => r.status === 200,
    'autosave returned ok': (r) => {
      try {
        return r.json('ok') === true;
      } catch (_) {
        return false;
      }
    },
  });

  // Match the app's current autosave cadence.
  sleep(0.65);
}
