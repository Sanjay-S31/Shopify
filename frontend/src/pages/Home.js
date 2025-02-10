import { useState } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";

import "./style_pages/home.css";
import carousel_img1 from "../assets/carousel_img1.jpeg";
import carousel_img2 from "../assets/carousel_img2.png";
import carousel_img3 from "../assets/carousel_img3.jpeg";
import carousel_img4 from "../assets/carousel_img4.jpeg";

export default function Home() {
  const [slide, setSlide] = useState(0);

  const nextSlide = () => {
    setSlide((slide + 1) % 4);
  };

  const prevSlide = () => {
    setSlide((slide - 1 + 4) % 4);
  };

  const navigateToChatBot = () => {
    console.log("Clicked");
    window.location.href =
      "https://b8cd-2409-40f4-1c-f5-f18d-71c0-fa3f-5aad.ngrok-free.app/";
  };

  return (
    <div className="homepage">
      {/* <h1>Welcome to CraftsConnect</h1> */}
      <img
        className="slides"
        src="https://www.macworld.com/wp-content/uploads/2024/10/iphone-16-vs-16-pro-5.jpg?quality=50&strip=all"
        width={600}
        height={400}
        alt="img1"
      />

      <div className="homepage-description">
        <h1>Welcome to SHOPIFY</h1>

        <i>"Thoughts ideate into actions"</i>
        {/* <button className="chatbot-button" onClick={navigateToChatBot}>
          Chat
        </button> */}
      </div>
    </div>
  );
}
