import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './landing.css'; 
const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <div className="landing-page">
            {/* Welcome Text */}
            <h1 className="welcome-text">WELCOME TO</h1>

            {/* Logo Image */}
            <img 
                className="logo"
                src="/assets/images/logo2.png"
                alt="Hamro Sathi Logo"
            />

            {/* Get Started Button */}
            <button className="get-started-button" onClick={handleGetStarted}>
                Get Started
            </button>
        </div>
    );
};

export default LandingPage;
