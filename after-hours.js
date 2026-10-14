import {Heist,JOBS,FINISH_DISTANCE} from './heist-rules.mjs?v=heist-2';
import * as T from './vendor/three.module.js';
import {Meta} from './meta.js?v=1';
const PERKS=[
 {id:'heart',name:'Second wind',desc:'+1 life right now.',icon:'♥',rarity:'common',max:3},
 {id:'magnet',name:'File magnet',desc:'Grab files from the next lane too.',icon:'⊂',rarity:'common',max:1},
 {id:'bonus',name:'Overtime pay',desc:'+40% points from everything.',icon:'$',rarity:'common',max:3},
 {id:'barista',name:'Barista',desc:'Coffee shows up far more often.',icon:'☕',rarity:'common',max:2},
 {id:'calm',name:'Deep breath',desc:'Run 8% slower. Easier to react.',icon:'≈',rarity:'common',max:2},
 {id:'double',name:'Double jump',desc:'Jump again in mid-air.',icon:'⇈',rarity:'rare',max:1},
 {id:'thermos',name:'Thermos',desc:'Coffee shields block two hits.',icon:'◈',rarity:'rare',max:1},
 {id:'bulldozer',name:'Bulldozer',desc:'Smash through carts and copiers without getting hurt.',icon:'▰',rarity:'epic',max:1},
];
const meta=new Meta({id:'after-hours',accent:'#ffc16a',xpPerScore:.03,
 missions:[{id:'run800',text:'Run 800 m',stat:'distance',goal:800},{id:'run1600',text:'Run 1,600 m',stat:'distance',goal:1600,xp:250},{id:'files30',text:'Grab 30 files in one run',stat:'files',goal:30},{id:'files120',text:'Grab 120 files today',stat:'files',goal:120,scope:'day'},{id:'dodge20',text:'20-dodge streak',stat:'streak',goal:20},{id:'coffee3',text:'Drink 3 coffees today',stat:'coffee',goal:3,scope:'day'},{id:'score',text:'Score 6,000 in one run',stat:'score',goal:6000},{id:'perks3',text:'Take 3 upgrades in one run',stat:'perks',goal:3}],
 skins:[{id:'slate',name:'Slate suit',color:'#345260',level:1},{id:'olive',name:'Olive',color:'#5d6b2f',level:2},{id:'wine',name:'Wine',color:'#7d2c3b',level:3},{id:'cream',name:'Linen',color:'#d9cba8',level:5},{id:'teal',name:'Teal',color:'#1f8a7a',level:7},{id:'neon',name:'Neon',color:'#ff4fd8',level:10}]});
