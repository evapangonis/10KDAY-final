export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="brand">10KDAY</p>
        <h1>Hit 10,000 steps. Every single day.</h1>
        <p className="lead">
          10KDAY tracks your steps as you go and sends friendly reminders
          throughout the day to get up and keep walking, so you always reach
          your 10K goal before bedtime.
        </p>

        <div className="progress" aria-hidden="true">
          <div className="progress-bar" />
        </div>
        <p className="progress-label">7,420 / 10,000 steps — keep going!</p>
      </section>

      <footer className="footer">
        <p>Created by Evangeline Pangonis</p>
      </footer>
    </main>
  );
}
