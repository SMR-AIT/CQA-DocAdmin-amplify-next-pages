export function normalize_filename(inputString: string): string {
    /**
     * This function is used to adjust the file name suitable for telegram bot markup language.
     */
    const conversionDict: { [key: string]: string } = {
        '(': '（',
        ')': '）',
        '[': '［',
        ']': '］'
    };

    let convertedString = inputString
        .split('')
        .map(char => conversionDict[char] || char)
        .join('');

    convertedString = convertedString.replace(/_/g, '-');
    return convertedString;
}

// Example usage
// const fileName = "example_file_name_(1).txt";
// const normalizedFileName = normalize(fileName);
// console.log(normalizedFileName); // Outputs: "example-file-name-（1）.txt"
