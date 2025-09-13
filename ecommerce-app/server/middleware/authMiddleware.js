// import jwt from "jsonwebtoken";

// // Middleware to protect routes - unchanged except formatted slightly for readability
// export const protect = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided, authorization denied" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user info (including role) to request object
//     next();
//   } catch (err) {
//     if (err.name === "TokenExpiredError") {
//       return res.status(401).json({ message: "Token expired, please log in again" });
//     }
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// // Middleware to check if the user is an admin
// export const admin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next(); // User is admin, allow access
//   } else {
//     res.status(403).json({ message: "Admin access required" }); // Not an admin
//   }
// };

import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};
