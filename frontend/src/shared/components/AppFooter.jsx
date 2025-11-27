function AppFooter() {
  return (
    <footer
      style={{
        padding: "16px 24px",
        fontSize: "12px",
        color: "var(--text-muted)",
        textAlign: "center",
      }}
    >
      Icons:{" "}
      <a
        href="https://www.flaticon.com/free-icons/menu"
        title="menu icons"
        target="_blank"
        rel="noreferrer"
      >
        Menu icon by Febrian Hidayat
      </a>{" "}
      and{" "}
      <a
        href="https://www.flaticon.com/free-icons/close"
        title="close icons"
        target="_blank"
        rel="noreferrer"
      >
        Close icon by Pixel perfect
      </a>{" "}
      from Flaticon.
    </footer>
  );
}

export default AppFooter;
