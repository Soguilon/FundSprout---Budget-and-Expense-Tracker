/* ==========================================================================
   FundSprout — Settings Page
   ========================================================================== */

const SettingsPage = {
  init() {
    const darkSwitch = document.getElementById('darkModeSwitch');
    const animSwitch = document.getElementById('animationsSwitch');

    darkSwitch.checked = DB.data.settings.theme === 'dark';
    animSwitch.checked = DB.data.settings.animations;

    darkSwitch.addEventListener('change', () => {
      const theme = darkSwitch.checked ? 'dark' : 'light';
      DB.updateSettings({ theme });
      App.applyTheme(theme);
      Toast.success('Theme updated', `Switched to ${theme} mode.`);
    });

    animSwitch.addEventListener('change', () => {
      DB.updateSettings({ animations: animSwitch.checked });
      App.applyAnimations(animSwitch.checked);
      Toast.success('Animations ' + (animSwitch.checked ? 'enabled' : 'disabled'));
    });

    document.getElementById('exportBackupBtn').addEventListener('click', () => this.exportBackup());
    document.getElementById('importBackupInput').addEventListener('change', (e) => this.importBackup(e));
    document.getElementById('resetDataBtn').addEventListener('click', () => this.resetData());

    this.render();
  },

  render() {
    document.getElementById('settingsRecordCount').textContent =
      `${DB.data.allowances.length + DB.data.expenses.length} transactions · ${DB.data.plants.length} plants`;
  },

  exportBackup() {
    const json = DB.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `fundsprout-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Toast.success('Backup exported', 'Your data was saved as a .json file.');
  },

  importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const ok = await confirmDialog({
          title: 'Import backup?',
          message: 'This will replace all current data in FundSprout with the contents of this backup file.',
          confirmText: 'Import',
          tone: 'danger'
        });
        if (!ok) { e.target.value = ''; return; }
        DB.importBackup(reader.result);
        Toast.success('Backup imported', 'Your data has been restored.');
      } catch (err) {
        Toast.error('Import failed', err.message || 'This file could not be read.');
      }
      e.target.value = '';
    };
    reader.onerror = () => {
      Toast.error('Import failed', 'The file could not be read. Please try again.');
      e.target.value = '';
    };
    reader.readAsText(file);
  },

  async resetData() {
    const ok = await confirmDialog({
      title: 'Reset all data?',
      message: 'This will permanently delete every allowance, expense, plant, and setting. This cannot be undone.',
      confirmText: 'Reset Everything',
      tone: 'danger'
    });
    if (!ok) return;
    DB.resetAll();
    App.applyTheme(DB.data.settings.theme);
    App.applyAnimations(DB.data.settings.animations);
    document.getElementById('darkModeSwitch').checked = DB.data.settings.theme === 'dark';
    document.getElementById('animationsSwitch').checked = DB.data.settings.animations;
    Toast.success('All data reset', 'FundSprout has been restored to a fresh start.');
    App.goTo('dashboard');
  }
};
