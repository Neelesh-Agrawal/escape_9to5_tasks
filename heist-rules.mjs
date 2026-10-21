export const FLOORS=[
 {name:'Executive floor',label:'Floor 4',length:900,speed:17},
 {name:'Engineering',label:'Floor 3',length:950,speed:20},
 {name:'Records',label:'Floor 2',length:1000,speed:23},
 {name:'Reception',label:'Floor 1',length:1050,speed:26},
 {name:'Ground floor',label:'Ground',length:1100,speed:29}
];
export const FINISH_DISTANCE=FLOORS.reduce((sum,f)=>sum+f.length,0);
// Kept as an empty export for the old station geometry; progression now belongs to floors.
export const JOBS=[];
export class Heist {
 constructor(){this.reset();}
 reset(){this.distance=0;this.completed=0;this.progress=0;this.phase='run';}
 get floor(){return FLOORS[Math.min(this.completed,FLOORS.length-1)];}
 get floorStart(){return FLOORS.slice(0,this.completed).reduce((sum,f)=>sum+f.length,0);}
 get floorEnd(){return this.floorStart+this.floor.length;}
 get remaining(){return Math.max(0,this.floorEnd-this.distance);}
 get lastFloor(){return this.completed===FLOORS.length-1;}
 get job(){return null;}
 get stopped(){return this.phase==='run'&&this.remaining<=5.001;}
 get finished(){return this.phase==='escaped';}
 travel(dt,speed){if(this.phase!=='run')return 0;const before=this.distance,limit=this.floorEnd-5;const easing=Math.max(.24,Math.min(1,(limit-this.distance)/20));this.distance=Math.min(limit,this.distance+Math.max(0,dt)*Math.max(0,speed)*easing);return this.distance-before;}
 enter(x,grounded){if(!this.stopped||Math.abs(x)>.65||!grounded)return false;this.phase='boarding';return true;}
 completeFloor(){if(this.phase!=='boarding')return false;this.distance=this.floorEnd;this.phase=this.lastFloor?'escaped':'upgrade';return true;}
 descend(){if(this.phase!=='upgrade')return false;this.completed++;this.phase='run';return true;}
 interact(){return false;}
}
