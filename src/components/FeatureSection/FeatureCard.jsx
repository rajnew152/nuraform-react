import VideoWrapper from '../VideoWrapper/VideoWrapper';

/** A single slide: either a hover-played clip or a static screenshot, plus caption. */
export default function FeatureCard({ video, poster, image, alt, title }) {
  return (
    <div className="--feature">
      <div className="--media">
        {video ? (
          <VideoWrapper src={video} poster={poster} modest />
        ) : (
          <img src={image} alt={alt} />
        )}
      </div>
      <h3>{title}</h3>
    </div>
  );
}
