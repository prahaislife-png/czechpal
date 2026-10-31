/**
 * Free explanations per user per calendar month (UTC). This is the only place the number is
 * decided: set FREE_ANALYSES_PER_MONTH as a function secret to change it. The app asks the
 * server (/allowance, and the `limit` in every explanation) instead of keeping its own copy.
 */
export const FREE_LIMIT = Number(Deno.env.get('FREE_ANALYSES_PER_MONTH') ?? '20');

export const LIMIT_REACHED_MESSAGE = 'You’ve used all your free explanations for this month. They renew on the 1st of next month.';
