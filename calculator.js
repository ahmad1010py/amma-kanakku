const display = document.getElementById('result');
const expressionEl = document.getElementById('expression');

let state = {
  current: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
  justCalculated: false,
};

function updateDisplay() {
  display.textContent = state.current;
  display.classList.toggle('small', state.current.length > 9);
}

function inputDigit(digit) {
  if (state.waitingForOperand) {
    state.current = digit;
    state.waitingForOperand = false;
  } else {
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  if (state.justCalculated) {
    state.previous = null;
    state.operator = null;
    expressionEl.textContent = '';
    state.justCalculated = false;
  }
  updateDisplay();
}

function inputDot() {
  if (state.waitingForOperand) {
    state.current = '0.';
    state.waitingForOperand = false;
    updateDisplay();
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
    updateDisplay();
  }
}

function inputOperator(op) {
  const current = parseFloat(state.current);

  if (state.operator && !state.waitingForOperand) {
    const result = compute(parseFloat(state.previous), current, state.operator);
    state.current = formatResult(result);
    state.previous = state.current;
    updateDisplay();
  } else {
    state.previous = state.current;
  }

  state.operator = op;
  state.waitingForOperand = true;
  state.justCalculated = false;

  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  expressionEl.textContent = `${state.previous} ${opSymbols[op]}`;
}

function calculate() {
  if (!state.operator || state.waitingForOperand) return;

  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  expressionEl.textContent = `${state.previous} ${opSymbols[state.operator]} ${state.current} =`;

  const result = compute(a, b, state.operator);
  state.current = formatResult(result);
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.justCalculated = true;

  updateDisplay();
  highlightOperator(null);
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error';
  }
}

function formatResult(value) {
  if (value === 'Error') return 'Error';
  if (!isFinite(value)) return 'Error';
  const str = String(parseFloat(value.toPrecision(12)));
  return str;
}

function clearAll() {
  state = { current: '0', previous: null, operator: null, waitingForOperand: false, justCalculated: false };
  expressionEl.textContent = '';
  updateDisplay();
  highlightOperator(null);
}

function toggleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

function inputPercent() {
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  state.current = formatResult(val / 100);
  updateDisplay();
}

function highlightOperator(op) {
  document.querySelectorAll('.btn-op').forEach(btn => btn.classList.remove('active'));
  if (op) {
    const opLabels = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    document.querySelectorAll('.btn-op').forEach(btn => {
      if (btn.textContent === opLabels[op]) btn.classList.add('active');
    });
  }
}

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.') inputDot();
  else if (e.key === '+') inputOperator('+');
  else if (e.key === '-') inputOperator('-');
  else if (e.key === '*') inputOperator('*');
  else if (e.key === '/') { e.preventDefault(); inputOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === 'Backspace') {
    if (state.current.length > 1 && !state.waitingForOperand) {
      state.current = state.current.slice(0, -1);
    } else {
      state.current = '0';
    }
    updateDisplay();
  }
});
