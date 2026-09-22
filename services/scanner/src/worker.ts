import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { Observation, Collectors } from '@webspor/contracts';
import { validateAndNormalizeTargetUrl, redactUrlToOrigin, sanitizeCookieName } from '@webspor/rules';

export interface WorkerExecutionResult {
  observations: Observation[];
  collectors: Collectors;
  limitations: string[];
  finalOrigin: string;
  finalHttpStatus: number;
  finalContentType: string;
}

export class ScanWorker {
  private maxRequests = 200;
  private maxOrigins = 40;

  public async runScan(targetUrl: string): Promise<WorkerExecutionResult> {
    const startTime = Date.now();
    const observations: Observation[] = [];
    const limitations: string[] = ['PASSIVE_BASELINE_NO_CLICK', 'GET_HEAD_ONLY', 'SINGLE_ORIGIN_VISIT'];

    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    const collectors: Collectors = {
      network: { status: 'not_run', startedAt: new Date().toISOString() },
      cookies: { status: 'not_run', startedAt: new Date().toISOString() },
      storage: { status: 'not_run', startedAt: new Date().toISOString() },
      headers: { status: 'not_run', startedAt: new Date().toISOString() },
      transport: { status: 'not_run', startedAt: new Date().toISOString() },
    };

    const seenOrigins = new Set<string>();
    let requestCount = 0;
    let droppedCount = 0;
    let finalOrigin = redactUrlToOrigin(targetUrl);
    let finalHttpStatus = 200;
    let finalContentType = 'text/html';

    let obsCounter = 1;
    const nextObsId = (prefix: string) => `obs-${prefix}-${String(obsCounter++).padStart(3, '0')}`;

    try {
      // S-03: Launch single-use Chromium with sandbox active (never --no-sandbox or ignoreHTTPSErrors)
      browser = await chromium.launch({
        headless: true,
        args: ['--disable-extensions', '--disable-component-update'],
      });

      context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: 'da-DK',
        timezoneId: 'Europe/Copenhagen',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 WebSpor/1.0 (+https://teknologivejlederen.dk)',
        serviceWorkers: 'block',
        ignoreHTTPSErrors: false, // S-03: No certificate bypass
      });

      page = await context.newPage();
      collectors.network.status = 'complete';

      // Intercept and enforce network policy (GET/HEAD only, S-01 destination check, resource caps)
      await page.route('**/*', async (route) => {
        const req = route.request();
        const method = req.method().toUpperCase();
        const reqUrl = req.url();
        const reqOrigin = redactUrlToOrigin(reqUrl);
        const resourceType = req.resourceType();
        const relTime = Date.now() - startTime;
        const reqRef = `req-${obsCounter}`;

        // 1. Enforce GET/HEAD only
        if (method !== 'GET' && method !== 'HEAD') {
          observations.push({
            id: nextObsId('net'),
            kind: 'request_blocked',
            collector: 'network',
            observedAt: new Date().toISOString(),
            data: {
              requestRef: reqRef,
              origin: reqOrigin,
              method,
              resourceType,
              relativeTimeMs: relTime,
              reasonCode: 'METHOD_DISALLOWED',
            },
          });
          await route.abort('blockedbyclient');
          return;
        }

        // 2. Destination policy check (S-01 / S-02)
        const val = validateAndNormalizeTargetUrl(reqUrl, false);
        if (!val.valid) {
          observations.push({
            id: nextObsId('net'),
            kind: 'request_blocked',
            collector: 'network',
            observedAt: new Date().toISOString(),
            data: {
              requestRef: reqRef,
              origin: reqOrigin,
              method: method as 'GET' | 'HEAD',
              resourceType,
              relativeTimeMs: relTime,
              reasonCode: val.errorCode || 'DESTINATION_DISALLOWED',
            },
          });
          await route.abort('blockedbyclient');
          return;
        }

        // 3. Resource limit check
        requestCount++;
        seenOrigins.add(reqOrigin);

        if (requestCount > this.maxRequests || seenOrigins.size > this.maxOrigins) {
          droppedCount++;
          collectors.network.status = 'partial';
          collectors.network.reasonCode = 'RESOURCE_LIMIT';
          collectors.network.droppedCount = droppedCount;
          if (!limitations.includes('RESOURCE_LIMIT')) {
            limitations.push('RESOURCE_LIMIT');
          }
          await route.abort('blockedbyclient');
          return;
        }

        // Record attempt
        observations.push({
          id: nextObsId('net'),
          kind: 'request_attempt',
          collector: 'network',
          observedAt: new Date().toISOString(),
          data: {
            requestRef: reqRef,
            origin: reqOrigin,
            method: method as 'GET' | 'HEAD',
            resourceType,
            relativeTimeMs: relTime,
          },
        });

        await route.continue();
      });

      // Track responses
      page.on('response', (res) => {
        const resUrl = res.url();
        const resOrigin = redactUrlToOrigin(resUrl);
        const status = res.status();
        const relTime = Date.now() - startTime;

        observations.push({
          id: nextObsId('net'),
          kind: 'response_received',
          collector: 'network',
          observedAt: new Date().toISOString(),
          data: {
            requestRef: `req-res-${obsCounter}`,
            origin: resOrigin,
            status,
            relativeTimeMs: relTime,
            mimeType: res.headers()['content-type']?.split(';')[0],
          },
        });
      });

      // Navigate with 15s timeout
      const response = await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      if (response) {
        finalHttpStatus = response.status();
        finalContentType = response.headers()['content-type'] || 'text/html';
        finalOrigin = redactUrlToOrigin(page.url());

        // Header collector
        collectors.headers.status = 'complete';
        collectors.headers.startedAt = new Date().toISOString();
        const headers = response.headers();

        // Check HSTS
        const hstsVal = headers['strict-transport-security'];
        observations.push({
          id: nextObsId('hdr'),
          kind: 'header_check',
          collector: 'headers',
          observedAt: new Date().toISOString(),
          data: {
            headerName: 'Strict-Transport-Security',
            present: !!hstsVal,
            parserStatus: hstsVal ? (hstsVal.includes('max-age=0') ? 'invalid' : 'valid') : 'missing',
            normalizedDirectives: hstsVal ? { 'max-age': parseInt(hstsVal.match(/max-age=(\d+)/)?.[1] || '0', 10) } : {},
          },
        });

        // Check CSP
        const cspVal = headers['content-security-policy'];
        observations.push({
          id: nextObsId('hdr'),
          kind: 'header_check',
          collector: 'headers',
          observedAt: new Date().toISOString(),
          data: {
            headerName: 'Content-Security-Policy',
            present: !!cspVal,
            parserStatus: cspVal ? 'valid' : 'missing',
            normalizedDirectives: cspVal ? { 'policy': 'present' } : {},
          },
        });

        // Check Referrer-Policy
        const refVal = headers['referrer-policy'];
        observations.push({
          id: nextObsId('hdr'),
          kind: 'header_check',
          collector: 'headers',
          observedAt: new Date().toISOString(),
          data: {
            headerName: 'Referrer-Policy',
            present: !!refVal,
            parserStatus: refVal ? 'valid' : 'missing',
            normalizedDirectives: refVal ? { policy: refVal.toLowerCase().trim() } : {},
          },
        });

        // Check nosniff
        const nosniffVal = headers['x-content-type-options'];
        observations.push({
          id: nextObsId('hdr'),
          kind: 'header_check',
          collector: 'headers',
          observedAt: new Date().toISOString(),
          data: {
            headerName: 'X-Content-Type-Options',
            present: !!nosniffVal,
            parserStatus: nosniffVal && nosniffVal.toLowerCase().includes('nosniff') ? 'valid' : 'missing',
            normalizedDirectives: nosniffVal ? { value: nosniffVal.trim() } : {},
          },
        });

        // Check X-Frame-Options
        const xfoVal = headers['x-frame-options'];
        observations.push({
          id: nextObsId('hdr'),
          kind: 'header_check',
          collector: 'headers',
          observedAt: new Date().toISOString(),
          data: {
            headerName: 'X-Frame-Options',
            present: !!xfoVal,
            parserStatus: xfoVal ? 'valid' : 'missing',
            normalizedDirectives: xfoVal ? { value: xfoVal.trim() } : {},
          },
        });

        collectors.headers.finishedAt = new Date().toISOString();
      }

      // Transport collector
      collectors.transport.status = 'complete';
      const isHttps = page.url().startsWith('https://');
      observations.push({
        id: nextObsId('trans'),
        kind: 'transport',
        collector: 'transport',
        observedAt: new Date().toISOString(),
        data: {
          finalScheme: isHttps ? 'https' : 'http',
          tlsStatus: isHttps ? 'valid' : 'none',
          downgraded: targetUrl.startsWith('https://') && !isHttps,
        },
      });

      // Passive wait 4 seconds for scripts/subresources
      await page.waitForTimeout(4000);

      // Cookies collector
      collectors.cookies.status = 'complete';
      collectors.cookies.startedAt = new Date().toISOString();
      const rawCookies = await context.cookies();
      for (const rc of rawCookies) {
        observations.push({
          id: nextObsId('cookie'),
          kind: 'cookie_stored',
          collector: 'cookies',
          observedAt: new Date().toISOString(),
          data: {
            name: sanitizeCookieName(rc.name),
            domain: rc.domain.replace(/^\./, ''),
            secure: rc.secure,
            httpOnly: rc.httpOnly,
            sameSite: (['Strict', 'Lax', 'None'].includes(rc.sameSite) ? rc.sameSite : 'unspecified') as 'Strict' | 'Lax' | 'None' | 'unspecified',
            lifetimeCategory: rc.expires === -1 ? 'session' : 'persistent',
          },
        });
      }
      collectors.cookies.finishedAt = new Date().toISOString();

      // Storage collector
      collectors.storage.status = 'complete';
      collectors.storage.startedAt = new Date().toISOString();
      try {
        const storageCounts = await page.evaluate(() => {
          return {
            local: window.localStorage ? window.localStorage.length : 0,
            session: window.sessionStorage ? window.sessionStorage.length : 0,
          };
        });

        if (storageCounts.local > 0) {
          observations.push({
            id: nextObsId('store'),
            kind: 'storage_summary',
            collector: 'storage',
            observedAt: new Date().toISOString(),
            data: {
              origin: finalOrigin,
              mechanism: 'localStorage',
              count: storageCounts.local,
              accessible: true,
            },
          });
        }

        if (storageCounts.session > 0) {
          observations.push({
            id: nextObsId('store'),
            kind: 'storage_summary',
            collector: 'storage',
            observedAt: new Date().toISOString(),
            data: {
              origin: finalOrigin,
              mechanism: 'sessionStorage',
              count: storageCounts.session,
              accessible: true,
            },
          });
        }
      } catch {
        collectors.storage.status = 'partial';
        collectors.storage.reasonCode = 'CROSS_ORIGIN_STORAGE_INACCESSIBLE';
      }
      collectors.storage.finishedAt = new Date().toISOString();

    } catch (err: unknown) {
      const errMsg = String(err);
      if (errMsg.includes('Timeout')) {
        collectors.network.status = 'partial';
        collectors.network.reasonCode = 'NAVIGATION_TIMEOUT';
        limitations.push('NAVIGATION_TIMEOUT');
      } else {
        collectors.network.status = 'failed';
        collectors.network.reasonCode = 'WORKER_CRASH';
      }
    } finally {
      collectors.network.finishedAt = new Date().toISOString();
      if (context) await context.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    }

    return {
      observations,
      collectors,
      limitations,
      finalOrigin,
      finalHttpStatus,
      finalContentType,
    };
  }
}
