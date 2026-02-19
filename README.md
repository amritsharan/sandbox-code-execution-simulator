# Safe Sandbox: Behavior-Aware Code Execution Simulator

Safe Sandbox is a modern, secure, and intelligent code execution environment designed to simulate real-world sandboxing techniques. Unlike traditional sandboxes that rely solely on fixed resource limits, Safe Sandbox implements **behavior-aware analysis** and **adaptive resource management**.

## 🚀 Key Features (The "Novelty" Factor)

### 1. Behavior-Aware Sandboxing
The system doesn't just wait for a limit to be hit. It actively analyzes execution patterns to detect threats before they cause system instability.
- **Malicious Pattern Detection:** Identifies potential fork bombs, infinite loops, and heap abuse via simulated runtime analysis.
- **Classification Engine:** Categorizes scripts as `NORMAL`, `INEFFICIENT`, or `MALICIOUS`.

### 2. Adaptive Resource Limits
Limits are dynamic, not static. The sandbox rewards "well-behaved" code and throttles suspicious activity.
- **Clean Behavior Boost:** Execution environments that demonstrate stable patterns receive a 20% resource limit increase.
- **Inefficiency Penalty:** Scripts showing signs of memory leaks or high syscall frequency have their limits automatically reduced.

### 3. Explainable Termination Reasons
No more opaque "Killed" or "Runtime Error" messages. When a process is halted, the sandbox provides a detailed explanation:
- *Example:* "Terminated because system call frequency was anomalous (Potential Fork Bomb)."

### 4. Real-time Simulation & Reporting
- **Interactive Terminal:** Watch the execution logs and behavior analysis in real-time.
- **Result Export:** Download your simulation logs as professionally formatted **PDF** or **Word (.docx)** documents.

### 5. Secure Authentication
- Built-in **Firebase Authentication** for user accounts.
- Secure sign-up, login, and session management.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **Icons:** Lucide React
- **Backend/Auth:** Firebase (Auth & Firestore)
- **AI/Analysis:** Genkit (for pre-execution security auditing)
- **Export Tools:** jsPDF, docx

## 🏁 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/amritsharan/sandbox-code-execution-simulator.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  **Open the app:** Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

## 📄 License

This project is open-source and available under the MIT License.
