# Scand Control Tower — ieslēgt MI Cloudflare bez programmēšanas

**Statuss:** Scand Control Tower mājaslapa un Supabase darba datubāze jau izveidota. Cloudflare MI Worker vēl jāizvieto tavā Cloudflare kontā. Kamēr tas nav izdarīts, mākoņa MI čats nedarbosies.

## 1. Izveido Worker (Cloudflare kontā)
1. Atver [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**.
2. Spied **Create application** → **Create Worker / Start with Hello World** (nosaukums UI var atšķirties).
3. Nosaukums: `scand-control-tower-ai`. Spied **Deploy**.
4. Atver Worker → **Edit Code**.
5. Aizstāj visu parauga kodu ar [worker/index.js](https://github.com/Savitur-HUB/SCAND-control-tower/blob/main/worker/index.js) saturu un spied **Deploy**.
6. Worker sadaļā **Settings → Bindings → Add** izvēlies **Workers AI**, binding name **AI**. Saglabā un izvieto izmaiņas. Šis solis ir obligāts.

## 2. Pārbaudi
Atver Cloudflare piešķirto `https://...workers.dev` adresi. Jāparādās JSON ar `"service":"Scand Control Tower AI"` un `"ready":true`.
Ja rāda `ready:false`, jāpievieno Workers AI binding `AI`.

Worker kodā jau ir projekta **publiskā Supabase adrese un publishable key**, tāpēc Cloudflare nevar prasīt ielīmēt slepenu Supabase atslēgu. Piekļuve datiem tiek pārbaudīta ar lietotāja autorizāciju un `scand_members` sarakstu. Nekad neizmanto `service_role` atslēgu šeit.

## 3. Pieslēdz Control Tower
Atsūti ChatGPT savu **publisko Worker URL** (bez parolēm/tokenu datiem). Pēc tam varu to uzstādīt GitHub mājaslapā kā noklusējuma MI serveri visai komandai. Pretējā gadījumā var manuāli ievietot Worker URL Control Tower MI iestatījumos.

## 4. Kolēģu konti
Supabase `Authentication → Users` izveido vai uzaicini darbinieku kontus un pievieno apstiprināto lietotāju `user_id` tabulā `public.scand_members`. Tieši šis dalībnieku saraksts kontrolē piekļuvi. Darbiniekiem būs vajadzīga pieteikšanās **Komandas režīms**, lai varētu lietot mākoņa MI.

**Piezīmes:** Neievadi produkcijas kravu vai klientu datus, kamēr darba devējs nav apstiprinājis ārēju pakalpojumu izmantošanu un piekļuves drošība nav pārbaudīta. Bezmaksas Cloudflare Workers AI ir dienas apjoma ierobežojumi. MI piedāvātie labojumi jāapstiprina dispečeram.
