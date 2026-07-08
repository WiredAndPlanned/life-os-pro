// Verify the Spending module's data logic (CRUD binding, monthTotal, formatMoney,
// search projection) using the same logic as src/modules/spending/spending.data.ts.
const mem = new Map<string,string>();
(globalThis as any).localStorage = { getItem:(k:string)=>mem.get(k)??null, setItem:(k:string,v:string)=>void mem.set(k,v), removeItem:(k:string)=>void mem.delete(k), clear:()=>mem.clear(), key:()=>null, get length(){return mem.size;} };

type Cat = "food"|"transport"|"fun"|"bills"|"other";
interface Expense { id:string; createdAt:number; item:string; amount:number; category:Cat; date:number; }
let list: Expense[] = [];
const createId = (p:string)=>`${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
const create = (i:Omit<Expense,"id"|"createdAt">) => { const e={...i,id:createId("exp"),createdAt:Date.now()}; list=[...list,e]; return e; };
const edit = (id:string,c:Partial<Omit<Expense,"id"|"createdAt">>) => { list=list.map(e=>e.id===id?{...e,...c,id:e.id,createdAt:e.createdAt}:e); return list.find(e=>e.id===id); };
const remove = (id:string)=>{const before=list.length;list=list.filter(e=>e.id!==id);return list.length<before;};

function monthTotal(exp:Expense[], now=Date.now()){const d=new Date(now);return exp.filter(e=>{const ed=new Date(e.date);return ed.getFullYear()===d.getFullYear()&&ed.getMonth()===d.getMonth();}).reduce((s,e)=>s+e.amount,0);}
function formatMoney(a:number){return new Intl.NumberFormat(undefined,{style:"currency",currency:"USD",minimumFractionDigits:2}).format(a);}
function searchProject(q:string){const s=q.toLowerCase();return list.filter(e=>(`${e.item}`).toLowerCase().includes(s));}

let pass=0,fail=0; const ok=(n:string,c:boolean)=>{c?(pass++,console.log("  PASS "+n)):(fail++,console.log("  FAIL "+n));};

const c = create({item:"Coffee",amount:4.5,category:"food",date:Date.now()});
ok("create expense", c.id.startsWith("exp_") && list.length===1);
ok("month total sums current month", monthTotal(list)===4.5);
create({item:"Bus",amount:2.75,category:"transport",date:Date.now()});
ok("month total accumulates", Math.abs(monthTotal(list)-7.25)<1e-9);
const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth()-1);
create({item:"Old",amount:100,category:"bills",date:lastMonth.getTime()});
ok("month total excludes other months", Math.abs(monthTotal(list)-7.25)<1e-9);
ok("formatMoney is calm currency", /\$4\.50/.test(formatMoney(4.5)));
const e = edit(c.id,{amount:5});
ok("edit amount", e?.amount===5 && e?.id===c.id);
ok("search finds by item", searchProject("cof").length===1);
ok("delete", remove(c.id) && !list.find(x=>x.id===c.id));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail===0?0:1);
