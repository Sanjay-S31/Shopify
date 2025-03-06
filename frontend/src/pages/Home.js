import "./style_pages/home.css";

export default function Home() {
  
  return (
    <div className="homepage">
    
      <img
        className="slides"
        src="https://www.macworld.com/wp-content/uploads/2024/10/iphone-16-vs-16-pro-5.jpg?quality=50&strip=all"
        width={600}
        height={400}
        alt="img1"
      />

      <div className="homepage-description">
        <h1>Welcome to SHOPIFY</h1>
        <i>"Shop like crazy !!"</i>
      </div>
    </div>
  );
}
