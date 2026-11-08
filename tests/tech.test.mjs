import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTech, lookup } from '../tinycharts/build/tech.mjs';

const OBJECTS = ['rack', 'dbCyl', 'queue', 'gateway', 'browser', 'phone', 'cloud', 'bucket', 'devbox', 'lock', 'container'];
const t = loadTech();

test('aliases and case reach one key', () => {
  for (const n of ['K8s', 'kubernetes', 'Kubernetes', ' k8s ']) assert.equal(lookup(t, n).key, 'kubernetes');
  for (const n of ['PostgreSQL', 'postgres', 'Postgres']) assert.equal(lookup(t, n).key, 'postgresql');
  assert.equal(lookup(t, 'Node.js').key, 'nodejs');
  assert.equal(lookup(t, 'Kafka').object, 'queue');
});

test('an unknown name lists the three closest', () => {
  assert.throws(() => lookup(t, 'kafak'), e => /^Unknown technology "kafak"\. Closest: /.test(e.message) && /kafka/.test(e.message) && e.message.split(',').length === 3);
});

test('every entry names a known object and at least one logo source or none on purpose', () => {
  assert.ok(Object.keys(t).length >= 30);
  for (const [k, e] of Object.entries(t)) {
    assert.ok(OBJECTS.includes(e.object), `${k}: ${e.object}`);
    assert.ok(e.name, `${k} has a name`);
    assert.ok(e.cncf || e.simple || e.devicon || e.logo === false, `${k} has a logo source or logo: false`);
  }
});
