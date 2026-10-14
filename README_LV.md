# SCAND CONTROL TOWER V6 — AI OPERATIONS

## Kas tas ir?
Bezmaksas **izmēģinājuma mājaslapa** transporta plānošanai ar rediģējamu tabulu, reisu žurnālu, mašīnu profiliem, importēšanas iespējām, MI terminu vārdnīcu, ātro komandu asistentu un izvēles lokālu Qwen valodas modeli.

**Statuss:** izmēģinājuma projekts ar izdomātiem datiem. Nav pieslēgts Xspeda, Outlook, GPS, tahogrāfam, faktiskiem Hellmann datiem, reālai Supabase datubāzei vai ārējam OpenAI API. Kopīgais režīms ir ieprogrammēts, bet jūsu Supabase kontā tas atsevišķi jāieslēdz un jāpārbauda. Šī programma nav juridiska vai satiksmes drošības lēmumu sistēma.

## 1. Ātrs izmēģinājums (bez kontiem)

1. Atver `index.html` pārlūkā Chrome/Edge vai `Scand_Control_Tower_V6_AI_Demo.html` no sarunas.
2. `Kopīgais plāns`: rediģē rindas, atver mašīnas kartīti, pievieno reisu. Izmanto izdomātus datus.
3. Noklikšķini uz `MI asistents`. Noteikumu režīms strādā arī bez jebkāda modela lejupielādes.
4. Izmēģini ziņojumus:
   - `Kas ar 479?`
   - `Kuras mašīnas bez nākamā reisa?`
   - `Kādi ir laika konflikti?`
   - `479 izkraujas Malmö 2026-10-17 09:00`
   - `479; nodaļa: Cross-trade; izkraušanas vieta: DK Aarhus; izkraušanas laiks: 18.10.2026 10:00`
5. Pirms labojuma vienmēr spied `Apstiprināt labojumu`. Ja datums nav droši noteikts, precizē to.
6. `MI zināšanas`: pievieno uzņēmuma terminus un apstiprinātus darba skaidrojumus. Tie tiek saglabāti kopā ar plāna datiem; modelis pats sevi nepārtrenē.
7. Regulāri lejupielādē `JSON rezerves kopija`.

**Lokālajā režīmā** informācija dzīvo tikai tavā pārlūkā (localStorage), ne GitHub repozitorijā un ne citu kolēģu datoros. Pārlūka atmiņas tīrīšana to var izdzēst.

## 2. Spēcīgāks vietējais MI bez API izmaksām

`MI asistents` → izvēlies modeli:
- `Qwen2.5 0.5B` — vieglāks, aptuveni 0,8 GB modeļa lejupielāde.
- `Qwen2.5 1.5B` — stiprāks, aptuveni 1,2–1,8 GB lejupielāde, un vajadzīgs vairāk GPU atmiņas.

Nospied `Ielādēt izvēlēto MI`. Šim nolūkam tiek izmantota Transformers.js bibliotēka un Hugging Face ONNX modeļi pārlūkā. Pirmo reizi nepieciešams internets, saderīgs WebGPU un HTTPS (ieteicams GitHub Pages), vai localhost. Uz uzņēmuma datora administratora iestatījumi var WebGPU un lejupielādes bloķēt. Ja tas notiek, noteikumu režīms paliek pieejams.

**Modelis nesaprot nevainojami:** atbildes jāpārbauda cilvēkam. Qwen modeļa reālā lejupielāde un ģenerēšana šīs piegādes automatizētajos testos netika veikta. Testēta ir UI modeļu izvēle un strukturētās atbildes validācija ar imitētu modeļa izvadi. Modeļa lielumu nevar uztvert kā garantiju pareizai loģistikas interpretācijai.

## 3. Kopīga datubāze pieciem lietotājiem

GitHub Pages ir **statiskās mājaslapas hostings**, ne datubāze. Lai vairāki cilvēki redzētu vienu un to pašu plānu, izmantots Supabase projekts.

