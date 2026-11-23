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
function stateFrom(history,c){if(c.flightState&&typeof c.flightState==="object"&&Object.keys(c.flightState).length)return c.flightState;for(var i=(history||[]).length-1;i>=0;i--){if(history[i].role==="model"){try{var x=JSON.parse(history[i].text);if(x.state)return x.state;}catch(e){}}}return {};}
function core(message,c,history){
 var msg=String(message||"").toLowerCase(),from=c.origin||{},to=c.destination||{},dep=apt(from.icao),arr=apt(to.icao);
 var cs=clean(c.callsign||"November Niner Charlie Bravo",80),ac=clean(c.aircraft||"Learjet 45",50),s=stateFrom(history,c);
 var emergency=/\b(mayday|pan.?pan|engine fail|engine out|fire|smoke|medical|bird strike|emergency)\b/i.test(message);
 var called="";
 var calls=[["Clearance",/\b(clearance delivery|clearance)\b/i],["Ground",/\bground\b/i],["Tower",/\btower\b/i],["Departure",/\bdeparture\b/i],["Center",/\b(center)\b/i],["Approach",/\bapproach\b/i],["ATIS",/\b(atis|information)\b/i],["Unicom",/\b(unicom|traffic)\b/i]];
 for(var ci=0;ci<calls.length;ci++){if(calls[ci][1].test(msg)){called=calls[ci][0];break;}}
 var stage=s.stage||"Preflight";
 if(!called){
  if(stage==="ClearedToTaxi"&&/\b(ready to taxi|request taxi|taxi clearance|taxi)\b/i.test(msg))called="Ground";
  else if((stage==="Taxi"||stage==="HoldingShort")&&/\b(ready for departure|ready for takeoff|request takeoff|ready for take.?off)\b/i.test(msg))called="Tower";
  else if(stage==="Taxi"&&/\b(holding short|at the hold short|short of runway|at the runway)\b/i.test(msg))called="Ground";
  else if(stage==="Takeoff"&&/\b(airborne|passing|climbing|off the ground|just departed)\b/i.test(msg))called="Departure";
  else if(stage==="Departure"&&/\b(established en.?route|level at|leveling at|cruise altitude|contact center|center)\b/i.test(msg))called="Center";
  else if(stage==="Cruise"&&/\b(request descent|ready to descend|descending|inbound|request approach|approach)\b/i.test(msg))called="Approach";
  else if(stage==="Approach"&&/\b(go.?around|going around|missed approach)\b/i.test(msg))called="Tower";
  else if(stage==="Approach"&&/\b(established on final|on final|final approach|visual|runway in sight)\b/i.test(msg))called="Tower";
  else if(stage==="Landing"&&/\b(vacated|clear of runway|runway clear|off the runway)\b/i.test(msg))called="Ground";
  else if(stage==="TaxiIn"&&/\b(parked|at parking|at the gate|shut down|shutdown)\b/i.test(msg))called="Ground";
 }
 var first=!s.assignedDepartureRunway;
 if(first){
  s.simWind=270;
  s.assignedDepartureRunway=runway(dep[2],s.simWind);
  s.assignedArrivalRunway=runway(arr[2],s.simWind);
  s.initialAltitude=c.flightRules==="VFR"?"5,500 feet":"5,000 feet";
  s.squawk=String(1000+Math.floor(Math.random()*7000));
  s.stage="Preflight";
  s.initialized=true;
 }
 var dr=s.assignedDepartureRunway||"assigned runway",ar=s.assignedArrivalRunway||"assigned runway";
 var station=first?"Clearance":(called||clean(c.station||s.lastStation||"Clearance",24));
 var phase=clean(c.phase||s.phase||"Preflight",24),frequency="",atc="",hint="",explanation="";
 if(emergency){
  station=called&&called!=="ATIS"?called:"Tower";phase="Emergency";frequency="121.500";
  atc=cs+", emergency acknowledged. State the nature of the emergency, your intentions, persons on board and fuel endurance. Maintain present heading and altitude if able.";
  hint=cs+", MAYDAY/PAN-PAN, "+ac+", "+clean(message,120)+". Request immediate assistance.";
  explanation="Declara la emergencia e informa naturaleza, intenciones, personas a bordo y combustible.";
  s.stage="Emergency";
 } else if(station==="ATIS"){
  var useArrival=/\b(destination|arrival|inbound|approach)\b/i.test(msg);
  var atisApt=useArrival?arr:dep;
  var atisRunway=useArrival?ar:dr;
  var atisWind=useArrival?"290 at 5 knots":"270 at 6 knots";
  var atisKey=atisApt[1];
  s.atis=s.atis&&s.atis.airport===atisKey?s.atis:{airport:atisKey,information:"Alpha",wind:atisWind,visibility:"10 miles",runway:atisRunway,conditions:"Few clouds"};
  frequency="126.000";atc=atisApt[0]+" information "+s.atis.information+". Wind "+s.atis.wind+". Visibility "+s.atis.visibility+". Few clouds. Runway "+atisRunway+" in use. Advise you have information "+s.atis.information+". Simulated ATIS.";
  hint="Information "+s.atis.information+" received, "+cs+".";explanation="ATIS ficticio para "+atisApt[0]+", no sincronizado con el clima de Aerofly.";
 } else if(station==="Clearance"){
  phase="Preflight";frequency="121.700";s.stage="ClearedToTaxi";
  atc=cs+", cleared to "+arr[0]+" airport, "+(c.flightRules||"IFR")+" departure. Runway "+dr+". Initial altitude "+s.initialAltitude+". Expect further clearance after departure. Squawk "+s.squawk+". Advise when ready to taxi.";
  hint=cs+", cleared to "+arr[0]+", runway "+dr+", initial altitude "+s.initialAltitude+", squawk "+s.squawk+". Ready to taxi.";
  explanation="Lee de vuelta destino, pista, altitud inicial y código transponder.";
 } else if(station==="Ground"){
  frequency="121.900";
  if(s.stage==="Parked"||/\b(parked|at parking|at the gate|shut down|shutdown)\b/i.test(msg)){
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
   atc=cs+", continue taxi to runway "+dr+" and hold short. Contact Tower on 118.300 when holding short and ready for departure.";
   hint=cs+", continuing to runway "+dr+", holding short, "+cs+".";
   explanation="Continúa el rodaje y avisa cuando estés en el punto de espera.";
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
  } else if(s.stage==="Approach"||/\b(established on final|on final|final approach|runway in sight|visual approach)\b/i.test(msg)){
   phase="Landing";s.stage="Landing";
   atc=cs+", runway "+ar+", cleared to land. Wind calm. After landing, vacate when able and contact Ground on 121.900.";
   hint=cs+", cleared to land runway "+ar+", "+cs+".";
   explanation="Autorización de aterrizaje simulada. Después de liberar la pista, contacta Ground.";
  } else if(/\b(vacated|clear of runway|runway clear|off the runway)\b/i.test(msg)){
   station="Ground";frequency="121.900";phase="Taxi In";s.stage="TaxiIn";
   atc=cs+", roger, runway vacated. Taxi to parking via the taxiways and markings shown in your simulator. Monitor Ground on 121.900.";
   hint=cs+", taxi to parking, "+cs+".";
   explanation="Sigue las calles señalizadas en Aerofly hasta el estacionamiento.";
  } else {
   phase="Takeoff";s.stage="Takeoff";
   atc=cs+", runway "+dr+", cleared for takeoff. Wind 270 at 6 knots. After departure contact Departure on 124.600.";
   hint=cs+", cleared for takeoff runway "+dr+", contact Departure after departure, "+cs+".";
   explanation="Autorización de despegue simulada. Después del despegue, llama a Departure.";
  }
 } else if(station==="Departure"){
  phase="Departure";frequency="124.600";s.stage="Departure";
  atc=cs+", radar contact. Climb and maintain "+s.initialAltitude+". When established en route, contact Oakland Center on 127.000.";
  hint=cs+", climbing to "+s.initialAltitude+", will contact Oakland Center 127.000, "+cs+".";
  explanation="Confirma el ascenso y contacta Center cuando estés establecido en ruta.";
 } else if(station==="Center"){
  frequency="127.000";
  if(/\b(request descent|ready to descend|descending|inbound|request approach|approach)\b/i.test(msg)){
   station="Approach";phase="Approach";frequency="124.000";s.stage="Approach";
   atc=cs+", "+arr[0]+" Approach. Descend and maintain 6,000 feet. Expect runway "+ar+". Contact Tower on 118.300 when established on final.";
   hint=cs+", descending to 6,000 feet, expect runway "+ar+", "+cs+".";
   explanation="Descenso simulado hacia destino. Cuando estés establecido en final, llama a Tower.";
  } else {
   phase="Cruise";s.stage="Cruise";
   atc=cs+", Oakland Center, roger. Maintain your last assigned altitude. Advise when ready to descend.";
   hint="Maintaining assigned altitude, "+cs+".";explanation="En ruta: confirma tu altitud asignada y solicita descenso cuando corresponda.";
  }
 } else if(station==="Approach"){
  phase="Approach";frequency="124.000";s.stage="Approach";
  atc=cs+", "+arr[0]+" Approach. Continue approach runway "+ar+". Contact Tower on 118.300 when established on final.";
  hint=cs+", continuing approach runway "+ar+", will contact Tower on 118.300.";explanation="Confirma la pista prevista y contacta Tower al establecerte en final.";
 } else if(station==="Unicom"){
  frequency="122.800";atc=dep[0]+" traffic, "+cs+", radio call received. Continue to announce position and intentions.";
  hint=dep[0]+" traffic, "+cs+", [position and intentions].";explanation="UNICOM es frecuencia de autoanuncio, no control ATC.";
 } else {
  station="Clearance";phase="Preflight";frequency="121.700";
  atc=cs+", say again. Clearance Delivery.";hint="Clearance Delivery, "+cs+", say again.";
  explanation="No identifiqué la estación llamada. Repite tu llamada inicial.";
 }
 s.phase=phase;s.lastStation=station;s.frequency=frequency;
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
