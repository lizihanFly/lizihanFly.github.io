const samples = {
    research: {
        name: "research_notes.md",
        content: `# Battery Degradation Study

## Research question
How does fast charging affect lithium-ion battery capacity after repeated cycles?

## Method
We tested 24 cells in three groups: slow charge (0.5C), standard charge (1C), and fast charge (2C). Capacity was measured every 50 cycles at 25 degrees Celsius.

## Preliminary findings
- The 0.5C group retained 94.2% capacity after 500 cycles.
- The 1C group retained 89.7% capacity after 500 cycles.
- The 2C group retained 81.4% capacity after 500 cycles.
- Temperature spikes above 38 degrees were more common in the 2C group.

## Risks and limitations
The sample size is small. The experiment uses only one cell chemistry. Temperature control failed for six hours during cycle 312.

## Action items
TODO: repeat the experiment with LFP cells.
TODO: calculate confidence intervals.
TODO: inspect the cycle 312 temperature anomaly.`
    },
    code: {
        name: "experiment.py",
        content: `import csv
from statistics import mean

def load_capacity(path):
    """Load cycle and capacity values from a CSV file."""
    rows = []
    with open(path, newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            rows.append({
                "cycle": int(row["cycle"]),
                "capacity": float(row["capacity"])
            })
    return rows

def retention_rate(rows):
    if not rows:
        raise ValueError("rows cannot be empty")
    initial = rows[0]["capacity"]
    final = rows[-1]["capacity"]
    return final / initial * 100

def summarize(groups):
    return {
        name: mean(retention_rate(run) for run in runs)
        for name, runs in groups.items()
    }

if __name__ == "__main__":
    data = load_capacity("battery.csv")
    print(f"Retention: {retention_rate(data):.1f}%")`
    },
    csv: {
        name: "experiment_results.csv",
        content: `group,cycle,capacity_mah,temperature_c
slow,0,3002,25.1
slow,500,2828,26.4
standard,0,2998,25.0
standard,500,2689,29.8
fast,0,3005,25.2
fast,500,2446,38.7`
    }
};

const state = {
    provider: "demo",
    fileName: "",
    content: "",
    fileType: ""
};

const elements = {
    status: document.querySelector("#agent-status"),
    fileInput: document.querySelector("#file-input"),
    dropZone: document.querySelector("#drop-zone"),
    fileCard: document.querySelector("#file-card"),
    fileName: document.querySelector("#file-name"),
    fileMeta: document.querySelector("#file-meta"),
    fileBadge: document.querySelector("#file-badge"),
    filePreview: document.querySelector("#file-preview"),
    previewCount: document.querySelector("#preview-count"),
    conversation: document.querySelector("#conversation"),
    form: document.querySelector("#agent-form"),
    question: document.querySelector("#question"),
    runButton: document.querySelector("#run-agent"),
    modeLabel: document.querySelector("#mode-label")
};

document.querySelectorAll("input[name='provider']").forEach((radio) => {
    radio.addEventListener("change", () => selectProvider(radio.value));
});

document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
        const sample = samples[button.dataset.sample];
        loadTextFile(sample.name, sample.content);
    });
});

document.querySelectorAll(".suggestion-chips button").forEach((button) => {
    button.addEventListener("click", () => {
        elements.question.value = button.textContent;
        elements.question.focus();
    });
});

elements.dropZone.addEventListener("click", () => elements.fileInput.click());
elements.dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elements.fileInput.click();
    }
});
elements.fileInput.addEventListener("change", () => readFile(elements.fileInput.files[0]));
["dragenter", "dragover"].forEach((name) => {
    elements.dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        elements.dropZone.classList.add("dragging");
    });
});
["dragleave", "drop"].forEach((name) => {
    elements.dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        elements.dropZone.classList.remove("dragging");
    });
});
elements.dropZone.addEventListener("drop", (event) => readFile(event.dataTransfer.files[0]));
document.querySelector("#remove-file").addEventListener("click", clearFile);
document.querySelector("#clear-session").addEventListener("click", clearSession);
document.querySelectorAll("[data-test]").forEach((button) => {
    button.addEventListener("click", () => testConnection(button.dataset.test, button));
});
elements.form.addEventListener("submit", runAgent);

