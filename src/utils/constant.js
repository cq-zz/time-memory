/**
 * Timemory shared constants & enums.
 * Single home for every enumeration in the app — moods, currencies,
 * categories, year bounds, icon options. Import from here, never inline.
 */

// ══════════════════════════════════════════════════
// Mood / Check-in
// ══════════════════════════════════════════════════

/**
 * Check-in moods. `key` is the persisted value, `score` (1-5) powers
 * trend analysis. Ordered best → worst for the horizontal picker.
 */
export const MOODS = [
  { emoji: '🥰', key: 'loved', label: 'Loved', score: 5 },
  { emoji: '🤩', key: 'excited', label: 'Excited', score: 5 },
  { emoji: '😆', key: 'joyful', label: 'Joyful', score: 5 },
  { emoji: '🤗', key: 'grateful', label: 'Grateful', score: 5 },
  { emoji: '🤯', key: 'amazed', label: 'Amazed', score: 5 },
  { emoji: '😊', key: 'happy', label: 'Happy', score: 5 },
  { emoji: '😇', key: 'peaceful', label: 'Peaceful', score: 4 },
  { emoji: '😌', key: 'relaxed', label: 'Relaxed', score: 4 },
  { emoji: '😏', key: 'amused', label: 'Amused', score: 4 },
  { emoji: '😎', key: 'proud', label: 'Proud', score: 4 },
  { emoji: '🥺', key: 'hopeful', label: 'Hopeful', score: 4 },
  { emoji: '🤔', key: 'thoughtful', label: 'Thoughtful', score: 3 },
  { emoji: '😐', key: 'neutral', label: 'Neutral', score: 3 },
  { emoji: '😴', key: 'sleepy', label: 'Sleepy', score: 2 },
  { emoji: '😰', key: 'anxious', label: 'Anxious', score: 2 },
  { emoji: '😞', key: 'disappointed', label: 'Let down', score: 2 },
  { emoji: '😣', key: 'stressed', label: 'Stressed', score: 1 },
  { emoji: '😢', key: 'sad', label: 'Sad', score: 1 },
  { emoji: '😤', key: 'angry', label: 'Angry', score: 1 },
  { emoji: '😫', key: 'exhausted', label: 'Exhausted', score: 1 },
];

export const moodMeta = (key) => MOODS.find((m) => m.key === key) || null;

/** Calendar display enums (mood records month grid). */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ══════════════════════════════════════════════════
// Currency
// ══════════════════════════════════════════════════

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'CNY', symbol: '¥', label: 'CNY (¥)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'JPY', symbol: 'JP¥', label: 'JPY (JP¥)' },
  { code: 'KRW', symbol: '₩', label: 'KRW (₩)' },
  { code: 'HKD', symbol: 'HK$', label: 'HKD (HK$)' },
  { code: 'TWD', symbol: 'NT$', label: 'TWD (NT$)' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'NZD', symbol: 'NZ$', label: 'NZD (NZ$)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF (CHF)' },
  { code: 'RUB', symbol: '₽', label: 'RUB (₽)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'THB', symbol: '฿', label: 'THB (฿)' },
  { code: 'MYR', symbol: 'RM', label: 'MYR (RM)' },
  { code: 'VND', symbol: '₫', label: 'VND (₫)' },
  { code: 'PHP', symbol: '₱', label: 'PHP (₱)' },
  { code: 'IDR', symbol: 'Rp', label: 'IDR (Rp)' },
  { code: 'BRL', symbol: 'R$', label: 'BRL (R$)' },
];

export const DEFAULT_CURRENCY = 'USD';

// ══════════════════════════════════════════════════
// Year range bounds
// ══════════════════════════════════════════════════

export const YEAR_MIN = 1000;
export const YEAR_MAX = 9999;
export const MIN_YEAR_DEFAULT = 1990;
export const MAX_YEAR_DEFAULT = new Date().getFullYear() + 10;

// ══════════════════════════════════════════════════
// Categories (item / bill / asset)
// ══════════════════════════════════════════════════

