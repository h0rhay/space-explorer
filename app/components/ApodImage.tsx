import React from "react";
import { isYoutubeUrl } from "../lib/isYoutube";

interface ApodImageProps {
  title: string;
  url: string;
}

const ApodImage: React.FC<ApodImageProps> = ({ title, url }) => {
  return (
    <div className="apod-image grid grid-cols-1">
      <div className="w-full h-full animate-pulse rounded-lg cursor-pointer aspect-[4/3] col-start-1 row-start-1">
        <div className="w-full h-full bg-gray-900"></div>
      </div>
      {isYoutubeUrl(url) ? (
        <div className="video-embed w-full h-full pt-[56.25%] relative col-start-1 row-start-1 z-10">
          <iframe 
            src={url} 
            title={title} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <img src={url} alt={title} className="bar w-full rounded-lg cursor-pointer block col-start-1 row-start-1 z-10" />
      )}
    </div>
  );
};

export default ApodImage;
