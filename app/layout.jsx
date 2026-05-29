import "./globals.css";

export const metadata = {
  title: "spbbyebyemilana",
  description: "Авторская подборка мест Санкт-Петербурга: еда, кофе, арт и тихие прогулки.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
