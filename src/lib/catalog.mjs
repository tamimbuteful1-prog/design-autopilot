// Idea catalog: every brand below is fictional and invented for concept work.
// Videos are always labelled as concept designs, never as client projects.

export const CATEGORIES = ['mobile', 'dashboard', 'website', 'uiux', 'product', 'packaging'];

export const CATEGORY_META = {
  mobile: { ar: 'تطبيق جوال', en: 'Mobile App', tags: ['#mobileapp', '#appdesign', '#uidesign'] },
  dashboard: { ar: 'لوحة تحكم', en: 'Dashboard', tags: ['#dashboard', '#dashboarddesign', '#saasdesign'] },
  website: { ar: 'موقع إلكتروني', en: 'Website', tags: ['#webdesign', '#landingpage', '#websitedesign'] },
  uiux: { ar: 'تجربة مستخدم UI/UX', en: 'UI/UX Flow', tags: ['#uiux', '#uxdesign', '#designsystem'] },
  product: { ar: 'تصميم منتج', en: 'Product Design', tags: ['#productdesign', '#industrialdesign', '#3ddesign'] },
  packaging: { ar: 'تصميم تغليف', en: 'Packaging', tags: ['#packagingdesign', '#branding', '#labeldesign'] },
};

const nums = (rng, n, lo, hi) => Array.from({ length: n }, () => rng.int(lo, hi));
const trend = (rng, n, start, drift, noise) => {
  const out = [];
  let v = start;
  for (let i = 0; i < n; i++) {
    v = Math.max(5, v + drift + rng.float(-noise, noise));
    out.push(Math.round(v));
  }
  return out;
};

