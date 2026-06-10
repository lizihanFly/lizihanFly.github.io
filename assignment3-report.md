# Assignment 3 Report: Deployment and Integration of AI Agents

**Student:** Lizihan  
**Project:** FileLens Agent Lab  
**Live demo:** <https://lizihanfly.github.io/agent-lab.html>  
**Source repository:** <https://github.com/lizihanFly/lizihanFly.github.io>  
**Date:** June 10, 2026

## 1. Objective

This assignment explores how one file-analysis task can be handled by three different agent deployments:

1. A deterministic agent that runs entirely in the browser.
2. An online large language model through an OpenAI-compatible API.
3. A local language model served by Ollama.

The same interface, file, and question are used in every mode. This makes the differences in setup, privacy, speed, and answer quality easier to compare.

## 2. Deliverables and Rubric Mapping

| Requirement | Implementation | Evidence |
|---|---|---|
| Online Agent (5 pts) | Configurable endpoint, model, API key, file context, and question | `agent-lab.html`, `queryOnline()` in `agent-lab.js` |
| Local Model (4 pts) | Ollama `/api/chat` adapter and model selector | `queryOllama()` and connection test |
| IDE Integration (3 pts) | AI coding agent used for repository inspection, architecture, implementation, review, and debugging | Section 6 and `AI_DEVELOPMENT_LOG.md` |
| Documentation (3 pts) | Setup, architecture, challenges, tests, and reflection | This report |

## 3. Application Architecture

FileLens is a static web application, so it can be hosted directly on GitHub Pages.

```text
User file + question
        |
        v
Input validation (type, size, empty state)
        |
        v
Provider adapter
   |          |             |
Browser    Online API    Local Ollama
rules      /chat API     localhost:11434
   |          |             |
   +----------+-------------+
              |
              v
       Shared conversation UI
```

The provider adapter pattern keeps the interface independent from any one model. The three relevant functions are:

- `queryDemo(question)`
- `queryOnline(question)`
- `queryOllama(question)`

The uploaded file is read with the browser `FileReader` API. Files are limited to 2 MB and the model context is truncated to 16,000 characters to prevent accidental oversized requests.

## 4. Online Agent Setup

The online mode accepts any provider that implements an OpenAI-compatible chat-completions endpoint. DeepSeek is used as the default example.

1. Open `agent-lab.html`.
2. Select **Online LLM**.
3. Enter the API endpoint, model name, and API key.
4. Click **Test connection**.
5. Add a file, ask a specific question, and click **Analyze**.

Default example:

```text
Endpoint: https://api.deepseek.com/chat/completions
Model:    deepseek-chat
```

The request uses a low temperature and a system instruction that requires the model to answer only from the provided file, cite concrete evidence, and state uncertainty.

### Security decision

The API key is kept only in the current page memory. It is not written to local storage, a cookie, source code, or the Git repository. A production public service should use a server-side proxy so that browser users never handle a permanent secret. Some providers also reject browser requests because of CORS policy; this is a provider security restriction rather than an error in the agent workflow.

## 5. Local Ollama Deployment

The website contains a working adapter for Ollama's local chat API. Ollama was not present on the development computer when the repository was inspected on June 10, 2026, so the report does not claim a fabricated local-model run. The following reproducible steps complete the local verification:

```powershell
# Install Ollama from https://ollama.com/download
ollama pull qwen2.5:3b
ollama run qwen2.5:3b
```

For a GitHub Pages origin to call a local Ollama server, allow the website origin before starting Ollama:

```powershell
$env:OLLAMA_ORIGINS="https://lizihanfly.github.io"
ollama serve
```

Then:

1. Open the Agent Lab.
2. Select **Local Ollama**.
3. Keep the endpoint `http://localhost:11434/api/chat`.
4. Set the model to the exact model downloaded locally.
5. Click **Test connection**, add a file, and analyze it.

No uploaded file is sent to a third party in this mode. The browser sends the prompt only to the Ollama process on the same computer.

## 6. IDE and AI-Assisted Development

An AI coding agent was integrated into the development workspace and used as a development partner rather than as a replacement for testing.

### Architecture

The AI agent inspected the original static GitHub Pages repository and proposed a framework-free design. Keeping HTML, CSS, and JavaScript avoided a build pipeline and matched the existing repository.

### Problem solving

The AI agent helped with:

- Designing one interface with interchangeable provider adapters.
- Separating secret handling from repository content.
- Implementing drag-and-drop file reading and input limits.
- Writing a transparent fallback analyzer for demonstrations without a key.
- Identifying CORS as the main difficulty for browser-to-model connections.
- Adding error states rather than silently failing.

### Refactoring example

Provider-specific network code was separated into `queryOnline()` and `queryOllama()`, while `buildMessages()` creates the shared prompt. This avoids duplicating the file context and safety instruction.

## 7. Browser Agent Capabilities

The no-key browser mode is intentionally transparent. It is not presented as an LLM. It provides:

- Line, word, and character counts.
- Frequent keyword extraction with stop-word filtering.
- Risk, limitation, TODO, warning, and error detection.
- Function, class, and import inspection for source files.
- CSV row, column, minimum, maximum, and mean statistics.
- Question-to-sentence ranking for relevant evidence.

This mode is useful as a reliable fallback and as a baseline for comparing generative model output.

## 8. Testing

| Test | Expected result |
|---|---|
| Open page without configuration | Browser demo is ready |
| Submit without a file | Agent asks for a file |
| Upload file over 2 MB | Agent rejects it with a clear message |
| Load Markdown sample and request risks | Explicit limitations and TODO items are returned |
| Load Python sample and request structure | Imports and function definitions are listed |
| Load CSV sample and request data profile | Rows, columns, min, max, and mean are shown |
| Use an invalid API key | Error appears in the conversation |
| Ollama is not running | Local connection test reports failure |
| Clear session | File and conversation are reset |

## 9. Online and Local Model Reflection

| Factor | Online model | Local model |
|---|---|---|
| Setup | API account and key | Ollama installation and model download |
| Quality | Usually stronger for complex reasoning | Depends on local model size and hardware |
| Speed | Network latency, but strong remote hardware | No network latency; limited by local hardware |
| Privacy | File content leaves the computer | File content remains on the computer |
| Cost | May charge per token | No per-request fee after download |
| Availability | Requires internet and provider uptime | Works offline after model download |
| Maintenance | Provider maintains the model | User manages models, storage, and updates |

The online model is the easiest choice for high-quality analysis on modest hardware. Ollama is more attractive for private files and offline work. The browser tool is the most predictable and explainable, but it cannot provide the semantic reasoning of an LLM.

## 10. Challenges and Limitations

The main challenge is that GitHub Pages has no private backend. Direct online requests may expose a temporary key to the user's own browser session and may be blocked by CORS. The interface therefore explains the limitation and never stores the key.

The local adapter also depends on software outside the website. A public webpage cannot install Ollama or download a model without the user's permission. The implementation provides the adapter, setup commands, test button, and honest connection state.

## 11. Conclusion

This project demonstrates that agent deployment is not only a model-selection problem. The surrounding engineering decisions, including secret handling, provider adapters, validation, error reporting, privacy, and documentation, determine whether an agent is actually useful in a development workflow.
