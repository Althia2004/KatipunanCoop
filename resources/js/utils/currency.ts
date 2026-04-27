export const formatCurrency = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(value);
};