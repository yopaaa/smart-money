const formatNumber = (value, format = 'id-ID') => {
    if (!value) return '';
    const number = parseInt(`${value}`.replace(/[^0-9]/g, ''));
    return isNaN(number) ? '' : number.toLocaleString(format);
};

const unformatCurrency = (formatted, locale = 'id-ID', currency = 'IDR') => {
  if (typeof formatted !== 'string') return 0;

  const example = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
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



const formatCurrency = (
    amount,
    {
        locale = 'id-ID',
        currency = 'IDR',
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
    } = {}
) => {
    if (typeof amount !== 'number') {
        amount = Number(amount);
    }

    if (isNaN(amount)) return '';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
};


export { formatCurrency, formatNumber, unformatCurrency };

