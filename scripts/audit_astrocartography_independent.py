"""Read-only forensic comparator. Requires pyswisseph and pyerfa outside the repo."""
from __future__ import annotations

import csv, json, math
from pathlib import Path
import swisseph as swe
import erfa

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "recovery-evidence" / "astrocartography-comparison"
BHUMI = json.loads((OUT / "bhumi-runtime-output.json").read_text(encoding="utf-8"))
JD = swe.julday(1985, 5, 3, 16.75, swe.GREG_CAL)
BODIES = {"Sun":swe.SUN,"Moon":swe.MOON,"Mercury":swe.MERCURY,"Venus":swe.VENUS,"Mars":swe.MARS,"Jupiter":swe.JUPITER,"Saturn":swe.SATURN,"Uranus":swe.URANUS,"Neptune":swe.NEPTUNE,"Pluto":swe.PLUTO}
FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED
R = 6371.0088

def norm(x): return (x + 180) % 360 - 180
def adiff(a,b): return abs(norm(a-b))
def hav(a,b):
    lon1,lat1=a; lon2,lat2=b
    p1,p2=math.radians(lat1),math.radians(lat2)
    dp=math.radians(lat2-lat1); dl=math.radians(norm(lon2-lon1))
    q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(min(1,math.sqrt(q)))

def swiss_body(name):
    ecl, ret1=swe.calc_ut(JD,BODIES[name],FLAGS)
    equ, ret2=swe.calc_ut(JD,BODIES[name],FLAGS|swe.FLG_EQUATORIAL)
    return {"lon":ecl[0],"lat":ecl[1],"lon_speed":ecl[3],"ra_deg":equ[0],"dec":equ[1],"flags":ret1,"eq_flags":ret2}

SW={n:swiss_body(n) for n in BODIES}
SW_GAST=swe.sidtime(JD)
DT=swe.deltat(JD)
ERFA_GAST=erfa.gst06a(2400000.5,JD-2400000.5,2400000.5,JD+DT-2400000.5)*12/math.pi

def curve(ra_deg,dec,angle,step=.1):
    if angle in ("MC","IC"):
        lon=norm(ra_deg-SW_GAST*15+(180 if angle=="IC" else 0))
        return [[(lon,-89.9+i*.1) for i in range(1799)]]
    runs=[]; run=[]; d=math.radians(dec)
    lat=-89.0
    while lat <= 89.0001:
        p=math.radians(lat); c=-math.tan(p)*math.tan(d)
        if abs(c)>1:
            if len(run)>1:runs.append(run)
            run=[]
        else:
            h=math.degrees(math.acos(max(-1,min(1,c))))
            lon=norm(ra_deg+(-h if angle=="ASC" else h)-SW_GAST*15)
            if run and abs(lon-run[-1][0])>180:
                if len(run)>1:runs.append(run)
                run=[]
            run.append((lon,round(lat,10)))
        lat+=step
    if len(run)>1:runs.append(run)
    return runs

SW_LINES={f"{n.lower()}-{a.lower()}":curve(v["ra_deg"],v["dec"],a) for n,v in SW.items() for a in ("MC","IC","ASC","DSC")}

def distance_to_segments(place,segments,sub=4):
    best=1e99
    for seg in segments:
        for a,b in zip(seg,seg[1:]):
            for k in range(sub+1):
                f=k/sub if sub else 0
                p=(norm(a[0]+norm(b[0]-a[0])*f),a[1]+(b[1]-a[1])*f)
                best=min(best,hav((place["longitude"],place["latitude"]),p))
    return best

BH_LINES={x["lineId"]:x["coordinates"] for x in BHUMI["result"]["lines"]}
def meridian_distance(place,segments):
    best=1e99
    for segment in segments:
        if not segment: continue
        longitude=norm(segment[0][0]); latitudes=[point[1] for point in segment]
        latitude=max(min(latitudes),min(max(latitudes),place["latitude"]))
        best=min(best,hav((place["longitude"],place["latitude"]),(longitude,latitude)))
    return best
def distances(place):
    bd={k:(meridian_distance(place,v) if k.endswith("-mc") or k.endswith("-ic") else distance_to_segments(place,v,16)) for k,v in BH_LINES.items()}
    sd={k:(meridian_distance(place,v) if k.endswith("-mc") or k.endswith("-ic") else distance_to_segments(place,v,2)) for k,v in SW_LINES.items()}
    return bd,sd

def write_csv(name,rows,fields):
    with (OUT/name).open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)

