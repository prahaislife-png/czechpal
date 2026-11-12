/**
 * The dictionary's word list: one word a line, as `word|type|meaning|example|example in English`
 * (the last two may be empty). Kept as one string and read on first use, so it costs nothing
 * until the screen is opened. See index.ts for the types and how it is sorted.
 */
// prettier-ignore
export const RAW = `
adresa|f|address|Jaká je vaše adresa?|What is your address?
ahoj|phr|hi; bye (informal)|Ahoj, jak se máš?|Hi, how are you?
ale|conj|but|Je to drahé, ale dobré.|It’s expensive but good.
asi|adv|probably; about|Přijdu asi v šest.|I’ll come at about six.
auto|n|car|Kde parkuje tvoje auto?|Where is your car parked?
autobus|m|bus|Autobus jede za pět minut.|The bus leaves in five minutes.
banka|f|bank|Musím jít do banky.|I have to go to the bank.
barva|f|colour|Jaká je tvoje oblíbená barva?|What’s your favourite colour?
bát se|v|to be afraid|Nebojte se zeptat.|Don’t be afraid to ask.
bez|prep|without|Kávu bez cukru, prosím.|Coffee without sugar, please.
bílý|adj|white|Dám si bílé víno.|I’ll have white wine.
bohužel|adv|unfortunately|Bohužel nemám čas.|Unfortunately I don’t have time.
bolet|v|to hurt|Bolí mě hlava.|I have a headache.
brát|v|to take|Berete karty?|Do you take cards?
brzy|adv|soon; early|Uvidíme se brzy.|See you soon.
budoucnost|f|future|Jaké máš plány do budoucnosti?|What are your plans for the future?
bydlet|v|to live (reside)|Bydlím v centru.|I live in the centre.
byt|m|flat, apartment|Hledám byt na Vinohradech.|I’m looking for a flat in Vinohrady.
být|v|to be|Chci být doma.|I want to be at home.
celý|adj|whole|Pracoval jsem celý den.|I worked the whole day.
cena|f|price|Jaká je cena?|What’s the price?
cesta|f|way; journey|Cesta trvá dvě hodiny.|The journey takes two hours.
cestovat|v|to travel|Rád cestuju vlakem.|I like travelling by train.
cizinec|m|foreigner|Jsem cizinec, mluvte prosím pomalu.|I’m a foreigner, please speak slowly.
co|pron|what|Co si dáte?|What will you have?
cukr|m|sugar|S cukrem, nebo bez?|With sugar or without?
čaj|m|tea|Dám si černý čaj.|I’ll have black tea.
čas|m|time|Nemám dnes čas.|I don’t have time today.
často|adv|often|Často chodím pěšky.|I often walk.
čekat|v|to wait|Čekám na tramvaj.|I’m waiting for the tram.
černý|adj|black|Mám černý kabát.|I have a black coat.
čerstvý|adj|fresh|Je ten chleba čerstvý?|Is that bread fresh?
česky|adv|(in) Czech|Mluvím trochu česky.|I speak a little Czech.
číslo|n|number|Jaké je vaše telefonní číslo?|What’s your phone number?
číst|v|to read|Čtu knihu v češtině.|I’m reading a book in Czech.
člověk|m|person|Je to milý člověk.|He’s a nice person.
čtvrtek|m|Thursday|Ve čtvrtek mám volno.|I’m off on Thursday.
dárek|m|gift|Koupil jsem ti dárek.|I bought you a gift.
dát si|v|to have (food, drink)|Dám si polévku.|I’ll have the soup.
děkuju|phr|thank you|Děkuju za pomoc.|Thanks for the help.
dělat|v|to do; to make|Co děláš o víkendu?|What are you doing at the weekend?
den|m|day|Hezký den!|Have a nice day!
dnes|adv|today|Dnes je zima.|It’s cold today.
dobrý|adj|good|Dobrý den.|Good day (hello).
doklad|m|document, ID|Máte u sebe doklad?|Do you have ID on you?
doleva|adv|to the left|Na křižovatce doleva.|Left at the junction.
doprava|adv|to the right|Zahněte doprava.|Turn right.
dost|adv|enough; quite|To je dost daleko.|That’s quite far.
dovolená|f|holiday, leave|Příští týden mám dovolenou.|I’m on leave next week.
drahý|adj|expensive; dear|To je moc drahé.|That’s too expensive.
důležitý|adj|important|To je důležitá schůzka.|That’s an important meeting.
dům|m|house|Bydlíme ve starém domě.|We live in an old house.
dveře|pl|door|Zavřete dveře, prosím.|Close the door, please.
e-mail|m|email|Pošlu vám e-mail.|I’ll send you an email.
euro|n|euro|Můžu platit v eurech?|Can I pay in euros?
existovat|v|to exist|Taková možnost neexistuje.|No such option exists.
faktura|f|invoice|Pošlete mi fakturu.|Send me the invoice.
film|m|film|Ten film je s titulky.|That film has subtitles.
fronta|f|queue|Na poště je dlouhá fronta.|There’s a long queue at the post office.
fungovat|v|to work, function|Výtah nefunguje.|The lift isn’t working.
guláš|m|goulash|Guláš s knedlíky, prosím.|Goulash with dumplings, please.
hezký|adj|nice, pretty|To je hezký výhled.|That’s a nice view.
hlad|m|hunger|Mám hlad.|I’m hungry.
hlava|f|head|Hlavu vzhůru!|Chin up!
hledat|v|to look for|Hledám stanici metra.|I’m looking for the metro station.
hned|adv|right away|Hned jsem tam.|I’ll be right there.
hodina|f|hour; lesson|Sejdeme se za hodinu.|Let’s meet in an hour.
hodně|adv|a lot|Mám hodně práce.|I have a lot of work.
hora|f|mountain|V zimě jezdíme na hory.|In winter we go to the mountains.
hospoda|f|pub|Jdeme do hospody?|Shall we go to the pub?
host|m|guest|Večer máme hosty.|We have guests this evening.
hotovost|f|cash|Platíte kartou, nebo v hotovosti?|Are you paying by card or in cash?
hrát|v|to play|Hraješ na kytaru?|Do you play the guitar?
chápat|v|to understand, grasp|Chápu, co myslíš.|I get what you mean.
chleba|m|bread|Koupíš chleba?|Will you buy bread?
chodit|v|to go (on foot, regularly)|Chodím do práce pěšky.|I walk to work.
chtít|v|to want|Chci se naučit česky.|I want to learn Czech.
chuť|f|taste; appetite|Dobrou chuť!|Enjoy your meal!
chvíle|f|moment, while|Počkejte chvíli.|Wait a moment.
chyba|f|mistake|Udělal jsem chybu.|I made a mistake.
chytrý|adj|smart|To je chytrý nápad.|That’s a smart idea.
i|conj|and also; even|Přijde i Petr.|Petr is coming too.
informace|f|information|Kde najdu víc informací?|Where can I find more information?
inzerát|m|advert, listing|Viděl jsem inzerát na byt.|I saw a listing for a flat.
jak|adv|how|Jak se to řekne česky?|How do you say it in Czech?
jaro|n|spring|Na jaře je Praha nejhezčí.|Prague is prettiest in spring.
jazyk|m|language; tongue|Čeština je těžký jazyk.|Czech is a difficult language.
jednoduchý|adj|simple|Není to tak jednoduché.|It’s not that simple.
jet|v|to go (by vehicle)|Jedu vlakem do Brna.|I’m going to Brno by train.
ještě|adv|still; more|Ještě jedno, prosím.|One more, please.
jídlo|n|food, meal|Jídlo bylo výborné.|The food was excellent.
jíst|v|to eat|Nejím maso.|I don’t eat meat.
jistě|adv|certainly|Jistě, žádný problém.|Certainly, no problem.
jít|v|to go (on foot)|Jdu domů.|I’m going home.
jízdenka|f|ticket (transport)|Kde si koupím jízdenku?|Where can I buy a ticket?
jméno|n|name|Jaké je vaše jméno?|What is your name?
kam|adv|where to|Kam jdeš?|Where are you going?
kamarád|m|friend|To je můj kamarád z práce.|This is my friend from work.
karta|f|card|Můžu platit kartou?|Can I pay by card?
káva|f|coffee|Jednu kávu s mlékem.|One coffee with milk.
každý|pron|every; everyone|Každý den se učím nové slovo.|I learn a new word every day.
kde|adv|where|Kde je záchod?|Where is the toilet?
kdy|adv|when|Kdy máš čas?|When are you free?
klíč|m|key|Zapomněl jsem klíče.|I forgot my keys.
knedlík|m|dumpling|Dáte si knedlíky, nebo rýži?|Would you like dumplings or rice?
kniha|f|book|Tu knihu jsem ještě nečetl.|I haven’t read that book yet.
kolega|m|colleague|Můj kolega je na dovolené.|My colleague is on holiday.
kolik|adv|how much, how many|Kolik to stojí?|How much is it?
konec|m|end|Na konci ulice doleva.|Left at the end of the street.
koupit|v|to buy|Chci si koupit kolo.|I want to buy a bike.
kousek|m|a bit; a piece|Je to kousek odsud.|It’s just a short way from here.
krásný|adj|beautiful|Máte krásný byt.|You have a beautiful flat.
krk|m|neck; throat|Bolí mě v krku.|I have a sore throat.
který|pron|which|Který vlak jede do Plzně?|Which train goes to Plzeň?
kuchyně|f|kitchen; cuisine|Mám rád českou kuchyni.|I like Czech cuisine.
láska|f|love|Byla to láska na první pohled.|It was love at first sight.
lék|m|medicine|Potřebuju lék proti bolesti.|I need a painkiller.
lékárna|f|pharmacy|Kde je nejbližší lékárna?|Where is the nearest pharmacy?
lékař|m|doctor|Musím jít k lékaři.|I have to see a doctor.
letiště|n|airport|Jak se dostanu na letiště?|How do I get to the airport?
léto|n|summer|V létě jezdíme k vodě.|In summer we head for the water.
levný|adj|cheap|Znáte nějakou levnou restauraci?|Do you know a cheap restaurant?
líbit se|v|to be pleasing; to like|Praha se mi líbí.|I like Prague.
lidé|pl|people|V metru je moc lidí.|There are too many people in the metro.
lístek|m|ticket; slip|Dva lístky do kina.|Two cinema tickets.
málo|adv|little, few|Mám málo času.|I have little time.
maso|n|meat|Maso nekupuju často.|I don’t buy meat often.
měsíc|m|month; moon|Za měsíc mám dovolenou.|I have a holiday in a month.
město|n|town, city|Sejdeme se ve městě.|Let’s meet in town.
místo|n|place; seat|Je tohle místo volné?|Is this seat free?
mít|v|to have|Mám otázku.|I have a question.
mít rád|v|to like|Mám rád českou hudbu.|I like Czech music.
mléko|n|milk|Došlo nám mléko.|We’ve run out of milk.
mluvit|v|to speak|Mluvíte anglicky?|Do you speak English?
moc|adv|very; too much|Moc děkuju.|Thank you very much.
moct|v|can, to be able|Můžete mi pomoct?|Can you help me?
možná|adv|maybe|Možná přijdu později.|Maybe I’ll come later.
muset|v|must, to have to|Musím už jít.|I have to go now.
myslet|v|to think|Myslím, že ano.|I think so.
na shledanou|phr|goodbye|Děkuju, na shledanou.|Thank you, goodbye.
nádraží|n|railway station|Sejdeme se na hlavním nádraží.|Let’s meet at the main station.
nájem|m|rent|Nájem platím každý měsíc.|I pay rent every month.
nákup|m|shopping|Jdu na nákup.|I’m going shopping.
náměstí|n|square|Bydlím blízko náměstí Míru.|I live near náměstí Míru.
nápad|m|idea|To je dobrý nápad.|That’s a good idea.
napsat|v|to write (and finish)|Napíšu ti zprávu.|I’ll text you.
nebo|conj|or|Čaj, nebo kávu?|Tea or coffee?
něco|pron|something|Dáte si něco k pití?|Would you like something to drink?
neděle|f|Sunday|V neděli mají zavřeno.|They’re closed on Sunday.
nemocnice|f|hospital|Nemocnice je hned za rohem.|The hospital is just round the corner.
nikdy|adv|never|Nikdy jsem tam nebyl.|I’ve never been there.
noc|f|night|Dobrou noc.|Good night.
nový|adj|new|Mám novou práci.|I have a new job.
nutný|adj|necessary|Je nutné vyplnit formulář.|It’s necessary to fill in the form.
občas|adv|sometimes|Občas vařím doma.|I sometimes cook at home.
oběd|m|lunch|Jdeme na oběd?|Shall we go for lunch?
objednat|v|to order|Můžeme si objednat?|Can we order?
oblíbený|adj|favourite|To je moje oblíbená kavárna.|That’s my favourite café.
obsazeno|adv|occupied, taken|Promiňte, tady je obsazeno.|Sorry, this seat is taken.
obchod|m|shop; business|Obchod zavírá v osm.|The shop closes at eight.
odpověď|f|answer|Čekám na odpověď.|I’m waiting for an answer.
okno|n|window|Můžu otevřít okno?|May I open the window?
omlouvat se|v|to apologise|Omlouvám se za zpoždění.|I apologise for the delay.
opravdu|adv|really|Opravdu? To jsem nevěděl.|Really? I didn’t know that.
otázka|f|question|To je dobrá otázka.|That’s a good question.
otevřeno|adv|open|Máte otevřeno i v sobotu?|Are you open on Saturday too?
ovoce|n|fruit|Na trhu mají čerstvé ovoce.|They have fresh fruit at the market.
pak|adv|then|Nejdřív práce, pak zábava.|Work first, then fun.
pamatovat si|v|to remember|Nepamatuju si heslo.|I don’t remember the password.
pán|m|Mr; gentleman|Ten pán tu byl první.|That gentleman was here first.
peníze|pl|money|Nemám u sebe peníze.|I don’t have money on me.
pes|m|dog|Náš pes se jmenuje Max.|Our dog is called Max.
pivo|n|beer|Jedno pivo, prosím.|One beer, please.
platit|v|to pay|Dnes platím já.|I’m paying today.
počasí|n|weather|Jaké bude zítra počasí?|What will the weather be like tomorrow?
počkat|v|to wait (a bit)|Počkej na mě!|Wait for me!
pomalu|adv|slowly|Mluvte pomalu, prosím.|Speak slowly, please.
pomoc|f|help|Potřebuju pomoc.|I need help.
pondělí|n|Monday|V pondělí začínám v devět.|On Monday I start at nine.
potřebovat|v|to need|Potřebuju nový telefon.|I need a new phone.
potvrzení|n|confirmation, certificate|Pošlete mi potvrzení e-mailem.|Send me the confirmation by email.
práce|f|work, job|Jak bylo v práci?|How was work?
pracovat|v|to work|Pracuju z domu.|I work from home.
proč|adv|why|Proč ne?|Why not?
prosím|phr|please; you’re welcome|Účet, prosím.|The bill, please.
protože|conj|because|Učím se česky, protože tu žiju.|I’m learning Czech because I live here.
první|num|first|Jsem tu poprvé, je to moje první návštěva.|I’m here for the first time, it’s my first visit.
přestup|m|transfer, change|Přestup na linku C.|Change to line C.
příjmení|n|surname|Jak se píše vaše příjmení?|How do you spell your surname?
příští|adj|next|Příští zastávka: Muzeum.|Next stop: Muzeum.
přítel|m|friend; boyfriend|To je můj starý přítel.|This is my old friend.
ptát se|v|to ask|Ptám se, protože nevím.|I’m asking because I don’t know.
půl|num|half|Je půl osmé.|It’s half past seven.
rád|adj|glad; gladly|Rád vás poznávám.|Pleased to meet you.
ráno|n|morning|Ráno piju kávu.|I drink coffee in the morning.
rodina|f|family|Jak se má tvoje rodina?|How is your family?
rok|m|year|Letos je to už druhý rok.|This is already the second year.
rozumět|v|to understand|Nerozumím.|I don’t understand.
ruka|f|hand; arm|Podej mi ruku.|Give me your hand.
ryba|f|fish|V pátek máme rybu.|We’re having fish on Friday.
rychle|adv|quickly|Ne tak rychle, prosím.|Not so fast, please.
řeka|f|river|Vltava je nejdelší česká řeka.|The Vltava is the longest Czech river.
říct|v|to say, tell|Můžete to říct ještě jednou?|Can you say that once more?
řidič|m|driver|Řidič autobusu byl moc milý.|The bus driver was very kind.
řídit|v|to drive; to manage|Neřídím, jezdím metrem.|I don’t drive, I take the metro.
sám|adj|alone; oneself|Udělám to sám.|I’ll do it myself.
sedět|v|to sit|Kde chcete sedět?|Where would you like to sit?
schůzka|f|meeting; date|Mám schůzku v deset.|I have a meeting at ten.
slovník|m|dictionary|Podívám se do slovníku.|I’ll look in the dictionary.
slovo|n|word|Co znamená to slovo?|What does this word mean?
smlouva|f|contract|Podepsal jsem nájemní smlouvu.|I signed the lease.
snídaně|f|breakfast|Snídaně je od sedmi.|Breakfast is from seven.
sobota|f|Saturday|V sobotu spím dlouho.|I sleep in on Saturday.
soused|m|neighbour|Náš soused je moc hodný.|Our neighbour is very kind.
spát|v|to sleep|Spal jsem jen pět hodin.|I slept only five hours.
spěchat|v|to hurry|Promiňte, spěchám.|Sorry, I’m in a hurry.
správně|adv|correctly, right|Říkám to správně?|Am I saying it right?
stanice|f|station|Vystupte na příští stanici.|Get off at the next station.
starý|adj|old|Staré Město je plné turistů.|The Old Town is full of tourists.
stát|v|to cost; to stand|Kolik stojí lístek?|How much is a ticket?
středa|f|Wednesday|Ve středu chodím plavat.|I go swimming on Wednesdays.
stůl|m|table|Stůl pro dva, prosím.|A table for two, please.
svět|m|world|Svět je malý.|It’s a small world.
šéf|m|boss|Musím se zeptat šéfa.|I have to ask my boss.
škola|f|school|Škola začíná v osm.|School starts at eight.
špatný|adj|bad; wrong|To je špatná adresa.|That’s the wrong address.
šťastný|adj|happy|Šťastnou cestu!|Have a good trip!
štěstí|n|luck; happiness|Hodně štěstí!|Good luck!
tady|adv|here|Tady, nebo s sebou?|For here or to take away?
taky|adv|also|Já taky.|Me too.
teď|adv|now|Teď nemůžu.|I can’t right now.
teplo|n|warmth; warm|Dnes je teplo.|It’s warm today.
těšit se|v|to look forward|Těším se na víkend.|I’m looking forward to the weekend.
těžký|adj|heavy; difficult|Ten kufr je moc těžký.|That suitcase is too heavy.
tramvaj|f|tram|Tramvaj číslo 22 jede na Hrad.|Tram 22 goes to the Castle.
trh|m|market|V sobotu jsou farmářské trhy.|There’s a farmers’ market on Saturday.
trochu|adv|a little|Jsem trochu nervózní.|I’m a little nervous.
týden|m|week|Uvidíme se za týden.|See you in a week.
účet|m|bill; account|Můžu poprosit o účet?|Could I have the bill?
učit se|v|to learn|Učím se česky každý den.|I learn Czech every day.
ulice|f|street|V které ulici bydlíš?|Which street do you live on?
umět|v|to know how|Umíš plavat?|Can you swim?
unavený|adj|tired|Jsem dnes unavený.|I’m tired today.
úřad|m|office (authority)|Zítra musím na úřad.|I have to go to the office tomorrow.
úterý|n|Tuesday|V úterý mám češtinu.|I have Czech class on Tuesday.
už|adv|already; any more|Už to chápu.|I get it now.
vařit|v|to cook|Kdo dnes vaří?|Who’s cooking today?
včera|adv|yesterday|Včera pršelo.|It rained yesterday.
věc|f|thing|To je jiná věc.|That’s a different matter.
večer|m|evening|Co děláš dnes večer?|What are you doing this evening?
večeře|f|dinner|Zvu tě na večeři.|I’m inviting you to dinner.
vědět|v|to know (a fact)|Nevím.|I don’t know.
velký|adj|big|Jedno velké pivo.|One large beer.
víkend|m|weekend|Hezký víkend!|Have a nice weekend!
vítejte|phr|welcome|Vítejte v Praze!|Welcome to Prague!
vlak|m|train|Vlak má zpoždění.|The train is delayed.
voda|f|water|Perlivou, nebo neperlivou vodu?|Sparkling or still water?
volno|n|time off; free|Zítra mám volno.|I’m off tomorrow.
vpravo|adv|on the right|Banka je vpravo.|The bank is on the right.
vstup|m|entrance; admission|Vstup zdarma.|Free admission.
výborně|adv|excellent|Výborně, to stačí.|Excellent, that’s enough.
výstup|m|exit, getting off|Výstup jen předními dveřmi.|Exit by the front door only.
vždycky|adv|always|Vždycky chodím včas.|I always come on time.
zabalit|v|to wrap, pack|Můžete mi to zabalit s sebou?|Can you pack it to go?
začít|v|to begin|Kdy to začne?|When does it start?
zadarmo|adv|for free|Děti mají vstup zadarmo.|Children get in for free.
zahrada|f|garden|Sedíme venku na zahradě.|We’re sitting outside in the garden.
zastávka|f|stop (tram, bus)|Vystupuju na příští zastávce.|I’m getting off at the next stop.
zavřeno|adv|closed|Dnes je zavřeno.|It’s closed today.
zdraví|n|health|Na zdraví!|Cheers!
zelenina|f|vegetables|Jím hodně zeleniny.|I eat a lot of vegetables.
zima|f|winter; cold|Je mi zima.|I’m cold.
zítra|adv|tomorrow|Zavolám ti zítra.|I’ll call you tomorrow.
zkusit|v|to try|Zkusím to česky.|I’ll try it in Czech.
známka|f|stamp; grade|Potřebuju známku na dopis.|I need a stamp for a letter.
zpoždění|n|delay|Tramvaj má deset minut zpoždění.|The tram is ten minutes late.
zpráva|f|message; news|Dostal jsi moji zprávu?|Did you get my message?
zvlášť|adv|separately|Zaplatíme zvlášť.|We’ll pay separately.
žádný|pron|no, none|Žádný problém.|No problem.
žena|f|woman; wife|Ta žena je moje sousedka.|That woman is my neighbour.
židle|f|chair|Je ta židle volná?|Is that chair free?
žít|v|to live|Žiju tady už dlouho.|I’ve lived here a long time.
život|m|life|To je život.|That’s life.
žízeň|f|thirst|Mám žízeň.|I’m thirsty.
ten|pron|that, this, the||
a|conj|and||
že|conj|that; right?|Jste tady, že?|You’re here, aren’t you?
na|prep|on, onto; for|Dej skleničku na stůl.|Put the glass on the table
já|pron|I||
v|prep|in; at|On je v divadle.|He is in the theater
tak|adv|so; like this|Je tak dobrý!|He is so good!
ne|intj|no; not||
ty|pron|you||
s|prep|with|setkat se s někým|to meet someone
ona|pron|she||
o|prep|about|o šedesát procent větší|sixty percent larger
sebe|pron|oneself (myself, yourself…)||
do|prep|into, in; to, in|Vešel do místnosti.|He walked into the room
z|prep|from, out of|Toto víno pochází z Francie.|This wine comes from France
jo|part|yeah, yep, yup||
když|conj|when; if|Jsem nejšťastnější, když pracuji.|I’m happiest when I’m working
jen|adv|only, just||
jako|adv|as; like||
on|pron|he||
za|prep|behind; for; in (time)|sednout si za volant|to sit down behind the wheel
ti|pron|those, they; to you|Kde jsou Pavel s Ivanou? Ti přijdou později.|Where are Pavel and Ivana? Those two will come later.
by|part|would (conditional)|Byl by tam šel, kdyby mě byli pozvali.|I would have gone there if they had invited me.
můj|pron|my, mine||
ano|intj|yes||
oni|pron|they||
pro|prep|for|Zabili ho pro peníze.|They killed him for his money
dobře|adv|well||
vy|pron|you||
no|intj|well; yeah||
k|prep|to, towards|Šel jsem si k bratrovi pro půjčku.|I went to my brother for a loan
tam|adv|there||
nic|pron|nothing|nic jiného|nothing else
kdo|pron|who|Kdo jsi/jste?|Who are you?
takže|conj|therefore, so||
aby|part|so that, in order to|Už aby tu byli.|I can’t wait for them to come
my|pron|we||
po|prep|after; along|po západu slunce|after sunset
tenhle|pron|this||
než|conj|than|Projekt zabral více času než se plánovalo.|The project took longer than planned
ono|pron|it||
jeho|pron|his; its||
od|prep|from; since|Dostal jsem dopis od bratra.|I got a letter from my brother
jestli|conj|if, whether|Zeptej se ho, jestli přijde.|Ask him whether he will come
všechno|pron|everything|všechno ostatní|everything else
ani|conj|neither, nor, or; even|Do Prahy nepojedu ani v sobotu ani v pátek.|I will go to Prague neither on Saturday nor on Friday.
udělat|vp|to do; to make|Udělal, o co jsme žádali.|He did what we had requested
tvůj|pron|your, yours, thy, thine||
jeden|num|one||
někdo|pron|someone, somebody||
až|adv|until, up; when, once; to, through|Jděte rovně až k té vysoké budově.|Go straight up to the tall building
pokud|conj|if; as far as|Pokud bude pršet, zmoknu.|If it rains, I will get wet
máma|f|mum, mom, mommy||
díky|prep|thanks to; thanks, ta|To vše je jen díky tvrdé práci.|This is all down to hard work
sem|adv|here (to this place)||
u|prep|at, by, near||
vidět|vi|to see||
před|prep|before; in front of||
všichni|pron|all; everybody, everyone|všichni ostatní|everyone else
váš|pron|your, yours||
dva|num|two||
hej|intj|hey, hi||
říkat|vi|to say; to call|Říkejte mi Petr.|Please call me Peter
vážně|adv|seriously|Vážně mi ještě neodpověděli?|Have they seriously not responded yet?
dostat|vp|to get; (se) to get somewhere|To pomohlo jí dostat se z toho místa.|That helped her get out of this place
pořád|adv|all the time, still||
náš|pron|our, ours||
moci|vi|can, to be able to (formal form of moct)||
prostě|adv|simply, just|Oblékala se prostě.|She dressed simply
další|adj|another; next|Chci další klobouk.|I want another hat
nikdo|pron|no one, nobody|nikdo jiný|no one else
jenom|adv|only||
nějaký|pron|some||
najít|vp|to find|Jak je najdu?|How will I find them?
tento|pron|this||
říci|vp|to say (formal form of říct)||
kvůli|prep|due to, because of; for the sake of||
nechat|vp|to leave; to let, allow||
její|pron|her, its||
bože|intj|oh my God||
ať|part|let; whether, no matter|Ať to neposílají.|Do not let them send it
stát se|vp|to happen; to become||
pár|m|pair, couple|po pár dnech|after a couple of days
dítě|n|child|Chtěla by dítě.|She would like a child
právě|adv|just, exactly; just now||
dobrá|intj|OK, all right||
jasně|adv|clearly; brightly||
děkuji|intj|thank you||
velmi|adv|very; lot, a lot||
takhle|adv|so, in this manner||
přijít|vp|to come, to arrive|Přijdu pozdě do školy.|I’ll be late for school
pravda|f|truth|Máš pravdu!|You’re right!
let|m|flight||
proto|adv|therefore, hence, that is why||
vůbec|adv|at all||
vzít|vp|to take||
zpátky|adv|back, backwards|Hned jsem zpátky.|I’ll be right back
tři|num|three||
přesně|adv|exactly|Ano, přesně tak.|Yes, that’s exactly right
pomoct|vp|to help|Mohu vám pomoct?|May I help you?
muž|m|man; husband|Muž tančí se svou ženou.|The man is dancing with his wife
zabít|vp|to kill||
jaký|pron|what; what kind of|Jaká je vaše adresa?|What is your address?
kdyby|part|if (hypothetical)|Kdyby tady tak byl se mnou.|If only he were here with me
problém|m|problem|způsobit problém|to cause a problem
podívat se|vp|to look, take a look, check out|Podívej, oni hrají badminton.|Look, they are playing badminton
jejich|pron|their||
dlouho|adv|long, a long time; long, a particular amount of time|Jak dlouho to bude trvat?|How long will it last?
otec|m|father||
domů|adv|homeward||
pryč|adv|away||
zase|adv|again, once more||
poslední|adj|last|Toto je poslední.|This is the last one
někdy|adv|sometimes||
promiň|intj|sorry! excuse me!||
vrátit|vp|to return; (se) to return, to go back|Tu knihu ti vrátím příští týden.|I will return this book to you next week
takový|pron|such|Jak můžeš něco takového říct?|How can you say such a thing?
bůh|m|god||
stejně|adv|equally; anyway, all the same|stejně daleko|equally far
jednou|adv|once||
dál|f|further, farther; on||
ke|prep|to; toward, towards||
vlastně|adv|actually, as a matter of fact||
cože|pron|what|Cože jsi mi to přinesl?|What did you bring me?
fajn|adj|fine, nice||
spolu|adv|together||
určitě|adv|surely, definitely||
jiný|adj|other, different|úplně jiný|completely different
dík|m|thanks||
možný|adj|possible; conceivable||
mysl|f|mind|na mysli|in mind
chlap|m|man, guy||
fakt|m|fact||
mezi|prep|between; among|Mezi slepými jednooký králem.|Among the blind, the one-eyed man is king
paní|f|Mrs; lady|paní Nováková|Mrs Nováková
také|adv|too, also, as well||
vypadat|vi|to look, to seem|Vypadá to dobře.|It looks good
slyšet|vi|to hear|špatně vás slyším.|I can’t hear you very well
podle|prep|according to|Evropané podle průzkumů chtějí prezidenta.|According to surveys, Europeans want a president.
zlato|n|gold|Je to pravé zlato?|Is it real gold?
mami|f|mom, mum||
znovu|adv|again, anew||
pod|prep|under, below|Potřebuju se dostat pod ten most.|I need to get under that bridge
snad|adv|hopefully; maybe, perhaps|Snad mi to půjde.|Hopefully, I’ll be good at this
úplně|adv|completely, wholly|úplně jiný|completely different
zůstat|vp|to stay, to remain||
při|prep|at, during; by|při bližším pohledu|on closer inspection
promiňte|intj|sorry! excuse me!||
samozřejmě|adv|of course||
dokud|conj|while; as long as; until|dokud budu moci snít|as long as I can dream
třeba|adv|maybe, for example; necessary|K přípravě omelety jsou třeba vajíčka.|You need eggs to make an omelette
ven|adv|out, outwards||
věřit|vi|to believe; to trust|Nebudete tomu věřit.|You won’t believe this
stále|adv|still; constantly||
matka|f|mother||
zrovna|adv|just, exactly; right now, just now||
tati|m|dad||
potom|adv|afterwards, subsequently||
skvělý|adj|great|skvělý nápad|brilliant idea
přes|prep|across, over; via|Naštěstí přes řeku vedl most.|Fortunately, there was a bridge across the river.
proti|n|against|Všechno má svá pro a proti.|Everything has its pros and cons
líto|adv|sorry (je mi líto: I’m sorry)||
jistý|adj|certain, sure|Nejsem si jistý.|I’m not sure
malý|adj|small, little|malá tercie|a minor third
dneska|adv|today||
vlastní|adj|own||
táta|m|dad||
všechen|pron|all||
holka|f|girl; girlfriend||
jediný|adj|only, sole|jediný svého druhu|the only one of its kind
doma|adv|at home||
promluvit|vp|to speak, to say||
oko|n|eye||
kluk|m|boy; boyfriend||
tolik|pron|so much; so many|Je tolik věcí, o kterých se dá psát.|There are a lot of things one can write about.
zavolat|vp|to call|Nemocnému zavolali sanitku.|They called an ambulance for a sick person
oba|pron|both||
milovat|vi|to love; (se) to make love|Miluji tě!|I love you!
mrtvý|adj|dead|Je to zvíře mrtvé?|Is the animal dead?
tedy|adv|therefore, thus, so||
znát|vi|to know||
zbraň|f|weapon|střelná zbraň|firearm
příliš|adv|too||
cítit|vi|to feel; to smell|Necítím se dnes dobře.|I don’t feel well today
ostatní|adj|other; else|Co říkají ostatní členové?|What do other members say?
syn|m|son||
odejít|vp|to leave, to go away|Je třeba odejít.|It is necessary to leave
snažit se|vi|to try; to pursue|Snažím se ho naučit trochu češtiny.|I’m trying to teach him a little Czech
doktor|m|doctor, physician; doctor, PhD||
kámo|m|dude||
pět|num|five||
srdce|n|heart|Málem se jí zastavilo srdce.|Her heart almost stopped
jasný|adj|clear||
což|pron|which||
případ|m|case|V každém případě.|In any case / In all circumstances / Anyway
přece|adv|after all, surely||
přímo|adv|directly||
země|f|country; earth, ground|na Zemi|on Earth
hodiny|f|clock||
nějak|adv|somehow||
přestat|vp|to stop, desist, cease; to quit, to give up|Pokusili se přestat mluvit.|They tried to stop talking
pozor|m|attention; watch out!||
důvod|m|reason|z bezpečnostních důvodů|for safety purposes / for security reasons
vždy|adv|always, every time||
držet|vi|to hold; (se) to hold on, to hold tight|Držel ve svých rukách knihu.|He held a book in his hands
tělo|n|body||
druhý|adj|other, another; second||
skoro|adv|almost, nearly|Já jsem též na moři skoro zemřel.|I almost died at sea as well
kolem|adv|around; past|cesta kolem světa|a trip around the world
jinak|adv|differently||
později|adv|later||
buď|conj|either||
zpět|adv|back||
nad|prep|over, above||
zjistit|vp|to find out, to ascertain||
ukázat|vp|to show; to point||
haló|intj|hello||
rána|f|wound; blow, bang||
doba|f|time, period; era|napřed své doby|ahead of one’s time
odsud|adv|from here, hence||
venku|adv|outside|Jsem venku se psem.|I’m out with the dog
smrt|f|death|předčasná smrt|premature death
docela|adv|quite||
plán|m|plan|plán města|plan of the city
pozdě|adv|late|pozdě bycha honit|what’s done is done
čtyři|num|four||
více|adv|more||
způsob|m|way, manner|běžným způsobem|ordinarily
bratr|m|brother||
loď|f|ship; vessel||
předtím|adv|previously||
vždyť|conj|after all, but (you know)||
poslouchat|vi|to listen; to obey||
zatím|adv|so far; in the meantime; see you|Zatím jsem o tom nepřemýšlel.|I didn’t think about it yet
dovnitř|adv|inside||
policie|f|police||
pocit|m|feeling; sensation|pocit jistoty|assurance
zastavit|vp|to stop|Po nějaké době se zastavil na rozcestí.|After a while he stopped at a crossroads
zde|adv|here||
zem|f|ground, floor; earth||
znamenat|vi|to mean||
trocha|f|little, bit|Nemáš ještě trochu tabáku?|Do you have a little tobacco left?
čím|adv|the (čím… tím: the… the)|Čím dříve, tím lépe.|The sooner the better
špatně|adv|badly; wrong, wrongly||
připravit|vp|to prepare; (se) to get ready|Připravil jsem si chleba se zeleninou.|I made bread with vegetables
někde|adv|somewhere||
pokoj|m|room; peace|čistý pokoj|clean room
dokonce|adv|even||
super|adj|super, great||
zeptat se|vp|to ask|Mohu se tě na něco zeptat?|May I ask you something?
konečně|adv|at last, finally|Konečně vyhrál!|He won at last!
dolů|adv|down, downward, downwards||
poslat|vp|to send|Minulý měsíc jsem mu poslal důležitý dopis.|I sent him an important letter last month
krev|f|blood||
tým|m|team|tým odborníků|team of experts
daleko|adv|far, afar; much, by far||
strach|m|fear|mít strach z|to be afraid of
zemřít|vp|to die, to pass away, to decease|Na co zemřel?|What did he die of?
sestra|f|sister; nurse||
telefon|m|phone, telephone|po telefonu|on the phone / over the phone
dcera|f|daughter||
dokázat|vp|to prove; to achieve||
nyní|adv|now||
během|prep|during; within|Kam investovat během následujících měsíců?|Where to invest within the next months?
změnit|vp|to change||
mnohem|adv|much (with comparatives)|Jedna z tyčí je mnohem delší než ta druhá.|One of the rods is much longer than the other one.
čau|intj|hello, hi; bye||
běžet|vi|to run||
pořádek|m|order|dát něco do pořádku|to put something in order, to fix something up
dáma|f|lady; checkers, draughts||
zachránit|vp|to save|zachránit si kůži|to save one’s skin
vězení|n|prison, jail||
dávat|vi|to give|Proč jsi mi ten dopis dával?|Why did you give me the letter?
smysl|m|sense; meaning, point|v tomto slova smyslu|in this sense of the word
dít|vi|to disappear||
stejný|adj|same, equal||
skvěle|adv|superbly, splendidly||
část|f|part|z velké/valné části|in large part
pěkně|adv|nicely||
příběh|m|story||
mimo|prep|outside of, out of; aside from||
prosit|vi|to ask for; to beg||
šance|f|chance||
sex|m|sex||
klid|m|rest; calm|klid na lůžku|bed rest
šest|num|six||
skončit|vp|to finish, to end; to end up|Písnička už skončila.|The song has ended
mnoho|pron|many, much, lots of; much, a lot|Je tu mnoho lídí.|There are many people here
pěkný|adj|nice; pretty|Má pěkný dům.|He has a beautiful house
rozhodně|adv|definitely||
manžel|m|husband||
hra|f|game; play||
spousta|f|lot of, lots of, plenty of||
nahoru|adv|up, upwards||
doufat|vi|to hope|Doufám, že neruším.|I hope I’m not intruding
dívat se|vi|to look; to watch|Dívala se na film v televizi.|She was watching a film on TV
deset|num|ten|Jde to od deseti k pěti.|Things are going bad
pouze|adv|only||
zvláštní|adj|strange, odd; special|To je ale zvláštní člověk.|That is but a strange man
několik|pron|several, a few|několik knih|several books
madam|f|madam, lady||
volat|vi|to call|Volám vám celé dopoledne, ale nemůžu se dovolat.|I’ve been calling all morning but I can’t get through.
pokračovat|vi|to continue||
možnost|f|possibility; option|upírat možnost|to deny the opportunity
sledovat|vi|to follow; to tail, to track|Sledoval jsi včera ten zápas?|Did you watch the match yesterday?
rozhodnout|vp|to decide; (se) to decide|Otec nakonec rozhodl, že půjdou do zoo.|In the end father decided they’d go to the zoo.
poprvé|adv|for the first time||
uvnitř|adv|inside, within||
získat|vp|to gain, obtain, to earn, to win||
nakonec|adv|in the end|Nakonec vyhraje!|He will win in the end!
kolo|n|bicycle, bike; wheel||
použít|vp|to use|Včera použila svou tužku.|She used her pencil yesterday
zapomenout|vp|to forget|Zapomněli na nás.|They forgot us
slečna|f|miss||
představit|vp|to introduce; (se) to introduce oneself|Dovolte, abych se představil.|Let me introduce myself
chlapec|m|boy; boyfriend||
otevřít|vp|to open|Stařec otevřel dveře do kuchyně.|The old man opened the kitchen door
naprosto|adv|absolutely, totally, entirely, completely||
ztratit|vp|to lose; (se) to go missing, to get lost, to go astray|Ztratil jsem boty.|I lost my shoes
kapitán|m|captain||
bojovat|vi|to fight|Bojoval za ochranu lesů.|He fought to save the forest
úžasný|adj|amazing||
aha|intj|aha, I see||
odtud|adv|from there, thence||
uvěřit|vp|to believe|Nemohu tomu uvěřit.|I can’t believe it
zničit|vp|to destroy|zničit konkurenci|to nip the competition
dole|adv|down||
společnost|f|society; company, corporation|akciová společnost|joint-stock company
kromě|prep|except, but|Které jazyky znáš kromě češtiny?|What languages do you speak besides Czech?
všude|adv|everywhere||
alespoň|adv|at least||
hlavní|adj|main; major|hlavní město|capital city
velice|adv|very, very much; greatly||
dno|n|bottom||
bezpečí|n|safety||
zbytek|m|rest, remainder|Chci s Tebou strávit zbytek života.|I want to spend the rest of my life with you
navíc|adv|extra; in addition|Měli jsme možnost vydělat si pár euro navíc.|We had the opportunity to earn a few extra euros.
vést|vi|to lead||
dívka|f|girl||
dovolit|vp|to allow, to permit|No dovol.|Well excuse me!
právo|n|law; right|upírat právo|to deny the right
známý|adj|well-known; acquaintance||
sen|m|dream|Měl jsem o tobě sen.|I had a dream about you
jmenovat|vi|to appoint; (se) to be called, to have as a name|Jmenuji se Ivan.|My name is Ivan
tajemství|n|secret||
důkaz|m|proof; evidence|důkaz Pythagorovy věty|the proof of the Pythagorean theorem
tisíc|m|thousand|dva tisíce lidí|two thousand people
proboha|intj|for God’s sake||
najednou|adv|all of a sudden||
mladý|adj|young|Nejmladší z nich.|The youngest of them
odkud|adv|from where||
vyhrát|vp|to win|Věděl jsem, že bychom mohli vyhrát!|I knew we could win!
plný|adj|full|plná sklenice|full glass
překlad|m|translation||
strana|f|side; page; (political) party||
támhle|adv|over there||
jakmile|conj|as soon as||
válka|f|war|vyvolat válku|to start a war
vlasy|m|hair||
vrah|m|murderer||
hrozně|adv|horribly||
oběť|f|sacrifice; victim||
blázen|m|fool; lunatic||
projít|vp|to go through, to pass; (se) to take a walk||
lhát|vi|to lie||
klidně|adv|calmly||
přemýšlet|vi|to think, to ponder||
poznat|vp|to recognize; to get to know|V tom převleku jsem ji nepoznal.|I did not recognize her in that disguise
většina|f|majority|drtivá většina|overwhelming majority
minuta|f|minute||
král|m|king||
však|conj|however, but|Byl tam on, já však ne|He was there, but I was not
děkovat|vi|to thank||
zatímco|conj|while; whereas||
síla|f|strength; force||
pustit|vp|to let go; to let in; to turn on|Myslím, že ho můžu pustit do zkušebního provozu.|I think I can put him into trial operation
blízko|adv|near; near, nearby|Hotel je blízko hlavního náměstí.|The hotel is near the main square
divný|adj|strange, odd, surprising; queer, weird||
náhodou|adv|by accident|Náhodou jsem šel kolem.|I happened to walk by
důl|m|mine||
někam|adv|somewhere||
hlavně|adv|mainly||
nahoře|adv|up, upstairs||
vypadnout|vi|to fall out; to get out||
vysvětlit|vp|to explain|jednou vám vysvětlím, proč mu tak říkáme.|One day I’ll explain to you why we call him this.
zaplatit|vp|to pay||
skutečně|adv|really, truly||
chovat|vi|(se) to behave; to hold, to cradle|Děti se dobře chovaly.|The children behaved well
rozhodnutí|n|decision|přijmout rozhodnutí|to accept a decision
vztah|m|relationship, relation||
čí|pron|whose|Čí je to vina?|Whose fault is it?
rande|n|date (romantic)|Pozval ji na rande.|He invited her on a date
starat se|vi|to care, to take care||
normální|adj|normal, usual, ordinary, regular||
tudy|adv|this way, herethrough; that way, therethrough||
naučit|vp|to teach; (se) to learn||
stačit|vi|to be enough, to suffice||
utéct|vp|to run away, to flee||
vedle|prep|next to, beside, alongside|Co kdybych si sedl vedle tebe?|Do you mind if I sit next to you?
tvář|f|face; cheek||
zvládnout|vp|to manage||
psát|vi|to write||
trvat|vi|to last; to insist|chvíli trvat|to take a while
prý|adv|allegedly||
vybrat|vp|to select, to choose|Máte vybráno?|Have you chosen?
hlas|m|voice; vote|hlas lidu, hlas boží|the voice of the people, the voice of God
umřít|vp|to die||
naživu|adv|alive||
vražda|f|murder||
milý|adj|kind; dear|To je od Vás milé.|That’s very kind of you
postarat se|vp|to take care||
světlo|n|light||
tentokrát|adv|this time||
přinést|vp|to bring|přinést radost|to bring joy
zdát se|vi|to seem||
ohledně|prep|regarding, concerning||
okamžitě|adv|immediately, right away||
moment|m|moment||
prachy|m|dough, money||
zmizet|vp|to disappear|zmizet z dohledu|to disappear from sight
pít|vi|to drink||
správný|adj|correct; proper|na správnou cestu|on the right track
noha|f|leg; foot|bršlice kozí noha|ground elder
pohyb|m|motion, movement|volný pohybu zboží, služeb, osob a peněz|free movement of goods, people, services and capital
způsobit|vp|to cause, to bring about, to bring to pass||
systém|m|system|trávicí systém|digestive system
opustit|vp|to leave, to abandon||
jménem|prep|on behalf of||
tehdy|adv|then||
agent|m|agent, spy; agent, representative||
znít|vi|to sound|To zní dobře.|Sounds good to me
seznam|m|list|Mé jméno je na seznamu.|My name is on the list
strašně|adv|awfully||
sbohem|intj|farewell||
skutečný|adj|real, actual||
horší|adj|worse||
pořádně|adv|properly||
hodit|vp|to throw; to suit||
hodit se|vi|to throw; to suit|hodit se pro dítě|to be suitable for a child
pravděpodobně|adv|probably||
pravý|adj|right; real, genuine|Teď je ta pravá chvíle to udělat.|Now’s the right time to do it
společně|adv|together|Přišli jsme do školy společně.|We went to school together
sedm|num|seven||
minulý|adj|past|minulý čas|past tense
příště|adv|next time||
třetí|adj|third||
chlápek|m|guy, dude||
sranda|f|fun||
šaty|m|dress; clothes||
stan|m|tent||
dohromady|adv|together; taken together, combined||
postavit|vp|to build; to put, to stand|Tahle stěna je postavená z bahna.|This wall here is made of mud
druh|m|kind, type; species||
zadek|m|backside, bottom; rear||
bavit|vi|to entertain; to amuse||
zatraceně|adv|damn||
dojít|vp|to arrive, to come; to run out||
sehnat|vp|to find, to get|sehnat práci|to get a job
pochopit|vp|to understand, to grasp||
připravený|adj|ready, prepared||
perfektní|adj|perfect||
hádat|vi|to guess; (se) to quarrel, to argue||
nosit|vi|to carry; to wear|Nosí hezké šaty.|Wears nice clothes
nikam|adv|nowhere||
samý|adj|nothing but, all|samé zlato|full of gold
duše|f|soul; inner tube||
setkat se|vp|to meet||
bolest|f|pain|cítit bolest|to feel pain
dávno|adv|long ago|dávno tomu|long ago
naposledy|adv|last time, last|Kdo se směje naposledy, ten se směje nejlépe.|He who laughs last laughs best
osobní|adj|personal|osobní počítač|personal computer
chytit|vp|to catch; (se) to catch hold of, to grasp||
situace|f|situation||
přítelkyně|f|girlfriend; (female) friend||
již|adv|already||
zlý|adj|evil; bad|zlý člověk|evil person
osm|num|eight||
mozek|m|brain|Podstoupil operaci mozku.|He underwent a brain operation
dopis|m|letter||
silný|adj|strong||
starost|f|concern, worry, anxiety; sorrow||
dvakrát|adv|twice||
osoba|f|person||
šílený|adj|mad, insane||
vzhůru|adv|up; awake||
kancelář|f|office; agency|Včera nebyla v kanceláři.|Yesterday, she was not in the office
stop|m|stop; hitchhiking|Za hrubý faul dostal stop na čtyři zápasy.|He received a four-match suspension for a serious foul.
cíl|m|goal, objective, target; target|dosáhnout cíle|to reach the objective
zájem|m|interest|věnovat zájem|to take interest
mimochodem|adv|by the way; en passant||
chybět|vi|to be missing; to be missed||
názor|m|opinion|podle mého názoru|in my opinion
zajímat|vi|to interest, to be interesting; (se) to be interested|Naše země ho zajímá.|Our country interests him
omluvit|vp|to excuse; (se) to apologize|Omluvte mě.|Excuse me
ó|intj|oh||
postel|f|bed|ustlat postel|to make the bed
pohoda|f|ease, calm, good vibes||
krok|m|step, pace||
detektiv|m|detective||
začátek|m|beginning|Každý čekal na začátek.|Everybody was waiting for the beginning
zbavit se|vp|to get rid of|Zbavili jsme se nervozity.|We got rid of the jitterness
vina|f|guilt, fault|dát vinu|to impute blame
zřejmě|adv|apparently||
pití|n|drinking; drink, beverage|něco k pití|something to drink
vlastnit|vi|to own, to possess||
trošku|adv|bit; a little||
škoda|f|pity, shame; damage|více škody než užitku|more harm than good
přijet|vp|to come||
některý|pron|some, any|Už ses setkala s některým z mých přátel?|Have you met any of my friends?
zlatíčko|n|honey, darling, sweetheart||
slunce|n|sun||
dlouhý|adj|long; tall||
dnešní|adj|today’s|dnešní schůze|today’s meeting
ticho|n|quiet, silence||
požádat|vp|to ask, to request|požádat o účet|to ask for the bill
jed|m|poison; venom||
cokoli|pron|whatever||
obvykle|adv|usually||
střední|adj|middle, central; medium||
dolar|m|dollar||
rozkaz|m|order, command|Dostali rozkaz nevycházet ze stanů.|They received a command not to leave their tents.
rodič|m|parent||
překvapení|n|surprise||
zavřít|vp|to close, to shut; to lock in|Zavřel za sebou dveře.|He shut the door behind him
domov|m|home|Kde domov můj?|Where is my home?
přát|vi|to wish||
oblečení|n|clothing||
odpoledne|n|afternoon; during the afternoon||
letadlo|n|aircraft, airplane, aeroplane||
test|m|test|provést test|to perform a test
celkem|adv|quite, pretty, fairly; in total|celkem spokojený|quite satisfied
příležitost|f|occasion, opportunity|náklady obětované příležitosti|opportunity cost
záznam|m|record, recording|provést záznam.|to make a recording
chránit|vi|to protect||
útok|m|attack|provést útok|to carry out an attack
náhoda|f|chance||
fotka|f|photo|Lidé dělali fotky.|People were taking photos
znova|adv|again||
jenž|pron|who, which, that||
radost|f|joy|přinést radost|to bring joy
hrozný|adj|horrible, terrible||
prodat|vp|to sell||
dříve|adv|formerly||
osobně|adv|in person; personally||
hm|intj|hmm; meh||
poté|adv|afterwards, subsequently||
soud|m|court; judgment||
používat|vi|to use|Budeme místo Googlu používat Bing?|Will we use Bing instead of Google?
ženská|f|woman (informal)||
zařídit|vp|to furnish; to arrange||
stopa|f|trace, track; foot (unit)||
úkol|m|task|mít za úkol|to be tasked with
ublížit|vp|to harm, to hurt, to injure||
pohled|m|look, view; postcard|na první pohled|at first glance
rozdíl|m|difference|věkový rozdíl|age difference
duch|m|spirit||
přivést|vp|to bring||
sednout|vp|to sit down; to fit|sednout si za stůl|to sit down at a table
zábava|f|fun, entertainment||
zákon|m|law; act||
přesto|adv|yet, still, nevertheless, in spite of that||
spojit|vp|to unite; to join||
potkat|vp|to meet, encounter; (se) to meet, to encounter|Hádej, koho jsem dnes potkala v divadle?|Guess whom I met at the theater today?
uprostřed|adv|in the middle; in the middle of||
operace|f|operation, surgery|provést operaci.|to perform surgery
oddělení|n|department; ward|vedoucí oddělení|senior manager
vyřešit|vp|to solve, to resolve||
vyhodit|vp|to throw away; to fire||
zda|conj|whether, if|Nevíš, zda přijde?|Do you know whether he’s coming?
noční|adj|nighttime, night; nocturnal||
prezident|m|president||
hodný|adj|good, kind; obedient, well-behaved|Byli na mne hodní.|They were kind to me
vydržet|vp|to last, to hold out; to endure|Jak dlouho mohou vydržet bez vody?|How long can they hold out without water?
souhlasit|vi|to agree||
pomáhat|vi|to help|pomáhat a chránit|to help and to defend
záda|n|back||
kafe|n|coffee||
typ|m|type||
chvilka|f|moment, second, while|před chvilkou|a moment ago
navždy|adv|forever||
koukat|vi|to look, to watch|Koukej na ten krásný dům!|Look at that beautiful house!
okolo|prep|around|Šel okolo našeho domu.|He went around our house
skupina|f|group; troop|organizovaná skupina|organized group
nehoda|f|accident||
kamarádka|f|buddy (female)||
ženský|adj|female, feminine|Mnohá česká slova jsou je ženského rodu.|Many Czech words are of the feminine gender
udržet|vp|to keep, to maintain; to hold|udržet v ruce|keep in one’s hand
obličej|m|face||
opatrně|adv|carefully||
idiot|m|idiot||
či|conj|or|Být, či nebýt?|To be, or not to be?
pokusit se|vp|to try, to attempt||
oheň|m|fire|hasit oheň|to extinguish a fire
naštvaný|adj|upset, mad, angry||
čistý|adj|clean; pure||
patřit|vi|to belong|Kam patří tento dokument?|Where does this document belong?
upřímně|adv|sincerely, honestly||
děvče|n|girl||
hloupý|adj|stupid|Tato věta není hloupá.|This sentence is not stupid
zvíře|n|animal, beast|práva zvířat|animal rights
opět|adv|again||
zařízení|n|device, equipment; facility||
vtip|m|joke; wit||
kus|m|piece; chunk|Máte více kusů?|Do you have more pieces? or Do you have more of these?
uklidnit|vp|to calm, to calm down; (se) to calm down||
téměř|adv|almost, nearly||
pozornost|f|attention|věnovat pozornost|to pay attention
rada|f|advice, counsel; council||
mobil|m|mobile phone||
manželství|n|marriage, matrimony, wedlock||
schopný|adj|able, capable||
méně|adv|less||
laskavost|f|kindness; favour||
přijmout|vp|to accept; to receive|přijmout hlášení|to accept an announcement
energie|f|energy||
přístup|m|access; approach|získat přístup|to gain access
ovšem|conj|of course; however||
vyšetřování|n|investigation|provést vyšetřování|to conduct an investigation
nebezpečí|n|danger; peril|vážné nebezpečí|serious danger
odjet|vp|to depart||
blíž|f|closer, nearer||
milion|m|million||
boj|m|fight||
zcela|adv|completely, entirely||
právník|m|lawyer||
kdysi|adv|once, formerly|kdysi dávno|once long ago
minout|vp|to miss; to pass|Doufám, že on nemine ten míč.|I hope that he won’t miss the ball
vzduch|m|air||
potřeba|f|need||
starší|m|older, elder||
slíbit|vp|to promise||
běh|m|run; running||
hudba|f|music||
ukrást|vp|to steal||
armáda|f|army|Muž choval nenávist k armádě.|The man held hatred for the army
tvrdit|vi|to claim, to assert||
hvězda|f|star||
hezky|adv|nicely||
spojení|n|connection, link||
policejní|adj|police|policejní sbor|police force
pardon|intj|sorry, I’m sorry, I beg your pardon, I apologize||
doopravdy|adv|really||
signál|m|signal||
napadnout|vp|to attack; to occur (to someone)|Napadlo mě, že..|It occurred to me that
střílet|vi|to shoot||
zajít|vp|to go, to drop by; to set||
osud|m|fate; doom||
výběr|m|selection; choice|pečlivý výběr|careful selection
přidat|vp|to add||
boží|adj|God’s; cool, great, awesome|boží mlýny|the mills of God
kdokoliv|pron|anyone, anybody||
těžko|adv|with difficulty|těžko k sehnání|hard to find
objevit|vp|to discover; (se) to appear, to emerge||
očividně|adv|obviously, evidently||
zápas|m|match; struggle||
pravidlo|n|rule||
lid|m|people||
tušení|n|clue, idea, notion|Nemám tušení.|I have no idea
prach|m|dust||
minulost|f|past|slavná minulost|glorious past
vláda|f|government; rule, reign|získat vládu nad kým|to gain control over someone
honem|adv|quickly||
rovnou|adv|straight away, right away||
strávit|vp|to spend (time); to digest|Dovolenou jsme strávili na Mallorce.|We have spent our vacation at Majorca
narozeniny|f|birthday|slavit narozeniny|to celebrate a birthday
hotel|m|hotel||
místnost|f|room|temné místnosti|dark rooms
pokaždé|adv|each time, every time||
místní|adj|local|místní kultura a zvyky|local culture and customs
nazdar|intj|hello||
nebezpečný|adj|dangerous; risky||
nervózní|adj|nervous||
přežít|vp|to survive|Nehodu přežil.|He has survived the accident
frank|m|franc||
setkání|n|meeting; meeting, encounter||
budit|vi|to wake up; (se) to wake up|budit strach|to arouse fear
přesvědčit|vp|to convince||
jednat|vi|to act; to negotiate, to treat|Je nejvyšší čas jednat.|It is high time to act
aniž|conj|without||
vyjít|vp|to go out, to come out; to rise; to work out|Počkejme, až vyjde měsíc.|Let’s wait until the moon rises
vzdát se|vp|to give up||
svatba|f|wedding||
cela|f|cell (in a prison)||
děj|m|process; plot, story|termodynamický děj|thermodynamic process
devět|num|nine||
provést|vp|to carry out; to show around|provést oddělení|to carry out separation
ujistit|vp|to assure||
kéž|part|if only, I wish|Kéž bych tak mohl létat.|I wish I could fly
vytvořit|vp|to create|vytvořit příležitost|to create an opportunity
vzkaz|m|message||
vysoký|adj|high; tall||
hlásit|vi|to report; to announce|hlásit se na vysokou školu|to apply for admission to a university
program|m|program; agenda||
povolení|n|permit; permission||
nemocný|adj|ill||
málem|adv|nearly||
obléct|vp|to put on||
stav|m|state, condition||
blízký|adj|close, near||
sejít|vp|to walk down; (se) to meet||
víno|n|wine||
klub|m|club||
hrdina|m|hero||
voják|m|soldier||
dohoda|f|agreement; deal, understanding|Uzavřeli jsme dohodu.|We have made an agreement
umění|n|art|výtvarné umění|visual arts
naděje|f|hope|chovat naději|to have hope
bezpečnostní|adj|security|bezpečnostní díra|security hole
polda|m|cop||
jenže|conj|but||
kůň|m|horse||
akorát|adv|just right, fitting; only, just||
zpívat|vi|to sing||
zločin|m|crime|válečné zločiny|war crimes
poděkovat|vp|to thank||
zajímavý|adj|interesting||
kámoš|m|buddy||
povídat|vi|to chat|Povídala jsem si s kamarádkou.|I was chatting with my friend
tamhle|adv|over there||
onen|pron|that (one)|onen svět|otherworld
počítač|m|computer||
rozhovor|m|conversation; interview|poskytovat rozhovor|to give an interview
bezva|adj|cool, super||
skutečnost|f|reality, fact||
hotový|adj|ready, prepared; finished, done, completed||
bomba|f|bomb||
záležitost|f|matter, affair|To není moje záležitost.|That is none of my business
vzadu|adv|behind||
akce|f|action; an event, happening|zabit v akci|killed in action
lež|f|lie||
většinou|adv|mostly||
slib|m|promise; word||
řada|f|row, line; series|z řad civilistů|among civilians
dokončit|vp|to complete, to finish||
povědět|vp|to say||
totiž|adv|namely, specifically; because||
kontakt|m|contact||
nádherný|adj|gorgeous, beautiful||
koule|f|sphere; ball||
nepřítel|m|enemy, foe||
kouknout|vp|to take a look|Koukni se!|Look!
čest|f|honor, honour|dělat čest / být ke cti někomu|to do credit / to be a credit to someone
služba|f|service; duty|poskytovat službu|to provide a service
bar|m|bar||
sice|adv|admittedly (… but)|Cesta byla sice hezká, ale příliš namáhavá.|The trip was nice, but too exhausting
sto|n|hundred||
pokus|m|attempt, try; experiment|na první pokus|on the first attempt
nůž|m|knife||
sotva|adv|hardly||
ležet|vi|to lie||
lidský|adj|human; humane|Krásné je lidské tělo.|The human body is beautiful
zatknout|vp|to arrest||
volný|adj|free; vacant; loose||
řeč|f|speech, language; talk||
babička|f|grandmother; old woman||
živý|adj|alive, living; lively|Ne, to zvíře je živé.|No, the animal is alive
okamžik|m|moment, second||
dvacet|num|twenty||
kamera|f|camera||
společný|adj|common; joint|Všichni mají jedno společné.|They all have one thing in common
změna|f|change|provést změny|to make changes
nebe|n|sky; heaven||
zdravý|adj|healthy|V zdravém těle zdravý duch.|Mens sana in corpore sano
nos|m|nose||
oblast|f|area||
královna|f|queen|Královna Anglie|Queen of England
moře|n|sea||
překvapit|vp|to surprise|Mě ty jeho brýle dost překvapily.|I was quite surprised by his glasses
svědek|m|witness; attestant|Půjdeš mi za svědka?|Would you be my best man?
nenávidět|vi|to hate||
navštívit|vp|to visit||
teprve|adv|only, just|Odešla teprve před chvílí.|She left only moments ago
kůl|m|stake, post||
zvuk|m|sound||
sníst|vp|to eat||
ponětí|n|idea, clue||
hranice|f|border, boundary, borderline||
pozvat|vp|to invite|Pozval nás na koncert.|He has invited us to a concert
záležet|vi|to matter; to depend||
zabíjet|vi|to kill, to slaughter, to butcher|čas zabíjet.|time to kill
letět|vi|to fly||
vzhledem|adv|considering, given (vzhledem k)||
utíkat|vi|to run, to flee||
zastřelit|vp|to shoot||
využít|vp|to use, to exploit, to take advantage of|Včera využili jeho nevědomost.|They took advantage of his ignorance yesterday.
žádat|vi|to ask, to request; to demand||
korekce|f|correction|provést korekci|to make a correction
upřímný|adj|sincere; frank|upřímná touha|sincere desire
video|n|video||
tlak|m|pressure|krevní tlak|blood pressure
hnát|vi|to drive; to chase; long bone of a limb||
tvrdý|adj|hard; tough||
kočka|f|cat|hrát si jako kočka s myší|to play cat and mouse
paráda|f|great!, cool!; parade|To je paráda.|That’s great
manželka|f|wife||
chování|n|behavior||
pozice|f|position||
večírek|m|party||
domácí|adj|domestic; homemade; landlord, landlady|služba v domácí péči|domestic care service
nabídnout|vp|to offer||
obrovský|adj|enormous, gigantic||
odpovědět|vp|to reply, to answer|Odpověděla na druhou otázku.|She answered a second question
nerad|adj|unwillingly, reluctantly|Nerad ho tak vidím.|I hate to see him like this
podezřelý|m|suspicious; suspect||
soudce|m|judge||
opravdový|adj|real||
pole|n|field||
tímto|adv|hereby|Tímto vás prohlašuji za muže a ženu.|I hereby declare you husband and wife
park|m|park||
prsten|m|ring||
speciální|adj|special||
obraz|m|picture, painting; image||
zranění|n|injury||
hlaveň|f|barrel (of a gun)||
červený|adj|red||
zkoušet|vi|to test; to examine||
kód|m|code||
gay|m|gay man||
vtipný|adj|funny, witty||
zeď|f|wall||
dále|f|further; furthermore||
fér|adj|fair||
kámen|m|stone||
kola|f|cola||
restaurace|f|restaurant||
televize|f|television, TV||
vyrazit|vp|to set out; to knock out||
kontrola|f|check, inspection; control|mít pod kontrolou|to have under control
každopádně|adv|in any case, in any event, either way||
pacient|m|patient||
součást|f|part, component|Projekt je součástí Fotograf festivalu.|The project is part of The Fotograf Festival
jednotka|f|unit||
soustředit|vp|to concentrate||
prst|m|finger; toe||
skrz|prep|through|Strč prst skrz krk|Stick a finger through the neck
němý|adj|mute||
vlas|m|(a) hair||
užít si|vp|to enjoy||
peklo|n|hell|Kníže Pekel|The Prince of Darkness
ředitel|m|director, manager; headmaster||
velitel|m|commander|velitel armády|army commander
zatracený|adj|damn, damned||
pomocí|prep|with the help of, by means of, using||
generál|m|general||
doktorka|f|doctor||
dýchat|vi|to breathe||
kůže|f|skin; leather|vyskočit z kůže|jumping out of one’s skin
brácha|m|brother||
mise|f|mission||
přečíst|vp|to read; to peruse|Přečetl jsem sedm knih.|I read seven books
zdroj|m|source; resource||
noviny|f|newspaper||
ostrov|m|island||
položit|vp|to lay, put||
prominout|vp|to forgive||
volba|f|choice; election||
nedávno|adv|recently||
černá|f|black (colour)||
obvinění|n|accusation, charge||
planeta|f|planet||
kalhoty|f|trousers||
dar|m|gift, present, donation|věnovat dar|to give a donation
smutný|adj|sad||
poblíž|adv|nearby|Je tu někde poblíž.|He’s somewhere nearby
posadit|vp|to make someone sit somewhere; (se) to sit down|Posadila medvídka na židli.|She put the teddy bear on the chair
například|adv|for instance, for example||
americký|adj|American||
tajný|adj|secret|tajná služba|intelligence, secret service
historie|f|history; story||
normálně|adv|normally||
schopnost|f|skill, ability||
zástupce|m|representative, deputy|právní zástupce|legal representative
budova|f|building|vysoká budova|a tall building
přísahat|vi|to swear||
zvednout|vp|to lift; to raise|Student zvedl ruku.|A student raised his hand
člen|m|member||
nejen|adv|not only||
přání|n|wish|Máte přání?|Can I help you?
vesmír|m|universe, space||
opatrný|adj|careful, cautious||
třída|f|class; classroom; avenue||
odpustit|vp|to forgive||
klient|m|client||
záchod|m|toilet, lavatory|jít na záchod|to go to the toilet
varovat|vi|to warn; (se) to avoid, to beware|Starší sestry ji varovaly.|Her sisters warned her
myšlenka|f|idea, thought|geniální myšlenka|brilliant idea
bod|m|point; item|bod mrazu|freezing point
blbost|f|nonsense|Může za to jenom moje blbost.|Only my stupidity is to blame for that
vytáhnout|vp|to pull out|vytáhnout něco z čeho|to drag out something out of something
soutěž|f|competition, contest||
sundat|vp|to take off, to remove|Sundej ty nohy ze stolu!|Take your feet off the table!
tvrdě|adv|hard, sternly, harshly||
porazit|vp|to defeat; to knock down||
schovat|vp|to hide; (se) to hide|Pachatel se schoval do křoví.|The perpetrator hid in the bushes
stroj|m|machine|šicí stroj|sewing machine
vracet|vi|to return; (se) to return, to go back||
strom|m|tree||
prostor|m|space, room|přednáškový prostor|lecture room
včetně|prep|including||
výlet|m|trip, outing|rodinný výlet|family trip
papír|m|paper||
zkontrolovat|vp|to check; to check for||
mír|m|peace||
jezdit|vi|to drive, ride, go||
dozvědět se|vp|to learn, to find out||
vedení|n|leadership, management||
dnešek|m|today||
veličenstvo|n|Majesty||
mrzet|vi|to be sorry (mrzí mě to)|To opomenutí mě mrzí.|I am sorry for that omission
zlo|n|evil||
děcko|n|child||
vymyslet|vp|to come up with, to devise, to figure out, to invent||
vítězství|n|victory||
životní|adj|life (adj.), vital|životní cíl|life goal
riskovat|vi|to risk||
poručík|m|lieutenant||
vsadit|vp|to bet, to wager; (se) to bet||
uvidět|vp|to see, to catch sight of||
zranit|vp|to hurt, to injure|Koho jste zranil, pane?|Whom did you injure, sir?
píseň|f|song|labutí píseň|swansong
okolí|n|surroundings, surrounding area; neighborhood||
kruci|adv|damn, darn|Ó, kruci! Zapomněl jsem na svůj výtvarný projekt!|Oh, darn! I forgot about my art project!
au|intj|ouch||
pátek|m|Friday|v pátek|on Friday
znamení|n|sign, signal|výstražné znamení|warning sign
bývalý|adj|former||
bránit|vi|to defend; to prevent||
mez|f|limit, boundary||
podat|vp|to hand, to pass; to submit|Podej mi tužku.|Hand me a pencil
soukromý|adj|private|soukromý statek|private good
zraněný|adj|injured||
vůdce|m|leader||
učitel|m|teacher||
jinde|adv|elsewhere||
podepsat|vp|to sign||
věk|m|age|v nejlepším věku|in the prime of his life
probrat|vp|to discuss, to consult, to talk sth over||
chystat|vi|to prepare||
spojený|adj|united||
navzájem|adv|mutually, reciprocally||
sexuální|adj|sexual||
díra|f|hole|V plotu je díra.|There’s a hole in the fence
tichý|adj|quiet, silent||
státní|adj|state||
výsledek|m|result; outcome||
neustále|adv|all the time, constantly, incessantly, continually||
meč|m|sword||
litovat|vi|to regret, to feel sorry||
mistr|m|master; champion||
smát se|vi|to laugh||
hlídat|vi|to watch, to guard; to look after, to mind|Budovu hlídá bezpečnostní agentura.|The building is guarded by a security agency
droga|f|drug, recreational drug||
přicházet|vi|to come, to arrive|Přicházejí z daleka že vás poznávat.|They come from far away to meet you
překvapený|adj|surprised|Byli jsme všichni pekelně překvapení.|We were all surprised as hell
otočit|vp|to turn, to rotate|Otočil klíč na ruce.|He turned the key in his hand
drink|m|drink (alcoholic)||
století|n|century||
ztráta|f|loss|utrpět ztrátu|to suffer a loss
řešení|n|solution||
beze|prep|without||
kouzlo|n|spell||
ihned|adv|immediately, right away||
nicméně|adv|nevertheless, nonetheless, however||
nevinný|adj|innocent||
vzpomínat|vi|to reminisce||
čin|m|action, act, deed; feat|muž činu|man of action
profesor|m|professor||
důstojník|m|officer||
firma|f|firm||
nabídka|f|offer; supply||
ovládat|vi|to control; (se) to control oneself||
odcházet|vi|to leave, to go away||
směr|m|direction|dálnice směr Brno|the highway to Brno
hlášení|n|report||
vydat|vp|to publish; to hand over; (se) to set out|vydat všanc|to jeopardize
maminka|f|mum, mom||
styl|m|style||
modrý|adj|blue||
včas|adv|in time||
půjčit|vp|to lend; (si) to borrow|Půjčil kamarádovi knihu.|He has lent his friend a book
svatý|adj|holy, sacred|Svatá Hora|Holy Hill
legrace|f|fun||
slibovat|vi|to promise||
zázrak|m|miracle||
nikde|adv|nowhere||
zasloužit si|vp|to deserve||
dobro|n|good|Dobro zvítězí nad zlem.|Good will triumph over evil
prodávat|vi|to sell|Kde se prodávají lístky?|Where are the tickets sold?
končit|vi|to end; to finish||
uvědomit|vp|(si) to realize, to become aware of; to notify||
předpokládat|vi|to assume, to suppose||
stavit se|vi|to come by, to stop by||
dočkat se|vp|to live to see (after waiting)|Neboj, dočkáš se.|Don’t worry, you’ll get to experience it someday.
vypnout|vp|to turn off, to shut down, to disable||
pták|m|bird||
rychlost|f|speed, velocity|úhlová rychlost|angular velocity
dojem|m|impression|udělat dojem na|to make an impression on
stavět|vi|to build||
představa|f|idea, notion, image||
obávat se|vi|to be afraid of, to fear, to worry|Obávám se nejhoršího.|I fear the worst
takto|adv|so, in this manner||
pracovní|adj|work, working, employment|pracovní smlouva|employment contract
trest|m|punishment, penalty, sentence|trest smrti|death penalty
snadno|adv|easily||
teorie|f|theory||
neuvěřitelný|adj|incredible, unbelievable||
teta|f|aunt||
očekávat|vi|to expect||
projekt|m|project||
obvinit|vp|to charge, to accuse|Obvinili ho z krádeže.|They accused him of theft
třít|vi|to rub||
článek|m|article||
ochránit|vp|to protect||
bál|m|ball||
přísaha|f|oath||
policajt|m|cop||
národní|adj|national|národní stát|nation state
rychlý|adj|fast|Jeho auto je rychlé.|His car is fast
cizí|adj|strange, unfamiliar; foreign|cizí měny|foreign currencies
holčička|f|baby girl||
křičet|vi|to shout; to scream||
dokonalý|adj|perfect||
karty|f|cards, card game||
potěšení|n|pleasure|poskytovat potěšení|to provide pleasure
vzpomenout si|vp|to recall||
vstoupit|vp|to enter|Bylo mi řečeno že tam nesmím vstoupit.|I was told I was not permitted to go there
odtamtud|adv|from there||
oblek|m|suit||
otevřený|adj|open|Máme otevřeno.|We are open
nemoc|f|illness, disease||
bezpečnost|f|safety; security||
dílo|n|work (of art)||
vyřídit|vp|to deal with, to arrange; to pass on (a message)||
skočit|vp|to jump||
oblečený|adj|dressed||
partner|m|partner||
nesmysl|m|nonsense|holý nesmysl|sheer nonsense
jednoduše|adv|easily; just, simply|Jednoduše to není možné.|It just isn’t possible
bota|f|shoe; boot||
vedoucí|m|manager, head; leading|vedoucí oddělení|senior manager
šerif|m|sheriff||
počítat|vi|to count; to calculate||
princ|m|prince||
přiznat|vp|to admit, to acknowledge; to give, to grant|Musím přiznat, že jsem situaci podcenil.|I have to admit I underestimated the situation.
něčí|pron|someone’s||
sponzorovat|vi|to sponsor||
rozhodnutý|adj|determined, decided||
úspěch|m|success||
volit|vi|to choose; to elect||
plukovník|m|colonel||
násilí|n|violence||
sebrat|vp|to pick up; to take away||
pánbůh|m|God, the Lord||
vesnice|f|village||
návrh|m|suggestion, proposal; design|podat návrh|to file a proposal
napravit|vp|to rectify, to correct||
zadní|adj|back, rear, hind||
východ|m|exit; east; sunrise||
denně|adv|daily, every day||
hoch|m|boy; boyfriend||
vážný|adj|serious|vážné nebezpečí|serious danger
soudní|adj|judicial||
nashle|intj|bye||
vítr|m|wind|sluneční vítr|solar wind
obléknout|vp|to put on, to don; (se) to dress, to get dressed||
tušit|vi|to suspect||
strašný|adj|horrible, terrible, awful||
chudák|m|poor man||
party|f|party||
zrušit|vp|to cancel, to abolish, to call off||
políbit|vp|to kiss|Políbila ho na čelo.|She kissed him on the forehead
jindy|adv|in or at some other time|více než kdy jindy.|More than ever
trik|m|trick||
měnit|vi|to change; to replace||
opakovat|vi|to repeat||
sladký|adj|sweet||
představení|n|performance; introduction||
nijak|adv|in no way||
povinnost|f|duty|uložit povinnost komu|to place a duty on someone
narodit se|vp|to be born|Narodila jsem se v Praze.|I was born in Prague
podobný|adj|similar||
paměť|f|memory||
jestliže|conj|if; whereas||
závod|m|race; plant, factory||
dosáhnout|vp|to reach, to achieve||
kost|f|bone||
dorazit|vp|to arrive||
masa|f|mass|masa lidí|mass of people
zajistit|vp|to ensure, to secure||
odvézt|vp|to drive (someone), to take away||
vůl|m|ox||
jakoby|conj|as if, as though; as it were||
vyšetřovat|vi|to investigate, to inquire, to examine|Policie vyšetřuje vraždu.|The police are investigating a murder
zticha|adv|quiet, silent|Buď zticha!|Be quiet!
spravedlnost|f|justice||
princezna|f|princess||
datum|n|date||
spolupracovat|vi|to cooperate, to collaborate||
ukončit|vp|to stop, to terminate||
uzavřít|vp|to close; to conclude (a deal)|Silnice byla uzavřena.|The road was closed
pusa|f|kiss; mouth||
obchodní|adj|commercial||
doslova|adv|literally||
červená|f|red (colour)||
vědomí|n|consciousness; knowledge|stav vědomí|state of consciousness
pohnout|vp|to move; (se) to move|Pohnul jsem hlavou příliš rychle.|I moved my head too quickly
spadnout|vp|to fall down|To mi spadl kámen ze srdce.|That is a load off my mind
množství|n|quantity, amount; abundance, wealth||
prací|adj|washing (adj.)||
snadný|adj|easy||
pohřeb|m|funeral||
kulka|f|bullet||
severní|adj|north, northern||
zub|m|tooth|mít toho plné zuby!|to be fed up
bohatý|adj|rich|Ne, jsme bohatí.|No, we are rich
tábor|m|camp||
past|f|trap|past na myši|mousetrap
mezitím|adv|meanwhile||
dopředu|adv|forward||
hnout|vp|to move||
jižní|adj|south, southern||
kuře|n|chicken||
opilý|adj|drunk||
anebo|conj|or; and/or||
odmítnout|vp|to reject, to refuse|Odmítla dokonce i moji vylepšenou nabídku.|She even rejected my improved offer
úroveň|f|level|syntaktická úroveň|syntactic level
vůz|m|car; wagon||
díl|m|part; episode|náhradní díl|spare part
vůle|f|will||
probudit|vp|to wake up; (se) to wake up, to awake||
předstírat|vi|to pretend|Nepředstírej, že jsi o tom nevěděl!|Don’t pretend you didn’t know about this!
falešný|adj|fake||
přátelit se|vi|to be friends||
unést|vp|to kidnap; to be able to carry|Nechal jsem se unést.|I got carried away
prodej|m|sale|na prodej|for sale
příkaz|m|command, order|dostat příkaz|to get an order
následovat|vi|to follow||
tanec|m|dance||
prázdný|adj|empty||
zloděj|m|thief||
návštěva|f|visit||
děda|m|grandfather; old man||
krása|f|beauty||
hodinky|f|watch||
les|m|forest||
led|m|ice||
kuchyň|f|kitchen; cuisine, cookery||
událost|f|event; incident||
centrum|n|centre|Hotel se nachází v centru města.|The hotel is located downtown
období|n|period, season||
míle|f|mile||
potvrdit|vp|to confirm; to attest||
úsměv|m|smile|věnovat úsměv|to give a smile
zkouška|f|exam, test; rehearsal|provést zkoušku|to perform a testing
svoboda|f|freedom; liberty||
stránka|f|page; aspect||
proces|m|process||
los|m|elk, moose; lottery ticket||
naštěstí|adv|luckily, fortunately||
zlomit|vp|(se) to break; to break||
vnitřní|adj|inner||
trpět|vi|to suffer; to tolerate||
koláč|m|cake, pie (kolach)|Bez práce nejsou koláče.|No pain, no gain
ženatý|adj|married||
vyspat se|vp|to get a good sleep|Vyspala se.|She slept well
policista|m|policeman||
tenkrát|adv|then, at the time||
role|f|role, part||
vynikající|adj|excellent||
poslechnout|vp|to listen; to obey||
zboží|n|goods||
vydělat|vp|to earn||
hrdý|adj|proud||
soukromí|n|privacy||
dort|m|cake||
talent|m|talent||
řešit|vi|to deal with, to solve|Proč to pořád řešíš?|Why do you keep bothering about it?
kolikrát|adv|how many times||
jakýkoliv|pron|any||
vzhled|m|look, appearance||
krabice|f|box||
nádhera|f|splendor; beauty||
obrázek|m|picture||
motor|m|engine, motor||
donutit|vp|to make, to force, to coerce||
student|m|student||
přátelství|n|friendship|získat přátelství|to win friendship
polovina|f|half|V druhé polovině srpna připravujeme schůžku.|We are preparing a meeting in the second half of August.
odpočinout si|vp|to rest|Potřebuju si trochu odpočinout.|I need to get some rest
téma|n|topic, theme||
vyměnit|vp|to exchange, to replace; (se) to swap|vyměnit olej|to change the oil
směšný|adj|ridiculous||
všimnout si|vp|to notice|Těch věcí jsem si ani nevšiml.|I didn’t even notice those things
předat|vp|to hand over; to transmit|předat hlášení|to hand a report
zároveň|adv|at once, at the same time, simultaneously||
jedině|adv|only, exclusively||
svatební|adj|wedding||
zle|adv|badly|Je mi zle.|I feel sick
most|m|bridge||
hovor|m|call||
třikrát|adv|three times, thrice||
hlupák|m|fool, simpleton||
školní|adj|school|školní brašna|school bag
pyšný|adj|proud||
plyn|m|gas||
oddělit|vp|to separate|Lékaři oddělili siamská dvojčata od sebe.|The doctors separated the Siamese twins from each other.
přitom|adv|at the same time; yet||
seno|n|hay|sušit seno|to make hay
kmen|m|trunk; tribe||
padat|vi|to fall||
základní|adj|basic, fundamental|základní pravidla|basic rules
vejce|n|egg||
ničí|pron|no one’s||
vyprávět|vi|to tell, to narrate|Jednoho dne jim babička vyprávěla příběh.|One day, their grandmother told them a story
ničema|m|scoundrel, rascal, miscreant||
roztomilý|adj|cute, adorable||
prase|n|pig||
připojit|vp|to attach; to connect||
hluboko|adv|deep|Ukrývají se hluboko pod zemí.|They are buried deep under the earth
plavat|vi|to swim|Umím plavat.|I can swim
ucho|n|ear||
cit|m|feeling; emotion|získat cit pro|to get a feel for
tancovat|vi|to dance||
pořádný|adj|proper||
ubohý|adj|poor, wretched, miserable||
výraz|m|expression; term||
kouřit|vi|to smoke||
potíž|f|difficulty, problem|vyvolat potíž|to stir up trouble
spálit|vp|to burn; (se) to get burnt||
ukazovat|vi|to show; to point||
rozum|m|reason||
prostředí|n|environment||
bezpečný|adj|safe||
kostel|m|church||
čert|m|devil||
verze|f|version||
zlatý|adj|golden, gold|zlatý řez|golden ratio
posílat|vi|to send|Každý měsíc si posílali dopisy.|They sent each other letters every month
přeložit|vp|to translate; to fold||
čelit|vi|to face, to confront||
žádost|f|request|vyvolat žádost|to invoke a request
sloužit|vi|to serve; to serve as, to be used as|K čemu to slouží?|What is this used for?
království|n|kingdom|Spojené království|United Kingdom
jinam|adv|elsewhere||
zabránit|vp|to prevent||
kat|m|executioner||
přejít|vp|to cross|Jak správně přejít přes silnici.|How to properly cross the road
napřed|adv|first; in advance|napřed své doby|ahead of his time
uvolnit|vp|to release, to loosen; (se) to relax||
nadšený|adj|enthusiastic||
data|n|data||
anděl|m|angel|padlý anděl|fallen angel
jednání|n|negotiation, meeting; behaviour||
vliv|m|influence||
brána|f|gate; goal|Sušice, brána Šumavy|Sušice, the gate to the Bohemian Forest
slabý|adj|weak, feeble||
miláček|m|darling, sweetheart||
zkušenost|f|experience|získat zkušenost|to gain experience
démon|m|demon||
vzrušující|adj|thrilling, exciting; arousing||
vysvětlení|n|explanation|podat vysvětlení|to give an explanation
šílenství|n|madness, insanity||
opravit|vp|to repair; to correct||
klobouk|m|hat|Nosí černý klobouk.|She wears a black hat
ďábel|m|devil||
pobřeží|n|coast||
krevní|adj|blood|krevní oběh|bloodstream
nejprve|adv|first, firstly||
oslava|f|celebration||
hledání|n|search||
písnička|f|song||
skrývat|vi|to hide||
zodpovědný|adj|responsible||
věnovat|vi|to give, to dedicate; (se) to devote oneself|věnovat práci|to attend to work
nahlas|adv|aloud, out loud; loudly||
zodpovědnost|f|responsibility||
silnice|f|road||
povolit|vp|to permit, to allow; to loosen|Povolil si pásek.|He loosened his belt
telefonní|adj|telephone|telefonní číslo|phone number
obyčejný|adj|ordinary, common, regular, usual||
dav|m|crowd|On zmizel v davu.|He vanished into the crowd
podnik|m|business, company||
tvářit se|vi|to look, to put on an expression||
dotknout|vp|to touch; to hurt, to offend|Dotkl se jejích citů.|He hurt her feelings
řízení|n|driving; management; proceedings||
zamilovat se|vp|to fall in love|Ale pak se zamiloval do učení.|But then he fell in love with teaching
různý|adj|different; various||
mířit|vi|to aim; to be heading||
míč|m|ball|mrtvý míč|dead ball
celek|m|whole||
zelený|adj|green|komu se nelení, tomu se zelení|early bird gets the worm
víra|f|faith, belief||
chlapík|m|guy, dude||
alkohol|m|alcohol||
kdokoli|pron|anyone, anybody||
rozdělit|vp|to divide, to split|Rozdělili jsme je do čtyř skupin.|We divided them into four groups
hráč|m|player||
fotbal|m|football, soccer, association football||
vystoupit|vp|to get off; to perform|Vystoupila z tramvaje.|She has disembarked the tram
výzkum|m|research|empirický výzkum|empirical research
napít se|vp|to have a drink||
láhev|f|bottle; jar|leidenská láhev|Leyden jar
jelikož|conj|as, since, because||
tma|f|darkness||
velikost|f|size|Potřebuji to ve větší velikosti.|I need it in a bigger size
dospělý|m|adult||
síť|f|net; network|mobilní síť|cellular network
prohlášení|n|declaration||
trávit|vi|to spend (time); to digest|trávit potravu|to digest food
brýle|f|glasses, spectacles|Měl na nose brýle.|He had glasses on his nose
kráva|f|cow||
procházet|vi|to go through; (se) to walk||
vzbudit|vp|to wake (someone) up; (se) to wake up|Ze snu mě vzbudil podezřelý hluk.|Disconcerting noice woke me up from a dream
modrá|f|blue (colour)||
výpověď|f|notice (of dismissal); testimony||
patro|n|floor, storey||
vstát|vp|to get up; to stand up||
převzít|vp|to take over; to receive||
vzorek|m|sample||
rodinný|adj|family||
pláž|f|beach||
výborný|adj|excellent, great|Můj soused je výborný řečník.|My neighbor is an excellent speaker
sever|m|north||
naopak|adv|on the contrary||
omluva|f|apology||
stáhnout|vp|to download; to pull down; to withdraw|stáhnout soubor|to download a file
dětství|n|childhood||
major|m|major||
omyl|m|error||
metr|m|metre; tape measure||
zbláznit se|vp|to go crazy||
brečet|vi|to cry, to weep||
nést|vi|to carry||
daleký|adj|far, distant, remote||
vítat|vi|to welcome||
jistit|vi|to secure; to guarantee, to ensure||
zdravit|vi|to greet, to salute||
peníz|m|coin||
venek|m|outside, exterior||
zašeptat|vp|to whisper||
školit|vi|to school, to train||
vzpomínka|f|memory|vzpomínky člověka|human memories
tatínek|m|dad, daddy||
vůči|prep|towards, to; against, vis-à-vis||
tančit|vi|to dance||
území|n|territory||
odhalit|vp|to reveal; to detect||
samotný|pron|alone; himself, itself|Přišel i samotný pan předseda.|The chairman himself came
rádio|n|radio|Rád poslouchám rádio.|I like listening to the radio
technologie|f|technology||
dlužit|vi|to owe||
prohrát|vp|to lose|Nebude šťastný, když znovu prohrají.|He won’t be happy if they lose again
rukojmí|m|hostage||
sebevražda|f|suicide||
modlit se|vi|to pray||
počet|m|number, count|značný počet|quite a number, crowd
nejvíce|adv|most||
svobodný|adj|free; single||
západ|m|west; sunset||
strýc|m|uncle||
legrační|adj|funny, humorous, comical||
představovat|vi|to represent; (si) to imagine|Jak si představujeme ideálního politika?|How do we envision the ideal politician?
dopadnout|vp|to come out, to turn out|Snad to dopadne dobře.|Hopefully it will turn out well
odstranit|vp|to remove; to eliminate||
génius|m|genius||
zamilovaný|adj|in love||
vážit|vi|to weigh; (si) to respect|Vážíme ten kámen.|We weigh the stone
těsně|adv|tightly|těsně vázaný|tightly coupled
podezření|n|suspicion|vyvolat / vyvolávat podezření|to raise suspicion
šek|m|check, cheque||
ženit se|vi|to get married (of a man)||
dozadu|adv|backwards, to the back||
oficiálně|adv|officially||
snít|vi|to dream||
rovný|adj|straight; equal; flat|rovné příležitosti|equal opportunities
roh|m|horn; corner||
zámek|m|lock; château, castle||
původní|adj|original||
lano|n|rope, cable||
považovat|vi|to consider, to regard||
pytel|m|bag, sack|pytel na sezení|bean bag
návrat|m|return||
dostatečně|adv|sufficiently||
plus|conj|plus|Dva plus dva je čtyři.|Two plus two equals four
oddělený|adj|separate||
lehce|adv|easily; lightly||
propustit|vp|to release; to dismiss||
dech|m|breath||
postava|f|character; figure||
veš|f|louse||
rozloučit|vp|(se) to say goodbye; to separate, to disunite||
riziko|n|risk||
anglicky|adv|in English||
domluvit|vp|to arrange; to finish speaking|Domluvíš se německy?|Can you make yourself understood in German?
krásně|adv|beautifully||
prádlo|n|laundry||
studovat|vi|to study||
hon|m|hunt, chase|hon na lišku|fox hunt
trenér|m|coach, trainer||
smích|m|laughter|dát se do smíchu|to start laughing
zdarma|adj|free of charge, for free||
sýr|m|cheese|pizza se sýrem|pizza with cheese
ničit|vi|to destroy, to damage||
internet|m|internet||
zábavný|adj|entertaining, fun||
ochrana|f|protection|dát do ochrany|to place under protection
varování|n|warning|bez varování|without notice
parta|f|team, gang, outfit, crew||
poznávat|vi|to get to know; to come to realize||
kontrolovat|vi|to check; to check for; to control||
dokola|adv|around||
federální|adj|federal||
reakce|f|reaction|vyvolat reakci|to elicit a reaction
kurz|m|course; rate||
připomínat|vi|to remind; to resemble||
informovat|vi|to inform||
příjemný|adj|pleasant, agreeable|Je příjemné místo na cestování.|It is a pleasant place to travel
nula|f|zero||
krátký|adj|short||
virus|m|virus||
odměna|f|reward||
soutěžit|vi|to compete|Soutěžili v běhu.|They were competing in running
lehnout|vp|to lie down||
furt|adv|all the time||
zápasit|vi|to wrestle; to struggle||
ples|m|ball (dance)||
najmout|vp|to hire; to rent, to lease||
třicet|num|thirty|třicet metrů|thirty metres
pistole|f|pistol||
schovávat|vi|to hide; (se) to hide||
lhář|m|liar||
péče|f|care|věnovat péči|to take care
kapela|f|band||
kotě|n|kitten||
péct|vi|to bake; to roast||
laboratoř|f|laboratory||
taxi|n|taxi||
majitel|m|owner, proprietor||
svědomí|n|conscience||
krýt|vi|to cover; to protect||
vánoční|adj|Christmas (adj.)|vánoční cukroví|Christmas sweets
vybavení|n|equipment||
kariéra|f|career||
titulek|m|headline; subtitle||
půlka|f|half|v půlce cesty|halfway
nutit|vi|to force||
vysvětlovat|vi|to explain||
zjevně|adv|apparently, evidently, obviously||
plánovat|vi|to plan|Firma plánuje výstavbu elektrárny.|The firm is planning the construction of a power plant.
dodávka|f|delivery; van||
neznámý|adj|unknown; stranger||
zadržet|vp|to hold back, to stop; to arrest, to detain|zadržet dech|to hold one’s breath
cvičit|vi|to exercise|Cvičím asi třikrát týdně.|I do exercise three times a week
přítomnost|f|presence; the present||
vděčný|adj|grateful||
donést|vp|to bring; to rat out||
scéna|f|scene||
banda|f|gang, crowd, band||
spustit|vp|to lower, drop; to start up||
zabití|n|killing, kill; manslaughter||
starosta|m|mayor||
tričko|n|T-shirt||
kufr|m|suitcase; (car) boot||
poradit|vp|to advise; (si) to advise, to give advice|Umím si poradit.|I can handle myself
nechutný|adj|disgusting||
plně|adv|fully, in full|plně vybaven|fully equipped
lov|m|hunt; hunting||
věda|f|science||
bitva|f|battle||
vyhnout se|vp|to avoid||
zdravotní|adj|health (adj.), medical||
utrpení|n|suffering||
spíše|adv|rather||
vězeň|m|prisoner||
ložnice|f|bedroom||
oficiální|adj|official|oficiální název|official name
bouře|f|storm||
mamka|f|mum, mom, mommy||
podstata|f|essence, substance||
hlasovat|vi|to vote||
ztrácet|vi|to lose|ztrácet čas|to waste time
koncert|m|concert||
tetování|n|tattoo||
nemožný|adj|impossible||
lehký|adj|light; easy||
útěk|m|escape||
jih|m|south||
finanční|adj|financial||
stráž|f|guard||
špinavý|adj|dirty|Okna jsou hodně špinavá.|The windows are very dirty
obrátit|vp|to flip, to turn over||
rameno|n|shoulder||
lekce|f|lesson, lessons||
ochotný|adj|willing, cooperative||
týkat se|vi|to concern, to relate to||
rozejít se|vp|to part; to break up, to split up|Její rodiče se rozešli.|Her parents separated
základna|f|base|letecká základna|air base
scénář|m|script; scenario, screenplay||
slavný|adj|famous, renowned; glorious, memorable||
opice|f|monkey; ape|To už jsem měl opici jako prase.|I was drunk like hell by then
sláva|f|fame; glory||
stvoření|n|creation; creature||
zařízený|adj|furnished||
pilot|m|pilot||
základ|m|basis, foundation||
bytost|f|being||
kabát|m|coat|Potřebujeme kabáty.|We need coats
triko|n|T-shirt||
vyzkoušet|vp|to try out, to test||
cvičení|n|exercise||
vylézt|vp|to crawl out; to climb out||
magie|f|magic||
nahlásit|vp|to report||
oznámit|vp|to announce||
pohotovost|f|emergency; ER||
září|n|September||
hrůza|f|dread|vyvolat hrůzu|to inspire terror
mýlit|vi|to mislead; (se) to err, to be in error||
rakovina|f|cancer|rakovina plic|lung cancer
bývat|vi|to be (habitually), used to be|Bývala jsem učitelka španělštiny.|I used to be a Spanish teacher
splnit|vp|to fulfil, to meet|Přijela si splnit sen.|She came to fulfill a dream
význam|m|meaning, sense; importance||
majetek|m|possession, property||
dohodnout|vp|to arrange, fix; (se) to agree||
prášek|m|powder; pill||
tlustý|adj|fat; thick|tlustý drát|thick wire
stávat|vi|to stand; (se) to happen, to become|Stával tam dům.|A house used to stand there
slepý|adj|blind|Mezi slepými jednooký králem.|Among the blind, a one-eyed man is king
prakticky|adv|practically, virtually||
bratranec|m|cousin, male first cousin||
hračka|f|toy, plaything; piece of cake, breeze||
proud|m|stream, current||
jízda|f|ride, drive||
vejít|vp|to enter, to come in; (se) to fit||
rušit|vi|to disturb; to cancel||
poklad|m|treasure||
veřejnost|f|public|povědomí veřejnosti|public awareness
materiál|m|material|Co je to za materiál?|What kind of material is it?
horký|adj|hot||
slušný|adj|polite, well-behaved; decent||
smůla|f|bad luck; pitch||
gratulovat|vi|to congratulate||
úplný|adj|complete||
model|m|model|Máte jiný model?|Do you have another model?
vhodný|adj|suitable, fit||
postup|m|procedure; progress||
můra|f|moth; nightmare||
mrtvola|f|corpse||
přední|adj|front; leading||
dělo|n|cannon or large gun||
kněz|m|priest||
zavraždit|vp|to murder||
rock|m|rock||
blížit se|vi|to near, to approach, to get closer||
hloupost|f|stupidity|Udělal jsem hloupost.|I did something stupid
náklaďák|m|truck||
hrozba|f|threat||
líbat|vi|to kiss||
horko|adv|hot; heat|Dnes je horko.|It’s hot today
respekt|m|respect, esteem|jednat s respektem.|to treat with respect
podíl|m|share, portion||
zločinec|m|criminal|nebezpečný zločinec|dangerous criminal
deník|m|diary, journal; journal, newspaper||
vskutku|adv|really; indeed||
vojenský|adj|military|vojenská přehlídka|military parade
ztracený|adj|lost|ztracené dítě|a lost child
něha|f|tenderness||
podvod|m|fraud, deception|Říkal, že to je podvod.|He said it was a scam
báječný|adj|wonderful|báječný člověk|wonderful person
posádka|f|crew||
vítěz|m|winner||
přednost|f|priority; advantage|Toto má přednost.|This takes precedence
vysoko|adv|high; highly||
dvanáct|num|twelve||
zbývat|vi|to remain, to be left||
určitý|adj|certain; definite||
generace|f|generation||
tlačit|vi|to push; (se) to jostle||
prima|adj|nice, great||
kopie|f|copy||
žaludek|m|stomach|špatněl/blbě od žaludku|sick to one’s stomach
upír|m|vampire||
létat|vi|to fly|Přeji si umět létat!|I wish I could fly!
západní|adj|western||
stupeň|m|degree, level; step||
had|m|snake||
sendvič|m|sandwich||
pokoušet|vi|to tempt; (se) to try, to attempt||
odchod|m|departure||
dokument|m|document; documentary|přírodopisný dokument|wildlife documentary
zabiják|m|killer||
narazit|vp|to hit, to bump into|Narazil hlavou do zdi.|He hit his head against the wall
stín|m|shadow; shade||
veškerý|pron|all||
plakat|vi|to weep, to cry||
vlk|m|wolf|V dálce slyšely výt vlky.|The howls of wolves could be heard from the distance.
čarodějnice|f|witch||
taška|f|bag||
nastoupit|vp|to get on, to board; to start (a job)|Nastoupili jsme do špatné tramvaje.|We have boarded the wrong tram
momentálně|adv|currently||
hraní|n|play, playing|Rozdali karty a pustili se do hraní.|They dealt out the cards and set about playing.
vteřina|f|second (of time)||
odnést|vp|to take away, to carry away, to carry, to take|Odnesli raněného na nosítkách.|They carried the wounded man away on a stretcher.
zrádce|m|traitor; betrayer||
odpovídat|vi|to answer; to correspond||
pohromadě|adv|together||
podpora|f|support|lékařova podpora pacientovi|doctor’s support for the patient
detail|m|detail||
kdykoli|adv|whenever, at any time||
uklidit|vp|to tidy up; to tidy away, to put away|Už jste si uklidili pokoj?|Have you tidied up your room?
koleno|n|knee||
vyděsit|vp|to frighten, horrify|Velice ho to vyděsilo.|It frightened him a lot
pizza|f|pizza||
odpočívat|vi|to rest|odpočívat na pohovce|to relax on the sofa
potichu|adv|quietly||
padesát|num|fifty||
zákazník|m|customer||
mapa|f|map||
zaměřit|vp|to focus||
letos|adv|this year||
složka|f|folder; constituent||
déšť|m|rain|prudký déšť|heavy rain
zaútočit|vp|to attack, to launch an attack||
organizace|f|organization||
moderní|adj|modern||
řadit|vi|to sort, to rank; to shift (gear)|Řadí je do správných skupin.|She sorts them into the right groups
střelit|vp|to shoot||
vyloučit|vp|to rule out, to preclude; to expel, to exclude|Tuto možnost nelze vyloučit.|This possibility cannot be ruled out
vézt|vi|to carry, to drive (by vehicle)||
přesunout|vp|to move, to shift, to transfer|Začal tímto směrem přesouvat většinu armády.|He began to move most of the army in this direction.
šok|m|shock||
kilo|n|kilo||
růst|vi|to grow; growth||
politika|f|politics; policy|provést politiky|to implement policies
hřích|m|sin||
příklad|m|example|na příklad|for example
ignorovat|vi|to ignore||
herec|m|actor, player||
vyrovnat|vp|to equalize, to balance; (se) to come to terms||
zmatený|adj|confused, perplexed, woozy||
zaměstnanec|m|employee|kmenový zaměstnanec|permanent employee
loni|adv|last year||
národ|m|nation, people||
porota|f|jury||
vyjádřit|vp|to express, render, voice||
medvěd|m|bear||
zelená|f|green (colour)||
plést|vi|to braid, to plait; to knit|Přestaň se plést do mých věcí.|Stop messing with my stuff/things
obtěžovat|vi|to annoy; to harass||
název|m|name, title||
trápit|vi|to trouble, to worry; to torment, to torture||
vyčistit|v|to clean||
podmínka|f|condition; term||
obava|f|worry, fear|vyvolat obavy|to raise concerns
ministr|m|minister||
vztek|m|anger||
soudit|vi|to judge||
ochranka|f|bodyguards, security detail||
stydět se|vi|to be shy; to feel ashamed||
pochybovat|vi|to doubt||
povolený|adj|permitted; loosened||
negativní|adj|negative||
založit|vp|to found, to establish|založit firmu|to found a company
tráva|f|grass||
značka|f|brand; sign, mark||
břicho|n|belly, abdomen||
profesionální|adj|professional||
čtvrtý|adj|fourth||
ačkoliv|conj|although||
inspektor|m|inspector||
ustoupit|vp|to step back, to retreat||
dědeček|m|grandfather; old man||
učinit|vp|to do, to make|učinit hlášení|to make a report
potěšit|vp|to please||
krysa|f|rat||
milión|m|million||
spokojený|adj|satisfied, content||
sekunda|f|second||
dobrodružství|n|adventure||
trénink|m|training, coaching, practice||
točit|vi|to turn, to spin||
fanoušek|m|fan|fotbalový fanoušek|football fan
prozatím|adv|for the time being||
kruh|m|circle; ring||
motiv|m|motive; motif||
tiše|adv|silently||
usnout|vp|to fall asleep||
poskytnout|vp|to provide||
střecha|f|roof|Lepší vrabec v hrsti nežli holub na střeše.|A bird in the hand is worth two in the bush
bok|m|side; flank||
několikrát|adv|several times||
nalézt|vp|to find||
temný|adj|dark||
žíla|f|vein||
blok|m|block; notebook||
určit|vp|to determine, to specify|Věk se nedal určit.|The age couldn’t be determined
podařit se|vp|to manage, to succeed|Podařilo se mu vylézt na věž.|He managed to climb the tower
paluba|f|deck|na palubě|on board
žid|m|Jew||
výročí|n|anniversary||
vídat|vi|to see (regularly)|Už tě nemůžu vídat.|I can’t see you anymore
rozbít|vp|to break, to smash, to shatter; (se) to break, to shatter|omylem rozbil šálek.|he broke a cup by accident
pozitivní|adj|positive||
vlna|f|wave; wool|Čekala na velkou vlnu.|She was waiting for a big wave
mlčet|vi|to be silent||
kupovat|vi|to buy something|Zlato kupuje každý.|Everyone buys gold
divadlo|n|theater, theatre||
fuj|intj|yuck||
salát|m|lettuce; salad||
dluh|m|debt|mít dluhy|be in debt
vedlejší|adj|next (door), adjacent; secondary||
strčit|vp|to push, to shove; to stick, to insert||
připomenout|vp|to remind||
ozvat se|vp|to get in touch; to be heard|Ozvalo se zaklepání na dveře.|A knock on the door was heard
spolubydlící|m|roommate||
zmínit|vp|to mention||
emoce|f|emotion|vyvolat hluboké emoce|to trigger a lot of emotions
bojovník|m|fighter; martial artist||
sociální|adj|social|sociální inženýrství|social engineering
nelze|adv|it is impossible; it can’t||
děsivý|adj|horrifying||
neuvěřitelně|adv|incredibly, unbelievably||
těhotný|adj|pregnant|Je těhotná.|She’s pregnant
zaprvé|adv|first||
jehož|pron|whose, of which/whom|Spisovatel, jehož díla jsou známá.|A writer whose works are well known
především|adv|above all||
titul|m|title; (academic) degree||
krást|vi|to steal||
pozdravit|vp|to greet, to say hello, to salute||
zavřený|adj|closed|Máme zavřeno.|We are closed
věčnost|f|eternity||
identifikovat|vi|to identify||
infarkt|m|heart attack||
vrchol|m|peak, summit, top||
ministerstvo|n|ministry, department, office|ministerstvo financí|ministry of finance
přežití|n|survival||
pomsta|f|revenge||
balíček|m|packet; pack||
přesný|adj|precise; accurate||
symbol|m|symbol||
postavení|n|position|získat postavení.|to gain status
dětský|adj|child, children, child’s, children’s; childish||
vyrobit|vp|to produce, to manufacture||
napůl|adv|half, in half, fifty-fifty|napůl mrtvý|half-dead
výkon|m|performance; output, power|Sportovec podal v závodě velký výkon.|The sportsman gave a great performance in the race.
milost|f|mercy; grace||
vysílání|n|broadcasting; transmission||
chutnat|vi|to taste good; to taste||
výbuch|m|explosion||
heslo|n|password; headword||
lidstvo|n|humankind, humanity, human race||
povrch|m|surface||
vědec|m|scientist||
krádež|f|theft||
souboj|m|fight, duel||
střelec|m|shooter; gunner||
taťka|m|dad||
týpek|m|guy, dude||
obzvlášť|adv|especially||
praštit|vp|to hit, to punch, to strike||
prát|vi|to wash, to launder; (se) to fight||
věž|f|tower|stereo věž|stereo tower
loupež|f|robbery||
zapnout|vp|to switch on, to turn on, to enable|zapnout počítač|to turn the computer on
popovídat|vp|to have a chat||
spravit|vp|to repair||
forma|f|form, shape; mold/mould||
nejméně|adv|least||
pověst|f|legend; reputation|Podle pověsti|According to the legend
hustý|adj|dense; viscous||
kostým|m|costume||
šíleně|adv|insanely||
nálada|f|mood|Dnes na tancování nemám náladu.|I’m not in the mood for dancing today
házet|vi|to throw, to fling||
vlevo|adv|on the left||
hala|f|hall||
načase|adv|about time||
levý|adj|left|Kde je levá bota?|Where is the left boot?
patnáct|num|fifteen||
požár|m|fire, conflagration||
souhlas|m|agreement, consent||
nechť|part|let|Nechť tě provází Síla.|May the Force be with you
neboť|conj|as, since, because|Nespí, neboť se mu nechce spát.|He does not sleep, as he does not feel like it.
fotografie|f|photograph||
lovit|vi|to hunt||
pitomec|m|idiot, moron, nitwit||
nahý|adj|naked||
poměr|m|ratio; relationship; affair||
hřiště|n|playground; field, playing field|školní hřiště|school playground
poplach|m|alarm|planý poplach|false alarm
košile|f|shirt|flanelová košile|flannel shirt
zásah|m|hit; intervention||
přestěhovat|vp|to move; (se) to move, to relocate||
půda|f|soil, land; attic||
pozemek|m|plot, lot||
krvácet|vi|to bleed||
učitelka|f|teacher (female)||
stovka|f|hundred||
krvácení|n|bleeding, hemorrhage||
stvořit|vp|to create||
linka|f|line|autobusová linka|bus route
sdílet|vi|to share||
popsat|vp|to describe||
kanál|m|sewer, drain, gutter; canal||
budoucí|adj|future|budoucí čas|future tense
ušetřit|vp|to save (money, time)||
předem|adv|in advance, beforehand|vědět předem|to know in advance
přivézt|vp|to bring||
trpělivost|f|patience|Musel se obrnit trpělivostí.|He had to arm himself with patience
dařit se|vi|to be doing, to do, to fare|Jak se Vám daří?|How are you doing?
jezero|n|lake|Velké Solné jezero|Great Salt Lake
podpis|m|signature||
pero|n|feather; pen||
odvaha|f|courage|získat odvahu|to get the courage
obviněný|m|defendant, accused||
pohřbít|vp|to bury||
úder|m|blow, strike||
novinka|f|news; innovation||
včerejší|adj|yesterday’s||
divoký|adj|wild||
sezení|n|sitting; session|počet míst k sezení|seating capacity
hýbat|vi|to move; (se) to move|Osel hýbe ušima.|The donkey moves its ears
list|m|leaf; sheet|rodný list|birth certificate
východní|adj|eastern||
táhnout|vi|to pull, to drag||
vpřed|adv|forward||
prohledat|vp|to search, to rummage||
šílenec|m|lunatic||
sbalit|vp|to pack up||
šampaňské|n|champagne||
umělec|m|artist||
rozvod|m|divorce||
posedlý|adj|obsessed||
naštvat|vp|to annoy, irritate||
utajení|n|secrecy|stupeň utajení|degree of secrecy
osamělý|adj|lonely||
spodní|adj|lower, bottom||
vyrůst|vp|to grow up|Až vyrostu, budeš se bát ty mě.|When I grow up, you will be afraid of me
párkrát|adv|couple of times||
hromada|f|pile, heap|Kam oko dohlédlo, všude byly jen hromady kamení.|Piles of stones was all that was in sight
hnusný|adj|ugly; nasty||
strejda|m|uncle||
technika|f|technology; technique||
polibek|m|kiss|dát polibek|to give a kiss
ošklivý|adj|ugly, nasty, hideous|ošklivý jako noc|ugly as sin
studium|n|studies||
nadále|adv|still; henceforth|I nadále pracuje v tomto odvětví.|He continues to work in the industry
geniální|adj|ingenious||
navzdory|prep|in spite of, despite|navzdory všem našim snahám|in spite of all our efforts
tah|m|move (in a game); pull|Jsi na tahu.|It’s your turn
předchozí|adj|previous||
čtvrt|f|quarter||
klidný|adj|calm||
zpomalit|vp|to slow down||
ústa|n|mouth|Zakryla si ústa rukama, aby nevykřikla.|She put her hands over her mouth so as not to scream.
sál|m|hall, large room||
obrana|f|defense||
živit|vi|to feed, to support; (se) to make a living||
důvěra|f|trust|získat důvěru|to gain trust
poradce|m|advisor||
pitomý|adj|stupid, dumb, daft; annoying|Ten tvůj nápad je fakt pitomý.|Your idea is really stupid
drahoušek|m|darling, sweetheart, honey||
překonat|vp|to overcome; to surpass|Jeho úspěch překonal všechna očekávání.|His success has exceeded all expectations
taxík|m|taxi, cab||
plnit|vi|to fill; to fulfill|Své sliby vždy plní.|He always fulfills his promises
bezpečně|adv|safely||
výhled|m|view; outlook||
nenávist|f|hatred, hate|chovat nenávist|to hold hatred
pronásledovat|vi|to chase, to pursue||
okouzlující|adj|charming, fascinating||
cvok|m|nutcase||
mezinárodní|adj|international||
sluneční|adj|sun; solar|sluneční energie|solar energy
drak|m|dragon; wyvern||
funkce|f|function; feature||
jasno|n|clear (sky); understood|vnést jasno|to shed light
sklo|n|glass|barevné sklo|coloured glass
pálit|vi|to burn; to fire|nehas, co tě nepálí|Do not put out what does not burn you
náhle|adv|suddenly||
obětovat|vi|to sacrifice||
obojí|adj|of both kinds||
poškození|n|damage, harm||
pořad|m|programme, show|televizní pořad|television show
zvědavý|adj|curious||
zklamat|vp|to disappoint; (se) to be disappointed|Rytíř zklamal svého krále jen jednou.|The knight disappointed his king only once
léčit|vi|to heal; to treat||
tradice|f|tradition||
trapný|adj|embarrassing, pathetic, cringeworthy||
udržovat|vi|to maintain||
vědomý|adj|conscious, deliberate; (si) conscious, aware of|Je si vědomý toho, že zklamal.|He is conscious of the fact that he failed
zákaz|m|prohibition|uložit zákaz|to impose a ban
koupelna|f|bathroom, bath||
odjíždět|vi|to leave, to depart||
rukavice|f|glove||
nasadit|vp|to put on; to deploy||
hlídka|f|watch; sentinel||
kampaň|f|campaign||
lze|adv|it is possible|Lze to udělat.|It is possible to do it
evidentně|adv|evidently, obviously, clearly||
oceán|m|ocean||
světový|adj|world (adj.), global|světový názor|worldview
naproti|prep|opposite||
dle|prep|per, according to, pursuant to||
lékařský|adj|medical||
lovec|m|hunter||
veselý|adj|cheerful, merry|Veselé Vánoce, strýčku Skrblíku!|Merry Christmas, uncle Scrooge!
nedostatek|m|scarcity; lack, deficiency, shortage|nedostatek jídla|lack of food
obří|adj|giant||
podporovat|vi|to support||
univerzita|f|university||
pozorovat|vi|to observe, to watch; to watch out||
manažer|m|manager||
osobnost|f|personality||
příšerný|adj|terrible||
bláznivý|adj|crazy|bláznivá komedie|crazy comedy
předmět|m|object; (school) subject|volitelný předmět|elective subject
nepořádek|m|disorder; mess||
obejmout|vp|to hug, to embrace||
čistě|adv|cleanly, neatly; purely, strictly, entirely||
naprostý|adj|absolute||
únos|m|kidnapping, kidnap||
robot|m|robot||
realita|f|reality||
dosud|adv|until now, up to now, so far||
bazén|m|pool, swimming pool||
mluva|f|speech||
rosa|f|dew||
zkrátka|adv|in short||
imunita|f|immunity||
touha|f|desire|vyvolat touhu|to inflame desire
příroda|f|nature; outdoors||
pěšky|adv|on foot, by foot|chodit pěšky|to go on foot
krutý|adj|cruel||
posledně|adv|last time||
složitý|adj|complicated; complex||
výtah|m|lift, elevator||
katastrofa|f|catastrophe||
odkdy|adv|since when||
osvobodit|vp|to free, to liberate||
sázka|f|bet||
zbabělec|m|coward||
komise|f|commission|Evropská komise|European Commission
šťastně|adv|luckily; happily|Šťastně vyvázli.|They luckily escaped
výzva|f|challenge; call, appeal||
použití|n|use||
zlobit|vi|to be naughty; to annoy; (se) to be angry|Doma mě začalo všechno zlobit.|Everything started irritating me at home
epizoda|f|episode||
whisky|f|whisky, whiskey||
vevnitř|adv|inside||
těžce|adv|heavily||
zhruba|adv|roughly|Zhruba v té době.|Around that time
šálek|m|cup|Udělal jsem šálek čaje a šel do postele.|I made a cup of tea and went to bed
tunel|m|tunnel||
pila|f|saw||
vysoce|adv|highly||
křídlo|n|wing||
zatčení|n|arrest||
dřevo|n|wood||
poněkud|adv|somewhat||
legenda|f|legend||
právní|adj|legal||
vybírat|vi|to choose; to collect||
smět|vi|to be allowed; may||
padnout|vp|to fall; to fit|Padnul za vlast v boji o Dukelský průsmyk.|He fell for his homeland in the battle for the Dukla Pass.
slabost|f|weakness||
respektovat|vi|to respect||
dostatek|m|enough, sufficiency, abundance||
časopis|m|magazine, journal||
sníh|m|snow||
teplý|adj|warm|Žlutá je teplá barva.|Yellow is a warm color
běhat|vi|to run||
ranní|adj|morning (adj.)||
tamten|pron|that; that one||
telefonát|m|telephone call||
finále|n|final (in sport)||
ohrozit|v|to endanger||
jeskyně|f|cave, cavern||
vysílat|vi|to send forth, to send out; to broadcast||
nazvat|vp|to call, to name||
start|m|start||
vypít|vp|to drink||
pouto|n|bond; (plural) handcuffs||
pád|m|fall; descent||
nástroj|m|tool; instrument||
hluk|m|noise||
tisk|m|print, printing; press||
umýt|vp|to wash|umýt okna|to wash the windows
teplota|f|temperature||
knížka|f|book, booklet||
jé|n|oh! wow!||
týdně|adv|weekly, per week|třikrát týdně|three times a week
strážce|m|guardian, guard||
absurdní|adj|absurd||
krize|f|crisis||
omylem|adv|by mistake, in error, inadvertently||
zapojit|vp|to connect, to plug, to attach; to involve|Do ničeho se nechci zapojit.|I don’t want to get involved in anything
zacházet|vi|to treat, to handle||
průzkum|m|exploration; research|podle průzkumů|according to polls
vana|f|bathtub, tub||
mocný|adj|powerful, mighty|být mocen něčeho|to control something
statečný|adj|brave||
plat|m|salary|nástupní plat|starting salary
úspěšný|adj|successful||
čtvrť|f|district, neighbourhood||
kompletní|adj|complete||
odporný|adj|repulsive||
pocházet|vi|to come from, to originate||
zničený|adj|destroyed||
reklama|f|advertisement||
údolí|n|valley||
benzín|m|gasoline, petrol, benzine||
plíce|f|lung||
veřejný|adj|public|veřejný klíč|public key
nudný|adj|boring|Film je nudný.|The film is boring
schválně|adv|on purpose|To nebyla nehoda. Udělal jsi to schválně!|That wasn’t an accident! You did it on purpose!
nejbližší|m|nearest, closest||
palec|m|thumb; big toe||
stěžovat si|vi|to complain|Nemůžu si stěžovat.|I can’t complain
příčina|f|cause||
záběr|m|shot (film)||
poledne|n|midday, noon||
pojištění|n|insurance||
nakupovat|vi|to shop||
spánek|m|sleep||
ačkoli|conj|although||
výhoda|f|advantage; benefit|získat výhodu nad kým|to gain an advantage over someone
zapsat|vp|to write down, to record||
vrchní|adj|upper, head (adj.); head waiter||
štít|m|shield; peak|horský štít|mountain peak
porušit|vp|to break, to violate||
příbuzný|adj|relative; related||
kapsa|f|pocket||
navrhnout|vp|to suggest, to propose; to design||
volání|n|call||
záchvat|m|seizure, attack||
manželé|m|married couple, husband and wife||
napětí|n|tension; voltage, tension|dráty vysokého napětí|high voltage wires
takovýhle|pron|such, like this||
tahat|vi|to pull, to drag|Tahali se o to jako psi kost.|They jostled for it like dogs for a bone
studený|adj|cold, cool||
pas|m|passport; waist|číslo pasu|passport number
vinný|adj|guilty||
páska|f|tape, band, ribbon, strip||
podlaha|f|floor||
vchod|m|entrance||
olej|m|oil|slunečnicový olej|sunflower oil
říše|f|realm; empire||
vystřelit|vp|to fire, to shoot||
nádherně|adv|magnificently, splendidly; beautifully||
bezvědomí|n|unconsciousness, coma|v bezvědomí|unconscious
expert|m|expert||
pokrok|m|progress||
podobně|adv|similarly, likewise||
zvážit|vp|to weigh; to consider||
rovně|adv|straight (on)||
nabízet|vi|to offer||
kudy|adv|wherethrough, which way||
psí|adj|dog (adj.), canine|psí bouda|doghouse
následující|adj|following, next, subsequent||
příjem|m|income; intake|příjem potravy|food intake
úmysl|m|intention|mít v úmyslu|to intend
hořet|vi|to burn; to feel, to want, to be aflame|Březové dřevo dobře hoří.|Birch wood burns well
podvodník|m|deceiver, swindler, cheater||
sorry|intj|sorry||
narození|n|birth||
technik|m|technician||
pátý|adj|fifth||
selhání|n|failure; default|selhání ledvin|kidney failure
terapie|f|therapy||
pohybovat se|vi|to move||
zrcadlo|n|mirror||
honit|vi|to chase||
tip|m|tip, guess||
pauza|f|break, pause; rest||
námitka|f|objection, protest|podat námitku|to object
natočit|vp|to film, to record||
účel|m|purpose, end|sloužit svému účelu|to serve its purpose
náklad|m|load, cargo||
gauč|m|couch, sofa||
pomyslet|vp|to think (of)||
humor|m|humor, humour||
výstřel|m|shot||
pás|m|belt||
bít|vi|to beat; (se) to fight||
přístroj|m|device, instrument||
parádní|adj|great, awesome, amazing, terrific||
baba|f|old woman, hag||
dokonale|adv|perfectly||
střelba|f|shooting||
psaní|n|writing; letter||
občan|m|citizen||
alarm|m|alarm||
děsit|vi|to horrify; (se) to fear, to be scared||
květina|f|flower||
napadení|n|attack, assault; an infestation||
odpuštění|n|forgiveness||
výslech|m|interrogation, questioning||
prospěch|m|benefit; (school) grades|Bylo mu to ku prospěchu.|It was to his profit/benefit
nevěsta|f|bride|Nevěsta se závojem.|Bride with veil
přimět|vp|to make, force||
uznat|vp|to acknowledge, to admit; to recognize||
asistent|m|assistant||
čtení|n|reading||
složit|vp|to compose; to assemble|Znovu složil své tělo na zem.|He has reposed again his body on the ground
maska|f|mask|lidé v maskách|people in masks
kopat|vi|to dig; to kick|Jako kluk kopal do míče celý den.|As a boy he used to kick the ball all day
nuda|f|boredom||
přinutit|vp|to force, compel||
hrabě|m|count||
drsný|adj|rough; harsh|drsný papír|rough paper
zlomený|adj|broken|zlomený meč|broken sword
poznámka|f|note, remark, comment|kritické poznámky|critical remarks
nedorozumění|n|misunderstanding||
křeslo|n|armchair|Uprostřed stojí červené křeslo.|There is a red armchair in the middle
prokázat|vp|to demonstrate, to show, to prove||
smrdět|vi|to stink||
spoušť|f|trigger||
francouzský|adj|French||
opak|m|opposite||
chléb|m|bread||
královský|adj|royal|královská rodina|royal family
prohlásit|vp|to declare, pronounce, announce, state||
sejmout|vp|to take off, to remove, to take away||
zářit|vi|to glow, to shine; to radiate|Osvětlený dům zářil do noci.|The lighted house was glowing into the night
výměna|f|exchange, replacement||
pozvání|n|invitation||
barák|m|house||
senátor|m|senator||
hudební|adj|music; musical||
běžný|adj|common; current|běžný zvyk|common practice
vládnout|vi|to rule, to reign||
hodnota|f|value||
zavést|vp|to introduce; to implement||
válec|m|cylinder||
zvýšit|vp|to increase, to raise, to up||
přinejmenším|adv|at least||
ctít|vi|to honor||
přirozeně|adv|naturally||
válečný|adj|war (adj.)|válečný zločinec|war criminal
vodní|adj|water; aquatic|vodní hladina|water surface
zbytečně|adv|uselessly, needlessly||
ideální|adj|ideal||
opatření|n|measure, precaution|nutná opatření|necessary measures
politik|m|politician||
předseda|m|chairman||
fantastický|adj|fantastic||
svolení|n|permission, consent, agreement|dostat svolení|to get permission
obchodník|m|trader, merchant||
vyděšený|adj|frightened||
projev|m|manifestation, display||
vášeň|f|passion||
album|n|album||
podruhé|adv|second time||
vládní|adj|governmental|masivní vládní kampaň|a massive government campaign
zapálit|vp|to light, to set on fire|zapálit oheň|light a fire
veliký|adj|great||
čestný|adj|honest, honourable; honorary||
vyhrožovat|vi|to threaten|Vyhrožují naší zemi.|They are threatening our country
guvernér|m|governor||
stihnout|vp|to manage (in time); to catch||
přistát|vp|to land|Letadlo právě přistálo|The plane has just landed
zezadu|adv|from behind||
farma|f|farm||
pěst|f|fist||
zítřek|m|tomorrow|Co můžeš udělat dnes, neodkládej na zítřek.|What can you do today, do not delay for tomorrow.
vzdálenost|f|distance||
svědčit|vi|to testify, to bear witness|svědčit proti někomu|to testify against someone
seriál|m|series||
vraždit|vi|to murder||
krátce|adv|briefly, shortly||
hurá|intj|hurrah, hurray||
připravovat|vi|to prepare, to get ready; (se) to get ready for|Připravovat se na válku.|To be preparing for war
zanechat|vp|to leave (behind)|Zanechal studia.|He quit school
talíř|m|plate|Jedí z krásných talířů.|They eat from beautiful plates
člun|m|boat||
správce|m|administrator; manager|správce databáze|database manager
prohlédnout|vp|to examine, to look over||
nadšení|n|enthusiasm|vyvolat nadšení|to evoke enthusiasm
kopec|m|hill|Jde to z kopce.|Things are going downhill
přiblížit|vp|to draw closer, to bring closer; to zoom in||
zahraničí|n|abroad, foreign countries|ministr zahraničí|foreign minister
mučit|vi|to torture||
podělit|vp|to divide, to share out||
zlepšit|vp|to improve; (se) to improve, to become better||
zachytit|vp|to capture||
podržet|vp|to hold (for a while)|Vždycky mě podržel.|He always had my back
hrad|m|castle||
zombie|noun|zombie||
přímý|adj|straight; direct||
turné|n|tour||
výjimečný|adj|exceptional||
průkaz|m|ID card, pass, licence||
hněv|m|anger, wrath|obracet svůj hněv proti|to turn one’s anger against
zoo|f|zoo||
silně|adv|strongly||
chaos|m|chaos||
jakto|adv|how so, how come, why||
střed|m|middle, midpoint, center; center||
vypustit|vp|to release, let out; to omit, leave out||
romantický|adj|romantic||
fáze|f|phase||
projet|vp|to drive through||
vůně|f|fragrance; smell, odor, odour||
set|m|set||
ochutnat|vp|to taste||
bohatství|n|wealth||
pohodlí|n|comfort||
zradit|vp|to betray||
stěhovat|vi|to move; (se) to move||
obřad|m|ceremony||
inteligentní|adj|intelligent, smart||
seznámit|vp|to acquaint; (se) to get acquainted|Rád bych se s tím pánem seznámil.|I would like to get acquainted with this mister.
zvyklý|adj|used to, accustomed|Jsem zvyklý vstávat brzy ráno.|I am used to getting up in the early morning
konkrétní|adj|concrete; specific||
tragédie|f|tragedy||
odznak|m|badge||
koupě|f|purchase||
čistit|vi|to clean||
přenést|vp|to carry over, to transfer; (se) to get over|Nemohu se přes tu nehodu přenést.|I can’t get over the accident
střela|f|shot; projectile, missile||
palác|m|palace||
prázdniny|f|vacation, holiday||
zničení|n|destruction, consumption, devastation, damage, ruination|zničení města nepřítelem|destruction of the city by the enemy
růže|f|rose||
spáchat|vp|to commit||
trefit|vp|to hit (a target); to find the way||
balík|m|parcel, package; hick||
církev|f|church||
načasování|n|timing||
komunikace|f|communication||
pošta|f|post office; mail||
učení|n|learning; teaching||
experiment|m|experiment|provést experiment|to perform an experiment
náboženství|n|religion|Islám je monoteistické náboženství.|Islam is a monotheistic religion
pomstít se|vp|to take revenge, to retaliate||
samota|f|solitude; isolated rural house||
sportovní|adj|sports|sportovní gymnázium|sports high school
pokazit|vp|to break, to break down; (se) to break, to break down||
vize|f|vision||
temnota|f|darkness||
konverzace|f|conversation||
svědectví|n|testimony, witness||
daň|f|tax||
háj|m|grove|Jde to do háje.|Things are going badly / It is headed for a dead-end.
riskantní|adj|risky||
záchrana|f|rescue, saving||
pásek|m|belt||
zamknout|vp|to lock||
kilometr|m|kilometre||
navrhovat|vi|to suggest, to propose; to design, to project||
ohled|m|regard||
lít|vi|to pour||
poškodit|vp|to damage, harm||
ověřit|vp|to verify||
vzdělání|n|education|získat vzdělání|to get an education
odpad|m|waste; drain||
dosah|m|scope, reach, range||
ohrožení|n|threat, danger, risk|ohrožení veřejného zdraví|threat to public health
drobné|m|change, small change, coins||
zmatek|m|confusion|vyvolat zmatek|to cause confusion
nešťastný|adj|unhappy; unlucky|nešťastná situace|unfortunate situation
vinit|vi|to accuse; to blame||
televizní|adj|television, TV|televizní pořad|TV show
reagovat|vi|to react||
parkoviště|n|parking lot, car park||
postoj|m|stance||
fantazie|f|imagination, fancy||
zachovat|vp|to preserve or conserve; (se) to behave|Zachoval se hanebně.|He behaved shamefully
míra|f|measure||
radit|vi|to advise; (si) to advise||
zvyknout si|vp|to get used to|Zvykla si na to. / Zvykla tomu.|She got used to it
máslo|n|butter||
trénovat|vi|to train, exercise||
přestože|conj|although||
srdeční|adj|heart, cardiac|To je má srdeční záležitost.|It’s close to my heart
posunout|vp|to move, to shift, to push; to put off, to postpone||
kuchař|m|cook, chef||
neštěstí|n|misfortune, accident; unhappiness||
instinkt|m|instinct||
zahodit|vp|to throw away, discard, get rid of; to waste, squander||
mrknout|vp|to blink; to take a look||
překrásný|adj|very beautiful||
blbě|adv|badly; stupidly|Je mi blbě.|I am sick
dobrovolně|adv|voluntarily||
požehnání|n|blessing||
kašlat|vi|to cough|Kašlu na to!|Screw it!
vyfotit|vp|to take a photo|Mohu si to vyfotit?|Can I take a picture of it?
nahradit|vp|to replace, to substitute||
agentura|f|agency|cestovní agentura|travel agency
zvyk|m|custom; habit|To je u nás zvykem.|It is a custom here
dráha|f|track; lane||
nahrávka|f|recording|zvuková nahrávka|sound recording
metro|n|metro, subway|Kolik stojí lístek na metro?|How much does a metro-ticket cost?
sklenice|f|glass; jar|sklenice na pití|a drinking glass
stres|m|stress|Jsem ve stresu.|I am stressed
hluboký|adj|deep|Voda byla příliš hluboká.|The water was too deep
mládí|n|youth|v mládí|in one’s youth
tajně|adv|secretly||
byznys|m|business||
proslov|m|speech, address, oration||
zvracet|vi|to vomit||
dopravní|adj|traffic|dopravní značka|traffic sign
zajisté|adv|certainly||
sprcha|f|shower||
oboje|num|both, both groups of, both sets of|oboje modré kalhoty|both blue pants
britský|adj|British||
vzácný|adj|rare; scarce||
zopakovat|vp|to repeat||
zevnitř|adv|from inside||
jakýkoli|pron|any||
náhrdelník|m|necklace||
leda|adv|only, just; except for; unless, only if|Leda blázen by tohle udělal.|Only a fool would do this
oženit se|vp|to get married (of a man)|Jejich syn se oženil se sousedovou dcerou.|Their son married the neighbour’s daughter
toužit|vi|to desire, to long||
letní|adj|summer|letní škola|summer school
srazit|vp|to knock down; (se) to collide|Vlak se srazil s osobním autem.|A train collided with a car
minimálně|adv|at least; minimally||
drobný|adj|petty, tiny, minute||
zbožňovat|vi|to adore||
úcta|f|respect|chovat úctu|to have respect
hájit|vi|to defend||
chůva|f|nanny||
úsilí|n|effort||
skladiště|n|storehouse, warehouse||
diamant|m|diamond||
nepříjemný|adj|unpleasant||
souřadnice|f|coordinate||
chirurg|m|surgeon||
balit|vi|to pack; to wrap|Musím balit. Zítra odjíždím.|I have to pack my bags. I’m leaving tomorrow
pozdrav|m|greeting, salutation||
ruský|adj|Russian||
spisovatel|m|writer||
časování|n|conjugation||
uniforma|f|uniform||
žlutý|adj|yellow|Jeho bunda je citronově žlutá.|His jacket is yellow like a lemon
chodba|f|corridor, hall, hallway; passageway||
civilizace|f|civilization||
nádobí|n|dishes, tableware||
řád|m|order, rules; timetable||
přirozený|adj|natural||
podpořit|vp|to support||
lézt|vi|to crawl; to climb||
odpovědnost|f|responsibility, accountability|nést odpovědnost za|to bear the responsibility for
natolik|adv|so much, enough|Uzdravila se natolik, že mohla chodit.|She recovered enough that she could walk
uvařit|vp|to cook||
prozradit|vp|to disclose, to divulge, to reveal; to betray||
pohovor|m|interview||
profil|m|profile||
zkazit|vp|(se) to spoil; to spoil, to botch|Nechtěl jsem zkazit legraci.|I didn’t want to spoil the fun
léčba|f|treatment, therapy||
jistota|f|certainty; security|jen pro jistotu|just to be safe, just in case
sdělit|vp|to inform, to communicate||
milenec|m|lover||
zoufale|adv|desperately||
natáčet|vi|to film, to shoot|Já právě teď natáčím film.|I’m shooting a movie right now
císař|m|emperor||
raketa|f|rocket||
údaje|m|data||
zoufalý|adj|desperate||
váha|f|weight; scales||
recept|m|recipe; prescription||
babka|f|old woman, granny||
tlačítko|n|button||
odvolat|vp|to call off; to recall||
bankovní|adj|bank|bankovní účet|bank account
série|f|series||
strategie|f|strategy||
žárlit|vi|to be jealous|Žárlíš na něj?|Do you feel jealous of him?
kouzelný|adj|magic, magical||
propuštění|n|liberation; release|propuštění rukojmí|release of hostages
výhra|f|win; prize||
působit|vi|to work, to act; to have an effect; to seem|Ona působí nejčastěji jako výtvarnice.|She works mostly as a graphic artist
písek|m|sand||
džus|m|juice||
knihovna|f|library; bookcase|jít do knihovny|to go to the library
provoz|m|operation; traffic||
velitelství|n|headquarters||
tvar|m|shape||
zvolit|vp|to choose; to elect||
divize|f|division||
zdržet se|vp|to abstain, to refrain, to forebear; to abstain|Zdrželi se hlasování.|They abstained from voting
odpor|m|resistance; aversion|vyvolat odpor|to stir up resistance
alfa|f|alpha||
popis|m|description||
novinář|m|journalist||
nastavit|vp|to set||
panenka|f|doll||
vkus|m|taste||
odpadky|m|rubbish, garbage, trash||
stěží|adv|hardly||
vodit|vi|to lead, guide, conduct||
drát|vi|wire||
rozumný|adj|reasonable, sensible||
továrna|f|factory||
denní|adj|day; daily, diurnal|denní světlo|daylight
poušť|f|desert||
čínský|adj|Chinese||
sít|vi|to sow||
náčelník|m|chief|náčelník Generálního štábu|Chief of Staff
tucet|m|dozen||
protokol|m|protocol||
kyslík|m|oxygen||
schod|m|step||
poprosit|vp|to ask for; to beg||
dohled|m|view; supervision|mimo dohled|out of sight
vrtulník|m|helicopter||
smutek|m|sadness; sorrow||
výška|f|height; altitude||
oznámení|n|announcement, notification||
terorista|m|terrorist||
udeřit|vp|to strike, to hit|Ten tenista udeřil do míče tvrdě.|The tennis player hit the ball hard
naneštěstí|adv|unfortunately||
vyléčit|vp|to cure||
pršet|vi|to rain|prší, prší, jen se leje|it’s raining, it’s raining, cats and dogs
cestování|n|travel|cestování do České republiky|traveling to the Czech Republic
snaha|f|effort||
účetní|m|accountant; accounting (adj.)||
naplnit|vp|to fill; to fulfil|Naplnit láhev až po vršek.|Fill the bottle to the top
podivný|adj|strange, peculiar|Lucas mi věnoval ten nejpodivnější pohled.|Lucas gave me the weirdest look when I said that.
asistentka|f|assistant (female)||
zrak|m|vision, sight||
legální|adj|legal||
obnovit|vp|to renew, to refresh||
perfektně|adv|perfectly; flawlessly||
citlivý|adj|sensitive, emotional; brittle||
doprovod|m|escort; accompaniment||
závěr|m|conclusion, end|ukvapené závěry|hasty conclusions
otrok|m|slave||
ovládání|n|control||
revoluce|f|revolution||
vír|m|whirlpool||
libra|f|pound||
náhradní|adj|spare||
uniknout|vp|to escape, to leak||
zisk|m|gain, profit||
fascinující|adj|fascinating||
užitečný|adj|useful||
zabrat|vp|to take up; to work (take effect)|Všechny ty krámy zabírají příliš mnoho místa.|All the stuff takes too much space
prohlídka|f|examination, inspection|provést prohlídku.|to conduct a search
kontaktovat|vi|to contact||
věrný|adj|faithful||
spolupráce|f|cooperation, collaboration|ve spolupráci s|in collaboration with
populární|adj|popular||
rozbitý|adj|broken||
zóna|f|zone|bezcelní zóna|duty-free zone
záhada|f|mystery||
drama|n|drama||
ovlivnit|vp|to influence||
chudý|adj|poor|Jsme chudí?|Are we poor?
unavit|vp|to tire, exhaust; (se) to get tired of|Už jsem se unavila tím životem doteď.|I’m tired of living the way I have until now
koš|m|basket||
koberec|m|rug, carpet||
vyvolat|vp|to call out; to cause, to provoke|vyvolat podezření|to raise suspicion
zbýt|vp|to remain, to be left||
chrám|m|temple||
sklad|m|warehouse|Jsem ve skladu.|I’m in the warehouse
nelegální|adj|illegal||
popel|m|ash||
vidění|n|vision||
aktivní|adj|active||
termín|m|date, deadline; term||
kouř|m|smoke||
vozidlo|n|vehicle||
steak|m|steak||
střih|m|cut; (film) editing||
upravit|vp|to edit; to adjust||
peněženka|f|wallet, billfold, purse||
schránka|f|box; mailbox||
mladík|m|young man||
text|m|text|text knihy|the text of the book
ráj|m|paradise|pravý ráj|sheer heaven
publikum|n|audience||
prostředek|m|means; middle|dopravní prostředek|means of transport
pevnost|f|fortress; firmness||
uslyšet|vp|to hear||
garáž|f|garage||
přerušit|vp|to interrupt||
hůl|f|stick, staff; hockey stick||
kapitola|f|chapter||
blesk|m|lightning; photoflash||
kec|m|nonsense, chatter|Nevěř těm zprávám, jsou to kecy.|Don’t believe the news, it’s rubbish
cigareta|f|cigarette|jít na cigaretu|to go for a cigarette
slyšení|n|hearing (in court)||
pevný|adj|firm||
milovaný|adj|beloved, loved||
personál|m|personnel, staff||
nádor|m|tumor||
viset|vi|to hang|Za to budeš viset, kamaráde.|You will hang for this, my friend
jedenáct|num|eleven||
následek|m|consequence||
čokoláda|f|chocolate||
dvojitý|adj|double||
vyslechnout|vp|to hear out; to overhear|Chci si vyslechnout tvůj příběh.|I want to hear your story
játra|n|liver||
spiknutí|n|conspiracy||
kupředu|adv|forward||
časový|adj|time (adj.)||
uvést|vp|to state, to mention; to introduce|uvést do chodu|to give a start
kříž|m|cross; crucifix||
obviňovat|vi|to accuse||
zaměstnání|n|occupation, job, employment||
přibližně|adv|approximately||
přistání|n|landing||
zbytky|m|leftovers||
sklep|m|cellar||
ohromný|adj|huge, enormous, immense, vast||
instrukce|f|instruction||
čekání|n|waiting||
půlnoc|f|midnight||
zápěstí|n|wrist||
vloupání|n|burglary||
německý|adj|German||
ocenit|vp|to appreciate; to award||
hladový|adj|hungry||
můstek|m|small bridge, footbridge||
krmit|vi|to feed||
podnikání|n|business||
horní|adj|upper||
krát|conj|times|Tři krát tři je devět.|Three times three is nine
muzeum|n|museum||
grant|m|grant||
paranoidní|adj|paranoid||
zrůda|f|monster||
vaření|n|cooking|olej na vaření|cooking oil
herečka|f|actress||
dodělat|vp|to finish, to complete; to cease working|Dnes to nemůžu dodělat.|I can’t finish it today
flotila|f|fleet; flotilla||
dvojče|n|twin||
miminko|n|baby||
synovec|m|nephew||
sůl|f|salt||
shoda|f|agreement||
zmrzlina|f|ice cream||
vystrašit|vp|to frighten||
pověsit|vp|to hang, to hang up|Pověsila prádlo na šňůru.|She hung the clothes on the clothline
teďka|adv|now||
fyzicky|adv|physically||
omáčka|f|sauce||
chlast|m|booze||
vyhýbat se|vi|to avoid||
ostrý|adj|sharp; spicy||
mořský|adj|sea|mořské dno|seabed
baterie|f|battery||
světle|adv|light (as in light blue)||
důvěřovat|vi|to trust||
přírodní|adj|natural|přírodní pohroma|natural disaster
okolnost|f|circumstance|za normálních okolností|under normal circumstances
minutka|f|minute, moment|Počkej minutku, skočím si pro peněženku.|Wait a minute, I’ll get my wallet
mlátit|vi|to beat, to thrash||
zítřejší|adj|tomorrow’s|zítřejší schůze|tomorrow’s meeting
taneční|adj|dance||
kino|n|cinema||
obloha|f|sky||
sousedství|n|neighbourhood, neighborhood||
obyvatel|m|inhabitant|místní obyvatelé|local people
ručník|m|towel, hand towel||
růžový|adj|pink|mít růžové představy|to have dreamy ideas
zabývat se|vi|to be engaged in, to be occupied with||
krám|m|shop; junk||
batoh|m|backpack, rucksack, knapsack||
zírat|vi|to stare||
spokojit se|vp|to be satisfied; to be content; to require no more than|spokojit se s málem|to be content with little
deska|f|board; plate, disk|fotografická deska|photographic plate
myšlení|n|thought, thinking||
pára|f|vapor; steam|zmizet jako pára nad hrncem|to vanish into thin air
zatratit|vp|to damn||
politický|adj|political||
údajně|adv|allegedly||
pozadí|n|background||
ulička|f|alley||
disk|m|disc, disk||
laskavý|adj|kind|To by od vás bylo velmi laskavé.|That would be very kind of you
dávka|f|dose||
původně|adv|originally; initially|Původně to bylo jezero.|Originally, it was a lake
prvně|adv|first, for the first time, at first, at the beginning||
umístit|vp|to place||
mizerný|adj|miserable||
hergot|intj|good Lord!||
kalhotky|f|panties, knickers||
existence|f|existence||
ozbrojený|adj|armed||
menu|n|menu|denní menu|daily menu
pobavit|vp|to amuse, to entertain; (se) to have fun|Chtěla jsem se jen pobavit s přáteli.|I just wanted to have some fun with my friends.
zážitek|m|experience||
křik|m|shout||
sport|m|sport||
dít se|vi|to happen||
odvážný|adj|brave, courageous||
avšak|conj|but||
nazdárek|intj|hello, hi||
golf|m|golf||
nábytek|m|furniture||
rozsudek|m|verdict, sentence|vynést rozsudek nad kým|to pass sentence on someone
hovořit|vi|to talk, to speak||
palivo|n|fuel, propellant|fosilní palivo|fossil fuel
vymazat|vp|to erase, to delete, to wipe||
čtyřicet|num|forty|čtyřicet metrů|forty metres
věznice|f|prison||
dědictví|n|heritage||
smrtící|adj|deadly, lethal||
plot|m|fence|dřevěný plot|wooden fence
zbytečný|adj|superfluous; futile, vain||
akademie|f|academy||
stěna|f|wall|na stěně|on the wall
děťátko|n|baby||
rozkošný|adj|adorable, darling, delightful||
divit se|vi|to be surprised, to wonder||
mlít|vi|to grind||
hodlat|vi|to intend, to be planning||
velet|vi|to command||
čelo|n|forehead||
zmizení|n|disappearance||
koktejl|m|cocktail; milkshake||
myš|f|mouse||
hlasování|n|voting||
pojistka|f|fuse; insurance policy||
svátek|m|holiday; name day||
anglický|adj|English||
pospíšit si|vp|to hurry up; to hasten, to hurry||
kšeft|m|deal; business||
porušení|n|breach, violation||
skok|m|jump||
snoubenka|f|fiancée||
zdejší|adj|local||
scházet|vi|to be missing; (se) to meet up|Scházíš mi.|I miss you
festival|m|festival||
hovězí|n|beef||
laskavě|adv|kindly||
sbor|m|choir; corps, body|diplomatický sbor|diplomatic corps
sezóna|f|season||
mince|f|coin|hodit si mincí|to flip a coin
vybavit|vp|to equip; (si) to recall|Je plně vybaven všemi náležitostmi.|It is fully equipped with all necessities
zklamání|n|disappointment||
zklamaný|adj|disappointed||
nudit|vi|to bore, to be boring; (se) to be bored||
nerv|m|nerve|Lezou ti na nervy.|They get on your nerves
trouba|f|oven|mikrovlnná trouba|microwave
skákat|vi|to jump|skákat do vody|to jump into the water
trůn|m|throne||
špína|f|dirt||
polévka|f|soup||
objekt|m|object||
porucha|f|disorder; failure, malfunction||
hluboce|adv|deeply||
hanba|f|shame; disgrace||
infekce|f|infection||
rytíř|m|knight||
databáze|f|database||
záře|f|glow||
řidičák|m|driver’s license||
poškozený|adj|damaged, injured, impaired|těžce poškozený|heavily damaged
skříňka|f|locker, cabinet||
otravovat|vi|to annoy; to poison||
náramek|m|bracelet||
doprovodit|vp|to accompany||
chutný|adj|delicious, tasty||
věčný|adj|eternal, perpetual|věčný dluhopis|perpetual bond
chytat|vi|to catch||
úkryt|m|hideout, hiding place||
svetr|m|sweater; pullover||
rozšířit|vp|to widen; (se) to spread||
kořist|f|prey; plunder, spoil|Dravec číhal na svou kořist.|The predator lay in wait for its prey
doteď|adv|up to now, to date||
odsoudit|vp|to convict; to condemn||
agresivní|adj|aggressive||
děd|m|grandfather; old man||
oslavit|vp|to celebrate||
opuštěný|adj|abandoned|opuštěný dům|abandoned house
totální|adj|total|Je totální držgrešle.|He is a total miser
potrestat|vp|to punish||
námořní|adj|naval; nautical|námořní míle|nautical mile
poslání|n|mission||
upozornit|vp|to notify, to point out; to warn||
urážka|f|offense, insult||
bunda|f|jacket, anorak|Má na sobě bundu s kožešinou.|She’s wearing a fur jacket
namísto|prep|in lieu of, instead of, rather than||
vydání|n|edition, issue; extradition||
zamyslet se|vp|to have a think, to give sth some thought, to consider|Na chvíli se zamyslel.|He paused in thought
milenka|f|lover, mistress||
naivní|adj|naive||
šílet|vi|to be crazy, to go crazy||
uklízet|vi|to tidy, to clean||
sekce|f|section, department, division; dissection|Celá sekce má lokální i exotické produckty.|All of sections have local and exotic products.
hnutí|n|movement||
doručit|vp|to deliver||
přístav|m|port, harbour, haven||
držení|n|holding, grip, possession|ztráta držení míče|loss of possession of the ball
vyndat|vp|to take out, to pull out|Vyndal si ruce z kapes.|He took his hands out from the pockets
současný|adj|contemporary; current, present|v současné době|currently, nowadays
dvůr|m|court, courtyard; court||
snížit|vp|to lower||
plášť|m|cloak||
rekord|m|record||
mimozemšťan|m|alien, extraterrestrial, ET||
koza|f|goat||
obejít|vp|to bypass; (se) to do without, to dispense||
spojitost|f|connection; continuity||
jablko|n|apple||
vědecký|adj|scientific||
šetřit|vi|to save; to investigate|Kdo šetří, má za tři.|Who saves, has thrice
skříň|f|wardrobe, cupboard|kuchyňská skříň|kitchen cupboard
zpozdit|vp|to delay, hold up; (se) to be late, to fall behind||
tón|m|tone||
žralok|m|shark|Neviděla toho žraloka pod hladinou.|She didn’t see the shark under the surface
fotit|vi|to photograph||
elektrický|adj|electric, electrical|elektrické inženýrství|electrical engineering
vykašlat|vp|to cough up; (se, na) to give up on||
zásoba|f|stock, supply; reserve||
soubor|m|file|Soubor nenalezen.|File not found
rasa|f|race||
uspořádat|vp|to organize; to order||
operovat|vi|to operate||
neobvyklý|adj|unusual; strange, peculiar||
morální|adj|moral|morální závazek|moral obligation
bestie|f|beast, monster||
uložit|vp|to save, to store; to put away|uložit zákaz|to impose a ban
běloch|m|white male||
směna|f|shift (at work); exchange|noční směna|night shift
zdaleka|adv|by far; from afar|Nezdá se zdaleka tak populárním jako tvůj.|It doesn’t seem quite as popular as yours
kuřecí|adj|chicken (adj.)|kuřecí maso|chicken
galaxie|f|galaxy||
urazit|vp|to offend, to insult; (se) to take offense||
spis|m|file, document||
utratit|vp|to spend (money)||
kámoška|f|buddy (female)||
ovce|f|sheep||
otevření|n|opening||
doporučení|n|recommendation||
pouhý|adj|mere||
snímek|m|picture, shot; slide||
hvězdný|adj|stellar, star|hvězdný vítr|stellar wind
klec|f|cage||
polštář|m|pillow; cushion||
konat|vi|to do; (se) to take place||
hrubý|adj|rough, coarse||
vzor|m|pattern; model, example||
rozrušený|adj|upset||
dodat|vp|to add; to supply, to provide, to furnish||
zhluboka|adv|deeply||
exploze|f|explosion||
vývoj|m|development||
kapka|f|drop||
hádka|f|quarrel||
přísně|adv|strictly; harshly||
veřejně|adv|publicly||
neteř|f|niece||
rudý|adj|red||
dopustit|vp|to let happen||
podél|prep|along||
báseň|f|poem||
vzrušení|n|excitement||
procházka|f|stroll, walk|jít na procházku|to go for a walk / take a walk / go for a stroll
stabilní|adj|stable||
komisař|m|commissioner||
postupně|adv|gradually; step by step|postupně zvyšovat|to gradually increase
doporučit|vp|to recommend||
zatáhnout|vp|to pull, to draw (curtains)||
šestý|adj|sixth||
kombinace|f|combination||
duševní|adj|mental||
vajíčko|n|egg||
zapamatovat si|vp|to remember||
ročník|m|year, grade; vintage|Hana je studentka prvního ročníku.|Hana is a first-year student
příšera|f|monster||
snoubenec|m|fiancé||
přízvuk|m|stress; accent|primární / hlavní přízvuk|primary / main stress
makat|vi|to work hard||
premiér|m|prime minister||
padák|m|parachute|Dostal padáka.|He got fired
vytvářet|vi|to create, generate||
elektřina|f|electricity||
puška|f|rifle||
tentýž|pron|same||
mučení|n|torture||
smrad|m|stench, stink||
odpočinek|m|rest||
odstup|m|distance, interval, margin||
rozchod|m|breakup, split|manželský rozchod|marital separation
chladný|adj|cold, cool|Je chladná jako led.|She is as cold as ice
výbor|m|committee||
požadavek|m|requirement|To je jeden z požadavků.|It is one of the requirements
výcvik|m|training, exercise, drill|odborný výcvik|vocational training
přestávka|f|break, pause||
konference|f|conference||
procento|n|percent||
duchovní|adj|spiritual; clergyman||
odhad|m|estimate, estimation||
slavit|vi|to celebrate||
tajit|vi|to conceal, to keep secret||
sedadlo|n|seat||
úmrtí|n|death||
společník|m|companion; partner||
šířit|vi|to spread; (se) to spread|Misionáři šířili svá náboženská učení.|Missionaries spread their religious teachings.
prožít|vp|to experience, to live through||
závislý|adj|dependent; addicted|závislá proměnná|dependent variable
oukej|intj|okay||
vládce|m|ruler||
vydávat se|vi|to pass oneself off as|Vydával se za tebe.|He passed himself off as you
malovat|vi|to paint; (se) to put on make-up|Dovolte dítěti malovat a kreslit.|Let your child paint and draw
skrytý|adj|hidden||
sbírat|vi|to collect; to pick||
motorka|f|bike, motorbike||
jádro|n|core; nucleus||
ovládnout|vp|to gain control, to seize control; to dominate||
brada|f|chin; beard, goatee||
maličkost|f|trifle, bagatelle||
těhotenství|n|pregnancy|Jsem v osmém měsíci těhotenství.|I’m eight months pregnant
naplánovat|vp|to plan, to make plans|Pojďme si naplánovat, co budeme dělat o víkendu.|Let’s make plans for the weekend
nutně|adv|necessarily||
svěřit|vp|to entrust, to trust; to confide|Mohu Vám svěřit tajemství?|Can I share a secret with you?
deprese|f|depression||
kufřík|m|briefcase||
původ|m|origin; extraction, descent||
kultura|f|culture||
zazpívat|vp|to sing||
pasta|f|paste||
měsíční|adj|monthly; lunar||
jednička|f|one||
uzavřený|adj|closed||
vozík|m|cart, trolley; wheelchair|nákupní vozík|shopping cart
párek|m|sausage, frankfurter||
látka|f|cloth, fabric; substance|minerální voda s nízkým obsahem minerálních látek|mineral water with a low content of minerals
vzájemně|adv|mutually||
zahájit|vp|to start; to begin, to launch|zahájit nové vyšetřování|to reopen the investigation
efekt|m|effect|vyvolat efekt|to trigger an effect
džungle|f|jungle||
moudrý|adj|wise||
řvát|vi|to yell, roar||
sako|n|jacket, blazer||
králík|m|rabbit; rabbit fur||
prozkoumat|vp|to explore, to examine||
ježiš|intj|Jesus! (exclamation)||
vychovat|vp|to bring up, to raise, to rear||
baseball|m|baseball||
vystrašený|adj|scared, frightened||
záloha|f|advance; backup||
masáž|f|massage|provést masáž|to perform a massage
stížnost|f|complaint|podat stížnost|to file a complaint
očekávání|n|expectation||
štědrý|adj|generous||
mor|m|plague||
úhel|m|angle||
studio|n|studio||
lev|m|lion||
liga|f|league||
zavazadla|n|luggage||
sušenka|f|cookie||
smířit se|vp|to come to terms (with); to make up||
akcie|f|share (stock)||
soucit|m|sympathy, compassion||
pohádka|f|fairy tale||
povýšení|n|promotion; exaltation||
bydlení|n|housing|sociální bydlení|social housing
nařídit|vp|to order, to command||
pohlaví|n|sex, gender||
vdávat se|vi|to be getting married (of a woman)||
sestřenice|f|cousin, first cousin (female)||
zachraňovat|vi|to save||
nárok|m|claim|získat nárok na|to qualify for
hranolky|m|French fries|hranolky s majonézou a kečupem|French fries with ketchup and mayonnaise
studie|f|study (research)|provést studii|to conduct a study
zpožděný|adj|delayed|zpožděný vlak|a delayed train
klasický|adj|classical, classic|klasický příklad|Classical example
nóbl|adj|fancy, posh||
proměnit|vp|to turn; to transform|Princ se proměnil v žábu.|The prince turned into a frog
rakev|f|coffin||
ocas|m|tail||
slitování|n|mercy||
splést|vp|(se) to make a mistake; (si) to mistake|Spletl jsem se.|I’ve made a mistake
čaroděj|m|wizard, sorcerer||
atraktivní|adj|attractive||
dálnice|f|motorway, highway||
nováček|m|novice, newcomer, beginner||
paprsek|m|ray||
stupidní|adj|stupid||
pachatel|m|perpetrator, offender||
bouřit|vi|to thunder, roar, bluster; (se) to rebel||
zemětřesení|n|earthquake|podmořské zemětřesení|seaquake
únik|m|escape; leak||
vlézt|vp|to crawl into, to creep into||
cenit|vi|to value, to prize||
box|m|boxing||
vyšetření|n|examination|provést vyšetření|to perform an examination
nouze|f|emergency; need||
horečka|f|fever|dostat horečku|to get a fever
vdova|f|widow||
maximálně|adv|at most; maximally||
ostuda|f|disgrace||
břeh|m|bank, shore; shore, coast|Rychle plavala ke břehu.|She swam quickly to the shore
projevit|vp|to show, to manifest, to display|projevit úsilí|to show effort
extrémně|adv|extremely||
zaneprázdněný|adj|busy||
štvát|vi|to annoy; to hunt, to chase||
pohár|m|cup||
nesmírně|adv|extremely, immensely||
lebka|f|skull|lebka se zkříženými hnáty|skull and crossbones
fyzický|adj|physical||
pobyt|m|stay, sojourn, residence||
vyplnit|vp|to fill in, to fill out, to complete||
satelit|m|satellite||
vyslat|vp|to send forth, to send out; to broadcast||
aktivita|f|activity||
hnus|m|disgust; abomination||
výmluva|f|excuse||
odkaz|m|reference, cross-reference; link, hyperlink||
jemně|adv|gently, finely||
hladina|f|surface (of water); level|pod mořskou hladinou|under the surface of the sea
ukradený|adj|stolen|Nenašli ukradené auto pana Millera.|They didn’t find Mr Miller’s stolen car
záměr|m|aim, intention, intent||
bodnout|vp|to stab, to jab; to sting, to bite||
slušet|vi|to suit, to look good on|Sluší ti to.|It suits you
znak|m|sign, symbol; character||
skála|f|rock||
přátelský|adj|friendly||
kolej|f|track, rail; dormitory||
prokletý|adj|cursed; damned, bloody||
kokain|m|cocaine||
nádrž|f|reservoir; basin|palivová nádrž|fuel tank
nebesa|n|skies; heaven||
atmosféra|f|atmosphere|zemská atmosféra|Earth’s atmosphere
miliarda|f|billion||
sedmý|adj|seventh||
rituál|m|ritual, rite|provést rituál.|to perform a ritual
metoda|f|method||
zaměstnat|vp|to employ; to keep busy/occupied||
komplikovaný|adj|complicated||
rozpočet|m|budget|rozpočet na|budget for
dělit|vi|to divide||
nahrát|vp|to record; to upload||
uzdravit|vp|to cure||
halucinace|f|hallucination||
báječně|adv|wonderfully, lovely, great||
pláč|m|weeping, crying|být někomu do pláče|to make someone feel like crying
odvoz|m|ride, lift; removal||
schůze|f|meeting||
prostý|adj|simple, plain||
div|m|wonder|Alenka v říši divů|Alice in wonderland
městský|adj|city, town; municipal, urban|městské hradby|city walls
účes|m|hairstyle||
přesvědčený|adj|convinced||
činnost|f|activity||
operační|adj|operating (adj.)|operační sál|operating room
sluha|m|servant||
kabelka|f|handbag, purse||
drogový|adj|drug||
ret|m|lip||
hit|m|hit||
slza|f|tear||
spěch|m|haste, hurry||
trojka|f|three||
vložit|vp|to insert, to put in; to deposit||
luk|m|bow||
dohnat|vp|to catch up (with)||
vazba|f|bond, link; custody; binding||
odletět|vp|to fly away, to depart||
vnější|adj|outer||
vážený|adj|respected; dear (in letters)|vážený průměr|weighted average
zakázat|vp|to forbid, to prohibit||
produkt|m|product||
kuráž|f|courage||
potenciál|m|potential||
dohlížet|vi|to look after, to oversee||
konkurz|m|audition; bankruptcy|vyhlásit konkurz|declare bankruptcy
přípitek|m|toast (drink)||
debilní|adj|moronic|Ten tvůj nápad je opravdu debilní.|Your idea is really silly
vyrábět|vi|to produce, to make, to manufacture|Vyráběl jsem vázu pět hodin.|I spent five hours making a vase
sekretářka|f|secretary||
anonymní|adj|anonymous||
předpis|m|regulation; prescription|lék na předpis|prescription drug
analýza|f|analysis|funkcionální analýza|functional analysis
román|m|novel||
komora|f|chamber; pantry||
provaz|m|rope||
buňka|f|cell||
vlajka|f|flag||
vdát se|vp|to get married (of a woman)||
krvavý|adj|bloody; gory||
dějiny|f|history||
nápis|m|sign, inscription||
rýže|f|rice||
pořádat|vi|to organize||
svézt|vp|to give a lift||
porozumět|vp|to understand||
přenos|m|transfer; transmission||
tygr|m|tiger||
označit|vp|to mark, to label||
typický|adj|typical|To je pro mladé lidi typické!|That is typical of young people!
náklady|m|costs|utopené náklady|sunk cost
skóre|n|score||
zaplést|vp|to plait, to weave, to inweave; (se) to get entangled||
otrávit|vp|to poison; to annoy||
strašidelný|adj|scary, terrifying; spooky|strašidelný zámek|spooky castle
usadit se|vp|to settle||
též|adv|too, also||
iluze|f|illusion; wishful thinking|poskytovat iluzi|to provide illusion
dezert|m|dessert||
náskok|m|head start, lead|získat náskok|to get a head start
spatřit|vp|to see||
žlutá|f|yellow (colour)||
ledový|adj|icy, ice-cold|ledové srdce|icy heart
náročný|adj|demanding, difficult, challenging|náročný den|hard day
přeskočit|vp|to skip; to jump over something, to vault||
hodnocení|n|evaluation, rating||
brouk|m|beetle; sweetheart, love, honey||
představivost|f|imagination||
soustrast|f|compassion, sympathy||
obsah|m|content, contents||
zrada|f|treason, betrayal|Byl obviněn ze zrady.|He was accused of treason
zaujmout|vp|to engage, to captivate; to take up|zaujmout někde místo|position oneself somewhere
prokletí|n|curse||
spor|m|quarrel; dispute||
jemný|adj|fine, gentle, soft||
příprava|f|preparation||
vyšetřit|vp|to examine; to investigate||
jejda|intj|oh, gosh; oops||
foťák|m|camera||
rytmus|m|rhythm||
dýchání|n|breathing, respiration||
socha|f|statue; sculpture|Socha malého chlapce.|A statue of a little boy
závazek|m|obligation|daňový závazek|tax obligation
ohlásit|vp|to announce, to report, to notify||
krém|m|cream|krém na boty|shoe polish
nářadí|n|tools||
cirkus|m|circus||
základy|m|foundations; basics||
důchod|m|pension; income|invalidní důchod|disability pension
cestující|m|passenger||
kladivo|n|hammer|Kladivo se hodí k zatloukání hřebíků.|A hammer is useful for pounding nails
překročit|vp|to exceed; to step over||
bláznit|vi|to be crazy, to go crazy, to be foolish|Přestaň bláznit.|Don’t be crazy
včerejšek|m|yesterday||
úleva|f|relief|poskytovat úlevu|to provide relief
povolání|n|profession, occupation; vocation, calling||
advokát|m|advocate, lawyer||
pozorování|n|sighting; observation|bližší pozorování|close investigation
komunikovat|vi|to communicate||
mobilní|adj|mobile||
lesba|f|lesbian||
dobytek|m|livestock, cattle||
ročně|adv|annually, per year||
obrat|m|turn; turnover||
medicína|f|medicine||
zato|adv|but, on the other hand||
čára|f|line||
spoléhat|vi|to rely on||
konečný|adj|final||
mužský|adj|male, masculine||
plýtvat|vi|to waste|Nesnáším lidi, co plýtvají masem.|I can’t stand people who waste meat
odstoupit|vp|to step down, to resign; to step back|Prezident Mubarak musí odstoupit.|President Mubarak must resign
shánět|vi|to look for, to hunt||
nepochybně|adv|undoubtedly||
uvěznit|vp|to imprison||
cenný|adj|valuable, precious||
kandidát|m|candidate||
neviditelný|adj|invisible||
pravidelně|adv|regularly||
okrsek|m|ward, precinct||
dopad|m|impact||
pochopení|n|understanding; comprehension||
příchod|m|coming, arrival||
pořadí|n|order||
indián|m|Native American||
sériový|adj|serial||
kletba|f|curse||
průšvih|m|trouble||
přezdívka|f|nickname, moniker, byname, sobriquet||
částečně|adv|partially, partly||
shromáždění|n|assembly||
tradiční|adj|traditional||
aliance|f|alliance||
filmový|adj|film|filmový festival|film festival
maličký|adj|tiny||
řetěz|m|chain||
návnada|f|bait||
nacházet se|vi|to be located|kde se nachází|where is
sílit|vi|to grow stronger, to strengthen||
probíhat|vi|to be under way, to take place|Jak probíhá válka na západní frontě?|How the war is going on on the western front?
shodit|vp|to throw down, to knock off; to lose (weight)||
vesmírný|adj|space (adj.), cosmic|vesmírný dalekohled|space telescope
obchodovat|vi|to trade||
smrtelný|adj|mortal; deadly, lethal|smrtelné nebezpečí|mortal danger
hrdlo|n|throat||
vyjednávat|vi|to negotiate||
přihlásit se|vp|to apply; to log in||
třídit|vi|to sort||
totožnost|f|identity||
poker|m|poker||
pódium|n|podium||
vodítko|n|leash||
odhalení|n|revelation; unveiling|odhalení sochy Woodrowa Wilsona|unveiling of a statue of Woodrow Wilson
zásilka|f|delivery; shipment||
shromáždit|vp|to collect, to gather; (se) to assemble||
lítost|f|regret; remorse, repentance|vyvolat lítost|to evoke regret
podávat|vi|to hand, to pass; to serve||
večerní|adj|evening (adj.)||
bojový|adj|fighting, combat||
povaha|f|nature||
zejména|adv|especially, particularly||
fond|m|fund||
věta|f|sentence||
tečka|f|dot; full stop||
naléhavý|adj|urgent||
potěšený|adj|pleased||
kurt|m|court (tennis)||
pečlivě|adv|carefully||
panák|m|shot (of liquor); figure||
hřbitov|m|graveyard||
identita|f|identity||
odborník|m|expert, specialist||
útočit|vi|to attack||
dárce|m|donor|krevní dárce|blood donor
vyjednávání|n|negotiation|zákulisní vyjednávání|behind-the-scenes negotiations
fešák|m|handsome man||
koupel|f|bath||
nekonečný|adj|infinite||
sval|m|muscle||
sobecký|adj|selfish||
průvodce|m|guide|Lepšího průvodce byste nenašli.|You won’t find a better guide
elegantní|adj|elegant, graceful||
uznání|n|recognition|získat uznání|to gain recognition
náboj|m|cartridge; charge||
věrnost|f|faithfulness||
kdekoli|adv|anywhere; wherever||
podzim|m|autumn, fall|na podzim|in the autumn
jedinečný|adj|unique|jedinečné zajímavosti|unique attractions
obhájce|m|advocate||
zaručit|vp|to guarantee||
orgán|m|organ; authority, body|orgány činné v trestním řízení|authorities active in criminal procedure
vítězit|vi|to win||
úředník|m|clerk, official||
oddíl|m|section; unit, squad||
vykládat|vi|to explain; to tell; to unload||
společenský|adj|social||
odlišný|adj|different||
bohyně|f|goddess||
zabavit|vp|to confiscate; to entertain|Vláda mu zabavila veškerý majetek.|The government has confiscated all of his possessions.
vydírání|n|blackmail||
fazole|f|bean||
med|m|honey||
pravděpodobnost|f|probability||
kaše|f|porridge; mash|chodit kolem horké kaše|to beat around the bush
muzika|f|music||
tvořit|vi|to create, to form; (se) to form, to take shape|Vidím, jak to tvoří.|I see how they create it
heroin|m|heroin||
sanitka|f|ambulance||
milostný|adj|love (adj.), romantic|milostný dopis|love letter
plamen|m|flame||
rod|m|family, lineage; gender (grammar)||
ironie|f|irony||
praxe|f|practice; work experience||
otravný|adj|annoying||
vystát|vp|to stand, to bear|Nemůžu ji vystát.|I can’t stand her
odhodit|vp|to discard||
záložní|adj|backup||
hmota|f|matter||
poměrně|adv|relatively|poměrně rychle|fairly quickly
objetí|n|hug, embrace||
okruh|m|circuit; ring road||
vybavený|adj|equipped||
charakter|m|character||
pacientka|f|patient (female)||
námořnictvo|n|navy||
absolutní|adj|absolute||
inteligence|f|intelligence||
zakrýt|vp|to conceal||
účinek|m|effect|Opatření se míjí účinkem.|The measure has no effect
pomalý|adj|slow|Vaše auto je pomalé.|Your car is slow
nízký|adj|low|Všechny tyhle produkty mají nízkou cenu.|All of these products have a reduced price
oprava|f|repair; correction|provést opravy|to make corrections
vonět|vi|to smell, to have a pleasant smell|Ty růže voní nádherně.|The roses smell lovely
vystavit|vp|to exhibit; to expose; to issue||
čepice|f|cap||
ředitelka|f|director (female)||
terč|m|target||
očistit|vp|to clean, clear||
obzvláště|adv|especially; exceptionally||
rovněž|adv|as well||
jmění|n|fortune||
sáhnout|vp|to reach; to touch||
vdaný|adj|married||
vida|intj|well, look at that!||
jenomže|conj|however, except||
rezervace|f|booking||
prvotřídní|adj|first class, first-rate||
premiéra|f|premiere; opening night||
vrazit|vp|to bump into; to thrust|Vrazil ruce do kapes.|He thrust his hands inside his pockets
žijící|adj|living||
líbánky|f|honeymoon||
proroctví|n|prophecy||
klaun|m|clown||
studentka|f|student (female)||
obor|m|field (of study or work)||
mina|f|mine||
háček|m|fishhook; háček||
papež|m|pope||
utopit|vp|to drown; (se) to drown||
apartmá|n|suite||
působivý|adj|impressive||
arogantní|adj|arrogant||
maximální|adj|maximum, maximal||
stanoviště|n|stand, post, station||
jizva|f|scar||
okraj|m|periphery; margin|na okraji Prahy|in the outskirts of Prague
poloha|f|position, location||
otrava|f|poisoning; bore, drag|Být nemocný je pěkná otrava.|It’s a bore to be sick
čip|m|chip||
márnice|f|mortuary||
nůžky|f|scissors|ostré nůžky|sharp scissors
turnaj|m|tournament||
injekce|f|injection||
věznit|vi|to jail, imprison||
kouření|n|smoking||
kotník|m|ankle||
mejdan|m|party||
skandál|m|scandal||
kondom|m|condom||
finance|f|finances||
zdar|m|hi (informal); success||
luxusní|adj|luxurious||
trezor|m|safe||
tkáň|f|tissue||
sbírka|f|collection||
ségra|f|sister||
trauma|n|trauma||
orel|m|eagle||
čtvrtka|f|quarter||
obdivovat|vi|to admire||
komunita|f|community||
armádní|adj|army||
odstěhovat|vp|to move, to move out, to relocate||
zubní|adj|dental|zubní pasta|toothpaste
originální|adj|original||
nadobro|adv|for good, forever||
nařízení|n|regulation||
funkční|adj|functional|funkční požadavek|functional requirement
frekvence|f|frequency|absolutní frekvence|absolute frequency
účast|f|participation; attendance|Účast na schůzi je povinná.|Attendance at the meeting is mandatory
šíp|m|arrow||
povýšit|vp|to promote, to up|Byl povýšen na vedoucí oddělení.|He was promoted to senior manager
klasika|f|classic||
eso|n|ace||
hnědý|adj|brown||
producent|m|producer||
zblízka|adv|from near||
bouřka|f|thunderstorm||
kráska|f|beauty||
federace|f|federation||
zamčený|adj|locked||
porovnat|vp|to compare||
dvojka|f|two; deuce||
třást|vi|to shake, to tremble; (se) to shake, to quiver, to shudder|třást se strachem|to tremble with fear
průmysl|m|industry||
ubližovat|vi|to harm, to hurt, to injure||
palba|f|fire, firing, shooting||
chod|m|course; gear|zpětný chod|reverse gear
významný|adj|significant||
bedna|f|box, crate; television||
vytvoření|n|creation||
znalost|f|knowledge||
koruna|f|crown (also the Czech currency)||
hruď|f|chest||
úsudek|m|judgment||
ego|n|ego||
dospět|vp|to arrive, to reach; to reach maturity|dospět k závěru|to arrive at a conclusion
sluníčko|n|sun (affectionate); ladybird|Co jsi dělala o víkendu, sluníčko?|What did you do during the weekend, sunshine?
kašel|m|cough||
fotbalový|adj|football, soccer, association football||
gen|m|gene||
obhajoba|f|defense||
stýskat se|vi|to miss|Stýská se mi po tobě.|I miss you
obsahovat|vi|to contain, to comprise|Ta krabice obsahuje všechny moje věci.|This box contains all my belongings
závodit|vi|to race, to be a racer; to compete, to contest||
forenzní|adj|forensic||
dočasně|adv|temporarily||
volně|adv|freely; loosely|volně prodejný lék|over-the-counter drug
tajemný|adj|mysterious||
tác|m|tray||
prasit se|vi|to give birth to a piglet|Proč si to tričko tak prasíš?|Why do you make your t-shirt so dirty?
narušit|vp|to disrupt; to disturb||
tvor|m|creature||
teoreticky|adv|theoretically||
sejf|m|safe||
svíčka|f|candle||
kraj|m|edge, periphery, outskirts; region||
mafie|f|mafia||
čtyřikrát|adv|four times||
připustit|vp|to admit, to concede; to allow||
emocionální|adj|emotional||
vzorec|m|formula||
výroba|f|production||
zásadní|adj|fundamental||
vybraný|adj|selected||
investice|f|investment||
cílit|vi|to aim||
jezdec|m|rider||
topit|vi|to heat; (se) to drown||
zpěv|m|singing||
zmlátit|vp|to beat up||
objev|m|discovery||
bouda|f|hut, shack; lodge, cabin||
informátor|m|informant||
balení|n|packing; package|jedno balení másla|one package of butter
tank|m|tank, armor||
režisér|m|director||
hnízdo|n|nest|ptačí hnízdo|bird’s nest
tanečnice|f|dancer (female)||
kolonie|f|colony||
předek|m|ancestor||
pokračování|n|continuation||
gesto|n|gesture||
stavba|f|building, construction||
upřímnost|f|sincerity|Žijeme spolu v upřímnosti, Bůh nás nikdy neopustí.|Lets live together in sincerity, God will never leave us.
zamířit|vp|to aim; to head (for)||
kousnout|vp|to bite|Pojď! Neboj, já tě nekousnu.|Come here, don’t be afraid, I won’t bite you
postoupit|vp|to advance, move forward; to progress, proceed||
tvrzení|n|assertion; allegation||
brutální|adj|brutal, atrocious||
velvyslanec|m|ambassador||
únosce|m|kidnapper||
hrdost|f|pride||
kavárna|f|café||
použitý|adj|used||
houba|f|mushroom; sponge|Některé houby jsou jedlé, jiné jedovaté.|Some mushrooms are edible, other are poisonous.
činit|vi|to do, to make; to amount to||
spojenec|m|ally||
přesvědčení|n|conviction|získat přesvědčení|to get a conviction
módní|adj|fashionable, fashion (adj.)|módní přehlídka|fashion show
motel|m|motel||
sídlo|n|seat, headquarters; residence||
slepice|f|hen||
porovnání|n|comparison||
radiace|f|radiation||
styk|m|contact, relations||
létající|adj|flying||
vodka|f|vodka||
pokušení|n|temptation||
patrně|adv|apparently||
vyhlásit|vp|to declare||
stříbrný|adj|silver (adj.)||
kopačky|f|football boots, soccer boots, football shoes||
podnikat|vi|to do business; to undertake||
reportér|m|reporter, correspondent||
spočítat|vp|to calculate||
potlesk|m|applause||
podoba|f|form; likeness||
zvonek|m|doorbell, bell||
žaloba|f|lawsuit, charge||
natáhnout|vp|to stretch; to wind up||
rozdat|vp|to give away, to hand out, to dispense||
loajální|adj|loyal||
brambor|m|potato||
mikrofon|m|microphone||
jakkoli|adv|however; in any way||
rozptýlit|vp|to dispel||
formulář|m|form||
spravedlivý|adj|just||
zapracovat|vp|to work on; to incorporate||
přespat|vp|to stay overnight, to sleep over, to spend the night||
pouliční|adj|street, on the street||
válečník|m|warrior||
žertovat|vi|to joke, jest||
troska|f|wreckage||
syndrom|m|syndrome||
umělecký|adj|artistic||
hmyz|m|insect||
inženýr|m|engineer||
útočiště|n|refuge||
jejíž|pron|whose, of which/whom|Spisovatelka, jejíž díla jsou známá.|A writer whose works are well known
záchranný|adj|rescue||
srovnat|vp|to compare; to straighten||
poloviční|adj|half||
obžalovaný|m|accused, defendant||
námořník|m|sailor, seaman||
rozvrh|m|schedule, timetable, plan|rozvrh hodin|timetable
uprchlík|m|refugee; escapee||
písmeno|n|letter||
zúčastnit se|vp|to attend, to participate|Zúčastníme se kulturního festivalu.|We will participate in the cultural festival
vyslýchat|vi|to interrogate, to question||
vedro|n|heat||
munice|f|ammunition, ammo||
stipendium|n|scholarship||
kravata|f|tie, necktie; chokehold, headlock||
kytara|f|guitar||
modelka|f|model||
paže|f|arm||
záhadný|adj|mysterious|záhadné obrazce|mysterious patterns
naložit|vp|to load; to pickle||
nehet|m|nail, fingernail||
oddanost|f|devotion, loyalty||
francouzsky|adv|in a French manner, Frenchly; in French||
moucha|f|fly||
zvát|vi|to invite||
mlha|f|fog, mist||
dovolení|n|permission||
vylepšit|vp|to improve||
zajmout|vp|to capture||
kov|m|metal||
krystal|m|crystal||
požadovat|vi|to demand; to require||
odolat|vp|to resist|Mohu odolat všemu kromě pokušení.|I can resist everything except temptation
nato|adv|afterwards, subsequently||
společenství|n|community||
nora|f|burrow|schovat se do nory|to hide in a burrow
mokrý|adj|wet||
žalovat|vi|to sue; to tell on somebody|Budeme je žalovat.|We shall sue them
diskutovat|vi|to discuss|Diskutujeme o Praze.|We are discussing Prague
posila|f|reinforcement||
rodit|vi|to bear, to give birth||
oční|adj|eye (adj.)|oční bulva|eyeball
chata|f|chalet, cabin, hut||
vozit|vi|to drive, to transport||
zvonit|vi|to ring, toll|Zvoní telefon.|The phone is ringing
poranění|n|injury||
konflikt|m|conflict||
nově|adv|newly||
omezený|adj|limited|časově omezené snížení cen|time-limited price reduction
nejdražší|m|dearest; most expensive||
obtížný|adj|difficult|obtížný úkol|difficult task
opít|vp|to get (someone) drunk; (se) to get drunk||
knoflík|m|button||
priorita|f|priority||
dračí|adj|dragon, dragon’s||
hluchý|adj|deaf||
zapletený|adj|meddled, confused, implicated, entangled|Byly zapletený v celé věci.|They were implicated in the whole thing
rybí|adj|fish, fish’s||
bezpochyby|adv|without a doubt||
milující|adj|loving||
trestný|adj|criminal, punishable|trestný čin|criminal offence
snášet|vi|to bear, to tolerate|To je bolest kterou nemohu snášet.|That is a pain I can’t bear
tvrdohlavý|adj|hardheaded, stubborn||
soudruh|m|comrade||
volant|m|steering wheel||
centrální|adj|central||
úmyslně|adv|purposefully||
mimořádný|adj|extraordinary||
hrudník|m|chest, thorax||
počítačový|adj|computer|počítačová hra|computer game
brandy|f|brandy||
moudrost|f|wisdom, sagacity||
ukrýt|vp|to hide||
víla|f|fairy||
granát|m|grenade; garnet||
pravdivý|adj|true, truthful||
vnímat|vi|to perceive||
objednávka|f|order||
vlast|f|homeland||
účastnit se|vi|to take part, to participate||
napříč|adv|across, crosswise||
šampión|m|champion||
hadry|m|clothes||
částice|f|particle|elementární částice|elementary particle
trpělivý|adj|patient||
mimozemský|adj|extraterrestrial||
obálka|f|envelope||
porod|m|birth, delivery||
rukopis|m|handwriting; manuscript||
ručně|adv|by hand, manually||
směs|f|mixture, melange, mix; combination||
zápach|m|stench, reek||
vyskočit|vp|to jump out; to jump up|vyskočit z kůže|jumping out of one’s skin
ústav|m|institute|výzkumný ústav|research institute
podniknout|vp|to undertake, to take|podniknout túru|to take a hike
zapomínat|vi|to forget||
povel|m|command||
schválit|vp|to approve||
navštěvovat|vi|to visit; to attend||
strážný|adj|guardian|anděl strážný|guardian angel
gravitace|f|gravitation||
jeviště|n|stage||
slézt|vp|to climb down, to crawl down||
proběhnout|vp|to take place; to run through|Ten druhý proběhl kolem mě.|This other guy just ran past me
dohlédnout|vp|to see to it, to make sure; to look after||
ohromit|vp|to astonish, to flabbergast, to astound||
skvrna|f|stain, fleck, spot||
český|adj|Czech; Bohemian||
útočník|m|attacker; forward (sport)||
zdržovat|vi|to hinder||
doživotí|n|life sentence||
srovnání|n|comparison||
tyč|f|pole, bar, rod||
autor|m|author||
skrýt|vp|to hide||
zmeškat|vp|to miss something, to be late for something||
vzrušený|adj|excited||
pravomoc|f|authority||
admirál|m|admiral||
pohon|m|drive, propulsion, traction||
průběh|m|course||
bezdomovec|m|homeless person||
zatykač|m|arrest warrant||
kongres|m|congress||
vyvinout|vp|to develop|vyvinout úsilí|to make an effort
pirát|m|pirate||
kouzelník|m|magician||
globální|adj|global||
mrak|m|cloud||
pata|f|heel||
jakýsi|pron|some kind of||
modlitba|f|prayer||
standardní|adj|standard||
spolek|m|association, club, society; alliance, union||
uvažovat|vi|to think, to speculate, to reflect|Pravděpodobně uvažoval o tom, že ho dál prodá.|Perhaps he was thinking of selling it
kytka|f|flower; bouquet||
interview|n|interview|poskytovat interview|to give an interview
šperk|m|jewel|Co děláš s tím šperkem?|What are you doing with that jewel?
mizera|m|scoundrel; wretch||
vnuk|m|grandson||
utajený|adj|secret, hidden, classified||
dotaz|m|inquiry, enquiry; query||
naslouchat|vi|to listen||
zákrok|m|procedure (medical); intervention|provést zákrok|to perform a procedure
kauce|f|bail; deposit||
ahojky|intj|hi; bye||
slavnost|f|celebration; festival||
koneckonců|adv|after all, ultimately|Koneckonců je to pravda.|It is the truth after all
nápodobně|adv|same to you||
populace|f|population||
souviset|vi|to be related||
kvalita|f|quality||
suchý|adj|dry||
ochránce|m|protector||
letecký|adj|air, aviation (adj.)||
pětkrát|adv|five times||
čokoládový|adj|chocolate||
ubožák|m|poor man, wretch||
modul|m|module||
vybuchnout|vp|to explode||
záměrně|adv|intentionally||
móda|f|fashion||
zavírat|vi|to close sth, to shut sth; (se) to close, to shut||
jídelna|f|dining room; canteen, cafeteria||
tep|m|pulse||
stokrát|adv|hundred times||
kreditní|adj|credit||
kriminální|adj|crime, criminal||
vysílačka|f|walkie-talkie, handheld transceiver||
jarní|adj|spring (adj.)|první jarní den|first spring day
pavouk|m|spider||
mnich|m|monk||
zvedat|vi|to lift; to raise||
jejichž|pron|whose, of which/whom|Spisovatelé, jejichž díla jsou známá.|Writers whose works are well known
vzdálený|adj|distant, remote||
pohledný|adj|handsome; pretty||
otevírat|vi|to open||
profesionál|m|professional||
automat|m|vending machine; machine||
čtrnáct|num|fourteen||
rozházet|vi|to scatter, to litter||
dívčí|adj|girl’s, girlish|dívčí věk|girlhood
nablízku|adv|close by, at hand; nearby||
angličtina|f|English||
basa|f|double bass; crate||
panika|f|panic|vyvolat paniku|to cause a panic
odvolání|n|appeal||
obvyklý|adj|usual||
slon|m|elephant||
trčet|vi|to stick out, to protrude; to be stuck, to be stranded|Kůl trčí ze země.|A pole is sticking out of the ground
prodejce|m|vendor||
medaile|f|medal||
sektor|m|sector||
nápověda|f|hint; help||
řez|m|cut|provést řez|to make an incision
testovat|vi|to test||
červ|m|worm; maggot||
výkupné|n|ransom||
schovaný|adj|hidden||
nazpět|adv|back||
vyčerpaný|adj|exhausted||
produkce|f|production||
šestnáct|num|sixteen||
nepřátelský|adj|hostile||
dozorce|m|overseer; warden, prison guard||
zasáhnout|vp|to hit; to intervene|Byl zasažen kulkou.|He was hit by a bullet
sebevědomí|n|self-confidence||
rentgen|m|X-ray; röntgen||
nápoj|m|beverage, drink||
důstojnost|f|dignity||
kriminálník|m|criminal||
zasnoubení|n|engagement, betrothal||
posvátný|adj|holy, sacred||
stádo|n|flock; herd||
kachna|f|duck||
kazeta|f|cassette, tape; cartridge||
impérium|n|empire||
číšník|m|waiter||
odplata|f|retribution; revenge, payback||
potopit|vp|to sink to sink; se to sink||
šedý|adj|grey, gray||
umístění|n|location; placement||
využití|n|utilization, use, employment; exploitation||
tudíž|adv|hence, as a result, therefore||
masakr|m|massacre||
souvislost|f|coherence; connection||
echo|n|echo||
svést|vp|to entice, lure, inveigle; to seduce||
měsíčně|adv|monthly||
zahraniční|adj|foreign|zahraniční obchod|foreign trade
zlom|m|break, turning point||
těsný|adj|tight; close||
jehla|f|needle||
pochopitelně|adv|understandably||
snést|vp|to bear, to stand; to lay (eggs)||
zvířecí|adj|animal (adj.)||
komunikační|adj|communication||
vyjasnit|vp|to clear, clarify||
galerie|f|gallery||
vražedný|adj|murderous||
přijetí|n|acceptance; reception||
mimino|n|baby||
žrát|vi|to eat (of animals), to devour||
japonský|adj|Japanese||
kazit|vi|(se) to spoil; to corrupt, spoil, botch||
písmo|n|font; script|arabské písmo|Arabic script
brnění|n|armor||
výjimka|f|exception|udělat výjimku|to make an exception
nudle|f|noodle||
narušení|n|disturbance, disruption, interference||
matematika|f|mathematics||
ranit|vp|to hurt, wound||
věřící|adj|believer; religious||
delta|n|delta|delta křídlo|delta wing
šéfka|f|boss (female)||
potřetí|adv|third time||
vyznat|vp|to confess; (se) to know one’s way around|Vyznal jí lásku.|He confessed his love for her
vévoda|m|duke||
výprava|f|expedition||
hladce|adv|smoothly||
žert|m|joke||
umožnit|vp|to enable, to make possible||
ústup|m|retreat; remission||
sukně|f|skirt||
popřít|vp|to deny||
generální|adj|general|generální ředitel|CEO
oddaný|adj|devoted; loyal, stalwart||
mizerně|adv|miserably, awfully||
omezit|vp|to restrict, to limit|Svědkyně se omezí na odpovězení těchto otázek.|The witness will limit herself to answering the questions.
požární|adj|fire (adj.)||
rvačka|f|fight, brawl||
památka|f|monument, sight; keepsake||
podsvětí|n|underworld||
mínění|n|opinion|veřejné mínění|public opinion
důsledek|m|consequence; result||
šokující|adj|shocking||
překvapivě|adv|surprisingly||
pitva|f|autopsy|provést pitvu|to perform an autopsy
vstupní|adj|entrance, input; entry|vstupní dvorana|entrance hall
založený|adj|founded; based|založený na.|based on
žebřík|m|ladder||
radní|m|councillor||
staromódní|adj|old-fashioned||
vyrovnávat|vi|to balance, to equalize||
zvítězit|vp|to win||
obtěžování|n|harassment||
pojistit|vp|to insure||
desetiletí|n|decade||
kabel|m|cable||
splatit|vp|to pay off, to pay, to repay, to pay back|splatit dluh|repay the debt
roční|adj|yearly, annual||
naznačit|vp|to hint, to indicate||
farmář|m|farmer||
trpaslík|m|dwarf|bílý trpaslík|white dwarf
kamkoli|adv|wherever, whitherever||
náhodný|adj|random; casual|náhodná veličina|random variable
špička|f|tip, point; peak|chodit po špičkách|to walk on tiptoes
vzniknout|vp|to arise, to originate||
služební|adj|official, work, business (adj.)|služební auto|company car
štěně|n|puppy||
aktivovat|vi|to activate, to enable||
chemie|f|chemistry||
plakát|m|poster||
dopoledne|n|late morning, forenoon; during late morning||
blahopřát|vi|to congratulate||
charita|f|charity||
baterka|f|flashlight, torch; battery||
středisko|n|center||
kreslit|vi|to draw|Rád kreslím komiksy.|I love drawing comics
mizet|vi|to disappear||
závislost|f|dependence; addiction||
italský|adj|Italian||
zoufalství|n|despair||
prcek|m|kid, little one||
překážka|f|obstacle; impediment, hindrance||
obsadit|vp|to occupy; to cast (a role)||
konkurence|f|competition||
střelný|adj|firearm (adj.) (střelná zbraň: firearm)||
frajer|m|cool guy|Je to vážně frajer!|He’s a really cool guy!
upozornění|n|notification||
pach|m|smell, scent, odor, odour||
borec|m|champ, ace||
pochyba|f|doubt|vyvolat pochyby|to cast doubt
spojenectví|n|alliance||
vojín|m|private (soldier)||
omezení|n|constraint, restriction; limit||
ostatky|m|remains||
hrnek|m|mug, cup||
úspěšně|adv|successfully||
nač|adv|for what reason; why|Nač bysme mu pomáhali?|Why would we help him?
gól|m|goal (in sport)||
vetřelec|m|intruder; alien||
darovat|vp|to donate, to give||
žalobce|m|plaintiff, complainant||
vojsko|n|army||
pomyšlení|n|thought||
vypovídat|vi|to testify||
pronajmout|vp|to rent out||
povědomý|adj|familiar||
nízko|adv|low|nízko u země|low to the ground
potraviny|f|groceries, food||
nikoliv|conj|not|Země je kulatá, nikoliv placatá.|The Earth is round, not flat
extrémní|adj|extreme||
současně|adv|in parallel, concurrently; and, at the same time||
zažít|vp|to experience; to digest||
gangster|m|gangster||
minimální|adj|minimum, minimal|minimální mzda|minimum wage
hasič|m|firefighter, fireman||
zavazadlo|n|baggage||
originál|m|original||
telegram|m|telegram||
válet|vi|to roll; (se) to roll|Neválejte se ve sněhu!|Don’t roll about in the snow!
rostlina|f|plant||
nemluvě|conj|not to mention||
jaderný|adj|nuclear||
ústava|f|constitution||
software|m|software||
poezie|f|poetry||
parfém|m|perfume||
plavky|f|swimsuit||
malér|m|trouble, mess|Jsme v maléru.|I’m in trouble
upadnout|vp|to fall (down); to decline|upadnout do|to fall into
rozptýlení|n|diversion, entertainment||
přivádět|vi|to bring, to lead|Co tě přivádí do Prahy?|What brings you to Prague?
zasnoubený|adj|engaged||
dotáhnout|vp|to tighten; to follow through||
tmavý|adj|dark||
předměstí|n|suburb||
mýdlo|n|soap||
sirotek|m|orphan||
invaze|f|invasion||
kloub|m|joint||
oproti|prep|compared to, compared with||
síň|f|hall||
pohřešovaný|adj|missing; missing person|pohřešované osoby|missing people
umělý|adj|artificial||
natož|conj|let alone|Neviděl jsem ho, natož abych s ním mluvil.|I haven’t seen him, let alone talked to him
přednáška|f|lecture||
plánování|n|planning|plánování výstavby elektrárny firmou.|The firm’s planning of a power plant construction.
svítit|vi|to shine||
klást|vi|to put, to lay, to lay down, to deposit; to ask||
poplatek|m|fee||
schodiště|n|stairway, stairs, staircase||
osel|m|donkey||
podzemní|adj|underground, subterranean||
vynechat|vp|to omit; to skip||
stařík|m|old man||
husa|f|goose||
pozvánka|f|invitation, invitation card||
civilní|adj|civilian||
ohrožený|adj|endangered||
kvalitní|adj|quality||
náznak|m|indication, hint||
terén|m|terrain, ground||
narozený|adj|born||
pracovník|m|worker, employee||
ruční|adj|manual|Je to ruční práce?|Is it handmade?
zabezpečit|vp|to secure||
brilantní|adj|brilliant, excellent||
rovnováha|f|balance, equilibrium|získat rovnováhu|to gain balance
pozdní|adj|late||
ilegální|adj|illegal||
fotograf|m|photographer||
poučit|vp|to instruct, to inform, to advise||
důkladně|adv|thoroughly|Přečte si znovu a důkladně ten lísteček.|He carefully reads again that sheet of paper
zimní|adj|winter (adj.)||
technický|adj|technological; technical||
božský|adj|dreamy, heavenly, godlike||
maximum|n|maximum||
trestní|adj|criminal, penal|trestní právo|criminal law
přehlídka|f|show; parade|módní přehlídka|fashion show
potrat|m|miscarriage; abortion||
tišit|vi|to silence; to appease, to calm||
blázinec|m|insane asylum; chaos, rush, bedlam||
daný|adj|given|V daný okamžik začne hrát hudba.|At a given moment, music will start to play
bonus|m|bonus||
detektor|m|detector||
gin|m|gin||
ponorka|f|submarine||
nevhodný|adj|unsuitable, inappropriate||
telefonovat|vi|to telephone, to phone|Telefonuju rodičům každý den.|I call my parents every day
třináct|num|thirteen||
vyšetřovatel|m|investigator||
potřebný|adj|necessary, needed; poor, in need||
povolat|vp|to call up, to summon||
páteř|f|spine, backbone||
pást|vi|to graze, to pasture; (se) to graze|pást ovce|to graze sheep
postřeh|m|perception; observation||
limit|m|limit||
skromný|adj|modest; frugal|Jeho přítelkyně je velmi skromná.|His girlfriend is very modest
demokracie|f|democracy||
stříbro|n|silver||
cestovní|adj|travel|cestovní doklad|travel document
investovat|vi|to invest||
narozdíl|phr|unlike (narozdíl od)||
osmnáct|num|eighteen||
loutka|f|puppet||
objet|vp|to drive around||
vyplatit|vp|to pay out; (se) to be worth it|Zločin se nevyplácí.|Crime doesn’t pay
posedlost|f|obsession||
příměří|n|armistice||
strkat|vi|to push, shove, jostle||
dělník|m|worker, laborer, operator|stavební dělník|construction worker
neskutečný|adj|unreal||
reportáž|f|news report, reportage||
řídící|adj|controlling, steering||
vlastnictví|n|ownership; property||
volební|adj|voting, election||
štáb|m|staff; crew|generální štáb|general staff
drzost|f|impudence||
hledět|vi|to look; (si) to mind, to heed|Hleď si svého!|Mind your own business!
toaleta|f|toilet, restroom, bathroom, lavatory||
chladno|n|cold||
poprava|f|execution||
komentář|m|comment||
mile|adv|kindly, warmly||
vyhnat|vp|to expel, to drive out||
tok|m|flow||
náhrada|f|replacement, substitute||
radar|m|radar; speed camera||
trať|f|track, line (railway)||
subjekt|m|subject||
vyslovit|vp|to express, utter, state; to pronounce|Vyslovila se většina obyvatel pro.|The majority of the population was in favor
díkuvzdání|n|thanksgiving||
jaksi|adv|rather; in a way||
senzor|m|sensor||
podzemí|n|underground; basement||
lodní|adj|ship (adj.), naval|lodní šroub|ship propeller
zvon|m|bell||
ropa|f|petroleum|těžit ropu|to drill for oil
vlastnost|f|quality, characteristic|fyzikální vlastnost|physical property
úvaha|f|consideration, reflection||
předvádět se|vi|to show off||
uhodit|vp|to hit, strike, knock|Co kdyby do auta uhodil blesk?|What if lightning struck the car?
slunečný|adj|sunny||
sucho|n|drought; dry||
choroba|f|disease; sickness, illness||
oklamat|vp|to deceive, to dupe||
magický|adj|magical, magic||
náušnice|f|earring||
vesta|f|vest, waistcoat|záchranná vesta|life vest
osmý|adj|eighth||
násilný|adj|violent||
přitahovat|vi|to attract||
biologický|adj|biological||
rozhodující|adj|decisive||
vrhnout|vp|to throw; (se) to throw oneself||
vymýšlet|vi|to come up with, to devise, to invent, to make up, to think up||
mlčení|n|silence||
strop|m|ceiling||
zkratka|f|shortcut; abbreviation||
koření|n|spice||
děsný|adj|awful, horrible, terrible||
satelitní|adj|satellitary||
hrozit|vi|to threaten|Hrozí mu obrovské nebezpečí.|He is in grave danger
četa|f|platoon, squad||
dobrovolník|m|volunteer||
pojištěný|adj|insured||
skotský|adj|Scottish, Scots, Scotch||
pokuta|f|fine|uložit pokutu|to impose a fine
skládat|vi|to fit together, to assemble; to compose|Odsávačka se snadno skládá a ovládá.|The pump is easy to assemble and operate
posel|m|messenger||
parkovat|vi|to park||
nádech|m|breath (in); tinge||
stoprocentně|adv|one hundred per cent, absolutely|stoprocentně jistý.|hundred per cent sure
vyjádření|n|statement||
opatřit si|vp|to acquire, to obtain||
venkov|m|countryside||
zatracení|n|damnation||
červenec|m|July||
koníček|m|hobby||
zmáčknout|vp|to squeeze||
banán|m|banana||
ulevit|vp|to relieve||
oblékat|vi|to put on, to wear||
obvod|m|circuit; perimeter; district||
žhavý|adj|hot, burning||
klavír|m|piano||
živobytí|n|livelihood||
nezbytný|adj|indispensable; necessary||
nesmrtelný|adj|immortal||
klika|f|door handle; doorknob||
rvát|vi|to tear; (se) to fight||
mýtus|m|myth||
průměrný|adj|average; mediocre||
pýcha|f|pride|Dmuli se pýchou.|They swelled with pride
desetkrát|adv|ten times||
pozítří|n|day after tomorrow; on the day after tomorrow||
podstoupit|vp|to undergo||
výstava|f|exhibition||
uhlí|n|coal||
spojovat|vi|to connect, to join||
mariňák|m|marine||
životopis|m|biography; curriculum vitae, CV|vlastní životopis|autobiography
komplikace|f|complication||
zveřejnit|vp|to publish, to disclose||
duševně|adv|mentally|duševně nemocný|mentally ill
krycí|adj|cover (adj.), code (name)||
dočasný|adj|temporary||
holit|vi|to shave||
zavěsit|vp|to hang up||
obecně|adv|generally||
pot|m|sweat||
uvězněný|adj|imprisoned||
komedie|f|comedy||
republika|f|republic||
proniknout|vp|to infiltrate; to penetrate||
přesun|m|movement, transfer, relocation; redeployment||
zhoršit|vp|to worsen||
chlup|m|hair||
nefér|adj|unfair||
džíny|noun|jeans, denims||
přiletět|vp|to arrive (by plane), to fly in|Letadlo přiletělo s hodinovým zpožděním.|The plane arrived an hour late
pochod|m|march; process||
matoucí|adj|confusing|matoucí emoce|confusing emotion
barman|m|barman, bartender||
úprava|f|modification|provést úpravu|to make an adjustment
kázání|n|sermon||
pitomost|f|stupidity, foolishness; nonsense, rubbish||
nezávislý|adj|independent|nezávislá proměnná|independent variable
masivní|adj|massive||
anomálie|f|anomaly||
kreditka|f|credit card||
šedesát|num|sixty||
zbývající|adj|left, remaining||
noty|f|sheet music||
hamburger|m|hamburger||
licence|f|licence, license||
soupeř|m|rival||
kontrolní|adj|checking, inspection, inspectional|kontrolní otázka|test question
želva|f|turtle, tortoise||
špagety|f|spaghetti||
přehled|m|overview|získat přehled|to get an overview
vyhovovat|vi|to suit|Váš návrh vyhovuje všem požadavkům.|Your proposal satisfies all the requirements
kroužek|m|ring; club (hobby group)||
mnohý|adj|many, numerous; many a|Mnozí lidé tomu nevěřili.|Many people did not believe that
kalendář|m|calendar||
červen|m|June|Přijedu do Prahy prvního června.|I will come to Prague on the first of June
píchnout|vp|to prick, to stab, to sting; to inject|Píchla ho vosa.|He was stung by a wasp
přihodit|vp|to throw in, to add; (se) to happen, to occur||
obočí|n|eyebrow||
oživit|vp|to enliven, to reinvigorate||
zasedání|n|session||
ptačí|adj|bird, bird’s, avian|ptačí hnízdo|bird’s nest
inspirovat|vi|to inspire||
udat|vp|to report (to the authorities); to state||
závěť|f|testament, will||
profík|m|pro||
pozdravovat|vi|to give regards||
téct|vi|to flow||
dobrota|f|goodness; treat||
identifikace|f|identification||
digitální|adj|digital||
povstání|n|rebellion, insurrection||
trubka|f|pipe, tube; trumpet||
sprostý|adj|rude, obscene, ribald||
vysílač|m|transmitter||
odpouštět|vi|to forgive||
vyhledat|vp|to look up, to search, to search for|V textu vyhledejme užitečné informace.|Let’s look useful pieces of information up in the text.
sázet|vi|to bet; to plant||
zajetí|n|confinement; captivity|zvířata v zajetí|animals in captivity
lampa|f|lamp||
služka|f|maid||
směšně|adv|ridiculously||
obal|m|packaging, cover||
nadechnout se|vp|to inhale|zhluboka se nadechnout|to take a deep breath
slavnostní|adj|festive||
šéfkuchař|m|chef||
poschodí|n|floor, storey||
zpěvák|m|singer||
reálný|adj|real|reálné číslo|real number
sahat|vi|to reach; to touch|Na sochy ne sahat, prosím!|Don’t touch the statues, please!
zubař|m|dentist||
čelist|f|jaw|horní čelist|upper jaw
mládě|n|baby animal||
pochybnost|f|doubt|vyvolat pochybnost|to raise a doubt
hlídač|m|watchman||
stoupat|vi|to rise, to climb||
střevo|n|intestine||
karma|f|karma||
pohřební|adj|funeral||
popravit|vp|to execute||
fyzika|f|physics||
dojet|vp|to arrive||
hák|m|hook||
přizpůsobit|vp|to adapt||
přehánět|vi|to exaggerate||
chřipka|f|flu, influenza||
princip|m|principle||
flirtovat|vi|to flirt, gallivant||
básník|m|poet||
senzační|adj|sensational||
servírka|f|waitress||
byť|conj|although||
mozkový|adj|brain; cerebral||
skrýš|f|hideout, hiding place, lair, cache||
semestr|m|semester; term||
pekelný|adj|hell, hell’s, infernal||
efektivní|adj|efficient||
běžně|adv|commonly||
deka|f|blanket||
poslíček|m|messenger||
přemluvit|vp|to persuade, to talk (someone) into||
firemní|adj|company, corporate||
vpředu|adv|in front, in the front; forward||
zkažený|adj|spoiled||
klíčový|adj|key||
plout|vi|to sail; to float||
nemocniční|adj|hospital||
helikoptéra|f|helicopter||
specialita|f|specialty||
celebrita|f|celebrity||
dispozice|f|disposal|dát něco k dispozici|to give something at someone’s disposal
morálka|f|morals, morality; morale|nízká pracovní morálka|low employee morale
portál|m|portal||
železo|n|iron||
debata|f|debate, discussion|vyvolat debatu|to spark a debate
terapeut|m|therapist||
sovětský|adj|soviet||
slanina|f|bacon|Slanina je bohatá na tuk.|Bacon is rich in fat
trávník|m|lawn||
sňatek|m|wedding, marriage||
žák|m|pupil; disciple||
drzý|adj|cheeky, impudent, impertinent||
portrét|m|portrait||
blbnout|vi|to fool around||
příspěvek|m|contribution; post||
struktura|f|structure||
zobák|m|beak||
židovský|adj|Jewish, Judaic||
obyčejně|adv|usually||
jakožto|conj|in the role of||
výpadek|m|outage||
blondýna|f|blond||
svatyně|f|sanctuary||
alergický|adj|allergic|alergická rýma|allergic rhinitis
žehnat|vi|to bless|Bůh ti žehnej.|God bless you
pleť|f|complexion; skin||
kartel|m|cartel||
úklid|m|cleaning, cleanup|provést úklid|to carry out cleaning
půjčka|f|loan|získat půjčku|to get a loan
risk|m|risk||
špión|m|spy||
ovladač|m|remote control, controller||
fráze|f|phrase||
dodatek|m|appendix; amendment||
dodnes|adv|until now, up to now, so far||
hotelový|adj|hotel|hotelový pokoj|hotel room
náhodně|adj|randomly; accidentally||
vizitka|f|business card||
počátek|m|origin; beginning|na počátku|at the beginning
dálka|f|distance; remote place||
zapadnout|vp|to set (of the sun); to fit in|Slunce už zapadlo za obzor.|The sun has already set below the horizon
čtyřka|f|four||
spolehlivý|adj|reliable||
automaticky|adv|automatically||
stařec|m|old man||
centrála|f|headquarters||
šťáva|f|juice||
nastartovat|vp|to start up; to kick start||
sedmnáct|num|seventeen||
zvýšení|n|increase, rise||
líbání|n|kissing||
nakoupit|vp|to do the shopping; to buy, to purchase||
pohroma|f|disaster, calamity, catastrophe|živelná pohroma|natural disaster
obdržet|vp|to receive|Výherce od nás obdrží drobný dárek.|The winner will receive a small gift from us
odpojit|vp|to disconnect; to detach||
květen|m|May||
zdání|n|appearance, impression; idea|vyvolat zdání|to create the appearance of
karate|n|karate||
svítání|n|daybreak, dawn||
rozumně|adv|reasonably||
kreativní|adj|creative||
pneumatika|f|tyre||
přísný|adj|strict; severe||
odskočit|vp|to jump away; to pop out||
kočičí|adj|cat, cat’s, feline; catlike||
bakterie|f|bacterium||
křoví|n|shrubbery, bushes||
hladovět|vi|to hunger||
zřejmý|adj|obvious||
lupič|m|burglar||
plechovka|f|tin can||
nanejvýš|adv|at most||
sjet|vp|to go down, to drive down||
zhasnout|vp|to turn off||
kupec|m|merchant, trader||
záření|n|radiation|elektromagnetické záření|electromagnetic radiation
taktika|f|tactics||
klepat|vi|to knock; (se) to shiver, shake||
přesvědčivý|adj|convincing, persuasive|přesvědčivý důkaz|convincing proof
odněkud|adv|from somewhere||
ostří|n|blade, edge||
vlkodlak|m|werewolf||
car|m|tsar||
znepokojovat|vi|to worry, to concern||
vytvořený|adj|created||
dostatečný|adj|sufficient||
hadr|m|rag, tatter; floorcloth, duster or tea towel||
holčičí|adj|girl, girlish||
rozvést|vp|to divorce, to separate; (se) to divorce||
litr|m|litre|půl litru|half a liter
mistrovství|n|mastery; championship|mistrovství světa|World Championship
kočár|m|carriage||
zešílet|vp|to go crazy||
balón|m|balloon; balloon, aerostat||
opera|f|opera||
obývák|m|living room||
pojem|m|concept; term||
šachy|m|chess||
svazek|m|bundle; volume|svazek klíčů|a bunch of keys
kuchařka|f|cookbook; (female) cook||
ohňostroj|m|firework||
kasino|n|casino||
výše|f|height; amount; above||
argument|m|argument||
útes|m|cliff; reef|Velký bariérový útes|Great Barrier Reef
recepce|f|reception; reception desk||
zranitelný|adj|vulnerable||
býk|m|bull||
legálně|adv|legally||
říjen|m|October||
ukázka|f|sample, specimen; extract, preview, trailer||
tuna|f|ton||
pohodlně|adv|comfortably, comfortable||
narozeninový|adj|birthday|narozeninový dort|birthday cake
ledvina|f|kidney|onemocnění ledvin|kidney disease
inspirace|f|inspiration||
ambice|f|ambition||
přejet|vp|to run over; to cross||
plynout|vi|to flow; to follow (from)||
popcorn|m|popcorn||
dodavatel|m|supplier||
prostřednictvím|prep|by means of, by, through||
šach|m|check (in chess)||
artefakt|m|artifact||
ocel|f|steel||
husí|adj|goose, goose’s||
píchat|vi|to prick, to stab, to poke; to sting|Píchá mě v boku.|I have a stitch in my side
lednička|f|fridge||
označení|n|designation||
střízlivý|adj|sober||
sada|f|set|instrukční sada|instruction set
prvek|m|element||
vrstva|f|layer|Stěna trávicí trubice má čtyři základní vrstvy.|The wall of the digestive tract has four basic layers.
zatancovat|vp|to dance; (si) to enjoy dancing, to go for a dance||
okamžitý|adj|instant, immediate||
záblesk|m|flash||
soutěžící|m|competitor, contestant||
chůze|f|walking; gait||
poštovní|adj|postal|poštovní adresa|postal address
zpočátku|adv|at first||
okres|m|district||
občanský|adj|civic, civil|občanská povinnost|civic duty
proklít|vp|to curse||
rozsah|m|scope||
primitivní|adj|primitive|primitivní nástroje|primitive tools
odpadek|m|piece of rubbish||
míchat|vi|to mix; to shuffle||
nadace|f|foundation||
záchranka|f|ambulance service||
housle|f|violin||
ponížit|vp|to humiliate||
cosi|pron|something||
stavební|adj|building||
tenis|m|tennis||
rodný|adj|native, birth (adj.)||
vstříc|prep|toward|Běžet vstříc nebezpečí místo utíkání od něj.|To run towards danger rather than run away from it.
vykopat|vp|to dig out, to unearth||
ponožka|f|sock||
uskutečnit|vp|to carry out, to realize||
balet|m|ballet||
chemikálie|f|chemical||
pochodeň|f|torch||
oprávnění|n|authorization||
aktuální|adj|current, up-to-date|Je Vaše nabídka ještě aktuální?|Is your offer still open?
divák|m|spectator, viewer; bystander, onlooker||
lednice|f|refrigerator||
sladkost|f|candy, sweet; sweetness||
stěhování|n|moving, relocation||
prasátko|n|piglet; piggy bank||
tempo|n|speed, pace, rate; tempo||
alkoholik|m|alcoholic||
servis|m|service; repair shop, garage||
rozloučení|n|farewell||
hotově|adv|in cash|Platíte hotově nebo kartou?|Cash or credit?
sebeobrana|f|self-defense, self defence||
doupě|n|lair||
smetí|n|rubbish||
jazz|m|jazz||
zdvořilý|adj|polite||
zvědavost|f|curiosity|vyvolat zvědavost|to arouse curiosity
manželský|adj|marriage, marital|manželský pár|married couple
sát|vi|to suck||
současnost|f|present; simultaneity||
prodavač|m|shop assistant, salesman||
ocenění|n|award; appreciation|získat ocenění|to win an award
zaznamenat|vp|to record||
úspory|f|savings||
lázně|f|bathhouse; spa||
tuk|m|fat|Slanina je bohatá na tuk.|Bacon is rich in fat
skutek|m|deed||
blízkost|f|closeness, nearness, vicinity, proximity||
pětka|f|five||
prezentace|f|presentation||
spolknout|vp|to swallow||
sud|m|barrel||
obrazovka|f|screen||
kulturní|adj|cultural||
ekonomika|f|economy||
potenciální|adj|potential||
hrabat|vi|to rake; to dig||
nadporučík|m|first lieutenant||
šašek|m|jester||
plod|m|fruit; fetus||
létání|n|flying|Nemá rád létání.|He doesn’t like flying
ohnout|vp|to bend; (se) to bend down, to stoop||
úsvit|m|dawn||
historický|adj|historical||
krajina|f|landscape, scenery; region, area||
raněný|adj|wounded, hurt||
akt|m|act, deed; act||
šátek|m|scarf||
vzpoura|f|rebellion, revolt; mutiny||
domácnost|f|household||
vizuální|adj|visual||
shora|adv|from above|Shora na mne z okna pražilo slunce.|From above the sun was beating me down
strašit|vi|to haunt; to scare||
odjezd|m|departure||
zkušební|adj|trial, probationary|zkušební období|probationary period
adoptovat|vi|to adopt||
letenka|f|plane ticket, airline ticket||
nabitý|adj|charged, loaded, filled||
partnerství|n|partnership||
váhy|f|scales, scale, weighing scale||
omdlít|vp|to faint||
lázeň|f|bath||
kousnutí|n|bite||
poctivý|adj|honest, fair, square||
včela|f|bee||
sherry|n|sherry||
kategorie|f|category||
kočička|f|kitty||
plavání|n|swimming||
psychiatr|m|psychiatrist||
mládež|f|youth||
cyklus|m|cycle; series|cyklus přednášek|series of lectures
civilista|m|civilian||
popelnice|f|trash can, garbage can, dustbin||
kopí|n|spear||
mírně|adv|mildly||
nakreslit|vp|to draw|Nakreslím něco hezkého.|I will draw something beautiful
mívat|vi|to have (habitually)||
web|m|web; website||
pomocník|m|helper||
zvrácený|adj|perverse||
předpoklad|m|assumption, supposition; premise||
režim|m|regime; mode||
nedělní|adj|Sunday||
rozruch|m|commotion, agitation|vyvolat rozruch|to create a stir
průměr|m|diameter; average, mean|aritmetický průměr|arithmetic mean
ordinace|f|doctor’s office, surgery||
otěhotnět|vp|to conceive, to become pregnant||
ošetřovna|f|first-aid station, infirmary, treatment room||
pokyn|m|direction, instruction; directive, guideline|podat pokyn|to give an instruction
helma|f|helmet; hard hat||
ďábelský|adj|devilish, diabolic||
netvor|m|monster||
vynález|m|invention||
uzel|m|knot; node|uvázat/svázat uzel|to tie a knot
průchod|m|passage, passageway; alleyway||
desátník|m|corporal||
zmást|vp|to confuse; to puzzle||
raketoplán|m|space shuttle||
poznávací|adj|identification (adj.); cognitive||
široký|adj|wide, broad||
otvor|m|opening||
padouch|m|villain||
slaboch|m|weakling; wuss||
částka|f|amount, sum||
duben|m|April||
odraz|m|reflection; bounce||
výbušnina|f|explosive||
nervový|adj|nervous (of the nerves)|nervová soustava|nervous system
truchlit|vi|to mourn||
otroctví|n|slavery||
rozhodčí|m|referee||
kostka|f|cube; die|Pokud se nemůžeš rozhodnout, hoď si kostkou.|If you can’t decide, roll a die
reputace|f|reputation|profesionální reputace.|professional reputation
potrvat|vp|to last, to take (time)|Jak dlouho to potrvá?|How long will it take?
žal|m|grief||
záviset|vi|to depend or rely on||
náraz|m|impact||
stánek|m|kiosk||
listopad|m|November||
hurikán|m|hurricane||
měkký|adj|soft||
vzdělat|vp|to educate; (se) to learn, obtain education||
hořící|adj|burning||
malíř|m|painter||
úzkost|f|anxiety|mít úzkost|to have anxiety
rozvedený|adj|divorced||
vepřové|n|pork, swineflesh||
viceprezident|m|vice president||
zabezpečený|adj|secured||
odmítnutí|n|rejection||
želé|n|jelly||
víceméně|adv|more or less, pretty much||
liška|f|fox|liška jezerní|raccoon dog
ubytování|n|lodging, accommodation|poskytovat ubytování.|to provide accommodation
dvoje|num|two, two groups of, two sets of|dvoje modré kalhoty|two blue pants
zjištění|n|finding||
štěnice|f|bedbug; bug (listening device)||
vykonat|vp|to carry out, to do, to perform||
načasovat|vp|to time||
pracovna|f|study||
flek|m|stain, spot||
dodržet|vp|to keep, to observe (a rule)|Svůj slib dodržela.|She has kept her promise
dovést|vp|to bring, to lead; to be able to|Rodiče mě dovedli do obchodu s brýlemi.|My parents took me to a glasses store
severně|adv|north||
ženich|m|bridegroom, groom||
zlost|f|anger||
unikátní|adj|unique||
kukuřice|f|maize, corn||
přízemí|n|ground floor||
bezvědomý|adj|unconscious||
barbar|m|barbarian; philistine||
ústředí|n|headquarters||
klik|m|push-up; click||
režie|f|direction (of a film or play)||
stálý|adj|constant||
nástup|m|boarding; start||
odstranění|n|removal; elimination||
slovní|adj|word, verbal|slovní zásoba|vocabulary
pohodlný|adj|comfortable||
zkáza|f|destruction||
pohlavní|adj|sexual||
manipulovat|vi|to manipulate||
ukončení|n|end, ending, termination, cessation||
blog|m|blog||
loajalita|f|loyalty||
legendární|adj|legendary||
nezávislost|f|independence||
stodola|f|barn||
aspirin|m|aspirin||
povrchní|adj|superficial||
trasa|f|route||
mexický|adj|Mexican||
darebák|m|rascal, scoundrel||
oříšek|m|nut, hazelnut||
hodnost|f|rank||
pánev|f|frying pan; pelvis||
judo|n|judo|Kolébkou juda je Japonsko.|Japan is the cradle of judo
zlepšení|n|improvement||
záznamník|m|answering machine||
maják|m|lighthouse||
fascinovat|vi|to fascinate||
pyžamo|n|pajamas, pyjamas||
maršál|m|marshal||
tekutina|f|fluid, liquid||
zvýšený|adj|increased||
páka|f|lever||
ponížení|n|humiliation||
klišé|n|cliché||
pokec|m|chat||
zapalovač|m|lighter||
molo|n|pier; catwalk||
porada|f|meeting||
homosexuál|m|homosexual||
diktovat|vi|to dictate||
semeno|n|seed||
měřit|vi|to measure||
útěcha|f|consolation, solace|získat útěchu|to take comfort
neškodný|adj|harmless||
zakázaný|adj|forbidden||
genetický|adj|genetic|genetický algoritmus|genetic algorithm
kocour|m|tomcat|Když kocour není doma myši mají pré.|When the cat’s away the mice play
povzbudit|vp|to encourage|Během závodu jsem ho povzbuzoval.|I encouraged him during his race
vous|m|whisker; (plural) beard||
nebeský|adj|heavenly, celestial||
desítka|f|ten; number ten||
mateřský|adj|maternal||
pečeť|f|seal||
smutně|adv|sadly||
romantika|f|romance||
zmínka|f|mention||
kolečko|n|small wheel; wheelbarrow||
coby|conj|in the role of||
fyzik|m|physicist||
železnice|f|railroad, railway, rail transport||
chození|n|walking||
hokej|m|hockey, ice hockey; hockey, field hockey||
kapesník|m|handkerchief||
hostina|f|feast||
doporučovat|vi|to recommend||
vězeňský|adj|prison|vězeňská cela|prison cell
formální|adj|formal; perfunctory||
beta|f|beta||
kandidovat|vi|to be a candidate||
urovnat|vp|to settle; to smooth, level|Maminka mi urovnala postel.|My mother made my bed
kontejner|m|container|kontejner na sklo|bottle bank
klín|m|lap; wedge||
ministryně|f|minister (female)||
zaparkovat|vp|to park||
uklidňující|adj|comforting, soothing||
neschopný|adj|unable, incapable||
tolerovat|vi|to tolerate||
rozdrtit|vp|to crush||
křesťan|m|Christian||
příjezd|m|arrival||
nikoli|conj|not||
sedlo|n|saddle||
monitor|m|monitor||
aukce|f|auction||
mluvčí|m|speaker; spokesman, spokesperson||
vibrace|f|vibration||
srpen|m|August||
oplatit|vp|to repay, to pay back, to requite, to return||
úplatek|m|bribe|přebrat úplatek|to receive a bribe
turista|m|tourist||
dozor|m|supervision||
údaj|m|piece of data, figure||
vyvíjet|vi|to develop||
šokovat|vi|to shock||
nabít|vp|to charge||
obr|m|giant||
klesat|vi|to fall, to decrease||
křehký|adj|fragile||
přemístit|vp|to move, to shift, to relocate; (se) to move, to shift||
klimatizace|f|air conditioning||
blond|adj|blond||
odhodlání|n|determination, resolution, resolve||
chodník|m|sidewalk, pavement, footpath||
připomínka|f|reminder; remark||
čáry|m|magic, spells||
větev|f|branch||
shodnout se|vp|to agree, concur||
dřít|vi|to toil; to rub||
podlaží|n|storey, story, floor, level||
kompromis|m|compromise||
rebel|m|rebel|Je to věčný rebel.|He is an eternal rebel
kořen|m|root||
panství|n|dominion, manor, demesne; dominion, rule||
usmát se|vp|to smile|Usmála se na něho.|She smiled at him
potvora|f|beast, nuisance||
zacházení|n|treatment||
klíček|m|small key||
velryba|f|whale||
ujet|vp|to drive away, to move away|Ujel mi autobus.|I missed the bus
boháč|m|rich man||
hostitel|m|host||
plavidlo|n|watercraft||
koroner|m|coroner||
status|m|status||
obranný|adj|defensive||
přistoupit|vp|to approach; to get on; to agree to||
prasknout|vp|to burst, to crack|Prasklo to.|It was revealed
každodenní|adj|everyday|každodenní jazyk|everyday language
porážka|f|defeat||
sólo|n|solo|Vystupoval sólo.|He acted solo
opačný|adj|opposite||
piano|n|piano||
délka|f|length; longitude||
nutkání|n|compulsion|vyvolat nutkání|to evoke the urge
tabule|f|board, blackboard||
chemický|adj|chemical|chemické inženýrství|chemical engineering
jojo|n|yeah, yep (informal)||
zneužívání|n|misuse; abuse||
samec|m|male||
dělání|n|making, doing, making of; work||
jeptiška|f|nun||
hedvábí|n|silk||
porotce|m|juror||
namalovat|vp|to paint; (se) to put on make-up|Namaluji obraz a prodám ho.|I will paint a picture and sell it
cibule|f|onion; bulb||
cedule|f|sign||
ráže|f|caliber|být v ráži|to be enraged
odebrat|vp|to take away, to remove||
poselství|n|message||
téci|vi|to flow||
talentovaný|adj|talented||
police|f|shelf||
zásada|f|principle, rule||
evakuace|f|evacuation||
uspokojit|vp|to satisfy||
energetický|adj|energy|energetický nápoj|energy drink
závidět|vi|to envy||
záruka|f|guarantee|získat záruku|to obtain a guarantee
tenhleten|pron|this||
šatna|f|dressing room, changing room; cloakroom||
rybařit|vi|to fish||
prkno|n|plank, board|žehlicí prkno|ironing board
panel|m|panel||
bezmocný|adj|powerless, helpless||
sleva|f|discount|Můžete mi dát slevu, pane?|Can you give me a discount, sir?
zášť|f|hatred|chovat k někomu zášť|to hold a grudge against someone
dotek|m|touch||
kyselina|f|acid||
kolegyně|f|colleague (female)||
hod|m|throw; feast day, holy day|hod oštěpem/diskem/kladivem|javelin/discus/hammer throw
ohnivý|adj|fiery||
sousedka|f|neighbor (female)||
řezník|m|butcher||
matrace|f|mattress||
tělocvična|f|gym, gymnasium||
devátý|adj|ninth||
masový|adj|mass (adj.); meat (adj.)||
potomek|m|descendant||
zvláštně|adv|strangely, curiously||
adrenalin|m|adrenaline||
hrnec|m|pot||
žárlivost|f|jealousy||
protivník|m|adversary; opponent; competitor||
hrom|m|thunder||
výkonný|adj|executive; powerful, efficient||
přeměnit|vp|to change, to transform, to convert; to turn||
vypařit se|vp|to evaporate|zmizet jako by se vypařili|to disappear as though they had evaporated
topení|n|heating; radiator|Na topení jsme sušili oblečení.|We dried our clothes on the radiator
porozumění|n|comprehension; understanding||
cukroví|n|sweets, Christmas cookies||
zpracovat|vp|to process||
doutník|m|cigar||
dvorek|m|yard||
psychologie|f|psychology||
srdečný|adj|heartfelt, hearty, cordial||
charitativní|adj|charitable|charitativní organizace|charitable organization
zřídka|adv|seldom, rarely||
zápal|m|inflammation; enthusiasm|Petr soutěžil s Pavlem se zápalem.|Peter was competing with Paul with enthusiasm.
vlastník|m|owner, proprietor||
prosinec|m|December||
odpovědný|adj|responsible, answerable, accountable||
naskočit|vp|to jump on; to start (of an engine)||
centimetr|m|centimeter, centimetre||
poznání|n|knowledge||
březen|m|March||
dědic|m|heir||
porodit|vp|to give birth|Porodila krásnou holčičku.|She gave birth to a beautiful baby girl
podkroví|n|attic, garret, loft||
hubený|adj|thin, skinny||
zásluha|f|merit, worth, desert||
zákulisí|n|backstage|zákulisí divadla|backstage of a theater
předvídat|vi|to predict, to foresee||
nemovitost|f|real estate||
rušení|n|interference, disturbance; cancellation||
pokládat|vi|to lay; to consider|Nepokládám to za nutné.|I don’t find it necessary
vypálit|vp|to burn (down); to fire|Vypálili teleti značku svého ranče.|They branded the calf with the brand of their ranch.
nadávat|vi|to swear; to scold||
výrobce|m|producer, manufacturer||
vybouchnout|vp|to explode||
výplata|f|pay, salary, wages||
desátý|adj|tenth||
esej|m|essay||
chytře|adv|cleverly||
břemeno|n|burden||
dřívější|adj|former; earlier||
starověký|adj|ancient||
práh|m|doorstep; threshold, brink||
oholit|vp|to shave||
kmenový|adj|tribal; core||
bratrstvo|n|brotherhood||
svěží|adj|fresh||
alergie|f|allergy||
sklon|m|slope, gradient, incline, cant; tendency, inclination||
podivín|m|weirdo, oddball||
ochranný|adj|protective||
štětka|f|brush||
šikovný|adj|skilled; handy||
vlákno|n|thread; filament||
žába|f|frog||
vnučka|f|granddaughter||
hazard|m|gambling; risk, gamble||
kritický|adj|critical||
holý|adj|bald; hairless; bare||
komiks|m|comic (book)||
převoz|m|transport, transportation; conveyance||
zničehonic|adv|suddenly||
květ|m|flower||
facka|f|slap|dát komu facku|to slap someone in the face
křestní|adj|baptismal; first (name)||
mechanik|m|mechanic||
solidní|adj|solid, decent||
aplikace|f|application||
klesnout|vp|to fall, to drop, to decrease||
vytočit|vp|to dial; to enrage||
logika|f|logic||
vydírat|v|to blackmail||
náhlý|adj|sudden||
rejstřík|m|index; register||
urychlit|vp|to accelerate||
autogram|m|autograph||
správní|adj|administrative||
mrkev|f|carrot||
odrazit|vp|(se) to bounce; to ward off||
jupí|intj|yippee, yay||
jáma|f|pit, hole||
muzikál|m|musical||
pozoruhodný|adj|remarkable||
průvod|m|procession, parade||
obchoďák|m|department store||
zjevení|n|epiphany; revelation||
pařit|vi|to party hard||
mimořádně|adv|extraordinarily||
mýt|vi|to wash||
líný|adj|lazy||
vyložit|vp|to unload; to explain||
maniak|m|maniac||
diskrétní|adj|discreet|diskrétní veličina|discrete variable
roztrhat|vp|to tear to pieces|Roztrhal fotku na kousíčky.|He tore the photo into pieces
pobíhat|vi|to run around||
značně|adv|considerably, significantly||
opilec|m|drunkard, alcoholic, drunk||
přechod|m|crossing; transition|fázový přechod|phase transition
zanedlouho|adv|soon, shortly||
povídání|n|talking, chat||
žvanit|vi|to chatter, to babble||
svolit|vp|to consent, to agree||
lino|n|linoleum||
žebro|n|rib||
radnice|f|town hall, city hall||
protest|m|protest|vyvolat protest.|to elicit protest
vloni|adv|last year||
zvenčí|adv|from outside||
evoluce|f|evolution||
osvobození|n|liberation; exemption||
sluch|m|hearing||
správa|f|administration|provádět správu|to manage
zasvětit|vp|to initiate; to dedicate|Zasvětil svůj život Alláhovi.|He devoted his life to Allah
nukleární|adj|nuclear||
hlasitě|adv|loud, loudly||
předělat|vp|to redo, to remake, to rework||
neutrální|adj|neutral||
zdrhnout|vp|to run away||
železný|adj|iron (adj.)||
inkoust|m|ink||
letošní|adj|of this year||
romantik|m|romantic||
čepel|f|blade||
příchozí|adj|incoming; newcomer||
vyčerpávající|adj|exhausting; exhaustive||
kryt|m|cover, shield; housing, casing||
alternativní|adj|alternative||
vyletět|vp|to fly out; to shoot up|vyletět z kůže|to jump out of your skin
ostatně|adv|besides, anyway||
trup|m|torso, trunk, body||
prorok|m|prophet|Prorok Mohamed|Prophet Muhammad
barevný|adj|coloured||
karaoke|n|karaoke||
naruby|adv|inside out||
laser|m|laser||
propojení|n|interconnection, connection, link||
ovlivňovat|vi|to influence|Ministr se snažil ovlivňovat vyšetřování případů.|The minister tried to manipulate the investigation.
křeč|f|spasm; cramp||
jiskra|f|spark||
suvenýr|m|souvenir||
smazat|vp|to delete, to erase|smazat tabuli|to clean the blackboard
podání|n|submission; serve (in sport)||
rámec|m|frame; framework|v rámci možností|within the bounds/realm of possibility
zneužívat|vi|to abuse, to misuse||
španělský|adj|Spanish||
limuzína|f|limousine||
zpěvačka|f|singer (female)||
biologie|f|biology||
nota|f|note (music)||
vysledovat|vp|to track down||
vyrobený|adj|made; manufactured||
řetězec|m|chain; string|Jeho rodina vlastní řetězec restaurací.|His family owns a chain of restaurants
hloubka|f|depth, deepness; the deep||
veterán|m|veteran||
basketbal|m|basketball||
teple|adv|warmly||
sestavit|vp|assemble||
mříž|f|bars, grille||
roztleskávačka|f|cheerleader||
dusit|vi|to choke; to stew||
jehněčí|adj|lamb||
lepidlo|n|glue, adhesive||
brzda|f|brake||
sad|m|orchard||
trhlina|f|crack||
prolomit|vp|to break, breach, burst||
epidemie|f|epidemic||
yard|m|yard||
protáhnout|vp|to stretch; to pull through|protáhnout si nohy|to stretch one’s legs
krocan|m|turkey||
peří|n|feathers||
astronaut|m|astronaut, cosmonaut||
sedativum|n|sedative, tranquilizer||
šunka|f|ham||
zvětšit|vp|to magnify||
seminář|m|seminar; seminary|Seminář jí zvedl sebedůvěru.|The workshop increased her self-confidence
dovednost|f|skill, prowess, proficiency; ability||
bandita|m|bandit, brigand, gangster|Byl přepaden bandity.|He was ambushed by bandits
dávný|adj|ancient, bygone||
plavba|f|voyage||
reaktor|m|reactor||
určený|adj|intended; designated||
smečka|f|pack (of animals)||
trvalý|adj|permanent||
pojišťovna|f|insurance company||
tanečník|m|dancer||
svázat|vp|to tie, to knot, to bind||
prasečí|adj|pig, pig’s|prasečí chlívek|pigsty
tužka|f|pencil||
mňam|intj|yum||
kout|m|corner||
vykoupení|n|redemption||
filozofie|f|philosophy||
okolní|adj|surrounding; ambient||
bezvadný|adj|perfect, great, excellent||
škrábnutí|n|scratch||
přestupek|m|transgression||
deštník|m|umbrella||
přívěs|m|trailer||
prapor|m|banner; battalion||
zkoumat|vi|to investigate; to explore||
otrávený|adj|poisoned; frustrated, disgruntled||
věcička|f|thingy||
depresivní|adj|depressive||
pračka|f|washing machine, washer||
ostříhat|vp|to cut (hair), to shear||
pilulka|f|pill||
sonda|f|probe||
hřebík|m|nail||
přesčas|m|overtime||
strhnout|vp|to tear off; to pull down||
velkolepý|adj|magnificent||
neboli|conj|or||
sérum|n|serum||
matematik|m|mathematician||
návštěvník|m|visitor||
vzrušit|vp|to excite||
pecka|f|pit, stone (of fruit); hit||
pátrat|vi|to search, look for||
zlobivý|adj|naughty, disobedient||
úlovek|m|catch||
metafora|f|metaphor||
hlasitý|adj|loud||
školka|f|kindergarten||
takovýto|pron|such, like this||
šarm|m|charm||
vznešený|adj|noble||
uvolněný|adj|relaxed||
učený|adj|learned, erudite||
posoudit|vp|to judge||
stáří|n|age|Co se v mládí naučíš, ve stáří jako když najdeš.|Young learner, wise elder
andílek|m|little angel||
praní|n|washing, laundering||
melodie|f|tune, melody||
klacek|m|stick, club, branch||
služebník|m|servant||
opakovaně|adv|repeatedly||
objasnit|vp|to get across, to clarify; to explain||
koncept|m|concept; draft||
jižně|adv|south; southward||
medvídek|m|teddy bear||
tajemník|m|secretary||
zařadit|vp|to include, to classify; to shift (gear)||
vítězný|adj|winning, victorious||
kritik|m|critic||
časovat|vi|to conjugate||
bůhví|intj|God knows||
bankéř|m|banker||
komplic|m|accomplice||
holub|m|pigeon, dove||
hádanka|f|riddle, puzzle||
vrcholit|vi|to culminate, to climax|Napětí vrcholí.|The tension is peaking
komplex|m|complex||
nanic|adv|useless||
tik|m|tick, a twitch||
chytrák|m|smart aleck; fox||
umírající|adj|dying||
hlína|f|earth, soil; clay|hlína je hnědá|soil is brown
pasažér|m|passenger||
podvědomí|n|subconscious, subconsciousness||
rovnice|f|equation||
dynamit|m|dynamite||
vyšilovat|vi|to freak out||
meloun|m|melon, watermelon||
korporace|f|corporation||
řezat|vi|to cut; to saw||
košík|m|shopping basket||
zánět|m|inflammation|chronický zánět|chronic inflammation
reklamní|adj|advertising|reklamní agentura|advertising agency
pálka|f|bat||
lidskost|f|humaneness||
tajnost|f|secret||
teroristický|adj|terrorist||
notebook|m|laptop, notebook||
samuraj|m|samurai||
povýšený|adj|haughty, lofty; promoted||
zvracení|n|vomiting||
podstatný|adj|substantial; relevant||
lektvar|m|potion||
senát|m|senate||
kormidlo|n|rudder||
kníže|m|prince||
šatník|m|wardrobe||
kopnout|vp|to kick|Kopla mě elektřina.|I got an electric shock
ječet|vi|to scream, to yell||
design|m|design||
kolekce|f|collection||
děvčátko|n|little girl||
biskup|m|bishop||
zlikvidovat|vp|to eliminate, to dispose of; to liquidate||
dostupný|adj|available||
čestně|adv|honestly||
koupat|vi|to bathe||
drb|m|rumor; scratch||
hacker|m|hacker||
poskytovat|vi|to provide, to offer|poskytovat oporu|to provide support
korupce|f|bribery, corruption||
stadion|m|stadium||
bouchačka|f|gun||
dlaň|f|palm||
prostřední|adj|middle||
unie|f|union|celní unie|customs union
umlčet|vp|to silence||
práskač|m|snitch, rat||
nazpátek|adv|back||
specialista|m|specialist||
zrušení|n|cancellation||
bolestivý|adj|painful||
ubrousek|m|napkin||
onemocnění|n|disorder, disease|onemocnění ledvin|kidney disease
chlupatý|adj|hairy; cop||
norma|f|norm||
tragický|adj|tragic||
čili|conj|or, in other words||
jelen|m|deer, stag||
porodní|adj|birth, natal||
německy|adv|in German||
úplněk|m|full moon||
dámský|adj|ladies’|dámské oblečení|female clothing
veverka|f|squirrel||
odpovídající|adj|corresponding||
narušený|adj|disturbed||
lůžko|n|bed (hospital bed, berth)|nemocniční lůžko|hospital bed
spodek|m|bottom, lower part||
nakazit|vp|to infect||
zneškodnit|vp|to render harmless||
rozbor|m|analysis|provést rozbor|to perform an analysis
kari|n|curry||
chirurgie|f|surgery||
šestka|f|six||
opřít|vp|to lean (something); (se) to lean||
vyhladit|vp|to wipe out; to smooth||
hrobka|f|tomb||
pozpátku|adv|backwards|Chodí pozpátku .|He’s walking backwards
mazaný|adj|cunning, sly||
krasavec|m|handsome man||
vařený|adj|boiled||
pustý|adj|deserted||
plátno|n|canvas; linen||
slušnost|f|decency||
soustava|f|system|sluneční soustava|solar system
architekt|m|architect||
bystrý|adj|quick, alert, perceptive||
pronájem|m|rental||
řádek|m|line, row||
vysadit|vp|to drop off; to plant|Kde vás mám vysadit?|Where shall I drop you off?
svaz|m|union, association|Sovětský svaz|Soviet Union
podílet se|vi|to participate, take part, be involved, contribute||
pojmenovat|vp|to name||
špeh|m|spy||
zhroucení|n|collapse, breakdown||
odtáhnout|vp|to drag away, to pull away||
definice|f|definition||
řecký|adj|Greek||
krveprolití|n|bloodshed||
telka|f|telly|Nevíš, co dneska dávají v telce?|Do you know what’s on TV today?
prohrávat|vi|to lose||
zákusek|m|dessert||
podivně|adv|strangely, curiously||
vyučování|n|teaching, education; class, classes|mít vyučování|to have a lesson
obsluha|f|service; staff||
vyprávění|n|narrative||
leden|m|January||
zvyšovat|vi|to increase, to raise||
zaplacení|n|paying||
dinosaurus|m|dinosaur||
svázaný|adj|tied, bound||
tabák|m|tobacco||
kompas|m|compass||
složení|n|composition; ingredients||
kovboj|m|cowboy||
limonáda|f|lemonade, soft drink||
faktor|m|factor||
fanynka|f|fan (female), fangirl||
flaška|f|bottle||
ubytovat|vp|to accommodate, to lodge, to house|Ubytovali nás na různých kolejích.|They accommodated us in various dormitories
vepřový|adj|pork||
loterie|f|lottery||
podnikatel|m|entrepreneur||
ring|m|(boxing) ring||
bláto|n|mud||
prototyp|m|prototype||
jednoznačně|adj|unequivocally, unambiguously||
pozemní|adj|ground||
zkušený|adj|experienced||
promluva|f|speech; utterance||
stanovit|vp|to determine, define, specify||
lesní|adj|forest, wood|lesní plody|forest fruits
fuč|adv|gone||
osprchovat|vp|to shower; (se) to take a shower||
klášter|m|monastery, convent|Tiché ústraní kláštera.|Quiet seclusion of the monastery
provedení|n|execution; version, variant||
hadí|adj|snake, snake’s||
trestat|vi|to punish||
zázračný|adj|miraculous||
rovnat se|vi|to equal||
předávat|vi|to hand over, to pass on||
dimenze|f|dimension||
trosky|f|debris||
příznak|m|symptom||
leták|m|leaflet, flyer||
spojka|f|clutch; conjunction; link||
odhadnout|v|to estimate||
římský|adj|Roman|římské ruiny|Roman ruins
hřeben|m|comb; ridge||
milování|n|loving; making love||
vyrušení|n|interruption, disturbance, distraction||
prohlížet si|vi|to look through something, to inspect||
dvojice|f|pair, couple||
kobliha|f|doughnut||
uvěznění|n|imprisonment||
mrtvice|f|stroke||
transplantace|f|transplantation, transplant||
oplátka|f|return favour (na oplátku: in return)|na oplátku za co|in return for something
manévr|m|manoeuvre|provést manévr|to perform a manoeuvre
stýkat se|vi|to keep in touch, to see each other||
kritika|f|criticism; critique||
platba|f|payment||
karavan|m|caravan||
švagr|m|brother-in-law||
župan|m|dressing gown||
dramatický|adj|dramatic||
odbor|m|section, department||
nezvěstný|adj|missing||
všemohoucí|adj|almighty, omnipotent||
postát|vp|to stand still for a while||
beznadějný|adj|hopeless||
ostraha|f|watch, surveillance; security||
zablokovat|vp|to block||
předkrm|m|appetizer, hors d’oeuvre, starter||
vděčnost|f|gratitude|získat vděčnost|to earn gratitude
dovézt|vp|to import||
kodex|m|code||
zajatec|m|captive; prisoner of war||
odsouzený|adj|convicted||
uvolnění|n|relaxation||
pouť|f|pilgrimage||
shořet|vp|to burn down, to burn completely||
loket|m|elbow||
sebevědomý|adj|self-confident||
modřina|f|bruise||
tango|n|tango||
málokdy|adv|rarely||
váza|f|vase||
propojit|vp|to interconnect, connect, link||
nadání|n|talent||
žrádlo|n|(animal) food, grub||
kára|f|cart; car (slang)||
ač|conj|although||
vypršet|vp|to expire|Lhůta vyprší za týden.|The deadline expires in one week
klon|m|clone||
budovat|vi|to build||
zelí|n|cabbage||
divadelní|adj|theatre, theatrical|divadelní sbor|theatre company, ensemble
blaho|n|bliss, welfare, well-being||
sobotní|adj|Saturday||
budoucno|n|future||
radikální|adj|radical||
symptom|m|symptom||
brokovnice|f|shotgun||
opičí|adj|monkey (adj.)||
výchova|f|upbringing|dostat výchovu|to receive an upbringing
rozesmát|vp|to make laugh; (se) to start laughing|To mě rozesmálo.|This made me laugh
obilí|n|grain, cereals||
polní|adj|field||
nahrávací|adj|recording||
bezvýznamný|adj|unimportant, insignificant, meaningless; trivial||
emocionálně|adv|emotionally||
komplikovat|vi|to complicate||
boxer|m|boxer||
fór|m|joke||
otvírat|vi|to open||
doplnit|vp|to complement, to complete; to refill, to replenish||
dolní|adj|lower||
kráčet|vi|to walk, pace, step, strut||
zvenku|adv|from outside||
marihuana|f|marijuana||
zácpa|f|constipation; congestion, jam||
přispět|vp|to donate, to contribute|Děkujeme všem, co přispěli na charitu.|We thank everyone who donated to charity
shodovat se|vi|to agree, concur; to agree, tally, correspond||
váhat|vi|to hesitate||
instituce|f|institution||
nesprávný|adj|incorrect; improper||
ambiciózní|adj|ambitious||
evakuovat|vi|to evacuate||
kult|m|cult||
tenký|adj|thin||
brouček|m|sweetie, honey, darling||
napjatý|adj|tense||
zelenáč|m|greenhorn||
převést|vp|to convert; to transfer||
jedovatý|adj|venomous; poisonous|Pozor na jedovaté hady a pavouky.|Beware of venomous snakes and spiders
luxus|m|luxury||
převážně|adv|mostly; predominantly||
třídní|adj|class||
přistávací|adj|landing||
rukáv|m|sleeve||
kamarádit|vi|to be friends||
kontrakt|m|contract||
rozdělení|n|division, distribution||
dieta|f|diet||
předání|n|handover||
zápisník|m|notebook||
pobočka|f|branch||
kóma|n|coma||
dýka|f|dagger||
poradkyně|f|advisor (female), counselor||
dokonalost|f|perfection||
děs|m|horror, terror, dread|vyvolat děs|to cause dread
korektura|f|correction|provést korektury|to make corrections
nečekaně|adv|unexpectedly||
potrava|f|food|příjem potravy|food intake
prohra|f|loss||
příliv|m|high tide; influx||
strachovat se|vi|to be afraid of, to fear, to worry||
připojení|n|connection||
osvětlení|n|lighting, illumination||
tupý|adj|blunt; dull||
bahno|n|mud||
asociace|f|association||
oranžový|adj|orange||
taxikář|m|taxi driver||
naschvál|m|on purpose, deliberately||
vrata|n|door, gate||
tyčinka|f|stick, bar||
frustrující|adj|frustrating||
logický|adj|logical||
kemp|m|campsite, camp||
sponzor|m|sponsor||
jogurt|m|yogurt||
výprodej|m|sale, clearance||
odbory|m|union, trade union, labor union||
zástupkyně|f|deputy (female), representative||
učebnice|f|textbook||
bytí|n|being||
převléknout|vp|to change (clothes)||
hnusit|vi|to loathe, detest||
nečekaný|adj|unexpected||
superhrdina|m|superhero||
večeřet|vi|to have dinner||
motýl|m|butterfly||
padělek|m|forgery||
unikat|vi|to escape, to leak|On začíná unikat pokrytí kamery.|He’s starting to evade camera coverage
následně|adv|consequently; subsequently||
předávkování|n|overdosage||
přijíždět|vi|to arrive, to come||
diagnóza|f|diagnosis||
strašlivý|adj|horrible, terrible, awful||
zápis|m|record, minutes; enrolment||
spálený|adj|burnt||
zkrátit|vp|to shorten|Kalhoty potřebují trochu zkrátit.|The trousers need shortening a bit
zdravotník|m|medic, paramedic||
onemocnět|vp|to get ill, to fall ill||
zábavní|adj|entertainment||
závěrečný|adj|final, closing||
citovat|vi|to quote, to cite||
týmový|adj|team||
účetnictví|n|accounting||
používání|n|use, application||
podprsenka|f|bra, brassiere||
chvála|f|praise||
částečný|adj|partial|práce na částečný úvazek|part-time job
nálož|f|charge (explosive)|hlubinná nálož|depth charge
vnímání|n|perception||
dojemný|adj|touching, moving||
uspět|vp|to succeed||
zásobník|m|magazine (of a gun); container||
závěs|m|curtain; hinge||
vloupat se|vp|to break in||
konstábl|m|constable||
dýchací|adj|breathing, respiratory|dýchací svaly|muscles of respiration, breathing muscles
výhradně|adv|exclusively, solely|Vyzdvihoval výhradně přínosy členství.|He highlighted only the benefits of membership.
krmení|n|feeding; feed||
mísa|f|bowl|Na stole je mísa s ovocem.|There’s a bowl of fruit on the table
přítomný|adj|present|přítomný čas|present tense
kostní|adj|bone|kostní dřeň|bone marrow
matika|f|math||
pravděpodobný|adj|probable||
nákupní|adj|shopping|nákupní košík|shopping basket
ukrytý|adj|hidden, concealed, buried|ukryté skvosty|hidden gems
vrtat|vi|to drill||
vynést|vp|to take out, to carry out|vynést rozsudek|to pronounce a verdict
kostra|f|skeleton||
muzikant|m|musician||
budka|f|box, booth, cabin||
škrábanec|m|scratch||
financovat|vi|to finance||
upustit|vp|to drop, to let fall|Upustil vázu.|He dropped the vase
dosažení|n|achievement, accomplishment||
předpověď|f|prediction, forecast|předpověď počasí|weather forecast
havárie|f|accident||
osmdesát|num|eighty||
předevčírem|adv|day before yesterday||
vzdušný|adj|air (adj.), aerial||
diplom|m|diploma; certificate||
uzdravení|n|recovery, healing, curing|uzdravení z infekce|recovery from the infection
sirup|m|syrup||
obvaz|m|bandage||
vědomosti|f|knowledge||
letoun|m|airplane||
postrádat|vi|to lack||
krasavice|f|beauty||
stromek|m|small tree|vánoční stromek|Christmas tree
parlament|m|parliament|Parlament České republiky|Parliament of the Czech Republic
indický|adj|Indian||
dron|m|drone||
kardinál|m|cardinal||
zvěř|f|wild animals, game|divoká zvěř|wild animals
literatura|f|literature; bibliography||
studna|f|well||
deko|n|decagram||
tučňák|m|penguin||
ambasáda|f|embassy||
dýško|n|tip (gratuity)||
jedinec|m|individual||
celkový|adj|overall; total|celková narkóza|general anesthesia
skalpel|m|scalpel||
dvojí|adj|double, dual, of two kinds|vést dvojí život|to lead a double life
valit|vi|to roll|valit kámen, sud, sněhovou kouli|roll a rock, a barrel, a snowball
mód|m|mode||
obstarat|vp|to procure, obtain||
zrychlit|vp|to speed up, to accelerate||
rybář|m|fisher||
daňový|adj|tax|daňové přiznání|tax return
diskuse|f|discussion|vyvolat diskusi|to trigger a discussion
vánek|m|breeze||
užívání|n|use|mít v užívání.|to make use
léčka|f|trap||
postižený|adj|disabled||
vyrovnaný|adj|balanced, even|vyrovnaný rozpočet|balanced budget
zavézt|vp|to take somewhere; to deliver||
zármutek|m|grief, sorrow, chagrin||
sdružení|n|association||
porce|f|serving, portion||
nastavení|n|settings||
kmotr|m|godfather||
poražený|adj|defeated||
zuřit|vi|to rage||
tornádo|n|tornado||
děkan|m|dean||
oprávněný|adj|legitimate||
pyramida|f|pyramid||
malba|f|painting||
zahájení|n|opening; launching||
hadice|f|hose||
upíří|adj|vampire (adj.)||
motat|vi|to wind; to confuse||
laciný|adj|cheap||
autorita|f|authority||
vyprat|vp|to wash, to launder||
archa|f|ark||
zastupovat|vi|to represent||
titulní|adj|title||
sportovec|m|sportsperson, athlete||
náboženský|adj|religious|náboženský řád|religious order
průlom|m|breakthrough||
šuplík|m|drawer||
žárlivý|adj|jealous|Její manžel je velmi žárlivý.|Her husband is very jealous
disciplína|f|discipline||
milosrdenství|n|mercy||
praktický|adj|practical||
pěstovat|vi|to grow||
vycpat|vp|to stuff||
jóga|f|yoga||
sklenka|f|glass|sklenka vína|glass of wine
poctivě|adv|fairly; honestly||
recepční|adj|receptionist|recepční sál|reception hall
magnet|m|magnet||
motivace|f|motivation||
milionář|m|millionaire||
sblížit|vp|to bring closer together||
kaple|f|chapel||
posílit|vp|to strengthen||
laboratorní|adj|laboratory||
analyzovat|vi|to analyze||
knihkupectví|n|bookstore, bookshop|jít do knihkupectví|to go to the bookshop
imunní|adj|immune||
legie|f|legion||
bunkr|m|bunker||
dobýt|vp|to conquer|Hrad nebyl nikdy dobyt.|The castle was never conquered
přerušení|n|interruption; interrupt||
sladce|adv|sweetly||
delikátní|adj|delicate||
knír|m|mustache||
pozitivně|adv|positively||
sprej|m|spray; sprayer||
holení|n|shaving||
univerzitní|adj|university||
katolík|m|Catholic||
vylepšení|n|improvement||
chopit se|vp|to take, to seize, to grasp, to take hold||
malování|n|painting||
vyznamenání|n|decoration, award; honours||
taktický|adj|tactical||
zastrašit|vp|to intimidate||
amatér|m|amateur||
páteční|adj|Friday||
letectvo|n|air force||
úvodní|adj|introductory||
únor|m|February||
uprchnout|vp|to flee||
obtíž|f|difficulty, problem||
vzájemný|adj|mutual||
adopce|f|adoption||
otáčet|vi|to rotate||
bublina|f|bubble||
rozhodování|n|decision making||
pohotovostní|adj|emergency||
kečup|m|ketchup|hranolky s kečupem|french fries with ketchup
neslušný|adj|indecent||
golfový|adj|golf|golfový míček|golf ball
mravenec|m|ant||
zpravodajství|n|news; reporting||
dřevěný|adj|wooden||
třetina|f|third||
přízeň|f|favor|získat si něčí přízeň|to gain someone’s favor
plazit se|vi|to crawl, to grovel||
posun|m|shift||
vychutnat si|vp|to relish, savour, enjoy||
poklop|m|cover, lid||
namočit|vp|to make wet; to soak||
chlubit se|vi|to boast, to brag, to show off|Chlubil se kamarádům svými novými bruslemi.|He was showing off his new skates to his friends.
nit|f|thread||
propast|f|abyss||
atentát|m|assassination||
umístěný|adj|located, placed||
listí|n|foliage||
lis|m|press, squeezer||
psychologický|adj|psychological||
tiskový|adj|press (adj.), printing|tisková forma|printing form
simulace|f|simulation||
verš|m|verse||
kontaktní|adj|contact||
oltář|m|altar||
potlačit|vp|to suppress; to stifle, to repress||
vášnivý|adj|passionate||
nakupování|n|shopping||
vykoupit|vp|to ransom; to redeem||
snubní|adj|wedding|snubní prsten|wedding ring
mechanismus|m|mechanism||
neschopnost|f|inability, incapability||
světlý|adj|light, bright||
útulek|m|shelter, pound||
náplast|f|patch; band-aid, plaster||
kohoutek|m|tap, faucet; cockerel||
bezcenný|adj|worthless||
uspokojení|n|satisfaction|poskytovat uspokojení|to provide satisfaction
nevolnost|f|nausea|žaludeční nevolnost|motion sickness
zlomenina|f|fracture||
přísloví|n|proverb, saying||
odlet|m|departure||
rtěnka|f|lipstick||
napojit|vp|to connect||
příchuť|f|flavor, flavoring||
potápět|vi|to sink; (se) to dive||
samice|f|female||
financování|n|financing, funding||
hranolka|f|French fry||
paruka|f|wig||
šestkrát|adv|six times||
listina|f|document; register, list||
hospodyně|f|housekeeper||
říkávat|vi|to say (often)||
kovový|adj|metal||
zahradník|m|gardener|udělat kozla zahradníkem|fox guarding the henhouse
objímat|vi|to hug, to embrace||
vršek|m|top|zlámané vršky stromů|broken tree tops
podrobnost|f|detail||
odhodlaný|adj|resolute, determined||
ošetřit|vp|to treat (a wound, a patient)||
akční|adj|action (as in action film)|akční figurka|action figure
panda|f|panda||
vypínač|m|switch|zapnout nebo vypnout vypínač|to turn the switch on or off
rámus|m|noise, racket|pekelný rámus|noisy as hell
řádný|adj|proper, regular||
zakladatel|m|founder||
pokání|n|repentance, penance|dát se na pokání|to repent
plocha|f|area, surface; desktop||
vyzvat|vp|to challenge, to dare||
ztišit|vp|to silence||
expedice|f|expedition||
profese|f|profession||
skladba|f|composition, piece (of music)||
vízum|n|visa||
rozdílný|adj|different||
zakázka|f|order, commission||
hrudní|adj|thoracic||
extáze|f|ecstasy||
sekera|f|axe||
podvést|vp|to cheat||
kongresman|m|congressman||
oteplování|n|warming||
syrový|adj|raw||
izolace|f|insulation; isolation||
vykrvácet|vp|to bleed to death, bleed out, exsanguinate||
pocítit|vp|to feel, to experience||
poranit|vp|to hurt, injure||
lžíce|f|spoon||
budík|m|alarm clock||
investor|m|investor||
česnek|m|garlic||
náklonnost|f|affection, fondness|jeho náklonnost k ní|his affection for her
vyklidit|vp|to clear out||
tělesný|adj|bodily, physical|tělesné cvičení|physical exercise
mechanika|f|mechanics||
rajče|n|tomato||
smyčka|f|loop||
senzace|f|sensation||
osvěžující|adj|refreshing||
slabina|f|weakness||
laso|n|lasso||
závažný|adj|weighty, significant, important||
rum|m|rum||
mrazák|m|freezer||
mašina|f|machine; engine, locomotive||
třes|m|tremor, shake||
parazit|m|parasite||
potravina|f|piece of food; foodstuff||
beton|m|concrete||
zpětný|adj|backward, reverse; retroactive|zpětný apostrof|backtick
rutina|f|routine||
muslim|m|Muslim||
horský|adj|mountain, montane; highland||
mávat|vi|to wave; to flap|Mávali jsme mu na rozloučenou.|We waved him goodbye
rozčílit|vp|to anger; (se) to get angry||
jídelní|adj|dining||
rovina|f|plain; plane, level|syntaktická rovina|syntactic level
velkorysý|adj|generous||
standard|m|standard||
zřetelně|adv|clearly||
zvratky|m|vomit||
zachránce|m|savior||
šíře|f|width||
nález|m|finding, find||
trojúhelník|m|triangle|rovnoramenný trojúhelník|isosceles triangle
šeptat|vi|to whisper||
lámat|vi|to break||
sousto|n|mouthful||
soustředěný|adj|focused, concentrated||
finančně|adv|financially||
zástava|f|collateral, pledge||
úzký|adj|narrow||
psycholog|m|psychologist||
zajištění|n|securing, provision; collateral||
gril|m|grill, barbecue||
rekonstrukce|f|reconstruction|provést rekonstrukci|to reconstruct
rozšíření|n|expansion, extension|rozšíření slovní zásoby|expanding the vocabulary
konvoj|m|convoy, motorcade||
šíření|n|spreading, dissemination, propagation||
imigrační|adj|immigration||
zahradní|adj|garden||
zpáteční|adj|return (adj.)||
sloup|m|column||
volnost|f|liberty, freedom||
stávka|f|strike||
mírný|adj|moderate, mild||
kosmický|adj|space, outer space; cosmic|kosmický výzkum|space exploration
hraběnka|f|countess||
radioaktivní|adj|radioactive||
záliv|m|bay, gulf||
přízrak|m|phantom||
převod|m|conversion; transfer||
členství|n|membership||
kancl|m|office||
dopřát|vp|to grant||
procedura|f|procedure||
těsto|n|dough|Je ze stejného těsta.|Cut from the same cloth
lak|m|lacquer||
bledý|adj|pale||
převlek|m|disguise||
hypoteticky|adv|hypothetically||
chobotnice|f|octopus||
prospět|vp|to benefit; to pass|Změna ti prospěje.|A change will do you good
malinko|adv|little||
rozpadat se|vi|to be falling apart, to crumble||
spasitel|m|savior||
tenisky|f|sneakers||
orchestr|m|orchestra||
přepsat|vp|to rewrite, to copy out||
oblak|m|cloud||
nevyhnutelný|adj|inevitable, unavoidable||
pobýt|vp|to stay, to linger||
onehdy|adv|once, long ago||
nacista|m|Nazi||
požehnaný|adj|blessed|dožít se požehnaného věku|to live to a ripe old age
mráz|m|frost||
umělkyně|f|artist (female)||
rozluštit|vp|to decode, to decrypt; to solve||
kterýkoliv|pron|any, whichever||
protivný|adj|mean; annoying||
klasik|m|classic||
dění|n|events, affairs||
udržení|n|maintaining, maintenance||
novinářka|f|journalist (female)||
zpověď|f|confession||
finální|adj|final||
vnouče|n|grandchild||
revolver|m|revolver||
dřina|f|toil, grueling work||
plížit se|vi|to creep, to crawl, to sneak||
spása|f|salvation||
oběh|m|circulation|mimotělní oběh|extracorporeal circulation
éra|f|era, age||
nejistý|adj|uncertain; insecure||
sirotčinec|m|orphanage||
kresba|f|drawing||
kometa|f|comet||
nákaza|f|infection, contagion||
rockový|adj|rock|rocková hvězda|rock star
impozantní|adj|imposing||
úchvatný|adj|awesome, amazing||
primární|adj|primary||
risknout|vp|to take a risk, to risk, to take a chance||
nasazení|n|deployment||
zneužití|n|misuse; abuse||
pěna|f|foam||
návod|m|manual, instructions|poskytovat návod|to provide guidance
přínos|m|contribution; benefit||
panikařit|vi|to panic||
ponořit|vp|to plunge, immerse, dip; (se) to submerge, dive|Ponorka se ponořila.|Submarine submerged
bombardování|n|bombing||
dávit|vi|to choke; to vomit|Muž ji dávil, až zčernala.|The man choked her till she turned black
organismus|m|organism||
hrách|m|pea||
hrdinka|f|heroine||
fialový|adj|violet||
pramen|m|spring; source; strand||
tepna|f|artery||
explodovat|vi|to explode||
obklíčit|vp|to surround|Jednoho večera dům obklíčila policie.|One evening, the house was surrounded by police.
netopýr|m|bat||
hormon|m|hormone||
podobat se|vi|to resemble|Ta dívka se velmi podobá své matce.|The girl resembles her mother closely
duha|f|rainbow||
devadesát|num|ninety||
uškrtit|vp|to strangle||
nahrávání|n|recording; uploading||
ústřice|f|oyster||
něžný|adj|tender||
celoživotní|adj|lifelong||
ultrazvuk|m|ultrasound||
důvěrný|adj|intimate; confidential||
poník|m|pony||
puzzle|m|jigsaw puzzle||
vyznání|n|confession; religion||
počáteční|adj|initial|počáteční stav|initial state
svit|m|light, shine|Uvidíme se pod půlměsíčním svitem.|We’ll see each other under the half-moon light.
nezákonný|adj|illegal||
krab|m|crab||
snížení|n|reduction, lowering||
svědkyně|f|witness (female)||
sedmdesát|num|seventy||
zesnulý|adj|deceased||
divočina|f|wilderness; game||
ořech|m|nut||
zatmění|n|eclipse||
implantát|m|implant||
přibližovat|vi|to draw nearer; (se) to approach, to come closer to||
karanténa|f|quarantine||
muka|n|agony, torment, ordeal||
předložit|vp|to submit, produce, furnish, present, adduce, provide|předložit doklady|present legal documents
rozsvítit|vp|to turn on (the light)|rozsvítit světlo|to turn on the light
slitovat|vp|to take pity, to have mercy||
zrzka|f|redhead||
odsouzení|n|conviction||
tvůrce|m|creator||
logicky|adv|logically||
gratulace|f|congratulations||
zmocnit|vp|(se) to seize; to empower|Zmocnil se mě strach.|I was overcome with fear
kazatel|m|preacher||
rusky|adv|in Russian||
mást|vi|to confuse|Přestaň nás mást!|Stop confusing us!
mentální|adj|mental||
nesnesitelný|adj|unbearable, intolerable, unendurable, insufferable|nesnesitelná bolest|unbearable pain
pult|m|counter||
pošťák|m|postman||
cihla|f|brick|nepálené cihly|dried bricks
kapitál|m|capital||
gorila|f|gorilla; bodyguard||
transakce|f|transaction|provést transakci.|to perform a transaction
přehnaný|adj|exaggerated||
dalekohled|m|binoculars; telescope||
mše|f|mass (church service)||
prázdnota|f|emptiness||
pánský|adj|gentlemen’s, male|pánské oblečení|male clothing
losos|m|salmon||
pomocný|adj|auxiliary, helping||
pohostinnost|f|hospitality||
chlad|m|cold||
rozpoznat|vp|to recognize||
žvýkačka|f|chewing gum||
vnitřek|m|inside||
terorismus|m|terrorism||
hrací|adj|playing|hrací karty|playing cards
zářící|adj|shining||
palubní|adj|on-board||
hnít|vi|to rot, to putrefy||
rozvázat|vp|to untie|Rozvázala si tkaničky.|She untied her shoelaces
právnický|adj|legal, juridical|právnická fakulta|Faculty of Law
plošina|f|plateau; platform||
profesorka|f|professor (female)||
smažený|adj|fried||
vzdorovat|vi|to resist, to defy||
manipulace|f|manipulation||
asteroid|m|asteroid||
zlepšovat|vi|to improve, to develop, to refine; (se) to become better||
humr|m|lobster||
zábradlí|n|railing, rail; handrail||
apokalypsa|f|apocalypse||
měření|n|measurement|provést měření|to take a measurement
buben|m|drum||
konstrukce|f|construction||
atom|m|atom||
odehrát|vp|to play, to play out; (se) to take place, to happen||
demonstrace|f|demonstration||
zorganizovat|vp|to organize||
veterinář|m|veterinarian||
experimentální|adj|experimental||
nazbyt|adv|to spare||
lehko|adv|easily; lightly||
rozveselit|vp|to cheer up; (se) to cheer up||
pozorný|adj|attentive||
stíhat|vi|to chase; to prosecute; to keep up|Stíháš sledovat vývoj situace?|Can you keep up with the developing situation?
zneužít|vp|to misuse, to abuse||
hlavička|f|header||
nezdvořilý|adj|impolite||
univerzální|adj|universal||
přijímání|n|reception, receiving; adoption||
překvapeně|adv|in surprise||
brzdit|vi|to brake||
mumie|f|mummy||
statečnost|f|bravery||
křižovatka|f|intersection, junction||
žití|n|life||
zrození|n|birth|Zrození Venuše|The Birth of Venus
závrať|f|vertigo, dizziness, giddiness||
komunista|m|communist||
vědomě|adv|consciously||
`;
