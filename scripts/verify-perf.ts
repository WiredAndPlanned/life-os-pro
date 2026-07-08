// Performance sanity (§25): Today's gatherDue and Search's searchAll must stay
// fast as data grows. Seed a deliberately large store and time the operations.
type Due={id:string;owner:string;title:string;dueAt:number};
type Rec={id:string;owner:string;title:string;subtitle?:string};
const dueP=new Set<(s:any)=>Due[]>(), searchP=new Set<(s:any)=>Rec[]>();
function gatherDue(s:any,w=7*864e5){const h=Date.now()+w;const o:Due[]=[];for(const p of dueP)for(const it of p(s))if(it.dueAt<=h)o.push(it);return o.sort((a,b)=>a.dueAt-b.dueAt);}
function searchAll(s:any,q:string){const t=q.trim().toLowerCase();if(!t)return[];const o:Rec[]=[];for(const p of searchP)for(const r of p(s))if((`${r.title} ${r.subtitle??''}`).toLowerCase().includes(t))o.push(r);return o;}

// register projectors for several collections
["study","career","subscriptions","goals","monthly"].forEach(k=>{
  dueP.add((s:any)=>s[k].map((x:any)=>({id:x.id,owner:k,title:x.title,dueAt:x.due})));
});
["study","career","subscriptions","goals","monthly","spending","brainDump","grocery","content","habits"].forEach(k=>{
  searchP.add((s:any)=>s[k].map((x:any)=>({id:x.id,owner:k,title:x.title,subtitle:x.sub})));
});

// Seed a LARGE store: 1000 items in each of 10 collections = 10,000 entities.
const now=Date.now();
const big:any={};
["study","career","subscriptions","goals","monthly","spending","brainDump","grocery","content","habits"].forEach(k=>{
  big[k]=Array.from({length:1000},(_,i)=>({id:`${k}${i}`,title:`${k} item ${i}`,sub:`note ${i}`,due:now+(i%400)*864e5}));
});

const N=50;
let t0=performance.now();
for(let i=0;i<N;i++) gatherDue(big);
let dueMs=(performance.now()-t0)/N;

t0=performance.now();
for(let i=0;i<N;i++) searchAll(big,"item 42");
let searchMs=(performance.now()-t0)/N;

console.log(`Store size: 10,000 entities across 10 collections`);
console.log(`gatherDue avg: ${dueMs.toFixed(2)} ms/call`);
console.log(`searchAll avg: ${searchMs.toFixed(2)} ms/call`);
const ok = dueMs < 16 && searchMs < 16; // one 60fps frame budget
console.log(ok ? "\nPASS — both well within a 16ms frame budget at 10k entities" : "\nSLOW — exceeds frame budget");
process.exit(ok?0:1);
