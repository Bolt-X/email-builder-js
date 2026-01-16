import { Typography } from "@mui/material";

function NotFoundPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <Typography variant="h1">404</Typography>
      <Typography variant="subtitle1">
        The page you're looking for doesn't exist.
      </Typography>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.history.back();
        }}
        style={{
          marginTop: "1rem",
          color: "#1976d2",
          textDecoration: "none",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        ← Back
      </a>
    </div>
  );
}

export default NotFoundPage;