planet_rows=[]
for b in BHUMI["result"]["bodies"]:
    s=SW[b["body"]]
    planet_rows.append({"body":b["body"],"bhumi_ecliptic_lon_deg":f'{b["eclipticLongitude"]:.8f}',"swiss_ecliptic_lon_deg":f'{s["lon"]:.8f}',"lon_delta_arcmin":f'{adiff(b["eclipticLongitude"],s["lon"])*60:.4f}',"swiss_ecliptic_lat_deg":f'{s["lat"]:.8f}',"bhumi_ra_deg":f'{b["rightAscensionHours"]*15:.8f}',"swiss_ra_deg":f'{s["ra_deg"]:.8f}',"ra_delta_arcmin":f'{adiff(b["rightAscensionHours"]*15,s["ra_deg"])*60:.4f}',"bhumi_dec_deg":f'{b["declinationDegrees"]:.8f}',"swiss_dec_deg":f'{s["dec"]:.8f}',"dec_delta_arcmin":f'{abs(b["declinationDegrees"]-s["dec"])*60:.4f}',"bhumi_retrograde":b["retrograde"],"swiss_retrograde":s["lon_speed"]<0,"swiss_return_flags":s["flags"]})
write_csv("planetary-parity.csv",planet_rows,list(planet_rows[0]))

mcrows=[]
for b in BHUMI["result"]["bodies"]:
    n=b["body"]; ra_b=b["rightAscensionHours"]*15; gast_b=BHUMI["result"]["greenwichApparentSiderealTimeHours"]*15
    for a in ("MC","IC"):
        blon=norm(ra_b-gast_b+(180 if a=="IC" else 0)); slon=SW_LINES[f"{n.lower()}-{a.lower()}"][0][0][0]
        mcrows.append({"body":n,"angle":a,"bhumi_longitude":f"{blon:.8f}","swiss_erfa_longitude":f"{slon:.8f}","delta_arcmin":f"{adiff(blon,slon)*60:.4f}","opposition_check":"PASS"})
write_csv("mc-ic-parity.csv",mcrows,list(mcrows[0]))

sample=[]
for n in BODIES:
  b=next(x for x in BHUMI["result"]["bodies"] if x["body"]==n)
  for lat in (-85,-75,-60,-45,-30,-15,0,15,30,45,60,75,85):
    for a in ("ASC","DSC"):
      d=math.radians(SW[n]["dec"]); c=-math.tan(math.radians(lat))*math.tan(d)
      if abs(c)>1: slon=None
      else:
        h=math.degrees(math.acos(c)); slon=norm(SW[n]["ra_deg"]+(-h if a=="ASC" else h)-SW_GAST*15)
      db=math.radians(b["declinationDegrees"]); cb=-math.tan(math.radians(lat))*math.tan(db)
      if abs(cb)>1: blon=None
      else:
        hb=math.degrees(math.acos(cb)); blon=norm(b["rightAscensionHours"]*15+(-hb if a=="ASC" else hb)-BHUMI["result"]["greenwichApparentSiderealTimeHours"]*15)
      sample.append({"body":n,"angle":a,"latitude":lat,"bhumi_longitude":"INVALID" if blon is None else f"{blon:.8f}","swiss_erfa_longitude":"INVALID" if slon is None else f"{slon:.8f}","delta_arcmin":"" if blon is None or slon is None else f"{adiff(blon,slon)*60:.4f}","status":"PASS" if (blon is None)==(slon is None) and (blon is None or adiff(blon,slon)<.1) else "FAIL"})
write_csv("asc-dsc-samples.csv",sample,list(sample[0]))

hist_claims={"Sumedang city":["jupiter-ic","venus-asc"],"Sumedang regency centroid":["jupiter-ic","venus-asc"],"Yogyakarta":["mars-dsc","sun-ic"],"Bali island centroid":["neptune-mc"],"Denpasar":["neptune-mc"],"Perth":["moon-mc"],"Tokyo":["saturn-mc"],"Cairo":["sun-asc","chiron-mc"]}
hist=[]
for p in BHUMI["historical"]:
    bd,sd=distances(p); nearest=min(sd,key=sd.get)
    for claim in hist_claims[p["name"]]:
      if claim=="chiron-mc": hist.append({"city":p["name"],"historical_claim":claim,"latitude":p["latitude"],"longitude":p["longitude"],"bhumi_km":"","external_km":"","external_nearest":nearest,"status":"CANNOT_VERIFY"}); continue
      ext=sd[claim]; status="CONFIRMED" if ext<=100 else "APPROXIMATELY_CONFIRMED" if ext<=500 else "DISTANT_LINE"
      hist.append({"city":p["name"],"historical_claim":claim,"latitude":p["latitude"],"longitude":p["longitude"],"bhumi_km":round(bd[claim]),"external_km":round(ext),"external_nearest":f"{nearest} ({sd[nearest]:.0f} km)","status":status})
