// Checks every recording's speaker voices against the Czech, without calling Azure.
import { collectRecordings } from './collect';
import { checkVoices } from './speakers';

const all = collectRecordings();
const problems = all.flatMap((r) => checkVoices(r.key, r.text));
console.log(problems.length ? problems.join('\n') : `All ${all.length} recordings have voices that agree with the Czech.`);
process.exit(problems.length ? 1 : 0);
