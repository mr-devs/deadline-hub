// Function to fetch data given a file path
export async function fetchData(jsonFilePath) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    } catch (error) {
        throw error;
    }
}