import { getSetting } from "./fn/settings";

let currencySetting = null

function reloadCurrencySetting() {
  console.info("Currency setting loaded.");

  try {
    currencySetting = getSetting("currency") || { currency: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID' }
  } catch (error) {
    console.info(error)
  }
}
reloadCurrencySetting()

const formatNumber = (value, format = 'id-ID') => {
  if (!value) return '';
  const number = parseInt(`${value}`.replace(/[^0-9]/g, ''));
  return isNaN(number) ? '' : number.toLocaleString(format);
};

const unformatCurrency = (formatted, options) => {
  if (typeof formatted !== 'string') return 0;
  options ? null : options = currencySetting

  const example = new Intl.NumberFormat(options.locale || 'id-ID', {
    style: 'currency',
    currency: options.currency || "IDR",
    minimumFractionDigits: 2,
  }).format(1234567.89);

  const currencySymbol = example.replace(/[\d\s.,]/g, '');

  const parts = example.match(/(\d{1,3})([^0-9])(\d{3})[^0-9]+(\d{2})$/);
  const groupSeparator = parts ? parts[2] : '.';
  const decimalSeparator = parts ? example.match(/(\d+)([^0-9])(\d{2})$/)?.[2] : ',';

  const cleaned = formatted
    .replace(currencySymbol, '')
    .replace(/\s/g, '')
    .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
    .replace(decimalSeparator, '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (amount, options) => {
  if (typeof amount !== 'number') {
    amount = Number(amount);
  }
  options ? null : options = currencySetting

  if (isNaN(amount)) return '';

  return new Intl.NumberFormat(options.locale || 'id-ID', {
    style: 'currency',
    currency: options.currency || "IDR",
    minimumFractionDigits: options.minimumFractionDigits || 0,
    maximumFractionDigits: options.maximumFractionDigits || 0,
  }).format(amount);
};


export { formatCurrency, formatNumber, reloadCurrencySetting, unformatCurrency };

