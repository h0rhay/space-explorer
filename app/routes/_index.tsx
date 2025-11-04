import { useLoaderData } from "@remix-run/react";
import { loader } from "./apod-loader";
import type { ApodData } from "./apod-loader";
import Starfield from "../components/Starfield";
import ApodTile from "../components/ApodTile";
import SpaceFontHeading from "../components/SpaceFontHeading";

interface LoaderData {
  apods: ApodData[];
  error?: {
    type: 'timeout' | 'network' | 'api_error' | 'service_outage';
    message: string;
  };
}

export { loader }; // Export the loader for SSR

export default function Index() {
  const { apods, error } = useLoaderData<LoaderData>(); // Fetch the data from the loader

  return (
    <div className="wrapper">
      <Starfield starsCount={450} />
      <div className="content">
        <SpaceFontHeading>Space Explorers</SpaceFontHeading>
        <ApodTile apods={apods} error={error} /> {/* Render the ApodTile component which handles APODs */}
      </div>
    </div>
  );
}
