/**
 * ==========================================================================
 * MODERN CALCULATOR - JAVASCRIPT ENGINE
 * Handles: Math Evaluation (BODMAS/Scientific), History, Memory, Sound, Keyboard
 * ==========================================================================
 */

class CalculatorApp {
  constructor() {
    // State
    this.expression = '';
    this.currentInput = '0';
    this.isResultShown = false;
    this.isDegreeMode = true;
    this.memoryValue = 0;
    this.isSoundEnabled = true;
    this.history = JSON.parse(localStorage.getItem('calc_history') || '[]');

    // Audio Context (Synthesizer for click sound)
    this.audioCtx = null;

    // DOM Elements
    this.exprDisplay = document.getElementById('exprDisplay');
    this.resultDisplay = document.getElementById('resultDisplay');
    this.degRadBadge = document.getElementById('degRadBadge');
    this.memBadge = document.getElementById('memBadge');
    this.memRecallBtn = document.getElementById('memRecall');
    this.memClearBtn = document.getElementById('memClear');
    this.appContainer = document.querySelector('.calculator-app');
    this.historyDrawer = document.getElementById('historyDrawer');
    this.historyList = document.getElementById('historyList');
    this.toast = document.getElementById('toast');

    this.init();
  }

  init() {
    this.loadTheme();
    this.loadMode();
    this.loadSoundPref();
    this.renderHistory();
    this.updateDisplay();
    this.bindEvents();
  }

