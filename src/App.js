import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RestauranteList from "./components/RestauranteList";
import RestauranteDetails from "./components/RestauranteDetails";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<RestauranteList />} />
                <Route path="/restaurantes/:id" element={<RestauranteDetails />} />
            </Routes>
        </Router>
    );
};

export default App;
