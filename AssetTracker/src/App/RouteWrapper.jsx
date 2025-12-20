// src/routes/RouteWrapper.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import appRoutes from "../constants/AppRoutes";

import PublicLayout from "../layouts/PublicLayout"; // Layout for public pages
import PrivateLayout from "../layouts/PrivateLayout"; // Layout for protected pages
import NoPageFound from "../Pages/Global/NoPageFound";
import ProtectedPage from "../components/ProtectedPage";

const RouteWrapper = () => {
    return (
    <Routes>
        {appRoutes.map(({ path, Element, isProtected, isIndexUrl }, idx) => {
            if (isProtected) {
                return (
                    <Route key={idx} element={<PrivateLayout />}>
                        <Route
                            index={isIndexUrl}
                            path={path}
                            element={<ProtectedPage> <Element /> </ProtectedPage>
                            }
                        /> 
                    </Route>
                );
            } else {
                return (
                    <Route key={idx} element={<PublicLayout />}>
                        <Route index={isIndexUrl} path={path} element={<Element />} /> </Route>
                );
            }
        })}
        {/* Fallback route */}
        <Route element={<PublicLayout />}>
            <Route path="*" element={<NoPageFound />} /> </Route>
    </Routes>
    );
};

export default RouteWrapper;
