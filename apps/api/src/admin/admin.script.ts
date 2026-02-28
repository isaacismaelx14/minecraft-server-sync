export function renderLoginScript(): string {
  return `(function () {
  function byId(id) { return document.getElementById(id); }

  var passwordEl = byId('password');
  var loginBtn = byId('loginBtn');
  var statusEl = byId('loginStatus');

  function setStatus(message, cls) {
    statusEl.textContent = message;
    statusEl.className = 'status' + (cls ? ' ' + cls : '');
  }

  function login() {
    var password = (passwordEl.value || '').trim();
    if (!password) {
      setStatus('Enter password first.', 'error');
      return;
    }

    setStatus('Signing in...');

    fetch('/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: password })
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }

        return response.text().then(function () {
          throw new Error('Invalid password.');
        });
      })
      .then(function () {
        setStatus('Signed in.', 'ok');
        window.location.href = '/admin';
      })
      .catch(function (error) {
        setStatus(error.message || 'Login failed.', 'error');
      });
  }

  loginBtn.addEventListener('click', login);
  passwordEl.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      login();
    }
  });
})();`;
}

export function renderAdminScript(): string {
  return `(function () {
  var state = {
    bootstrap: null,
    searchResults: [],
    selectedMods: [],
    dependencyMap: {}
  };

  function byId(id) { return document.getElementById(id); }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function setStatus(id, message, cls) {
    var el = byId(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'status' + (cls ? ' ' + cls : '');
  }

  function readError(response, fallback) {
    return response.text()
      .then(function (text) {
        if (!text) return fallback;
        return text;
      })
      .catch(function () { return fallback; });
  }

  function authFetch(url, options, retried) {
    var config = Object.assign({}, options || {});
    config.credentials = 'include';

    return fetch(url, config).then(function (response) {
      if (response.status !== 401 || retried) {
        return response;
      }

      return fetch('/v1/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      }).then(function (refreshResponse) {
        if (!refreshResponse.ok) {
          window.location.href = '/admin/login';
          throw new Error('Session expired');
        }

        return authFetch(url, options, true);
      });
    });
  }

  function updateRail() {
    var mc = (byId('minecraftVersion').value || '').trim() || '-';
    var loader = (byId('loaderVersion').value || '').trim() || '-';
    var currentVersion = Number((byId('currentVersion').value || '0').trim()) || 0;
    byId('railMinecraft').textContent = 'MC: ' + mc;
    byId('railFabric').textContent = 'Fabric: ' + loader;
    byId('railVersion').textContent = 'Next profile: ' + (currentVersion + 1);
  }

  function fillLoaderOptions(loaders, latestStable) {
    var select = byId('loaderVersion');
    var current = (select.value || '').trim();
    var options = [];

    if (Array.isArray(loaders)) {
      options = loaders;
    }

    select.innerHTML = options.map(function (entry) {
      var suffix = entry.stable ? ' (stable)' : '';
      if (latestStable && entry.version === latestStable) {
        suffix = ' (latest stable)';
      }
      return '<option value="' + escapeHtml(entry.version) + '">' + escapeHtml(entry.version + suffix) + '</option>';
    }).join('');

    if (!select.value && current) {
      var option = document.createElement('option');
      option.value = current;
      option.textContent = current + ' (manual)';
      select.appendChild(option);
      select.value = current;
    }

    if (!select.value && latestStable) {
      select.value = latestStable;
    }

    updateRail();
  }

  function loadFabricVersions() {
    var minecraftVersion = (byId('minecraftVersion').value || '').trim();
    if (!minecraftVersion) {
      setStatus('settingsStatus', 'Set Minecraft version first.', 'error');
      return Promise.resolve();
    }

    setStatus('settingsStatus', 'Loading Fabric versions...');

    return authFetch('/v1/admin/fabric/versions?minecraftVersion=' + encodeURIComponent(minecraftVersion))
      .then(function (response) {
        if (response.ok) return response.json();
        return readError(response, 'Failed loading Fabric versions.').then(function (text) {
          throw new Error(text);
        });
      })
      .then(function (payload) {
        fillLoaderOptions(payload.loaders || [], payload.latestStable || null);
        setStatus('settingsStatus', 'Fabric versions updated.', 'ok');
      })
      .catch(function (error) {
        setStatus('settingsStatus', error.message || 'Failed loading Fabric versions.', 'error');
      });
  }

  function renderSelectedMods() {
    var el = byId('selectedMods');
    if (!state.selectedMods.length) {
      el.innerHTML = '<p class="meta">No mods selected.</p>';
      return;
    }

    el.innerHTML = state.selectedMods.map(function (mod) {
      return ''
        + '<div class="item">'
        + '  <div class="item-head">'
        + '    <span class="name">' + escapeHtml(mod.name) + '</span>'
        + '    <button class="btn btn-danger" data-remove="' + escapeHtml(mod.projectId) + '">Remove</button>'
        + '  </div>'
        + '  <div class="meta">Version: ' + escapeHtml(mod.versionId || '-') + '</div>'
        + '  <div class="meta">URL: ' + escapeHtml(mod.url || '-') + '</div>'
        + '</div>';
    }).join('');

    Array.prototype.forEach.call(el.querySelectorAll('button[data-remove]'), function (button) {
      button.addEventListener('click', function () {
        var projectId = button.getAttribute('data-remove');
        state.selectedMods = state.selectedMods.filter(function (entry) { return entry.projectId !== projectId; });
        renderSelectedMods();
        setStatus('modsStatus', 'Mod removed.', 'ok');
      });
    });
  }

  function installMod(projectId) {
    var minecraftVersion = (byId('minecraftVersion').value || '').trim();
    if (!minecraftVersion) {
      setStatus('modsStatus', 'Set Minecraft version first.', 'error');
      return;
    }

    setStatus('modsStatus', 'Installing mod and required dependencies...');

    authFetch('/v1/admin/mods/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: projectId,
        minecraftVersion: minecraftVersion,
        includeDependencies: true
      })
    })
      .then(function (response) {
        if (response.ok) return response.json();
        return readError(response, 'Install failed').then(function (text) {
          throw new Error(text);
        });
      })
      .then(function (payload) {
        var mods = Array.isArray(payload.mods) ? payload.mods : [];

        mods.forEach(function (mod) {
          var idx = state.selectedMods.findIndex(function (entry) { return entry.projectId === mod.projectId; });
          if (idx >= 0) state.selectedMods[idx] = mod;
          else state.selectedMods.push(mod);
        });

        renderSelectedMods();
        setStatus('modsStatus', 'Installed ' + mods.length + ' mod(s).', 'ok');
      })
      .catch(function (error) {
        setStatus('modsStatus', error.message || 'Install failed.', 'error');
      });
  }

  function renderSearchResults() {
    var el = byId('searchResults');
    if (!state.searchResults.length) {
      el.innerHTML = '<p class="meta">No results.</p>';
      return;
    }

    el.innerHTML = state.searchResults.map(function (result) {
      var dep = state.dependencyMap[result.projectId];
      var depLabel = dep && dep.requiresDependencies
        ? '<span class="flag">Requires dependencies</span>'
        : '';

      return ''
        + '<div class="item">'
        + '  <div class="item-head">'
        + '    <span class="name">' + escapeHtml(result.title || result.projectId) + '</span>'
        + '    <button class="btn btn-ghost" data-install="' + escapeHtml(result.projectId) + '">Install</button>'
        + '  </div>'
        + '  <div class="meta">' + escapeHtml(result.description || 'No description') + '</div>'
        + '  <div class="row">'
        + '    <span class="meta">Project: ' + escapeHtml(result.projectId) + '</span>'
        +      depLabel
        + '  </div>'
        + '</div>';
    }).join('');

    Array.prototype.forEach.call(el.querySelectorAll('button[data-install]'), function (button) {
      button.addEventListener('click', function () {
        var projectId = button.getAttribute('data-install');
        if (projectId) installMod(projectId);
      });
    });
  }

  function analyzeDependencies(results, minecraftVersion) {
    return Promise.all(results.map(function (result) {
      var url = '/v1/admin/mods/analyze?projectId='
        + encodeURIComponent(result.projectId)
        + '&minecraftVersion='
        + encodeURIComponent(minecraftVersion);

      return authFetch(url)
        .then(function (response) {
          if (!response.ok) return null;
          return response.json();
        })
        .then(function (analysis) {
          if (analysis) state.dependencyMap[result.projectId] = analysis;
        })
        .catch(function () {
          return null;
        });
    }));
  }

  function searchMods() {
    var query = (byId('searchQuery').value || '').trim();
    var minecraftVersion = (byId('minecraftVersion').value || '').trim();

    if (!query) {
      setStatus('modsStatus', 'Type a mod name first.', 'error');
      return;
    }

    if (!minecraftVersion) {
      setStatus('modsStatus', 'Set Minecraft version first.', 'error');
      return;
    }

    setStatus('modsStatus', 'Searching mods...');

    authFetch('/v1/admin/mods/search?query=' + encodeURIComponent(query) + '&minecraftVersion=' + encodeURIComponent(minecraftVersion))
      .then(function (response) {
        if (response.ok) return response.json();
        return readError(response, 'Search failed').then(function (text) {
          throw new Error(text);
        });
      })
      .then(function (payload) {
        state.searchResults = Array.isArray(payload) ? payload : [];
        state.dependencyMap = {};
        renderSearchResults();
        return analyzeDependencies(state.searchResults, minecraftVersion);
      })
      .then(function () {
        renderSearchResults();
        setStatus('modsStatus', 'Search complete.', 'ok');
      })
      .catch(function (error) {
        setStatus('modsStatus', error.message || 'Search failed.', 'error');
      });
  }

  function saveSettings() {
    var versionsRaw = (byId('supportedMinecraftVersions').value || '').trim();
    var versions = versionsRaw
      .split(',')
      .map(function (value) { return value.trim(); })
      .filter(Boolean);

    authFetch('/v1/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supportedMinecraftVersions: versions,
        supportedPlatforms: ['fabric']
      })
    })
      .then(function (response) {
        if (response.ok) return response.json();
        return readError(response, 'Failed to save settings').then(function (text) {
          throw new Error(text);
        });
      })
      .then(function (payload) {
        byId('supportedMinecraftVersions').value = (payload.supportedMinecraftVersions || []).join(', ');
        setStatus('settingsStatus', 'Settings saved.', 'ok');
      })
      .catch(function (error) {
        setStatus('settingsStatus', error.message || 'Failed to save settings.', 'error');
      });
  }

  function publishProfile() {
    var minecraftVersion = (byId('minecraftVersion').value || '').trim();
    var loaderVersion = (byId('loaderVersion').value || '').trim();

    if (!minecraftVersion || !loaderVersion) {
      setStatus('publishStatus', 'Select Minecraft and Fabric versions first.', 'error');
      return;
    }

    if (!state.selectedMods.length) {
      setStatus('publishStatus', 'Install at least one mod before publishing.', 'error');
      return;
    }

    setStatus('publishStatus', 'Publishing next version...');

    var payload = {
      profileId: (byId('profileId').value || '').trim(),
      serverName: (byId('serverName').value || '').trim(),
      serverAddress: (byId('serverAddress').value || '').trim(),
      minecraftVersion: minecraftVersion,
      loaderVersion: loaderVersion,
      mods: state.selectedMods,
      fancyMenu: {
        enabled: byId('fancyMenuEnabled').value === 'true',
        playButtonLabel: (byId('playButtonLabel').value || '').trim() || 'Play'
      }
    };

    authFetch('/v1/admin/profile/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (response.ok) return response.json();
        return readError(response, 'Publish failed').then(function (text) {
          throw new Error(text);
        });
      })
      .then(function (published) {
        byId('currentVersion').value = String(published.version);
        updateRail();
        setStatus(
          'publishStatus',
          'Published v' + published.version + ' (+' + published.summary.add + ' / ~' + published.summary.update + ' / -' + published.summary.remove + ').',
          'ok'
        );
      })
      .catch(function (error) {
        setStatus('publishStatus', error.message || 'Publish failed.', 'error');
      });
  }

  function populateBootstrap(payload) {
    state.bootstrap = payload;

    byId('serverName').value = payload.server.name || '';
    byId('serverAddress').value = payload.server.address || '';
    byId('profileId').value = payload.server.profileId || '';
    byId('currentVersion').value = String(payload.latestProfile.version || 1);
    byId('minecraftVersion').value = payload.latestProfile.minecraftVersion || '';

    var settingsVersions = (payload.appSettings && payload.appSettings.supportedMinecraftVersions) || [];
    byId('supportedMinecraftVersions').value = settingsVersions.join(', ');

    var fancyMenu = payload.latestProfile.fancyMenu || {};
    byId('fancyMenuEnabled').value = fancyMenu.enabled === false ? 'false' : 'true';
    byId('playButtonLabel').value = fancyMenu.playButtonLabel || 'Play';

    state.selectedMods = Array.isArray(payload.latestProfile.mods) ? payload.latestProfile.mods : [];
    renderSelectedMods();
    updateRail();
  }

  function loadBootstrap() {
    setStatus('bootstrapStatus', 'Loading bootstrap...');

    return authFetch('/v1/admin/bootstrap')
      .then(function (response) {
        if (response.ok) return response.json();

        if (response.status === 401) {
          window.location.href = '/admin/login';
          throw new Error('Unauthorized');
        }

        return readError(response, 'Failed to load bootstrap').then(function (text) {
          throw new Error(text);
        });
      })
      .then(function (payload) {
        populateBootstrap(payload);
        setStatus('bootstrapStatus', 'Bootstrap loaded.', 'ok');
        byId('sessionInfo').textContent = 'active';
        return loadFabricVersions();
      })
      .catch(function (error) {
        setStatus('bootstrapStatus', error.message || 'Bootstrap failed.', 'error');
      });
  }

  function logout() {
    authFetch('/v1/admin/auth/logout', { method: 'POST' })
      .finally(function () {
        window.location.href = '/admin/login';
      });
  }

  byId('logoutBtn').addEventListener('click', logout);
  byId('searchBtn').addEventListener('click', searchMods);
  byId('searchQuery').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchMods();
    }
  });

  byId('saveSettingsBtn').addEventListener('click', saveSettings);
  byId('refreshLoadersBtn').addEventListener('click', loadFabricVersions);
  byId('publishBtn').addEventListener('click', publishProfile);

  byId('minecraftVersion').addEventListener('change', function () {
    updateRail();
  });

  byId('loaderVersion').addEventListener('change', function () {
    updateRail();
  });

  loadBootstrap();
})();`;
}
