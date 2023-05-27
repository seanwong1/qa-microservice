import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// A simple counter for http requests

export const requests = new Counter('http_reqs');
// you can specify stages of your test (ramp up/down patterns) through the options object
// target is the number of VUs you are aiming for

export const options = {
  stages: [
    { target: 2500, duration: '30s' },
    { target: 10000, duration: '1m30s' },
    { target: 0, duration: '30s' },
  ],
  // thresholds: {
  //   http_reqs: ['count < 100'],
  // },
};


export default function () {
  const params = {
    product_id: 1967
  };
  const res = http.get('http://localhost:3000/qa/questions', params);

  sleep(1);

  const checkRes = check(res, {
    'status is 200': (r) => r.status === 200,
  });
};