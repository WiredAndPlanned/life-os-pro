// Phase 6 verification: Today + Search + Settings logic end-to-end.
// Inlines the real reflection registry + the actual projectors from every
// module's .data.ts (transcribed), seeds many collections, and asserts Today's
// gathered/sorted output, Search breadth, and appearance resolution.

type Due={id:string;owner:string;title:string;dueAt:number;destination:string};
type Rec={id:string;owner:string;title:string;subtitle?:string;destination:string};
type State=Record<string,any[]>;
const dueP=new Set<(s:State)=>Due[]>(), searchP=new Set<(s:State)=>Rec[]>();
function gatherDue(s:State,w=7*864e5){const h=Date.now()+w;const o:Due[]=[];for(const p of dueP)for(const it of p(s))if(it.dueAt<=h)o.push(it);return o.sort((a,b)=>a.dueAt-b.dueAt);}
function searchAll(s:State,q:string){const t=q.trim().toLowerCase();if(!t)return[];const o:Rec[]=[];for(const p of searchP)for(const r of p(s))if((`${r.title} ${r.subtitle??''}`).toLowerCase().includes(t))o.push(r);return o;}

// --- register the real projectors (due + search) as defined in the modules ---
// subscriptions (due+search), study (due unfinished + search), career (due dated non-closed + search),
// goals (due dated incomplete + search), monthly (due future + search), and search-only for the rest.
searchP.add(s=>s.subscriptions.map((x:any)=>({id:x.id,owner:"subscriptions",title:x.name,destination:"life"})));
dueP.add(s=>s.subscriptions.map((x:any)=>({id:x.id,owner:"subscriptions",title:x.name,dueAt:x.next,destination:"life"})));
searchP.add(s=>s.study.map((a:any)=>({id:a.id,owner:"study",title:a.task,subtitle:a.subject,destination:"plan"})));
dueP.add(s=>s.study.filter((a:any)=>a.status!=="done").map((a:any)=>({id:a.id,owner:"study",title:a.subject+": "+a.task,dueAt:a.due,destination:"plan"})));
searchP.add(s=>s.career.map((a:any)=>({id:a.id,owner:"career",title:a.role+" · "+a.company,destination:"life"})));
dueP.add(s=>s.career.filter((a:any)=>a.date&&a.stage!=="closed").map((a:any)=>({id:a.id,owner:"career",title:a.role,dueAt:a.date,destination:"life"})));
searchP.add(s=>s.goals.map((g:any)=>({id:g.id,owner:"goals",title:g.title,destination:"plan"})));
dueP.add(s=>s.goals.filter((g:any)=>g.due!==undefined&&g.progress<1).map((g:any)=>({id:g.id,owner:"goals",title:g.title,dueAt:g.due,destination:"plan"})));
searchP.add(s=>s.monthly.map((m:any)=>({id:m.id,owner:"monthly",title:m.note,destination:"plan"})));
dueP.add(s=>s.monthly.filter((m:any)=>m.date>=Date.now()-864e5).map((m:any)=>({id:m.id,owner:"monthly",title:m.note,dueAt:m.date,destination:"plan"})));
searchP.add(s=>s.brainDump.map((t:any)=>({id:t.id,owner:"brainDump",title:t.text,destination:"plan"})));
searchP.add(s=>s.spending.map((e:any)=>({id:e.id,owner:"spending",title:e.item,destination:"life"})));
searchP.add(s=>s.habits.map((h:any)=>({id:h.id,owner:"habits",title:h.name,destination:"life"})));
searchP.add(s=>s.grocery.filter((g:any)=>!g.got).map((g:any)=>({id:g.id,owner:"grocery",title:g.item,destination:"life"})));

const now=Date.now(),d=(n:number)=>now+n*864e5;
const S:State={
  subscriptions:[{id:"s1",name:"Spotify",next:d(3)},{id:"s2",name:"Gym",next:d(40)}],
  study:[{id:"a1",task:"Essay",subject:"History",due:d(1),status:"todo"},{id:"a2",task:"Old",subject:"Math",due:d(2),status:"done"}],
  career:[{id:"c1",role:"Designer",company:"Acme",date:d(6),stage:"interview"},{id:"c2",role:"Gone",company:"X",date:d(1),stage:"closed"}],
  goals:[{id:"g1",title:"Read 12 books",progress:0.5,due:d(4)},{id:"g2",title:"Done goal",progress:1,due:d(2)},{id:"g3",title:"No date goal",progress:0}],
  monthly:[{id:"m1",note:"Dentist",date:d(5)},{id:"m2",note:"Past thing",date:d(-10)}],
  brainDump:[{id:"t1",text:"Call the bank"}],
  spending:[{id:"e1",item:"Coffee"}],
  habits:[{id:"h1",name:"Meditate"}],
  grocery:[{id:"gr1",item:"Milk",got:false},{id:"gr2",item:"Bought",got:true}],
};

// appearance resolve logic (from appearance.ts)
function resolveTheme(pref:string,systemDark:boolean){return pref==="system"?(systemDark?"dark":"light"):pref;}

let pass=0,fail=0;const ok=(n:string,c:boolean)=>{c?(pass++,console.log("  PASS "+n)):(fail++,console.log("  FAIL "+n));};

const due=gatherDue(S);
ok("Today gathers upcoming, sorted by date",
  due.map(x=>x.title).join(" | ")==="History: Essay | Spotify | Read 12 books | Dentist | Designer");
ok("Today excludes far subscription (>7d)", !due.find(x=>x.title==="Gym"));
ok("Today excludes done study", !due.find(x=>x.title.includes("Old")));
ok("Today excludes completed goal", !due.find(x=>x.title==="Done goal"));
ok("Today excludes undated goal", !due.find(x=>x.title==="No date goal"));
ok("Today excludes closed career", !due.find(x=>x.title==="Gone"));
ok("Today excludes past monthly note", !due.find(x=>x.title==="Past thing"));

ok("Search finds brain-dump thought", searchAll(S,"bank").length===1);
ok("Search finds across modules (spotify)", searchAll(S,"spotify")[0].owner==="subscriptions");
ok("Search finds habit", searchAll(S,"meditate").length===1);
ok("Search finds study by subject", searchAll(S,"history").length===1);
ok("Search omits bought grocery", searchAll(S,"bought").length===0);
ok("Search empty query → none", searchAll(S,"").length===0);

ok("appearance system→dark when OS dark", resolveTheme("system",true)==="dark");
ok("appearance system→light when OS light", resolveTheme("system",false)==="light");
ok("appearance explicit dark wins", resolveTheme("dark",false)==="dark");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail===0?0:1);
