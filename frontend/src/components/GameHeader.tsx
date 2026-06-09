export function GameHeader({ theme }: { theme: "dark" | "light" }) {
  const logoSrc = theme === "light" ? "/images/black_on_white.png" : "/images/white_on_black.png";

  return (
    <header className="title-block">
      <img src={logoSrc} alt="Blindfold" className="game-logo" />
    </header>
  );
}
