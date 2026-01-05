import Script from "next/script";

export default function BellatronPage() {
  return (
    <>
      {/* Styles */}
      <link rel="stylesheet" href="/assets/css/style.css" />
      <link rel="stylesheet" href="/assets/css/bellatron.css" />

      {/* Chart.js */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
        strategy="beforeInteractive"
      />

      {/* Bellatron JS */}
      <Script src="/assets/js/bellatron.js" strategy="afterInteractive" />

      <main data-page="bellatron">
        <section className="hero reveal">
          <div className="hero-main">
            <div className="hero-kicker">
              Installer Tool • Log Analysis • Engine v2.4
            </div>

            <h1>B.E.L.L.A — diagnose faults from PositionSense logs.</h1>

            <p>
              Upload PositionSense logs and receive ranked fault probabilities,
              installer recommendations, confidence grading, and a visual
              timeline of events.
            </p>

            <div className="hero-actions">
              <label className="btn btn-primary bellatron-file">
                <input id="logFile" type="file" accept=".txt,.log" hidden />
                <span>Select log file</span>
              </label>

              <button
                id="analyzeBtn"
                className="btn btn-ghost"
                type="button"
                disabled
              >
                Analyze
              </button>
            </div>

            <div className="bellatron-meta">
              <span id="fileName" className="chip">
                No file selected
              </span>
              <span id="confidenceChip" className="chip chip-muted">
                Confidence: —
              </span>
            </div>
          </div>
        </section>

        <section className="section section-soft reveal">
          <h2>Visual timeline</h2>
          <p>
            Each point is a close attempt. Hover to see outcome, duration, and
            humidity correlation.
          </p>

          <div className="cards">
            <article className="card bellatron-wide">
              <div className="bellatron-chart-wrap">
                <canvas id="timelineChart" height={120}></canvas>
              </div>

              <div className="bellatron-episodes">
                <h3>Episodes</h3>
                <div
                  id="episodesList"
                  className="bellatron-list muted"
                >
                  Upload a log to populate episodes.
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="section reveal">
          <h2>Likely causes</h2>
          <p>
            Weighted and normalized — the top item is the primary hypothesis.
          </p>

          <div className="cards">
            <article className="card">
              <h3>Ranked causes</h3>
              <div id="causesList" className="bellatron-list muted">
                Upload a log to populate results.
              </div>
            </article>

            <article className="card">
              <h3>Installer recommendations</h3>
              <div id="recsList" className="bellatron-list muted">
                Upload a log to populate recommendations.
              </div>
            </article>

            <article className="card">
              <h3>Notes</h3>
              <div id="notesList" className="bellatron-list muted">
                Upload a log to populate notes.
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
