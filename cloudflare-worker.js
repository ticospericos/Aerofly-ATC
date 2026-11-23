const ALLOWED_ORIGIN="https://ticospericos.github.io";
const AIRPORTS=[
["Monterey Regional","KMRY",["28L","28R","01L","01R"]],["Salinas Municipal","KSNS",["31","26","08","13"]],["Hollister Municipal","KCVH",["31","24","13","06"]],["Watsonville Municipal","KWVI",["20","06","02","27"]],["San Martin Airport","KE16",["14","32"]],["Reid-Hillview","KRHV",["13L","13R","31L","31R"]],["San José Mineta International","KSJC",["30L","30R","12L","12R"]],["Modesto City-County","KMOD",["28L","28R","10L","10R"]],["Moffett Federal Airfield","KNUQ",["32L","32R","14L","14R"]],["Palo Alto","KPAO",["13","31"]],["Tracy Municipal","KTCY",["30","26","12","08"]],["Stockton Metropolitan","KSCK",["29L","29R","11L","11R"]],["Livermore Municipal","KLVK",["25L","25R","07L","07R"]],["San Carlos","KSQL",["12","30"]],["Half Moon Bay","KHAF",["12","30"]],["San Francisco International","KSFO",["01L","01R","28L","28R","10L","10R","19L","19R"]],["Hayward Executive","KHWD",["28L","28R","10L","10R"]],["Oakland International","KOAK",["30","12","28L","28R","10L","10R","33","15"]],["Byron Airport","KC83",["30","23","12","05"]],["Buchanan Field","KCCR",["01L","01R","32L","32R","19L","19R","14L","14R"]],["Lodi Airport","K1O3",["30","26","12","08"]],["Rio Vista Municipal","KO88",["33","25","07","15"]],["Gnoss Field (Novato)","KDVO",["13","31"]],["Petaluma Municipal","KO69",["11","29"]],["Napa County","KAPC",["06","01L","01R","24","19L","19R"]],["Charles M. Schulz Sonoma County","KSTS",["02","32","20","14"]],["Angwin-Parrett Field","K203",["16","34"]],["Travis Air Force Base","KSUU",["03L","03R","21R","32","21-2","21L"]],["Nut Tree","KVCB",["02","20"]],["Yolo County Airport","KDWA",["16","34"]],["University Airport","KEDU",["35","17"]],["Sacramento Executive","KSAC",["02","30","20","12"]],["Sacramento Mather","KMHR",["04L","04R","22L","22R"]],["Sacramento International","KSMF",["35L","35R","17L","17R"]]
];
function headers(){return {"Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"POST, GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization","Vary":"Origin","Content-Type":"application/json; charset=utf-8"};}
function out(data,status){return new Response(JSON.stringify(data),{status:status||200,headers:headers()});}
function clean(v,n){return String(v==null?"":v).trim().slice(0,n||200);}

function apt(code){return AIRPORTS.find(a=>a[1]===code)||[code||"Unknown",code||"----",[]];}
function hdg(r){var m=String(r||"").match(/^([0-9]{1,2})/);return m?(Number(m[1])*10)%360:0;}
function runway(list,wind){if(!list||!list.length)return "";return list.slice().sort((a,b)=>Math.abs(((hdg(a)-wind+540)%360)-180)-Math.abs(((hdg(b)-wind+540)%360)-180))[0];}
function seededNumber(seed,max){var h=2166136261;for(var i=0;i<String(seed||"flight").length;i++){h^=String(seed||"flight").charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)%max;}
function makeWeather(seed){
 var directions=[0,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350];
 var windDirection=directions[seededNumber(seed+":wind",directions.length)];
 var windSpeed=4+seededNumber(seed+":speed",13);
 var visibilityOptions=["6 miles","7 miles","8 miles","9 miles","10 miles"];
 var conditions=["Few clouds","Scattered clouds","Broken clouds","Clear skies"];
 var altimeter=(29.70+seededNumber(seed+":altimeter",61)/100).toFixed(2);
 return {windDirection:windDirection,windSpeed:windSpeed,wind:windDirection+" at "+windSpeed+" knots",visibility:visibilityOptions[seededNumber(seed+":visibility",visibilityOptions.length)],conditions:conditions[seededNumber(seed+":conditions",conditions.length)],altimeter:altimeter,information:"Alpha",simulated:true};
}
function stateFrom(history,c){if(c.flightState&&typeof c.flightState==="object"&&Object.keys(c.flightState).length)return c.flightState;for(var i=(history||[]).length-1;i>=0;i--){if(history[i].role==="model"){try{var x=JSON.parse(history[i].text);if(x.state)return x.state;}catch(e){}}}return {};}
function aircraftProfile(name,rules){
 var key=String(name||"").toLowerCase(),vfr=String(rules||"IFR").toUpperCase()==="VFR";
 if(key.indexOf("cessna")>=0||key.indexOf("172")>=0)return {name:"Cessna 172",category:"single-engine piston",initialAltitude:vfr?"3,500 feet":"3,000 feet",cruiseAltitude:vfr?"6,500 feet":"7,000 feet",approachSpeed:"90 knots",climbProfile:"Expect a gradual climb; allow time to reach assigned altitude",approachProfile:"Expect a stabilized visual or instrument approach at light-aircraft speeds"};
 if(key.indexOf("a320")>=0||key.indexOf("airbus")>=0)return {name:"Airbus A320",category:"twin-engine jet",initialAltitude:"5,000 feet",cruiseAltitude:"28,000 feet",approachSpeed:"180 knots",climbProfile:"Expect a managed jet climb; comply with each intermediate altitude restriction",approachProfile:"Expect a stabilized jet approach; reduce speed as instructed"};
 return {name:"Learjet 45",category:"business jet",initialAltitude:"5,000 feet",cruiseAltitude:"25,000 feet",approachSpeed:"160 knots",climbProfile:"Expect a high-performance business-jet climb; comply with intermediate altitude restrictions",approachProfile:"Expect a stabilized business-jet approach; reduce speed as instructed"};
}
function spokenDigits(text){
 var map={zero:"0",oh:"0",one:"1",two:"2",three:"3",four:"4",five:"5",six:"6",seven:"7",eight:"8",nine:"9",niner:"9"};
 var value=String(text||"").toLowerCase().replace(/\b(zero|oh|one|two|three|four|five|six|seven|eight|nine|niner)\b/g,function(x){return map[x];}).replace(/\b(\d)\s+thousand\b/g,function(_,n){return String(Number(n)*1000);}).replace(/,/g,"");
 for(var i=0;i<3;i++)value=value.replace(/\b(\d+)\s+(\d+)\b/g,"$1$2");
 return value;
}
function readbackCheck(message,s){
 var n=spokenDigits(message),assigned=s.assignedDepartureRunway||"",result={ok:true,missing:[],errors:[]};
 var runwayMatch=n.match(/\brunway\s*(\d{1,2})\s*(left|right|center)?\b/);
 var runwayRead=runwayMatch?runwayMatch[1]+(runwayMatch[2]?runwayMatch[2][0].toUpperCase():""):"";
 var squawkMatch=n.match(/\bsquawk\s*(\d{4})\b/);
 var altMatch=n.match(/\b(?:initial altitude|altitude|maintain|climb(?:ing)?(?: and maintain)?)\s*(\d{4,6})\s*(?:feet|ft)?\b|\b(\d{4,6})\s*(?:feet|ft)\b/);
 var altitudeRead=altMatch?(altMatch[1]||altMatch[2]).replace(/,/g,""):"";
 if(!runwayRead)result.missing.push("runway "+assigned);
 else if(runwayRead!==assigned)result.errors.push("runway "+runwayRead+" (assigned "+assigned+")");
 if(!altitudeRead)result.missing.push("initial altitude "+s.initialAltitude);
 else if(Number(altitudeRead)!==Number(String(s.initialAltitude||"").replace(/[^0-9]/g,"")))result.errors.push("altitude "+altitudeRead+" feet (assigned "+s.initialAltitude+")");
 if(!squawkMatch)result.missing.push("squawk "+s.squawk);
 else if(squawkMatch[1]!==String(s.squawk))result.errors.push("squawk "+squawkMatch[1]+" (assigned "+s.squawk+")");
 result.ok=!result.missing.length&&!result.errors.length;return result;
}
function core(message,c,history){
 var msg=String(message||"").toLowerCase(),from=c.origin||{},to=c.destination||{},dep=apt(from.icao),arr=apt(to.icao);
 var cs=clean(c.callsign||"November Niner Charlie Bravo",80),ac=clean(c.aircraft||"Learjet 45",50),s=stateFrom(history,c);
 var emergency=/\b(mayday|pan.?pan|engine fail|engine out|fire|smoke|medical|bird strike|emergency)\b/i.test(message);
 var called="";
 var calls=[["Clearance",/\b(clearance delivery|clearance)\b/i],["Ground",/\bground\b/i],["Tower",/\btower\b/i],["Departure",/\bdeparture\b/i],["Center",/\b(center)\b/i],["Approach",/\bapproach\b/i],["ATIS",/\b(atis|information)\b/i],["Unicom",/\b(unicom|traffic)\b/i]];
 for(var ci=0;ci<calls.length;ci++){if(calls[ci][1].test(msg)){called=calls[ci][0];break;}}
 var stage=s.stage||"Preflight";
 s.flightId=clean(c.flightId||s.flightId,100);
 s.stateVersion=2;
 if(!called){
  if(stage==="ClearedToTaxi"&&/\b(ready to taxi|request taxi|taxi clearance|taxi)\b/i.test(msg))called="Ground";
  else if((stage==="Taxi"||stage==="HoldingShort")&&/\b(ready for departure|ready for takeoff|request takeoff|ready for take.?off)\b/i.test(msg))called="Tower";
  else if(stage==="Taxi"&&/\b(holding short|at the hold short|short of runway|at the runway)\b/i.test(msg))called="Ground";
  else if(stage==="Takeoff"&&/\b(airborne|passing|climbing|off the ground|just departed)\b/i.test(msg))called="Departure";
  else if(stage==="Departure"&&/\b(established en.?route|level at|leveling at|cruise altitude|contact center|center)\b/i.test(msg))called="Center";
  else if(stage==="Cruise"&&/\b(request descent|ready to descend|descending|inbound|request approach|approach)\b/i.test(msg))called="Approach";
  else if(stage==="Approach"&&/\b(go.?around|going around|missed approach)\b/i.test(msg))called="Tower";
  else if(stage==="Landing"&&/\b(vacated|clear of runway|runway clear|off the runway)\b/i.test(msg))called="Ground";
  else if(stage==="TaxiIn"&&/\b(parked|at parking|at the gate|shut down|shutdown)\b/i.test(msg))called="Ground";
 }
 var first=!s.assignedDepartureRunway;
 if(first){
  s.weather=makeWeather(s.flightId||[from.icao,to.icao,ac].join("-"));
  s.simWind=s.weather.windDirection;
  s.assignedDepartureRunway=runway(dep[2],s.simWind);
  s.assignedArrivalRunway=runway(arr[2],s.simWind);
  s.atis=s.atis||{airport:dep[1],information:"Alpha"};
  s.aircraftProfile=aircraftProfile(ac,c.flightRules);
  s.initialAltitude=s.aircraftProfile.initialAltitude;
  s.assignedCruiseAltitude=s.aircraftProfile.cruiseAltitude;
  s.approachSpeed=s.aircraftProfile.approachSpeed;
  s.squawk=String(1000+Math.floor(Math.random()*7000));
  s.stage="Preflight";
  s.initialized=true;
 }
 if(!s.aircraftProfile){
  s.aircraftProfile=aircraftProfile(ac,c.flightRules);
  s.initialAltitude=s.initialAltitude||s.aircraftProfile.initialAltitude;
  s.assignedCruiseAltitude=s.assignedCruiseAltitude||s.aircraftProfile.cruiseAltitude;
  s.approachSpeed=s.approachSpeed||s.aircraftProfile.approachSpeed;
 }
 if(Array.isArray(c.plannedRoute)&&c.plannedRoute.length){
  s.routeWaypoints=c.plannedRoute.map(function(item){return clean(item,10).toUpperCase();}).filter(Boolean).slice(0,40);
  if(!Number.isInteger(s.routeIndex))s.routeIndex=0;
 }
 if(!Array.isArray(s.routeWaypoints))s.routeWaypoints=[];
 var dr=s.assignedDepartureRunway||"assigned runway",ar=s.assignedArrivalRunway||"assigned runway";
 var station=called||(first?"Clearance":clean(c.station||s.lastStation||"Clearance",24));
 var phase=clean(c.phase||s.phase||"Preflight",24),frequency="",atc="",hint="",explanation="";
 if(emergency){
  station=called&&called!=="ATIS"?called:"Tower";phase="Emergency";frequency="121.500";
  atc=cs+", emergency acknowledged. Squawk 7700 if able. State your intentions, persons on board and fuel endurance. Maintain present heading and altitude if able. Emergency frequency 121.500 is available.";
  hint=cs+", MAYDAY/PAN-PAN, "+ac+", "+clean(message,120)+". Request immediate assistance.";
  explanation="Declara la emergencia e informa naturaleza, intenciones, personas a bordo y combustible.";
  s.stage="Emergency";
 } else if(station==="ATIS"){
  var useArrival=/\b(destination|arrival|inbound|approach)\b/i.test(msg);
  var atisApt=useArrival?arr:dep;
  var atisRunway=useArrival?ar:dr;
  var atisKey=atisApt[1],weather=s.weather||makeWeather(s.flightId||[from.icao,to.icao,ac].join("-"));
  s.weather=weather;
  s.atis={airport:atisKey,information:weather.information,wind:weather.wind,visibility:weather.visibility,altimeter:weather.altimeter,runway:atisRunway,conditions:weather.conditions};
  frequency="126.000";atc=atisApt[0]+" information "+weather.information+". Wind "+weather.wind+". Visibility "+weather.visibility+". "+weather.conditions+". Altimeter "+weather.altimeter+". Runway "+atisRunway+" in use. Advise you have information "+weather.information+". Simulated ATIS.";
  hint="Information "+weather.information+" received, "+cs+".";explanation="ATIS meteorológico ficticio generado para esta sesión. No está sincronizado con el clima real ni con Aerofly.";
 } else if(station==="Clearance"){
  phase="Preflight";frequency="121.700";
  if(s.stage==="ClearedToTaxi"&&!/\b(repeat|say again|say that again|unable to copy)\b/i.test(msg)){
   var check=readbackCheck(message,s);
   if(check.errors.length){
    s.readbackStatus="correction-required";s.readbackPending=true;
    atc=cs+", negative. Check your readback: "+check.errors.join("; ")+". The assigned clearance remains runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+". Say again.";
    hint=cs+", runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+".";
    explanation="El readback contiene datos incorrectos. La autorización original sigue vigente; corrige los datos indicados.";
   } else if(check.missing.length){
    s.readbackStatus="incomplete";s.readbackPending=true;
    atc=cs+", say again. Read back runway "+dr+", initial altitude "+s.initialAltitude+", and squawk "+s.squawk+".";
    hint=cs+", runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+".";
    explanation="Faltan datos en la lectura de vuelta. Confirma pista, altitud inicial y código transponder.";
   } else {
    s.readbackStatus="verified";s.readbackPending=false;s.clearanceReadbackVerified=true;
    atc=cs+", readback correct. Contact Ground on 121.900 when ready to taxi.";
    hint=cs+", readback correct, contacting Ground when ready to taxi.";
    explanation="Readback verificado: pista, altitud inicial y squawk coinciden con la autorización.";
   }
  } else {
   s.stage="ClearedToTaxi";
   atc=cs+", cleared to "+arr[0]+" airport, "+(c.flightRules||"IFR")+" departure. Runway "+dr+". Initial altitude "+s.initialAltitude+". Expect further clearance after departure. Squawk "+s.squawk+". Advise when ready to taxi.";
   hint=cs+", cleared to "+arr[0]+", runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+". Ready to taxi.";
   explanation="Lee de vuelta destino, pista, altitud inicial y código transponder.";
  }
 } else if(station==="Ground"){
  frequency="121.900";
  if(/\b(request pushback|pushback and start|request start|engine start|start-up|startup)\b/i.test(msg)&&s.stage!=="HoldingShort"&&s.stage!=="Takeoff"&&s.stage!=="Landing"&&s.stage!=="TaxiIn"&&s.stage!=="Parked"){
   phase="Ground Operations";s.stage="Pushback";
   atc=cs+", pushback and engine start approved. Start at your discretion and advise when pushback is complete. Use the pushback guidance in your simulator.";
   hint=cs+", pushback and engine start approved, will advise when pushback is complete, "+cs+".";
   explanation="Autorización de pushback y arranque simulada. Sigue las indicaciones visuales de Aerofly; no se genera una ruta física.";
  } else if(s.stage==="Pushback"&&!/\b(pushback complete|pushback completed|ready to taxi|ready for taxi)\b/i.test(msg)){
   phase="Ground Operations";s.stage="Pushback";
   atc=cs+", pushback remains approved. Complete pushback and engine start, then advise when ready to taxi.";
   hint=cs+", pushback in progress, will advise when complete, "+cs+".";
   explanation="El estado de pushback se conserva hasta que confirmes que terminó.";
  } else if(s.stage==="Pushback"&&/\b(pushback complete|pushback completed|ready to taxi|ready for taxi)\b/i.test(msg)){
   phase="Taxi";s.stage="Taxi";
   atc=cs+", roger, pushback complete. Taxi to runway "+dr+" and hold short. Follow the taxiway markings shown in your simulator. Contact Tower on 118.300 when holding short.";
   hint=cs+", taxi to runway "+dr+", hold short, "+cs+".";
   explanation="Pushback completado. Sigue únicamente las calles y señales visibles en Aerofly.";
  } else if(s.stage==="Parked"||/\b(parked|at parking|at the gate|shut down|shutdown)\b/i.test(msg)){
   phase="Parked";s.stage="Parked";
   atc=cs+", parking acknowledged. Frequency change approved. Good day.";
   hint=cs+", parking completed, frequency change approved.";
   explanation="Vuelo finalizado. El controlador confirma que ya estás estacionado.";
  } else if(s.stage==="Landing"||/\b(vacated|clear of runway|runway clear|off the runway)\b/i.test(msg)){
   phase="Taxi In";s.stage="TaxiIn";
   atc=cs+", roger, runway vacated. Taxi to parking via the taxiways and markings shown in your simulator. Monitor Ground on 121.900.";
   hint=cs+", taxi to parking, "+cs+".";
   explanation="Después de liberar la pista, sigue las calles señalizadas en Aerofly hasta el estacionamiento.";
  } else if(s.stage==="TaxiIn"){
   phase="Taxi In";s.stage="TaxiIn";
   atc=cs+", continue taxi to parking via the taxiways and markings shown in your simulator. Advise when parked.";
   hint=cs+", continuing to parking, will advise when parked, "+cs+".";
   explanation="Continúa hasta tu posición de estacionamiento y avisa cuando estés detenido.";
  } else if(s.stage==="HoldingShort"||/\b(holding short|at the hold short|short of runway|at the runway)\b/i.test(msg)){
   phase="Holding Short";s.stage="HoldingShort";
   atc=cs+", roger, holding short runway "+dr+". Contact Tower on 118.300 when ready for departure.";
   hint=cs+", holding short runway "+dr+", will contact Tower when ready, "+cs+".";
   explanation="Mantén posición antes de la pista. Cuando estés listo, llama a Tower.";
  } else if(s.stage==="Taxi"){
   phase="Taxi";s.stage="Taxi";
   atc=cs+", roger. Continue as instructed and report when holding short.";
   hint=cs+", continuing as instructed, will report holding short, "+cs+".";
   explanation="El controlador confirma tu lectura de vuelta sin repetir toda la autorización de rodaje.";
  } else {
   phase="Taxi";s.stage="Taxi";
   atc=cs+", runway "+dr+" is assigned. Taxi to runway "+dr+" and hold short. Contact Tower on 118.300 when holding short and ready for departure.";
   hint=cs+", taxi to runway "+dr+", hold short, "+cs+".";
   explanation="Lee de vuelta la pista asignada y mantén posición antes de entrar en ella.";
  }
 } else if(station==="Tower"){
  frequency="118.300";
  if(/\b(go.?around|going around|missed approach)\b/i.test(msg)){
   phase="Go-Around";s.stage="Departure";s.initialAltitude="3,000 feet";
   atc=cs+", roger, go-around. Fly runway heading, climb and maintain 3,000 feet. Contact Departure on 124.600.";
   hint=cs+", going around, runway heading, climbing to 3,000 feet, contact Departure 124.600, "+cs+".";
   explanation="Procedimiento simulado de aproximación frustrada. Mantén rumbo de pista y contacta Departure.";
  } else if(s.stage==="Landing"&&/\b(landed|touchdown|on the runway|rolling out)\b/i.test(msg)){
   phase="Landing";s.stage="Landing";
   atc=cs+", roger, continue to taxi clear of the runway when able. Contact Ground on 121.900 when clear.";
   hint=cs+", continuing rollout, will contact Ground when clear, "+cs+".";
   explanation="Continúa la carrera de aterrizaje y libera la pista cuando sea seguro.";
  } else if(s.stage==="Approach"&&s.approachVectorStage==="Final"&&/\b(established on final|on final|final approach|runway in sight|visual approach)\b/i.test(msg)){
   phase="Landing";s.stage="Landing";
   atc=cs+", runway "+ar+", cleared to land. Wind "+((s.weather&&s.weather.wind)||"variable")+". After landing, vacate when able and contact Ground on 121.900.";
   hint=cs+", cleared to land runway "+ar+", "+cs+".";
   explanation="Autorización de aterrizaje simulada. Después de liberar la pista, contacta Ground.";
  } else if(s.stage==="Approach"){
   phase="Approach";s.stage="Approach";station="Approach";frequency="124.000";
   atc=cs+", remain with "+arr[0]+" Approach. Landing clearance is not available yet. Report established on final to Approach, then contact Tower.";
   hint=cs+", remaining with Approach, will report established on final, "+cs+".";
   explanation="Tower no emite autorización de aterrizaje hasta que Approach confirme la secuencia final simulada.";
  } else if(/\b(vacated|clear of runway|runway clear|off the runway)\b/i.test(msg)){
   station="Ground";frequency="121.900";phase="Taxi In";s.stage="TaxiIn";
   atc=cs+", roger, runway vacated. Taxi to parking via the taxiways and markings shown in your simulator. Monitor Ground on 121.900.";
   hint=cs+", taxi to parking, "+cs+".";
   explanation="Sigue las calles señalizadas en Aerofly hasta el estacionamiento.";
  } else {
   phase="Takeoff";s.stage="Takeoff";
   atc=cs+", runway "+dr+", cleared for takeoff. Wind "+((s.weather&&s.weather.wind)||"variable")+" . After departure contact Departure on 124.600.";
   hint=cs+", cleared for takeoff runway "+dr+", contact Departure after departure, "+cs+".";
   explanation="Autorización de despegue simulada. Después del despegue, llama a Departure.";
  }
 } else if(station==="Departure"){
  phase="Departure";frequency="124.600";s.stage="Departure";
  atc=cs+", radar contact. "+s.aircraftProfile.climbProfile+". Climb and maintain "+s.initialAltitude+". When established en route, contact Oakland Center on 127.000.";
  hint=cs+", climbing to "+s.initialAltitude+", will contact Oakland Center 127.000, "+cs+".";
  explanation="Confirma el ascenso y contacta Center cuando estés establecido en ruta.";
 } else if(station==="Center"){
  frequency="127.000";
  var directMatch=msg.match(/\b(?:request direct to|direct to|proceed direct to|request direct|proceed direct)\s+(?:waypoint\s+)?([a-z0-9]{2,8})\b/i);
  var passedMatch=msg.match(/\b(?:over|abeam|passed)\s+(?:waypoint\s+)?([a-z0-9]{2,8})\b/i);
  if(directMatch){
   var directFix=directMatch[1].toUpperCase(),directIndex=s.routeWaypoints.indexOf(directFix);
   if(directIndex<0){
    atc=cs+", unable to verify "+directFix+" in your saved flight plan. Confirm the waypoint or request a route amendment.";
    hint=cs+", unable to verify waypoint "+directFix+", request route amendment.";
    explanation="El punto solicitado no aparece en la ruta guardada. No se calcula un rumbo real ni se consulta navegación externa.";
   }else{
    s.routeIndex=directIndex;s.currentWaypoint=directFix;
    atc=cs+", direct "+directFix+" approved as a simulated route amendment. Proceed direct to "+directFix+" using your simulator's flight plan. Maintain "+(s.assignedCruiseAltitude||s.initialAltitude)+".";
    hint=cs+", direct "+directFix+" approved, maintaining "+(s.assignedCruiseAltitude||s.initialAltitude)+", "+cs+".";
    explanation="ATC reconoce el waypoint de tu plan guardado. La ruta y el rumbo deben verificarse en Aerofly; este sistema no lee la posición real.";
   }
  } else if(passedMatch){
   var passedFix=passedMatch[1].toUpperCase(),passedIndex=s.routeWaypoints.indexOf(passedFix);
   if(passedIndex<0){
    atc=cs+", say again the waypoint. "+passedFix+" is not in the saved route.";
    hint=cs+", confirm waypoint name.";
    explanation="El waypoint reportado no aparece en la ruta guardada.";
   }else{
    s.routeIndex=Math.max(Number(s.routeIndex)||0,passedIndex+1);
    var nextFix=s.routeWaypoints[s.routeIndex]||"destination";
    s.currentWaypoint=nextFix==="destination"?"":nextFix;
    atc=cs+", roger, "+passedFix+" passed. Next planned waypoint "+nextFix+". Maintain "+(s.assignedCruiseAltitude||s.initialAltitude)+".";
    hint=cs+", "+passedFix+" passed, proceeding to "+nextFix+", "+cs+".";
    explanation="Progreso de ruta actualizado con base en tu reporte verbal, no en telemetría de Aerofly.";
   }
  } else if(/\b(request descent|ready to descend|descending|inbound|request approach|approach)\b/i.test(msg)){
   station="Approach";phase="Approach";frequency="124.000";s.stage="Approach";
   s.approachAltitude=s.approachAltitude||"6,000 feet";
   s.approachType=String(c.flightRules||"IFR").toUpperCase()==="VFR"?"visual":"instrument";
   s.approachRunwayHeading=hdg(ar);
   s.assignedVectorHeading=(s.approachRunwayHeading+(s.approachRunwayHeading>=180?-20:20)+360)%360;
   if(s.approachType==="visual"){
    s.approachVectorStage="VFRPattern";
    atc=cs+", "+arr[0]+" Approach. Proceed to the airport and enter the visual traffic pattern as depicted in your simulator for runway "+ar+". Report downwind. Maintain the published or simulator pattern altitude.";
    hint=cs+", entering the traffic pattern runway "+ar+", will report downwind, "+cs+".";
    explanation="Circuito VFR simulado. Utiliza el patrón y la altitud indicados por Aerofly; no se inventan sentidos de giro ni altitudes locales.";
   }else{
    s.approachVectorStage="Vectors";
    atc=cs+", "+arr[0]+" Approach. Expect vectors for a simulated instrument approach runway "+ar+". Turn heading "+String(s.assignedVectorHeading).padStart(3,"0")+". Descend and maintain "+s.approachAltitude+". Reduce speed to "+s.aircraftProfile.approachSpeed+" when able. Report established on the localizer or inbound course.";
    hint=cs+", heading "+String(s.assignedVectorHeading).padStart(3,"0")+", descending to "+s.approachAltitude+", reducing to "+s.aircraftProfile.approachSpeed+", "+cs+".";
    explanation="Aproximación IFR simulada con vectores. No representa una carta, procedimiento publicado ni guía real de navegación.";
   }
  } else if(s.stage==="Departure"&&!s.cruiseAltitudeAssigned){
   phase="Cruise";s.stage="Cruise";s.cruiseAltitudeAssigned=true;
   atc=cs+", Oakland Center. Climb and maintain "+s.assignedCruiseAltitude+". This is your simulated cruise altitude for the "+s.aircraftProfile.name+". Advise when ready to descend.";
   hint=cs+", climbing to "+s.assignedCruiseAltitude+", "+cs+".";explanation="Center asigna un nivel de crucero adaptado al tipo de aeronave.";
  } else {
   phase="Cruise";s.stage="Cruise";
   atc=cs+", Oakland Center, roger. Maintain "+(s.assignedCruiseAltitude||s.initialAltitude)+". Advise when ready to descend.";
   hint="Maintaining "+(s.assignedCruiseAltitude||s.initialAltitude)+", "+cs+".";explanation="En ruta: mantén tu última altitud asignada y solicita descenso cuando corresponda.";
  }
 } else if(station==="Approach"){
  phase="Approach";frequency="124.000";s.stage="Approach";
  if(s.approachType==="visual"&&/^VFR/.test(s.approachVectorStage||"")){
   if(/\b(final|runway in sight|turning final|on final)\b/i.test(msg)){
    s.approachVectorStage="Final";
    atc=cs+", roger, runway "+ar+" in sight. Contact Tower on 118.300 when established on final for landing clearance.";
    hint=cs+", runway in sight, joining final runway "+ar+", contacting Tower 118.300, "+cs+".";
    explanation="Final visual simulada. Contacta Tower para solicitar la autorización de aterrizaje.";
   }else if(/\b(base|turning base)\b/i.test(msg)){
    s.approachVectorStage="VFRFinal";
    atc=cs+", roger, report final runway "+ar+". Use the traffic pattern shown in your simulator.";
    hint=cs+", turning base runway "+ar+", will report final, "+cs+".";
    explanation="Tramo base VFR simulado. Continúa el patrón representado en Aerofly.";
   }else if(/\b(downwind|joining the pattern|entering the pattern|traffic pattern)\b/i.test(msg)){
    s.approachVectorStage="VFRBase";
    atc=cs+", roger, report turning base runway "+ar+". Maintain the published or simulator pattern altitude.";
    hint=cs+", downwind runway "+ar+", will report base, "+cs+".";
    explanation="Tramo viento en cola VFR simulado. Reporta cuando gires a base.";
   }else{
    atc=cs+", continue to the airport and enter the visual traffic pattern as depicted in your simulator. Report downwind runway "+ar+".";
    hint=cs+", entering downwind runway "+ar+", "+cs+".";
    explanation="Sigue el patrón visual mostrado por Aerofly y reporta cada tramo.";
   }
  } else if(s.approachVectorStage==="VFRBase"&&/\b(base|turning base)\b/i.test(msg)){
   s.approachVectorStage="VFRFinal";
   atc=cs+", roger, report final runway "+ar+".";
   hint=cs+", turning base runway "+ar+", will report final, "+cs+".";
   explanation="Tramo base VFR simulado.";
  } else if(s.approachVectorStage==="VFRFinal"&&/\b(final|runway in sight|turning final|on final)\b/i.test(msg)){
   s.approachVectorStage="Final";
   atc=cs+", roger, contact Tower on 118.300 for landing clearance runway "+ar+".";
   hint=cs+", established on final runway "+ar+", contacting Tower 118.300, "+cs+".";
   explanation="Final VFR simulado. Solicita autorización de aterrizaje a Tower.";
  } else if(s.approachVectorStage==="Vectors"&&/\b(established|localizer|inbound course|intercepting|on the localizer)\b/i.test(msg)){
   s.approachVectorStage="Final";
   s.assignedFinalHeading=s.approachRunwayHeading;
   s.approachAltitude=s.approachAltitude||"3,000 feet";
   atc=cs+", roger. Turn heading "+String(s.assignedFinalHeading).padStart(3,"0")+". Descend and maintain "+s.approachAltitude+". Maintain "+s.approachSpeed+" or as previously assigned. Report established on final runway "+ar+".";
   hint=cs+", heading "+String(s.assignedFinalHeading).padStart(3,"0")+", descending to "+s.approachAltitude+", "+cs+".";
   explanation="Vector final simulado: alinea el rumbo con la orientación de la pista. No sustituye procedimientos reales.";
  } else if(/\b(established on final|on final|final approach|runway in sight)\b/i.test(msg)){
   s.approachVectorStage="Final";
   atc=cs+", roger, runway "+ar+" in use. Contact Tower on 118.300 for landing clearance.";
   hint=cs+", established on final runway "+ar+", contacting Tower 118.300, "+cs+".";
   explanation="Confirma que estás establecido en final y solicita autorización de aterrizaje a Tower.";
  } else if(s.approachVectorStage==="Final"){
   atc=cs+", "+arr[0]+" Approach. Continue inbound runway "+ar+". Maintain "+s.approachSpeed+" or as previously assigned. Contact Tower on 118.300 when established on final.";
   hint=cs+", continuing inbound runway "+ar+", maintaining "+s.approachSpeed+", "+cs+".";
   explanation="Continúa la aproximación y contacta Tower cuando estés establecido en final.";
  } else {
   s.approachVectorStage=s.approachVectorStage||"Vectors";
   s.approachRunwayHeading=s.approachRunwayHeading||hdg(ar);
   s.assignedVectorHeading=s.assignedVectorHeading==null?(s.approachRunwayHeading+(s.approachRunwayHeading>=180?-20:20)+360)%360:s.assignedVectorHeading;
   atc=cs+", "+arr[0]+" Approach. Turn heading "+String(s.assignedVectorHeading).padStart(3,"0")+". Descend and maintain "+(s.approachAltitude||"6,000 feet")+". Expect runway "+ar+". Report established on the localizer or inbound course.";
   hint=cs+", heading "+String(s.assignedVectorHeading).padStart(3,"0")+", descending, expect runway "+ar+", "+cs+".";
   explanation="Vector inicial de aproximación simulado. No es una instrucción de navegación real.";
  }
 } else if(station==="Unicom"){
  frequency="122.800";atc=dep[0]+" traffic, "+cs+", radio call received. Continue to announce position and intentions.";
  hint=dep[0]+" traffic, "+cs+", [position and intentions].";explanation="UNICOM es frecuencia de autoanuncio, no control ATC.";
 } else {
  station="Clearance";phase="Preflight";frequency="121.700";
  atc=cs+", say again. Clearance Delivery.";hint="Clearance Delivery, "+cs+", say again.";
  explanation="No identifiqué la estación llamada. Repite tu llamada inicial.";
 }
 s.phase=phase;s.lastStation=station;s.frequency=frequency;s.updatedAt=new Date().toISOString();
 return {station:station,phase:phase,frequency:frequency,atc:atc,hint:hint,explanation:explanation,state:s,engine:"AEROFLY ATC CORE"};
}
export default {async fetch(request,env){
 var url=new URL(request.url),origin=request.headers.get("Origin")||"";
 if(request.method==="OPTIONS")return new Response(null,{headers:headers()});
 if(request.method==="GET"&&url.pathname==="/health")return out({ok:true,service:"AEROFLY-ATC Brain",engine:"AEROFLY ATC CORE",mode:"CORE ONLY",neuralVoice:env.AI?"Grok TTS ready":"AI binding required"});
 if(request.method==="POST"&&url.pathname==="/tts"){
  if(origin&&origin!==ALLOWED_ORIGIN)return out({error:"Origin not allowed"},403);
  try{
   if(!env.AI||typeof env.AI.run!=="function")return out({error:"Neural voice is not configured. Add the Workers AI binding named AI."},503);
   var ttsBody=await request.json(),ttsText=clean(ttsBody.text,1800);
   if(!ttsText)return out({error:"Text is required"},400);
   var trafficVoices=["ara","rex","sal","eve"],voiceIndex=Array.from(ttsText).reduce((sum,ch)=>sum+ch.charCodeAt(0),0)%trafficVoices.length;
   var selectedVoice=ttsBody.traffic===true?trafficVoices[voiceIndex]:"leo";
   var generated=await env.AI.run("xai/grok-tts",{text:ttsText,voice_id:selectedVoice,language:"en",output_format:{codec:"mp3",sample_rate:24000,bit_rate:128000}});
   var audioUrl=generated&&((generated.audio)||(generated.result&&generated.result.audio));
   if(!audioUrl)return out({error:"Neural voice returned no audio"},502);
   var audioResponse=await fetch(audioUrl);
   if(!audioResponse.ok)return out({error:"Neural audio could not be retrieved"},502);
   return new Response(await audioResponse.arrayBuffer(),{status:200,headers:{...headers(),"Content-Type":audioResponse.headers.get("Content-Type")||"audio/mpeg","Cache-Control":"no-store"}});
  }catch(ttsError){return out({error:"Neural voice request failed",details:clean(ttsError&&ttsError.message,180)},502);}
 }
 if(request.method!=="POST"||url.pathname!=="/atc")return out({error:"Use POST /atc or GET /health"},404);
 if(origin&&origin!==ALLOWED_ORIGIN)return out({error:"Origin not allowed"},403);
 try{var body=await request.json(),message=clean(body.message,3000),context=body.context||{},history=Array.isArray(body.history)?body.history.slice(-8):[];if(!message)return out({error:"Message is required"},400);
 return out(core(message,context,history));
 }catch(e){return out({error:"Request could not be processed",details:clean(e.message,200)},500);}
}};
