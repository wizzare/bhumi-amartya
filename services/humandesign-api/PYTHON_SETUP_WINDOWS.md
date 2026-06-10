# Python Setup on Windows for Human Design Service

## 1. Install Python (3.11 or 3.12)

Download from:

https://www.python.org/downloads/windows/

Important during installer:

- Check: `Add python.exe to PATH`

## 2. Verify Python in a new PowerShell terminal

Run:

```powershell
python --version
pip --version
```

If `python` still opens Microsoft Store alias:

1. Open **Windows Settings**
2. Go to **Apps**
3. Go to **Advanced app settings**
4. Open **App execution aliases**
5. Turn off:
   - `python.exe`
   - `python3.exe`

Then reopen PowerShell and run again:

```powershell
python --version
pip --version
```

## 3. Start Human Design service

```powershell
cd C:\Users\shein\bhumi-amartya-clean\services\humandesign-api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 4. Verify service

Open:

http://localhost:8000/docs

## 5. Test `/calculate` endpoint

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/calculate" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Widhi","year":1985,"month":5,"day":3,"hour":23,"minute":45,"utc_offset":7}'
```

## 6. After service works

1. Clear localStorage in browser console:

```javascript
localStorage.removeItem("bhumiUserProfile");
localStorage.removeItem("bhumiUserBlueprint");
```

2. Submit Setup again from the app.
3. Dashboard should show Human Design type (if service returns `status: "ready"` with `type`).
