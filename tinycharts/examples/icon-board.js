// The base objects with real logos, then one small request flow that uses
// them, the way a technical sheet would.
const SIZE = [2400, 1700];
const ABOUT = 'the objects technical sheets are drawn with';
const CW = 376, CH = 300, X0 = 72, Y0 = 250;
const SHOW = [
  ['rack', 'Kubernetes'], ['dbCyl', 'PostgreSQL'], ['queue', 'Kafka'], ['gateway', 'Envoy'], ['browser', 'Chrome'], ['phone', 'Android'],
  ['cloud', 'AWS'], ['bucket', 'MinIO'], ['devbox', 'GitHub'], ['lock', 'Vault'], ['container', 'Docker'], ['gateway', 'API'],
];
const AT0 = { user: [-480, 0], browser: [-330, 0], gateway: [-160, 0], rack: [10, 0], db: [330, -80], queue: [240, 90] };
// The message hops over the objects it goes through, the way the arrows go.
const HOME = [-470, -70, 40];
const TRIP = {
  request: [HOME, [-330, -16, 92], [-160, -16, 120], [10, 0, 84]],
  reply: [[10, 0, 84], [-160, 16, 120], [-330, 16, 92], HOME],
};
const last = a => a[a.length - 1];
let AT = 'request', MSG = last(TRIP.request);

function cell(i, obj, name) {
  const cx = X0 + CW / 2 + (i % 6) * CW, top = Y0 + Math.floor(i / 6) * CH;
  OX = cx; OY = top + 170;
  tech(name, 0, 0);
  _text(cx, top + 252, obj, { cls: 'cap', size: 15, anchor: 'middle' });
  _text(cx, top + 274, name === 'API' ? 'no logo: the name in letters' : name, { size: 15, col: LEAD, anchor: 'middle' });
}

function draw(seed) {
  begin(seed);
  title('technical icons', 'Objects for technical sheets');
  subtitle('each technology is an object for its role, with its logo on the side');
  status(AT === 'request' ? 'a request goes in' : 'the reply comes back', 'press send a request');
  SHOW.forEach(([obj, name], i) => cell(i, obj, name));

  OX = 1200; OY = 1250;
  board(-560, -150, 1120, 300, 16, '#e4e7dc', PAL.slate);
  const A = AT0, go = [[A.user, A.browser], [A.browser, A.gateway], [A.gateway, A.rack]];
  group('data-state="request"', () => {
    for (const [a, b] of go) arrow([[a[0] + 45, a[1] - 16], [b[0] - 60, b[1] - 16]]);
    arrow([[A.rack[0] + 35, -15], [A.db[0] - 45, A.db[1] + 10]]);
    arrow([[A.rack[0] + 15, 35], [A.queue[0] - 45, A.queue[1] - 70]]);
    const [px, py] = P(120, -120);
    out.push('<g class="on">'); pill(px, py - 20, 'request', { lit: true }); nowTag(px - 70, py - 28); out.push('</g>');
  });
  group('data-state="reply"', () => {
    for (const [a, b] of go) arrow([[b[0] - 45, b[1] + 16], [a[0] + 60, a[1] + 16]]);
    const [px, py] = P(-245, 150);
    pill(px, py + 30, 'reply');
    out.push('<g class="on">'); pill(px, py + 30, 'reply', { lit: true }); nowTag(px - 60, py + 22); out.push('</g>');
  });
  who(...A.user, { shirt: PAL.rose, hair: 'bun', arm: 'out', look: 1, say: 'Where is my order?' });
  tech('Chrome', ...A.browser);
  tech('NGINX', ...A.gateway);
  tech('Kubernetes', ...A.rack);
  tech('PostgreSQL', ...A.db);
  tech('Kafka', ...A.queue);
  group('id="msg"', () => {
    message(...MSG, { col: AT === 'request' ? PAL.sky : PAL.leaf });
    const [mx, my] = P(...MSG);
    _text(mx + 40, my - 22, AT === 'request' ? 'GET /orders' : '200 OK · 3 orders', { cls: 'cap', size: 16 });
  });

  label(72, 1200, 'the gateway', 'every call comes through here', [A.gateway[0], A.gateway[1] + 30, 40]);
  label(72, 990, 'the user', 'a browser, nothing to install', [A.user[0], A.user[1], 40]);
  label(2328, 1330, 'the data', 'orders live in Postgres', [A.db[0], A.db[1], 50], 'end');
  label(2328, 1520, 'the events', 'an order event goes on Kafka', [A.queue[0], A.queue[1] + 48, 20], 'end');
  footnote('Illustrative: logos are trademarks of their owners, recoloured to the marker palette. Sources: icons/logos/SOURCES.md.', 2256);
  finish();
}

function init(ctx) {
  // trip counts the flights; the end of a flight that goto replaced does nothing
  let back = 0, trip = 0;
  const show = () => { draw(7); ctx.state(AT); };
  const fly = id => {
    const me = ++trip;
    AT = id; MSG = TRIP[id][0]; show();
    ctx.say(id === 'request' ? 'The browser asks for the orders.' : 'Orders come back from the cluster.');
    hops(ctx, document.getElementById('msg'), TRIP[id], { then: () => {
      if (me !== trip) return;
      MSG = last(TRIP[id]); show();
      if (id === 'request' && !ctx.still) { clearTimeout(back); back = setTimeout(() => fly('reply'), 500); }
    } });
  };
  const send = () => { clearTimeout(back); fly('request'); };
  ctx.button('send a request', () => (AT === 'request' ? ctx.no('A request is on its way. Wait for the reply.') : send()));
  ctx.hint('Press Play all, or send a request.');
  ctx.follow(true);
  send();
  return {
    goto(id, play) {
      clearTimeout(back); trip++;
      if (play) return fly(id);
      AT = id; MSG = last(TRIP[id]); show();
      ctx.say(id === 'request' ? 'A request goes in.' : 'The reply comes back.');
    },
    story: ['request', 'reply'],
  };
}
