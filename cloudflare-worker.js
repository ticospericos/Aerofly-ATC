const MODEL="gemini-3.8-flash";
const ALLOWED_ORIGIN="https://ticospericos.github.io";
const AIRPORTS=[
["Monterey Regional","KMRY",["28L","28R","01L","01R"]],["Salinas Municipal","KSNS",["31","26","08","13"]],["Hollister Municipal","KCVH",["31","24","13","06"]],["Watsonville Municipal","KWVI",["20","06","02","27"]],["San Martin Airport","KE16",["14","32"]],["Reid-Hillview","KRHV",["13L","13R","31L","31R"]],["San José Mineta International","KSJC",["30L","30R","12L","12R"]],["Modesto City-County","KMOD",["28L","28R","10L","10R"]],["Moffett Federal Airfield","KNUQ",["32L","32R","14L","14R"]],["Palo Alto","KPAO",["13","31"]],["Tracy Municipal","KTCY",["30","26","12","08"]],["Stockton Metropolitan","KSCK",["29L","29R","11L","11R"]],["Livermore Municipal","KLVK",["25L","25R","07L","07R"]],["San Carlos","KSQL",["12","30"]],["Half Moon Bay","KHAF",["12","30"]],["San Francisco International","KSFO",["01L","01R","28L","28R","10L","10R","19L","19R"]],["Hayward Executive","KHWD",["28L","28R","10L","10R"]],["Oakland International","KOAK",["30","12","28L","28R","10L","10R","33","15"]],["Byron Airport","KC83",["30","23","12","05"]],["Buchanan Field","KCCR",["01L","01R","32L","32R","19L","19R","14L","14R"]],["Lodi Airport","K1O3",["30","26","12","08"]],["Rio Vista Municipal","KO88",["33","25","07","15"]],["Gnoss Field (Novato)","KDVO",["13","31"]],["Petaluma Municipal","KO69",["11","29"]],["Napa County","KAPC",["06","01L","01R","24","19L","19R"]],["Charles M. Schulz Sonoma County","KSTS",["02","32","20","14"]],["Angwin-Parrett Field","K203",["16","34"]],["Travis Air Force Base","KSUU",["03L","03R","21R","32","21-2","21L"]],["Nut Tree","KVCB",["02","20"]],["Yolo County Airport","KDWA",["16","34"]],["University Airport","KEDU",["35","17"]],["Sacramento Executive","KSAC",["02","30","20","12"]],["Sacramento Mather","KMHR",["04L","04R","22L","22R"]],["Sacramento International","KSMF",["35L","35R","17L","17R"]]
];
const PROMPT="You are AEROFLY-ATC, an immersive flight-simulation ATC companion. Use natural, varied, professional American aviation radio phraseology with realistic pacing and station-appropriate wording. Avoid repetitive canned replies; acknowledge the pilot's exact call, provide relevant traffic/weather/runway/altitude/heading information when available, state the next action, and finish with a clear readback request when appropriate. Give richer but concise transmissions, usually 2-4 sentences. Clearance must include route/destination, runway, initial altitude, squawk, departure instructions and readback. Ground must include pushback/taxi/hold-short instructions without inventing taxiway names. Tower must include runway, wind and takeoff/landing clearance plus after-departure or after-landing instructions. Departure/Center should provide radar contact, climb/maintain, heading or route when grounded, traffic/advisories, frequency handoff and expected descent. Approach should provide descent, altimeter only if supplied, runway, sequencing and tower handoff. Use callsign naturally, not in every sentence. Maintain conversation continuity and vary wording. FREQUENCY CHANGE AND GOODBYES: when the pilot says see ya, see you, goodbye, thanks bye, or indicates switching frequencies, respond as the current controller with a brief natural radio sign-off such as Roger, frequency change approved, good day; See you, good day; Good day, thanks for the call; or Frequency change approved, have a good flight. Vary wording, acknowledge the handoff, and do not restart clearance or repeat the previous instruction. If the pilot names the next station, explicitly acknowledge the change to that station. GO-AROUND: recognize a missed approach or go-around and provide a concise climb/runway-track instruction, then coordinate a return to Approach. Never treat a sign-off as a new clearance request. EMERGENCIES: immediately recognize engine failure, engine fire, smoke, MAYDAY, PAN-PAN, medical emergency, bird strike and other distress. Do not answer every emergency with the same generic message. Explicitly name the reported emergency, acknowledge its priority, ask only for essential missing information (intentions, persons on board, fuel endurance), provide a specific response: engine failure = priority handling, maintain aircraft control, advise intentions, offer direct routing/nearest suitable airport using only supplied departure/destination; engine fire = declare MAYDAY, immediate priority landing, advise use of aircraft checklist, request souls/fuel, offer direct approach to supplied airport and state emergency equipment will be standing by; smoke = MAYDAY/PAN-PAN according to severity, priority landing and emergency services; medical = PAN-PAN unless pilot declares MAYDAY, priority handling and medical assistance on arrival; bird strike = assess damage/engine indications and advise intentions, offer return/landing. Keep emergency frequency 121.500 unless already on a station frequency and avoid unnecessary handoffs. On follow-up transmissions, remember the emergency type and progress it: acknowledge souls/fuel/intentions, issue priority vectors/approach, landing clearance, runway vacated instructions and emergency-services status. Never repeat the same initial emergency prompt on every turn. Never invent aircraft capabilities, engine count, exact position, nearest airport, taxiway, real weather or real traffic. The pilot flies; you have no Aerofly telemetry or real position. All weather, clearances, frequencies and traffic are fictional; never claim real-world authorization. Use only supplied airport runway data. Return only JSON with station, phase, frequency, atc, hint, explanation, state. Preserve state fields assignedDepartureRunway, assignedArrivalRunway, initialAltitude, heading, squawk, nextStation, atis and emergencyType, emergencyStage, emergencyAirport, personsOnBoard, fuelEndurance. ATIS is fictional and not synchronized with Aerofly. IMMERSION: maintain session-consistent fictional wind, visibility, ceiling and altimeter; vary them between flights. Traffic advisories may be simulated sparingly with callsign, relative direction and altitude, clearly fictional and never live radar. Readback monitoring is mandatory: compare runway, initial altitude, heading and squawk against assigned state; if any critical item is wrong, say NEGATIVE, correct only the wrong item and request a new readback. Do not accept a wrong runway, altitude or squawk. ILS: use a realistic sequence of vectors, localizer intercept, maintain assigned altitude until established, pilot-reported glideslope alive/captured, approach clearance and Tower handoff. Never invent published fixes or ILS frequencies; if unavailable say so. Controller style varies by station: concise clearance, practical Ground, crisp Tower, calm Center, measured Approach. Emergencies: engine fire, engine failure, smoke/fumes, bird strike, rapid decompression, hydraulic failure, electrical failure and radio failure each require a distinct response. Keep ATC within its role; tell pilot to use the aircraft checklist and maintain control, never substitute aircraft-specific emergency memory actions. Engine fire/serious smoke/major failure: acknowledge MAYDAY when declared or life-threatening, provide priority/direct routing to the supplied destination, request souls/fuel/intentions only when workload permits, coordinate Tower, Airport Operations and Airport Rescue and Fire Fighting (ARFF), and state fire/rescue vehicles are standing by. Engine failure: ask controllability and intentions, priority landing. Bird strike: ask about engine indications, vibration, damage and controllability; offer return and request Airport Operations inspection after landing. Smoke: prioritize landing and coordinate ARFF/medical response. Decompression: advise aircraft emergency descent/oxygen checklist, priority handling. Hydraulic/electrical: ask remaining controllability/systems and coordinate priority landing. Radio failure: advise squawk 7600 if able and applicable lost-communications procedures. After landing, Ground coordinates Airport Operations/ARFF, keeps other traffic clear, asks whether engines are shut down and whether it is safe for responders to approach. Do not claim responders arrived until the simulated stage confirms it. Never invent actual emergency capabilities, frequencies, traffic, weather or aircraft position. Preserve a structured flightLifecycle state across turns, including phase, station, groundOperation, approachStatus, transitionCount and telemetry status. Never pretend to receive simulator telemetry. Create a small session-persistent fictional traffic scenario with aircraft callsigns, types, operational stages (taxi, departure, climb, downwind, base, final) and altitude. Advance it between Center exchanges and label all advisories simulated, never live radar. For ILS, RNAV and visual approaches, progress only from pilot-reported indications and use published chart data only when supplied; never invent fixes, frequencies, altitudes or minima. Preserve nextStation and handoff intent across Clearance, Ground, Tower, Departure, Center, Approach and Ground after landing.";
function headers(){return {"Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin","Content-Type":"application/json; charset=utf-8"};}
function out(data,status){return new Response(JSON.stringify(data),{status:status||200,headers:headers()});}
function clean(v,n){return String(v==null?"":v).trim().slice(0,n||200);}
function apt(code){return AIRPORTS.find(a=>a[1]===code)||[code||"Unknown",code||"----",[]];}
function hdg(r){var m=String(r||"").match(/^([0-9]{1,2})/);return m?(Number(m[1])*10)%360:0;}
function runway(list,wind){if(!list||!list.length)return "";return list.slice().sort((a,b)=>Math.abs(((hdg(a)-wind+540)%360)-180)-Math.abs(((hdg(b)-wind+540)%360)-180))[0];}
function stateFrom(history,c){if(c.flightState)return c.flightState;for(var i=(history||[]).length-1;i>=0;i--){if(history[i].role==="model"){try{var x=JSON.parse(history[i].text);if(x.state)return x.state;}catch(e){}}}return {};}
function nextTrafficAdvisory(s){
 if(!Array.isArray(s.trafficScenario)){
  s.trafficScenario=[
   {callsign:"Skyhawk Five Two Kilo",aircraft:"Cessna 172",altitude:2500},
   {callsign:"Citation Seven Alpha Bravo",aircraft:"Citation CJ4",altitude:4500},
   {callsign:"Piper Three One Papa",aircraft:"Piper PA-28",altitude:1800}
  ];
  s.trafficTick=0;
 }
 s.trafficTick=(Number(s.trafficTick)||0)+1;
 const stages=["taxiing","departing","climbing","downwind","base","final"];
 const index=s.trafficTick%stages.length;
 const item=s.trafficScenario[index%s.trafficScenario.length];
 const stage=stages[index];
 return {callsign:item.callsign,aircraft:item.aircraft,altitude:item.altitude,stage,runway:s.assignedArrivalRunway||"assigned runway",runwayOccupied:stage==="base"||stage==="final",advisory:item.callsign+" ("+item.aircraft+") is "+stage+"; altitude "+item.altitude+" feet."};
}
function updateFlightLifecycle(s,phase,station,message){
 const previous=s.flightLifecycle&&s.flightLifecycle.phase||"Preflight";
 const normalized=String(phase||"Preflight");
 s.flightLifecycle={phase:normalized,station:String(station||"Clearance"),previousPhase:previous,lastPilotCall:String(message||"").slice(0,180),transitionCount:(Number(s.flightLifecycle&&s.flightLifecycle.transitionCount)||0)+(previous!==normalized?1:0),updatedAt:Date.now(),telemetry:"NOT_CONNECTED"};
 if(/taxi|pushback|start up/i.test(message||""))s.flightLifecycle.groundOperation="TAXI_OR_PUSHBACK";
 if(/holding short/i.test(message||""))s.flightLifecycle.groundOperation="HOLDING_SHORT";
 if(/airborne|positive rate|climbing|departure/i.test(message||""))s.flightLifecycle.groundOperation="AIRBORNE";
 if(/localizer|glideslope|established on final/i.test(message||""))s.flightLifecycle.approachStatus="IN_PROGRESS";
 if(/vacated|runway clear|parked|shut down/i.test(message||""))s.flightLifecycle.groundOperation="LANDED_OR_PARKED";
 if(/missed approach|go.?around/i.test(message||""))s.flightLifecycle.approachStatus="MISSED_APPROACH";
}
function core(message,c,history){
 const msg=String(message||"").toLowerCase(),from=c.origin||{},to=c.destination||{},dep=apt(from.icao),arr=apt(to.icao);
 const cs=clean(c.callsign||"November Niner Charlie Bravo",80),ac=clean(c.aircraft||"Learjet 45",50),s=stateFrom(history,c);
 const first=!s.assignedDepartureRunway;
 if(first){s.simWind=Math.floor(Math.random()*36)*10;s.simWindSpeed=4+Math.floor(Math.random()*13);s.simVisibility=["6 miles","8 miles","10 miles"][Math.floor(Math.random()*3)];s.simCeiling=["Few clouds at 4,000 feet","Scattered clouds at 5,000 feet","Broken clouds at 7,000 feet"][Math.floor(Math.random()*3)];s.simAltimeter=(29.70+Math.random()*0.45).toFixed(2);s.simTraffic=Math.random()<0.65?{callsign:["Skyhawk 52K","United 418","Citation 7AB","Cherokee 31P"][Math.floor(Math.random()*4)],altitude:[2500,4500,6500,8500][Math.floor(Math.random()*4)],direction:["northwest","southwest","east","south"][Math.floor(Math.random()*4)]}:null;s.assignedDepartureRunway=runway(dep[2],s.simWind);s.assignedArrivalRunway=runway(arr[2],s.simWind);s.initialAltitude=c.flightRules==="VFR"?"5,500 feet":"5,000 feet";s.heading=String(Math.floor(Math.random()*36)*10).padStart(3,"0");s.squawk=String(1000+Math.floor(Math.random()*7000));s.readback={clearance:false};}
 const dr=s.assignedDepartureRunway||"assigned runway",ar=s.assignedArrivalRunway||"assigned runway";
 let station=clean(c.station||"Clearance",24),phase=clean(c.phase||"Preflight",24),frequency=clean(c.frequency||"121.700",16),atc="",hint="",explanation="";
 const signoff=/\b(see ya|see you|goodbye|good bye|bye bye|thanks[, ]+(?:bye|goodbye)|thank you[, ]+(?:bye|goodbye)|switching (?:to )?(?:approach|tower|ground|departure|center)|contact(?:ing)? (?:approach|tower|ground|departure|center))\b/i.test(message);
 const engineFire=/\b(engine fire|engine on fire|fire in (the )?(left|right|number|no\.?\s*\d|one|two|three|four)?\s*engine|fire warning|engine is burning)\b/i.test(message);
 const engineFailure=/\b(engine failure|engine fail|engine out|lost (the )?engine|loss of (an )?engine|engine shutdown|power loss|dual engine)\b/i.test(message);
 const decompression=/\b(decompression|rapid descent|cabin pressure|pressurization failure)\b/i.test(message),hydraulic=/\b(hydraulic failure|hydraulics|hydraulic system)\b/i.test(message),electrical=/\b(electrical failure|electrical problem|electrics)\b/i.test(message),radioFailure=/\b(radio failure|lost communications|nordo|no radio)\b/i.test(message);
 const smoke=/\b(smoke|fumes|cabin smoke)\b/i.test(message),medical=/\b(medical|passenger sick|medical emergency)\b/i.test(message),bird=/\b(bird strike|birds?)\b/i.test(message);
 const declared=/\b(mayday|pan.?pan|emergency|declare( an)? emergency)\b/i.test(message);
 const hadEmergency=!!s.emergencyType, emergencyNow=engineFire||engineFailure||smoke||medical||bird||declared||hadEmergency;
 if(engineFire){s.emergencyType="ENGINE FIRE";s.emergencyStage="INITIAL";}
 else if(engineFailure){s.emergencyType="ENGINE FAILURE";s.emergencyStage="INITIAL";}
 else if(smoke){s.emergencyType="SMOKE";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(medical){s.emergencyType="MEDICAL";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(bird){s.emergencyType="BIRD STRIKE";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(decompression){s.emergencyType="RAPID DECOMPRESSION";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(hydraulic){s.emergencyType="HYDRAULIC FAILURE";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(electrical){s.emergencyType="ELECTRICAL FAILURE";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(radioFailure){s.emergencyType="RADIO FAILURE";s.emergencyStage=s.emergencyStage||"INITIAL";}
 else if(declared&&!s.emergencyType){s.emergencyType="GENERAL EMERGENCY";s.emergencyStage="INITIAL";}
 if(emergencyNow){
   const airportName=arr[0],runwayName=ar;
   const souls=/\b(\d{1,3})\s*(souls|persons|people|pax|passengers|on board)\b/i.exec(message);
   if(souls)s.personsOnBoard=souls[1];
   const fuel=/\b(\d+\s*(?:minutes?|hours?|hrs?))\b/i.exec(message)||/\b(?:fuel|endurance)\D{0,20}(\d+\s*(?:minutes?|hours?|hrs?))\b/i.exec(message);
   if(fuel)s.fuelEndurance=fuel[1]||fuel[2];
   const details=(s.personsOnBoard?" Souls on board "+s.personsOnBoard+".":" Confirm persons on board when able.")+(s.fuelEndurance?" Fuel endurance "+s.fuelEndurance+".":" Advise fuel endurance when able.");
   s.squawk="7700";phase="Emergency";
   if(s.emergencyStage==="INITIAL"||!s.emergencyStage){
     station="Tower";frequency="121.500";
     if(s.emergencyType==="ENGINE FIRE"){
       atc=`${cs}, MAYDAY acknowledged. Engine fire reported. Maintain aircraft control and carry out the aircraft's engine-fire checklist. ${airportName} is available for an immediate priority landing, runway ${runwayName}. Emergency and fire equipment will be standing by. Confirm intentions.${details}`;
       hint=`${cs}, MAYDAY, engine fire, request immediate landing ${airportName}, runway ${runwayName}.`;
       explanation="Fuego de motor: prioridad máxima, checklist del avión, aterrizaje inmediato y equipos de emergencia preparados.";
     }else if(s.emergencyType==="ENGINE FAILURE"){
       atc=`${cs}, MAYDAY acknowledged. Engine failure reported. Maintain control and advise whether the aircraft remains controllable and your intentions. ${airportName} is available for priority landing, runway ${runwayName}. Emergency equipment will be standing by.${details}`;
       hint=`${cs}, MAYDAY, engine failure, aircraft controllable, request priority landing ${airportName}, runway ${runwayName}.`;
       explanation="Falla de motor: ATC reconoce MAYDAY, ofrece prioridad para aterrizar y pregunta si el avión sigue controlable.";
     }else if(s.emergencyType==="SMOKE"){
       atc=`${cs}, distress call acknowledged. Smoke reported. Priority handling approved to ${airportName}, runway ${runwayName}. Declare MAYDAY if the situation is immediately life-threatening; otherwise PAN-PAN. Emergency services will be standing by.${details}`;
       hint=`${cs}, PAN-PAN, smoke in aircraft, request priority landing ${airportName}, runway ${runwayName}.`;
       explanation="Humo a bordo: prioridad, aterrizaje sin demora y servicios de emergencia.";
     }else if(s.emergencyType==="MEDICAL"){
       atc=`${cs}, PAN-PAN acknowledged. Medical emergency understood. Priority handling approved to ${airportName}, runway ${runwayName}. Medical assistance will be requested to meet the aircraft.${details}`;
       hint=`${cs}, PAN-PAN, medical emergency, request priority landing ${airportName}, runway ${runwayName}.`;
       explanation="Emergencia médica: prioridad de llegada y asistencia médica solicitada en tierra.";
     }else if(s.emergencyType==="BIRD STRIKE"){
       atc=`${cs}, bird strike reported, roger. Advise any engine indications, vibration or aircraft damage and confirm whether you wish to return or continue. ${airportName}, runway ${runwayName}, is available for priority landing if required.${details}`;
       hint=`${cs}, bird strike, checking aircraft, request return for landing if required.`;
       explanation="Impacto con ave: ATC pregunta por daños e indicaciones del motor y ofrece regreso prioritario.";
     }else if(s.emergencyType==="RAPID DECOMPRESSION"){
       atc=`${cs}, MAYDAY acknowledged. Rapid decompression reported. Maintain aircraft control and follow your aircraft emergency descent and oxygen procedures. Priority handling to ${airportName}, runway ${runwayName}; Airport Operations and ARFF will be coordinated.${details}`;hint=`${cs}, MAYDAY, rapid decompression, conducting emergency descent, request priority landing ${airportName}.`;explanation="Despresurización: procedimiento de descenso y oxígeno del avión, prioridad y coordinación de servicios.";
     }else if(s.emergencyType==="HYDRAULIC FAILURE"){
       atc=`${cs}, MAYDAY acknowledged. Hydraulic failure reported. Use the aircraft checklist and advise remaining flight-control and landing capability when able. Priority approach ${airportName}, runway ${runwayName}; Airport Operations and ARFF standing by.${details}`;hint=`${cs}, MAYDAY, hydraulic failure, request priority landing ${airportName}, runway ${runwayName}.`;explanation="Falla hidráulica: checklist, confirmar controlabilidad y preparar bomberos.";
     }else if(s.emergencyType==="ELECTRICAL FAILURE"){
       atc=`${cs}, electrical failure reported, roger. Advise remaining communications and aircraft systems when able. Priority handling to ${airportName}, runway ${runwayName}; Airport Operations and emergency services notified.${details}`;hint=`${cs}, electrical failure, request priority landing ${airportName}, runway ${runwayName}.`;explanation="Falla eléctrica: verificar sistemas disponibles y coordinar aterrizaje prioritario.";
     }else if(s.emergencyType==="RADIO FAILURE"){
       atc=`${cs}, radio failure noted. If able, squawk 7600 and follow the applicable lost-communications procedure and aircraft checklist. Tower will coordinate visual/light-gun procedures as appropriate; this is simulated ATC, not a real clearance.${details}`;hint=`${cs}, radio failure, squawking 7600 if able, following lost-communications procedures.`;explanation="Falla de radio: código 7600 si es posible y procedimiento de comunicaciones perdidas.";
     }else{
       atc=`${cs}, emergency acknowledged. State the nature of the emergency, aircraft controllability and your intentions. Priority handling is available to ${airportName}, runway ${runwayName}.${details}`;
       hint=`${cs}, MAYDAY, nature of emergency [state problem], request priority handling.`;
       explanation="ATC reconoce la emergencia y solicita naturaleza, controlabilidad, intenciones, personas a bordo y combustible.";
     }
     s.emergencyStage="ACKNOWLEDGED";s.nextStation="Approach";
   }else if(/\b(landed|on the ground|runway vacated|vacated|stopped|shut down)\b/i.test(msg)){
     station="Ground";frequency="121.900";s.emergencyStage="ON_GROUND";
     atc=`${cs}, roger. Ground has notified Airport Operations and Airport Rescue and Fire Fighting (ARFF). Fire and rescue vehicles are responding to your reported position. Keep the aircraft stopped; advise when engines are shut down and whether it is safe for responders to approach. Ground will keep other traffic clear and coordinate the response.`;
     hint=`${cs}, stopped, engines [running or shut down], awaiting emergency services.`;
     explanation="Después del aterrizaje, ATC coordina vehículos de emergencia y confirma que sea seguro acercarse.";
   }else if(s.emergencyStage==="ACKNOWLEDGED"){
     station="Approach";frequency="124.000";s.emergencyStage="APPROACH";
     atc=`${cs}, roger. Priority approach approved for ${airportName}, runway ${runwayName}. No delay expected. Position for final as required and report established. Tower, Airport Operations and ARFF have been advised; emergency equipment is standing by. Advise when ready for landing.`;
     hint=`${cs}, priority approach runway ${runwayName}, will report established on final.`;
     explanation="Aproximación prioritaria: pista asignada, sin demoras y equipos de emergencia preparados.";
     s.nextStation="Tower";
   }else if(s.emergencyStage==="APPROACH"){
     station="Tower";frequency="118.300";s.emergencyStage="LANDING";
     atc=`${cs}, runway ${runwayName}, cleared to land. Wind ${String(s.simWind||270).padStart(3,"0")} at ${s.simWindSpeed||6} knots. Emergency equipment is standing by. After landing, stop if necessary and advise your status; do not cross another runway until instructed.`;
     hint=`${cs}, cleared to land runway ${runwayName}.`;
     explanation="Autorización de aterrizaje con vehículos de emergencia en espera.";
     s.nextStation="Ground";
   }else{
     station="Ground";frequency="121.900";
     atc=`${cs}, roger. ${s.emergencyType} remains active; maintain priority handling. Advise any change in aircraft condition and confirm when the aircraft is safely stopped.`;
     hint=`${cs}, roger, emergency remains active, will advise when stopped.`;
     explanation="La emergencia permanece activa; ATC conserva el contexto y no repite el mensaje inicial.";
   }
 }else if(signoff){
   const targetStation=/approach/i.test(msg)?"Approach":/tower/i.test(msg)?"Tower":/ground/i.test(msg)?"Ground":/departure/i.test(msg)?"Departure":/center/i.test(msg)?"Center":"";
   const closings=["Roger, frequency change approved. Good day.","See you, good day. Thanks for the call.","Good day, have a safe flight.","Roger, contact the next controller as advised. Good day."];
   station=station||"ATC";atc=cs+", "+closings[Math.floor(Math.random()*closings.length)];
   if(targetStation)atc=cs+", roger, frequency change to "+targetStation+" approved. Good day.";
   hint="Frequency change acknowledged, "+cs+". Have a good day.";
   explanation="Despedida natural del controlador al cerrar la frecuencia o confirmar el cambio a la siguiente dependencia.";
 }else if(/\b(go.?around|going around|missed approach)\b/i.test(msg)){
   station="Tower";phase="Go-Around";frequency="118.300";atc=cs+", roger, go-around. Runway track, climb to 3,000 feet, maintain runway heading. Advise when established in the climb; expect further instructions from Approach.";hint=cs+", going around, runway track, climbing to 3,000 feet.";explanation="Go-around reconocido: ascenso, rumbo de pista y coordinación para nueva aproximación.";s.nextStation="Approach";
 }else if(/atis|information|weather/i.test(msg)||station==="ATIS"){
   station="ATIS";s.atis=s.atis&&s.atis.airport===dep[1]?s.atis:{airport:dep[1],information:String.fromCharCode(65+Math.floor(Math.random()*8)),wind:String(s.simWind||270).padStart(3,"0")+" at "+(s.simWindSpeed||6)+" knots",visibility:s.simVisibility||"10 miles",temperature:(17+Math.floor(Math.random()*12))+" degrees Celsius",runway:dr,conditions:s.simCeiling||"Few clouds",altimeter:s.simAltimeter||"29.92"};atc=`${dep[0]} information ${s.atis.information}. Wind ${s.atis.wind}. Visibility ${s.atis.visibility}. ${s.atis.conditions}. Temperature ${s.atis.temperature}. Altimeter ${s.atis.altimeter}. Runway ${dr} in use. Advise you have information ${s.atis.information}. Simulated ATIS.`;hint=`Information ${s.atis.information} received, ${cs}.`;explanation="ATIS ficticio, no sincronizado con el clima de Aerofly.";frequency="126.000";
 }else if(first||/request clearance|clearance|ifr clearance|vfr clearance/.test(msg)||(station==="Clearance"&&phase==="Preflight")){
   station="Clearance";phase="Preflight";frequency="121.700";atc=`${cs}, clearance copied. Cleared to ${arr[0]} airport, ${c.flightRules||"IFR"} departure. Expect runway ${dr}. Initial climb ${s.initialAltitude}; expect ${c.requestedAltitude||"requested cruise altitude"} after departure. Squawk ${s.squawk}. Advise when ready for pushback and start. Read back destination, runway, initial altitude and transponder.`;hint=`${cs}, cleared to ${arr[0]}, runway ${dr}, initial altitude ${s.initialAltitude}, squawk ${s.squawk}. Ready for pushback.`;explanation="Readback completo: destino, pista, altitud inicial y transponder.";
 }else if(station==="Clearance"&&!s.readback.clearance&&/readback|squawk|runway|altitude|cleared to/.test(msg)){
   const runwayMatch=/runway\s+([0-9]{1,2}[lrc]?)/i.exec(message),squawkMatch=/squawk\s+(\d{4})/i.exec(message);
   const wrongRunway=runwayMatch&&runwayMatch[1].toUpperCase()!==String(dr).toUpperCase(),wrongSquawk=squawkMatch&&squawkMatch[1]!==String(s.squawk);
   if(wrongRunway||wrongSquawk){atc=cs+", negative. "+(wrongRunway?"Assigned runway is "+dr+". ":"")+(wrongSquawk?"Correct squawk is "+s.squawk+". ":"")+"Correct your readback, please.";hint="Correct readback: runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+".";explanation="Readback incorrecto detectado: el controlador corrige pista o squawk antes de continuar.";}
   else{s.readback.clearance=true;atc=cs+", readback correct. Clearance confirmed. Contact Ground when ready for pushback.";hint="Readback correct, contact Ground when ready.";explanation="Readback de pista y transponder aceptado.";}station="Clearance";phase="Preflight";frequency="121.700";
 }else if(/taxi|ready to taxi|pushback|parking|start up/.test(msg)||station==="Ground"||phase==="Taxi"){
   station="Ground";phase="Taxi";frequency="121.900";atc=`${cs}, Ground. Pushback and start approved if required. Taxi to the holding point for runway ${dr} via published airport taxiways; give way to traffic, use caution near other aircraft and hold short of runway ${dr}. Report holding short and ready for departure. Taxiway routing is not verified in this database.`;hint=`${cs}, pushback and start approved, taxi to holding point runway ${dr}, hold short, will report holding short.`;explanation="Rodaje con pushback, precaución, tráfico y punto de espera; sin inventar taxiways.";
 }else if(/holding short|ready for departure|ready for takeoff|takeoff/.test(msg)||station==="Tower"||phase==="Takeoff"){
 station="Tower";phase="Takeoff";frequency="118.300";
 const traffic=nextTrafficAdvisory(s);
 if(traffic.runwayOccupied){
  atc=cs+", Tower. Hold short runway "+dr+"; simulated landing traffic is on "+traffic.stage+". Expect departure clearance when the runway is confirmed clear.";
  hint=cs+", holding short runway "+dr+", awaiting clearance.";
  explanation="Separación simulada: Tower retiene la autorización mientras hay tráfico en base o final.";
  s.runwayStatus="OCCUPIED_OR_TRAFFIC_FINAL";
 }else{
  atc=cs+", Tower. Runway "+dr+"; wind "+String(s.simWind||270).padStart(3,"0")+" at "+(s.simWindSpeed||6)+" knots. Runway "+dr+", cleared for takeoff. After departure, fly runway heading and contact Departure on 124.600 when airborne. Simulated traffic: "+traffic.advisory;
  hint=cs+", runway "+dr+", cleared for takeoff, runway heading, contact Departure 124.600 airborne.";
  explanation="Autorización de despegue con viento, tráfico simulado y transferencia a Departure.";
  s.runwayStatus="TAKEOFF_CLEARANCE_ISSUED";s.nextStation="Departure";
 }
 }else if(/departure|airborne|passing|climbing/.test(msg)||phase==="Departure"){
   station="Departure";phase="Departure";frequency="124.600";atc=`${cs}, Departure, radar contact. Continue climb and maintain ${c.requestedAltitude||"FL350"}. Turn heading ${s.heading} when able; advise passing 3,000 feet. Contact Oakland Center on 127.000 when advised.`;hint=`${cs}, radar contact, climbing to ${c.requestedAltitude||"FL350"}, heading ${s.heading}.`;explanation="Departure confirma contacto radar, ascenso y rumbo asignado.";s.nextStation="Center";
 }else if(/center|cruise|maintaining|level/.test(msg)||phase==="Cruise"||station==="Center"){
   station="Center";phase="Cruise";frequency="127.000";atc=`${cs}, Oakland Center, radar contact. Maintain ${c.requestedAltitude||"FL350"}. Report reaching cruise altitude. ${(()=>{const t=nextTrafficAdvisory(s);return "Simulated traffic advisory: "+t.advisory+" Report traffic in sight if visual."})()} Expect descent in approximately 40 miles; advise when ready. Maintain present heading unless otherwise instructed.`;hint=`${cs}, Oakland Center, maintaining ${c.requestedAltitude||"FL350"}, standing by for descent.`;explanation="En ruta: confirma nivel, escucha información de tráfico y espera instrucciones de descenso.";if(/ready to descend|request descent|descending/.test(msg)){station="Approach";phase="Approach";frequency="124.000";atc=`${cs}, descend and maintain 6,000 feet. Expect runway ${ar} at ${arr[0]}. Advise when leaving your current altitude and contact ${arr[0]} Approach on 124.000.`;hint=`${cs}, descend and maintain 6,000 feet, expect runway ${ar}.`;s.nextStation="Approach";}
 }else if(/approach|inbound|descending|established|localizer|glideslope|glide slope|rn[a]?v|visual approach|final approach|missed approach|go.?around/.test(msg)||phase==="Approach"||station==="Approach"){
 station="Approach";phase="Approach";frequency="124.000";
 if(/missed approach|go.?around|going around/.test(msg)){
  s.approachStage="MISSED_APPROACH";phase="Go-Around";station="Tower";frequency="118.300";
  atc=cs+", roger, missed approach. Fly the published missed-approach procedure from your chart; if unavailable, advise intentions and maintain aircraft control. Expect vectors from Approach. Traffic is being resequenced.";
  hint=cs+", going around, flying published missed approach, request vectors.";
  explanation="Aproximación frustrada: sigue la carta publicada; el simulador no inventa fixes ni altitudes.";
  s.nextStation="Approach";
 }else if(/localizer (captured|established|alive)|established on the localizer/.test(msg)){
  s.approachStage="LOCALIZER";
  atc=cs+", roger, localizer established. Maintain 3,000 feet until glideslope intercept unless your published procedure specifies otherwise. Report glideslope alive.";
  hint=cs+", localizer established, maintaining 3,000 feet, will report glideslope alive.";
  explanation="Localizador confirmado; mantener altitud asignada hasta interceptar la senda según la carta.";
 }else if(/glideslope (alive|captured)|glide slope (alive|captured)|on the glide/.test(msg)){
  s.approachStage="GLIDESLOPE";
  atc=cs+", roger, glideslope reported. Continue the published approach and report established on final. Do not descend below charted minima.";
  hint=cs+", glideslope reported, continuing published approach, will report established on final.";
  explanation="Senda de planeo reportada; respetar mínimos publicados.";
 }else if(/established on final|on final|final approach/.test(msg)){
  s.approachStage="FINAL";
  atc=cs+", roger, established on final runway "+ar+". Contact Tower on 118.300 and report callsign, runway and approach type.";
  hint=cs+", established on final runway "+ar+", contacting Tower 118.300.";
  explanation="Final confirmada y transferencia a Tower.";
  s.nextStation="Tower";
 }else if(/rn[a]?v/.test(msg)){
  s.approachStage="RNAV";
  atc=cs+", RNAV approach acknowledged runway "+ar+". Use the published RNAV procedure and charted altitudes; no waypoint or procedure data is loaded in this simulator. Report established on final.";
  hint=cs+", RNAV approach runway "+ar+", flying published procedure, will report established.";
  explanation="RNAV: usar carta publicada; no se inventan waypoints ni restricciones.";
 }else if(/visual approach/.test(msg)){
  s.approachStage="VISUAL";
  atc=cs+", visual approach acknowledged runway "+ar+". Maintain visual separation as applicable and report established on final. Contact Tower on 118.300 when advised.";
  hint=cs+", visual approach runway "+ar+", will report established on final.";
  explanation="Aproximación visual simulada y transferencia posterior a Tower.";
 }else{
  s.approachStage=s.approachStage||"VECTORS";
  atc=cs+", "+arr[0]+" Approach, radar contact. Descend and maintain 6,000 feet, expect runway "+ar+". For an ILS, expect vectors to intercept the localizer; maintain assigned altitude until established and report localizer alive, then glideslope alive. Use published chart data for fixes, frequencies and minima.";
  hint=cs+", descending to 6,000 feet, expect runway "+ar+", will report localizer established.";
  explanation="Secuencia por etapas: vectores, localizador, senda de planeo y final. Las cartas aportan frecuencias, fixes y mínimos.";
 }
 s.nextStation="Tower";
 }else if(/land|final|tower|vacated|runway/.test(msg)||phase==="Landing"){
   station="Tower";phase="Landing";frequency="118.300";atc=`${cs}, Tower. Runway ${ar}, cleared to land. Wind ${String(s.simWind||270).padStart(3,"0")} at 6 knots. After landing, vacate when able; hold clear of the runway and contact Ground on 121.900. Advise runway vacated.`;hint=`${cs}, cleared to land runway ${ar}, will vacate and contact Ground 121.900.`;explanation="Autorización de aterrizaje con viento e instrucciones para liberar pista.";s.nextStation="Ground";
 }else{atc=`${cs}, say again, please. ${station} is standing by. State your position and request.`;hint=`${station}, ${cs}, say again with your position and request.`;explanation="No identifiqué tu intención; repite la llamada con posición e intención.";}
 updateFlightLifecycle(s,phase,station,message);return {station,phase,frequency,atc,hint,explanation,state:s,flightLifecycle:s.flightLifecycle,trafficMode:"SIMULATED",engine:"AEROFLY ATC CORE"};
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
