import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, validate } from '../game/settings.js';

test('DEFAULTS.wheelOpenMode is "tap-toggle"', () => {
  assert.equal(DEFAULTS.wheelOpenMode, 'tap-toggle');
});

test('validate({}) injects wheelOpenMode default', () => {
  const result = validate({});
  assert.equal(result.wheelOpenMode, 'tap-toggle');
});

test('validate({wheelOpenMode:"hold"}) preserves valid enum value', () => {
  const result = validate({ wheelOpenMode: 'hold' });
  assert.equal(result.wheelOpenMode, 'hold');
});

test('validate({wheelOpenMode:"tap-toggle"}) preserves tap-toggle', () => {
  const result = validate({ wheelOpenMode: 'tap-toggle' });
  assert.equal(result.wheelOpenMode, 'tap-toggle');
});

test('validate({wheelOpenMode:"garbage"}) coerces to default "tap-toggle"', () => {
  const result = validate({ wheelOpenMode: 'garbage' });
  assert.equal(result.wheelOpenMode, 'tap-toggle');
});

test('validate({wheelOpenMode:null}) coerces to default', () => {
  const result = validate({ wheelOpenMode: null });
  assert.equal(result.wheelOpenMode, 'tap-toggle');
});

test('validate({wheelOpenMode:undefined}) coerces to default', () => {
  const result = validate({ wheelOpenMode: undefined });
  assert.equal(result.wheelOpenMode, 'tap-toggle');
});

test('validate({wheelOpenMode:123}) coerces to default (not a string)', () => {
  const result = validate({ wheelOpenMode: 123 });
  assert.equal(result.wheelOpenMode, 'tap-toggle');
});

test('validate preserves existing keys: muted, reduceMotion, volumes', () => {
  const result = validate({
    muted: false,
    reduceMotion: true,
    musicVolume: 0.5,
    sfxVolume: 0.6,
    wheelOpenMode: 'hold'
  });
  assert.equal(result.muted, false);
  assert.equal(result.reduceMotion, true);
  assert.equal(result.musicVolume, 0.5);
  assert.equal(result.sfxVolume, 0.6);
  assert.equal(result.wheelOpenMode, 'hold');
});

test('validate drops unknown keys, keeps known keys', () => {
  const result = validate({
    wheelOpenMode: 'hold',
    muted: true,
    unknownKey: 'should-be-dropped',
    anotherBadKey: 42
  });
  assert.equal(result.wheelOpenMode, 'hold');
  assert.equal(result.muted, true);
  assert.ok(!('unknownKey' in result));
  assert.ok(!('anotherBadKey' in result));
});

test('validate with non-object input returns defaults including wheelOpenMode', () => {
  const result1 = validate(null);
  const result2 = validate(undefined);
  const result3 = validate('string');
  assert.equal(result1.wheelOpenMode, 'tap-toggle');
  assert.equal(result2.wheelOpenMode, 'tap-toggle');
  assert.equal(result3.wheelOpenMode, 'tap-toggle');
});

test('validate returns fresh object (not mutating input)', () => {
  const input = { wheelOpenMode: 'hold', muted: false };
  const result = validate(input);
  assert.notEqual(result, input);
  assert.equal(input.wheelOpenMode, 'hold');
  assert.equal(result.wheelOpenMode, 'hold');
});

// (hints) Which situational one-shots have fired. A LIST, not a boolean each,
// because hints.js is meant to grow — a new lesson should be one row in that
// table, not a new settings field plus a validator line plus a test.
test('hintsSeen defaults empty and survives validate', () => {
  assert.equal(DEFAULTS.hintsSeen, '');
  assert.equal(validate({}).hintsSeen, '');
  assert.equal(validate({ hintsSeen: 'blindSpot,vendorNearby' }).hintsSeen, 'blindSpot,vendorNearby',
    'must not be dropped as an unknown key, or every hint repeats each session');
});

test('a junk hintsSeen coerces to empty rather than being trusted', () => {
  for (const junk of [1, null, {}, [], true]) {
    assert.equal(validate({ hintsSeen: junk }).hintsSeen, '',
      `${JSON.stringify(junk)} should not survive`);
  }
});

test('an existing player who learned the blind spot is not told again', () => {
  // hintsSeen supersedes the old blindSpotHintSeen boolean. Someone mid-run when
  // this shipped has already had that lesson; re-teaching it would be a
  // regression they would actually notice.
  assert.equal(validate({ blindSpotHintSeen: true }).hintsSeen, 'blindSpot');
  assert.equal(validate({ blindSpotHintSeen: false }).hintsSeen, '');
});

test('a real hintsSeen wins over the legacy flag', () => {
  const r = validate({ hintsSeen: 'vendorNearby', blindSpotHintSeen: true });
  assert.equal(r.hintsSeen, 'vendorNearby');
});