function selectProvider(provider) {
    state.provider = provider;
    document.querySelectorAll(".mode-option").forEach((option) => {
        option.classList.toggle("active", option.querySelector("input").value === provider);
    });
    document.querySelectorAll("[data-settings]").forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.settings !== provider);
    });
    const labels = { demo: "Browser demo", online: "Online LLM", ollama: "Local Ollama" };
    elements.modeLabel.innerHTML = `<b>Mode:</b> ${labels[provider]}`;
    setStatus("Ready", "ready");
}

function readFile(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        addMessage("agent", "That file is larger than 2 MB. Please use a smaller text-based file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => loadTextFile(file.name, String(reader.result));
    reader.onerror = () => addMessage("agent", "I could not read that file. Please try another text-based format.");
    reader.readAsText(file);
}

function loadTextFile(name, content) {
    state.fileName = name;
    state.content = content;
    state.fileType = (name.split(".").pop() || "txt").toUpperCase();
    const lines = content.split(/\r?\n/).length;
    const size = new Blob([content]).size;
    elements.fileCard.classList.remove("hidden");
    elements.fileName.textContent = name;
    elements.fileMeta.textContent = `${formatBytes(size)} · ${lines} lines`;
    elements.fileBadge.textContent = state.fileType.slice(0, 4);
    elements.filePreview.textContent = content.slice(0, 12000);
    elements.previewCount.textContent = `${content.length.toLocaleString()} chars`;
    addMessage("agent", `Loaded ${name}. I found ${lines} lines and ${content.length.toLocaleString()} characters. What would you like to know?`);
}

function clearFile() {
    state.fileName = "";
    state.content = "";
    state.fileType = "";
    elements.fileInput.value = "";
    elements.fileCard.classList.add("hidden");
    elements.filePreview.textContent = "Select a sample or upload a file to begin.";
    elements.previewCount.textContent = "No file";
}

function clearSession() {
    clearFile();
    elements.conversation.innerHTML = "";
    addMessage("agent", "Session cleared. Add a new file when you are ready.");
}

async function runAgent(event) {
    event.preventDefault();
    const question = elements.question.value.trim();
    if (!state.content) {
        addMessage("agent", "Please add a file first. You can use one of the sample files below the upload area.");
        return;
    }
    if (!question) return;

    addMessage("user", question);
    elements.question.value = "";
    setBusy(true);
    const typing = addTyping();

    try {
        let response;
        if (state.provider === "online") response = await queryOnline(question);
        else if (state.provider === "ollama") response = await queryOllama(question);
        else response = await queryDemo(question);
        typing.remove();
        addMessage("agent", response);
        setStatus("Complete", "ready");
    } catch (error) {
        typing.remove();
        addMessage("agent", `Connection error: ${error.message}\n\nSwitch to Browser demo to test the full workflow without a model connection.`);
        setStatus("Error", "error");
    } finally {
        setBusy(false);
    }
}

async function queryDemo(question) {
    await wait(550);
    const text = state.content;
    const lines = text.split(/\r?\n/);
    const words = text.match(/[A-Za-z][A-Za-z0-9'-]*/g) || [];
    const q = question.toLowerCase();
    const sections = [];
    const keywords = extractKeywords(words);

    sections.push(`ANALYSIS PLAN\n1. Inspect ${state.fileName} as ${state.fileType || "text"}.\n2. Match the question to document evidence.\n3. Return findings with limitations.`);

    if (/summary|summarize|overview|key finding/.test(q)) {
        const meaningful = lines.filter((line) => line.trim() && !/^[#>*-]+$/.test(line.trim()));
        const candidates = meaningful
            .filter((line) => /(\d|finding|result|risk|todo|method|question)/i.test(line))
            .slice(0, 6);
        sections.push(`KEY FINDINGS\n${(candidates.length ? candidates : meaningful.slice(0, 6)).map(cleanLine).map((line) => `• ${line}`).join("\n")}`);
    }

    if (/risk|limitation|problem|issue|todo|action/.test(q)) {
        const flags = lines.filter((line) => /(risk|limitation|todo|fixme|failed|error|small|anomaly|warning|raise)/i.test(line));
        sections.push(`RISKS & ACTIONS\n${flags.length ? flags.slice(0, 10).map(cleanLine).map((line) => `• ${line}`).join("\n") : "• No explicit risk markers or TODO items were found."}`);
    }

    if (/structure|function|class|import|code|explain/.test(q) || /\.(py|js|html|css)$/i.test(state.fileName)) {
        const imports = lines.filter((line) => /^\s*(import |from |const .*require|<script|<link)/.test(line));
        const definitions = lines.filter((line) => /^\s*(def |class |function |const \w+\s*=\s*\(|async function)/.test(line));
        sections.push(`STRUCTURE\n• ${imports.length} import/dependency lines\n• ${definitions.length} function or class definitions\n${definitions.slice(0, 8).map(cleanLine).map((line) => `• ${line}`).join("\n") || "• Treated as a prose/data document rather than source code."}`);
    }

    if (state.fileType === "CSV" || /csv|column|data|row/.test(q)) {
        const rows = lines.filter(Boolean).map(parseCsvRow);
        const headers = rows[0] || [];
        const numeric = headers.map((header, index) => {
            const values = rows.slice(1).map((row) => Number(row[index])).filter(Number.isFinite);
            if (!values.length) return null;
            const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
            return `${header}: min ${Math.min(...values).toFixed(2)}, max ${Math.max(...values).toFixed(2)}, mean ${avg.toFixed(2)}`;
        }).filter(Boolean);
        sections.push(`DATA PROFILE\n• ${Math.max(rows.length - 1, 0)} data rows\n• ${headers.length} columns: ${headers.join(", ")}\n${numeric.map((item) => `• ${item}`).join("\n")}`);
    }

    if (!sections.slice(1).length) {
        const matching = rankSentences(text, question).slice(0, 5);
        sections.push(`MOST RELEVANT EVIDENCE\n${matching.length ? matching.map((line) => `• ${line}`).join("\n") : "• I could not find a direct match. Try asking for a summary, risks, structure, or data profile."}`);
    }

    sections.push(`DOCUMENT PROFILE\n• ${lines.length} lines, ${words.length} words, ${text.length.toLocaleString()} characters\n• Frequent terms: ${keywords.join(", ") || "not enough text"}\n• Processing: local in this browser; no data was uploaded`);
    sections.push("LIMITATION\nBrowser demo uses rules and keyword matching, not a generative model. Use Online LLM or Local Ollama for deeper semantic analysis.");
    return sections.join("\n\n");
}

async function queryOnline(question) {
    const endpoint = valueOf("online-endpoint");
    const model = valueOf("online-model");
    const key = valueOf("online-key");
    if (!endpoint || !model || !key) throw new Error("Enter an API endpoint, model name, and API key.");
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
            model,
            messages: buildMessages(question),
            temperature: 0.2
        })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || `API returned HTTP ${response.status}.`);
    return data.choices?.[0]?.message?.content || "The model returned an empty response.";
}

async function queryOllama(question) {
    const endpoint = valueOf("ollama-endpoint");
    const model = valueOf("ollama-model");
    if (!endpoint || !model) throw new Error("Enter the Ollama endpoint and model name.");
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: buildMessages(question), stream: false })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Ollama returned HTTP ${response.status}.`);
    return data.message?.content || "The local model returned an empty response.";
}

function buildMessages(question) {
    return [
        {
            role: "system",
            content: "You are FileLens, a careful file-analysis agent. Answer only from the provided file. Cite concrete lines or values when possible. State uncertainty and do not invent facts."
        },
        {
            role: "user",
            content: `FILE NAME: ${state.fileName}\n\nFILE CONTENT:\n${state.content.slice(0, 16000)}\n\nQUESTION:\n${question}`
        }
    ];
}

async function testConnection(provider, button) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Testing...";
    try {
        if (provider === "online") {
            const endpoint = valueOf("online-endpoint");
            const model = valueOf("online-model");
            const key = valueOf("online-key");
            if (!endpoint || !model || !key) throw new Error("Complete all online settings first.");
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
                body: JSON.stringify({ model, messages: [{ role: "user", content: "Reply with: connection ready" }], max_tokens: 12 })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } else {
            const endpoint = valueOf("ollama-endpoint").replace(/\/api\/chat\/?$/, "/api/tags");
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        button.textContent = "Connection ready ✓";
        setStatus("Connected", "ready");
    } catch (error) {
        button.textContent = `Failed: ${error.message}`;
        setStatus("Offline", "error");
    } finally {
        setTimeout(() => {
            button.textContent = original;
            button.disabled = false;
        }, 2800);
    }
}

function addMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${role === "user" ? "user-message" : "agent-message"}`;
    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "YOU" : "AI";
    const content = document.createElement("div");
    const meta = document.createElement("p");
    meta.className = "message-meta";
    meta.textContent = `${role === "user" ? "You" : "FileLens Agent"} · now`;
    const body = document.createElement("div");
    body.className = "message-body";
    body.textContent = text;
    content.append(meta, body);
    wrapper.append(avatar, content);
    elements.conversation.append(wrapper);
    elements.conversation.scrollTop = elements.conversation.scrollHeight;
    return wrapper;
}

function addTyping() {
    const wrapper = addMessage("agent", "");
    wrapper.querySelector(".message-body").innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
    return wrapper;
}

function setBusy(busy) {
    elements.runButton.disabled = busy;
    elements.runButton.firstChild.textContent = busy ? "Working " : "Analyze ";
    if (busy) setStatus("Thinking", "busy");
}

function setStatus(text, kind) {
    elements.status.textContent = text;
    elements.status.className = `chip status-pill ${kind}`;
}

function extractKeywords(words) {
    const stop = new Set("the and that this with from have were will your into about after before their there what when where which while does than then they them been being are for but not you can how our out use using used its has had".split(" "));
    const counts = {};
    words.forEach((word) => {
        const key = word.toLowerCase().replace(/^'|'$/g, "");
        if (key.length > 3 && !stop.has(key) && !/^\d+$/.test(key)) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word, count]) => `${word} (${count})`);
}

function rankSentences(text, question) {
    const terms = new Set((question.toLowerCase().match(/[a-z]{3,}/g) || []));
    return text.split(/(?<=[.!?])\s+|\n+/)
        .map((line) => cleanLine(line))
        .filter((line) => line.length > 15)
        .map((line) => ({
            line,
            score: [...terms].reduce((sum, term) => sum + (line.toLowerCase().includes(term) ? 1 : 0), 0)
        }))
        .sort((a, b) => b.score - a.score || b.line.length - a.line.length)
        .filter((item) => item.score > 0)
        .map((item) => item.line);
}

function parseCsvRow(line) {
    const values = [];
    let current = "";
    let quoted = false;
    for (const char of line) {
        if (char === '"') quoted = !quoted;
        else if (char === "," && !quoted) {
            values.push(current.trim());
            current = "";
        } else current += char;
    }
    values.push(current.trim());
    return values;
}

function cleanLine(line) {
    return line.replace(/^\s*[-*#>]+\s*/, "").trim();
}

function valueOf(id) {
    return document.getElementById(id).value.trim();
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
