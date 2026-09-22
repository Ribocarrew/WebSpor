import { Finding, Observation, EpistemicStatus } from '@webspor/contracts';
import { isThirdParty, getRegisterableDomain } from './psl.js';
import { RULESET_VERSION } from './scoring.js';

export function classifyObservations(
  finalOrigin: string,
  observations: Observation[]
): Finding[] {
  const findings: Finding[] = [];
  let findingCounter = 1;

  function nextId(prefix: string) {
    return `f-${prefix}-${String(findingCounter++).padStart(3, '0')}`;
  }

  // 1. Group network connections by domain
  const responseObservations = observations.filter(
    (o): o is Extract<Observation, { kind: 'response_received' }> => o.kind === 'response_received'
  );

  const responsesByDomain = new Map<string, { obs: Observation[]; isThird: boolean; origins: Set<string> }>();

  for (const ro of responseObservations) {
    try {
      const host = new URL(ro.data.origin).hostname;
      const domain = getRegisterableDomain(host) || host;
      const isThird = isThirdParty(finalOrigin, ro.data.origin);

      if (!responsesByDomain.has(domain)) {
        responsesByDomain.set(domain, { obs: [], isThird, origins: new Set() });
      }
      const entry = responsesByDomain.get(domain)!;
      entry.obs.push(ro);
      entry.origins.add(ro.data.origin);
    } catch {
      // ignore
    }
  }

  for (const [domain, data] of responsesByDomain.entries()) {
    const epistemicStatus: EpistemicStatus = data.isThird ? 'unknown' : 'observed';
    const title = data.isThird
      ? `Tredjepartsforbindelse til ${domain}`
      : `Førstepartsforbindelse til ${domain}`;

    findings.push({
      id: nextId('net'),
      ruleId: data.isThird ? 'RULE_NET_THIRD_PARTY' : 'RULE_NET_FIRST_PARTY',
      ruleVersion: RULESET_VERSION,
      category: 'network',
      epistemicStatus,
      evidenceIds: data.obs.map((o) => o.id),
      sourceRefs: [
        {
          id: 'psl',
          name: 'Public Suffix List',
          version: '2026.01',
          url: 'https://publicsuffix.org',
        },
      ],
      explanationKey: data.isThird ? 'net_third_party' : 'net_first_party',
      limitations: [
        'Formål med forbindelsen er ukendt uden kildematch',
        'Viser modtaget netværksrespons, ikke efterfølgende datadeling',
      ],
      title,
      description: data.isThird
        ? `Browseren modtog ${data.obs.length} netværkssvar fra tredjepartsdomænet ${domain}. Formålet kan ikke afgøres alene ud fra netværkssvaret.`
        : `Browseren modtog ${data.obs.length} netværkssvar fra førstepartsdomænet ${domain}.`,
      data: {
        domain,
        isThirdParty: data.isThird,
        responseCount: data.obs.length,
        origins: Array.from(data.origins),
      },
    });
  }

  // 2. Cookies stored
  const cookieObservations = observations.filter(
    (o): o is Extract<Observation, { kind: 'cookie_stored' }> => o.kind === 'cookie_stored'
  );

  for (const co of cookieObservations) {
    const isSession = co.data.lifetimeCategory === 'session';
    findings.push({
      id: nextId('cookie'),
      ruleId: 'RULE_COOKIE_STORED',
      ruleVersion: RULESET_VERSION,
      category: 'cookies',
      epistemicStatus: 'observed',
      evidenceIds: [co.id],
      sourceRefs: [
        {
          id: 'rfc6265bis',
          name: 'RFC 6265bis: Cookies',
          version: 'draft-20',
          url: 'https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis',
        },
      ],
      explanationKey: isSession ? 'cookie_session' : 'cookie_persistent',
      limitations: [
        'Cookie-værdi og sti er redigeret væk af privatlivshensyn',
        'Dokumenterer tilstedeværelse af cookie i browserlageret',
      ],
      title: `Gemt cookie: ${co.data.name}`,
      description: `Cookien "${co.data.name}" blev gemt for domænet "${co.data.domain}" (levetid: ${co.data.lifetimeCategory}, Secure: ${co.data.secure}, SameSite: ${co.data.sameSite}).`,
      data: {
        name: co.data.name,
        domain: co.data.domain,
        secure: co.data.secure,
        httpOnly: co.data.httpOnly,
        sameSite: co.data.sameSite,
        lifetimeCategory: co.data.lifetimeCategory,
      },
    });
  }

  // 3. Storage summaries
  const storageObservations = observations.filter(
    (o): o is Extract<Observation, { kind: 'storage_summary' }> => o.kind === 'storage_summary'
  );

  for (const so of storageObservations) {
    findings.push({
      id: nextId('storage'),
      ruleId: 'RULE_STORAGE_SUMMARY',
      ruleVersion: RULESET_VERSION,
      category: 'storage',
      epistemicStatus: 'observed',
      evidenceIds: [so.id],
      sourceRefs: [],
      explanationKey: 'storage_detected',
      limitations: [
        'WebSpor tæller kun antal poster; nøgler og indhold aflæses aldrig',
      ],
      title: `Lokal lagring i ${so.data.mechanism} (${so.data.count} poster)`,
      description: `Siden har oprettet ${so.data.count} element(er) i ${so.data.mechanism} under ${so.data.origin}.`,
      data: {
        origin: so.data.origin,
        mechanism: so.data.mechanism,
        count: so.data.count,
      },
    });
  }

  // 4. Headers
  const headerObservations = observations.filter(
    (o): o is Extract<Observation, { kind: 'header_check' }> => o.kind === 'header_check'
  );

  for (const ho of headerObservations) {
    const name = ho.data.headerName;
    const present = ho.data.present;
    findings.push({
      id: nextId('header'),
      ruleId: `RULE_HEADER_${name.toUpperCase().replace(/-/g, '_')}`,
      ruleVersion: RULESET_VERSION,
      category: 'headers',
      epistemicStatus: 'observed',
      evidenceIds: [ho.id],
      sourceRefs: [],
      explanationKey: `header_${name.toLowerCase().replace(/-/g, '_')}`,
      limitations: [
        'Måler kun teknisk tilstedeværelse af header på final response',
        'Dokumenterer ikke beskyttelse på websitets øvrige undersider',
      ],
      title: present ? `Sikkerhedshoved fundet: ${name}` : `Sikkerhedshoved mangler: ${name}`,
      description: present
        ? `Serveren sendte headeren ${name} (status: ${ho.data.parserStatus}).`
        : `Serveren sendte ikke headeren ${name} i den undersøgte HTTP-respons.`,
      data: {
        headerName: name,
        present,
        parserStatus: ho.data.parserStatus,
        directives: ho.data.normalizedDirectives,
      },
    });
  }

  return findings;
}