let up={},jumps=0,streak=0,nextPerk=400,zone=0;const mult=()=>1+.4*(up.bonus||0);
import { Reflector } from './vendor/Reflector.js';
const $=id=>document.getElementById(id);let graphicsLost=false;let r;try{r=new T.WebGLRenderer({canvas:$('scene'),antialias:true});}catch(e){document.body.insertAdjacentHTML('beforeend','<div class="fatal"><h2>This office needs WebGL</h2><p>Enable browser hardware acceleration, then reload.</p></div>');throw e;}r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
const scene=new T.Scene();scene.background=new T.Color(0x6b7d84);scene.fog=new T.FogExp2(0x6b7d84,.008);const camera=new T.PerspectiveCamera(54,1,.1,180);const hemi=new T.HemisphereLight(0xffddb0,0x384652,2.3);scene.add(hemi);const sun=new T.DirectionalLight(0xffc68a,4);sun.position.set(-15,25,-30);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:35,bottom:-25,far:100});sun.shadow.bias=-.001;scene.add(sun);
const colors={floor:0x53504b,wall:0x424b50,wood:0x997354,dark:0x202a30,cream:0xe5d8bd,amber:0xffb54f,red:0xef6655,teal:0x7be6cd,leaf:0x3d7057,skin:0xd5a27d,suit:0x345260};const m={};for(const [k,c]of Object.entries(colors))m[k]=new T.MeshStandardMaterial({color:c,roughness:k==='floor'?.23:.6,metalness:k==='floor'?.3:0,...(['amber','red','teal'].includes(k)?{emissive:c,emissiveIntensity:.3}:{})});m.player=m.suit.clone();m.player.color.set(meta.skin.color);meta.on(e=>{if(e.type==='skin')m.player.color.set(e.skin.color);});m.glass=new T.MeshStandardMaterial({color:0xb4dddd,transparent:true,opacity:.13,roughness:.1});const cube=new T.BoxGeometry(),sphere=new T.SphereGeometry(1,10,8),cylinder=new T.CylinderGeometry(1,1,1,12);
function box(g,x,y,z,w,h,d,mat,sh=true){const a=new T.Mesh(cube,typeof mat==='string'?m[mat]:mat);a.position.set(x,y,z);a.scale.set(w,h,d);a.castShadow=sh;a.receiveShadow=true;g.add(a);return a;}function ball(g,x,y,z,s,mat){const a=new T.Mesh(sphere,m[mat]);a.position.set(x,y,z);a.scale.setScalar(s);g.add(a);return a;}function label(t,bg='#283332'){const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,512,128);q.fillStyle='#fff0d4';q.font='bold 47px sans-serif';q.textAlign='center';q.fillText(t,256,82);return new T.MeshBasicMaterial({map:new T.CanvasTexture(c)});}const archiveLabel=label('ARCHIVE','#8c571b'),syncLabel=label('QUICK SYNC','#a1382c');
function desk(g,x,z){box(g,x,.95,z,2.15,.15,1.25,'wood');for(const d of [-.85,.85])box(g,x+d,.46,z,.09,.9,.8,'dark');box(g,x,1.5,z-.35,1,.65,.09,'dark');box(g,x,1.5,z-.29,.85,.48,.02,'teal',false);box(g,x,1.12,z-.3,.12,.3,.12,'dark');box(g,x,.55,z+1,.8,.15,.75,'dark');box(g,x,1,z+1.32,.8,.85,.1,'dark');box(g,x,.22,z+1,.12,.65,.12,'dark');box(g,x,.09,z+1,.9,.1,.1,'dark');}function plant(g,x,z){box(g,x,.3,z,.6,.6,.6,'cream');for(let k=0;k<5;k++){const a=ball(g,x+Math.sin(k*2)*.25,.9+k*.17,z+Math.cos(k*2)*.2,.35,'leaf');a.scale.y=.6;}}
function batchStatic(group){group.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(group.matrixWorld).invert(),sets=new Map();group.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.uuid+':'+o.material.uuid;if(!sets.has(key))sets.set(key,[]);sets.get(key).push(o);});for(const meshes of sets.values()){if(meshes.length<2)continue;const inst=new T.InstancedMesh(meshes[0].geometry,meshes[0].material,meshes.length);inst.castShadow=meshes.some(a=>a.castShadow);inst.receiveShadow=true;for(let i=0;i<meshes.length;i++){inst.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,meshes[i].matrixWorld));meshes[i].parent.remove(meshes[i]);}inst.instanceMatrix.needsUpdate=true;group.add(inst);}}const chunks=[];for(let i=0;i<10;i++){const g=new T.Group();g.position.z=-i*12;box(g,0,-.2,0,14,.4,12,'floor');for(const x of [-3,0,3])box(g,x,.012,0,.025,.014,12,'cream',false);for(const x of [-6.8,6.8]){box(g,x,3.2,0,.15,6.4,.2,'dark');box(g,x,3.1,0,.04,5.8,11.8,'glass',false);box(g,x,5.8,0,.18,.18,12,'dark');}for(const x of [-5,5]){desk(g,x,-2);desk(g,x,-8);plant(g,x,3);}box(g,0,6,0,14,.18,.3,'cream');box(g,0,5.85,0,3,.04,.18,'amber',false);scene.add(g);chunks.push(g);}const city=new T.Group();scene.add(city);for(let i=0;i<50;i++){const h=10+Math.random()*35,x=(i%2?-1:1)*(15+Math.random()*35),z=30-Math.random()*150;box(city,x,h/2-45,z,5,h+70,6,'wall',false);for(let j=0;j<8;j++)box(city,x,h*j/8-9,z+3.01,3,.08,.04,'amber',false);}

// Authored surfaces, rounded silhouettes and environmental storytelling.
const capsule=new T.CapsuleGeometry(1,1,5,12),paperGeo=new T.PlaneGeometry(1,1);
function soft(g,x,y,z,w,h,d,mat){const mesh=new T.Mesh(capsule,m[mat]);mesh.position.set(x,y,z);mesh.scale.set(w/2,h/3,d/2);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;}
function makeSurface(kind){const c=document.createElement('canvas');c.width=c.height=512;const q=c.getContext('2d');q.fillStyle=kind==='floor'?'#4c443a':'#ddd4ba';q.fillRect(0,0,512,512);for(let i=0;i<500;i++){const v=kind==='floor'?80+Math.random()*28:190+Math.random()*30;q.fillStyle='rgba('+v+','+(v*.92)+','+(v*.81)+',.12)';q.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*150,1);}if(kind==='floor'){q.strokeStyle='#242b2c';q.lineWidth=2;for(let i=0;i<512;i+=64){q.beginPath();q.moveTo(i,0);q.lineTo(i,512);q.stroke();}}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='floor'?3:1,kind==='floor'?6:1);t.colorSpace=T.SRGBColorSpace;return t;}
m.floor.map=makeSurface('floor');m.floor.roughness=.37;m.floor.metalness=.22;m.wood.map=makeSurface('wood');
const environmentFaces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d');q.fillStyle=i===2?'#eac795':'#645649';q.fillRect(0,0,128,128);q.fillStyle='#ffdab0';for(let x=8;x<128;x+=29)q.fillRect(x,12,13,92);return c;});const environment=new T.CubeTexture(environmentFaces);environment.needsUpdate=true;environment.colorSpace=T.SRGBColorSpace;scene.environment=environment;scene.environmentIntensity=.35;
const beamMat=new T.MeshBasicMaterial({color:0xffc78f,transparent:true,opacity:.075,depthWrite:false,side:T.DoubleSide}),rugMat=new T.MeshStandardMaterial({color:0x25484d,roughness:1});
const departmentNames=['RECEPTION','RECORDS','ENGINEERING','SERVICE'];
for(let i=0;i<chunks.length;i++){const g=chunks[i];for(const side of [-1,1]){for(let y=2;y<5.5;y+=.27)box(g,side*6.7,y,-3,.08,.055,9,'wood',false);for(let k=0;k<5;k++){const beam=new T.Mesh(paperGeo,beamMat);beam.rotation.x=-Math.PI/2;beam.rotation.z=.53;beam.position.set(side*3.2,.026,-5+k*1.75);beam.scale.set(7,.25,1);g.add(beam);}box(g,side*5,5.6,-3,2,.12,2,'dark');box(g,side*5,5.51,-3,1.8,.035,1.8,'cream',false);if(i%3===1){box(g,side*4.3,2.2,-4,.035,4.4,5,'glass',false);box(g,side*5.2,1.1,-4,2,.14,3.6,'wood');for(let z=-5.3;z<-2;z+=1.2){soft(g,side*4.8,.65,z,.8,.75,.8,'suit');box(g,side*5.2,1.22,z,.55,.025,.7,'cream');}}else if(i%3===2){for(let z=-7;z<-2;z+=2){box(g,side*5.5,1.6,z,1,3.2,1.5,'dark');for(let y=.3;y<3;y+=.3){box(g,side*5.5,y,z+.76,.85,.05,.02,'wall');box(g,side*5.8,y,z+.78,.06,.06,.02,'teal',false);}}}else{soft(g,side*5,.4,1,2.4,.7,1.2,'suit');soft(g,side*5,.9,1.45,2.4,.8,.45,'suit');const board=box(g,side*5.3,2.6,-1,.04,1.7,2.1,new T.MeshStandardMaterial({color:0x316d73,roughness:.8}));board.rotation.y=side*Math.PI/2;}}if(i%3===0){box(g,0,4.8,-8,4.1,.5,.12,label(departmentNames[i%4]));box(g,0,5.35,-8,.05,.6,.05,'dark');}for(let p=0;p<10;p++){const sheet=new T.Mesh(paperGeo,m.cream);sheet.rotation.x=-Math.PI/2;sheet.rotation.z=Math.random()*Math.PI;sheet.position.set((Math.random()-.5)*10,.04,-Math.random()*11);sheet.scale.set(.25,.36,1);g.add(sheet);}const rug=new T.Mesh(paperGeo,rugMat);rug.rotation.x=-Math.PI/2;rug.position.set(i%2?-5:5,.03,-4);rug.scale.set(2.7,6,1);g.add(rug);}

