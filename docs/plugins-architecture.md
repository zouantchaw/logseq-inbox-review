## Tips:
### IndexedDB API:
- **Note:** This feature is available in **Web Workers**.
- **Caution:** IndexedDB follows a **same-origin policy**, meaning you can't access stored data across different domains.

---

## Architecture Breakdown

### #Arch-1 (Working in Progress)
#### Host (Main Thread)
1. **JS Execution**: Executed in the main thread.
2. **Communication Mode**:
   - M1: Call straightforwardly (benefit from using the same thread).
   - M2: Use `postMessage` with a transferable payload.
3. **Sandbox with Specific Global Scope for Security**:
   - Security using **allow/deny lists**.

#### Components:
- **Proxy Sandbox**: For JavaScript in the main thread.
- **#shadowDOM**: Utilized for UI.

---

### #Arch-2
#### Host (Main Thread)
- **P1**: Communication complexity?
- **P2**: What is the responsibility of a WebWorker?
- **P3**: How does frequent messaging with large data volumes affect performance?

#### Components:
- **SDK**: Main Thread
- **Host WebWorker (Thread #1)**
- **External WebWorker (Thread #A4)** with:
  - **iframe (UI)**

---

### #Arch-3
#### Components:
- **SDK**: Main Thread
- **Iframe (UI)**: Can also include web workers, subject to **same-origin protection**.
- **Host WebWorker**: Manages extensions and background processes for specific APIs.

---

### #Arch-4
#### Host (Main Thread)
1. **What is Realm?**
   - More info: [TC39 Proposal on Realms](https://github.com/tc39/proposal-realms)

#### Components:
- **SDK**: Main Thread
- **Realm Sandbox**: For JavaScript in the main thread.
- **Iframe (UI)**: Protected by same-origin policy.

---