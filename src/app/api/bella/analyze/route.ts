(() => {
  const fileInput = document.getElementById("logFile");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const fileNameChip = document.getElementById("fileName");
  const confidenceChip = document.getElementById("confidenceChip");

  const causesList = document.getElementById("causesList");
  const recsList = document.getElementById("recsList");
  const notesList = document.getElementById("notesList");
  const episodesList = document.getElementById("episodesList");

  const chartCanvas = document.getElementById("timelineChart");

  let selectedText = "";
  let chart = null;

  function setMuted(el, mutedText) {
    el.classList.add("muted");
    el.textContent = mutedText;
  }

  function setList(el, items) {
    el.classList.remove("muted");
    el.innerHTML = "";
    const ul = document.createElement("ul");
    ul.className = "bellatron-ul";
    items.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    el.appendChild(ul);
  }

  function formatPct(v) {
    if (typeof v !== "number" || Number.isNaN(v)) return "—";
    return `${Math.round(v * 100)}%`;
  }

  function normalizeOutcome(outcome) {
    // Keep stable display labels
    switch (outcome) {
      case "GOOD_CLOSE": return "GOOD";
      case "MARGINAL_CLOSE": return "MARGINAL";
      case "LATCH_MISS": return "LATCH MISS";
      case "HARD_FAIL": return "HARD FAIL";
      default: return outcome || "UNKNOWN";
    }
  }

  function outcomeToY(outcome) {
    // Map categories to rows so chart is readable
    switch (outcome) {
      case "GOOD_CLOSE": return 3;
      case "MARGINAL_CLOSE": return 2;
      case "LATCH_MISS": return 1;
      case "HARD_FAIL": return 0;
      default: return -1;
    }
  }

  function buildTimelineDataset(timeline) {
    // Chart.js scatter: [{x, y, ...meta}]
    return timeline
      .filter((e) => e && e.ts)
      .map((e, idx) => {
        const x = new Date(e.ts).getTime();
        const y = outcomeToY(e.outcome);
        return {
          x,
          y,
          _idx: idx,
          _meta: e,
        };
      });
  }

  function renderChart(timeline) {
    if (!window.Chart || !chartCanvas) return;

    const data = buildTimelineDataset(timeline);

    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Close attempts",
            data,
            pointRadius: 4,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        scales: {
          x: {
            type: "time",
            time: { unit: "minute" },
            ticks: { maxRotation: 0 },
          },
          y: {
            min: -0.5,
            max: 3.5,
            ticks: {
              stepSize: 1,
              callback: (v) => {
                if (v === 3) return "GOOD";
                if (v === 2) return "MARGINAL";
                if (v === 1) return "LATCH";
                if (v === 0) return "HARD";
                return "";
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const m = ctx.raw?._meta || {};
                const out = normalizeOutcome(m.outcome);
                const dur = m.duration_ms ?? "n/a";
                const hum = (typeof m.hum_near === "number") ? m.hum_near.toFixed(1) : "n/a";
                const slow = m.slow ? "SLOW" : "OK";
                const wet = m.wet ? "WET" : "DRY";
                return `${out} • ${dur}ms • hum~${hum} • ${slow}/${wet}`;
              },
            },
          },
          legend: { display: false },
        },
      },
    });
  }

  function renderEpisodes(episodes) {
    if (!Array.isArray(episodes) || episodes.length === 0) {
      setMuted(episodesList, "No episodes detected in this file.");
      return;
    }
    episodesList.classList.remove("muted");
    episodesList.innerHTML = "";

    const ul = document.createElement("ul");
    ul.className = "bellatron-ul";

    episodes.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = `${e.kind} (${e.count}) • ${e.start_ts || "?"} → ${e.end_ts || "?"}`;
      ul.appendChild(li);
    });

    episodesList.appendChild(ul);
  }

  function renderResults(result) {
    // Confidence chip
    const conf = result?.diagnosis?.confidence;
    const level = conf?.level || "—";
    const score = (typeof conf?.score === "number") ? conf.score.toFixed(2) : "—";
    confidenceChip.classList.remove("chip-muted");
    confidenceChip.textContent = `Confidence: ${level} (${score})`;

    // Causes
    const scores = result?.diagnosis?.scores || {};
    const causes = [
      `Mechanical drag/obstruction: ${formatPct(scores.mechanical_drag_or_obstruction)}`,
      `Environment-related resistance: ${formatPct(scores.environment_related_resistance)}`,
      `Bounce-back/force issue: ${formatPct(scores.bounce_back_or_force_issue)}`,
    ];
    setList(causesList, causes);

    // Recs + notes
    setList(recsList, result?.diagnosis?.recommendations || ["No recommendations returned."]);
    const notes = result?.diagnosis?.notes || [];
    if (notes.length) setList(notesList, notes);
    else setMuted(notesList, "None");

    // Timeline + episodes
    renderChart(result?.diagnosis?.timeline_events || []);
    renderEpisodes(result?.diagnosis?.episodes || []);
  }

  async function analyzeLog(text) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing…";

    try {
      const res = await fetch("/api/bella/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_text: text }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || data?.detail || `Error ${res.status}`;
        throw new Error(msg);
      }

      renderResults(data);
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Analyze";
    }
  }

  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      selectedText = "";
      fileNameChip.textContent = "No file selected";
      analyzeBtn.disabled = true;
      return;
    }

    fileNameChip.textContent = file.name;

    selectedText = await file.text();
    analyzeBtn.disabled = !selectedText.trim();

    // Reset UI placeholders
    setMuted(causesList, "Ready to analyze.");
    setMuted(recsList, "Ready to analyze.");
    setMuted(notesList, "Ready to analyze.");
    setMuted(episodesList, "Ready to analyze.");
    confidenceChip.classList.add("chip-muted");
    confidenceChip.textContent = "Confidence: —";
  });

  analyzeBtn?.addEventListener("click", () => {
    if (!selectedText.trim()) return;
    analyzeLog(selectedText);
  });

})();
