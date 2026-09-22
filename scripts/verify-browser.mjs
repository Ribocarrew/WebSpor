import { chromium } from 'playwright';

async function runBrowserVerification() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = {
    desktop: {},
    mobile320: {},
    scenarios: {},
    explanations: {},
    accessibility: {},
    errors: [],
  };

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      locale: 'da-DK',
    });

    console.log('Testing Desktop 1440px...');
    await page.goto('http://127.0.0.1:4173/');

    // 1. Check title & brand
    results.desktop.title = await page.title();
    const headerLogo = await page.$('header img');
    results.desktop.headerLogoSrc = await headerLogo?.getAttribute('src');
    results.desktop.headerLogoAlt = await headerLogo?.getAttribute('alt');

    const brandName = await page.$eval('.brand-name', (el) => el.textContent?.trim());
    results.desktop.brandName = brandName;

    // Check footer elements
    const footerLogo = await page.$('footer img');
    results.desktop.footerLogoSrc = await footerLogo?.getAttribute('src');
    const footerText = await page.$eval('footer', (el) => el.textContent);
    results.desktop.hasTagline = footerText?.includes('Se sporene bag websitet.') || footerText?.includes('Tænk før du klikker');
    results.desktop.hasContact = footerText?.includes('jaco227e@lollandskoler.dk');
    results.desktop.hasSender = footerText?.includes('Sandboxmodellen') && footerText?.includes('Jacob Witt-Larsen');

    // 2. Navigate to /demo
    console.log('Testing /demo scenarios...');
    await page.goto('http://127.0.0.1:4173/demo');
    await page.waitForSelector('.grid-cards');

    // Verify Demo Banner
    const demoBanner = await page.$eval('.demo-banner', (el) => el.textContent);
    results.scenarios.hasDemoBanner = demoBanner?.includes('DEMO');

    // Scenario 1: Success (skole.example)
    const s1CardValues = await page.$$eval('.grid-cards .card', (cards) =>
      cards.map((c) => ({
        indicator: c.querySelector('div')?.textContent?.trim(),
        value: c.querySelector('div:nth-child(3)')?.textContent?.trim(),
        desc: c.querySelector('div:nth-child(4)')?.textContent?.trim(),
      }))
    );
    results.scenarios.successCards = s1CardValues;

    // Test Explanation Levels
    console.log('Testing Explanation Level Switcher...');
    const initialI01Text = await page.$eval('.grid-cards .card:first-child p', (el) => el.textContent?.trim());
    
    // Click "Lær mere"
    await page.click('button:has-text("Lær mere")');
    const learnMoreText = await page.$eval('.grid-cards .card:first-child p', (el) => el.textContent?.trim());
    
    // Click "Teknisk"
    await page.click('button:has-text("Teknisk")');
    const technicalText = await page.$eval('.grid-cards .card:first-child p', (el) => el.textContent?.trim());

    results.explanations = {
      brief: initialI01Text,
      learnMore: learnMoreText,
      technical: technicalText,
      switchedCorrectly: initialI01Text !== learnMoreText && learnMoreText !== technicalText,
    };

    // Test Scenario 2: Partial (avis.example)
    console.log('Testing Partial Scenario (avis.example)...');
    await page.click('button:has-text("avis.example")');
    await page.waitForTimeout(200);

    const s2CardValues = await page.$$eval('.grid-cards .card', (cards) =>
      cards.map((c) => ({
        indicator: c.querySelector('div')?.textContent?.trim(),
        value: c.querySelector('div:nth-child(3)')?.textContent?.trim(),
        desc: c.querySelector('div:nth-child(4)')?.textContent?.trim(),
      }))
    );
    results.scenarios.partialCards = s2CardValues;

    // Test Scenario 3: Failed (lukket.example)
    console.log('Testing Failed Scenario (lukket.example)...');
    await page.click('button:has-text("lukket.example")');
    await page.waitForTimeout(200);

    const failedBanner = await page.$eval('.card', (el) => el.textContent);
    results.scenarios.failedStatus = failedBanner?.includes('TARGET_UNREACHABLE') || failedBanner?.includes('Fejl');

    // 3. Test Accessibility (Skip link & focus)
    console.log('Testing Keyboard Accessibility...');
    await page.goto('http://127.0.0.1:4173/demo');
    await page.keyboard.press('Tab');
    const activeElementInfo = await page.evaluate(() => ({
      tagName: document.activeElement?.tagName,
      className: document.activeElement?.className,
      text: document.activeElement?.textContent?.trim(),
    }));
    results.accessibility = {
      activeElement: activeElementInfo,
      skipLinkFocused: activeElementInfo.className?.includes('skip-link') || false,
    };

    // 4. Test Mobile 320px Viewport
    console.log('Testing Mobile 320px viewport...');
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('http://127.0.0.1:4173/demo');
    await page.waitForSelector('.grid-cards');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    results.mobile320 = {
      scrollWidth,
      clientWidth,
      noHorizontalOverflow: scrollWidth <= clientWidth,
    };

    console.log('Browser Verification Finished Successfully!');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Browser verification failed:', err);
    results.errors.push(String(err));
  } finally {
    await browser.close();
  }
}

runBrowserVerification();
