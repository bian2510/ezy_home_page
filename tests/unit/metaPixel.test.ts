import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PIXEL_ID = '4151136948525094';
const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body'), html.indexOf('</body>'));

describe('Meta Pixel en index.html', () => {
  it('should init the pixel and track the first PageView from the head', () => {
    expect(head).toContain('https://connect.facebook.net/en_US/fbevents.js');
    expect(head).toContain(`fbq('init', '${PIXEL_ID}')`);
    expect(head).toContain("fbq('track', 'PageView')");
  });

  it('should ship the noscript fallback in the body, where an img is valid', () => {
    expect(body).toContain(`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`);
  });
});
