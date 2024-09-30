import { useLoaderData } from "@remix-run/react";
import { loader } from "../loaders/ApodLoader"; // Import the loader from apodLoader
import Starfield from "../components/Starfield";
import ApodTile from "../components/ApodTile"; // ApodTile handles image and description rendering

// Define the loader return type for APOD data
interface ApodData {
  title: string;
  url: string;
  explanation: string;
}

interface LoaderData {
  apods: ApodData[];
}

export { loader }; // Export the loader for SSR

export default function Index() {
  const { apods } = useLoaderData<LoaderData>(); // Fetch the data from the loader

  return (
    <div className="wrapper">
      <Starfield starsCount={450} />
      <div className="content">
        <h1 className="text-4xl font-dosis font-bold mb-6 text-white">APOD Timeline</h1>
        <ApodTile apods={apods} /> {/* Render the ApodTile component which handles APODs */}
      </div>
    </div>
  );
}
