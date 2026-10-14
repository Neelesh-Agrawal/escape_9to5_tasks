import fs from 'node:fs';
import {Heist,JOBS,FINISH_DISTANCE} from './heist-rules.mjs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as THREE from './vendor/three.module.js';
import { Reflector } from './vendor/Reflector.js';
function boot(file,api){let loop;const elements=new Map(),events=new Map();const elem=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){}},focus(){},querySelectorAll:()=>[],getClientRects:()=>[{}],setAttribute(){},addEventListener(k,fn){events.set(id+':'+k,fn)},setPointerCapture(){},getContext:()=>({fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}})});return elements.get(id)};class Renderer{constructor(){this.shadowMap={};}setSize(){}setPixelRatio(){}setAnimationLoop(fn){loop=fn;}render(){}}const context=vm.createContext({Heist,JOBS,FINISH_DISTANCE,T:{...THREE,WebGLRenderer:Renderer},Reflector,document:{getElementById:elem,createElement:()=>elem('texture'+Math.random()),querySelectorAll:()=>[],body:{className:'',classList:{add(){},remove(){}},insertAdjacentHTML(){}},addEventListener(){}},window:{},performance:{now:()=>0},innerWidth:1440,innerHeight:900,devicePixelRatio:1,matchMedia:()=>({matches:false}),addEventListener:(k,fn)=>events.set(k,fn),localStorage:{getItem:()=>null,setItem(){}},navigator:{clipboard:{writeText:async()=>{}}},console,Math});vm.runInContext(fs.readFileSync(file,'utf8').replace(/^import .*$/gm,''),context);let now=0;return{context,api:context.window[api],events,advance(seconds){for(let i=0;i<Math.ceil(seconds/.016);i++)loop?.(now+=16);},eval(code){return vm.runInContext(code,context)}};}

// Real renderer-independent controller with Three.js scene geometry.
const game=boot(new URL('./after-hours.js',import.meta.url),'__afterHours');
game.api.start();for(let i=0;i<10;i++)game.api.action('right');assert.equal(game.api.stats.lane,1);
game.api.action('jump');game.advance(.2);assert(game.eval('y')>0);game.advance(1);assert.equal(game.eval('y'),0);
game.api.pause();const frozen=game.api.stats.time;game.advance(2);assert.equal(game.api.stats.time,frozen);game.api.pause();
game.eval('invul=10000');game.advance(90);assert.equal(game.api.state,'play');assert(game.api.stats.stopped);assert.equal(game.api.stats.completed,0);assert(game.api.stats.distance<240,'Cannot run through a locked objective');
game.eval('held=true;lane=1');game.advance(2);assert.equal(game.api.stats.completed,0,'Wrong lane cannot activate station');
for(let i=0;i<3;i++){
 game.eval(`lane=JOBS[heist.completed].lane;held=true`);game.advance(3);assert.equal(game.api.stats.completed,i+1);
 if(i<2){game.advance(60);assert(game.api.stats.stopped);assert.equal(game.api.stats.completed,i+1);}
}
game.advance(30);assert.equal(game.api.state,'result');assert.equal(game.api.stats.distance,FINISH_DISTANCE);assert.equal(game.api.stats.completed,3);
game.api.start();assert.equal(game.api.stats.distance,0);assert.equal(game.api.stats.completed,0);assert.equal(game.api.stats.objects,0);assert.equal(game.api.stats.lives,3);
game.eval("obstacle('file',0,-.4)");game.advance(.016);assert.equal(game.api.stats.files,1);
game.eval("obstacle('coffee',0,-.4)");game.advance(.016);assert(game.eval('shield'));
game.eval("obstacle('block',0,-.4)");game.advance(.016);assert.equal(game.api.stats.lives,3);assert.equal(game.eval('shield'),false,'Coffee absorbs one collision');
game.eval("invul=0;obstacle('block',0,-.4)");game.advance(.016);assert.equal(game.api.stats.lives,2);
for(let row=1;row<=6;row++){
 game.eval(`clearObjects();row=${row};pattern()`);
 assert(game.eval("new Set(objects.filter(o=>!['file','coffee'].includes(o.type)).map(o=>o.l)).size<=2"),'Every row leaves a safe lane');
 assert(game.eval("!objects.filter(o=>!['file','coffee'].includes(o.type)).some(o=>o.l===objects.find(o=>o.type==='file').l)"),'Pickup route stays clear');
}
for(const [w,h] of [[390,844],[1440,900]]){
 game.context.innerWidth=w;game.context.innerHeight=h;game.events.get('resize')();game.api.start();game.eval('invul=10000');game.advance(3);
 for(const side of [-1,1]){game.eval(`lane=${side}`);game.advance(1);const p=game.eval('camera.updateMatrixWorld();new T.Vector3(x,y+1,0).project(camera)');assert(Math.abs(p.x)<.9&&Math.abs(p.y)<.9,'Runner visible in both outer lanes');}
}
game.api.start();game.advance(2);const before=JSON.stringify(game.api.stats);let prevented=false;game.events.get('scene:webglcontextlost')({preventDefault(){prevented=true}});game.advance(3);game.api.start();game.api.pause();assert(prevented);assert.equal(game.api.state,'lost');assert.equal(JSON.stringify(game.api.stats),before);
const run=new Heist();run.travel(1000,100);assert(run.stopped);assert.equal(run.interact(10,true,-3,false),false,'Jumping cannot activate stations');run.interact(.2,true,-3,true);run.interact(.1,false,-3,true);assert.equal(run.progress,0,'Released hold resets copying');
console.log('After Hours: three gated physical objectives, full extraction, no timeout, hold/alignment rules, pause, replay, fair routes, pickups, coffee damage, portrait framing and context-loss recovery pass.');
