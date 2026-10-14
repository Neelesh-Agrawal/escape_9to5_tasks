export const FINISH_DISTANCE=1200;
export const JOBS=[
 {distance:240,lane:-1,hold:.45,title:'Take the access card',area:'Reception',action:'Take access card'},
 {distance:610,lane:1,hold:1.6,title:'Copy the backup drive',area:'Server room',action:'Copy backup drive'},
 {distance:1010,lane:0,hold:.8,title:'Restore elevator power',area:'Service corridor',action:'Restore power'}
];
export class Heist {
 constructor(){this.reset();}
 reset(){this.distance=0;this.completed=0;this.progress=0;}
 get job(){return JOBS[this.completed];}
 get stopped(){return !!this.job&&this.distance>=this.job.distance-5-.001;}
 get finished(){return this.completed===JOBS.length&&this.distance>=FINISH_DISTANCE;}
 travel(dt,speed){const before=this.distance,limit=this.job?this.job.distance-5:FINISH_DISTANCE;
  const easing=this.job?Math.max(.24,Math.min(1,(limit-this.distance)/20)):1;
  this.distance=Math.min(limit,this.distance+Math.max(0,dt)*speed*easing);return this.distance-before;
 }
 interact(dt,held,x,grounded){
  if(!this.stopped||!held||Math.abs(x-this.job.lane*3)>.65||!grounded){this.progress=0;return false;}
  this.progress+=Math.max(0,dt)/this.job.hold;
  if(this.progress<1)return false;
  this.completed++;this.progress=0;return true;
 }
}
