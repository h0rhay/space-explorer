import { LoaderFunction, json } from "@remix-run/node";
import { isYoutubeUrl } from "../lib/isYoutube";
import { DEMO_APOD_DATA } from "../lib/demoApod";

export interface ApodData {
  title: string;
  url: string;
  date: string;
  explanation: string;
}

interface LoaderData {
  apods: ApodData[];
  error?: {
    type: 'timeout' | 'network' | 'api_error' | 'service_outage';
    message: string;
  };
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
  if (!cloudinaryBaseUrl) {
    // Fallback to original URL if Cloudinary is not configured
    return originalUrl;
  }
  return `${cloudinaryBaseUrl}/w_${width},h_${height},c_fill,f_auto,q_auto/${originalUrl}`;
};

//function to return either the optimized image url or the original url if it's a youtube url
const getImageUrl = (originalUrl: string, width: number, height: number) => {
  return isYoutubeUrl(originalUrl) ? originalUrl : optimizeImageUrl(originalUrl, width, height);
};

// Loader function to fetch multiple APOD images
export const loader: LoaderFunction = async ({ request }) => {
  const nasaApiLocation = process.env.NASA_API_LOCATION;
  const nasaApiKey = process.env.NASA_API_KEY;

  if (!nasaApiLocation || !nasaApiKey) {
    throw new Response('Missing NASA API configuration. Check server logs.', { status: 500 });
  }

  const url = new URL(request.url);
  const lastDate = url.searchParams.get('lastDate');

  const baseDate = lastDate ? new Date(lastDate) : new Date();
  if (isNaN(baseDate.getTime())) {
    return json({ apods: [] }, { status: 400 });
  }

  const dates = getLastNDates(3, baseDate);

  const fetchApod = async (date: string): Promise<{ data: ApodData | null; error?: LoaderData['error'] }> => {
    const apiUrl = `${nasaApiLocation}?api_key=${nasaApiKey}&date=${date}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout for faster SSR
      
      const res = await fetch(apiUrl, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        // Check if it's a service outage (503, 502, 500)
        if (res.status >= 500) {
          return { 
            data: null, 
            error: {
              type: 'service_outage',
              message: 'NASA API is currently experiencing a service outage. Please try again later.'
            }
          };
        }
        throw new Error(`Error fetching APOD for ${date}: ${res.status} ${res.statusText}`);
      }
      const apodData = await res.json();

      // Ensure the data is valid and meets the ApodData interface requirements
      if (!apodData.url || !apodData.title || !apodData.explanation) {
        return { data: null }; // Skip this entry if any required field is missing
      }

      return {
        data: {
          title: apodData.title,
          date: date,
          url: getImageUrl(apodData.url, 800, 600),
          explanation: apodData.explanation,
        }
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: {
            type: 'timeout',
            message: 'Request timed out. The NASA API may be experiencing high load or connectivity issues.'
          }
        };
      } else if (error instanceof Error && error.message.includes('fetch')) {
        return {
          data: null,
          error: {
            type: 'network',
            message: 'Network error. Please check your internet connection.'
          }
        };
      } else {
        return {
          data: null,
          error: {
            type: 'api_error',
            message: 'Unable to fetch data from NASA API. Please try again later.'
          }
        };
      }
    }
  };

  // Quick check: Try first request with a shorter timeout to detect service outages faster
  const firstDate = dates[0];
  const quickCheck = await fetchApod(firstDate);
  
  // If first request indicates service outage, return demo data immediately
  if (quickCheck.error?.type === 'service_outage') {
    return json<LoaderData>({ 
      apods: [{ ...DEMO_APOD_DATA, date: formatDate(new Date()) }],
      error: quickCheck.error
    });
  }

  // Otherwise, fetch remaining dates in parallel
  const remainingDates = dates.slice(1);
  const remainingResults = remainingDates.length > 0 
    ? await Promise.allSettled(remainingDates.map(fetchApod))
    : [];

  // Combine first result with remaining results
  const allResults = [
    { status: 'fulfilled' as const, value: quickCheck },
    ...remainingResults
  ].map(result => 
    result.status === 'fulfilled' ? result.value : {
      data: null,
      error: {
        type: 'api_error' as const,
        message: 'Failed to fetch data from NASA API.'
      }
    }
  );

  const validApods = allResults
    .map(r => r.data)
    .filter((apod): apod is ApodData => apod !== null);
  
  const firstError = allResults.find(r => r.error)?.error;

  // If no valid APODs, return demo data immediately
  if (validApods.length === 0) {
    return json<LoaderData>({ 
      apods: [{ ...DEMO_APOD_DATA, date: formatDate(new Date()) }],
      error: firstError || {
        type: 'api_error',
        message: 'Unable to fetch data from NASA API. Showing demo content.'
      }
    });
  }

  return json<LoaderData>({ 
    apods: validApods,
    ...(firstError && { error: firstError })
  });
};
