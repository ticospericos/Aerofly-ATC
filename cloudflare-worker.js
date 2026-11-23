const MODEL="gemini-3.8-flash";
const ALLOWED_ORIGIN="https://ticospericos.github.io";
const AIRPORTS=[
["Monterey Regional","KMRY",["28L","28R","01L","01R"]],["Salinas Municipal","KSNS",["31","26","08","13"]],["Hollister Municipal","KCVH",["31","24","13","06"]],["Watsonville Municipal","KWVI",["20","06","02","27"]],["San Martin Airport","KE16",["14","32"]],["Reid-Hillview","KRHV",["13L","13R","31L","31R"]],["San José Mineta International","KSJC",["30L","30R","12L","12R"]],["Modesto City-County","KMOD",["28L","28R","10L","10R"]],["Moffett Federal Airfield","KNUQ",["32L","32R","14L","14R"]],["Palo Alto","KPAO",["13","31"]],["Tracy Municipal","KTCY",["30","26","12","08"]],["Stockton Metropolitan","KSCK",["29L","29R","11L","11R"]],["Livermore Municipal","KLVK",["25L","25R","07L","07R"]],["San Carlos","KSQL",["12","30"]],["Half Moon Bay","KHAF",["12","30"]],["San Francisco International","KSFO",["01L","01R","28L","28R","10L","10R","19L","19R"]],["Hayward Executive","KHWD",["28L","28R","10L","10R"]],["Oakland International","KOAK",["30","12","28L","28R","10L","10R","33","15"]],["Byron Airport","KC83",["30","23","12","05"]],["Buchanan Field","KCCR",["01L","01R","32L","32R","19L","19R","14L","14R"]],["Lodi Airport","K1O3",["30","26","12","08"]],["Rio Vista Municipal","KO88",["33","25","07","15"]],["Gnoss Field (Novato)","KDVO",["13","31"]],["Petaluma Municipal","KO69",["11","29"]],["Napa County","KAPC",["06","01L","01R","24","19L","19R"]],["Charles M. Schulz Sonoma County","KSTS",["02","32","20","14"]],["Angwin-Parrett Field","K203",["16","34"]],["Travis Air Force Base","KSUU",["03L","03R","21R","32","21-2","21L"]],["Nut Tree","KVCB",["02","20"]],["Yolo County Airport","KDWA",["16","34"]],["University Airport","KEDU",["35","17"]],["Sacramento Executive","KSAC",["02","30","20","12"]],["Sacramento Mather","KMHR",["04L","04R","22L","22R"]],["Sacramento International","KSMF",["35L","35R","17L","17R"]]
];
const PROMPT="You are AEROFLY-ATC, an immersive flight-simulation ATC companion. Use natural, varied, professional American aviation radio phraseology with realistic pacing and station-appropriate wording. Avoid repetitive canned replies; acknowledge the pilot's exact call, provide relevant traffic/weather/runway/altitude/heading information when available, state the next action, and finish with a clear readback request when appropriate. Give richer but concise transmissions, usually 2-4 sentences. Clearance must include route/destination, runway, initial altitude, squawk, departure instructions and readback. Ground must include pushback/taxi/hold-short instructions without inventing taxiway names. Tower must include runway, wind and takeoff/landing clearance plus after-departure or after-landing instructions. Departure/Center should provide radar contact, climb/maintain, heading or route when grounded, traffic/advisories, frequency handoff and expected descent. Approach should provide descent, altimeter only if supplied, runway, sequencing and tower handoff. Use callsign naturally, not in every sentence. Maintain conversation continuity and vary wording. EMERGENCIES: immediately recognize engine failure, engine fire, smoke, MAYDAY, PAN-PAN, medical emergency, bird strike and other distress. Do not answer every emergency with the same generic message. Explicitly name the reported emergency, acknowledge its priority, ask only for essential missing information (intentions, persons on board, fuel endurance), provide a specific response: engine failure = priority handling, maintain aircraft control, advise intentions, offer direct routing/nearest suitable airport using only supplied departure/destination; engine fire = declare MAYDAY, immediate priority landing, advise use of aircraft checklist, request souls/fuel, offer direct approach to supplied airport and state emergency equipment will be standing by; smoke = MAYDAY/PAN-PAN according to severity, priority landing and emergency services; medical = PAN-PAN unless pilot declares MAYDAY, priority handling and medical assistance on arrival; bird strike = assess damage/engine indications and advise intentions, offer return/landing. Keep emergency frequency 121.500 unless already on a station frequency and avoid unnecessary handoffs. On follow-up transmissions, remember the emergency type and progress it: acknowledge souls/fuel/intentions, issue priority vectors/approach, landing clearance, runway vacated instructions and emergency-services status. Never repeat the same initial emergency prompt on every turn. Never invent aircraft capabilities, engine count, exact position, nearest airport, taxiway, real weather or real traffic. The pilot flies; you have no Aerofly telemetry or real position. All weather, clearances, frequencies and traffic are fictional; never claim real-world authorization. Use only supplied airport runway data. Return only JSON with station, phase, frequency, atc, hint, explanation, state. Preserve state fields assignedDepartureRunway, assignedArrivalRunway, initialAltitude, heading, squawk, nextStation, atis and emergencyType, emergencyStage, emergencyAirport, personsOnBoard, fuelEndurance. ATIS is fictional and not synchronized with Aerofly.";
function headers(){return {"Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin","Content-Type":"application/json; charset=utf-8"};}
function out(data,status){return new Response(JSON.stringify(data),{status:status||200,headers:headers()});}
function clean(v,n){return String(v==null?"":v).trim().slice(0,n||200);}
function apt(code){return AIRPORTS.find(a=>a[1]===code)||[code||"Unknown",code||"----",[]];}
function hdg(r){var m=String(r||"").match(/^([0-9]{1,2})/);return m?(Number(m[1])*10)%360:0;}
function runway(list,wind){if(!list||!list.length)return "";return list.slice().sort((a,b)=>Math.abs(((hdg(a)-wind+540)%360)-180)-Math.abs(((hdg(b)-wind+540)%360)-180))[0];}
function stateFrom(history,c){if(c.flightState)return c.flightState;for(var i=(history||[]).length-1;i>=0;i--){if(history[i].role==="model"){try{var x=JSON.parse(history[i].text);if(x.state)return x.state;}catch(e){}}}return {};}
function core(message,c,history){
 var msg=message.toLowerCase(),from=c.origin||{},to=c.destination||{},dep=apt(from.icao),arr=apt(to.icao);
 var cs=clean(c.callsign||"November Niner Charlie Bravo",80),ac=clean(c.aircraft||"Learjet 45",50),s=stateFrom(history,c);
 var first=!s.assignedDepartureRunway;
 if(first){s.simWind=Math.floor(Math.random()*36)*10;s.assignedDepartureRunway=runway(dep[2],s.simWind);s.assignedArrivalRunway=runway(arr[2],s.simWind);s.initialAltitude=c.flightRules==="VFR"?"5,500 feet":"5,000 feet";s.heading=String(Math.floor(Math.random()*36)*10).padStart(3,"0");s.squawk=String(1000+Math.floor(Math.random()*7000));}
 var dr=s.assignedDepartureRunway||"assigned runway",ar=s.assignedArrivalRunway||"assigned runway";
 var station=clean(c.station||"Clearance",24),phase=clean(c.phase||"Preflight",24),frequency=clean(c.frequency||"121.700",16),atc="",hint="",explanation="";
 var engineFire=/\b(engine fire|engine on fire|fire in (the )?(left|right|number|no\.?\s*\d|one|two|three|four)?\s*engine|fire warning|engine is burning)\b/i.test(message);
 var engineFailure=/\b(engine failure|engine fail|engine out|lost (the )?engine|loss of (an )?engine|engine shutdown|power loss|dual engine)\b/i.test(message);
 var smoke=/\b(smoke|fumes|cabin smoke)\b/i.test(message);
 var medical=/\b(medical|passenger sick|medical emergency)\b/i.test(message);
 var bird=/\b(bird strike|birds?)\b/i.test(message);
 var declared=/\b(mayday|pan.?pan|emergency|declare( an)? emergency)\b/i.test(message);
 var emergencyNow=engineFire||engineFailure||smoke||medical||bird||declared||s.emergencyType;
 if(engineFire){s.emergencyType="ENGINE FIRE";s.emergencyStage="INITIAL";}
 else if(engineFailure){s.emergencyType="ENGINE FAILURE";s.emergencyStage="INITIAL";}
 else if(smoke){s.emergencyType="SMOKE";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(medical){s.emergencyType="MEDICAL";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(bird){s.emergencyType="BIRD STRIKE";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(declared&&!s.emergencyType){s.emergencyType="GENERAL EMERGENCY";s.emergencyStage="INITIAL";}
 if(emergencyNow){
   station="Tower";phase="Emergency";frequency="121.500";s.squawk="7700";s.emergencyAirport=s.emergencyAirport||((phase==="Approach"||phase==="Landing")?arr[1]:arr[1]);
   var souls=/\b(\d{1,3})\s*(souls|persons|people|pax|passengers|on board)\b/i.exec(message);
   var fuel=/\b(fuel|minutes|hours|endurance)\b/i.exec(message);
   if(souls)s.personsOnBoard=souls[1];
   if(fuel)s.fuelEndurance=clean(message.match(/.{0,25}(?:fuel|minutes|hours|endurance).{0,35}/i)?.[0]||"",80);
   var details=(s.personsOnBoard?" Souls on board "+s.personsOnBoard+".":" Confirm persons on board.")+(s.fuelEndurance?" Fuel endurance noted: "+s.fuelEndurance+".":" Advise fuel endurance when able.");
   var airportName=arr[0],runwayName=ar;
   if(s.emergencyStage==="INITIAL"||!s.emergencyStage){
     if(s.emergencyType==="ENGINE FIRE"){
       atc=cs+", MAYDAY acknowledged. Engine fire reported. Turn no further than necessary and maintain aircraft control; carry out the aircraft's engine-fire checklist. "+airportName is available for an immediate priority landing, runway "+runwayName+". Emergency equipment will be standing by. Confirm intentions."+details;
       hint=cs+", MAYDAY, engine fire, request immediate landing "+airportName+", runway "+runwayName+".";
       explanation="Emergencia de fuego: prioridad máxima, checklist del avión, aterrizaje inmediato y servicios de emergencia preparados. Confirma intenciones, personas a bordo y combustible.";
     }else if(s.emergencyType==="ENGINE FAILURE"){
       atc=cs+", MAYDAY acknowledged. Engine failure reported. Maintain control and advise whether the aircraft is controllable and your intentions. "+airportName+" is available for priority landing, runway "+runwayName+". I will keep the frequency clear and arrange emergency equipment."+details;
       hint=cs+", MAYDAY, engine failure, aircraft controllable, request priority landing "+airportName+", runway "+runwayName+".";
       explanation="Falla de motor: ATC reconoce MAYDAY, ofrece prioridad para aterrizar y pregunta si el avión sigue controlable. No se presupone cuántos motores tiene la aeronave.";
     }else if(s.emergencyType==="SMOKE"){
       atc=cs+", distress call acknowledged. Smoke reported. Declare MAYDAY if the situation is immediately life-threatening; otherwise PAN-PAN. Request immediate intentions. "+airportName+" available for priority landing runway "+runwayName+". Emergency services will be standing by."+details;
       hint=cs+", PAN-PAN, smoke in aircraft, request priority landing "+airportName+", runway "+runwayName+".";
       explanation="Humo a bordo: prioridad, aterrizaje sin demora y servicios de emergencia. El piloto determina la gravedad y declara MAYDAY o PAN-PAN.";
     }else if(s.emergencyType==="MEDICAL"){
       atc=cs+", PAN-PAN acknowledged. Medical emergency understood. You are cleared for priority handling to "+airportName+", runway "+runwayName+". Medical assistance will be requested to meet the aircraft. Advise if you require MAYDAY-level assistance."+details;
       hint=cs+", PAN-PAN, medical emergency, request priority landing "+airportName+", runway "+runwayName+".";
       explanation="Emergencia médica: prioridad de llegada y asistencia médica solicitada en tierra.";
     }else if(s.emergencyType==="BIRD STRIKE"){
       atc=cs+", bird strike reported, roger. Advise any engine indications, vibration or aircraft damage and confirm whether you wish to return or continue. "+airportName+" runway "+runwayName+" is available for priority landing if required."+details;
       hint=cs+", bird strike, checking aircraft, request to return for landing if required.";
       explanation="Impacto con ave: ATC pregunta por daños e indicaciones del motor y ofrece regreso prioritario.";
     }else{
       atc=cs+", emergency acknowledged. MAYDAY or PAN-PAN, as appropriate, is understood. State the nature of the emergency, your intentions and whether the aircraft is controllable. "+airportName+" runway "+runwayName+" is available for priority handling."+details;
       hint=cs+", MAYDAY, nature of emergency [state problem], request priority handling.";
       explanation="ATC reconoce la emergencia y solicita naturaleza, controlabilidad, intenciones, personas a bordo y combustible.";
     }
     s.emergencyStage="ACKNOWLEDGED";s.nextStation="Approach";
   }else if(/\b(landed|on the ground|runway vacated|vacated|stopped|shut down)\b/i.test(msg)){
     station="Ground";phase="Emergency";frequency="121.900";s.emergencyStage="ON_GROUND";
     atc=cs+", roger. Emergency services are responding. Keep the aircraft stopped unless instructed otherwise. Advise when engines are shut down and when it is safe for responders to approach. Ground will coordinate assistance.";
     hint=cs+", stopped, engines [running/shut down], awaiting emergency services.";
     explanation="Después del aterrizaje, ATC coordina los vehículos de emergencia y pide confirmar estado de motores y seguridad.";
   }else if(/\b(approach|inbound|descending|ready for landing|request landing|on final)\b/i.test(msg)||s.emergencyStage==="ACKNOWLEDGED"){
     station="Approach";phase="Emergency";frequency="124.000";s.emergencyStage="APPROACH";
     atc=cs+", roger. Priority approach approved for "+airportName+", runway "+runwayName. No delay expected. Turn as required to position for final; report established. Emergency equipment is positioned and standing by. Advise when ready for landing.";
     hint=cs+", priority approach runway "+runwayName, established on final.";
     explanation="Aproximación prioritaria: sin demoras, pista asignada y equipos de emergencia preparados. Reporta establecido en final.";
     s.nextStation="Tower";
   }else if(/\b(final|cleared to land|landing)\b/i.test(msg)||s.emergencyStage==="APPROACH"){
     station="Tower";phase="Emergency";frequency="118.300";s.emergencyStage="LANDING";
     atc=cs+", runway "+runwayName, cleared to land. Wind "+String(s.simWind||270).padStart(3,"0")+" at 6 knots. Emergency equipment is standing by. After landing, stop if necessary and advise your status; do not cross another runway until instructed.";
     hint=cs+", cleared to land runway "+runwayName+".";
     explanation="Autorización de aterrizaje con vehículos de emergencia en espera. Informa tu estado después de detenerte.";
     s.nextStation="Ground";
   }else{
     atc=cs+", roger. "+s.emergencyType+" remains active; maintain priority handling. "+(s.emergencyStage==="ACKNOWLEDGED"?"Advise intentions and when ready to proceed direct for the priority approach.":"Continue as cleared and advise any change in aircraft condition.")+" Emergency frequency 121.500 monitored.";
     hint=cs+", roger, maintaining emergency status, "+(s.personsOnBoard?"souls "+s.personsOnBoard:"souls on board [number]")+".";
     explanation="La emergencia permanece activa; ATC conserva el contexto y no repite el mensaje inicial.";
   }
 }else if(/atis|information|weather/i.test(msg)||station==="ATIS"){
   station="ATIS";var w=Math.floor(Math.random()*36)*10;s.atis=s.atis&&s.atis.airport===dep[1]?s.atis:{airport:dep[1],information:String.fromCharCode(65+Math.floor(Math.random()*8)),wind:String(w).padStart(3,"0")+" at "+(4+Math.floor(Math.random()*9))+" knots",visibility:"10 miles",temperature:(17+Math.floor(Math.random()*12))+" degrees Celsius",runway:dr,conditions:"Few clouds"};atc=dep[0]+" information "+s.atis.information.+" Wind "+s.atis.wind+". Visibility "+s.atis.visibility+". "+s.atis.conditions+". Temperature "+s.atis.temperature+". Runway "+dr+" in use. Advise you have information "+s.atis.information+". Simulated ATIS.";hint="Information "+s.atis.information+" received, "+cs+".";explanation="ATIS ficticio, no sincronizado con el clima de Aerofly.";frequency="126.000";
 }else if(first||/request clearance|clearance|ifr clearance|vfr clearance/.test(msg)||(station==="Clearance"&&phase==="Preflight")){
   station="Clearance";phase="Preflight";frequency="121.700";atc=cs+", clearance copied. Cleared to "+arr[0]+" airport, "+(c.flightRules||"IFR")+" departure. Expect runway "+dr+". Initial climb "+s.initialAltitude+"; expect "+(c.requestedAltitude||"requested cruise altitude")+" after departure. Squawk "+s.squawk+". Advise when ready for pushback and start. Read back destination, runway, initial altitude and transponder.";hint=cs+", cleared to "+arr[0]+", runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+". Ready for pushback.";explanation="Read back completo: destino, pista, altitud inicial y código transponder. La autorización de crucero llegará después del despegue.";
 }else if(/taxi|ready to taxi|pushback|parking|start up/.test(msg)||station==="Ground"||phase==="Taxi"){
   station="Ground";phase="Taxi";frequency="121.900";atc=cs+", Ground. Pushback and start approved if required. Taxi to holding point runway "+dr+" via the published airport taxiways; give way to traffic, use caution near other aircraft and hold short of runway "+dr+". Report holding short and ready for departure. Taxiway routing is not verified in this database.";hint=cs+", pushback and start approved, taxi to holding point runway "+dr+", hold short, will report holding short.";explanation="Rodaje más completo con pushback/start, precaución, tráfico y punto de espera. No inventamos nombres de calles de rodaje.";
 }else if(/holding short|ready for departure|ready for takeoff|takeoff/.test(msg)||station==="Tower"||phase==="Takeoff"){
   station="Tower";phase="Takeoff";frequency="118.300";atc=cs+", Tower. Runway "+dr+"; wind "+String(s.simWind||270).padStart(3,"0")+" at 6 knots. Runway "+dr+", cleared for takeoff. After departure, fly runway heading and contact Departure on 124.600 when airborne. Caution, check final approach is clear.";hint=cs+", runway "+dr+", cleared for takeoff, runway heading, contact Departure 124.600 airborne.";explanation="Autorización de despegue con viento, rumbo de pista y transferencia a Departure.";s.nextStation="Departure";
 }else if(/departure|airborne|passing|climbing/.test(msg)||phase==="Departure"){
   station="Departure";phase="Departure";frequency="124.600";atc=cs+", Departure, radar contact. Continue climb and maintain "+(c.requestedAltitude||"FL350")+". Turn heading "+s.heading+" when able; advise passing 3,000 feet. Traffic information will be passed if required. Contact Oakland Center on 127.000 when advised.";hint=cs+", radar contact, climbing to "+(c.requestedAltitude||"FL350")+", heading "+s.heading+".";explanation="Departure confirma contacto radar, ascenso y rumbo asignado. Espera la transferencia explícita al Center.";s.nextStation="Center";
 }else if(/center|cruise|maintaining|level/.test(msg)||phase==="Cruise"||station==="Center"){
   station="Center";phase="Cruise";frequency="127.000";atc=cs+", Oakland Center, radar contact. Maintain "+(c.requestedAltitude||"FL350")." . Report reaching cruise altitude. No reported traffic at this time. Expect descent in approximately 40 miles; advise when ready. Maintain present heading unless otherwise instructed.";hint=cs+", Oakland Center, maintaining "+(c.requestedAltitude||"FL350")+", standing by for descent.";explanation="En ruta: confirma nivel, escucha información de tráfico y espera instrucciones de descenso.";if(/ready to descend|request descent|descending/.test(msg)){station="Approach";phase="Approach";frequency="124.000";atc=cs+", descend and maintain 6,000 feet. Expect runway "+ar+" at "+arr[0]+". Advise when leaving your current altitude and contact "+arr[0]+" Approach on 124.000.";hint=cs+", descend and maintain 6,000 feet, expect runway "+ar+".";s.nextStation="Approach";}
 }else if(/approach|inbound|descending|established/.test(msg)||phase==="Approach"||station==="Approach"){
   station="Approach";phase="Approach";frequency="124.000";atc=cs+", "+arr[0]+" Approach. Radar contact. Continue descent and maintain 3,000 feet until established; expect runway "+ar+". Report established on the localizer or final approach path. Contact Tower on 118.300 when established.";hint=cs+", maintain 3,000 feet until established, expect runway "+ar+", will contact Tower 118.300.";explanation="Approach da altitud, pista esperada y condición para transferir a Tower.";s.nextStation="Tower";
 }else if(/land|final|tower|vacated|runway/.test(msg)||phase==="Landing"){
   station="Tower";phase="Landing";frequency="118.300";atc=cs+", Tower. Runway "+ar+", cleared to land. Wind "+String(s.simWind||270).padStart(3,"0")+" at 6 knots. After landing, vacate when able; hold clear of the runway and contact Ground on 121.900. Advise runway vacated.";hint=cs+", cleared to land runway "+ar+", will vacate and contact Ground 121.900.";explanation="Autorización de aterrizaje con viento e instrucciones posteriores para liberar pista.";
   s.nextStation="Ground";
 }else{atc=cs+", say again, please. "+station+" is standing by. State your position and request.";hint=station+", "+cs+", say again with your position and request.";explanation="No identifiqué tu intención; repite la llamada con posición e intención.";}
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
 if(request.method!=="POST"||url.pathname!=="/atc")return out({error:"Use POST /atc or GET /health"},404);
 if(origin&&origin!==ALLOWED_ORIGIN)return out({error:"Origin not allowed"},403);
 try{var body=await request.json(),message=clean(body.message,3000),context=body.context||{},history=Array.isArray(body.history)?body.history.slice(-8):[];if(!message)return out({error:"Message is required"},400);
 if(env.GEMINI_API_KEY){try{return out(await gemini(env,message,context,history));}catch(e){var fallback=core(message,context,history);fallback.fallbackReason=clean(e.message,180);return out(fallback);}}
 return out(core(message,context,history));
 }catch(e){return out({error:"Request could not be processed",details:clean(e.message,200)},500);}
}};
