// Integration verification: reflection aggregation across multiple modules.
// Inlines the REAL reflection.ts logic + representative projectors (subscriptions
// due, study due, spending search, career due) to prove Today/Search aggregate
// across the module set — the core Phase 5 contract (§13,§14,§16).

type Due = { id:string; owner:string; title:string; dueAt:number; destination:string };
type Rec = { id:string; owner:string; title:string; subtitle?:string; destination:string };
type State = Record<string, any[]>;

const dueProjectors = new Set<(s:State)=>Due[]>();
const searchProjectors = new Set<(s:State)=>Rec[]>();
function gatherDue(s:State, withinMs=7*864e5){const h=Date.now()+withinMs;const out:Due[]=[];for(const p of dueProjectors)for(const it of p(s))if(it.dueAt<=h)out.push(it);return out.sort((a,b)=>a.dueAt-b.dueAt);}
function searchAll(s:State,q:string){const t=q.trim().toLowerCase();if(!t)return[];const out:Rec[]=[];for(const p of searchProjectors)for(const r of p(s)){if((`${r.title} ${r.subtitle??''}`).toLowerCase().includes(t))out.push(r);}return out;}

// register representative projectors (mirrors the real .data.ts files)
searchProjectors.add((s)=>s.spending.map((e:any)=>({id:e.id,owner:"spending",title:e.item,subtitle:e.category,destination:"life"})));
searchProjectors.add((s)=>s.subscriptions.map((x:any)=>({id:x.id,owner:"subscriptions",title:x.name,destination:"life"})));
dueProjectors.add((s)=>s.subscriptions.map((x:any)=>({id:x.id,owner:"subscriptions",title:x.name,dueAt:x.next,destination:"life"})));
dueProjectors.add((s)=>s.study.filter((a:any)=>a.status!=="done").map((a:any)=>({id:a.id,owner:"study",title:a.task,dueAt:a.due,destination:"plan"})));
searchProjectors.add((s)=>s.study.map((a:any)=>({id:a.id,owner:"study",title:a.task,subtitle:a.subject,destination:"plan"})));
dueProjectors.add((s)=>s.career.filter((a:any)=>a.date&&a.stage!=="closed").map((a:any)=>({id:a.id,owner:"career",title:a.role,dueAt:a.date,destination:"life"})));

const now=Date.now(); const d=(n:number)=>now+n*864e5;
const state:State = {
  spending:[{id:"e1",item:"Coffee",category:"food"}],
  subscriptions:[{id:"s1",name:"Spotify",next:d(3)},{id:"s2",name:"Gym",next:d(40)}],
  study:[{id:"a1",task:"Essay",subject:"History",due:d(1),status:"todo"},{id:"a2",task:"Done thing",subject:"Math",due:d(2),status:"done"}],
  career:[{id:"c1",role:"Designer",company:"Acme",date:d(5),stage:"interview"},{id:"c2",role:"Old",company:"X",date:d(2),stage:"closed"}],
};

let pass=0,fail=0; const ok=(n:string,c:boolean)=>{c?(pass++,console.log("  PASS "+n)):(fail++,console.log("  FAIL "+n));};

const due = gatherDue(state);
ok("Today gathers across modules, sorted by date", due.map(x=>x.title).join(",")==="Essay,Spotify,Designer");
ok("Today excludes far-future subscription (>7d)", !due.find(x=>x.title==="Gym"));
ok("Today excludes DONE study", !due.find(x=>x.title==="Done thing"));
ok("Today excludes CLOSED career", !due.find(x=>x.title==="Old"));
ok("search across modules finds spending", searchAll(state,"coffee").length===1);
ok("search finds subscription", searchAll(state,"spotify")[0].owner==="subscriptions");
ok("search finds study by subject", searchAll(state,"history").length===1);
ok("empty query returns none", searchAll(state,"").length===0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail===0?0:1);
