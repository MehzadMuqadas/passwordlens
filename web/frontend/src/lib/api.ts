const apiUrl = String(import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export type ExposureStatus = 'exposed' | 'not_exposed' | 'unknown' | 'not_checked';

export type PasswordFinding = {
  code: string;
  title: string;
  message: string;
  severity: string;
  category: string;
  detection?: string;
  transformation?: Array<{
    from: string;
    to: string;
  }>;
  normalized?: string;
};

export type PasswordAnalysis = {
  length: number;
  has_uppercase: boolean;
  has_lowercase: boolean;
  has_number: boolean;
  has_symbol: boolean;
  score: number;
  strength: string;
  risk: string;
  findings: PasswordFinding[];
  exposure: {
    status: ExposureStatus;
    label: string;
    detail: string;
  };
};

export class PasswordLensApiError extends Error {
  kind: 'unavailable' | 'invalid' | 'unknown';

  constructor(
    message: string,
    kind: 'unavailable' | 'invalid' | 'unknown',
  ) {
    super(message);
    this.name = 'PasswordLensApiError';
    this.kind = kind;
  }
}

export async function analyzePassword(
  password: string,
  checkExposure: boolean,
): Promise<PasswordAnalysis> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
        check_exposure: checkExposure,
      }),
    });
  } catch {
    throw new PasswordLensApiError(
      "PasswordLens couldn't reach the analysis service.",
      'unavailable',
    );
  }

  if (!response.ok) {
    if (response.status >= 500 || response.status === 404) {
      throw new PasswordLensApiError(
        "PasswordLens couldn't reach the analysis service.",
        'unavailable',
      );
    }

    throw new PasswordLensApiError(
      'The service rejected this analysis request.',
      'invalid',
    );
  }

  try {
    const result = (await response.json()) as PasswordAnalysis;

    if (
      typeof result.length !== 'number' ||
      typeof result.score !== 'number' ||
      typeof result.strength !== 'string' ||
      typeof result.risk !== 'string' ||
      !Array.isArray(result.findings)
    ) {
      throw new Error('Unexpected analysis response');
    }

    return result;
  } catch {
    throw new PasswordLensApiError(
      'The service returned an unreadable analysis.',
      'unknown',
    );
  }
}
