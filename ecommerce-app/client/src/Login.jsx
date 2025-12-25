// // import { useState } from "react";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";
// // import "./Login.css";

// // function Login() {
// //   const [username, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [isRegister, setIsRegister] = useState(false);
// //   const navigate = useNavigate();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const url = isRegister ? "/api/users/register" : "/api/users/login";
// //       const { data } = await axios.post(`http://localhost:5000${url}`, { username, password });
// //       if (!isRegister) {
// //         localStorage.setItem("token", data.token);
// //         localStorage.setItem("role", data.role); // store role
// //         navigate(data.role === "admin" ? "/admin" : "/");
// //       } else {
// //         alert("Registered! Please login.");
// //         setIsRegister(false);
// //       }
// //     } catch (err) {
// //       alert(err.response?.data?.message || "Error occurred");
// //     }
// //   };

// //   return (
// //     <div className="login-page">
// //       <div className="login-card">
// //         <h2 className="login-title">{isRegister ? "Sign-Up" : "Sign-In"}</h2>
// //         <form onSubmit={handleSubmit} className="login-form">
// //           <input
// //             className="login-input"
// //             placeholder="Username"
// //             value={username}
// //             onChange={(e) => setUsername(e.target.value)}
// //             required
// //           />
// //           <input
// //             type="password"
// //             className="login-input"
// //             placeholder="Password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //           />
// //           <button type="submit" className="login-btn">{isRegister ? "Sign-Up" : "Sign-In"}</button>
// //         </form>
// //         <button onClick={() => setIsRegister(!isRegister)} className="switch-btn">
// //           {isRegister ? "Sign-In" : "Sign-Up"}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Login;


// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";

// function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [isRegister, setIsRegister] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const url = isRegister ? "/api/users/register" : "/api/users/login";
//       const { data } = await axios.post(`http://localhost:5000${url}`, { username, password });
//       if (!isRegister) {
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("role", data.role);
//         localStorage.setItem("cart", JSON.stringify(data.cart || []));
//         navigate(data.role === "admin" ? "/admin" : "/");
//       } else {
//         alert("Registered! Please login.");
//         setIsRegister(false);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Error occurred");
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <h2 className="login-title">{isRegister ? "Sign-up" : "Sign-in"}</h2>
//         <form onSubmit={handleSubmit} className="login-form">
//           <input
//             className="login-input"
//             placeholder="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             className="login-input"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button type="submit" className="login-btn">{isRegister ? "Sign-up" : "Sign-in"}</button>
//         </form>
//         <button onClick={() => setIsRegister(!isRegister)} className="switch-btn">
//           {isRegister ? "Sign-in" : "Sign-up"}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Login;

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API from "./api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? "/api/users/register" : "/api/users/login";
      const { data } = await API.post(url, { username, password });
      if (!isRegister) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("cart", JSON.stringify(data.cart || []));
        navigate(data.role === "admin" ? "/admin" : "/");
      } else {
        alert("Registered! Please login.");
        setIsRegister(false);
      }
    } catch (err) {
  console.error("LOGIN ERROR:", err.message);
  res.status(500).json({ message: err.message });
}
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">{isRegister ? "Sign Up" : "Sign In"}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-label="Username"
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
          <button type="submit" className="login-btn">{isRegister ? "Sign Up" : "Sign In"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="switch-btn">
          {isRegister ? "Back to Sign In" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default Login;
