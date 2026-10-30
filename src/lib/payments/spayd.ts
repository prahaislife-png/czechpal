/**
 * Czech "QR Platba" (SPAYD, Short Payment Descriptor) builder and Czech bank account tools.
 *
 * Format: SPD*1.0*KEY:value*KEY:value…  (ASCII only, '*' is the separator)
 *   ACC  IBAN (required)            AM  amount, [1-9][0-9]*(\.[0-9][0-9])?, max 10 chars
 *   CC   ISO 4217 currency           DT  due date YYYYMMDD
 *   RN   recipient name, max 35      MSG message for the recipient, max 60
 *   X-VS / X-SS  variable / specific symbol, max 10 digits    X-KS  constant symbol, max 4 digits
 *
 * Dependency-free on purpose: it is unit-tested directly with Node.
 */

export type AccountParse =
  | { ok: true; iban: string; display: string; bankCode?: string }
  | { ok: false; error: string };

/** Major Czech bank codes. Unknown codes are allowed (the list is long and changes); they just show no name. */
const BANK_NAMES: Record<string, string> = {
  '0100': 'Komerční banka',
  '0300': 'ČSOB',
  '0600': 'MONETA Money Bank',
  '0710': 'Česká národní banka',
  '0800': 'Česká spořitelna',
  '2010': 'Fio banka',
  '2700': 'UniCredit Bank',
  '3030': 'Air Bank',
  '5500': 'Raiffeisenbank',
  '6210': 'mBank',
};

export const bankName = (code: string) => BANK_NAMES[code];

const PREFIX_WEIGHTS = [10, 5, 8, 4, 2, 1];
const NUMBER_WEIGHTS = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];

/** Czech account numbers carry a modulo-11 check on the prefix and on the main number separately. */
export function passesMod11(digits: string, weights: number[]): boolean {
  const padded = digits.padStart(weights.length, '0');
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += Number(padded[i]) * weights[i];
  return sum % 11 === 0;
}

/** Remainder of a long numeric string modulo 97, computed in chunks to stay within safe integers. */
function mod97(numeric: string): number {
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(String(remainder) + numeric.slice(i, i + 7)) % 97;
  }
  return remainder;
}

/** Letters to numbers as ISO 13616 requires: A=10 … Z=35. */
function ibanToNumeric(rearranged: string): string {
  return rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
}

export function isValidIban(iban: string): boolean {
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  if (iban.startsWith('CZ') && iban.length !== 24) return false;
  return mod97(ibanToNumeric(iban.slice(4) + iban.slice(0, 4))) === 1;
}

/** Czech BBAN (bank code 4 + prefix 6 + number 10) to IBAN. */
export function czechAccountToIban(prefix: string, number: string, bankCode: string): string {
  const bban = bankCode + prefix.padStart(6, '0') + number.padStart(10, '0');
  const check = 98 - mod97(ibanToNumeric(bban + 'CZ00'));
  return 'CZ' + String(check).padStart(2, '0') + bban;
}

export function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

/** Accepts "19-2000145399/0800", "2000145399/0800" or an IBAN (spaces allowed). */
export function parseAccount(input: string): AccountParse {
  const raw = input.replace(/\s+/g, '').toUpperCase();
  if (!raw) return { ok: false, error: 'Enter the account number from the bill.' };

  if (/^[A-Z]{2}/.test(raw)) {
    if (!isValidIban(raw)) return { ok: false, error: 'This IBAN doesn’t look right. Check it against the bill.' };
    const bankCode = raw.startsWith('CZ') ? raw.slice(4, 8) : undefined;
    return { ok: true, iban: raw, display: formatIban(raw), bankCode };
  }

  const match = /^(?:(\d{1,6})-)?(\d{2,10})\/(\d{4})$/.exec(raw);
  if (!match) {
    return { ok: false, error: 'Use the format 2000145399/0800, with the 4-digit bank code after the slash.' };
  }
  const [, prefix = '', number, bankCode] = match;
  if (prefix && !passesMod11(prefix, PREFIX_WEIGHTS)) {
    return { ok: false, error: 'The account prefix fails the bank check. Check the digits before the dash.' };
  }
  if (!passesMod11(number, NUMBER_WEIGHTS) || /^0+$/.test(number)) {
    return { ok: false, error: 'This account number fails the bank check. One digit is probably wrong.' };
  }
  const display = `${prefix ? `${prefix}-` : ''}${number}/${bankCode}`;
  return { ok: true, iban: czechAccountToIban(prefix, number, bankCode), display, bankCode };
}

/** SPAYD allows printable ASCII only; '*' is the field separator. Czech letters lose their accents. */
export function toSpaydText(text: string, max: number): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\*/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

export const MAX_AMOUNT = 9_999_999.99;

/** Parses "1 840", "1840,50" or "1840.5" into a number with at most 2 decimals; null if not a valid amount. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[\s ]/g, '').replace(/kč$/i, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Math.round(Number(cleaned) * 100) / 100;
  return Number.isFinite(value) ? value : null;
}

export type PaymentFields = {
  iban: string;
  amount?: number;
  currency?: string;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  /** ISO date, YYYY-MM-DD. */
  dueDate?: string;
  recipientName?: string;
  message?: string;
};

export type PaymentErrors = Partial<Record<'amount' | 'variableSymbol' | 'specificSymbol' | 'constantSymbol' | 'dueDate', string>>;

export function validatePayment(p: Omit<PaymentFields, 'iban'>): PaymentErrors {
  const errors: PaymentErrors = {};
  if (p.amount !== undefined && (p.amount < 1 || p.amount > MAX_AMOUNT)) {
    errors.amount = p.amount < 1 ? 'The amount must be at least 1 Kč.' : 'That amount is too large for a QR payment.';
  }
  if (p.variableSymbol && !/^\d{1,10}$/.test(p.variableSymbol)) errors.variableSymbol = 'Up to 10 digits, numbers only.';
  if (p.specificSymbol && !/^\d{1,10}$/.test(p.specificSymbol)) errors.specificSymbol = 'Up to 10 digits, numbers only.';
  if (p.constantSymbol && !/^\d{1,4}$/.test(p.constantSymbol)) errors.constantSymbol = 'Up to 4 digits, numbers only.';
  if (p.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(p.dueDate)) errors.dueDate = 'Use the format YYYY-MM-DD.';
  return errors;
}

/** Builds the SPAYD string a Czech banking app reads from a QR code. Throws on invalid input. */
export function buildSpayd(p: PaymentFields): string {
  if (!isValidIban(p.iban)) throw new Error('Invalid IBAN');
  const errors = validatePayment(p);
  const first = Object.values(errors)[0];
  if (first) throw new Error(first);

  const parts = ['SPD', '1.0', `ACC:${p.iban}`];
  if (p.amount !== undefined) parts.push(`AM:${p.amount.toFixed(2)}`);
  parts.push(`CC:${(p.currency ?? 'CZK').toUpperCase()}`);
  if (p.dueDate) parts.push(`DT:${p.dueDate.replace(/-/g, '')}`);
  if (p.recipientName) {
    const rn = toSpaydText(p.recipientName, 35);
    if (rn) parts.push(`RN:${rn}`);
  }
  if (p.message) {
    const msg = toSpaydText(p.message, 60);
    if (msg) parts.push(`MSG:${msg}`);
  }
  if (p.variableSymbol) parts.push(`X-VS:${p.variableSymbol}`);
  if (p.specificSymbol) parts.push(`X-SS:${p.specificSymbol}`);
  if (p.constantSymbol) parts.push(`X-KS:${p.constantSymbol}`);
  return parts.join('*');
}
