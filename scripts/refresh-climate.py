#!/usr/bin/env python3
"""Refresh src/data/climate_normals.json from the Open-Meteo Historical Weather API.

Used by .github/workflows/climate-refresh.yml. Deterministic: fixed city list, fixed
2016-01-01..2025-12-31 period, fixed model (era5_seamless). A re-run only changes the file
if Open-Meteo/ERA5 has revised the underlying values (or the city list below changes).

Attribution: adapted from the Desk research scripts in /workspace/travel_news/research/src/
(fetch_climate.py for the city list and API request, build_normals.py for the monthly
aggregation), which produced the current climate_normals.json. Changes for CI:
  * fetch + build in one script, standard library only (urllib instead of curl);
  * raw responses go to a temp dir (not committed);
  * results are merged into the existing JSON so hand-added fields (meta.validation_summary,
    cities[].quality, cities[].show_rain_on_site) survive;
  * the file is rewritten only when computed values change; `meta.generated` and the
    changed cities' `fetched` are updated only then, so an unchanged run produces no diff;
  * any city failing after retries aborts the run without writing anything.

Data licence: Open-Meteo data is CC BY 4.0 ("Weather data by Open-Meteo.com",
https://open-meteo.com/); underlying ERA5/ERA5-Land: Copernicus Climate Change Service (C3S).
The free Open-Meteo API is for non-commercial use only (https://open-meteo.com/en/terms).

Usage:
  python3 scripts/refresh-climate.py                     # fetch all cities, update if changed
  python3 scripts/refresh-climate.py --raw-dir DIR --no-fetch   # rebuild from saved raw files
  python3 scripts/refresh-climate.py --only Singapore --dry-run # fetch one city, report only
Writes `changed=true|false` to $GITHUB_OUTPUT when set.
"""
import argparse, collections, datetime, json, os, statistics as st, sys, tempfile, time
import urllib.error, urllib.request
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, "src", "data", "climate_normals.json")
IST = ZoneInfo("Asia/Kolkata")
START, END = "2016-01-01", "2025-12-31"

# (country, city, lat, lon, cell_selection) -- copied verbatim from fetch_climate.py
CITIES = [
 ("thailand","Bangkok",13.7563,100.5018,"land"),("thailand","Phuket",7.8804,98.3923,"land"),("thailand","Chiang Mai",18.7883,98.9853,"land"),
 ("singapore","Singapore",1.3521,103.8198,"land"),
 ("uae","Dubai",25.2048,55.2708,"land"),("uae","Abu Dhabi",24.4539,54.3773,"land"),
 ("vietnam","Hanoi",21.0278,105.8342,"land"),("vietnam","Da Nang",16.0544,108.2022,"land"),("vietnam","Ho Chi Minh City",10.8231,106.6297,"land"),("vietnam","Phu Quoc",10.2899,103.9840,"land"),
 ("malaysia","Kuala Lumpur",3.1390,101.6869,"land"),("malaysia","Langkawi",6.3500,99.8000,"land"),
 ("indonesia","Bali (Denpasar)",-8.6705,115.2126,"land"),("indonesia","Jakarta",-6.2088,106.8456,"land"),
 ("sri_lanka","Colombo",6.9271,79.8612,"land"),("sri_lanka","Kandy",7.2906,80.6337,"land"),("sri_lanka","Trincomalee",8.5874,81.2152,"land"),
 ("maldives","Male",4.1755,73.5093,"nearest"),
 ("bhutan","Paro",27.4305,89.4133,"land"),("bhutan","Thimphu",27.4728,89.6390,"land"),
 ("nepal","Kathmandu",27.7172,85.3240,"land"),("nepal","Pokhara",28.2096,83.9856,"land"),
 ("japan","Tokyo",35.6762,139.6503,"land"),("japan","Osaka",34.6937,135.5023,"land"),
 ("south_korea","Seoul",37.5665,126.9780,"land"),("south_korea","Busan",35.1796,129.0756,"land"),("south_korea","Jeju",33.4996,126.5312,"land"),
]
M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
# Fields this script computes; anything else on a city record is kept as-is.
COMPUTED = ["requested","grid_cell","timezone","cell_selection","annual_rain_mm","months","source_url"]


def raw_name(country, name):
    return f"{country}__{name.split(' (')[0].replace(' ','_').lower()}.json"


def url_for(lat, lon, cs):
    return (f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={START}&end_date={END}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&models=era5_seamless&cell_selection={cs}")


def fetch(url, name, attempts=6, wait=70):
    for attempt in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "travel-news-india climate-refresh (GitHub Actions)"})
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.load(r)
            if "daily" in d:
                return d
            err = f"no daily data: {str(d)[:200]}"
        except (urllib.error.URLError, TimeoutError, ValueError) as e:
            body = ""
            if isinstance(e, urllib.error.HTTPError):
                try: body = e.read()[:200].decode("utf-8", "replace")
                except Exception: pass
            err = f"{e} {body}"
        print(f"err {name} attempt {attempt}/{attempts}: {err}", flush=True)
        if attempt < attempts:
            time.sleep(wait)
    raise SystemExit(f"Giving up on {name}; nothing written.")


