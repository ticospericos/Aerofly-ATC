const MODEL="gemini-3.8-flash";
const ALLOWED_ORIGIN="https://ticospericos.github.io";
const AIRPORTS=[
["Monterey Regional","KMRY",["28L","28R","01L","01R"]],["Salinas Municipal","KSNS",["31","26","08","13"]],["Hollister Municipal","KCVH",["31","24","13","06"]],["Watsonville Municipal","KWVI",["20","06","02","27"]],["San Martin Airport","KE16",["14","32"]],["Reid-Hillview","KRHV",["13L","13R","31L","31R"]],["San José Mineta International","KSJC",["30L","30R","12L","12R"]],["Modesto City-County","KMOD",["28L","28R","10L","10R"]],["Moffett Federal Airfield","KNUQ",["32L","32R","14L","14R"]],["Palo Alto","KPAO",["13","31"]],["Tracy Municipal","KTCY",["30","26","12","08"]],["Stockton Metropolitan","KSCK",["29L","29R","11L","11R"]],["Livermore Municipal","KLVK",["25L","25R","07L","07R"]],["San Carlos","KSQL",["12","30"]],["Half Moon Bay","KHAF",["12","30"]],["San Francisco International","KSFO",["01L","01R","28L","28R","10L","10R","19L","19R"]],["Hayward Executive","KHWD",["28L","28R","10L","10R"]],["Oakland International","KOAK",["30","12","28L","28R","10L","10R","33","15"]],["Byron Airport","KC83",["30","23","12","05"]],["Buchanan Field","KCCR",["01L","01R","32L","32R","19L","19R","14L","14R"]],["Lodi Airport","K1O3",["30","26","12","08"]],["Rio Vista Municipal","KO88",["33","25","07","15"]],["Gnoss Field (Novato)","KDVO",["13","31"]],["Petaluma Municipal","KO69",["11","29"]],["Napa County","KAPC",["06","01L","01R","24","19L","19R"]],["Charles M. Schulz Sonoma County","KSTS",["02","32","20","14"]],["Angwin-Parrett Field","K203",["16","34"]],["Travis Air Force Base","KSUU",["03L","03R","21R","32","21-2","21L"]],["Nut Tree","KVCB",["02","20"]],["Yolo County Airport","KDWA",["16","34"]],["University Airport","KEDU",["35","17"]],["Sacramento Executive","KSAC",["02","30","20","12"]],["Sacramento Mather","KMHR",["04L","04R","22L","22R"]],["Sacramento International","KSMF",["35L","35R","17L","17R"]]
];
const PROMPT="You are AEROFLY-ATC, an immersive flight-simulation ATC companion. Speak concise natural American aviation radio English, professional and station-appropriate. Never say this is a simulation during normal radio calls. The pilot flies; you have no Aerofly telemetry or real position. All weather, clearances, frequencies and traffic are fictional. Never claim real-world authorization. Never invent taxiway names or verified routes. Use only supplied airport runway data and assign runways yourself. Maintain continuity from history and state. Recognize MAYDAY, PAN-PAN, fire, smoke, engine failure, medical emergency and bird strike immediately. Return only JSON: station, phase, frequency, atc, hint, explanation, state. State includes assignedDepartureRunway, assignedArrivalRunway, initialAltitude, heading, squawk, nextStation, atis. Provide exact concise readback hints. ATIS is fictional and not synchronized with Aerofly.";
function headers(){return {"Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization","Vary":"Origin","Content-Type":"application/json; charset=utf-8"};}
function out(data,status){return new Response(JSON.stringify(data),{status:status||200,headers:headers()});}
function clean(v,n){return String(v==null?"":v).trim().slice(0,n||200);}