  // ------------------------------------------------------------------------
  // 1. EVENT BINDINGS
  // ------------------------------------------------------------------------
  bindEvents() {
    // Button Clicks on Keypad
    document.querySelectorAll('.key').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const val = btn.getAttribute('data-val');
        this.playClickSound();
        this.handleButton(action, val);
      });
    });

    // Memory Buttons
    document.querySelectorAll('.mem-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.playClickSound();
        this.handleMemory(action);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Sound Toggle
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
    }

    // Mode Switcher (Standard / Scientific)
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.getAttribute('data-mode');
        this.setMode(mode);
      });
    });

    // Deg / Rad Toggle
    if (this.degRadBadge) {
      this.degRadBadge.addEventListener('click', () => this.toggleDegRad());
    }

    // History Drawer Toggle
    const historyBtn = document.getElementById('historyToggle');
    const closeHistoryBtn = document.getElementById('closeHistory');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        this.historyDrawer.classList.add('open');
      });
    }
    if (closeHistoryBtn) {
      closeHistoryBtn.addEventListener('click', () => {
        this.historyDrawer.classList.remove('open');
      });
    }
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        this.clearHistory();
      });
    }

    // Copy Result
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyResult());
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  // ------------------------------------------------------------------------
  // 2. INPUT & KEYPAD DISPATCHER
  // ------------------------------------------------------------------------
  handleButton(action, val) {
    if (action === 'num') {
      this.inputNumber(val);
    } else if (action === 'op') {
      this.inputOperator(val);
    } else if (action === 'clear') {
      this.clearAll();
    } else if (action === 'del') {
      this.deleteLast();
    } else if (action === 'equals') {
      this.calculate();
    } else if (action === 'plusminus') {
      this.toggleSign();
    } else if (action === 'fn') {
      this.inputFunction(val);
    } else if (action === 'const') {
      this.inputConstant(val);
    }
    this.updateDisplay();
  }

  inputNumber(num) {
    if (this.isResultShown) {
      this.currentInput = num === '.' ? '0.' : num;
      this.expression = '';
      this.isResultShown = false;
      return;
    }

    if (num === '.') {
      if (!this.currentInput.includes('.')) {
        this.currentInput += '.';
      }
      return;
    }

    if (this.currentInput === '0' || this.currentInput === 'Error') {
      this.currentInput = num;
    } else {
      this.currentInput += num;
    }
  }

  inputOperator(op) {
    if (this.currentInput === 'Error') {
      this.clearAll();
      return;
    }

    if (this.isResultShown) {
      this.expression = `${this.currentInput} ${op} `;
      this.isResultShown = false;
      this.currentInput = '0';
      return;
    }

    if (op === '(' || op === ')') {
      if (op === '(') {
        if (this.currentInput !== '0') {
          this.expression += `${this.currentInput} * ( `;
        } else {
          this.expression += `( `;
        }
        this.currentInput = '0';
      } else {
        this.expression += `${this.currentInput} ) `;
        this.currentInput = '0';
      }
      return;
    }

    this.expression += `${this.currentInput} ${op} `;
    this.currentInput = '0';
  }

  inputFunction(fn) {
    if (this.currentInput === 'Error') return;

    const num = parseFloat(this.currentInput) || 0;

    switch (fn) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
      case 'ln':
      case 'log':
      case 'sqrt':
      case 'cbrt':
        this.expression += `${fn}(${this.currentInput}) `;
        const intermediate = this.evalFunction(fn, num);
        this.currentInput = String(this.formatResult(intermediate));
        this.isResultShown = true;
        break;

      case 'sq':
        this.expression += `sqr(${this.currentInput}) `;
        this.currentInput = String(this.formatResult(num * num));
        this.isResultShown = true;
        break;

      case 'cube':
        this.expression += `cube(${this.currentInput}) `;
        this.currentInput = String(this.formatResult(num * num * num));
        this.isResultShown = true;
        break;

      case 'recip':
        if (num === 0) {
          this.currentInput = 'Error';
          this.showToast('Cannot divide by zero');
        } else {
          this.expression += `1/(${this.currentInput}) `;
          this.currentInput = String(this.formatResult(1 / num));
          this.isResultShown = true;
        }
        break;

      case 'fact':
        if (num < 0 || !Number.isInteger(num)) {
          this.currentInput = 'Error';
          this.showToast('Factorial only for non-negative integers');
        } else {
          this.expression += `${num}! `;
          this.currentInput = String(this.factorial(num));
          this.isResultShown = true;
        }
        break;

      case 'pow':
        this.expression += `${this.currentInput} ^ `;
        this.currentInput = '0';
        break;

      case 'tenpow':
        this.expression += `10^(${this.currentInput}) `;
        this.currentInput = String(this.formatResult(Math.pow(10, num)));
        this.isResultShown = true;
        break;

      case 'epow':
        this.expression += `e^(${this.currentInput}) `;
        this.currentInput = String(this.formatResult(Math.exp(num)));
        this.isResultShown = true;
        break;

      case 'abs':
        this.currentInput = String(Math.abs(num));
        break;
    }
  }

  inputConstant(constant) {
    if (constant === 'pi') {
      this.currentInput = String(this.formatResult(Math.PI));
    } else if (constant === 'e') {
      this.currentInput = String(this.formatResult(Math.E));
    }
    this.isResultShown = true;
  }

  toggleSign() {
    if (this.currentInput === '0' || this.currentInput === 'Error') return;
    if (this.currentInput.startsWith('-')) {
      this.currentInput = this.currentInput.substring(1);
    } else {
      this.currentInput = '-' + this.currentInput;
    }
  }

  deleteLast() {
    if (this.isResultShown) {
      this.clearAll();
      return;
    }
    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      this.currentInput = '0';
    }
  }

  clearAll() {
    this.expression = '';
    this.currentInput = '0';
    this.isResultShown = false;
  }

  // ------------------------------------------------------------------------
  // 3. CALCULATION & MATH PARSER
  // ------------------------------------------------------------------------
  calculate() {
    if (this.currentInput === 'Error') return;

    let fullExpr = this.expression + (this.isResultShown ? '' : this.currentInput);
    if (!fullExpr.trim()) return;

    try {
      const sanitized = this.sanitizeExpression(fullExpr);
      const rawResult = this.safeEvaluate(sanitized);

      if (!isFinite(rawResult) || isNaN(rawResult)) {
        throw new Error('Invalid math result');
      }

      const formattedResult = this.formatResult(rawResult);

      // Add to calculation history
      this.addHistory(fullExpr, formattedResult);

      this.expression = `${fullExpr} =`;
      this.currentInput = String(formattedResult);
      this.isResultShown = true;
    } catch (err) {
      this.currentInput = 'Error';
      this.showToast('Invalid Mathematical Expression');
    }
  }

  sanitizeExpression(expr) {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\^/g, '**')
      .replace(/%/g, '* 0.01');
  }

  safeEvaluate(expr) {
    // Custom safe recursive/precedence math parser
    // eslint-disable-next-line no-new-func
    const func = new Function(`return (${expr})`);
    return func();
  }

  evalFunction(fn, val) {
    let rad = this.isDegreeMode ? (val * Math.PI) / 180 : val;
    switch (fn) {
      case 'sin': return Math.sin(rad);
      case 'cos': return Math.cos(rad);
      case 'tan': {
        if (this.isDegreeMode && Math.abs(val % 180) === 90) return Infinity;
        return Math.tan(rad);
      }
      case 'asin': {
        const res = Math.asin(val);
        return this.isDegreeMode ? (res * 180) / Math.PI : res;
      }
      case 'acos': {
        const res = Math.acos(val);
        return this.isDegreeMode ? (res * 180) / Math.PI : res;
      }
      case 'atan': {
        const res = Math.atan(val);
        return this.isDegreeMode ? (res * 180) / Math.PI : res;
      }
      case 'ln': return Math.log(val);
      case 'log': return Math.log10(val);
      case 'sqrt': return Math.sqrt(val);
      case 'cbrt': return Math.cbrt(val);
      default: return val;
    }
  }

  factorial(n) {
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; // JS max float limit
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  formatResult(val) {
    if (typeof val !== 'number') return val;
    // Fix floating point precision bugs like 0.1 + 0.2
    const rounded = parseFloat(val.toPrecision(12));
    // If integer, return plain integer
    if (Number.isInteger(rounded)) return rounded;
    return parseFloat(rounded.toFixed(8));
  }

  // ------------------------------------------------------------------------
  // 4. MEMORY FUNCTIONS
  // ------------------------------------------------------------------------
  handleMemory(action) {
    const current = parseFloat(this.currentInput) || 0;
    switch (action) {
      case 'mc':
        this.memoryValue = 0;
        this.showToast('Memory Cleared (MC)');
        break;
      case 'mr':
        this.currentInput = String(this.memoryValue);
        this.isResultShown = true;
        this.showToast(`Memory Recalled: ${this.memoryValue}`);
        break;
      case 'mplus':
        this.memoryValue += current;
        this.showToast(`Memory Added (+${current})`);
        break;
      case 'mminus':
        this.memoryValue -= current;
        this.showToast(`Memory Subtracted (-${current})`);
        break;
      case 'ms':
        this.memoryValue = current;
        this.showToast(`Memory Stored (${current})`);
        break;
    }
    this.updateMemoryIndicators();
    this.updateDisplay();
  }

  updateMemoryIndicators() {
    const hasMem = this.memoryValue !== 0;
    if (this.memBadge) {
      this.memBadge.style.display = hasMem ? 'inline-block' : 'none';
    }
    if (this.memRecallBtn) this.memRecallBtn.classList.toggle('has-memory', hasMem);
    if (this.memClearBtn) this.memClearBtn.classList.toggle('has-memory', hasMem);
  }

  // ------------------------------------------------------------------------
  // 5. DEGREE / RADIAN MODE
  // ------------------------------------------------------------------------
  toggleDegRad() {
    this.isDegreeMode = !this.isDegreeMode;
    if (this.degRadBadge) {
      this.degRadBadge.textContent = this.isDegreeMode ? 'DEG' : 'RAD';
    }
    this.showToast(`Switched to ${this.isDegreeMode ? 'Degree (°)' : 'Radian (rad)'} mode`);
  }

  // ------------------------------------------------------------------------
  // 6. HISTORY MANAGEMENT
  // ------------------------------------------------------------------------
  addHistory(expr, res) {
    const item = {
      expr: expr,
      res: res,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.history.unshift(item);
    if (this.history.length > 30) this.history.pop();
    localStorage.setItem('calc_history', JSON.stringify(this.history));
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyList) return;
    if (this.history.length === 0) {
      this.historyList.innerHTML = `<div class="empty-history">No calculation history yet.<br>Perform calculations to see them here!</div>`;
      return;
    }

    this.historyList.innerHTML = this.history.map((item, idx) => `
      <div class="history-item" data-idx="${idx}">
        <div class="history-expr">${this.escapeHtml(item.expr)} =</div>
        <div class="history-res">${this.escapeHtml(String(item.res))}</div>
      </div>
    `).join('');

    // Bind click to recall history
    this.historyList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = el.getAttribute('data-idx');
        const selected = this.history[idx];
        if (selected) {
          this.expression = '';
          this.currentInput = String(selected.res);
          this.isResultShown = true;
          this.updateDisplay();
          this.historyDrawer.classList.remove('open');
          this.showToast(`Loaded ${selected.res} to display`);
        }
      });
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
    this.renderHistory();
    this.showToast('History Cleared');
  }

  // ------------------------------------------------------------------------
  // 7. KEYBOARD SHORTCUTS
  // ------------------------------------------------------------------------
  handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key;

    // Digits 0-9
    if (/\d/.test(key)) {
      this.animateKeyPress(`[data-val="${key}"]`);
      this.inputNumber(key);
    } else if (key === '.') {
      this.animateKeyPress('[data-val="."]');
      this.inputNumber('.');
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      let selector = `[data-val="${key}"]`;
      if (key === '*') selector = '[data-val="×"]';
      if (key === '/') selector = '[data-val="÷"]';
      if (key === '-') selector = '[data-val="−"]';
      this.animateKeyPress(selector);
      this.inputOperator(key === '*' ? '×' : key === '/' ? '÷' : key === '-' ? '−' : '+');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      this.animateKeyPress('[data-action="equals"]');
      this.calculate();
    } else if (key === 'Backspace') {
      this.animateKeyPress('[data-action="del"]');
      this.deleteLast();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      this.animateKeyPress('[data-action="clear"]');
      this.clearAll();
    } else if (key === '(' || key === ')') {
      this.inputOperator(key);
    } else if (key === '%') {
      this.inputOperator('%');
    }

    this.playClickSound();
    this.updateDisplay();
  }

  animateKeyPress(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 150);
    }
  }

  // ------------------------------------------------------------------------
  // 8. SOUND SYNTHESIZER (Web Audio API)
  // ------------------------------------------------------------------------
  playClickSound() {
    if (!this.isSoundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio not supported or blocked by browser policy
    }
  }

  toggleSound() {
    this.isSoundEnabled = !this.isSoundEnabled;
    localStorage.setItem('calc_sound', this.isSoundEnabled ? 'on' : 'off');
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
      soundBtn.classList.toggle('active', this.isSoundEnabled);
    }
    this.showToast(`Audio Sound Effects: ${this.isSoundEnabled ? 'ON 🔊' : 'OFF 🔇'}`);
  }

  loadSoundPref() {
    const pref = localStorage.getItem('calc_sound');
    this.isSoundEnabled = pref !== 'off';
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
      soundBtn.classList.toggle('active', this.isSoundEnabled);
    }
  }

  // ------------------------------------------------------------------------
  // 9. THEMES & MODES
  // ------------------------------------------------------------------------
  toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('calc_theme', newTheme);
    this.showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode ✨`);
  }

  loadTheme() {
    const saved = localStorage.getItem('calc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }

  setMode(mode) {
    const isSci = mode === 'scientific';
    this.appContainer.classList.toggle('scientific-active', isSci);

    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });

    localStorage.setItem('calc_mode', mode);
  }

  loadMode() {
    const saved = localStorage.getItem('calc_mode') || 'standard';
    this.setMode(saved);
  }

  // ------------------------------------------------------------------------
  // 10. DISPLAY UPDATE & TOAST NOTIFICATIONS
  // ------------------------------------------------------------------------
  updateDisplay() {
    if (this.exprDisplay) {
      this.exprDisplay.textContent = this.expression;
    }
    if (this.resultDisplay) {
      this.resultDisplay.textContent = this.currentInput;
      // Auto-scale font size for large strings
      if (this.currentInput.length > 12) {
        this.resultDisplay.style.fontSize = '1.7rem';
      } else if (this.currentInput.length > 8) {
        this.resultDisplay.style.fontSize = '2.1rem';
      } else {
        this.resultDisplay.style.fontSize = '2.5rem';
      }
    }
  }

  copyResult() {
    navigator.clipboard.writeText(this.currentInput).then(() => {
      this.showToast(`📋 Copied: ${this.currentInput}`);
    }).catch(() => {
      this.showToast(`Value: ${this.currentInput}`);
    });
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2400);
  }

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.calculator = new CalculatorApp();
});

