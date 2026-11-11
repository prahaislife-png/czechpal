import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { keptParts, pageFileName, PDF_FILE_NAME } from '../src/lib/case-file-names';

describe('a saved letter’s files', () => {
  it('names pages by their place, keeping a known photo type', () => {
    assert.equal(pageFileName(0, 'file:///cache/Camera/8A2F.jpg'), 'page-1.jpg');
    assert.equal(pageFileName(2, 'file:///cache/ImagePicker/x.HEIC'), 'page-3.heic');
    assert.equal(pageFileName(1, 'file:///cache/picked.png?width=10'), 'page-2.png');
    // No type, or one that isn't a photo: saved as a JPEG name.
    assert.equal(pageFileName(0, 'content://media/external/images/42'), 'page-1.jpg');
    assert.equal(pageFileName(0, 'file:///cache/odd.exe'), 'page-1.jpg');
    assert.equal(PDF_FILE_NAME, 'document.pdf');
  });

  it('recognises a kept file wherever the documents folder is', () => {
    const before = 'file:///var/mobile/Containers/Data/Application/AAAA-1111/Documents/case-files/mhx3k2abcde/page-1.jpg';
    const after = 'file:///var/mobile/Containers/Data/Application/BBBB-2222/Documents/case-files/mhx3k2abcde/page-1.jpg';
    assert.deepEqual(keptParts(before), { caseId: 'mhx3k2abcde', name: 'page-1.jpg' });
    assert.deepEqual(keptParts(after), keptParts(before));
    assert.deepEqual(keptParts('file:///data/user/0/com.czechpal.app/files/case-files/abc/document.pdf'), { caseId: 'abc', name: 'document.pdf' });
  });

  it('leaves anything else alone', () => {
    assert.equal(keptParts(undefined), null);
    assert.equal(keptParts('file:///var/mobile/Library/Caches/Camera/8A2F.jpg'), null);
    assert.equal(keptParts('blob:http://localhost:8081/1b2c'), null);
    // Only a file directly inside a letter's folder counts; nothing deeper, nothing with odd names.
    assert.equal(keptParts('file:///docs/case-files/abc/sub/page-1.jpg'), null);
    assert.equal(keptParts('file:///docs/case-files/../secrets/page-1.jpg'), null);
  });
});
