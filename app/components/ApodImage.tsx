import React from "react";

interface ApodImageProps {
  title: string;
  url: string;
}

const ApodImage: React.FC<ApodImageProps> = ({ title, url }) => {
  return (
    <div className="apod-image grid grid-cols-1">
      <div className=" foo w-full h-full animate-pulse rounded-lg cursor-pointer aspect-[4/3] col-start-1 row-start-1">
        <div className="w-full h-full bg-gray-900"></div>
      </div>
      <img src={url} alt={title} className=" bar w-full rounded-lg cursor-pointer block col-start-1 row-start-1 z-10" />
    </div>
  );
};

export default ApodImage;
