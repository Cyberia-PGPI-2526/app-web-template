export default function handleJwtError(error, res) {
  switch (error.name) {
    case "TokenExpiredError":
      return res.status(401).json({ message: "Expired token", code: "TOKEN_EXPIRED" })
    case "JsonWebTokenError":
      return res.status(403).json({ message: "Invalid token", code: "INVALID_TOKEN" })
    case "NotBeforeError":
      return res.status(403).json({ message: "Inactiva token", code: "TOKEN_NOT_ACTIVE" })
    default:
      return res.status(500).json({ message: "Server error", code: "AUTH_ERROR" })
  }
}
