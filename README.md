# 🧮 Modern Web Calculator (Standard & Scientific)

A sleek, responsive, feature-packed Web Calculator built with **HTML5**, **Modern CSS3** (variables, glassmorphism, responsive grid), and **Vanilla JavaScript** (custom math evaluator, Web Audio API sound synthesizer, and `localStorage` history).

---

## 🌟 Key Features

- **🔄 Dual Modes**:
  - **Standard Mode**: Everyday basic arithmetic, percentages, parentheses, sign inversion (`±`), and memory operations (`MC`, `MR`, `M+`, `M-`, `MS`).
  - **Scientific Mode**: Trigonometry (`sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹` with Degree/Radian switch), logarithmic functions (`ln`, `log₁₀`), powers & roots (`x²`, `x³`, `xʸ`, `√x`, `∛x`), factorials (`n!`), constants (`π`, `e`), and exponential operations.
- **📜 Calculation History**:
  - Slide-out drawer tracking previous calculations.
  - Click on any past calculation to instantly reload it into the active display.
  - Persisted in browser `localStorage`.
- **⌨️ Complete Keyboard Support**:
  - Digits `0-9`, decimal `.`, operators `+`, `-`, `*`, `/`, `%`, `(`, `)`.
  - `Enter` / `=` to evaluate.
  - `Backspace` to delete last character.
  - `Escape` or `c` for All Clear (`AC`).
  - Visual button ripple and press animation for keyboard events.
- **🔊 Interactive Audio Feedback**:
  - Synthesizes crisp mechanical click tones using the native Web Audio API (with toggle to mute/unmute).
- **🌓 Dark & Light Themes**:
  - Cyber Dark mode by default with glowing accents and clean Light mode.
- **📋 1-Click Copy**:
  - Instant clipboard copy for calculation results with toast confirmation.

---

## 📂 Project Structure

```text
c:\Codes\calculator\
├── index.html            # Main calculator layout & accessible screen/keypads
├── css\
│   └── style.css         # Modern design tokens, glassmorphism chassis, and animations
├── js\
│   └── calculator.js     # Math evaluation engine, memory, history, sound & keyboard listeners
├── assets\
│   ├── favicon.svg       # Calculator tab icon
│   └── preview.svg       # Project preview banner
└── README.md             # Project documentation
```

---

## 🖥️ How to Run Locally

### Method 1: Direct Double-Click
Open File Explorer, go to `c:\Codes\calculator`, and double-click `index.html` to open it in your browser.

### Method 2: Local Server
In PowerShell:
```powershell
cd c:\Codes\calculator
python -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000).

---

## 🚀 How to Publish to GitHub & Connect to Portfolio

### Option A: Create a New GitHub Repo (`calculator`)
```powershell
cd c:\Codes\calculator
gh repo create harshsigar/calculator --public --source=. --push
```
Then enable GitHub Pages under repo **Settings → Pages → Branch: `main`**. Your calculator will be live at:
👉 `https://harshsigar.github.io/calculator/`

---

## 📜 License
Open-source under the [MIT License](https://opensource.org/licenses/MIT).