/** Built-in item (durable) categories. `icon` is an Ionicons name. */
export const ITEM_CATEGORIES = [
  { key: 'electronics', label: 'Electronics', icon: 'laptop-outline' },
  { key: 'appliance', label: 'Appliance', icon: 'thermometer-outline' },
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'furniture', label: 'Furniture', icon: 'bed-outline' },
  { key: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
  { key: 'clothing', label: 'Clothing', icon: 'shirt-outline' },
  { key: 'beauty', label: 'Beauty', icon: 'diamond-outline' },
  { key: 'medical', label: 'Medical', icon: 'medkit-outline' },
  { key: 'books', label: 'Books', icon: 'book-outline' },
  { key: 'sports', label: 'Sports', icon: 'barbell-outline' },
  { key: 'daily', label: 'Daily', icon: 'cube-outline' },
  { key: 'food', label: 'Food', icon: 'cafe-outline' },
  { key: 'toys', label: 'Toys', icon: 'game-controller-outline' },
  { key: 'tools', label: 'Tools', icon: 'construct-outline' },
  { key: 'pet', label: 'Pet', icon: 'paw-outline' },
  { key: 'baby', label: 'Baby', icon: 'happy-outline' },
  { key: 'music', label: 'Music', icon: 'musical-notes-outline' },
  { key: 'office', label: 'Office', icon: 'briefcase-outline' },
  { key: 'other', label: 'Other', icon: 'pricetag-outline' },
];

/** Built-in bill categories. */
export const BILL_CATEGORIES = [
  { key: 'food', label: 'Food & Drink', icon: 'restaurant-outline' },
  { key: 'transport', label: 'Transport', icon: 'bus-outline' },
  { key: 'housing', label: 'Housing', icon: 'business-outline' },
  { key: 'telecom', label: 'Telecom', icon: 'wifi-outline' },
  { key: 'entertainment', label: 'Entertainment', icon: 'game-controller-outline' },
  { key: 'gifts', label: 'Gifts', icon: 'gift-outline' },
  { key: 'medical', label: 'Medical', icon: 'pulse-outline' },
  { key: 'subscriptions', label: 'Subscriptions', icon: 'calendar-outline' },
  { key: 'other', label: 'Other', icon: 'pricetag-outline' },
];

/** Built-in asset categories. */
export const ASSET_CATEGORIES = [
  { key: 'house', label: 'House', icon: 'home-outline' },
  { key: 'vehicle', label: 'Vehicle', icon: 'car-outline' },
  { key: 'gold', label: 'Gold', icon: 'cash-outline' },
  { key: 'jewelry', label: 'Jewelry', icon: 'diamond-outline' },
  { key: 'investment', label: 'Investment', icon: 'trending-up-outline' },
  { key: 'collection', label: 'Collection', icon: 'star-outline' },
  { key: 'other', label: 'Other', icon: 'pricetag-outline' },
];

/** Category type → built-in list. */
export const CATEGORY_BUILTINS = {
  item: ITEM_CATEGORIES,
  bill: BILL_CATEGORIES,
  asset: ASSET_CATEGORIES,
};

export const CATEGORY_TYPE_LABELS = {
  item: 'Item Categories',
  bill: 'Bill Categories',
  asset: 'Asset Categories',
};

