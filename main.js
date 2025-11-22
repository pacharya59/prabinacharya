/* ============================================
   RAINY CLOUD BACKGROUND
   ============================================ */
#three-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: linear-gradient(to bottom, 
        #2c3e50 0%,
        #34495e 50%,
        #3d5368 100%);
    overflow: hidden;
}

/* Cloud layer */
#three-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background-image: 
        radial-gradient(ellipse 800px 200px at 50% 20%, rgba(100, 116, 139, 0.3), transparent),
        radial-gradient(ellipse 600px 150px at 20% 40%, rgba(71, 85, 105, 0.4), transparent),
        radial-gradient(ellipse 700px 180px at 80% 30%, rgba(100, 116, 139, 0.35), transparent);
    animation: moveClouds 60s linear infinite;
}

@keyframes moveClouds {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
}

/* Ground puddle effect */
#three-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background: linear-gradient(to top, 
        rgba(100, 116, 139, 0.3) 0%,
        transparent 100%);
}
