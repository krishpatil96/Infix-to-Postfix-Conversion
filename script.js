let steps = [];
let currentStep = 0;
let autoPlayInterval = null;

// Operator precedence
const precedence = {
  "^": 3,
  "*": 2,
  "/": 2,
  "+": 1,
  "-": 1
};

// Operator associativity
const associativity = {
  "^": "right",
  "*": "left",
  "/": "left",
  "+": "left",
  "-": "left"
};

function startConversion() {
  let expr = document.getElementById("infixInput").value.trim();
  if (!expr) return alert("Enter an expression!");

  steps = generateSteps(expr);
  currentStep = 0;
  renderStep(0);
}

// ---- Shunting Yard Algorithm ----
function generateSteps(expression) {
  let stack = [];
  let output = [];
  let logSteps = [];

  for (let index = 0; index < expression.length; index++) {
    let ch = expression[index];

    if (/[A-Za-z0-9]/.test(ch)) {
      output.push(ch);
      logSteps.push({
        stack: [...stack],
        postfix: output.join(""),
        action: `Added operand '${ch}' to Postfix Expression`,
        pos: index
      });

    } else if ("+-*/^".includes(ch)) {
      while (
        stack.length &&
        "+-*/^".includes(stack[stack.length - 1]) &&
        (
          (associativity[ch] === "left" && precedence[ch] <= precedence[stack[stack.length - 1]]) ||
          (associativity[ch] === "right" && precedence[ch] < precedence[stack[stack.length - 1]])
        )
      ) {
        output.push(stack.pop());
        logSteps.push({
          stack: [...stack],
          postfix: output.join(""),
          action: "Popped operators from the stack because the precedence of the next operator is less than the operator on the top of the stack.",
          pos: index
        });
      }
      stack.push(ch);
      logSteps.push({
        stack: [...stack],
        postfix: output.join(""),
        action: `Pushed operator '${ch}' to The Stack`,
        pos: index
      });

    } else if (ch === "(") {
      stack.push(ch);
      logSteps.push({
        stack: [...stack],
        postfix: output.join(""),
        action: `Pushed "(" to stack`,
        pos: index
      });

    } else if (ch === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
        logSteps.push({
          stack: [...stack],
          postfix: output.join(""),
          action: "Popped operators above the '(' & Discard the '(' and ')'",
          pos: index
        });
      }
      stack.pop();
      logSteps.push({
        stack: [...stack],
        postfix: output.join(""),
        action: `Removed "(" from stack`,
        pos: index
      });
    }
  }

  while (stack.length) {
    output.push(stack.pop());
    logSteps.push({
      stack: [...stack],
      postfix: output.join(""),
      action: "Popped remaining operators",
      pos: expression.length - 1 // last character
    });
  }

  return logSteps;
}

function renderStep(i) {
  if (i < 0 || i >= steps.length) return;

  let st = steps[i];
  let expr = document.getElementById("infixInput").value;

  // ✅ highlight based on stored pos, not step index
  let highlighted = "";
  for (let j = 0; j < expr.length; j++) {
    highlighted += (j === st.pos) ? `<span class="highlight">${expr[j]}</span>` : expr[j];
  }
  document.getElementById("scanning").innerHTML = highlighted;

  // Stack
  document.getElementById("stack").innerHTML =
    st.stack.map(s => `<li>${s}</li>`).reverse().join("");

  // Postfix
  document.getElementById("postfix").innerText = st.postfix;

  // Action log
  document.getElementById("log").innerText = st.action;

  currentStep = i;
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    renderStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 0) {
    renderStep(currentStep - 1);
  }
}

function autoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    return;
  }
  autoPlayInterval = setInterval(() => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      clearInterval(autoPlayInterval);
    }
  }, 1000);
}

function resetVisualization() {
  clearInterval(autoPlayInterval);
  autoPlayInterval = null;
  steps = [];
  currentStep = 0;
  document.getElementById("scanning").innerText = "";
  document.getElementById("stack").innerHTML = "";
  document.getElementById("postfix").innerText = "";
  document.getElementById("log").innerText = "";
  document.getElementById("infixInput").value = "";
}