/** Ionicons options offered by the custom-category icon picker. */
export const ICON_SELECTOR_OPTIONS = [
  'pricetag-outline', 'star-outline', 'heart-outline', 'flash-outline',
  'leaf-outline', 'moon-outline', 'sunny-outline', 'cloudy-outline',
  'umbrella-outline', 'airplane-outline', 'boat-outline', 'bicycle-outline',
  'bus-outline', 'car-outline', 'train-outline', 'home-outline',
  'business-outline', 'school-outline', 'library-outline', 'book-outline',
  'cafe-outline', 'restaurant-outline', 'nutrition-outline', 'wine-outline',
  'pizza-outline', 'ice-cream-outline', 'football-outline', 'basketball-outline',
  'tennisball-outline', 'baseball-outline', 'golf-outline', 'musical-notes-outline',
  'headset-outline', 'game-controller-outline', 'dice-outline', 'paw-outline',
  'flower-outline', 'ribbon-outline', 'trophy-outline', 'medal-outline',
  'diamond-outline', 'cash-outline', 'card-outline', 'wallet-outline',
  'briefcase-outline', 'construct-outline', 'hammer-outline', 'key-outline',
  'lock-closed-outline', 'globe-outline', 'earth-outline', 'flag-outline',
  'bulb-outline', 'rocket-outline', 'shirt-outline', 'watch-outline',
  'gift-outline', 'camera-outline', 'color-palette-outline', 'fitness-outline',
];

// ══════════════════════════════════════════════════
// Durables / Assets
// ══════════════════════════════════════════════════

export const ACQUISITION_METHODS = [
  { key: 'purchase', label: 'Purchase' },
  { key: 'gift', label: 'Gift' },
  { key: 'reward', label: 'Reward' },
  { key: 'inherit', label: 'Inherit' },
  { key: 'homemade', label: 'Homemade' },
  { key: 'other', label: 'Other' },
];

export const DURABLE_STATUS_OPTIONS = [
  { key: 'in_use', label: 'In Use' },
  { key: 'disposed', label: 'Disposed' },
];

export const ASSET_STATUS_OPTIONS = [
  { key: 'active', label: 'Active' },
  { key: 'disposed', label: 'Disposed' },
];

// ══════════════════════════════════════════════════
// Bills
// ══════════════════════════════════════════════════

export const BILL_TYPE_OPTIONS = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
];

// ══════════════════════════════════════════════════
// Schedules
// ══════════════════════════════════════════════════

export const SCHEDULE_PRIORITIES = [
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

export const SCHEDULE_STATUS_OPTIONS = [
  { key: 'not_started', label: 'Not Started' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'incomplete', label: 'Incomplete' },
];

// ══════════════════════════════════════════════════
// Diary
// ══════════════════════════════════════════════════

export const WEATHER_OPTIONS = [
  { key: 'sunny', label: 'Sunny', emoji: '☀️' },
  { key: 'clearNight', label: 'Clear Night', emoji: '🌙' },
  { key: 'partlyCloudy', label: 'Partly Cloudy', emoji: '⛅' },
  { key: 'cloudy', label: 'Cloudy', emoji: '☁️' },
  { key: 'overcast', label: 'Overcast', emoji: '☁️' },
  { key: 'drizzle', label: 'Drizzle', emoji: '🌦️' },
  { key: 'rainy', label: 'Rainy', emoji: '🌧️' },
  { key: 'thunderstorm', label: 'Thunderstorm', emoji: '⛈️' },
  { key: 'snowy', label: 'Snowy', emoji: '❄️' },
  { key: 'sleet', label: 'Sleet', emoji: '🌨️' },
  { key: 'hail', label: 'Hail', emoji: '🌨️' },
  { key: 'foggy', label: 'Foggy', emoji: '🌫️' },
  { key: 'hazy', label: 'Hazy', emoji: '🌁' },
  { key: 'windy', label: 'Windy', emoji: '💨' },
  { key: 'tornado', label: 'Tornado', emoji: '🌪️' },
  { key: 'rainbow', label: 'Rainbow', emoji: '🌈' },
];

// ══════════════════════════════════════════════════
// Important dates
// ══════════════════════════════════════════════════

export const IMPORTANT_DATE_TYPES = [
  { key: 'birthday', label: 'Birthday' },
  { key: 'anniversary', label: 'Anniversary' },
  { key: 'remembrance', label: 'Remembrance' },
  { key: 'other', label: 'Other' },
];

/** reminder_type field: whether the date recurs every year or fires once. */
export const REMINDER_TYPES = [
  { key: 'annual', label: 'Annual' },
  { key: 'once', label: 'One-time' },
];