export const SUBJECTS = {
  mobile: [
    { key: 'plant-care', ar: 'تطبيق للعناية بالنباتات', en: 'Plant care', brands: ['Verdi', 'Leafly Home', 'Moss'], icon: 'leaf',
      content: (r) => ({ greeting: 'Good morning, Sara', heroTitle: 'Water today', heroValue: `${r.int(3, 6)} plants`, heroSub: 'Next: Monstera · 9:00', chips: ['All', 'Living room', 'Balcony', 'Office'],
        list: [{ title: 'Monstera Deliciosa', sub: 'Humidity 62%', meta: 'in 2h', icon: 'leaf' }, { title: 'Fiddle Leaf Fig', sub: 'Needs light', meta: 'Today', icon: 'sun' }, { title: 'Snake Plant', sub: 'Healthy', meta: 'Fri', icon: 'drop' }],
        detail: { title: 'Monstera Deliciosa', subtitle: 'Living room · 2 yrs', stats: [['Light', 'Bright'], ['Water', '250ml'], ['Temp', '22°C']], progress: r.int(55, 85), cta: 'Mark as watered' },
        stats: { title: 'Care streak', value: `${r.int(12, 48)} days`, bars: nums(r, 7, 30, 100), label: 'Waterings this week' } }) },
    { key: 'budget', ar: 'تطبيق لإدارة الميزانية الشخصية', en: 'Personal budget', brands: ['Penny', 'Fold', 'Ledgr'], icon: 'wallet',
      content: (r) => ({ greeting: 'Hi, Omar', heroTitle: 'Available balance', heroValue: `$${r.int(2, 9)},${r.int(100, 999)}`, heroSub: `Spent ${r.int(30, 70)}% of monthly plan`, chips: ['Week', 'Month', 'Year'],
        list: [{ title: 'Groceries', sub: '12 transactions', meta: `-$${r.int(120, 380)}`, icon: 'cart' }, { title: 'Transport', sub: 'Metro & fuel', meta: `-$${r.int(40, 160)}`, icon: 'bolt' }, { title: 'Freelance income', sub: 'Invoice #204', meta: `+$${r.int(800, 2400)}`, icon: 'star' }],
        detail: { title: 'Savings goal', subtitle: 'New laptop · Dec', stats: [['Saved', `$${r.int(600, 1200)}`], ['Goal', '$1,800'], ['Left', `${r.int(5, 9)} wks`]], progress: r.int(40, 80), cta: 'Add to savings' },
        stats: { title: 'Spending', value: `$${r.int(900, 2400)}`, bars: nums(r, 7, 20, 100), label: 'Daily spending' } }) },
    { key: 'coffee', ar: 'تطبيق لطلب القهوة المختصة', en: 'Specialty coffee ordering', brands: ['Brewline', 'Roast & Co', 'Qahwa Lab'], icon: 'cup',
      content: (r) => ({ greeting: 'Morning, Lina', heroTitle: 'Your usual', heroValue: 'Flat White', heroSub: `Ready in ${r.int(4, 9)} min · Olaya branch`, chips: ['Hot', 'Iced', 'V60', 'Desserts'],
        list: [{ title: 'Ethiopia Guji', sub: 'Floral · Light roast', meta: `${r.int(18, 26)} SAR`, icon: 'cup' }, { title: 'Spanish Latte', sub: 'Iced · Oat milk', meta: `${r.int(16, 22)} SAR`, icon: 'drop' }, { title: 'Cardamom Bun', sub: 'Fresh today', meta: '14 SAR', icon: 'star' }],
        detail: { title: 'Ethiopia Guji', subtitle: 'Single origin · V60', stats: [['Acidity', 'High'], ['Body', 'Light'], ['Notes', 'Jasmine']], progress: r.int(60, 90), cta: 'Add to order' },
        stats: { title: 'Loyalty', value: `${r.int(4, 9)}/10 cups`, bars: nums(r, 7, 10, 100), label: 'Visits this week' } }) },
    { key: 'fitness', ar: 'تطبيق تمارين منزلية', en: 'Home workouts', brands: ['Pulse', 'Kinetic', 'Reps'], icon: 'bolt',
      content: (r) => ({ greeting: 'Ready, Faisal?', heroTitle: "Today's session", heroValue: `${r.int(20, 45)} min HIIT`, heroSub: `${r.int(250, 480)} kcal · No equipment`, chips: ['Strength', 'Cardio', 'Mobility', 'Yoga'],
        list: [{ title: 'Core Burner', sub: '12 min · Beginner', meta: '4.9', icon: 'bolt' }, { title: 'Lower Body Power', sub: '25 min · Medium', meta: '4.8', icon: 'heart' }, { title: 'Evening Stretch', sub: '10 min · Easy', meta: '4.9', icon: 'moon' }],
        detail: { title: 'Core Burner', subtitle: '8 exercises · 12 min', stats: [['Level', 'Easy'], ['Kcal', `${r.int(90, 160)}`], ['Sets', '3']], progress: r.int(30, 70), cta: 'Start workout' },
        stats: { title: 'Weekly activity', value: `${r.int(3, 6)} / 7 days`, bars: nums(r, 7, 15, 100), label: 'Active minutes' } }) },
    { key: 'travel', ar: 'تطبيق لتخطيط الرحلات', en: 'Trip planner', brands: ['Wander', 'Atlasy', 'Rihla'], icon: 'map',
      content: (r) => ({ greeting: 'Where next, Noura?', heroTitle: 'Upcoming trip', heroValue: 'AlUla · 3 days', heroSub: `Departs in ${r.int(5, 20)} days`, chips: ['Stays', 'Activities', 'Food', 'Maps'],
        list: [{ title: 'Elephant Rock', sub: 'Sunset visit', meta: 'Day 1', icon: 'sun' }, { title: 'Old Town walk', sub: 'Guided · 2h', meta: 'Day 2', icon: 'map' }, { title: 'Desert camp', sub: 'Stargazing', meta: 'Day 3', icon: 'moon' }],
        detail: { title: 'Elephant Rock', subtitle: 'AlUla · Nature', stats: [['Drive', '20 min'], ['Best', '17:30'], ['Entry', 'Free']], progress: r.int(40, 80), cta: 'Add to itinerary' },
        stats: { title: 'Trip budget', value: `${r.int(2, 6)},${r.int(100, 999)} SAR`, bars: nums(r, 7, 20, 100), label: 'Planned spend per day' } }) },
    { key: 'sleep', ar: 'تطبيق لتتبع النوم', en: 'Sleep tracker', brands: ['Nocturne', 'Hush', 'Drift'], icon: 'moon',
      content: (r) => ({ greeting: 'Good night, Reem', heroTitle: 'Last night', heroValue: `${r.int(6, 8)}h ${r.int(5, 55)}m`, heroSub: `Sleep score ${r.int(72, 94)}`, chips: ['Sounds', 'Stories', 'Alarms'],
        list: [{ title: 'Rain on leaves', sub: 'Ambient · 45 min', meta: 'Play', icon: 'drop' }, { title: 'Wind-down breathing', sub: 'Guided · 6 min', meta: 'Play', icon: 'heart' }, { title: 'Smart alarm', sub: '06:30 – 07:00', meta: 'On', icon: 'bell' }],
        detail: { title: 'Sleep stages', subtitle: 'Thursday night', stats: [['Deep', `${r.int(1, 2)}h ${r.int(10, 50)}m`], ['REM', `${r.int(1, 2)}h ${r.int(5, 40)}m`], ['Awake', `${r.int(5, 25)}m`]], progress: r.int(70, 92), cta: 'See full report' },
        stats: { title: 'Weekly average', value: `${r.int(6, 7)}h ${r.int(10, 50)}m`, bars: nums(r, 7, 50, 100), label: 'Hours slept' } }) },
    { key: 'language', ar: 'تطبيق لتعلم اللغات', en: 'Language learning', brands: ['Lingo Loop', 'Kalima', 'Parla'], icon: 'star',
      content: (r) => ({ greeting: 'Keep it up, Yousef', heroTitle: 'Daily goal', heroValue: `${r.int(15, 40)} XP left`, heroSub: `Streak · ${r.int(5, 60)} days`, chips: ['Spanish', 'Japanese', 'French'],
        list: [{ title: 'At the café', sub: 'Unit 4 · Lesson 2', meta: '8 min', icon: 'cup' }, { title: 'Past tense', sub: 'Grammar drill', meta: '5 min', icon: 'star' }, { title: 'Listening', sub: 'Native speakers', meta: '6 min', icon: 'play' }],
        detail: { title: 'At the café', subtitle: 'Unit 4 · Spanish', stats: [['Words', '24'], ['Level', 'A2'], ['Time', '8 min']], progress: r.int(30, 80), cta: 'Continue lesson' },
        stats: { title: 'XP this week', value: `${r.int(400, 1600)} XP`, bars: nums(r, 7, 20, 100), label: 'Daily XP' } }) },
    { key: 'ev-charging', ar: 'تطبيق شحن السيارات الكهربائية', en: 'EV charging', brands: ['Volta Map', 'Chargely', 'Amp'], icon: 'bolt',
      content: (r) => ({ greeting: 'Hello, Khalid', heroTitle: 'Battery', heroValue: `${r.int(28, 76)}%`, heroSub: `${r.int(120, 320)} km range`, chips: ['Nearby', 'Fast', 'Favourites'],
        list: [{ title: 'Hub · King Fahd Rd', sub: '150 kW · 4 free', meta: '1.2 km', icon: 'bolt' }, { title: 'Mall parking B2', sub: '50 kW · 2 free', meta: '3.4 km', icon: 'map' }, { title: 'Office garage', sub: '22 kW · 6 free', meta: '5.0 km', icon: 'home' }],
        detail: { title: 'Charging session', subtitle: 'Hub · Bay 3', stats: [['Power', '142 kW'], ['Added', `${r.int(20, 45)} kWh`], ['Cost', `${r.int(18, 40)} SAR`]], progress: r.int(40, 85), cta: 'Stop charging' },
        stats: { title: 'Energy this month', value: `${r.int(180, 420)} kWh`, bars: nums(r, 7, 10, 100), label: 'kWh per day' } }) },
  ],

  dashboard: [
    { key: 'saas-revenue', ar: 'لوحة تحكم لإيرادات شركة SaaS', en: 'SaaS revenue analytics', brands: ['Northstar', 'Metricly', 'Orbit'], icon: 'chart',
      content: (r) => ({ title: 'Revenue overview', nav: ['Overview', 'Customers', 'Billing', 'Reports', 'Settings'], kpis: [{ label: 'MRR', value: `$${r.int(80, 240)}k`, delta: `+${r.int(3, 14)}%` }, { label: 'Active users', value: `${r.int(8, 40)},${r.int(100, 999)}`, delta: `+${r.int(2, 9)}%` }, { label: 'Churn', value: `${r.float(1, 4).toFixed(1)}%`, delta: `-${r.float(0.1, 0.9).toFixed(1)}%` }, { label: 'ARPU', value: `$${r.int(18, 90)}`, delta: `+${r.int(1, 6)}%` }],
        series: trend(r, 12, 40, 4, 6), series2: trend(r, 12, 25, 2, 5), bars: [{ label: 'Starter', value: r.int(30, 60) }, { label: 'Pro', value: r.int(50, 90) }, { label: 'Team', value: r.int(20, 70) }, { label: 'Enterprise', value: r.int(10, 40) }],
        table: [['Acme Labs', 'Enterprise', `$${r.int(2, 9)},${r.int(100, 999)}`, 'Paid'], ['Nova Studio', 'Team', `$${r.int(400, 999)}`, 'Paid'], ['Brightpath', 'Pro', `$${r.int(100, 399)}`, 'Pending'], ['Kite & Co', 'Pro', `$${r.int(100, 399)}`, 'Paid']] }) },
    { key: 'logistics', ar: 'لوحة تحكم لإدارة أسطول التوصيل', en: 'Delivery fleet operations', brands: ['Routeboard', 'Fleetwise', 'Cargo One'], icon: 'map',
      content: (r) => ({ title: 'Fleet today', nav: ['Live map', 'Drivers', 'Orders', 'Vehicles', 'Reports'], kpis: [{ label: 'Deliveries', value: `${r.int(900, 2400)}`, delta: `+${r.int(4, 12)}%` }, { label: 'On-time', value: `${r.int(91, 99)}%`, delta: `+${r.float(0.5, 3).toFixed(1)}%` }, { label: 'Avg. ETA', value: `${r.int(22, 41)} min`, delta: `-${r.int(1, 5)} min` }, { label: 'Active vans', value: `${r.int(40, 120)}`, delta: `+${r.int(1, 8)}` }],
        series: trend(r, 12, 30, 5, 8), series2: trend(r, 12, 20, 3, 6), bars: [{ label: 'North', value: r.int(40, 90) }, { label: 'South', value: r.int(30, 80) }, { label: 'East', value: r.int(20, 70) }, { label: 'West', value: r.int(30, 85) }],
        table: [['VAN-214', 'A. Hassan', 'Olaya', 'On route'], ['VAN-118', 'M. Saleh', 'Malqa', 'Delivered'], ['VAN-301', 'S. Fahad', 'Hittin', 'Delayed'], ['VAN-077', 'R. Nasser', 'Yasmin', 'On route']] }) },
    { key: 'energy', ar: 'لوحة تحكم لمراقبة استهلاك الطاقة', en: 'Smart building energy', brands: ['Watt Studio', 'Gridline', 'Lumen OS'], icon: 'bolt',
      content: (r) => ({ title: 'Energy monitor', nav: ['Overview', 'Floors', 'Devices', 'Alerts', 'Billing'], kpis: [{ label: 'Usage today', value: `${r.int(800, 2400)} kWh`, delta: `-${r.int(2, 11)}%` }, { label: 'Solar share', value: `${r.int(18, 46)}%`, delta: `+${r.int(1, 7)}%` }, { label: 'Peak load', value: `${r.int(90, 260)} kW`, delta: `-${r.int(1, 9)}%` }, { label: 'CO₂ saved', value: `${r.float(0.4, 2.8).toFixed(1)} t`, delta: `+${r.int(3, 12)}%` }],
        series: trend(r, 12, 60, -1, 8), series2: trend(r, 12, 15, 2, 4), bars: [{ label: 'HVAC', value: r.int(50, 95) }, { label: 'Lighting', value: r.int(20, 50) }, { label: 'IT', value: r.int(25, 60) }, { label: 'Other', value: r.int(10, 30) }],
        table: [['Floor 12', 'HVAC', `${r.int(120, 300)} kWh`, 'Normal'], ['Floor 08', 'Lighting', `${r.int(40, 90)} kWh`, 'Normal'], ['Server room', 'IT', `${r.int(200, 400)} kWh`, 'High'], ['Lobby', 'HVAC', `${r.int(60, 140)} kWh`, 'Normal']] }) },
    { key: 'clinic', ar: 'لوحة تحكم لعيادة ومواعيد المرضى', en: 'Clinic scheduling', brands: ['Carely', 'Medi Desk', 'Shifa'], icon: 'heart',
      content: (r) => ({ title: 'Clinic today', nav: ['Schedule', 'Patients', 'Doctors', 'Rooms', 'Reports'], kpis: [{ label: 'Appointments', value: `${r.int(60, 180)}`, delta: `+${r.int(3, 15)}%` }, { label: 'Avg. wait', value: `${r.int(6, 18)} min`, delta: `-${r.int(1, 4)} min` }, { label: 'No-shows', value: `${r.float(2, 7).toFixed(1)}%`, delta: `-${r.float(0.2, 1.5).toFixed(1)}%` }, { label: 'Room use', value: `${r.int(70, 95)}%`, delta: `+${r.int(1, 6)}%` }],
        series: trend(r, 12, 30, 3, 7), series2: trend(r, 12, 12, 1, 3), bars: [{ label: 'Dental', value: r.int(30, 80) }, { label: 'Derma', value: r.int(20, 70) }, { label: 'Pediatrics', value: r.int(40, 90) }, { label: 'General', value: r.int(50, 95) }],
        table: [['09:30', 'Dental', 'Room 2', 'Checked in'], ['10:00', 'Pediatrics', 'Room 5', 'Waiting'], ['10:15', 'General', 'Room 1', 'In session'], ['10:45', 'Derma', 'Room 3', 'Booked']] }) },
    { key: 'ecommerce', ar: 'لوحة تحكم لمتجر إلكتروني', en: 'E-commerce operations', brands: ['Shopwave', 'Cartly', 'Souq Pro'], icon: 'cart',
      content: (r) => ({ title: 'Store performance', nav: ['Overview', 'Orders', 'Products', 'Customers', 'Marketing'], kpis: [{ label: 'Sales', value: `${r.int(40, 190)}k SAR`, delta: `+${r.int(4, 22)}%` }, { label: 'Orders', value: `${r.int(400, 2200)}`, delta: `+${r.int(2, 12)}%` }, { label: 'Conversion', value: `${r.float(1.8, 4.6).toFixed(1)}%`, delta: `+${r.float(0.1, 0.8).toFixed(1)}%` }, { label: 'Returns', value: `${r.float(1, 5).toFixed(1)}%`, delta: `-${r.float(0.1, 1).toFixed(1)}%` }],
        series: trend(r, 12, 35, 4, 9), series2: trend(r, 12, 18, 2, 5), bars: [{ label: 'Apparel', value: r.int(40, 95) }, { label: 'Home', value: r.int(20, 70) }, { label: 'Beauty', value: r.int(30, 80) }, { label: 'Tech', value: r.int(15, 60) }],
        table: [['#10482', 'Linen shirt', '189 SAR', 'Shipped'], ['#10481', 'Desk lamp', '320 SAR', 'Packing'], ['#10480', 'Face serum', '95 SAR', 'Delivered'], ['#10479', 'Earbuds', '410 SAR', 'Shipped']] }) },
    { key: 'hotel', ar: 'لوحة تحكم لإدارة فندق', en: 'Hotel occupancy', brands: ['Staybook', 'Nuzul', 'Harbor Desk'], icon: 'home',
      content: (r) => ({ title: 'Property overview', nav: ['Front desk', 'Rooms', 'Bookings', 'Housekeeping', 'Revenue'], kpis: [{ label: 'Occupancy', value: `${r.int(68, 96)}%`, delta: `+${r.int(2, 9)}%` }, { label: 'ADR', value: `${r.int(420, 980)} SAR`, delta: `+${r.int(1, 7)}%` }, { label: 'RevPAR', value: `${r.int(300, 800)} SAR`, delta: `+${r.int(2, 10)}%` }, { label: 'Check-ins', value: `${r.int(20, 90)}`, delta: `+${r.int(1, 12)}` }],
        series: trend(r, 12, 55, 2, 6), series2: trend(r, 12, 40, 1, 5), bars: [{ label: 'Direct', value: r.int(30, 70) }, { label: 'OTA', value: r.int(40, 90) }, { label: 'Corporate', value: r.int(15, 50) }, { label: 'Walk-in', value: r.int(5, 20) }],
        table: [['Suite 1204', 'Deluxe', '3 nights', 'Arriving'], ['Room 812', 'Standard', '1 night', 'In house'], ['Room 615', 'Twin', '2 nights', 'Cleaning'], ['Suite 1401', 'Royal', '5 nights', 'Arriving']] }) },
  ],

  website: [
    { key: 'architecture', ar: 'موقع لاستوديو معماري', en: 'Architecture studio', brands: ['Atelier Nord', 'Form & Field', 'Mabna Studio'], icon: 'home',
      content: () => ({ nav: ['Work', 'Studio', 'Process', 'Contact'], heroTitle: 'Spaces shaped by light and silence', heroSub: 'Residential and cultural architecture across the Gulf.', cta: 'View projects', features: [{ title: 'Concept', body: 'Site studies, massing and narrative.', icon: 'star' }, { title: 'Design', body: 'Detailed drawings and material palettes.', icon: 'grid' }, { title: 'Delivery', body: 'Coordination through handover.', icon: 'check' }], stats: [['14', 'Years'], ['120+', 'Spaces'], ['9', 'Awards']], pricing: null, steps: ['Brief', 'Concept', 'Develop', 'Build'] }) },
    { key: 'ai-notes', ar: 'صفحة هبوط لتطبيق ملاحظات ذكي', en: 'AI notes app landing page', brands: ['Noted', 'Margin', 'Fikra'], icon: 'star',
      content: () => ({ nav: ['Product', 'Pricing', 'Docs', 'Sign in'], heroTitle: 'Your notes, finally organised themselves', heroSub: 'Capture anything. Find everything. Summaries in one tap.', cta: 'Start free', features: [{ title: 'Auto-tagging', body: 'Notes sort into projects as you write.', icon: 'grid' }, { title: 'Instant recall', body: 'Search by meaning, not keywords.', icon: 'search' }, { title: 'Offline first', body: 'Works anywhere, syncs everywhere.', icon: 'bolt' }], stats: [['2 min', 'Setup'], ['∞', 'Notes'], ['E2E', 'Encrypted']], pricing: [{ name: 'Free', price: '$0', items: ['500 notes', 'Basic search'] }, { name: 'Pro', price: '$8', items: ['Unlimited notes', 'AI summaries'] }, { name: 'Team', price: '$14', items: ['Shared spaces', 'Admin tools'] }], steps: null }) },
    { key: 'roastery', ar: 'موقع لمحمصة قهوة', en: 'Coffee roastery e-shop', brands: ['Dune Roasters', 'Ember Bean', 'Bunn House'], icon: 'cup',
      content: () => ({ nav: ['Shop', 'Subscriptions', 'Origins', 'Cafés'], heroTitle: 'Small-batch coffee, roasted every Monday', heroSub: 'Traceable beans from 11 farms, delivered fresh.', cta: 'Shop beans', features: [{ title: 'Traceable', body: 'Know the farm, altitude and harvest.', icon: 'map' }, { title: 'Fresh roast', body: 'Shipped within 48 hours of roasting.', icon: 'sun' }, { title: 'Brew guides', body: 'Recipes for V60, Chemex and espresso.', icon: 'cup' }], stats: [['11', 'Farms'], ['48h', 'Roast to door'], ['6', 'Origins']], pricing: [{ name: 'Taster', price: '89 SAR', items: ['3 × 100g', 'Monthly'] }, { name: 'Daily', price: '149 SAR', items: ['2 × 250g', 'Monthly'] }, { name: 'Office', price: '399 SAR', items: ['2kg', 'Bi-weekly'] }], steps: null }) },
    { key: 'coworking', ar: 'موقع لمساحة عمل مشتركة', en: 'Coworking space', brands: ['Commons', 'Majlis Work', 'Deskhaus'], icon: 'grid',
      content: () => ({ nav: ['Spaces', 'Memberships', 'Events', 'Book a tour'], heroTitle: 'A calmer place to do your best work', heroSub: 'Private studios, focus desks and meeting rooms downtown.', cta: 'Book a tour', features: [{ title: 'Focus zones', body: 'Acoustic pods and silent floors.', icon: 'moon' }, { title: 'Fast Wi-Fi', body: '1 Gbps fibre on every floor.', icon: 'bolt' }, { title: '24/7 access', body: 'Your key, your schedule.', icon: 'check' }], stats: [['3', 'Floors'], ['240', 'Desks'], ['24/7', 'Access']], pricing: [{ name: 'Day pass', price: '75 SAR', items: ['Hot desk', 'Coffee'] }, { name: 'Resident', price: '1,200 SAR', items: ['Fixed desk', 'Storage'] }, { name: 'Studio', price: '4,500 SAR', items: ['Private room', '4 seats'] }], steps: null }) },
    { key: 'skincare', ar: 'موقع لعلامة عناية بالبشرة', en: 'Skincare brand', brands: ['Aura Lab', 'Bareform', 'Nadaa'], icon: 'drop',
      content: () => ({ nav: ['Shop', 'Routine finder', 'Ingredients', 'About'], heroTitle: 'Fewer steps. Better skin.', heroSub: 'Clinically tested essentials made for hot climates.', cta: 'Find my routine', features: [{ title: 'Climate-ready', body: 'Lightweight textures for heat and humidity.', icon: 'sun' }, { title: 'Clean actives', body: 'Niacinamide, ceramides, no fillers.', icon: 'drop' }, { title: 'Refillable', body: 'Glass bottles with refill pouches.', icon: 'leaf' }], stats: [['4', 'Essentials'], ['0', 'Fragrance'], ['100%', 'Refillable']], pricing: null, steps: ['Cleanse', 'Treat', 'Hydrate', 'Protect'] }) },
    { key: 'fintech', ar: 'صفحة هبوط لتطبيق مالي', en: 'Fintech app landing page', brands: ['Sanad Pay', 'Coinless', 'Tally'], icon: 'wallet',
      content: () => ({ nav: ['Personal', 'Business', 'Security', 'Get the app'], heroTitle: 'Money that moves as fast as you do', heroSub: 'Instant transfers, smart budgets and zero hidden fees.', cta: 'Get the app', features: [{ title: 'Instant transfers', body: 'Send to anyone in seconds.', icon: 'bolt' }, { title: 'Smart budgets', body: 'Automatic categories and alerts.', icon: 'chart' }, { title: 'Bank-grade security', body: 'Biometrics and card controls.', icon: 'check' }], stats: [['0', 'Hidden fees'], ['3 sec', 'Transfers'], ['24/7', 'Support']], pricing: null, steps: ['Download', 'Verify', 'Fund', 'Spend'] }) },
  ],

  uiux: [
    { key: 'onboarding', ar: 'رحلة تسجيل مستخدم جديد (Onboarding)', en: 'Onboarding flow', brands: ['Habitly', 'Mindful', 'Tasko'], icon: 'star',
      content: () => ({ flow: [{ title: 'Welcome', body: 'Build habits that stick, one day at a time.', cta: 'Get started' }, { title: 'Pick your goals', body: 'Choose up to 3 to personalise your plan.', cta: 'Continue', options: ['Sleep better', 'Read more', 'Move daily', 'Drink water'] }, { title: 'Stay on track', body: 'Gentle reminders at the times you choose.', cta: 'Allow notifications' }], principle: ['Progressive disclosure', 'One decision per screen', 'Clear primary action'] }) },
    { key: 'checkout', ar: 'إعادة تصميم تجربة الدفع (Checkout)', en: 'Checkout flow redesign', brands: ['Basket', 'Swiftcart', 'Matjar'], icon: 'cart',
      content: () => ({ flow: [{ title: 'Your cart', body: '2 items · Free delivery over 200 SAR', cta: 'Checkout' }, { title: 'Delivery', body: 'Choose a delivery slot that suits you.', cta: 'Continue to payment', options: ['Today 18–20', 'Tomorrow 10–12', 'Tomorrow 16–18'] }, { title: 'Order placed', body: 'We will message you when it ships.', cta: 'Track order' }], principle: ['Fewer form fields', 'Visible progress', 'Trust signals at payment'] }) },
    { key: 'booking', ar: 'تجربة حجز موعد', en: 'Appointment booking flow', brands: ['Slotly', 'Mawid', 'Bookwell'], icon: 'calendar',
      content: () => ({ flow: [{ title: 'Choose a service', body: 'Haircut, beard trim or full grooming.', cta: 'Next' }, { title: 'Pick a time', body: 'Thursday, 14 November', cta: 'Confirm time', options: ['10:00', '11:30', '13:00', '16:30'] }, { title: "You're booked", body: 'Added to your calendar with a reminder.', cta: 'Done' }], principle: ['Smart defaults', 'Scannable time slots', 'Instant confirmation'] }) },
    { key: 'design-system', ar: 'نظام تصميم ومكونات واجهة', en: 'Design system components', brands: ['Prism UI', 'Atom Kit', 'Nuqta DS'], icon: 'grid',
      content: () => ({ flow: [{ title: 'Buttons', body: 'Primary, secondary and ghost with clear states.', cta: 'Primary' }, { title: 'Form fields', body: 'Labels, helper text and validation.', cta: 'Submit', options: ['Default', 'Focus', 'Error', 'Disabled'] }, { title: 'Feedback', body: 'Toasts, banners and empty states.', cta: 'Undo' }], principle: ['8-point spacing grid', 'Tokenised colour', 'Accessible contrast'] }) },
    { key: 'search', ar: 'تجربة بحث وتصفية ذكية', en: 'Search & filter experience', brands: ['Findr', 'Bahth', 'Seekly'], icon: 'search',
      content: () => ({ flow: [{ title: 'Search', body: 'Recent and trending suggestions as you type.', cta: 'Search' }, { title: 'Refine results', body: '128 results · sorted by relevance', cta: 'Show 42 results', options: ['Under 200 SAR', 'Rated 4+', 'Nearby', 'Open now'] }, { title: 'Saved search', body: "We'll notify you when new matches appear.", cta: 'Got it' }], principle: ['Recognition over recall', 'Live result counts', 'Reversible filters'] }) },
  ],

  product: [
    { key: 'speaker', ar: 'سماعة ذكية منزلية', en: 'Smart home speaker', brands: ['Sona', 'Echoform', 'Sawt'], icon: 'play', shape: 'speaker',
      content: (r) => ({ specs: [['Drivers', '2 × 40mm'], ['Battery', `${r.int(12, 24)} h`], ['Weight', `${r.int(480, 820)} g`], ['Fabric', 'Recycled PET']], materials: ['Knit fabric', 'Anodised aluminium', 'Silicone base'] }) },
    { key: 'bottle', ar: 'زجاجة مياه ذكية', en: 'Smart water bottle', brands: ['Hydra', 'Maa', 'Flowcap'], icon: 'drop', shape: 'bottle',
      content: (r) => ({ specs: [['Capacity', `${r.pick([500, 600, 750])} ml`], ['Insulation', '24 h cold'], ['Sensor', 'Sip tracking'], ['Cap', 'LED reminder']], materials: ['Stainless steel', 'Powder coat', 'Bamboo cap'] }) },
    { key: 'lamp', ar: 'مصباح مكتبي قابل للطي', en: 'Folding desk lamp', brands: ['Lumo', 'Fanous', 'Arcline'], icon: 'sun', shape: 'lamp',
      content: (r) => ({ specs: [['Output', `${r.int(400, 900)} lm`], ['Colour temp', '2700–6500K'], ['Charging', 'USB-C + Qi'], ['Arm', '3-axis hinge']], materials: ['Aluminium', 'Walnut base', 'Frosted diffuser'] }) },
    { key: 'headphones', ar: 'سماعات رأس لاسلكية', en: 'Wireless headphones', brands: ['Quiet', 'Aural', 'Hums'], icon: 'play', shape: 'headphones',
      content: (r) => ({ specs: [['ANC', 'Adaptive'], ['Battery', `${r.int(30, 60)} h`], ['Weight', `${r.int(220, 290)} g`], ['Codec', 'LDAC / AAC']], materials: ['Memory foam', 'Vegan leather', 'Matte polymer'] }) },
    { key: 'watch', ar: 'ساعة ذكية رياضية', en: 'Sport smartwatch', brands: ['Stride', 'Saa', 'Tempo'], icon: 'heart', shape: 'watch',
      content: (r) => ({ specs: [['Display', '1.4" AMOLED'], ['Battery', `${r.int(7, 14)} days`], ['Water', '5 ATM'], ['Sensors', 'HR · SpO₂ · GPS']], materials: ['Titanium case', 'Sapphire glass', 'Fluoro strap'] }) },
  ],

  packaging: [
    { key: 'coffee-bag', ar: 'تغليف كيس قهوة مختصة', en: 'Specialty coffee bag', brands: ['Dune Roasters', 'Najd Beans', 'Kiln'], icon: 'cup', shape: 'pouch',
      content: (r) => ({ productName: r.pick(['Ethiopia Yirgacheffe', 'Colombia Huila', 'Yemen Haraz', 'Kenya Nyeri']), descriptor: 'Single origin · Filter roast', notes: r.shuffle(['Jasmine', 'Bergamot', 'Peach', 'Cacao', 'Honey', 'Red berry']).slice(0, 3), weight: '250 g' }) },
    { key: 'juice-can', ar: 'تصميم علبة مشروب غازي طبيعي', en: 'Sparkling drink can', brands: ['Fizzo', 'Barid', 'Pop Garden'], icon: 'drop', shape: 'can',
      content: (r) => ({ productName: r.pick(['Mango Chili', 'Lime Mint', 'Pomegranate Rose', 'Yuzu Ginger']), descriptor: 'Sparkling botanical water', notes: ['No added sugar', 'Real fruit', 'Vegan'], weight: '330 ml' }) },
    { key: 'tea-box', ar: 'تصميم علبة شاي فاخرة', en: 'Premium tea box', brands: ['Leaf & Ledger', 'Shai House', 'Steep'], icon: 'leaf', shape: 'box',
      content: (r) => ({ productName: r.pick(['Saffron Black', 'Moroccan Mint', 'Jasmine Pearl', 'Hibiscus Calm']), descriptor: 'Loose leaf · 20 pyramids', notes: ['Hand-blended', 'Compostable bags', '3 min steep'], weight: '60 g' }) },
    { key: 'cosmetic-tube', ar: 'تغليف أنبوب كريم للبشرة', en: 'Skincare tube', brands: ['Bareform', 'Aura Lab', 'Ward'], icon: 'drop', shape: 'tube',
      content: (r) => ({ productName: r.pick(['Daily Gel Cream', 'Barrier Balm', 'Sun Fluid SPF50', 'Night Repair']), descriptor: 'For all skin types', notes: ['Fragrance free', 'Dermatologist tested', 'Recyclable tube'], weight: '50 ml' }) },
    { key: 'chocolate', ar: 'تغليف لوح شوكولاتة', en: 'Chocolate bar wrapper', brands: ['Cacao Club', 'Tamr & Co', 'Nibs'], icon: 'star', shape: 'bar',
      content: (r) => ({ productName: r.pick(['Dark 72% with Dates', 'Milk & Cardamom', 'Pistachio Crunch', 'Sea Salt Caramel']), descriptor: 'Bean to bar · Small batch', notes: ['Single origin cacao', 'Natural ingredients', 'Plastic-free wrap'], weight: '80 g' }) },
  ],
};
