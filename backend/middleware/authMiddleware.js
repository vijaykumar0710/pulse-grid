const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      // "Bearer <token>" se sirf token nikalna
      token = token.split(" ")[1];

      // Token verify karna
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "pulsegrid_secret_123",
      );

      // Decoded data (id, role, room) req.user mein daal diya
      req.user = decoded;
      next();
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, invalid token" });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
