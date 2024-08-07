
// Helper function to parse the custom date format
const parseCustomDate = (dateString: string): Date => {
  // Normalize the date format
  const normalizedString = dateString
    .replace(/上午/g, 'AM')
    .replace(/下午/g, 'PM');

  // Convert to a standard format recognized by Date
  const formattedString = normalizedString.replace(/(\d{1,2}\/\d{1,2}\/\d{4}) (\d{1,2}:\d{2}:\d{2}) (AM|PM)/, (match, p1, p2, p3) => {
    const [month, day, year] = p1.split('/').map(Number);
    const [hour, minute, second] = p2.split(':').map(Number);
    const isPM = p3 === 'PM';
    const adjustedHour = isPM ? (hour % 12) + 12 : hour % 12;
    return `${year}-${month}-${day}T${adjustedHour}:${minute}:${second}`;
  });

  return new Date(formattedString);
};

// Custom comparator function
export const customDateComparator: (v1: string, v2: string) => number = (v1, v2) => {
  const date1 = parseCustomDate(v1);
  const date2 = parseCustomDate(v2);

  return date1.getTime() - date2.getTime(); // Sort in ascending order
};

export const toLocalISOString = (dateString: string): string => {
  try{
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() / 60;
    const localDate = new Date(date.getTime() - (offset * 60 * 60 * 1000));
  
    // Format the local date to ISO string
    const localISOString = localDate.toISOString().replace('Z', '');
  
    return localISOString;
  }catch(e){
    console.log('dateString', dateString)
    console.log(e);
    return '';
  }
};