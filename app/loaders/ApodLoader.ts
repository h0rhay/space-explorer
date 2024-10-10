import { LoaderFunction, json } from "@remix-run/node";

interface ApodData {
  title: string;
  url: string;
  date: string;
  explanation: string;
}

interface LoaderData {
  apods: ApodData[];
}

// Helper function to format dates as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to get an array of last N formatted dates (e.g., last 3 days)
const getLastNDates = (n: number): string[] => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
};

// Cloudinary base URL (using your cloud name "jeff-jefferson")
const cloudinaryBaseUrl = 'https://res.cloudinary.com/jeff-jefferson/image/fetch';

// Function to optimize the image URL using Cloudinary with width and height
const optimizeImageUrl = (originalUrl: string, width: number, height: number) => {
  return `${cloudinaryBaseUrl}/w_${width},h_${height},c_fill,f_auto,q_auto/${originalUrl}`;
};

// Loader function to fetch multiple APOD images
export const loader: LoaderFunction = async () => {
  const dates = getLastNDates(3);

  const fetchApod = async (date: string): Promise<ApodData | null> => {
    const url = `https://api.nasa.gov/planetary/apod?api_key=CqOPeA8mBVaYGNvzEf7vaWwW0jKi72eqJN1Bi0mA&date=${date}`;
  
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error fetching APOD for ${date}`);
      }
      const apodData = await res.json();
      // Make sure apodData has the required fields to satisfy the ApodData interface
      if (!apodData.url || !apodData.title || !apodData.explanation) {
        return null; // Return null if any required field is missing
      }
  
      return {
        title: apodData.title,
        date: date,
        url: optimizeImageUrl(apodData.url, 800, 600), // Pass desired width/height for the image
        explanation: apodData.explanation,
      };
    } catch (error) {
      console.error(`Error fetching APOD for ${date}:`, error);
      return null;
    }
  };
  

  const apods = await Promise.all(dates.map(fetchApod));
  const validApods = apods.filter((apod): apod is ApodData => apod !== null);

  return json<LoaderData>({ apods: validApods });
};
