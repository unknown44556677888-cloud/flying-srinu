(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreLabel = document.getElementById('score');
  const bestLabel = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const startButton = document.getElementById('start-button');
  const title = document.getElementById('overlay-title');
  const eyebrow = document.getElementById('overlay-eyebrow');
  const copy = document.getElementById('overlay-copy');
  const crashAudio = document.getElementById('crash-audio');
  const flightAudio = document.getElementById('flight-audio');
  const soundButton = document.getElementById('sound-toggle');
  const soundState = document.getElementById('sound-state');
  const W = canvas.width, H = canvas.height;
  const photo = new Image(); photo.src = 'assets/friend-photo.jpeg';
  const obstacleImage = new Image(); obstacleImage.src = 'assets/long-shawarma.png';
  const bestKey = 'flyingBalayaBest';
  let best = Number(localStorage.getItem(bestKey) || 0);
  let mode = 'ready', score = 0, player, pipes = [], clouds = [], frame = 0;
  let soundOn = true, audioUnlocked = false, lastTime = 0, raf;
  flightAudio.volume = 0.24;
  bestLabel.textContent = best;

  for (let i=0;i<6;i++) clouds.push({x: i*180+40,y: 55+(i*73)%210,s: .55+(i%3)*.18});
  function reset(){ player={x:190,y:270,vy:0,r:34,rot:0}; pipes=[]; score=0; frame=0; scoreLabel.textContent='0'; }
  function start(){
    unlockAudio(); reset(); mode='playing'; overlay.classList.add('hidden');
    if(soundOn && flightAudio.getAttribute('src')) flightAudio.play().catch(()=>{});
    lastTime=performance.now(); cancelAnimationFrame(raf); raf=requestAnimationFrame(loop);
  }
  function unlockAudio(){
    // The first user action starts the game; play the reaction directly on collision.
    audioUnlocked = true;
    crashAudio.volume = 1;
  }  function flap(){if(mode==='playing'){player.vy=-430;} }
  function act(){if(mode!=='playing'){start();return;}flap();}
  startButton.addEventListener('click', e=>{e.stopPropagation();start();});
  canvas.addEventListener('pointerdown', e=>{e.preventDefault();act();});
  overlay.addEventListener('pointerdown', e=>{if(e.target===overlay) act();});
  window.addEventListener('keydown', e=>{if(e.code==='Space' && !e.repeat){e.preventDefault();act();} if((e.key==='r'||e.key==='R')&&mode==='over')start();});
  soundButton.addEventListener('click',()=>{
    soundOn=!soundOn; soundButton.textContent=`Sound: ${soundOn?'on':'off'}`; soundButton.setAttribute('aria-pressed',String(!soundOn));
    if(!soundOn){flightAudio.pause();} else if(mode==='playing'&&flightAudio.getAttribute('src'))flightAudio.play().catch(()=>{});
  });
  function stop(){
    mode='over'; flightAudio.pause(); flightAudio.currentTime=0;
    if(soundOn && audioUnlocked && crashAudio.getAttribute('src')){crashAudio.pause();crashAudio.currentTime=0;crashAudio.volume=1;crashAudio.play().catch(()=>{});}
    if(score>best){best=score;bestLabel.textContent=best;localStorage.setItem(bestKey,String(best));}
    eyebrow.textContent='A LITTLE SKY PAUSE';title.textContent='Oops, you bonked!';copy.textContent=`You flew through ${score} ${score===1?'gate':'gates'}. Ready to give it another go?`;
    startButton.innerHTML='Fly again <span>→</span>';overlay.classList.remove('hidden');
  }
  function addPipe(){const gap=168; const top=90+Math.random()*(H-230-gap); pipes.push({x:W+30,top,gap,passed:false});}
  function update(dt){
    frame++; player.vy+=1280*dt; player.y+=player.vy*dt; player.rot=Math.max(-.45,Math.min(.9,player.vy/600));
    if(frame%105===0)addPipe();
    const speed=235+Math.min(score*4,100);
    for(const p of pipes){p.x-=speed*dt;if(!p.passed&&p.x+74<player.x){p.passed=true;score++;scoreLabel.textContent=score;}}
    pipes=pipes.filter(p=>p.x>-100);
    for(const c of clouds){c.x-=20*c.s*dt;if(c.x<-100)c.x=W+80;}
    if(player.y-player.r<0||player.y+player.r>H-34){stop();return;}
    for(const p of pipes){const hitX=player.x+player.r*.72>p.x&&player.x-player.r*.72<p.x+74; if(hitX&&(player.y-player.r*.72<p.top||player.y+player.r*.72>p.top+p.gap)){stop();return;}}
  }
  function roundRect(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function drawSky(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a9e2ff');g.addColorStop(.72,'#d4f2fa');g.addColorStop(1,'#eaf7e9');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // Sun glow
    const sun=ctx.createRadialGradient(660,105,8,660,105,80);sun.addColorStop(0,'#fff7cbcc');sun.addColorStop(1,'#fff7cb00');ctx.fillStyle=sun;ctx.fillRect(570,15,180,180);ctx.fillStyle='#fff5c8';ctx.beginPath();ctx.arc(660,105,28,0,Math.PI*2);ctx.fill();
    clouds.forEach(c=>drawCloud(c.x,c.y,c.s));
    ctx.fillStyle='#b6e6cf';ctx.beginPath();ctx.moveTo(0,H-70);for(let x=0;x<=W;x+=60)ctx.quadraticCurveTo(x+30,H-145+Math.sin(x*.02+frame*.008)*16,x+60,H-70);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
    ctx.fillStyle='#92d3b7';ctx.fillRect(0,H-34,W,34);ctx.fillStyle='#72bf9e';for(let x=0;x<W;x+=20)ctx.fillRect((x-frame*2)%W,H-34,10,4);
  }
  function drawCloud(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#ffffffc9';ctx.beginPath();ctx.arc(0,10,20,0,7);ctx.arc(22,0,27,0,7);ctx.arc(51,11,19,0,7);ctx.rect(-2,9,54,20);ctx.fill();ctx.restore();}
  function drawObstacleColumn(x,y,w,h){
    if(h<=0)return;
    if(obstacleImage.complete&&obstacleImage.naturalWidth){
      const fittedW=Math.min(w,h*obstacleImage.naturalWidth/obstacleImage.naturalHeight);
      const fittedX=x+(w-fittedW)/2;
      ctx.save();ctx.shadowColor='#35516344';ctx.shadowBlur=8;ctx.shadowOffsetY=3;
      ctx.drawImage(obstacleImage,fittedX,y,fittedW,h);ctx.restore();
    }
  }  function drawPipe(p){
    const bottom=p.top+p.gap;
    drawObstacleColumn(p.x-4,0,82,p.top-8);
    drawObstacleColumn(p.x-4,bottom+8,82,H-bottom-42);
  }  function drawPlayer(){
    const x=player?.x??190,y=player?.y??270,r=player?.r??26;ctx.save();ctx.translate(x,y);ctx.rotate(player?.rot??0);
    ctx.shadowColor='#27516a38';ctx.shadowBlur=13;ctx.shadowOffsetY=5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r+4,0,Math.PI*2);ctx.fill();ctx.shadowColor='transparent';
    ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();
    if(photo.complete&&photo.naturalWidth){const scale=Math.max((2*r)/photo.width,(2*r)/photo.height);const w=photo.width*scale,h=photo.height*scale;ctx.drawImage(photo,-w/2,-h/2,w,h);}else{ctx.fillStyle='#f0c4a0';ctx.fillRect(-r,-r,2*r,2*r);ctx.fillStyle='#ffe0c0';ctx.beginPath();ctx.arc(0,0,r*.7,0,7);ctx.fill();ctx.fillStyle='#79573d';ctx.beginPath();ctx.arc(0,-9,r*.7,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#273949';ctx.beginPath();ctx.arc(-7,0,2,0,7);ctx.arc(7,0,2,0,7);ctx.fill();}
    ctx.restore();ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#e0a956';ctx.beginPath();ctx.moveTo(r-4,0);ctx.lineTo(r+12,5);ctx.lineTo(r-4,10);ctx.fill();ctx.restore();
  }
  function draw(){drawSky();pipes.forEach(drawPipe);drawPlayer();}
  function loop(now){if(mode!=='playing')return;const dt=Math.min((now-lastTime)/1000,.035);lastTime=now;update(dt);draw();if(mode==='playing')raf=requestAnimationFrame(loop);}
  function idle(){if(mode==='playing')return;draw();requestAnimationFrame(idle);}
  reset();draw();
  // Make the score, gates, and photo visible before the player starts.
})();