for(const g of chunks)batchStatic(g);batchStatic(city);const player=new T.Group();scene.add(player);box(player,0,1.2,0,.7,.85,.4,'suit');box(player,0,1.62,-.02,.3,.12,.3,'cream');box(player,0,1.3,.23,.08,.5,.02,'amber');ball(player,0,1.95,0,.27,'skin');box(player,0,2.12,.03,.5,.18,.46,'dark');const legs=[box(player,-.2,.43,0,.23,.85,.25,'dark'),box(player,.2,.43,0,.23,.85,.25,'dark')],arms=[box(player,-.47,1.2,0,.2,.8,.22,'suit'),box(player,.47,1.2,0,.2,.8,.22,'suit')];box(player,.48,.8,.1,.42,.4,.18,'wood');

for(const child of [...player.children])player.remove(child);
soft(player,0,1.28,0,.77,.98,.48,'player');soft(player,0,1.24,-.24,.38,.77,.05,'cream');const lapel1=box(player,-.19,1.48,-.28,.19,.42,.03,'dark');lapel1.rotation.z=-.3;const lapel2=box(player,.19,1.48,-.28,.19,.42,.03,'dark');lapel2.rotation.z=.3;const tie=soft(player,0,1.27,-.31,.1,.5,.04,'red');ball(player,0,1.98,0,.3,'skin');ball(player,0,1.96,-.29,.065,'skin');for(const side of [-1,1]){ball(player,side*.29,1.98,0,.07,'skin');ball(player,side*.11,2.05,-.27,.035,'dark');}for(let k=0;k<7;k++){const h=ball(player,(k-3)*.072,2.19,.03,.13,'dark');h.scale.multiply(new T.Vector3(1,1,.8));}const brow=box(player,0,2.1,-.275,.37,.025,.025,'dark');box(player,0,1.88,-.275,.11,.02,.025,'dark');legs.length=0;arms.length=0;for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.2,.91,0);soft(leg,0,-.36,0,.25,.85,.28,'dark');const shoe=ball(leg,0,-.82,-.1,.2,'dark');shoe.scale.multiply(new T.Vector3(.7,.48,1.35));player.add(leg);legs.push(leg);const arm=new T.Group();arm.position.set(side*.48,1.65,0);soft(arm,0,-.35,0,.23,.75,.25,'player');ball(arm,0,-.76,0,.115,'skin');player.add(arm);arms.push(arm);}box(player,.61,.75,0,.13,.48,.58,'dark');box(player,.69,.78,-.03,.02,.08,.15,'amber');const handle=new T.Mesh(new T.TorusGeometry(.14,.035,6,16),m.dark);handle.position.set(.61,1.07,0);handle.rotation.y=Math.PI/2;player.add(handle);
const reflection=player.clone(true);reflection.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.075;o.material.depthWrite=false;o.castShadow=false;}});reflection.scale.y=-1;scene.add(reflection);