1. Izveido Supabase projektu: https://supabase.com/dashboard.
2. `SQL Editor` izpildi `SUPABASE_SETUP.sql`. Tajā tiek izveidotas `scand_workspace` un `scand_members` tabulas ar row-level-security (RLS) piekļuves politikām.
3. `Authentication > Users` izveido 2–5 lietotājus; atspējo publisku reģistrāciju un pievieno katru lietotāju `scand_members` ar tā Auth UUID, kā norādīts SQL failā.
4. Testa kontā izmanto **anon/publishable** atslēgu un Project URL. **Nekad neievieto `service_role` vai `secret` atslēgu HTML/JavaScript kodā vai GitHub.**
5. Atver mājaslapā `Komandas režīms`, ievadi URL, publishable key, konta e-pastu un paroli.
6. Ja komandas datubāze tukša, pēc lokālās demonstrācijas labojumu saglabāšanas var pārnest testa plānu ar `Pārnest lokālo demo`.
7. Atver otru datoru/pārlūku ar citu uzaicinātu kontu un pārbaudi sinhronizāciju un versiju konfliktus.

Izmaiņas tiek pārbaudītas ar dokumenta versijas salīdzināšanu (compare-and-swap), lai nekontrolēti nepārrakstītu kolēģa ierakstu. Tā nav pilnvērtīga transakciju un piekļuves kontroles pārbaude uzņēmuma produkcijas līmenī. Rezerves režīmā plāns tiek nolasīts aptuveni reizi 15 sekundēs; ja derīgs Realtime kanāls ir aktivizēts, atjaunošana var pienākt ātrāk.

Pēc noklusējuma ir viens kopīgs JSON dokuments: tas ir piemērots nelielam pilotam, ne lielam autoparkam ar intensīvu vienlaicīgu rediģēšanu. Veiktspējas un drošības pārbaudes uzņēmuma lietošanai vēl ir vajadzīgas.

## 4. GitHub Pages publicēšana

1. GitHub izveido atsevišķu repozitoriju testa mājaslapai.
2. Augšupielādē `index.html`, `.nojekyll`, `README_LV.md`, `SUPABASE_SETUP.sql`. **Neaugšupielādē** darba Excel vai JSON rezerves kopijas.
3. `Settings → Pages → Deploy from a branch → main / root`.
4. Atver `https://TAVS-USER.github.io/REPO/`.
5. Tādā režīmā pārlūka lokālā MI modeļa palaišanai ir HTTPS izcelsme.

## 5. Excel importēšana

`Kopīgais plāns → Excel fails` ļauj priekšskatīt standarttabulas (.xlsx/.csv), izvēlēties lapu un galvenes rindu; importam no CDN tiek pieprasīta SheetJS bibliotēka. Sarežģītiem Scand plāniem ar apvienotām šūnām vai brīvas formas nodaļām var būt vajadzīga individuāla kolonnu karte. Ja CDN bloķēts, izmanto `Ielīmēt no Excel` ar vienkāršām tabulatoru atdalītām rindām. Pirms importa saglabā JSON rezerves kopiju.

## 6. Loģistikas drošības robežas

- Kabotāžas tiesības netiek aprēķinātas bez pilnas reisu un pārvadātāja valsts vēstures. MI uz to nevar paļauties kā uz juridisku apstiprinājumu.
- Vadītāja atlikušo darba/braukšanas laiku nevar pārbaudīt bez faktiskajiem tahogrāfa un atpūtas datiem.
- ETA aprēķināšanai nav integrētas GPS/kartes vai prāmju grafiki.
- Likme `€/km` ir transporta izmaksu lauks, ne automātiski klienta cena vai marža.
- MAŠĪNU/REISU DEMONSTRĀCIJAS DATI IR IZDOMĀTI.
- GitHub Pages mājaslapas kods ir publiski pieejams. Reāliem šoferu kontaktiem, komerciālām cenām, klientu orderiem un uzņēmuma sistēmu integrācijām pirms izmantošanas vajadzīgs IT un datu aizsardzības saskaņojums.
- Arī Supabase bezmaksas plānam ir limiti un izmantošanas noteikumi; tie var mainīties.

## 7. Testu tvērums

Veiktas divas automatizētas pārbaudes kārtas Chrome/Chromium vidē ar testa datiem. Pārbaudīta JS sintakse, mašīnas atbildes, dabiskās valodas un kolonnu komandas, labojuma apstiprināšana, saraksta pieejamība, laika konflikti, vārdnīcas saglabāšana un atjaunošana, datoru/mobilo maketu izkārtojumi, Excel ielīmēšana, nepareizu datumu un kļūdaina mašīnas ID noraidīšana, MI atbildes shēmas pārbaude un darbība bez WebGPU. Daži testi izmanto pārbaudes aizstājējus (localStorage emulatoru vai MI atbildes imitāciju). **Nav testēts aktīvs Supabase konts, vairāku reālu lietotāju sinhronizācija, reāls MI modeļa lejupielādes process un lietojums ar uzņēmuma datiem.**
