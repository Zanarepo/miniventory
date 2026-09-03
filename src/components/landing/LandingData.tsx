import {
  IconBag,
  IconBox,
  IconChart,
  IconUsers,
  IconReceipt,
  IconWifiOff,
  IconDoc,
} from './LandingIcons';

import analyticsImg from '../../assets/Analytics.png';
import offlineSyncImg from '../../assets/OfflineSync.png';
import sampleReceiptImg from '../../assets/SampleReceipt.png';

export const FEATURES = [
  {
    icon: <IconBag />,
    title: 'Record sales fast',
    body: 'Log every sale in a few taps. No forms, no long typing.',
    accent: '#22d3ee',
    num: '01',
  },
  {
    icon: <IconBox />,
    title: 'Track your stock',
    body: "Always know what's in your shop and what's finishing.",
    accent: '#2dd4bf',
    num: '02',
  },
  {
    icon: <IconChart />,
    title: 'See your real profit',
    body: 'Know how much you truly made - today, this week, this month.',
    accent: '#a3e635',
    num: '03',
  },
  {
    icon: <IconUsers />,
    title: 'Customers who owe you',
    body: 'Never forget who owes you money, or how much.',
    accent: '#f4b740',
    num: '04',
  },
  {
    icon: <IconReceipt />,
    title: 'Record shop expenses',
    body: 'Rent, fuel, stock cost - all in one place.',
    accent: '#fb7185',
    num: '05',
  },
  {
    icon: <IconWifiOff />,
    title: 'Works without internet',
    body: 'No data? No wahala. Your shop keeps running.',
    accent: '#818cf8',
    num: '06',
  },
  {
    icon: <IconDoc />,
    title: 'Reports you understand',
    body: 'Simple daily reports - no accounting knowledge needed.',
    accent: '#34d399',
    num: '07',
  },
];

export const STEPS = [
  {
    title: 'Record it',
    body: 'Tap “Record Sale” and enter what you sold. It takes about 10 seconds.',
  },
  {
    title: 'We do the maths',
    body: 'Miniventory checks your stock and works out your profit automatically.',
  },
  {
    title: 'You decide',
    body: 'See your true numbers today, and know what to buy, sell, or stop.',
  },
];

export const STORY_CARDS = [
  {
    eyebrow: 'Record sales & debts',
    title: 'Never lose track of who owes you again',
    body: 'Every sale, every pending balance - logged in seconds. Miniventory generates a clean digital receipt for every transaction so you and your customer are always on the same page.',
    highlights: ['Cash & credit sales', 'Pending balance alerts', 'Customer-linked records'],
    img: sampleReceiptImg,
    imgAlt: 'Sample receipt showing cash paid and pending balance for customer Musa O.',
    flip: false,
    accent: 'var(--mv-cyan)',
  },
  {
    eyebrow: 'Works without internet',
    title: "Sell at the market, syncs when you're back",
    body: 'No data? No wahala. Miniventory saves every sale offline and quietly syncs everything the moment your connection returns - securely, automatically, without you lifting a finger.',
    highlights: ['Full offline mode', 'Automatic background sync', 'Secure data protection'],
    img: offlineSyncImg,
    imgAlt: 'Market seller using Miniventory on a tablet while offline, with sync shield graphic',
    flip: true,
    accent: 'var(--mv-teal)',
  },
  {
    eyebrow: 'Real-time analytics',
    title: 'See the numbers that actually matter',
    body: 'Forget spreadsheets. Miniventory turns every sale into live business intelligence - portfolio growth, cumulative revenue, profit margins - all on your phone, in real time.',
    highlights: [
      'Live profit & revenue',
      'Inventory & shipping tracking',
      '78%+ profit margin insight',
    ],
    img: analyticsImg,
    imgAlt: '3D analytics dashboard showing portfolio growth, profit margins and shipping metrics',
    flip: false,
    accent: 'var(--mv-gold)',
  },
];

export const PLANS = [
  {
    name: 'Free',
    tag: 'Start today, no card needed',
    price: '₦0',
    cycle: 'Free forever',
    features: [
      'Record sales & expenses',
      'Track your inventory',
      'Basic daily & weekly reports',
      'Works fully offline',
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Premium',
    tag: 'For shops that are growing',
    price: '₦2,500',
    cycle: 'per month',
    features: [
      'Everything in Free',
      'Smart business insights',
      'Multiple staff accounts',
      'Automatic cloud backup',
      'Receipt scanning (OCR)',
    ],
    cta: 'Try Premium',
    featured: true,
  },
  {
    name: 'Enterprise',
    tag: 'For cooperatives & NGOs',
    price: 'Custom',
    cycle: 'talk to our team',
    features: [
      'Bulk onboarding for members',
      'Admin & impact dashboard',
      'Portfolio monitoring',
      'API access & integrations',
    ],
    cta: 'Talk to Us',
    featured: false,
  },
];
