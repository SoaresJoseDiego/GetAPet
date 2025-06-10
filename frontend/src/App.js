import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* components */
import Navbar from "./components/layouts/Navbar";
import Footer from "./components/layouts/Footer";
import Container from "./components/layouts/Container";
import Message from "./components/layouts/Message";
/* pages*/
import Login from "./components/pages/Auth/Login";
import Register from "./components/pages/Auth/Register";
import Home from "./components/pages/Home";

/*context*/
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <Router>
      <UserProvider>
        <Navbar />
        <Message />
        <Container>
          <Routes>
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/" element={<Home />} />
          </Routes>
        </Container>
        <Footer />
      </UserProvider>
    </Router>
  );
}

export default App;
