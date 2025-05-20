export function parseTransaction(input) {
  const categories = {
    'makan': 'Makanan',
    'dinner': 'Makanan',
    'lunch': 'Makanan',
    'gaji': 'Pendapatan',
    'belanja': 'Belanja',
    'bayar': 'Pembayaran',
    'transport': 'Transportasi'
  };

  const lower = input.toLowerCase();
  const amount = parseInt(lower.match(/\d+/)?.[0] || 0);
  const categoryKey = Object.keys(categories).find(key => lower.includes(key));
  const category = categories[categoryKey] || 'Lainnya';

  return {
    category,
    amount,
    raw: input,
    timestamp: Date.now()
  };
}