def build_city(d, country, name, lat, lon, cs, url):
    # Aggregation copied from build_normals.py.
    dl = d["daily"]
    ym = collections.defaultdict(lambda: {"tx": [], "tn": [], "p": []})
    for t, tx, tn, p in zip(dl["time"], dl["temperature_2m_max"], dl["temperature_2m_min"], dl["precipitation_sum"]):
        k = (int(t[:4]), int(t[5:7]))
        if tx is not None: ym[k]["tx"].append(tx)
        if tn is not None: ym[k]["tn"].append(tn)
        if p is not None: ym[k]["p"].append(p)
    months = []
    for mo in range(1, 13):
        ks = [k for k in ym if k[1] == mo]
        tx = [st.mean(ym[k]["tx"]) for k in ks]; tn = [st.mean(ym[k]["tn"]) for k in ks]
        pt = [sum(ym[k]["p"]) for k in ks]; rd = [sum(1 for x in ym[k]["p"] if x >= 1.0) for k in ks]
        months.append({"month": mo, "name": M[mo-1], "avg_high_c": round(st.mean(tx), 1), "avg_low_c": round(st.mean(tn), 1),
                       "rain_mm": round(st.mean(pt)), "rain_days_1mm": round(st.mean(rd), 1), "rain_mm_min": round(min(pt)),
                       "rain_mm_max": round(max(pt)), "years": len(ks)})
    return {"country": country, "city": name, "requested": {"lat": lat, "lon": lon},
            "grid_cell": {"lat": d["latitude"], "lon": d["longitude"], "elevation_m": d["elevation"]}, "timezone": d["timezone"],
            "cell_selection": cs, "annual_rain_mm": sum(x["rain_mm"] for x in months), "months": months, "source_url": url}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw-dir", help="directory for raw API responses (default: a temp dir)")
    ap.add_argument("--no-fetch", action="store_true", help="only use raw files already in --raw-dir")
    ap.add_argument("--only", action="append", help="limit to these city names (testing)")
    ap.add_argument("--dry-run", action="store_true", help="report changes, do not write")
    ap.add_argument("--sleep", type=float, default=15, help="seconds between requests (politeness)")
    a = ap.parse_args()
    if a.no_fetch and not a.raw_dir:
        ap.error("--no-fetch needs --raw-dir")
    raw_dir = a.raw_dir or tempfile.mkdtemp(prefix="climate_raw_")
    os.makedirs(raw_dir, exist_ok=True)

    with open(TARGET, encoding="utf-8") as f:
        cur = json.load(f)
    by_key = {(c["country"], c["city"]): c for c in cur["cities"]}

    now = datetime.datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S%z")
    changed = []
    todo = [c for c in CITIES if not a.only or c[1] in a.only]
    for i, (country, name, lat, lon, cs) in enumerate(todo):
        url = url_for(lat, lon, cs)
        fn = os.path.join(raw_dir, raw_name(country, name))
        if a.no_fetch:
            with open(fn, encoding="utf-8") as f:
                d = json.load(f)
        else:
            if i: time.sleep(a.sleep)
            d = fetch(url, name)
            with open(fn, "w", encoding="utf-8") as f:
                json.dump(d, f)
            print("ok", name, flush=True)
        new = build_city(d, country, name, lat, lon, cs, url)
        old = by_key.get((country, name))
        if old is None:
            new["fetched"] = now
            cur["cities"].append(new); by_key[(country, name)] = new
            changed.append(f"{name}: new city")
            continue
        diffs = [k for k in COMPUTED if old.get(k) != new[k]]
        if diffs:
            for k in COMPUTED: old[k] = new[k]
            old["fetched"] = now
            changed.append(f"{name}: {', '.join(diffs)}")

    out = os.environ.get("GITHUB_OUTPUT")
    if changed:
        print("Changed:\n  " + "\n  ".join(changed))
        if not a.dry_run:
            cur["meta"]["generated"] = now[:10]
            with open(TARGET, "w", encoding="utf-8") as f:
                json.dump(cur, f, indent=1, ensure_ascii=False)
            print(f"Wrote {os.path.relpath(TARGET, ROOT)}")
    else:
        print("No changes; file left untouched.")
    if out:
        with open(out, "a") as f:
            f.write(f"changed={'true' if changed and not a.dry_run else 'false'}\n")


if __name__ == "__main__":
    main()