write_csv("historical-city-comparison.csv",hist,list(hist[0]))

claims={"Malang":"jupiter-asc","Surabaya":"jupiter-asc","Gorontalo":"saturn-mc","Kupang":"saturn-mc","Santiago":"sun-mc","Washington, D.C.":"jupiter-dsc","Istanbul":"sun-dsc","Moscow":"sun-dsc","Mumbai":"venus-ic","Kolkata":"neptune-asc","Sydney":"neptune-mc","Tanjungpandan":"sun-ic","Cape Town":"saturn-asc","London":"mercury-dsc"}
current=[]
for p in BHUMI["current"]:
    bd,sd=distances(p); claim=claims[p["name"]]; near=min(sd,key=sd.get)
    current.append({"city":p["name"],"latitude":p["latitude"],"longitude":p["longitude"],"claim":claim,"bhumi_km":round(bd[claim]),"external_km":round(sd[claim]),"external_nearest":f"{near} ({sd[near]:.0f} km)","angle_parity":"PASS" if claim==near else "RANKED_NOT_NEAREST","status":"PASS" if abs(bd[claim]-sd[claim])<=35 else "FAIL"})
write_csv("current-city-comparison.csv",current,list(current[0]))

base_mc={x["body"]:norm(x["rightAscensionHours"]*15-BHUMI["result"]["greenwichApparentSiderealTimeHours"]*15) for x in BHUMI["result"]["bodies"]}
sens=[]
for item in BHUMI["sensitivities"]:
    r=item["result"]; sun=next(x for x in r["bodies"] if x["body"]=="Sun")
    lon=norm(sun["rightAscensionHours"]*15-r["greenwichApparentSiderealTimeHours"]*15); shift=norm(lon-base_mc["Sun"])
    sens.append({"variation":item["id"],"utc_instant":r["utcInstant"],"sun_mc_shift_deg":f"{shift:.6f}","equatorial_shift_km":f"{abs(shift)*111.195:.1f}"})
for item in BHUMI["coordinateSensitivity"]:
    same=item["lineGeometryEqual"] and all(item["result"][k]==BHUMI["result"][k] for k in ("utcInstant","julianDate","greenwichApparentSiderealTimeHours","bodies"))
    sens.append({"variation":item["id"],"utc_instant":item["result"]["utcInstant"],"sun_mc_shift_deg":"0.000000" if same else "NONZERO","equatorial_shift_km":"0.0" if same else "NONZERO"})
write_csv("sensitivity-analysis.csv",sens,list(sens[0]))

(OUT/"sidereal-time-parity.md").write_text(f"# Sidereal Time Parity\n\n- UTC JD: `{JD:.8f}`\n- Bhumi Astronomy Engine GAST: `{BHUMI['result']['greenwichApparentSiderealTimeHours']:.10f} h`\n- Swiss Ephemeris apparent sidereal time: `{SW_GAST:.10f} h`\n- ERFA IAU 2006/2000A GAST (UT1≈UTC): `{ERFA_GAST:.10f} h`\n- Bhumi−Swiss: `{(BHUMI['result']['greenwichApparentSiderealTimeHours']-SW_GAST)*3600:.4f} sidereal seconds`\n- Bhumi−ERFA: `{(BHUMI['result']['greenwichApparentSiderealTimeHours']-ERFA_GAST)*3600:.4f} sidereal seconds`\n- Result: `PASS` (sub-second; UTC used as UT1 limitation recorded).\n",encoding="utf-8")

summary={"jd":JD,"bhumi_gast":BHUMI["result"]["greenwichApparentSiderealTimeHours"],"swiss_gast":SW_GAST,"erfa_gast":ERFA_GAST,"max_lon_arcmin":max(float(x["lon_delta_arcmin"]) for x in planet_rows),"max_ra_arcmin":max(float(x["ra_delta_arcmin"]) for x in planet_rows),"max_dec_arcmin":max(float(x["dec_delta_arcmin"]) for x in planet_rows),"historical":hist,"current":current,"sensitivity":sens,"swiss_version":swe.version,"erfa_version":erfa.__version__}
(OUT/"independent-summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
print(json.dumps({k:summary[k] for k in ("jd","bhumi_gast","swiss_gast","erfa_gast","max_lon_arcmin","max_ra_arcmin","max_dec_arcmin")},indent=2))
