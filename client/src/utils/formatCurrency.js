export function formatCurrency(
  value,
  { currency = 'INR', minimumFractionDigits = 2 } = {}
) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return String(value)
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits: minimumFractionDigits,
    }).format(amount)
  } catch {
    return `₹${amount.toFixed(minimumFractionDigits)}`
  }
}

