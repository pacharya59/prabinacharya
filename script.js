// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
hamburger.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

// Scroll reveal
const faders = document.querySelectorAll('.fade');
const options = { threshold: 0.12 };
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting) e.target.classList.add('visible');
  });
}, options);
faders.forEach(f => io.observe(f));

// Rain canvas
const canvas = document.getElementById('rain-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const drops = [];
const dropCount = 100;

for(let i=0;i<dropCount;i++){
  drops.push({
    x: Math.random()*width,
    y: Math.random()*height,
    length: Math.random()*15+10,
    velocity: Math.random()*2+2,
    opacity: Math.random()*0.4+0.3
  });
}

function animate(){
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle='rgba(255,255,255,0.7)';
  drops.forEach(d=>{
    ctx.beginPath();
    ctx.moveTo(d.x,d.y);
    ctx.lineTo(d.x,d.y+d.length);
    ctx.strokeStyle=`rgba(255,255,255,${d.opacity})`;
    ctx.lineWidth=1.5;
    ctx.stroke();
    d.y += d.velocity;
    if(d.y > height) d.y = -d.length;
  });
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', ()=>{
  width=canvas.width=window.innerWidth;
  height=canvas.height=window.innerHeight;
});
