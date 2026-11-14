import type { Locale } from "@/i18n/routing";

type Translation = {
  title: string;
  description: string;
  sections: [heading: string, paragraph: string][];
};

type Article = {
  slug: string;
  destination: string;
  uz: Translation;
  ru: Translation;
};

export const articles: Article[] = [
  {
    slug: "house-on-4-sotix", destination: "/loyihalar?sotix=4",
    uz: {
      title: "4 sotixga qanday uy loyihasi mos keladi?",
      description: "4 sotixli uchastkada uy, mashina joyi va hovli uchun joyni qanday taqsimlash mumkin?",
      sections: [
        ["Yerning enidan boshlang", "4 sotix — 400 m². 10 × 40 metrli va 16 × 25 metrli uchastkalarning maydoni bir xil, lekin birinchisiga enli uy rejasini joylashtirish qiyinroq. Katalogda avval sotix bo‘yicha saralang, keyin har bir loyihaning minimal eni va uzunligini o‘zingizdagi o‘lchamlar bilan taqqoslang."],
        ["Hovlida qoladigan joyni chizing", "Ko‘cha tarafga darvoza, mashina kirishi va piyoda yo‘lagini belgilang. Keyin terassa, bolalar o‘ynaydigan joy yoki bog‘ uchun ajratmoqchi bo‘lgan maydonni chizing. Oshxona va mehmonxonadan hovliga chiqish siz istagan joyga to‘g‘ri kelishini ham ko‘ring."],
        ["Qavatlar sonini rejaga qarab tanlang", "Bir qavatli variantda koridorlar va foydalanilmaydigan xonalarni kamaytirib ko‘ring. Agar kerakli xonalar hovlidan ortiqcha joy olsa, ikki qavatli loyihani solishtiring. Zinapoya ikkala qavatda egallaydigan joyni ham hisobga oling. Yakuniy joylashuvni uchastka chizmasi bilan arxitektorga tekshirtiring."],
      ],
    },
    ru: {
      title: "Какой проект дома подойдёт для 4 соток?",
      description: "Как распределить место между домом, парковкой и двором на участке площадью 4 сотки.",
      sections: [
        ["Начните с ширины участка", "Четыре сотки — это 400 м². Участки 10 × 40 и 16 × 25 метров равны по площади, но широкий дом сложнее разместить на первом. Отфильтруйте каталог по соткам, затем сравните минимальную ширину и длину участка для каждого проекта со своими размерами."],
        ["Нарисуйте двор, который хотите сохранить", "Отметьте ворота, въезд машины и пешеходную дорожку. Затем оставьте место под террасу, детскую зону или сад. Проверьте, удобно ли будет выходить во двор из кухни и гостиной и не пересекает ли маршрут к террасе парковку."],
        ["Сравните планы разной этажности", "В одноэтажном варианте посмотрите, можно ли сократить коридоры и отказаться от редко используемых помещений. Если нужные комнаты занимают слишком много двора, рассмотрите два этажа. Учтите место под лестницу на обоих уровнях и попросите архитектора проверить размещение дома по схеме участка."],
      ],
    },
  },
  {
    slug: "house-on-6-sotix", destination: "/loyihalar?sotix=6",
    uz: {
      title: "6 sotixga uy loyihasini qanday tanlash kerak?",
      description: "6 sotixli yerda xona soni, hovli, terassa va mashina joyini bir rejada solishtiring.",
      sections: [
        ["600 m² yerning shaklini tekshiring", "Masalan, 20 × 30 metr va 15 × 40 metr — ikkalasi ham 6 sotix. Darvoza qaysi tomonda bo‘lishi va uy hovliga qanday ochilishi esa turlicha. Arxitektorga beradigan sxemada ko‘cha, kirish, qo‘shni binolar va saqlanadigan daraxtlarni belgilang."],
        ["Oila uchun zarur xonalarni yozing", "Mehmonxona, kundalik oshxona, yotoqxonalar va sanuzellardan boshlang. Xizmat xonalari, kir yuvish va ombor uchun joyni ham belgilang. Mehmonlar yo‘li bilan oilaning yotoqxonalarga boradigan yo‘lini qavat rejasida alohida kuzating."],
        ["Ikki variantni bir xil talablar bilan baholang", "Bir va ikki qavatli loyihalarni bir xil yotoqxona soni bilan taqqoslang. Har birida terassa, mashina joyi va foydalaniladigan ochiq hovli qanchalik qulay qolishini chizing. Agar reja faqat hovlidan voz kechganda sig‘sa, kichikroq uy maydonini ham ko‘rib chiqing."],
      ],
    },
    ru: {
      title: "Как выбрать проект дома на 6 соток?",
      description: "Как сравнить планировки для участка 6 соток с учётом комнат, террасы, двора и парковки.",
      sections: [
        ["Уточните форму 600 м²", "Размеры 20 × 30 и 15 × 40 метров дают одинаковые шесть соток. При этом положение ворот меняет въезд и то, как дом выходит во двор. На схеме для архитектора отметьте улицу, вход, соседние постройки и деревья, которые хотите сохранить."],
        ["Запишите обязательные помещения", "Начните с гостиной, повседневной кухни, спален и санузлов. Добавьте постирочную, хозяйственное помещение и места хранения. Проследите по плану отдельно путь гостей из прихожей и путь семьи к спальням."],
        ["Оцените варианты по одинаковым требованиям", "Сравните одноэтажный и двухэтажный проекты с одинаковым числом спален. Для каждого отметьте место террасы, парковки и свободного двора. Если нужная планировка помещается только при отказе от двора, проверьте варианты с меньшей площадью дома."],
      ],
    },
  },
  {
    slug: "one-or-two-floors", destination: "/loyihalar",
    uz: {
      title: "Bir qavatli yoki ikki qavatli uy: qaysi biri qulay?",
      description: "Bir va ikki qavatli uy rejalarini hovli, zinapoya, kundalik harakat va qurilish smetasi bo‘yicha taqqoslang.",
      sections: [
        ["Kundalik yo‘nalishlarni tekshiring", "Bir qavatda yotoqxona, oshxona va hovli o‘rtasida zinapoyasiz yuriladi. Bu kichik bolali oilalar va zinadan foydalanishi qiyin kishilar uchun muhim. Ikki qavatli uy yoqsa, pastda yotoqxona va sanuzel bor variantni ham ko‘ring."],
        ["Hovli bilan bog‘lanishini solishtiring", "Bir xil uy maydonida ikki qavat yerda kamroq joy egallashi mumkin. Bo‘shagan joyni terassa yoki hovliga ajratish imkonini bosh rejada tekshiring. Keng bir qavatli uyda esa ko‘proq xonadan bevosita hovliga chiqish mumkin bo‘ladi."],
        ["Xarajatlarni bir xil hajmda hisoblang", "Bir qavatli variantda tom va poydevor maydoni kattaroq chiqishi mumkin. Ikki qavatli variantda qavatlararo yopma, zinapoya va balandlikdagi ishlar qo‘shiladi. Qaysi biri arzonga tushishini bilish uchun ikkala reja bo‘yicha bir xil pardoz va muhandislik tarkibida smeta so‘rang."],
      ],
    },
    ru: {
      title: "Одноэтажный или двухэтажный дом: что удобнее?",
      description: "Сравните этажность по площади двора, лестнице, повседневным маршрутам и составу сметы.",
      sections: [
        ["Проверьте повседневные маршруты", "На одном уровне можно пройти из спальни в кухню и выйти во двор без лестницы. Это важно для семей с маленькими детьми и людей, которым трудно подниматься по ступеням. Если нравится двухэтажный дом, рассмотрите вариант со спальней и санузлом внизу."],
        ["Посмотрите, как дом связан с двором", "При одинаковой общей площади двухэтажный дом может занимать меньше земли. На генплане проверьте, действительно ли освободившееся место удобно использовать под террасу или двор. У широкого одноэтажного дома проще предусмотреть выход во двор из нескольких помещений."],
        ["Запросите сопоставимые сметы", "У одноэтажного варианта могут быть больше площадь кровли и пятно фундамента. Для двухэтажного добавляются лестница, межэтажное перекрытие и высотные работы. Сравнивайте сметы с одинаковым набором инженерных систем и уровнем отделки."],
      ],
    },
  },
  {
    slug: "narrow-lot-house", destination: "/loyihalar?eni=15",
    uz: {
      title: "Tor yerga uy loyihasi: nimalarni tekshirish kerak?",
      description: "Tor uchastkada uy eni, mashina kirishi, tabiiy yorug‘lik va ichki hovlini qanday rejalashtirish mumkin.",
      sections: [
        ["Faqat ko‘cha tarafdagi en bilan cheklanmang", "Yer oldi va orqa qismining enini, yon chegaralari uzunligini va qiyaliklarni belgilang. Kadastr chizmasini amaldagi holat bilan solishtirish uchun arxitektorga bering. Minimal yer eni katalogdagi dastlabki saralash mezoni bo‘lib xizmat qiladi."],
        ["Uzun koridor o‘rniga xonalarni guruhlang", "Kirishga yaqin joyda mehmon zonasi va sanuzelni, tinchroq qismda yotoqxonalarni ko‘rib chiqing. Oshxona va ovqatlanish xonasini bir-biriga yaqin qo‘yish ortiqcha yurishni kamaytiradi. Eshiklar ochilganda yo‘lak va mebel joyi torayib qolmasligini chizmada tekshiring."],
        ["Yon derazalarga bog‘lanib qolmang", "Qo‘shni devor yaqin bo‘lsa, ko‘cha, orqa hovli yoki ichki hovliga qaragan derazali rejalarni solishtiring. Darvoza va mashina joyini ham shu sxemaga qo‘shing. Uy sig‘sa ham, mashinadan tushish va hovliga piyoda o‘tish uchun qulay yo‘l qolishi kerak."],
      ],
    },
    ru: {
      title: "Проект дома для узкого участка: что проверить?",
      description: "Как учесть ширину участка, въезд, естественный свет и двор при выборе проекта узкого дома.",
      sections: [
        ["Измерьте участок в нескольких местах", "Запишите ширину спереди и сзади, длину боковых границ и перепады высот. Передайте архитектору кадастровую схему и фактические замеры. Минимальная ширина из карточки проекта подходит для предварительного отбора."],
        ["Группируйте комнаты по назначению", "Рядом со входом удобно проверить вариант с гостевой зоной и санузлом, в тихой части — со спальнями. Близкое расположение кухни и столовой сокращает лишние маршруты. Проверьте на плане, останется ли место для прохода и мебели при открытых дверях."],
        ["Проверьте источники света и въезд", "Если рядом проходит соседняя стена, сравните планировки с окнами на улицу, задний или внутренний двор. Добавьте к схеме ворота и парковку. Когда дом помещается по ширине, отдельно убедитесь, что есть место открыть двери машины и пройти во двор."],
      ],
    },
  },
  {
    slug: "cost-to-build-a-house", destination: "/browse/cost",
    uz: {
      title: "Uy qurish qancha turadi va smeta qanday tuziladi?",
      description: "Uy qurish xarajatini kvadrat metr narxidan boshlab, ishlar va materiallar bo‘yicha qanday aniqlashtirish mumkin?",
      sections: [
        ["Bir xil tarkibdagi takliflarni solishtiring", "Quruvchi aytgan 1 m² narxini uy maydoniga ko‘paytirib dastlabki hisob chiqaring. Masalan, 180 m² loyiha uchun 1 m² bo‘yicha yozma taklifni 180 ga ko‘paytiring. Bu hisobni solishtirishdan oldin narx karkas uchunmi yoki muhandislik va pardozni ham qamrab olishini yozma aniqlang."],
        ["Smetani ish bosqichlariga bo‘ling", "Yer ishlari va poydevor, devor va tom, oyna-eshiklar, elektr va suv, isitish va pardoz xarajatlarini alohida yozing. Material, ish haqi hamda yetkazib berish kim hisobidan bo‘lishini so‘rang. Darvoza, hovli va tarmoqlarga ulanish xarajatlari ham alohida band bo‘lishi mumkin."],
        ["Loyiha narxini alohida qoldiring", "Castler katalogida ko‘rsatilgan narx loyiha hujjatlari uchun. Qurilish hisobida loyiha, moslashtirish va qurilish ishlari alohida bandlarda tursa, ikki taklifni tushunish osonlashadi. Uchastka tekshirilgach, miqdorlar va narxlarni yangilang."],
      ],
    },
    ru: {
      title: "Сколько стоит построить дом и как составить смету?",
      description: "Как перейти от цены за квадратный метр к смете по этапам работ, материалам и комплектации.",
      sections: [
        ["Сравнивайте предложения одинакового состава", "Для первичной оценки умножьте ставку подрядчика за квадратный метр на площадь дома. Например, для проекта 180 м² умножьте письменно предложенную ставку на 180. Уточните, относится ли она к коробке или также включает инженерные сети и отделку."],
        ["Разложите смету по этапам", "Выделите земляные работы и фундамент, стены и кровлю, окна и двери, электрику и воду, отопление и отделку. Уточните, кто оплачивает закупку и доставку материалов. Ворота, благоустройство и подключение к сетям могут учитываться отдельно."],
        ["Отделите документацию от стройки", "Цена в каталоге Castler относится к комплекту проекта. Указывайте документацию, адаптацию и строительство отдельными строками, чтобы было проще сравнить предложения. После осмотра участка обновите объёмы и цены."],
      ],
    },
  },
  {
    slug: "what-is-in-a-house-plan", destination: "/loyihalar",
    uz: {
      title: "Tayyor uy loyihasi tarkibiga nimalar kiradi?",
      description: "Qavat rejasi, fasad, kesim, konstruktiv va muhandislik chizmalarini sotib olishdan oldin tekshiring.",
      sections: [
        ["Arxitektura chizmalaridan boshlang", "Qavat rejalarida xonalar, eshik va derazalar hamda asosiy o‘lchamlar ko‘rinadi. Fasad tashqi ko‘rinishni, kesim esa balandlik va qavatlar orasidagi bog‘lanishni tushuntiradi. Bosh reja uyning uchastkaga qanday joylashishini ko‘rib chiqish uchun kerak."],
        ["Konstruktiv va muhandislik bo‘limlarini so‘rang", "Poydevor, karkas, yopmalar va tom bo‘yicha qanday chizmalar berilishini tekshiring. Elektr, suv, kanalizatsiya va isitish uchun alohida varaqlar borligini so‘rang. Namuna ro‘yxatni quruvchiga ko‘rsating: u smeta qilish uchun qaysi ma’lumotlar yetishmayotganini aytishi mumkin."],
        ["Tanlangan loyiha bo‘yicha tarkibni tasdiqlang", "Katalogdan loyiha raqamini yozib oling va aynan shu to‘plamga tegishli varaq ro‘yxatini so‘rang. Uchastka, kommunikatsiyalar yoki gruntga bog‘liq moslashtirishlarni oldindan aniqlang. Chizmalar qanday formatda berilishi va o‘zgartirishlar alohida hisoblanishini ham kelishib oling."],
      ],
    },
    ru: {
      title: "Что входит в готовый проект частного дома?",
      description: "Что проверить в комплекте проекта: поэтажные планы, фасады, разрезы, конструктивные и инженерные чертежи.",
      sections: [
        ["Начните с архитектурных чертежей", "На поэтажных планах видны помещения, двери, окна и основные размеры. Фасады показывают внешний вид, а разрезы помогают понять высоты и связь этажей. Генплан помогает проверить, как дом размещается на участке."],
        ["Уточните конструктивную и инженерную части", "Спросите, какие чертежи фундамента, каркаса, перекрытий и кровли выдаются. Проверьте наличие отдельных листов по электрике, воде, канализации и отоплению. Покажите перечень подрядчику и узнайте, достаточно ли данных для сметы."],
        ["Подтвердите состав конкретного комплекта", "Запишите номер проекта и запросите список листов именно для него. Уточните адаптацию под участок, грунт и точки подключения сетей. Заранее согласуйте формат выдачи файлов и отдельно оцените возможные изменения."],
      ],
    },
  },
  {
    slug: "ready-made-or-custom-project", destination: "/browse/consult",
    uz: {
      title: "Tayyor loyiha yoki individual loyiha: qaysi birini tanlash kerak?",
      description: "Uchastka, oila ehtiyoji va kerakli o‘zgarishlarga qarab tayyor va individual loyiha orasida tanlang.",
      sections: [
        ["Tayyor loyiha qachon qulay?", "Kerakli xonalar, qavatlar soni va uy shakli katalogdagi variantga yaqin bo‘lsa, tayyor reja bilan tezroq tanishasiz. Fasadni, qavat rejalarini va minimal yer o‘lchamini birga ko‘ring. O‘zgartirishlar ro‘yxatini yozib, ularning hajmini arxitektor bilan baholang."],
        ["Individual reja qachon ma’qul?", "Uchastka notekis, kirish tomoni noodatiy yoki oila uchun alohida yashash zonalari zarur bo‘lsa, tayyor variant ko‘p o‘zgartirish talab qilishi mumkin. Chiroyli fasadga qarab qaror qilmang: asosiy xonalar, konstruksiya va uy joylashuvi qayta ishlansa, individual variantni ham so‘rang."],
        ["Umumiy xarajat va muddatni taqqoslang", "Tayyor hujjatlar, moslashtirish, qo‘shimcha chizmalar va topshirish muddatini bitta ro‘yxatda solishtiring. Individual loyihada nechta variant va tahrir ko‘zda tutilganini aniqlang. Shunda ikkala taklifda bir xil darajadagi natijani baholaysiz."],
      ],
    },
    ru: {
      title: "Готовый или индивидуальный проект дома: что выбрать?",
      description: "Когда подойдёт типовая планировка, а когда особенности участка и семьи требуют индивидуального проекта.",
      sections: [
        ["Когда удобен готовый проект", "Если состав комнат, этажность и форма дома близки к варианту из каталога, готовые чертежи помогают быстрее оценить идею. Посмотрите фасады, поэтажные планы и минимальные размеры участка вместе. Запишите желаемые изменения и обсудите их масштаб с архитектором."],
        ["Когда рассмотреть индивидуальную разработку", "На участке со сложным рельефом или необычным въездом, а также при необходимости отдельных зон для двух семей типовой вариант может потребовать серьёзной переработки. Если предстоит менять основные помещения, конструкцию и посадку дома, запросите также предложение на проект с нуля."],
        ["Сравните полный объём и сроки", "Сложите стоимость готового комплекта, адаптации и дополнительных листов. В индивидуальном предложении уточните количество вариантов и этапы согласования. Сравнивайте два пути с одинаковым составом итоговой документации."],
      ],
    },
  },
  {
    slug: "measure-your-plot", destination: "/loyihalar",
    uz: {
      title: "Uy loyihasini tanlash uchun yerni qanday o‘lchash kerak?",
      description: "Loyihani tekshirish uchun uchastka eni, uzunligi, ko‘cha tomoni va boshqa ma’lumotlarni tayyorlang.",
      sections: [
        ["O‘lchamlarni bir sxemaga yozing", "To‘rtburchak yerda en va uzunlikni yozing. Shakl murakkab bo‘lsa, har bir chegara uzunligini, burilishlarni va eng tor joyni alohida belgilang. Sotix bilan birga o‘lchamlarni metrda yuboring: bir xil maydondagi ikki yerning shakli keskin farq qilishi mumkin."],
        ["Uyga ta’sir qiladigan narsalarni belgilang", "Ko‘cha va darvoza joyi, mavjud qurilmalar, daraxtlar, suv va elektr kiradigan tomonlarni chizing. Qiyalikni, qo‘shni binolar va hovlining quyosh tushadigan qismini rasmlarda ko‘rsating. Fotosurat qaysi tomonga qarab olinganini yozib qo‘ying."],
        ["Loyiha bilan solishtiring", "Katalogdagi minimal en va uzunlik dastlab mos kelmaydigan variantlarni chiqarishga yordam beradi. Keyin arxitektordan uy, kirish va hovli aynan sizning yer chizmangizda qanday joylashishini tekshirtiring. Chegaralar yoki balandliklar aniq bo‘lmasa, yakuniy qarordan oldin o‘lchovni aniqlashtiring."],
      ],
    },
    ru: {
      title: "Как измерить участок перед выбором проекта дома?",
      description: "Какие размеры, фотографии и сведения об участке подготовить для проверки проекта.",
      sections: [
        ["Запишите размеры на одной схеме", "У прямоугольного участка укажите ширину и длину. Для сложной формы подпишите длины сторон и обозначьте выступы и самое узкое место. Сообщите размеры в метрах вместе с площадью в сотках: одинаковая площадь не гарантирует одинаковую форму."],
        ["Добавьте всё, что влияет на размещение дома", "Отметьте улицу, место ворот, существующие постройки, деревья и стороны подключения воды и электричества. На фотографиях покажите уклон, соседние здания и солнечные зоны двора. Подпишите направление съёмки."],
        ["Сверьте схему с требованиями проекта", "Минимальная ширина и длина из каталога помогают отсеять неподходящие варианты. Попросите архитектора проверить дом, въезд и двор на схеме вашего участка. Если границы или высотные отметки неясны, уточните замеры до окончательного выбора."],
      ],
    },
  },
  {
    slug: "courtyard-house-plan", destination: "/loyihalar",
    uz: {
      title: "Ichki hovlili uy loyihasini qanday tanlash kerak?",
      description: "Ichki hovlini tanlashda xonalar yo‘nalishi, maxfiylik, soya va kundalik foydalanishni tekshiring.",
      sections: [
        ["Hovlining vazifasini belgilang", "Oilaviy ovqatlanish kerak bo‘lsa, oshxona va terassa orasida qulay yo‘l bo‘lsin. Bolalar o‘ynaydigan joy bo‘lsa, uni tez-tez foydalaniladigan xonadan ko‘rish muhim. Mehmonlar uchun hovlida o‘tirish joyi rejalashtirilsa, kirish yo‘li yotoqxonalar yonidan o‘tmasligini tekshiring."],
        ["Quyosh va ko‘rinishni birga ko‘ring", "Baland devorlar hovlini ko‘zdan yashiradi va soya beradi, ammo ba’zi xonalarga yorug‘lik kirishini cheklashi mumkin. Arxitektordan hovli va derazalarning quyoshga qaratilishini tekshirtiring. Yashash xonasidan hovliga qanday manzara ochilishini ham qavat rejasida ko‘ring."],
        ["Xizmat yo‘llari uchun joy qoldiring", "Oshxona yonida xizmat chiqishi, saqlash joyi, yomg‘ir suvi yo‘li va hovliga qarash uchun kirish qayerda bo‘lishini muhokama qiling. Hovli suratda chiroyli ko‘rinsa ham, uning o‘lchamini stol, yo‘lak va o‘simliklar bilan chizmada sinab ko‘ring."],
      ],
    },
    ru: {
      title: "Как выбрать проект дома с внутренним двором?",
      description: "Что проверить в доме с внутренним двором: маршруты, приватность, тень и повседневное использование.",
      sections: [
        ["Определите назначение двора", "Для семейных обедов важен удобный выход из кухни на террасу. Детскую зону полезно видеть из помещения, которым часто пользуются взрослые. Если двор предназначен для приёма гостей, проверьте, что маршрут от входа не проходит мимо дверей спален."],
        ["Посмотрите на свет и приватность вместе", "Высокие стены закрывают двор от взглядов и дают тень, но могут уменьшить освещённость прилегающих комнат. Попросите архитектора проверить ориентацию двора и окон. Посмотрите по планировке, на какую часть двора выходят окна гостиной."],
        ["Оставьте место для обслуживания", "Обсудите хозяйственный выход, хранение, отвод дождевой воды и доступ для ухода за двором. Расставьте на схеме стол, дорожки и растения. Так проще понять, достаточно ли места для выбранного сценария."],
      ],
    },
  },
  {
    slug: "before-building-checklist", destination: "/browse/consult",
    uz: {
      title: "Uy qurishni nimadan boshlash kerak? Amaliy ro‘yxat",
      description: "Uchastka ma’lumotlari, oilaviy talablar, loyiha va smetani qurilishdan oldin qanday tartibga solish mumkin.",
      sections: [
        ["Uchastka va oilaviy talablarni tayyorlang", "Yer chizmasi, o‘lchamlari, ko‘cha tomoni va fotosuratlarini bir joyga yig‘ing. Oila uchun majburiy xonalarni, keyin esa imkon bo‘lsa qo‘shiladigan xonalarni yozing. Hovli, mashina va terassa joyi haqida ham qaror qiling."],
        ["Qavat rejalarini ko‘rib loyiha tanlang", "Katalogdan ikki yoki uchta variant olib, qoladigan hovli, kirish yo‘li va kundalik harakat bo‘yicha solishtiring. Yoqtirgan loyiha raqamini arxitektorga ayting va moslashtirish kerak bo‘ladigan joylarni yozib bering. Qaysi hujjatlar taqdim etilishini tasdiqlang."],
        ["Quruvchidan bosqichma-bosqich taklif oling", "Bir xil chizmalarni bir nechta quruvchiga berib, ishlar, materiallar va muddatlar bo‘yicha taklif so‘rang. Uchastka va qurilish turi uchun amaldagi rasmiy talablarni mutaxassis bilan aniqlashtiring. Ish boshlanishidan oldin keyingi o‘zgarishlarni kim tasdiqlashi va qanday hisoblanishini kelishib oling."],
      ],
    },
    ru: {
      title: "С чего начать строительство частного дома? Чек-лист",
      description: "Как подготовить данные участка, требования семьи, проект и смету до начала стройки.",
      sections: [
        ["Соберите данные об участке и требования семьи", "Сложите вместе схему, размеры, положение улицы и фотографии. Выпишите обязательные помещения отдельно от тех, которые можно добавить при наличии места. Решите, сколько двора нужно сохранить для парковки, террасы и отдыха."],
        ["Выбирайте проект по планировке", "Возьмите два-три варианта из каталога и сравните оставшийся двор, вход и повседневные маршруты. Сообщите архитектору номер понравившегося проекта и список изменений. Подтвердите, какие чертежи будут переданы."],
        ["Запросите предложение по этапам работ", "Передайте одинаковый комплект чертежей нескольким подрядчикам и запросите цену работ, материалов и сроки. Уточните с профильным специалистом действующие требования для вашего участка и дома. До начала работ согласуйте, кто утверждает изменения и как пересчитывается стоимость."],
      ],
    },
  },
];

export const blogPath = (slug?: string) => slug ? `/blog/${slug}` : "/blog";
export const articlePath = (locale: Locale, slug?: string) => `/${locale}${blogPath(slug)}`;
