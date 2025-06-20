import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header/Header';
import Home from './Pages/Home';
import About from './Pages/About';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Blogs from './Pages/Blogs';
import BlogDetails from './Pages/BlogDetails';
import AddBlog from './Pages/AddBlog';
import Gallery from './Pages/Gallery';
import Newsletter from './Shared/Newsletter';
import { AuthContextProvider, AuthContext } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

const App = () => {
    return (
        <AuthContextProvider>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetails />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/add-blog"
                    element={
                        <PrivateRoute>
                            <AddBlog />
                        </PrivateRoute>
                    }
                />
                {/* Add other routes as needed */}
            </Routes>
            <Newsletter />
        </AuthContextProvider>
    );
};

// PrivateRoute Component
const PrivateRoute = ({ children }) => {
    const { token } = React.useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
};

export default App; 