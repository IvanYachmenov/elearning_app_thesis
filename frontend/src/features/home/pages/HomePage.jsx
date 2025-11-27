import '../home.css';

function HomePage({ user }) {
  return (
    <div className="page page-enter">
      <div className="home-welcome">
        <h1 className="page__title">Welcome back, {user.username}! 👋</h1>
        <p className="page__subtitle">
          Your personal learning platform for mastering programming and beyond.
        </p>
      </div>

      <section className="home-section">
        <h2 className="home-section__title">
          <span className="home-section__icon">✨</span>
          What&apos;s E-Learning Platform?
        </h2>
        <p className="home-section__text">
          This is a modern, focused e-learning platform designed to help you connect
          theory and practice for programming languages like Python and many other topics.
        </p>
        <p className="home-section__text">
          Instead of just watching long video courses, you&apos;ll read concise lessons and
          immediately apply concepts through quizzes and coding tasks directly in the browser.
        </p>
      </section>

      <section className="home-section">
        <h2 className="home-section__title">
          <span className="home-section__icon">💻</span>
          Interactive Learning Experience
        </h2>
        <p className="home-section__text">
          For Python courses, we provide an integrated online interpreter. You can write code
          in an editor on the page, run it on our server, and get automatic feedback.
        </p>
        <p className="home-section__text">
          This lowers the barrier for beginners—you only need a browser, not a full local setup.
        </p>
      </section>

      <section className="home-section">
        <h2 className="home-section__title">
          <span className="home-section__icon">🎓</span>
          For Teachers &amp; Content Creators
        </h2>
        <p className="home-section__text">
          Teachers can create their own courses, organize them into modules and topics, add
          quiz questions and coding exercises.
        </p>
        <p className="home-section__text">
          Future updates will include payments, gamification with points and an internal shop.
        </p>
      </section>
    </div>
  );
}

export default HomePage;
