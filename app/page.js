const steps = [
  {
    title: "Tell it your day",
    body: "Type or paste your schedule into the chat — classes, shifts, meetings, whatever's on the calendar.",
  },
  {
    title: "It finds the gaps",
    body: "10KDAY's AI spots the open windows and plans short walks that add up to 10,000 steps.",
  },
  {
    title: "Get reminded in time",
    body: "You get a nudge before the busy part of your day hits, not after it's too late to walk.",
  },
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="brand">10KDAY</p>
        <h1>Hit 10,000 steps. Every single day.</h1>
        <p className="lead">
          Tell 10KDAY what your day looks like. It plans your walks around your
          schedule and reminds you to move before you get too busy to.
        </p>
        <a className="button" href="#pricing">
          Get started
        </a>

        <div className="chat" aria-label="Example conversation">
          <p className="bubble user">
            Class 9–12, work 1–5, dinner with friends at 7.
          </p>
          <p className="bubble bot">
            Walk 20 minutes at 12:05 on your way to work (~2,400 steps), then
            take a 30-minute loop at 5:15 before dinner (~3,600 steps). I&apos;ll
            remind you at 11:55 and 5:05.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <ol className="steps">
          {steps.map((step, i) => (
            <li key={step.title}>
              <span className="step-number">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>Who it&apos;s for</h2>
        <p className="lead">
          Students, office workers, and anyone whose day fills up before they
          notice. If you mean to go for a walk and suddenly it&apos;s 9pm,
          10KDAY is for you.
        </p>
      </section>

      <section className="section" id="pricing">
        <h2>Pricing</h2>
        <div className="plans">
          <div className="plan">
            <h3>Free</h3>
            <p className="price">$0</p>
            <ul>
              <li>Log your daily steps</li>
              <li>Track progress toward 10K</li>
            </ul>
          </div>
          <div className="plan pro">
            <h3>Pro</h3>
            <p className="price">
              $3.99<span>/month</span>
            </p>
            <ul>
              <li>AI schedule chat</li>
              <li>Walks planned around your day</li>
              <li>Reminders before you get busy</li>
            </ul>
          </div>
        </div>
        <p className="note">
          Less than one coffee a month for a habit that actually sticks.
        </p>
      </section>

      <footer className="footer">
        <p>Created by Evangeline Pangonis</p>
      </footer>
    </main>
  );
}
