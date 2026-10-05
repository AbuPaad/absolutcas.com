/* NumOS WebAssembly loader for /emulator/.
 *
 * The WASM package is content-addressed: every asset carries a hash in its
 * filename, so this file never hardcodes one. It reads the manifest that
 * package.mjs emits next to the assets and imports the shell module the
 * manifest points at. The shell (and everything it imports) then resolves its
 * own hashed siblings relative to its own URL.
 *
 * The manifest is the contract; see wasm/package.mjs in the AbsolutOS repo. */

(function () {
  'use strict';

  var ASSET_BASE = '/emulator/numos/';
  // Absolute, because `new URL(relative, base)` needs an absolute base even
  // when both arguments are site-relative paths.
  var MANIFEST_URL = new URL(ASSET_BASE + 'numos-assets.json', location.href).href;

  function setStatus(text) {
    var el = document.getElementById('wasm-status');
    if (el) el.textContent = text;
  }

  setStatus('Loading NumOS…');

  fetch(MANIFEST_URL, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('manifest ' + response.status);
      }
      return response.json();
    })
    .then(function (manifest) {
      var shellUrl = new URL(manifest.assets.shell.url, MANIFEST_URL).href;
      return import(shellUrl);
    })
    .catch(function (error) {
      setStatus('NumOS could not load: ' + error.message);
      // Keep the failure visible rather than leaving an empty page.
      console.error('[numos] load failed', error);
    });
})();
