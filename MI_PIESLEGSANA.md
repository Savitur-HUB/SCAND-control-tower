# Scand Control Tower — MI pieslēgšana

V10 GitHub Pages jau ir MI čats gan telefonā, gan datorā. **Tas nav pieslēgts mākoņa MI, kamēr nav izveidots Worker un autorizēta Supabase datubāze.**

1. Izveido Supabase projektu un izpildi `SUPABASE_SETUP.sql` testa projektā. Izveido lietotāju kontus, pievieno `scand_members`. Neizmanto reālus kravu datus, kamēr nav pārbaudītas piekļuves tiesības.
2. Izveido Cloudflare Workers projektu ar šajā repozitorijā esošo `worker/index.js` un `worker/wrangler.toml`. Aktivizē Workers AI binding `AI`. Pārbaudi bezmaksas limitus savā kontā.
3. Cloudflare Worker iestatījumos pievieno **secrets**: `SUPABASE_URL` un `SUPABASE_ANON_KEY` (publiskā/anon projekta atslēga). NELIEC API slepenās atslēgas HTML vai publiskajā GitHub.
4. Mājaslapā `Komandas režīms` autorizējies ar Supabase kontu.
5. MI sadaļā ieliec publicētā Cloudflare Worker HTTPS adresi un saglabā.
6. Pārbaudi testa jautājumus no tālruņa un datora. Saglabājamos labojumus apstiprina cilvēks.

**GitHub glabā kodu**, nevis visas darbības un visas MI atbildes. `MI zināšanas` ir komandas terminu/glosārija konteksts, nevis automātiska modeļa pārmācīšana. Kabotāžas, darba un atpūtas laiku prognozes ir informatīvas un jāpārbauda pret dokumentiem/tahogrāfu.