import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useAuth } from "../Context/AppContext";
import { AppIcon } from "../Components/AppIcon";

const fadeUp = (delay = 0) => ({initial: {opacity: 0, y:20, filter: "blur(6px)"},
animate: { opacity: 1, y: 0, filter: "blur(0px)"},
transition: {duration : 0.45, delay, ease: [0.25,0.46,0.45,0.94]},
});

const BASE = import.meta.env.VITE_API_URL || "https://localhost:5000/api";

//  stat card  //
function StatCard ({label, value, icon, accent, delay }) {
    
}