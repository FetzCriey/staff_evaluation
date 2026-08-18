import http from 'k6/http';
import { check } from 'k6';
import { WebSocket } from 'k6/websockets';
import { Counter, Rate, Trend } from 'k6/metrics';

const SUPABASE_URL = 'https://giosjwjhalhmwcuyzfos.supabase.co';
const PROJECT_REF = 'giosjwjhalhmwcuyzfos';
const SUPABASE_KEY = 'sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_';

const realtimeEvents = new Counter('realtime_events');
const realtimeSystemErrors = new Counter('realtime_system_errors');
const websocketErrors = new Counter('websocket_errors');
const realtimeLatency = new Trend('realtime_latency', true);
const websocketJoinSuccess = new Rate('websocket_join_success');
const writeSuccess = new Rate('write_success');

export const options = {
  stages: [
    { duration: '10s', target: 7 },
    { duration: '90s', target: 7 },
    { duration: '10s', target: 0 },
  ],
  gracefulRampDown: '5s',
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    websocket_join_success: ['rate>0.99'],
    write_success: ['rate>0.99'],
    realtime_latency: ['p(95)<1000'],
    realtime_events: ['count>0'],
    realtime_system_errors: ['count==0'],
    websocket_errors: ['count==0'],
  },
};

export default function () {
  const clientId = `k6-${__VU}`;
  const topic = 'realtime:k6-realtime-load';
  const wsUrl = `wss://${PROJECT_REF}.supabase.co/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`;

  let seq = 0;
  let joined = false;
  let joinRecorded = false;
  let writeTimer = null;
  let heartbeatTimer = null;
  let heartbeatRef = 10;

  const ws = new WebSocket(wsUrl);

  const stopTimers = () => {
    if (writeTimer !== null) clearInterval(writeTimer);
    if (heartbeatTimer !== null) clearInterval(heartbeatTimer);
    writeTimer = null;
    heartbeatTimer = null;
  };

  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({
      topic,
      event: 'phx_join',
      payload: {
        config: {
          broadcast: { ack: false, self: false },
          presence: { enabled: false },
          postgres_changes: [
            { event: '*', schema: 'public', table: 'k6_realtime_test' },
          ],
          private: false,
        },
      },
      ref: '1',
      join_ref: '1',
    }));

    heartbeatTimer = setInterval(() => {
      ws.send(JSON.stringify({
        topic: 'phoenix',
        event: 'heartbeat',
        payload: {},
        ref: String(heartbeatRef++),
        join_ref: null,
      }));
    }, 20000);
  });

  ws.addEventListener('message', (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (_) {
      return;
    }

    if (msg.event === 'phx_reply' && msg.ref === '1') {
      const ok = msg.payload && msg.payload.status === 'ok';
      websocketJoinSuccess.add(ok);
      joinRecorded = true;

      if (!ok) {
        realtimeSystemErrors.add(1);
        stopTimers();
        ws.close();
        return;
      }

      joined = true;

      writeTimer = setInterval(() => {
        seq += 1;
        const sentAt = new Date().toISOString();

        const response = http.post(
          `${SUPABASE_URL}/rest/v1/rpc/k6_realtime_write`,
          JSON.stringify({
            p_client: clientId,
            p_seq: seq,
            p_sent_at: sentAt,
          }),
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            tags: { name: 'Realtime test write RPC' },
          }
        );

        const okWrite = response.status === 200;
        writeSuccess.add(okWrite);
        check(response, {
          'realtime test write returned 200': (r) => r.status === 200,
        });
      }, 650);

      return;
    }

    if (msg.event === 'system') {
      if (msg.payload && msg.payload.status === 'error') {
        realtimeSystemErrors.add(1);
      }
      return;
    }

    if (msg.event === 'postgres_changes') {
      realtimeEvents.add(1);

      const record = msg.payload && msg.payload.data && msg.payload.data.record;
      if (record && record.sent_at) {
        const sentMs = Date.parse(record.sent_at);
        if (Number.isFinite(sentMs)) {
          const latencyMs = Date.now() - sentMs;
          if (latencyMs >= 0 && latencyMs < 60000) {
            realtimeLatency.add(latencyMs);
          }
        }
      }
    }
  });

  ws.addEventListener('error', () => {
    websocketErrors.add(1);
    if (!joinRecorded) {
      websocketJoinSuccess.add(false);
      joinRecorded = true;
    }
  });

  ws.addEventListener('close', () => {
    stopTimers();
    if (!joinRecorded) {
      websocketJoinSuccess.add(false);
      joinRecorded = true;
    }
  });

  setTimeout(() => {
    if (!joined && ws.readyState === 1) {
      if (!joinRecorded) {
        websocketJoinSuccess.add(false);
        joinRecorded = true;
      }
      realtimeSystemErrors.add(1);
      stopTimers();
      ws.close();
    }
  }, 10000);

  setTimeout(() => {
    stopTimers();
    if (ws.readyState === 1) ws.close();
  }, 120000);
}
