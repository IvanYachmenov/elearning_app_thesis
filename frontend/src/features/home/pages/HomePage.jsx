function HomePage({ user}) {
  return (
    <div>
        <h1 style={{ fontSize: "24px", marginBottom: "12px"}}>
            Welcome back, {user.username}!
        </h1>

        <p style={{ marginBottom: "16px", color: "#9ca3af" }}>
            This app is small, focused e-learning platform that will help you to connect theory
            and practice for programming languages(as Python, etc.) and another different topics you can imagine.
        </p>

        <section
            style={{
                marginTop: "12px",
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
            }}
        >
            <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
                What's hidden under the hood in this app?
            </h2>

            <p style={{ marginBottom: "8px", color: "#e5e7eb" }}>
                The goal of this platform is to offer a modern, responsive
                web-application for online learning. Instead of only watching
                long video courses, students read short lessons and can immediately
                try the concept in quizzes or coding tasks directly in the browser.
            </p>

            <p style={{ marginBottom: "8px", color: "#e5e7eb" }}>
                For Python courses there will be an integrated online interpreter:
                students will write code in an editor on the page, run it on the
                server and get automatic feedback based on prepared test cases.
                This lowers the barrier for beginners – they only need a browser,
                not a full local development setup.
            </p>
        </section>

        <section
            style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
            }}
        >
            <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>For teachers</h2>
            <p style={{ marginBottom: "8px", color: "#e5e7eb" }}>
                The platform is designed to be open for content creators. Teachers
                will be able to create their own courses, split them into modules
                and topics, add quiz questions and coding exercises, and later mark
                some content as free or premium.
            </p>
            <p style={{ marginBottom: "8px", color: "#e5e7eb" }}>
                In the future there will also be support for payments and a simple
                gamification system with points and an internal shop, but this is
                not part of the first MVP.
            </p>
        </section>
    </div>
  );
}

export default HomePage;