function validTelemetry(t){
 if(!t||typeof t!=="object"||Array.isArray(t))return false;
 var numeric=["latitude","longitude","altitudeFt","groundSpeedKts","indicatedAirspeedKts","headingDeg","verticalSpeedFpm"];
 for(var k of numeric){if(t[k]!==undefined&&t[k]!==null&&(typeof t[k]!=="number"||!Number.isFinite(t[k])))return false;}
 if(t.latitude!==undefined&&(t.latitude < -90||t.latitude>90))return false;
 if(t.longitude!==undefined&&(t.longitude < -180||t.longitude>180))return false;
 if(t.headingDeg!==undefined&&(t.headingDeg<0||t.headingDeg>=360))return false;
 if(t.onGround!==undefined&&typeof t.onGround!=="boolean")return false;
 return numeric.some(k=>typeof t[k]==="number")||typeof t.onGround==="boolean";
}
function authorizedBridge(request,env){
 var expected=env.ATC_TELEMETRY_TOKEN;
 if(!expected)return false;
 return request.headers.get("Authorization")==="Bearer "+expected;
}
async function handleTelemetry(request,url,env){
 if(!authorizedBridge(request,env))return out({error:"Telemetry bridge is not paired"},401);
 if(!env.ATC_TELEMETRY)return out({error:"Telemetry storage is not configured"},503);
 if(request.method==="POST"&&url.pathname==="/telemetry"){
  var t=await request.json();
  if(!validTelemetry(t))return out({error:"Invalid telemetry payload"},400);
  var record={receivedAt:new Date().toISOString(),data:t};
  await env.ATC_TELEMETRY.put("latest",JSON.stringify(record),{expirationTtl:120});
  return out({ok:true,receivedAt:record.receivedAt});
 }
 if(request.method==="GET"&&url.pathname==="/telemetry/latest"){
  var saved=await env.ATC_TELEMETRY.get("latest");
  if(!saved)return out({ok:true,available:false});
  return out({ok:true,available:true,telemetry:JSON.parse(saved)});
 }
 return out({error:"Use POST /telemetry or GET /telemetry/latest"},404);
}
function apt(code){return AIRPORTS.find(a=>a[1]===code)||[code||"Unknown",code||"----",[]];}
function hdg(r){var m=String(r||"").match(/^([0-9]{1,2})/);return m?(Number(m[1])*10)%360:0;}
function runway(list,wind){if(!list||!list.length)return "";return list.slice().sort((a,b)=>Math.abs(((hdg(a)-wind+540)%360)-180)-Math.abs(((hdg(b)-wind+540)%360)-180))[0];}
function stateFrom(history,c){if(c.flightState)return c.flightState;for(var i=(history||[]).length-1;i>=0;i--){if(history[i].role==="model"){try{var x=JSON.parse(history[i].text);if(x.state)return x.state;}catch(e){}}}return {};}
function core(message,c,history){
 var msg=message.toLowerCase(),from=c.origin||{},to=c.destination||{},dep=apt(from.icao),arr=apt(to.icao);
 var cs=clean(c.callsign||"November Niner Charlie Bravo",80),ac=clean(c.aircraft||"Learjet 45",50),s=stateFrom(history,c);
 var emergency=/\b(mayday|pan.?pan|engine fail|engine out|fire|smoke|medical|bird strike|emergency)\b/i.test(message);
 var first=!s.assignedDepartureRunway;
 if(first){s.simWind=Math.floor(Math.random()*36)*10;s.assignedDepartureRunway=runway(dep[2],s.simWind);s.assignedArrivalRunway=runway(arr[2],s.simWind);s.initialAltitude=c.flightRules==="VFR"?"5,500 feet":"5,000 feet";s.heading=String(Math.floor(Math.random()*36)*10).padStart(3,"0");s.squawk=String(1000+Math.floor(Math.random()*7000));}
 var dr=s.assignedDepartureRunway||"assigned runway",ar=s.assignedArrivalRunway||"assigned runway";
 var station=clean(c.station||"Clearance",24),phase=clean(c.phase||"Preflight",24),frequency=clean(c.frequency||"121.700",16),atc="",hint="",explanation="";
 if(emergency){station="Tower";phase="Emergency";frequency="121.500";atc=cs+", emergency acknowledged. State nature of distress, intentions, persons on board and fuel endurance. Maintain present heading if able.";hint=cs+", MAYDAY/PAN-PAN, "+ac+", "+clean(message,120)+". Request immediate assistance.";explanation="Declara la emergencia e informa naturaleza, intenciones, personas a bordo y combustible.";}
 else if(/atis|information|weather/i.test(msg)||station==="ATIS"){station="ATIS";var w=Math.floor(Math.random()*36)*10;s.atis=s.atis&&s.atis.airport===dep[1]?s.atis:{airport:dep[1],information:String.fromCharCode(65+Math.floor(Math.random()*8)),wind:String(w).padStart(3,"0")+" at "+(4+Math.floor(Math.random()*9))+" knots",visibility:"10 miles",temperature:(17+Math.floor(Math.random()*12))+" degrees Celsius",runway:dr,conditions:"Few clouds"};atc=dep[0]+" information "+s.atis.information+". Wind "+s.atis.wind+". Visibility "+s.atis.visibility+". "+s.atis.conditions+". Temperature "+s.atis.temperature+". Runway "+dr+" in use. Advise you have information "+s.atis.information+". Simulated ATIS.";hint="Information "+s.atis.information+" received, "+cs+".";explanation="ATIS ficticio, no sincronizado con el clima de Aerofly.";frequency="126.000";}
 else if(first||/request clearance|clearance|ifr clearance|vfr clearance/.test(msg)||(station==="Clearance"&&phase==="Preflight")){station="Clearance";phase="Preflight";frequency="121.700";atc=cs+", cleared to "+arr[0]+" airport, "+(c.flightRules||"IFR")+" departure. Runway "+dr+". Initial altitude "+s.initialAltitude+". Expect requested cruise altitude after departure. Squawk "+s.squawk+". Advise when ready to taxi.";hint=cs+", cleared to "+arr[0]+", runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+". Ready to taxi.";explanation="Lee de vuelta destino, pista, altitud inicial y código transponder.";}
 else if(/taxi|ready to taxi|pushback|parking/.test(msg)||station==="Ground"||phase==="Taxi"){station="Ground";phase="Taxi";frequency="121.900";atc=cs+", runway "+dr+" is assigned. Taxi to the runway via published airport taxiways; hold short of runway "+dr+". No taxiway routing is verified in this database.";hint=cs+", taxi to runway "+dr+", hold short, "+cs+".";explanation="No tenemos diagramas de rodaje verificados; no inventaremos taxiways.";}
 else if(/holding short|ready for departure|ready for takeoff|takeoff/.test(msg)||station==="Tower"||phase==="Takeoff"){station="Tower";phase="Takeoff";frequency="118.300";atc=cs+", runway "+dr+", cleared for takeoff. Wind "+String(s.simWind||270).padStart(3,"0")+" at 6 knots. After departure contact Departure.";hint=cs+", cleared for takeoff runway "+dr+", contact Departure after departure, "+cs+".";explanation="Autorización de despegue simulada. Después cambia a Departure.";s.nextStation="Departure";}
 else if(/departure|airborne|passing|climbing/.test(msg)||phase==="Departure"){station="Departure";phase="Departure";frequency="124.600";atc=cs+", radar contact. Climb and maintain "+(c.requestedAltitude||"FL350")+". Contact Oakland Center on 127.000.";hint=cs+", climb and maintain "+(c.requestedAltitude||"FL350")+", contact Oakland Center 127.000.";explanation="Salida confirma ascenso y transfiere al centro.";s.nextStation="Center";}
 else if(/center|cruise|maintaining|level/.test(msg)||phase==="Cruise"||station==="Center"){station="Center";phase="Cruise";frequency="127.000";atc=cs+", Oakland Center, roger. Maintain "+(c.requestedAltitude||"FL350")+". Expect descent in approximately 40 miles. Advise when ready to descend.";hint="Maintain "+(c.requestedAltitude||"FL350")+", "+cs+".";explanation="En ruta: confirma nivel y espera descenso.";if(/ready to descend|request descent|descending/.test(msg)){station="Approach";phase="Approach";frequency="124.000";atc=cs+", descend and maintain 6,000 feet. Expect runway "+ar+". Contact "+arr[0]+" Approach on 124.000.";hint=cs+", descend and maintain 6,000 feet, expect runway "+ar+".";s.nextStation="Approach";}}
 else if(/approach|inbound|descending|established/.test(msg)||phase==="Approach"||station==="Approach"){station="Approach";phase="Approach";frequency="124.000";atc=cs+", "+arr[0]+" Approach. Continue approach runway "+ar+". Contact Tower on 118.300 when established on final.";hint=cs+", continuing approach runway "+ar+", will contact Tower on 118.300.";explanation="Confirma pista y transferencia a torre.";s.nextStation="Tower";}
 else if(/land|final|tower|vacated|runway/.test(msg)||phase==="Landing"){station="Tower";phase="Landing";frequency="118.300";atc=cs+", runway "+ar+", cleared to land. Wind calm. After landing, vacate when able and contact Ground on 121.900.";hint=cs+", cleared to land runway "+ar+"; contact Ground after vacating.";explanation="Autorización de aterrizaje simulada. Después de liberar pista, cambia a Ground.";s.nextStation="Ground";}
 else{atc=cs+", say again. "+station+".";hint=station+", "+cs+", say again.";explanation="No identifiqué tu intención; repite la llamada.";}
 return {station:station,phase:phase,frequency:frequency,atc:atc,hint:hint,explanation:explanation,state:s,engine:"AEROFLY ATC CORE"};
}
function parseAI(text){var a=text.trim(),i=a.indexOf("{"),j=a.lastIndexOf("}");if(i>=0&&j>i)a=a.slice(i,j+1);var d=JSON.parse(a);if(!d.atc||!d.hint)throw Error("Incomplete AI response");d.engine="Gemini";return d;}
async function gemini(env,message,context,history){
 var contents=(history||[]).slice(-8).map(function(x){return {role:x.role==="model"?"model":"user",parts:[{text:clean(x.text,3000)}]};});
 contents.push({role:"user",parts:[{text:"FLIGHT CONTEXT:\n"+JSON.stringify(context)+"\nPILOT TRANSMISSION:\n"+message}]});
 var r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+MODEL+":generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:PROMPT}]},contents:contents,generationConfig:{temperature:0.55,maxOutputTokens:700,responseMimeType:"application/json"}})});
 var data=await r.json();if(!r.ok)throw Error("Gemini HTTP "+r.status+": "+(data.error&&data.error.message||"provider error"));
 var t=data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts.map(function(p){return p.text||"";}).join("");if(!t)throw Error("Gemini returned empty output");return parseAI(t);
}
export default {async fetch(request,env){
 var url=new URL(request.url),origin=request.headers.get("Origin")||"";
 if(request.method==="OPTIONS")return new Response(null,{headers:headers()});
 if(request.method==="GET"&&url.pathname==="/health")return out({ok:true,service:"AEROFLY-ATC Brain",engines:["Gemini","AEROFLY ATC CORE"],model:MODEL});
 if(url.pathname==="/telemetry"||url.pathname==="/telemetry/latest")return handleTelemetry(request,url,env);\n if(request.method!=="POST"||url.pathname!=="/atc")return out({error:"Use POST /atc or GET /health"},404);
 if(origin&&origin!==ALLOWED_ORIGIN)return out({error:"Origin not allowed"},403);
 try{var body=await request.json(),message=clean(body.message,3000),context=body.context||{},history=Array.isArray(body.history)?body.history.slice(-8):[];if(!message)return out({error:"Message is required"},400);
 if(env.GEMINI_API_KEY){try{return out(await gemini(env,message,context,history));}catch(e){var fallback=core(message,context,history);fallback.fallbackReason=clean(e.message,180);return out(fallback);}}
 return out(core(message,context,history));
 }catch(e){return out({error:"Request could not be processed",details:clean(e.message,200)},500);}
}};
