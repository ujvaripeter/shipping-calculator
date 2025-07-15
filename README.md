# Shipping Calculator

## 🇭🇺 Használat
1. Repozitórium klónozása
   ```bash
   git clone <repo-url>
   cd shipping-calculator
   npm install
   ```
2. Fejlesztői szerver indítása
   ```bash
   npm run dev
   ```
3. Futás tesztek
   ```bash
   npm run test
   ```
4. Lint és build
   ```bash
   npm run lint
   npm run build
   ```

### Példa API kérés
```bash
curl -X POST http://localhost:3000/api/calculate-shipping \
  -H 'Content-Type: application/json' \
  -d '{
    "address": "1076 Budapest, Garay tér 13",
    "floors": 2,
    "extreme": true,
    "transfer": false,
    "oldRemoval": true,
    "tier": "furniture_assembly"
  }'
```
Várható válasz:
```json
{
  "km": 4.1,
  "breakdown": {
    "shipCost": 22500,
    "floorCost": 2000,
    "extremeCost": 5000,
    "transferCost": 0,
    "oldCost": 15000,
    "total": 44500
  }
}
```

### Vercel deploy
1. Készíts `.env.local` ha saját email címet szeretnél megadni a Nominatim
   szolgáltatáshoz:
   ```env
   NOMINATIM_EMAIL=you@example.com
   ```
2. `vercel --prod`
3. Figyelj a Nominatim rate limitre (1 kérés/mp).

## 🇬🇧 Usage
1. Clone the repository
   ```bash
   git clone <repo-url>
   cd shipping-calculator
   npm install
   ```
2. Start the dev server
   ```bash
   npm run dev
   ```
3. Run tests
   ```bash
   npm run test
   ```
4. Lint and build
   ```bash
   npm run lint
   npm run build
   ```

### Example request
See the Hungarian section above for a sample `curl` command. The JSON
response matches the numbers produced by the original Python calculator.

### Deploy to Vercel
1. Optionally create `.env.local` with `NOMINATIM_EMAIL=you@example.com` to set
   a custom User-Agent for Nominatim.
2. Run `vercel --prod` to deploy.
3. Be mindful of the free Nominatim usage policy (1 request per second).
