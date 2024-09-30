import React from "react";

interface ApodImageProps {
  title: string;
  url: string;
}

const ApodImage: React.FC<ApodImageProps> = ({ title, url }) => {
  return (
    <div className="apod-image">
      <img src={url} alt={title} className="w-full rounded-lg mb-4 cursor-pointer" />
    </div>
  );
};

export default ApodImage;
