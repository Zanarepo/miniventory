import { UserPlus, Package, ShoppingCart, Receipt, TrendingUp } from 'lucide-react';
import type { GuideDictionary } from './types';

export const GUIDE_DATA: GuideDictionary = {
  en: {
    eyebrow: 'Step-by-Step Guide',
    heading: 'How to make Miniventory work for your shop',
    subheading:
      'Simple instructions for every daily business task - no computer or accounting training required.',
    proTipHeader: 'Pro Tip',
    pillars: [
      {
        tabName: 'Account Setup',
        badge: '1-Minute Registration',
        headline: 'Open your secure digital shop account in less than one minute',
        accent: '#22d3ee', // Cyan
        icon: UserPlus,
        ctaText: 'Open Free Account Now',
        steps: [
          {
            title: '1. Register Quickly',
            desc: 'Enter your phone number or email and choose a simple, secure password or PIN to protect your account.',
          },
          {
            title: '2. Name Your Shop',
            desc: 'Type your shop name and select your type of business (Supermarket, Pharmacy, Fashion, Provision store, etc.).',
          },
          {
            title: '3. Pick Your Currency',
            desc: 'Choose your money symbol (Naira ₦, Dollars $, or Cedis ₵). Once saved, your live dashboard opens immediately!',
          },
        ],
        proTip:
          'Your account login details safely protect your shop data. You can log into your account from any smartphone, tablet, or laptop at any time!',
      },
      {
        tabName: 'Stock & Inventory',
        badge: 'Track Every Item',
        headline: 'Know what is inside your shop at all times and avoid stockouts',
        accent: '#2dd4bf', // Teal
        icon: Package,
        ctaText: 'Start Adding Stock',
        steps: [
          {
            title: '1. Tap Add Product',
            desc: 'Go to your inventory tab on the menu and click the "Add Product" or "New Item" button.',
          },
          {
            title: '2. Enter Simple Details',
            desc: 'Type the item name, how much you bought it (Cost Price), and how much you are selling it (Selling Price).',
          },
          {
            title: '3. Enter Your Quantity',
            desc: 'Type how many pieces, dozens, or cartons you currently have on your shelf and click Save.',
          },
        ],
        proTip:
          'Miniventory watches your shelves automatically! When an item is running out, it displays a clear low stock warning so you can buy more before customers come.',
      },
      {
        tabName: 'Sales & Receipts',
        badge: '10-Second Checkout',
        headline: 'Record any customer payment in seconds and share digital receipts',
        accent: '#f4b740', // Gold
        icon: ShoppingCart,
        ctaText: 'Try Recording a Sale',
        steps: [
          {
            title: '1. Tap Record Sale',
            desc: 'Select the items the customer wants to buy, or type a quick direct price for custom items and services.',
          },
          {
            title: '2. Choose How They Paid',
            desc: 'Select Cash, POS Terminal, Bank Transfer, or Mobile Money. You can even combine methods with Split Payment!',
          },
          {
            title: '3. Track Credit & Debt',
            desc: 'If a customer does not pay full money and promises to pay later, select their name to save a pending balance reminder.',
          },
        ],
        proTip:
          'Generate a neat digital receipt instantly! Send it directly to your customer on WhatsApp or print it using a Bluetooth thermal printer right in your shop.',
      },
      {
        tabName: 'Shop Expenses',
        badge: 'Stop Hidden Costs',
        headline: 'Write down every money that goes out so spending never eats your profit',
        accent: '#fb7185', // Rose
        icon: Receipt,
        ctaText: 'Start Tracking Expenses',
        steps: [
          {
            title: '1. Open Expenses Tab',
            desc: 'Tap on "Expenses" in your app navigation menu and click the "Record Expense" button.',
          },
          {
            title: '2. Type What You Paid For',
            desc: 'Enter what the money was used for - like generator fuel, shop rent, transport, repairs, or cleaning - and type the amount.',
          },
          {
            title: '3. Mark Payment Source',
            desc: 'Select whether the money came directly out of your shop cash box, bank transfer, or card and save it.',
          },
        ],
        proTip:
          'Writing down all daily shop spending helps you clearly separate incoming revenue from your true net profit at the end of every day!',
      },
      {
        tabName: 'Profit & Loss',
        badge: 'Automatic Math',
        headline: 'See your real profit instantly - zero accounting knowledge needed',
        accent: '#a3e635', // Emerald / Lime
        icon: TrendingUp,
        ctaText: 'See Live Dashboard',
        steps: [
          {
            title: '1. Open Your Dashboard',
            desc: 'Go to your Dashboard or Reports page anytime to see your actual business numbers clearly.',
          },
          {
            title: '2. See True Net Profit',
            desc: 'Miniventory does all the math for you automatically, subtracting what you bought and your shop expenses from your total sales.',
          },
          {
            title: '3. Understand Your Business',
            desc: 'Check clean daily, weekly, and monthly summaries to see which items bring the biggest money and which days perform best.',
          },
        ],
        proTip:
          'No accounting school or calculator needed! Your sales revenue and profit charts update instantly every time a sale or expense is recorded.',
      },
    ],
  },
  pid: {
    eyebrow: 'Step-by-Step Guide',
    heading: 'How to use Miniventory manage your shop smoothly',
    subheading:
      'Simple simple steps for your daily shop work - nobody need degree or computer school to use am.',
    proTipHeader: 'Pro Advice',
    pillars: [
      {
        tabName: 'Open Account',
        badge: '1-Minute Setup',
        headline: 'Open your online shop account in less than one minute, sharp sharp',
        accent: '#22d3ee',
        icon: UserPlus,
        ctaText: 'Open Your Free Account Now',
        steps: [
          {
            title: '1. Register Sharp Sharp',
            desc: 'Put your phone number or email and enter password or PIN wey you remember to lock your account well well.',
          },
          {
            title: '2. Write Your Shop Name',
            desc: 'Write the name of your shop and pick the kind business you dey run (Supermarket, Pharmacy, Boutique, or Provision store).',
          },
          {
            title: '3. Choose Your Currency',
            desc: 'Pick your money sign (Naira ₦, Dollars $, or Cedis ₵). As you save am, your shop dashboard go open immediately!',
          },
        ],
        proTip:
          'Your account login password dey lock your data safely! You fit open your dashboard from any mobile phone, iPad, or computer anytime you want!',
      },
      {
        tabName: 'Shop Stock (Inventory)',
        badge: 'Track All Your Goods',
        headline: 'Know wetin dey inside your shop anytime so market no go surprise finish',
        accent: '#2dd4bf',
        icon: Package,
        ctaText: 'Start Adding Stock',
        steps: [
          {
            title: '1. Tap Add Product',
            desc: 'Go to your inventory inside menu and click the button wey call "Add Product" or "New Item".',
          },
          {
            title: '2. Put Simple Price Details',
            desc: 'Write the name of the load, how much you buy am from supplier (Cost Price), and how much you wan sell am (Selling Price).',
          },
          {
            title: '3. Put Quantity Wey Dey',
            desc: 'Write how many pieces or cartons you hold inside shop right now and click Save.',
          },
        ],
        proTip:
          'Miniventory dey monitor your shelves naturally! If any good dey reach to finish, app go alert you so you fit restock before customers arrive.',
      },
      {
        tabName: 'Sales & Receipt',
        badge: '10-Second Checkout',
        headline: 'Record customer payment inside seconds and give them WhatsApp receipt',
        accent: '#f4b740',
        icon: ShoppingCart,
        ctaText: 'Try Recording a Sale',
        steps: [
          {
            title: '1. Tap Record Sale',
            desc: 'Select the items wey customer dey buy, or enter direct money amount for special works and services.',
          },
          {
            title: '2. Choose How Dem Pay',
            desc: 'Select Cash, POS Terminal, Bank Transfer, or Mobile Money. You fit even do Split Payment if customer pay half cash half transfer!',
          },
          {
            title: '3. Track Gbese (Credit & Debt)',
            desc: 'If customer no pay full money and beg to pay later, attach dem name to record pending balance reminder so you no go forget.',
          },
        ],
        proTip:
          'Generate clean digital receipt instantly! Send am straight to customer WhatsApp or print am with Bluetooth thermal printer inside your shop.',
      },
      {
        tabName: 'Shop Expenses',
        badge: 'Catch Hidden Spending',
        headline: 'Write down every money wey comot so small small spending no go eat your profit',
        accent: '#fb7185',
        icon: Receipt,
        ctaText: 'Start Tracking Expenses',
        steps: [
          {
            title: '1. Open Expenses Tab',
            desc: 'Touch "Expenses" button for menu and click on top the "Record Expense" button.',
          },
          {
            title: '2. Write Wetin You Pay For',
            desc: 'Enter wetin you use money do - like gen fuel, shop rent, transport, repairs, or cleaning worker - and enter the amount.',
          },
          {
            title: '3. Select How You Pay',
            desc: 'Select whether the money comot from your shop cash drawer or bank transfer and click save.',
          },
        ],
        proTip:
          'When you record all shop spending every day, e go help you clearly see your correct pure profit instead of confusing gross sales money!',
      },
      {
        tabName: 'Profit & Loss (P&L)',
        badge: 'Automatic Calculation',
        headline: 'See your correct gain immediately - you no need calculator or accounting degree',
        accent: '#a3e635',
        icon: TrendingUp,
        ctaText: 'See Live Dashboard',
        steps: [
          {
            title: '1. Open Your Dashboard',
            desc: 'Enter your Dashboard or Reports page anytime to inspect your correct daily business numbers.',
          },
          {
            title: '2. See Pure Take-Home Profit',
            desc: 'Miniventory go do all the calculation by itself, subtracting your stock expenses and shop costs from your total sales.',
          },
          {
            title: '3. Know Your Best Market',
            desc: 'Inspect clean daily, weekly, or monthly records to know which item dey bring the biggest gain for your shop.',
          },
        ],
        proTip:
          'You no need calculator! As you dey enter sales or expenses, your profit dashboard go dey calculate and update automatically.',
      },
    ],
  },
  ha: {
    eyebrow: 'Jagoran Mataki-ba-Mataki',
    heading: 'Yadda za ku yi amfani da Miniventory a kantin ku',
    subheading:
      'Hanyoyi masu sauƙi don sarrafa kudin shago - ba sai ku na da karatun lissafin asusu ba.',
    proTipHeader: 'Shawara ko Sako',
    pillars: [
      {
        tabName: 'Buɗe Asusun Ku',
        badge: 'Aiki Na minti Kaji',
        headline: 'Buɗe asusun shagon ku cikin ƙasa da minti ɗaya',
        accent: '#22d3ee',
        icon: UserPlus,
        ctaText: 'Buɗe Asusu Kyauta Yanzu',
        steps: [
          {
            title: '1. yi Regista Cikin Sauri',
            desc: 'Sanya lambar wayarka ko ta imel dinka sannan ka zaɓi kalmar sirri ko PIN don ba da kariya ga asuswanku.',
          },
          {
            title: '2. rubuta Sunan Shagonka',
            desc: 'Rubuta sunan shagonka, kabeen kasuwanci na Ka (Kaman kantin abinci, Magani, ko Kaya sai daawa).',
          },
          {
            title: '3. zabi nauyin kudinka',
            desc: 'Zabeni alamar kudinka (kamar Naira ₦, ko Dalla $). Da zarar ka adana, dashboard dinka na budewa!',
          },
        ],
        proTip:
          'Bayanan shiga suna ba ku cikakken tsare duk wata sarrafa kasuwancinku. Za ku iya bude dashboard naku a duk wayar salula ko naurar kwamfuta!',
      },
      {
        tabName: 'Sarrafa Kayayyaki',
        badge: 'sanya kaya',
        headline: 'Kuma sani duk abin da ke kanku ko cikin shagoginku a kowani lokaci',
        accent: '#2dd4bf',
        icon: Package,
        ctaText: 'Fara Sanya Kaya',
        steps: [
          {
            title: '1. danna Add Product',
            desc: 'shiga shafin sarrafa kayayyaki a menu ku danna alamar "Add Product" ko "New Item".',
          },
          {
            title: '2. saka kudin kaya',
            desc: 'shigar da sunan kaya, kudin da ku ke sowa, da kudin da za ku sayar dashi don riba.',
          },
          {
            title: '3. shigar da yawadinka',
            desc: 'sanya yawa ko cartons nawa ke cikin shago a yanzu kaza sanna ka danna adanawa.',
          },
        ],
        proTip:
          'Miniventory na sanya ido ga kayan shagoginku! duk lokacin da kaya suka kusa karewa, yana faɗake ku kafin abokan cinniki su zo.',
      },
      {
        tabName: 'Siyarwa da Risiini',
        badge: 'Saitawwar 10 sako',
        headline: 'Yi cajin ciniki ko sarrafa rasikin kwastomomi na dijital nan take',
        accent: '#f4b740',
        icon: ShoppingCart,
        ctaText: 'Gwada yi wata Siyarwa',
        steps: [
          {
            title: '1. Danna Record Sale',
            desc: 'zaɓi Kayan da Kwastoman zai saya, ko ku sanya haradin ƙai-tsaye don waƙai ko wanki.',
          },
          {
            title: '2. Zaɓi Hanyar Biya',
            desc: 'Zabi tsare tsari (TSABA HANNU, POS, canja wuri Banki ko Moni tafi. kuna iya biya dabam dabam kaman Raba-Biya!',
          },
          {
            title: '3. Tsari basar ciniki',
            desc: 'idan kwastomom ba ya ci cikina dika kudinsa sanye sunansa za ku san mai bin ku bashin sako.',
          },
        ],
        proTip:
          'aiko da Risiini na yanar gizo nan da nan! za a aiko a shafi na WhatsApp na kwastomomi ko ku buga da abun bugo bluetooth.',
      },
      {
        tabName: 'Kudaden Kasheyin Shago',
        badge: 'Tsatar Kuɓi',
        headline: 'Rubuta duk wasiƙu kasheyin kuɓin shago domin ku kiyaye ribarku',
        accent: '#fb7185',
        icon: Receipt,
        ctaText: 'Fara Bincike da Kashi',
        steps: [
          {
            title: '1. Shiga Expenses Tab',
            desc: 'Danna katin "Expenses" daga jerin zaɓen menu ku kuma danna alamar "Record Expense".',
          },
          {
            title: '2. Saka irin kudin da akayi ko kashshe',
            desc: 'Rubuta abin da ke bukata kamar Man Janareta, kudin hayar shagogi, sufuri ko ayyukan gyare gyaren.',
          },
          {
            title: '3. Zaɓi Hanyar Kashi',
            desc: 'sanya kudin a matsayin wanda a kwashe daga Aljuhun Shago ko canzawa ku danna tsara.',
          },
        ],
        proTip:
          'sarrafa duk lissafi kullum ze temaka a tsayar tsayayya na kudaden kanku maras bambancin riba na gaske da kudaden tsaye!',
      },
      {
        tabName: 'Riba ko Asara',
        badge: 'Lissafin kai-da-kai',
        headline: 'Duba ainhina riba ta kaske ko faɗake ba tare da karatun Akanta ba',
        accent: '#a3e635',
        icon: TrendingUp,
        ctaText: 'Duba kofar Dashboard',
        steps: [
          {
            title: '1. bude Shafin Dashboard naku',
            desc: 'Bude Dashboard koo Sashen rahotanni a koda yaushe don kalle ainin hakan sarrafawarka.',
          },
          {
            title: '2. Kalle Cikin Ribarku',
            desc: 'Miniventory yana lissafa duk wasikar kai tsaye kuma zai rage kudaden da aka kashe wanke da Ribanku.',
          },
          {
            title: '3. Gane Shagawarku sosaitci',
            desc: 'Bincike lissafi na kullum ko wata, kuma za ku ga wacce kaya ce ke kawo kuɓi mai yawan kyau karshe.',
          },
        ],
        proTip:
          'Ba sai ka na da naurar lissafi ba! Ko wane dare lokacin siyarwa tare da rahotanninku suna canja kansu nan ta-nan a shafi.',
      },
    ],
  },
  ig: {
    eyebrow: 'Usoro Nke Ntuziaka',
    heading: 'Otu i ga esi mee ka Miniventory rụọ ọrụ na ụlọ ahịa gị',
    subheading:
      'Usoro dị mfe maka ịchịkwa ahịa gị kila ụbọchị - achọghị mmụta mahadum gbasara akaụntụ.',
    proTipHeader: 'Nkwado Maka Ahịa',
    pillars: [
      {
        tabName: 'Mepee Akaụntụ',
        badge: 'Mmebere na Mpekitu 1',
        headline: 'Mepefe akaụntụ ahịa dijitalụ gị na mpekitu dị nso gburugburu',
        accent: '#22d3ee',
        icon: UserPlus,
        ctaText: 'Mepefe Akaụntụ Ebe Aka',
        steps: [
          {
            title: '1. Debanye Aha Ngwa-Ngwa',
            desc: 'Dejupụta akara ekwentị gị ma ọ bụ ozi kọfị dọsụrị ka I kpokoroba paswọd ma ọ bụ PIN nke gị chebe ya.',
          },
          {
            title: '2. Dee Aha Ụlọ Ahịa gị',
            desc: 'Kpatuo aha ụlọ ahịa gị wee họrọ ngwa ọgbọ ya gbasara gbakọtara ahụ gị (Dika Supermarket, Farmasi, wdg).',
          },
          {
            title: '3. Họrọ ego ala gị',
            desc: 'Kpokoroba ego a hụlata rị (Dịka Naira ₦ na dọla $). Ọsụkwara ya ka a na a mepee ogbugbu.',
          },
        ],
        proTip:
          'Iji nchekwa akaụntụ ahịa gị bụ ihe kwekọrọ gburu-gburu! Ị ga emeghere ma lee ahụike gị site n’igwe okwu na iPad kachiri gịnị.',
      },
      {
        tabName: 'Iji kpee Ngwa Ahịa',
        badge: 'Ilee Nchịkwa',
        headline: 'Maraziri uru ma ọ bụ kpe kịtakarị ihe dịkwan nwere na shelf gị oge niile',
        accent: '#2dd4bf',
        icon: Package,
        ctaText: 'Bido itinye akụtata',
        steps: [
          {
            title: '1. Pịa kpochụ "Add Product"',
            desc: 'Gbanwee shaf akara ahịa kelee batara bọttịnị kpere kpado ọsịpa akwa ma o bu ikpokororo ahịa gị.',
          },
          {
            title: '2. Tisa ego nkwubi',
            desc: 'Deelị aha njikota ya gị site na ego I jiri gbakọ eju gị agwa ya site ná ire mbanja mbiliko uru rị.',
          },
          {
            title: '3. Kpughee nri fụm na akụtata',
            desc: 'Tisa okụkọ akatọn ole kpakọta ikpu ụgbọ I na ahia kọsịrị kwụkwasịrị aka na nkwube ehihio rị.',
          },
        ],
        proTip:
          'Miniventory ga ahazari ya maka shelves gị oge o bụla ngwa ga fesa ọlị, nke ga edu otite ka nkwupụ na ichebe gi tupu Onya nganga rute.',
      },
      {
        tabName: 'Uru Ahịa na Risikite',
        badge: 'Kpara ngwụsa sekiun 10',
        headline: 'Kpeere ụtụ kwụzị onye ahịa gbasara ụgwọ dijital ruru ngwụchi sekiun 10',
        accent: '#f4b740',
        icon: ShoppingCart,
        ctaText: 'Lee iji akpata otu ere gị',
        steps: [
          {
            title: '1. Pịa kpochụ Record Sale',
            desc: 'Ahapula pịdị nri ma ọ bọbụ rụpụta uru akatali gba mbọ akatọn na nrụpụta ikuku ere a bụọrị mberede.',
          },
          {
            title: '2. Họrọ Ụzọ obim Bịara',
            desc: 'Họrọ akụ Cash, POS Terminal, Transfer, na ozi. Ikperanwa gbuwaria akara ugwọ gba o dika nkebede ego rị!',
          },
          {
            title: '3. Nchụcha Ụgwọ na Gbese',
            desc: 'Ọ bụrụ na onye na asara ghọkọtambee na I kpechara akọwara ugwo ugwu gi e bido mbinye ịchere ugboro ya.',
          },
        ],
        proTip:
          'Gbunyezuru Risiiki okikere obim! Tịpụ ozi ozokwa gburu na WhatsApp onye ahịa ka pịntaa site n’igwe ikuku na ob oborolo bluetooth gị.',
      },
      {
        tabName: 'Nmeefụ Ụlọ Ahịa',
        badge: 'Kpoba kpe iku',
        headline: 'Kpere ndọka nkwuputa na oghikperan akụka mbibụ ugbo na ọnọsụ na mgwakụ uru',
        accent: '#fb7185',
        icon: Receipt,
        ctaText: 'Bido huchikpe kpakpado rị',
        steps: [
          {
            title: '1. Kwunye Tab Nke Expenses',
            desc: 'Kpejite tabu maka Nmeefu ego kwupuu akukpala o dika mma gbasara akụrụngwa gị na mgbukpa.',
          },
          {
            title: '2. Kwupuo Ngịke nlekara ibute ego',
            desc: 'Tise mmanụ jenere na nkwulo renti ma o bụ ukpa ugbo mgbe otoro dọmaka mgbede nile kpogho ncha.',
          },
          {
            title: '3. Mepere ebee ugwọ si wụpụsụrị',
            desc: 'Họrọ mma ego si kporo n’afọ ahịa ka si bante nchekwa akwa ngba nkịtị kwunubere a na e dere I.',
          },
        ],
        proTip:
          'Mmetụ ugboro nneke ego obim gị na edoza kparakwasa nnuputa ichekwa ya na ugbo na mbasa nke mbụ o dika neti ahụ.',
      },
      {
        tabName: 'Uru na mmebi ego',
        badge: 'Ngbakọtara Iji Ruba akụ',
        headline: 'Tụta oghikperan mbenne ọnwụ - achoghim mmụta ahụ maka mbibị obịm gị lissafi rị',
        accent: '#a3e635',
        icon: TrendingUp,
        ctaText: 'Lee Shaf na oge gboro gbo',
        steps: [
          {
            title: '1. Meghee ogbugboo mputara (Dashboard)',
            desc: 'Hazi akara dashboard ibe ụtụ mbepụ a raa rụrụpụta igho ngba na ụgwọ na obodo gbasa uru obịm rị.',
          },
          {
            title: '2. kpesia Net Profit zitere ahịa',
            desc: 'Miniventory gbakwunyere obim mbara otu rụsara ruru eziokwu ibute ihe ego, ka o gbarakwasa ezigbo ahịa gị.',
          },
          {
            title: '3. Igba ngba Nkenke akụ',
            desc: 'Lechena ezie ọcha ụbọsị ma ọ bụ ọnwa kporopo mma bu iku gọọm aban rụba gwa akaụntu uzo ya.',
          },
        ],
        proTip:
          'Ibu akwukwopuu ihe gbazuo ngbapu ahụghị mbu obịm nwere! Ugwuo akuku si akpocho mgbatụ ga gbazi ruru eze ya gboro gburu gbo kpa oge.',
      },
    ],
  },
  yo: {
    eyebrow: 'Igbese-nba-Igbese Itosona',
    heading: 'Bii o ṣe le lo Miniventory fun isiro ati ikilo ile-aja rẹ',
    subheading:
      'Ilana rọrun fun gbogbo iṣẹ́ isowo ojooju mọ́ - o ko nilo iwe kiko ti accountant lomi bibe ojoojumo.',
    proTipHeader: 'Imoran Gbeja / Imọ-rere',
    pillars: [
      {
        tabName: 'Ṣisi Account Rẹ',
        badge: 'Eto Nipe Ose Kan',
        headline: 'Ṣisi account ori ayelujara ile-aja rẹ ni abikuro to din ni iṣẹju kan',
        accent: '#22d3ee',
        icon: UserPlus,
        ctaText: 'Ṣisi Account Ọfẹẹ rẹ Bayi',
        steps: [
          {
            title: '1. Kọorọ orúkọ ati foonu Rẹ Kankan',
            desc: 'Fi nọmba foowosi rẹ titi ti iwe-meeli rẹ lati peki pikiniki tabi ọrọ igbani wo PIN loore-koore rẹ.',
          },
          {
            title: '2. Kọorọ Oruko Ile-Aja rẹ',
            desc: 'Kọ orúkọ ileaja rẹ ki ule so igboju oja eyiti ti ẹ rùn (Bi Supermarket, Pharmacy, Boutique, titi be e lọ).',
          },
          {
            title: '3. Yan Omo-Owo titi ile rẹ',
            desc: 'Yan aami kẹsan bi Naira ₦, Dọla $, tàbi Cedi ₵. Bi ẹ ba ṣe nse igberako eyi, o n yí iboju bọsẹẹ lesekese!',
          },
        ],
        proTip:
          'Ààbò asiri pabo logini account rẹ pa owo ati ọjà mọ fari pe o ṣii iboju kòko lati fonisi eyikeyìi tabi kọmputa!',
      },
      {
        tabName: 'Ìṣákóbà ati Ojà (Inventory)',
        badge: 'Mọ́tìyọkọja Ọjà Ni ilowo',
        headline: 'Mọ́ jale ìmẹka ohun gbogbo lẹnu ọ̀kan kákiri o jale rẹ rira gbede si pọsi rẹ',
        accent: '#2dd4bf',
        icon: Package,
        ctaText: 'Bẹ̀rẹ̀ sí fi ọjà sọri rẹ',
        steps: [
          {
            title: '1. Tẹ Koto ti n fi Ọjà sọ́jà (Add Product)',
            desc: 'Wari nọmba ọja ni inaro tẹle gboro ki o pe bọ́tìn ti pe "Add Product" tàbi "New Item" loju ibojú ojà.',
          },
          {
            title: '2. Kọ Iye tí ó rùú rà àti ta mọ',
            desc: 'Fi oruko oja re han ni idiwọrẹ rẹ lati pawa nkan iye tí u fi ra kankan (Cost) ati iye tàbi titajà rekeje (Selling).',
          },
          {
            title: '3. Sọ́ Iro kón mọlẹ ni ìkó kan',
            desc: 'Sọrẹ jàlé ki o ṣe mọ́wọn pẹpẹ cartons titi tí ó pèse jale bayìi ki ule fi ifohumpa síi daju daju.',
          },
        ],
        proTip:
          'Miniventory maa bọ̀gbọjúu selifi re loore-koore laiye isofo! Tó bádé pe ọjà pé kónku kàn fìfọ wàyọjù ọlọgagaa bọ bẹ títí kí onìbàrà o tó sún mọlẹ.',
      },
      {
        tabName: 'Titadìi ati Ìtítara',
        badge: 'Isese Sisin sáyé ni seka ni 10',
        headline: 'Ṣàkọsílẹ̀ rira ojà lẹhin onibara lesekese kí ẹ n pèse iwe oja ori WhatsApp',
        accent: '#f4b740',
        icon: ShoppingCart,
        ctaText: 'Tẹle Kọ Ọja sílè (Record Sale)',
        steps: [
          {
            title: '1. Tẹ Kọ Ọjà tàbi Kóríkì (Record Sale)',
            desc: 'Yan àwọn oja ibojú eyiti onìbàrà bẹ̀bẹẹ̀ sí nfé rà tabi kìtẹlẹ lero owo iṣẹ ajà fún aron-wọnwọn iyan lódó.',
          },
          {
            title: '2. Yan Bii ẹ ṣe Ńgba Owó',
            desc: 'Yan owo-jijo (Cash), POS Terminal, Banki Tranfe, tàbi owo mọ́bajè. Ẹ lè pin owo rira daju nikan ni "Split Payment"!',
          },
          {
            title: '3. Ṣakoso Gbese Oníbàrà pọ̀',
            desc: 'Tẹ́gbù oníbàrà ba nawo diwọ lodi lówó si rawo kúruru ti ò sárà sẹlè pé ó ma fòwosi so, ẹ ṣatupadasi arugbin rẹ peki e koto rùmọ.',
          },
        ],
        proTip:
          'Mii pèse digital rísìti jakejado wàkàtì kan! Firanseṣi yii lójú sọ sori WhatsApp onìbàrà rẹ tàbi ki ule te reke pínkán mọlẹ pẹlu Bluetooth tàbi iwe re bọwọn pọ̀.',
      },
      {
        tabName: 'Inawon Oruko Ileaja (Expenses)',
        badge: 'Kọ Owo Ti Ó fojú Raramọ',
        headline:
          'Ṣàkọsílẹ̀ jọkọ ẹ̀gboro ìyè owo tàgbà tìgboro nínú ina ojà lákótán kí erúmá mu eré-owo rẹ nipa.',
        accent: '#fb7185',
        icon: Receipt,
        ctaText: 'Bẹ̀rẹ̀ Ṣakoso owo Ìnọ-Iná',
        steps: [
          {
            title: '1. Ṣí kòto Ìnáwon (Expenses Tab)',
            desc: 'Tẹlè "Expenses" bọtiini rù inu menu ati igbereke titi ó fi fi agbekele síi nípà "Record Expense".',
          },
          {
            title: '2. Kọ Ìdi owo Tí Ẹ Iná',
            desc: 'Kọrọ alayeki idi owow - gbi owo epo jẹre the rent ojà, ọrọ tisi pako niko arẹrọ, àìdàdáṣàko bójuto iroyi pọn dandan - kí ẹ̀ kọyée iye fàyọpò!',
          },
          {
            title: '3. Ṣatako Orin Kúrúru Gbi Owó fi Tọ mọ',
            desc: 'Kíkàgbọjú pe owó ti iná bọ̀ lágbà láwò láwọn àyálè àyè ròyì rẹpẹrẹ láti kálè rò wígbẹsẹ iná yí!',
          },
        ],
        proTip:
          'Kíkọ silẹ jakejado iná-owó rẹ gbòógboro kíkù yí ràdù o pègbedẹlè wari púpọ ìdí eré gbede fomi fẹku ati alayeke gbingbin fún òpólopo igbereke lówurọ ati alari!',
      },
      {
        tabName: 'Èrè títí àti Oja mọnla (P&L)',
        badge: 'Ìròpọ̀ Aṣiyá-siyá lasẹkesẹ',
        headline:
          'Mọ erè ati èlé kójòko isowo rẹ daju daju kankan lati lẹjọ titi inu ile gbede jale',
        accent: '#a3e635',
        icon: TrendingUp,
        ctaText: 'Wá Iboju Dashboard Bayii',
        steps: [
          {
            title: '1. Ṣí Ìbojú Dashboard Rẹ̀ fún ìmọ',
            desc: 'Lẹjú tẹlè isoro re ni ọjọọmọgbogbo lojojumo leri shere nika tabi kíkọ reports oojo fomi gbàwà rẹ̀.',
          },
          {
            title: '2. Wari Eré Owo tí o gba Gbangba (Net Profit)',
            desc: 'Miniventory yió pé ijinlẹ lórìṣirí rẹ gbọ bọlẹ nínú ikadi rira ati owo isire mọnki alarẹrọ latokoto ìjàlé rẹ gan ni!',
          },
          {
            title: '3. Mọ̀ Ọjà tí ó Yé sùn Lórùkuro Rẹ Ope',
            desc: 'Ṣàyẹ̀wọ́ alaye mìmọ gidi ojoojo ati osin kasan to pèse idahun síí ojà wo gan lere ni iboju-oje púpọjọ ni nka.',
          },
        ],
        proTip:
          'O ko nilo ẹkọ akurere tàbi ilé calculator ikansi mọnran titi-loke rùru ninu kẹlẹmìi igbọwò sán ni o! Bi gbàgbe gbá jàlé ẹ ba kọ sílẹ̀, igbani imu re ni wà bákó sọdọbá fúngiri!',
      },
    ],
  },
};