reflection.visible=false;const floorMirror=new Reflector(new T.PlaneGeometry(13.3,120),{color:0x605444,clipBias:.004,textureWidth:512,textureHeight:512});floorMirror.rotation.x=-Math.PI/2;floorMirror.position.set(0,.008,-48);floorMirror.material.fragmentShader=floorMirror.material.fragmentShader.replace('blendOverlay( base.rgb, color ), 1.0','blendOverlay( base.rgb, color ), 0.23');floorMirror.material.transparent=true;floorMirror.material.depthWrite=false;scene.add(floorMirror);
const door=new T.Group();box(door,0,2.4,-2,8,4.8,.3,'dark');box(door,-1.5,2,-1.8,2.8,4,.12,'wood');box(door,1.5,2,-1.8,2.8,4,.12,'wood');box(door,0,4.5,-1.75,3,.5,.05,label('EXIT / 17:00'));door.visible=false;scene.add(door);

// Continuous atrium architecture, warm pools of light and a cool dusk skyline.
const ceilingMat=new T.MeshStandardMaterial({color:0x33454b,roughness:.8});
const stripMat=new T.MeshBasicMaterial({color:0xffdba0});
for(const chunk of chunks){
 const trim=new T.Group();box(trim,0,6.25,-5,6.8,.045,12,'glass',false);
 for(const side of [-1,1]){
  box(trim,side*5.2,6,-5,3.5,.18,12,ceilingMat);
  box(trim,side*3.45,5.88,-5,.08,.07,11.6,stripMat,false);
  for(const z of [-10,-6,-2,2]){box(trim,side*6.75,3,z,.1,6,.12,'dark');box(trim,side*6.7,1.5,z-2,.08,.09,4,'wood');}
  box(trim,side*3.8,.1,-4,.12,.08,12,'teal',false);
 }
 for(const z of [-10,-4,2]){box(trim,0,6.2,z,6.8,.16,.3,ceilingMat);box(trim,0,6.05,z,2.5,.05,.12,stripMat,false);}
 batchStatic(trim);chunk.add(trim);
}
const sky=new T.Mesh(new T.SphereGeometry(140,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{lo:{value:new T.Color(.95,.49,.24)},hi:{value:new T.Color(.11,.23,.34)}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 lo;uniform vec3 hi;varying vec3 v;void main(){float h=normalize(v).y;vec3 c=mix(lo,hi,smoothstep(-.1,.6,h));gl_FragColor=vec4(c,1.);}'}));sky.renderOrder=-1;scene.add(sky);
const sunDisc=new T.Mesh(new T.SphereGeometry(7,24,16),new T.MeshBasicMaterial({color:0xffd09a,fog:false}));sunDisc.position.set(-62,15,-94);scene.add(sunDisc);
const checkpointMeshes=JOBS.map((job,i)=>{
 const group=new T.Group(),prop=new T.Group();prop.position.x=job.lane*3;group.add(prop);
 const marker=box(prop,0,.035,0,2.5,.04,3.5,'teal',false);
 const beacon=new T.Mesh(new T.TorusGeometry(.75,.035,6,40),m.teal);beacon.position.set(0,2.8,0);prop.add(beacon);
 let token,bar,gate=[];
 if(i===0){
  box(prop,0,.7,0,1.7,1.4,1,'wood');box(prop,0,1.43,0,1.85,.1,1.2,'cream');
  token=box(prop,0,1.85,.12,.55,.78,.06,'teal');box(token,0,.17,.55,.48,.18,.1,'cream',false);
  box(prop,.5,1.7,-.2,.4,.35,.08,'dark');
  for(const side of [-1,1]){box(group,side*6.1,2.7,-4,.25,5.4,.35,'dark');const panel=box(group,side*2.3,2.4,-4,4.5,4.8,.12,'glass');gate.push(panel);box(group,side*3.3,2.4,-3.9,.08,4.8,.1,'teal',false);}
  box(group,0,5.4,-4,12.5,.35,.5,'dark');box(group,0,5.4,-3.72,3,.45,.02,label('SECURITY'));
 }else if(i===1){
  box(prop,0,1.6,-.4,1.7,3.2,1.2,'dark');
  for(let y=.35;y<3;y+=.3){box(prop,0,y,.23,1.4,.08,.05,'wall');for(const x of [-.55,-.35])box(prop,x,y,.27,.07,.04,.02,'teal',false);}
  box(prop,0,2.1,.28,1.1,.6,.04,'dark');bar=box(prop,-.5,2.1,.32,1,.1,.02,'teal',false);bar.scale.x=.001;
  token=box(prop,.55,1.2,.45,.27,.12,.55,'amber');box(prop,0,3.55,-.3,2.5,.5,.08,label('BACKUP'));
 }else{
  box(prop,0,1.25,0,1.8,2.5,.7,'wall');box(prop,0,1.55,.4,1.5,1.5,.1,'dark');
  for(const x of [-.45,0,.45]){box(prop,x,1.5,.5,.2,.65,.12,'cream');box(prop,x,1.5,.58,.13,.4,.07,'red');}
  token=box(prop,.6,1.5,.7,.12,.85,.12,'amber');token.rotation.z=.6;
  box(prop,0,2.75,0,2.3,.45,.08,label('ELEVATOR POWER'));
 }
 scene.add(group);return {group,prop,token,bar,gate,marker,beacon};
});
const elevatorPanels=[door.children[1],door.children[2]];
const coffeeShield=new T.Mesh(new T.TorusGeometry(.75,.025,6,36),new T.MeshBasicMaterial({color:0x91edcf,transparent:true,opacity:.65}));coffeeShield.rotation.x=Math.PI/2;coffeeShield.position.y=.15;player.add(coffeeShield);
const caseTokens=[box(player,.7,.78,.16,.025,.2,.13,'teal',false),box(player,.7,.78,-.1,.025,.13,.18,'amber',false)];
let kick=0,tierShown=0;const heist=new Heist(),objects=[],particles=[],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state='menu',returnState='menu',time=0,score=0,lives=3,lane=0,x=0,y=0,vy=0,slide=0,invul=0,shield=false,spawn=0,row=0,files=0,combo=0,hitStop=0,quality=!reduced,sound=(()=>{try{return localStorage.getItem('after-hours-sound')!=='off'}catch{return true}})(),audio,noticeEnd=0,held=false,prev=performance.now(),hudClock=0,elapsed=0,ending=0;
const STORAGE='after-hours-heist-v2';
function beep(f=500,d=.15,end=f,type='triangle',vol=.08,delay=0){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.onended=()=>{o.disconnect();g.disconnect();};o.start(t);o.stop(t+d+.02);}catch{}}
function thud(len=.14,vol=.12,freq=500){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();const t=audio.currentTime,b=audio.createBuffer(1,Math.floor(audio.sampleRate*len),audio.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**2;const n=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();n.buffer=b;f.type='lowpass';f.frequency.value=freq;g.gain.value=vol;n.connect(f);f.connect(g);g.connect(audio.destination);n.start(t);}catch{}}
const sfx={start(){[523,659,784].forEach((f,i)=>beep(f,.14,f,'square',.04,i*.08));},jump(){beep(300,.16,620,'square',.035);},slide(){thud(.2,.08,1400);},file(){beep(988,.07,988,'square',.035);beep(1319,.12,1319,'square',.035,.06);},coffee(){[659,784,988].forEach((f,i)=>beep(f,.12,f,'triangle',.06,i*.06));},hit(){thud(.25,.22,380);beep(180,.3,60,'sawtooth',.06);},block(){beep(700,.1,500,'triangle',.06);thud(.1,.08,900);},dodge(){beep(1200,.05,1500,'sine',.025);},over(){[392,330,262,196].forEach((f,i)=>beep(f,.3,f*.97,'triangle',.07,i*.16));},speed(){beep(440,.12,880,'square',.035);}};
function notice(text,ms=1400){$('notice').textContent=text;noticeEnd=performance.now()+ms;}
function burst(px,py,pz,mat,n=12){if(!quality||reduced)return;for(let i=0;i<n;i++)particles.push({mesh:box(scene,px,py,pz,.07,.07,.07,mat,false),v:new T.Vector3((Math.random()-.5)*7,Math.random()*5,(Math.random()-.5)*7),life:.7});}
function panels(){
 for(const [id,visible] of Object.entries({menu:state==='menu',settings:state==='pause',result:state==='result',hud:state==='play'}))$(id).classList[visible?'remove':'add']('hidden');
 document.body.className=state==='play'?'playing':state==='pause'?'paused':'';$('meta-menu').hidden=state!=='menu';
 $('resume').classList[returnState==='play'?'remove':'add']('hidden');
}
function refreshBest(){try{const best=Number(localStorage.getItem(STORAGE)||0);$('best').textContent=best?`Best ${best.toLocaleString()}`:'';}catch{}}
function clearObjects(){for(const o of objects)scene.remove(o.g);objects.length=0;for(const p of particles)scene.remove(p.mesh);particles.length=0;}
function start(){if(graphicsLost)return;up={};jumps=streak=zone=0;nextPerk=400;theme=THEMES[0];perkHud();meta.startRun();clearObjects();heist.reset();time=score=files=combo=hitStop=row=lane=x=y=vy=slide=invul=ending=kick=tierShown=0;lives=3;shield=0;spawn=1.5;held=false;state='play';door.visible=false;chunks.forEach((g,i)=>g.position.z=-i*12);checkpointMeshes.forEach(c=>{c.token.visible=true;c.token.rotation.z=.6;});panels();updateHUD();$('scene').focus({preventScroll:true});prev=performance.now();sfx.start();notice(matchMedia('(pointer: coarse)').matches?'Swipe to dodge · tap to jump':'A/D lanes · Space jump · S slide',2600);}
function home(){if(graphicsLost)return;held=false;state='menu';clearObjects();heist.reset();x=y=lane=slide=0;door.visible=false;panels();refreshBest();$('start').focus();}
function finish(){state='result';meta.track('score',Math.floor(score),'max');const summary=meta.endRun(score);meta.renderResult($('meta-result'),summary);meta.renderMenu($('meta-menu'));held=false;panels();let best=0;try{best=Number(localStorage.getItem(STORAGE)||0);if(score>best)localStorage.setItem(STORAGE,String(Math.floor(score)));}catch{}$('result-title').innerHTML=score>best&&best?'NEW<br><span>BEST.</span>':'BACK TO<br><span>WORK.</span>';$('result-copy').textContent=`${Math.floor(score).toLocaleString()} points`;$('result-stats').textContent=`${Math.floor(heist.distance)} m · ${files} files${best&&score<=best?` · best ${best.toLocaleString()}`:''}`;sfx.over();refreshBest();$('replay').focus();}
function pause(){if(graphicsLost)return;if(state==='pause'){state=returnState;held=false;panels();prev=performance.now();if(state==='play')$('scene').focus({preventScroll:true});else $('pause').focus();}else if(state==='play'||state==='menu'||state==='result'){returnState=state;state='pause';held=false;panels();$('close-settings').focus();}}
function action(a){if(state!=='play')return;if(a==='left')lane=Math.max(-1,lane-1);if(a==='right')lane=Math.min(1,lane+1);if(a==='left'||a==='right')beep(520,.05,620,'sine',.02);if(a==='jump'&&(y===0||(up.double&&jumps<2))){if(y===0)jumps=0;jumps++;vy=jumps>1?8:8.8;slide=0;sfx.jump();if(jumps>1)burst(x,y+.4,0,'teal',10);}if(a==='slide'){if(y>0)vy=-14;slide=.85;sfx.slide();}}
function obstacle(type,l,z){
 const g=new T.Group();g.position.set(l*3,0,z);
 if(type==='file'){box(g,0,1.1,0,.65,.85,.045,'cream');box(g,0,1.42,.03,.6,.18,.02,'amber');for(let k=0;k<4;k++)box(g,0,1.2-k*.12,.03,.4,.02,.01,'dark');}
 else if(type==='coffee'){const cup=new T.Mesh(cylinder,m.teal);cup.scale.set(.25,.45,.25);cup.position.y=1.2;g.add(cup);const handle=new T.Mesh(new T.TorusGeometry(.17,.045,6,12),m.teal);handle.position.set(.27,1.2,0);g.add(handle);box(g,0,1.46,0,.56,.07,.56,'cream');}
 else if(type==='jump'){box(g,0,.52,0,1.8,1.04,1.15,'wood');for(const side of [-.7,.7])box(g,side,.52,.58,.08,.95,.03,'dark');box(g,0,.85,.6,1,.2,.02,archiveLabel);}
 else if(type==='slide'){for(const side of [-1.05,1.05])box(g,side,1.7,0,.13,3.4,.13,'dark');box(g,0,2.38,0,2.3,1.2,.4,'red');box(g,0,2.38,.23,2,.4,.02,label('DUCK'));box(g,0,1.84,.25,2.3,.06,.06,'amber',false);}
 else if(type==='cart'){box(g,0,.55,0,1.7,.2,1.1,'dark');box(g,0,1.25,0,1.5,1.3,.9,'wood');for(const side of [-.65,.65]){ball(g,side,.22,.35,.18,'dark');ball(g,side,.22,-.35,.18,'dark');}box(g,0,1.9,0,1.6,.1,1,'cream');}
 else{box(g,0,1,0,1.9,2,1.2,'cream');box(g,0,1.6,.62,1.5,.3,.02,'dark');box(g,0,2.05,0,2,.12,1.3,'dark');box(g,.6,.85,.63,.18,.12,.02,'teal');}
 scene.add(g);objects.push({g,type,l,passed:false});
}
// Endless rows: one lane is always open (or passable by jump/slide), and the
// mix gets denser the further you run.
function pattern(){
 if(row===0){for(let k=0;k<4;k++)obstacle('file',0,-24-k*2.2);row++;return;}
 const z=-75,level=Math.min(1,heist.distance/2500),safe=Math.floor(Math.random()*3)-1,hard=['block','cart'],soft=['jump','slide'];
 for(let l=-1;l<=1;l++){
  if(l===safe){if(Math.random()<.2+level*.35)obstacle(soft[Math.random()*2|0],l,z);continue;}
  const roll=Math.random();
  if(roll<.18-level*.12)continue;
  obstacle(roll<.55?soft[Math.random()*2|0]:hard[Math.random()*2|0],l,z);
 }
 const trail=Math.random()<.5?safe:Math.floor(Math.random()*3)-1;
 for(let k=0;k<3+(Math.random()*3|0);k++)obstacle('file',trail,z-6-k*2.2);
 if(Math.random()<(up.barista?.32:.14)&&!shield)obstacle('coffee',safe,z-16);row++;
}
// Every 400 m: a new floor (with its own light) and an upgrade card choice.
const THEMES=[{name:'Sunset floor',lo:0xf27d3d,hi:0x1c3a57,fog:0x6b7d84,sun:0xffc68a,hemi:0xffddb0},{name:'Dusk floor',lo:0xd0507a,hi:0x1d1840,fog:0x4a3f5e,sun:0xff9ab0,hemi:0xd9b8ff},{name:'Night shift',lo:0x274a8a,hi:0x050914,fog:0x182338,sun:0x8fb4ff,hemi:0x9fc4ff},{name:'Neon floor',lo:0xff2fa8,hi:0x140a2e,fog:0x2a1440,sun:0x5af0ff,hemi:0xff7ae0},{name:'Server farm',lo:0x2fe08a,hi:0x041611,fog:0x0f2a22,sun:0x7dffc4,hemi:0x9dffd8}];
let theme=THEMES[0];const tc=new T.Color();
function applyTheme(dt){const k=1-Math.exp(-dt*1.2);sky.material.uniforms.lo.value.lerp(tc.set(theme.lo),k);sky.material.uniforms.hi.value.lerp(tc.set(theme.hi),k);scene.background.lerp(tc.set(theme.fog),k);scene.fog.color.copy(scene.background);sun.color.lerp(tc.set(theme.sun),k);hemi.color.lerp(tc.set(theme.hemi),k);sunDisc.material.color.lerp(tc.set(theme.sun),k);}
function offerPerk(){zone++;theme=THEMES[zone%THEMES.length];const options=Meta.draw(PERKS,up,3);if(!options.length){notice(theme.name);return;}state='upgrade';held=false;sfx.speed();meta.pick(options,{title:`${zone*400} m · ${theme.name}`,subtitle:'Pick an upgrade · 1 2 3'}).then(u=>{if(state!=='upgrade')return;up[u.id]=(up[u.id]||0)+1;meta.track('perks');if(u.id==='heart')lives++;state='play';prev=performance.now();invul=Math.max(invul,1);panels();perkHud();notice(u.name);sfx.coffee();burst(x,1.5,0,'teal',24);});}
function perkHud(){$('perks').innerHTML=Object.entries(up).map(([id,n])=>{const p=PERKS.find(p=>p.id===id);return`<span title="${p.name}">${p.icon}${n>1?`<sub>${n}</sub>`:''}</span>`;}).join('');}
const streakMult=()=>streak>=30?3:streak>=15?2:streak>=6?1.5:1;
function dodged(){streak++;meta.track('streak',streak,'max');if([6,15,30].includes(streak)){notice(`Dodge streak ×${streakMult()}`);sfx.coffee();kick=.2;}if(document.body.dataset)document.body.dataset.streak=streak>=30?3:streak>=15?2:streak>=6?1:0;}
function updateHUD(){
 $('score').textContent=Math.floor(score).toLocaleString();$('lives').textContent='\u2665'.repeat(Math.max(0,lives))+(shield?' \u2615':'');$('distance').textContent=`${Math.floor(heist.distance)} m`;$('mult').textContent=streakMult()>1?`×${streakMult()}`:'';
 if(performance.now()>noticeEnd)$('notice').textContent='';
}
function resize(){if(graphicsLost)return;r.setPixelRatio(Math.min(devicePixelRatio,quality?1.5:1));r.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<650?72:54;camera.updateProjectionMatrix();}
$('start').onclick=start;$('replay').onclick=start;$('result-home').onclick=home;$('home').onclick=home;$('pause').onclick=pause;$('close-settings').onclick=pause;$('resume').onclick=pause;
const syncSound=()=>{$('sound').textContent=sound?'On':'Off';$('sound').setAttribute('aria-checked',String(sound));};syncSound();$('sound').onclick=()=>{sound=!sound;try{localStorage.setItem('after-hours-sound',sound?'on':'off')}catch{}syncSound();beep(620,.2,850);};
$('quality').onclick=()=>{quality=!quality;floorMirror.visible=quality;r.shadowMap.enabled=quality;$('quality').textContent=quality?'On':'Off';$('quality').setAttribute('aria-checked',String(quality));resize();};$('quality').setAttribute('aria-checked',String(quality));$('quality').textContent=quality?'On':'Off';floorMirror.visible=quality;
addEventListener('keydown',e=>{
 if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(!e.repeat)pause();return;}
 if(e.code==='Tab'&&state==='pause'){const pane=$('settings'),buttons=[...pane.querySelectorAll('button')].filter(b=>b.getClientRects().length);if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}return;}
 if(state!=='play')return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyE'].includes(e.code))e.preventDefault();if(e.code==='KeyE')held=true;if(e.repeat)return;
 action(({ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',ArrowDown:'slide',KeyS:'slide'})[e.code]);
});addEventListener('keyup',e=>{if(e.code==='KeyE')held=false;});for(const b of document.querySelectorAll('[data-action]'))b.onpointerdown=e=>{e.preventDefault();action(b.dataset.action);};
const canvas=$('scene');let touch;
canvas.onpointerdown=e=>{if(state!=='play')return;touch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);};canvas.onpointerup=e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>20)action(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'slide':'jump');else action('jump');touch=null;};canvas.onpointercancel=()=>touch=null;
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();graphicsLost=true;state='lost';held=false;r.setAnimationLoop(null);panels();document.body.insertAdjacentHTML('beforeend','<section class="fatal" role="alert"><h2>The graphics took a break.</h2><p>Reload to start a fresh escape.</p><button id="recover-graphics" class="primary">Reload game</button></section>');$('recover-graphics').onclick=()=>location.reload();$('recover-graphics').focus();});
addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')pause();});addEventListener('blur',()=>{held=false;if(state==='play')pause();});
resize();panels();refreshBest();meta.renderMenu($('meta-menu'));
r.setAnimationLoop(now=>{
 if(graphicsLost)return;const rawDt=Math.max(0,Math.min(.04,(now-prev)/1000));prev=now;const playing=state==='play';hitStop=Math.max(0,hitStop-rawDt);const dt=playing?rawDt*(hitStop>0?.2:1):0;
 elapsed+=state==='pause'?0:rawDt;const t=reduced?0:elapsed;
 let travelled=0,speed=Math.min(30,15+heist.distance*.006)*(1-.08*(up.calm||0));
 if(playing){
  time+=dt;travelled=heist.travel(dt,speed);score+=travelled*.8*mult()*streakMult();meta.track('distance',Math.floor(heist.distance),'max');if(heist.distance>=nextPerk){nextPerk+=400;offerPerk();}
  x=T.MathUtils.damp(x,lane*3,16,dt);vy-=22*dt;y=Math.max(0,y+vy*dt);if(y===0)vy=0;slide=Math.max(0,slide-dt);invul=Math.max(0,invul-dt);
  if(heist.interact(dt,held,x,y===0&&slide===0)){score+=750;held=false;beep(500,.3,1000);burst(x,1.7,-5,'teal',20);}
  const clearAhead=heist.job?heist.job.distance-heist.distance>105:FINISH_DISTANCE-heist.distance>100;
  if(!heist.stopped){spawn-=dt;if(spawn<=0&&clearAhead){pattern();spawn=Math.max(1,2-heist.distance*.0004)*(16/speed)+.55;}}
  for(const g of chunks){g.position.z+=travelled;if(g.position.z>14)g.position.z-=120;}
  for(let i=objects.length-1;i>=0;i--){
   const o=objects[i],before=o.g.position.z;o.g.position.z+=travelled;
   if(o.type==='file'||o.type==='coffee'){o.g.rotation.y+=dt*1.5;o.g.position.y=Math.sin(t*4)*.08;}
   if(o.type==='cart')o.g.rotation.y=Math.sin(t*3)*.06;
   if(!o.passed&&before<.8&&o.g.position.z>=-.8&&Math.abs(x-o.l*3)<(o.type==='file'&&up.magnet?4:1.05)){
    o.passed=true;
    if(o.type==='file'){files++;meta.track('files');score+=100*mult();o.g.visible=false;burst(x,1,0,'cream',6);sfx.file();}
    else if(o.type==='coffee'){shield=up.thermos?2:1;meta.track('coffee');score+=50*mult();o.g.visible=false;burst(x,1.2,0,'teal',14);sfx.coffee();notice('Coffee shield!');}
    else if((o.type==='jump'&&y>1.1)||(o.type==='slide'&&slide>0)){combo++;dodged();score+=75*mult()*streakMult();sfx.dodge();}
    else if(up.bulldozer&&(o.type==='cart'||o.type==='block')){o.g.visible=false;burst(x,1,-.5,'wood',22);burst(x,1.4,-.5,'cream',12);kick=.35;score+=60*mult();sfx.block();notice('Smash!');}
    else if(invul<=0){streak=0;if(shield){shield--;sfx.block();notice(shield?'Shield cracked':'Shield broke');}else{lives--;sfx.hit();kick=.5;document.body.classList.remove('hurt');void document.body.offsetWidth;document.body.classList.add('hurt');}invul=1.4;hitStop=.12;combo=0;burst(x,1,0,'amber',18);if(lives<=0){finish();break;}}
   }
   if(!o.passed&&o.g.position.z>1.1){o.passed=true;if(o.type!=='file'&&o.type!=='coffee'){combo++;dodged();}score+=25*mult();}
   if(o.g.position.z>12){scene.remove(o.g);objects.splice(i,1);}
  }
  
  hudClock+=dt;if(hudClock>.06){updateHUD();hudClock=0;}
 }
 checkpointMeshes.forEach((c,i)=>{
  const z=heist.distance-JOBS[i].distance;c.group.position.z=z;c.group.visible=state!=='menu'&&z>-115&&z<15;
  const complete=i<heist.completed;c.token.visible=!complete;
  c.beacon.rotation.z=reduced?0:t*.65;c.beacon.scale.setScalar(1+(reduced?0:Math.sin(t*3)*.04));
  c.gate.forEach((panel,k)=>panel.position.x=T.MathUtils.damp(panel.position.x,(k===0?-1:1)*(complete?5.5:2.3),5,rawDt));
  if(c.bar)c.bar.scale.x=Math.max(.001,complete?1:heist.completed===i?heist.progress:0);
 });
 const remaining=FINISH_DISTANCE-heist.distance;door.visible=heist.completed===3&&remaining<95;door.position.z=-remaining;
 elevatorPanels.forEach((panel,i)=>panel.position.x=(i===0?-1:1)*(remaining<28?2.9:1.5));
 player.position.set(x,y,heist.finished?-ending*4:0);player.scale.y=slide>0?.48:1;const idle=state==='menu'||state==='result';player.rotation.y=idle?Math.PI:0;player.rotation.z=playing?(lane*3-x)*-.07:0;
 coffeeShield.visible=shield;caseTokens.forEach((token,i)=>token.visible=heist.completed>i);
 player.visible=!(invul>0&&Math.floor(time*12)%2===0);
 for(let i=0;i<2;i++){const moving=playing&&travelled>0&&y===0;legs[i].rotation.x=moving?Math.sin(time*14+i*Math.PI)*.65:0;arms[i].rotation.x=moving?Math.sin(time*14+i*Math.PI)*-.55:0;}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=dt*8;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.x+=dt*4;if(p.life<=0){scene.remove(p.mesh);particles.splice(i,1);}}
 applyTheme(rawDt);const portrait=camera.aspect<1;kick=Math.max(0,kick-rawDt*2.5);const sh=reduced?0:kick*kick*.35;camera.position.lerp(new T.Vector3(idle?7+(reduced?0:Math.sin(t*.12)):x*.18,idle?4.1:4.5,idle?11:portrait?13:9.5),1-Math.exp(-rawDt*4));camera.lookAt((idle?-1:x*.25)+(Math.random()-.5)*sh,(idle?1.2:1.5)+(Math.random()-.5)*sh,idle?-5:-13);if(playing){const f=54+Math.min(10,(speed-15)*.6);camera.fov+=((innerWidth<650?72:f)-camera.fov)*.05;camera.updateProjectionMatrix();}
 r.render(scene,camera);
});
window.__afterHours={meta,offerPerk,get up(){return up},get state(){return state},get stats(){return{time,score,lives,objects:objects.length,lane,files,combo,distance:heist.distance,completed:heist.completed,stopped:heist.stopped}},start,action,pause};
