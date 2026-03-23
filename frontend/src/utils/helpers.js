/**
 * Format a number with commas and decimal places
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as USD
 */
export function formatUSD(num) {
  if (num === null || num === undefined) return '$0.00';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '$0.00';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

/**
 * Shorten an Ethereum address
 */
export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a percentage
 */
export function formatPercent(num, decimals = 2) {
  if (num === null || num === undefined) return '0%';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  return `${n.toFixed(decimals)}%`;
}

/**
 * Format a timestamp to relative time
 */
export function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Parse a value from wei (18 decimals) to display value
 */
export function fromWei(value, decimals = 18) {
  if (!value) return 0;
  return parseFloat(value.toString()) / Math.pow(10, decimals);
}

/**
 * Parse a display value to wei (18 decimals)
 */
export function toWei(value, decimals = 18) {
  if (!value) return '0';
  return (parseFloat(value) * Math.pow(10, decimals)).toString();
}

/**
 * Calculate health factor color based on value
 */
export function getHealthColor(healthFactor) {
  if (healthFactor >= 2) return '#22c55e';   // green
  if (healthFactor >= 1.5) return '#eab308'; // yellow
  if (healthFactor >= 1.1) return '#f97316'; // orange
  return '#ef4444';                           // red
}

/**
 * Determine health status text
 */
export function getHealthStatus(healthFactor) {
  if (healthFactor >= 2) return 'Safe';
  if (healthFactor >= 1.5) return 'Moderate';
  if (healthFactor >= 1.1) return 'At Risk';
  return 'Liquidatable';
}
