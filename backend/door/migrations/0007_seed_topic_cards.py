"""
Data migration: cards for the three paths (control, danger, grooming).

"tvoj-telefon" moves from general to the control path. Four new cards per
language. No phone numbers and no links in any card: a link opened from here
would leave a trace in her browser history, so services are named, not linked.
Translations are drafts for the demo and need a native speaker's review.
"""

from django.db import migrations

# language -> [(slug, topic, order, title, body)]
CARDS = {
    "sr": [
        ("kontrola-telefona", "control", 10, "Ako ti neko prati telefon",
         "Znaci: zna gde si bila, šta si pisala ili s kim si pričala. Ne briši aplikacije i ne menjaj sve lozinke odjednom, jer to može da ga upozori. Za pomoć koristi uređaj kojem on nema pristup, na primer telefon prijateljice ili računar na poslu."),
        ("plan-bezbednosti", "danger", 10, "Ako si u opasnosti sada",
         "Ako možeš, pređi u prostoriju sa izlazom, dalje od kuhinje i kupatila. Drži telefon uz sebe. Dogovori sa nekim kome veruješ reč koja znači „zovi policiju“. Dokumenta, ključeve i lekove drži na mestu odakle ih brzo uzimaš."),
        ("znaci-upozorenja", "grooming", 10, "Kad neko na internetu traži nešto",
         "Budi oprezna ako neko koga znaš samo preko interneta traži da razgovor ostane tajna, šalje poklone ili novac, traži slike ili te pritiska da se nađete. Nisi ti kriva. Možeš da prekineš razgovor i da ga blokiraš."),
        ("moje-slike", "grooming", 11, "Ako neko ima tvoje slike",
         "Ne plaćaj i ne šalji nove slike. Ako ti je telefon bezbedan, sačuvaj poruke kao dokaz. Servisi Take It Down (za mlađe od 18 godina) i StopNCII (za starije) pomažu da se slike uklone sa velikih mreža, a da ih niko ne vidi."),
    ],
    "en": [
        ("kontrola-telefona", "control", 10, "If someone watches your phone",
         "Signs: he knows where you went, what you wrote or who you talked to. Do not delete apps or change every password at once, because that can warn him. Use a device he cannot access to get help, such as a friend's phone or a computer at work."),
        ("plan-bezbednosti", "danger", 10, "If you are in danger now",
         "If you can, move to a room with an exit, away from the kitchen and bathroom. Keep your phone with you. Agree on a word with someone you trust that means \"call the police\". Keep documents, keys and medicine where you can grab them fast."),
        ("znaci-upozorenja", "grooming", 10, "When someone online asks for things",
         "Be careful if someone you only know online wants your chats kept secret, sends gifts or money, asks for photos or pressures you to meet. It is not your fault. You can stop the conversation and block them."),
        ("moje-slike", "grooming", 11, "If someone has your photos",
         "Do not pay and do not send new photos. If your phone is safe, keep the messages as evidence. Take It Down (for under 18) and StopNCII (for adults) help remove images from major platforms without anyone having to see them."),
    ],
    "hr": [
        ("kontrola-telefona", "control", 10, "Ako ti netko prati mobitel",
         "Znakovi: zna gdje si bila, što si pisala ili s kim si razgovarala. Ne briši aplikacije i ne mijenjaj sve lozinke odjednom, jer ga to može upozoriti. Za pomoć koristi uređaj kojem on nema pristup, na primjer mobitel prijateljice ili računalo na poslu."),
        ("plan-bezbednosti", "danger", 10, "Ako si sada u opasnosti",
         "Ako možeš, prijeđi u prostoriju s izlazom, podalje od kuhinje i kupaonice. Drži mobitel uz sebe. Dogovori s nekim kome vjeruješ riječ koja znači „zovi policiju“. Dokumente, ključeve i lijekove drži na mjestu odakle ih brzo možeš uzeti."),
        ("znaci-upozorenja", "grooming", 10, "Kad netko na internetu nešto traži",
         "Budi oprezna ako netko koga poznaješ samo preko interneta traži da razgovor ostane tajna, šalje darove ili novac, traži slike ili te pritišće da se nađete. Nisi ti kriva. Možeš prekinuti razgovor i blokirati ga."),
        ("moje-slike", "grooming", 11, "Ako netko ima tvoje slike",
         "Ne plaćaj i ne šalji nove slike. Ako ti je telefon siguran, spremi poruke kao dokaz. Servisi Take It Down (za mlađe od 18 godina) i StopNCII (za starije) pomažu da se slike uklone s velikih mreža, a da ih nitko ne vidi."),
    ],
    "bs": [
        ("kontrola-telefona", "control", 10, "Ako ti neko prati telefon",
         "Znakovi: zna gdje si bila, šta si pisala ili s kim si razgovarala. Ne briši aplikacije i ne mijenjaj sve lozinke odjednom, jer ga to može upozoriti. Za pomoć koristi uređaj kojem on nema pristup, na primjer telefon prijateljice ili računar na poslu."),
        ("plan-bezbednosti", "danger", 10, "Ako si sada u opasnosti",
         "Ako možeš, pređi u prostoriju s izlazom, dalje od kuhinje i kupatila. Drži telefon uz sebe. Dogovori s nekim kome vjeruješ riječ koja znači „zovi policiju“. Dokumente, ključeve i lijekove drži na mjestu odakle ih brzo možeš uzeti."),
        ("znaci-upozorenja", "grooming", 10, "Kad neko na internetu traži nešto",
         "Budi oprezna ako neko koga poznaješ samo preko interneta traži da razgovor ostane tajna, šalje poklone ili novac, traži slike ili te pritišće da se nađete. Nisi ti kriva. Možeš prekinuti razgovor i blokirati ga."),
        ("moje-slike", "grooming", 11, "Ako neko ima tvoje slike",
         "Ne plaćaj i ne šalji nove slike. Ako ti je telefon siguran, sačuvaj poruke kao dokaz. Servisi Take It Down (za mlađe od 18 godina) i StopNCII (za starije) pomažu da se slike uklone s velikih mreža, a da ih niko ne vidi."),
    ],
    "cnr": [
        ("kontrola-telefona", "control", 10, "Ako ti neko prati telefon",
         "Znaci: zna gdje si bila, šta si pisala ili s kim si pričala. Ne briši aplikacije i ne mijenjaj sve lozinke odjednom, jer to može da ga upozori. Za pomoć koristi uređaj kojem on nema pristup, na primjer telefon prijateljice ili računar na poslu."),
        ("plan-bezbednosti", "danger", 10, "Ako si sada u opasnosti",
         "Ako možeš, pređi u prostoriju s izlazom, dalje od kuhinje i kupatila. Drži telefon uz sebe. Dogovori s nekim kome vjeruješ riječ koja znači „zovi policiju“. Dokumenta, ključeve i lijekove drži na mjestu odakle ih brzo uzimaš."),
        ("znaci-upozorenja", "grooming", 10, "Kad neko na internetu traži nešto",
         "Budi oprezna ako neko koga znaš samo preko interneta traži da razgovor ostane tajna, šalje poklone ili novac, traži slike ili te pritiska da se nađete. Nisi ti kriva. Možeš da prekineš razgovor i da ga blokiraš."),
        ("moje-slike", "grooming", 11, "Ako neko ima tvoje slike",
         "Ne plaćaj i ne šalji nove slike. Ako ti je telefon siguran, sačuvaj poruke kao dokaz. Servisi Take It Down (za mlađe od 18 godina) i StopNCII (za starije) pomažu da se slike uklone sa velikih mreža, a da ih niko ne vidi."),
    ],
    "sl": [
        ("kontrola-telefona", "control", 10, "Če ti nekdo spremlja telefon",
         "Znaki: ve, kje si bila, kaj si pisala ali s kom si se pogovarjala. Ne briši aplikacij in ne menjaj vseh gesel naenkrat, ker ga to lahko opozori. Za pomoč uporabi napravo, do katere on nima dostopa, na primer telefon prijateljice ali računalnik v službi."),
        ("plan-bezbednosti", "danger", 10, "Če si zdaj v nevarnosti",
         "Če lahko, pojdi v prostor z izhodom, stran od kuhinje in kopalnice. Telefon imej pri sebi. Z nekom, ki mu zaupaš, se dogovori za besedo, ki pomeni »pokliči policijo«. Dokumente, ključe in zdravila imej na mestu, od koder jih hitro vzameš."),
        ("znaci-upozorenja", "grooming", 10, "Ko nekdo na spletu nekaj zahteva",
         "Bodi previdna, če nekdo, ki ga poznaš samo prek spleta, zahteva, naj pogovor ostane skrivnost, pošilja darila ali denar, zahteva fotografije ali te pritiska, naj se dobita. Nisi ti kriva. Pogovor lahko prekineš in ga blokiraš."),
        ("moje-slike", "grooming", 11, "Če ima nekdo tvoje fotografije",
         "Ne plačuj in ne pošiljaj novih fotografij. Če je tvoj telefon varen, shrani sporočila kot dokaz. Storitvi Take It Down (za mlajše od 18 let) in StopNCII (za starejše) pomagata odstraniti slike z velikih omrežij, ne da bi jih kdo videl."),
    ],
    "mk": [
        ("kontrola-telefona", "control", 10, "Ако некој ти го следи телефонот",
         "Знаци: знае каде си била, што си пишувала или со кого си разговарала. Не ги бриши апликациите и не ги менувај сите лозинки одеднаш, бидејќи тоа може да го предупреди. За помош користи уред до кој тој нема пристап, на пример телефон на пријателка или компјутер на работа."),
        ("plan-bezbednosti", "danger", 10, "Ако си во опасност сега",
         "Ако можеш, префрли се во просторија со излез, подалеку од кујната и бањата. Држи го телефонот покрај себе. Договори се со некого на кого му веруваш за збор што значи „повикај полиција“. Документите, клучевите и лековите чувај ги на место од кое можеш брзо да ги земеш."),
        ("znaci-upozorenja", "grooming", 10, "Кога некој на интернет бара нешто",
         "Биди претпазлива ако некој што го познаваш само преку интернет бара разговорот да остане тајна, испраќа подароци или пари, бара слики или те притиска да се сретнете. Не си ти виновна. Можеш да го прекинеш разговорот и да го блокираш."),
        ("moje-slike", "grooming", 11, "Ако некој има твои слики",
         "Не плаќај и не испраќај нови слики. Ако телефонот ти е безбеден, зачувај ги пораките како доказ. Сервисите Take It Down (за помлади од 18 години) и StopNCII (за постари) помагаат сликите да се отстранат од големите мрежи, а никој да не ги гледа."),
    ],
    "sq": [
        ("kontrola-telefona", "control", 10, "Nëse dikush ta ndjek telefonin",
         "Shenja: ai e di ku ke qenë, çfarë ke shkruar ose me kë ke folur. Mos i fshi aplikacionet dhe mos i ndrysho të gjitha fjalëkalimet njëherësh, sepse kjo mund ta alarmojë. Për ndihmë përdor një pajisje që ai nuk e ka në dorë, për shembull telefonin e një shoqeje ose kompjuterin në punë."),
        ("plan-bezbednosti", "danger", 10, "Nëse je në rrezik tani",
         "Nëse mundesh, kalo në një dhomë me dalje, larg kuzhinës dhe banjës. Mbaje telefonin pranë vetes. Merru vesh me dikë të cilit i beson për një fjalë që do të thotë “thirr policinë”. Dokumentet, çelësat dhe ilaçet mbaji aty ku mund t'i marrësh shpejt."),
        ("znaci-upozorenja", "grooming", 10, "Kur dikush në internet kërkon diçka",
         "Ki kujdes nëse dikush që e njeh vetëm përmes internetit kërkon që biseda të mbetet sekret, dërgon dhurata ose para, kërkon fotografi ose të bën presion të takoheni. Nuk e ke ti fajin. Mund ta ndërpresësh bisedën dhe ta bllokosh."),
        ("moje-slike", "grooming", 11, "Nëse dikush ka fotografitë e tua",
         "Mos paguaj dhe mos dërgo fotografi të reja. Nëse telefoni yt është i sigurt, ruaji mesazhet si provë. Shërbimet Take It Down (për nën 18 vjeç) dhe StopNCII (për të rritur) ndihmojnë që fotografitë të hiqen nga rrjetet e mëdha, pa i parë askush."),
    ],
}


def seed(apps, schema_editor):
    HelpCard = apps.get_model("door", "HelpCard")
    HelpCard.objects.filter(slug="tvoj-telefon").update(topic="control")
    for language, cards in CARDS.items():
        for slug, topic, order, title, body in cards:
            HelpCard.objects.update_or_create(
                language=language,
                slug=slug,
                defaults={
                    "topic": topic,
                    "order": order,
                    "title": title,
                    "body": body,
                    "is_active": True,
                },
            )


def unseed(apps, schema_editor):
    HelpCard = apps.get_model("door", "HelpCard")
    slugs = {slug for cards in CARDS.values() for slug, *_ in cards}
    HelpCard.objects.filter(slug__in=slugs).delete()
    HelpCard.objects.filter(slug="tvoj-telefon").update(topic="general")


class Migration(migrations.Migration):
    dependencies = [("door", "0006_help_card_topic")]

    operations = [migrations.RunPython(seed, unseed)]
