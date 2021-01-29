
export function toEpochTimestamp(dateString:string, delimiter = "-") : number {
    
    // Date provided as YYYY-MM-DD
    const splitDate = dateString.split(delimiter);  

    // Minus 1 because getMonth() method returns the month (from 0 to 11)
    const epochDate = new Date(parseInt(splitDate[0], 10), parseInt(splitDate[1], 10) - 1 , parseInt(splitDate[2]), 10).getTime();
    return epochDate;
}