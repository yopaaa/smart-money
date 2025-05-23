const formatNumber = (value, format = 'id-ID') => {
    if (!value) return '';
    const number = parseInt(`${value}`.replace(/[^0-9]/g, ''));
    return isNaN(number) ? '' : number.toLocaleString(format);
};

const unformatNumber = (formattedValue) => {
    return formattedValue.replace(/[^0-9]/g, '');
};

export { formatNumber, unformatNumber };
