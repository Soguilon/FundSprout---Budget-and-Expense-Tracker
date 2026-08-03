/* ==========================================================================
   FundSprout — Dashboard (Home) Page
   ========================================================================== */

const Dashboard = {
  prevBalance: 0,

  init() {
    this.render();
  },

  computeLifeHealth() {
    const d = DB.data;
    const balance = d.balance;
    const totalAllowance = d.allowances.reduce((s, a) => s + a.amount, 0);
    const totalExpenses = d.expenses.reduce((s, e) => s + e.amount, 0);
    const totalSaved = d.plants.reduce((s, p) => s + p.saved, 0);

    // Reference scale: use average of last 30 days allowance, fallback to 500
    const recentAllowance = d.allowances.filter((a) => Utils.inRange(a.date, 'monthly')).reduce((s, a) => s + a.amount, 0);
    const scale = Math.max(recentAllowance, 500);

    const balanceScore = Utils.clamp(balance / scale, 0, 1);
    const savingsScore = totalAllowance > 0 ? Utils.clamp(totalSaved / totalAllowance, 0, 1) : 0;
    const spendRatio = totalAllowance > 0 ? totalExpenses / totalAllowance : 0;
    const spendingScore = Utils.clamp(1 - spendRatio, 0, 1);
    // Allowance consistency: did they log allowance recently (within 14 days)?
    const lastAllowance = d.allowances.slice().sort((a, b) => b.createdAt - a.createdAt)[0];
    const daysSince = lastAllowance ? (Date.now() - lastAllowance.createdAt) / 86400000 : 999;
    const consistencyScore = d.allowances.length === 0 ? 0.5 : Utils.clamp(1 - daysSince / 14, 0, 1);

    const health = balanceScore * 0.4 + savingsScore * 0.25 + spendingScore * 0.2 + consistencyScore * 0.15;
    return Utils.clamp(health, 0, 1);
  },

  render() {
    const d = DB.data;
    const balance = d.balance;

    // Summary values
    const today = Utils.todayISO();
    const todaysAllowance = d.allowances.filter((a) => a.date === today).reduce((s, a) => s + a.amount, 0);
    const todaysExpenses = d.expenses.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);
    const totalSaved = d.plants.reduce((s, p) => s + p.saved, 0);
    const budgetRemaining = todaysAllowance - todaysExpenses;

    this.renderSummaryCard('cardBalance', balance, this.prevBalance);
    document.getElementById('cardTodayAllowance').textContent = Utils.formatMoney(todaysAllowance);
    document.getElementById('cardTodayExpenses').textContent = Utils.formatMoney(todaysExpenses);
    document.getElementById('cardBudgetRemaining').textContent = Utils.formatMoney(budgetRemaining);
    document.getElementById('cardMoneySaved').textContent = Utils.formatMoney(totalSaved);
    this.prevBalance = balance;

    // Life tree
    const health = this.computeLifeHealth();
    const stage = Plant.stageFromPercent(health * 100);
    const info = Plant.stageInfo(stage);
    document.getElementById('lifeTreeSvgWrap').innerHTML = Plant.render({
      stage, type: 'Tree', health, animate: DB.data.settings.animations
    });
    document.getElementById('lifeTreeStageName').textContent = info.name;
    document.getElementById('lifeTreeStageDesc').textContent = info.description;
    document.getElementById('lifeTreeProgressFill').style.width = `${Math.round(health * 100)}%`;
    document.getElementById('lifeTreeHealthPct').textContent = `${Math.round(health * 100)}% financial health`;

    // Recent transactions (5 latest)
    const txs = DB.getAllTransactions().slice(0, 6);
    const list = document.getElementById('recentTxList');
    if (!txs.length) {
      list.innerHTML = emptyStateHTML({
        icon: 'fa-receipt',
        title: 'No transactions yet',
        message: 'Record your first allowance or expense to see activity here.',
        actionLabel: 'Add Allowance',
        actionAttr: `onclick="App.goTo('allowance'); setTimeout(()=>AllowancePage.openCreateModal(),260);"`
      });
    } else {
      list.innerHTML = txs.map((t) => this.renderTxRow(t)).join('');
    }
  },

  renderTxRow(t) {
    const icons = { allowance: 'fa-sack-dollar', expense: CATEGORY_ICONS[t.category] || 'fa-receipt', water: 'fa-droplet' };
    const badges = { allowance: 'badge-blue', expense: 'badge-red', water: 'badge-green' };
    const isPos = t.amount >= 0;
    return `
      <div class="activity-item">
        <div class="activity-icon ${badges[t.kind]}"><i class="fa-solid ${icons[t.kind]}"></i></div>
        <div class="activity-main">
          <div class="activity-title">${Utils.escapeHtml(t.title)}</div>
          <div class="activity-sub">${Utils.formatDateTime(t.date, t.time)} · ${Utils.escapeHtml(t.category)}</div>
        </div>
        <div class="activity-amount ${isPos ? 'pos' : 'neg'}">${Utils.formatMoney(t.amount, { forceSign: true })}</div>
      </div>
    `;
  },

  renderSummaryCard(elId, to, from) {
    const el = document.getElementById(elId);
    Utils.animateCount(el, from, to);
  }
};
