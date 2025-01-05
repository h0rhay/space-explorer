import { LoaderFunction, json } from "@remix-run/node";
import { isYoutubeUrl } from "~/lib/isYoutube";

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
const getLastNDates = (n: number, baseDate = new Date()): string[] => {
  const dates = [];
  for (let i = 0; i < n; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
};

// Cloudinary base URL (using your cloud name "jeff-jefferson")
const cloudinaryBaseUrl = process.env.CLOUDINARY_API_LOCATION;

// Function to optimize the image URL using Cloudinary with width and height only if it's not a youtube url

const optimizeImageUrl = (originalUrl: string, width: number, height: number) => {
  return `${cloudinaryBaseUrl}/w_${width},h_${height},c_fill,f_auto,q_auto/${originalUrl}`;
};

//function to return either the optimized image url or the original url if it's a youtube url
const getImageUrl = (originalUrl: string, width: number, height: number) => {
  return isYoutubeUrl(originalUrl) ? originalUrl : optimizeImageUrl(originalUrl, width, height);
};

// Loader function to fetch multiple APOD images
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const lastDate = url.searchParams.get('lastDate');

  // Fallback to today's date if lastDate is missing or invalid
  const baseDate = lastDate ? new Date(lastDate) : new Date();
  if (isNaN(baseDate.getTime())) {
    console.error(`Invalid date received: ${lastDate}`);
    return json({ apods: [] }, { status: 400 }); // Return empty list if the date is invalid
  }

  const dates = getLastNDates(3, baseDate); // Fetch 3 previous dates from the base date

  const fetchApod = async (date: string): Promise<ApodData | null> => {
    const apiUrl = `${process.env.NASA_API_LOCATION}?api_key=${process.env.NASA_API_KEY}&date=${date}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`Error fetching APOD for ${date}`);
      }
      const apodData = await res.json();

      // Ensure the data is valid and meets the ApodData interface requirements
      if (!apodData.url || !apodData.title || !apodData.explanation) {
        return null; // Skip this entry if any required field is missing
      }

      return {
        title: apodData.title,
        date: date,
        url: getImageUrl(apodData.url, 800, 600),
        explanation: apodData.explanation,
      };
    } catch (error) {
      console.error(`Error fetching APOD for ${date}:`, error);
      return null;
    }
  };

  // Fetch APODs for each date
  const apods = await Promise.all(dates.map(fetchApod));
  const validApods = apods.filter((apod): apod is ApodData => apod !== null);

  return json<LoaderData>({ apods: validApods });
};
