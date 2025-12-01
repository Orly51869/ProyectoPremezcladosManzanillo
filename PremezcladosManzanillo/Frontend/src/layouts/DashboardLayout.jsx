import React from "react";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar.jsx";
import Footer from "../components/Footer.jsx";

const DashboardLayout = () => (
  <div className="min-h-screen flex flex-col">
    <DashboardNavbar />
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-grow pt-32 md:pt-36"
    >
      <Outlet />
    </motion.main>
    <Footer />
  </div>
);

export default DashboardLayout;