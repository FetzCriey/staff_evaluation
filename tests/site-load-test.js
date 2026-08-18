import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 7 },
    { duration: '30s', target: 7 },

    { duration: '20s', target: 14 },
    { duration: '30s', target: 14 },

    { duration: '20s', target: 25 },
    { duration: '30s', target: 25 },

    { duration: '20s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const response = http.get(
    'https://fetzcriey.github.io/staff_evaluation/'
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
